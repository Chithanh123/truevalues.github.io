import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('../data/question-catalog.json', import.meta.url), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

test('website catalog is generated from the exact database and authored sources', async () => {
  const { database, sources } = catalog.provenance;
  const entries = [[database.path, database.sha256], ...Object.entries(sources)];
  assert.ok(entries.length > 1);
  for (const [path, expected] of entries) {
    assert.ok(!path.startsWith('/') && !path.split('/').includes('..'), `Unsafe source path: ${path}`);
    assert.equal(hash(await readFile(new URL(path, root))), expected, `Web catalog source changed: ${path}; rebuild the catalog and web export`);
  }
});

test('website catalog preserves all authored items and package membership without country reveals or scores', () => {
  assert.deepEqual(catalog.counts, { items: 151, packages: 12, outcomes: 55 });
  assert.equal(catalog.items.length, catalog.counts.items);
  assert.equal(catalog.packages.length, catalog.counts.packages);
  const ids = new Set(catalog.items.map(item => item.id));
  assert.equal(ids.size, catalog.items.length);
  const assigned = new Set(catalog.packages.flatMap(pkg => pkg.items));
  assert.deepEqual(assigned, ids);
  for (const item of catalog.items) {
    assert.ok(item.texts.en.text, `${item.id} has no English text`);
    assert.ok(Array.isArray(item.options) && Array.isArray(item.outcomes) && Array.isArray(item.readings));
    for (const option of item.options) assert.ok(!('score' in option) && !('current_authored_score' in option));
    assert.ok(!('direction' in item) && !('scoring_mode' in item));
  }
  const serialized = JSON.stringify(catalog);
  assert.doesNotMatch(serialized, /A fictional setting inspired by|Bối cảnh hư cấu lấy cảm hứng từ/);
  assert.ok(!('worlds' in catalog) && !('world_reveals' in catalog));
  assert.equal(catalog.items.find(item => item.id === 'CR-S18').options.length, 3);
  assert.equal(catalog.packages.find(pkg => pkg.id === 'FUTURE-24').items.length, 0);
});

test('website text, options, outcome links and packages match the author database', async () => {
  const { DatabaseSync } = await import('node:sqlite');
  const { fileURLToPath } = await import('node:url');
  const db = new DatabaseSync(fileURLToPath(new URL(catalog.provenance.database.path, root)), { readOnly: true });
  try {
    const texts = db.prepare('SELECT language,text,format FROM item_texts WHERE item_id=? ORDER BY language');
    const options = db.prepare('SELECT option_id FROM options WHERE item_id=? ORDER BY display_order');
    const optionTexts = db.prepare('SELECT language,label,description,tradeoff FROM option_texts WHERE item_id=? AND option_id=? ORDER BY language');
    const outcomes = db.prepare('SELECT outcome_id,relationship FROM item_outcomes WHERE item_id=? ORDER BY outcome_id');
    const members = db.prepare('SELECT item_id FROM package_items WHERE package_id=? ORDER BY presentation_order IS NULL,presentation_order,item_id');
    for (const item of catalog.items) {
      const expectedTexts = Object.fromEntries(texts.all(item.id).map(row => [row.language, { text: row.text, format: row.format }]));
      assert.deepEqual(item.texts, expectedTexts, `Text mismatch: ${item.id}`);
      const expectedOptions = options.all(item.id).map(({option_id}) => ({
        id: option_id,
        texts: Object.fromEntries(optionTexts.all(item.id, option_id).map(row => [row.language, {
          label: row.label, description: row.description, tradeoff: row.tradeoff,
        }])),
      }));
      assert.deepEqual(item.options, expectedOptions, `Options mismatch: ${item.id}`);
      assert.deepEqual(item.outcomes.map(o => [o.id,o.relationship]), outcomes.all(item.id).map(o => [o.outcome_id,o.relationship]), `Outcome links mismatch: ${item.id}`);
    }
    for (const pkg of catalog.packages) assert.deepEqual(pkg.items, members.all(pkg.id).map(row => row.item_id), `Package mismatch: ${pkg.id}`);
  } finally { db.close(); }
});

test('playable scenarios preserve authored briefings, reasons and optional preference prompts', async () => {
  const paths = Object.keys(catalog.provenance.sources).filter(path =>
    path.startsWith('research/quiz-database/expansion/') && path.endsWith('.json') && !path.endsWith('/sources.json'));
  const scenarios = (await Promise.all(paths.map(async path => JSON.parse(await readFile(new URL(path, root), 'utf8')))))
    .flatMap(document => document.scenarios || []);
  assert.deepEqual(scenarios.map(scene => scene.id).sort(), Array.from({length: 12}, (_, i) => `CR-S${String(i + 7).padStart(2, '0')}`));
  for (const source of scenarios) {
    const item = catalog.items.find(entry => entry.id === source.id);
    assert.ok(item, `Missing scenario ${source.id}`);
    assert.equal(item.bank, 'candidate');
    assert.equal(item.status, 'author_draft');
    assert.deepEqual(item.briefings, source.briefing, `${source.id} briefing`);
    assert.deepEqual(item.reasons, source.reasons, `${source.id} reasons`);
    assert.deepEqual(item.personalPreferencePrompt, source.personal_preference_prompt, `${source.id} preference`);
    for (const language of ['en', 'vi']) {
      assert.ok(item.briefings[language]);
      assert.ok(item.personalPreferencePrompt[language]);
      assert.equal(item.reasons.en.length, item.reasons.vi.length);
      assert.ok(item.reasons[language].length > 0);
    }
  }
  // The older comprehension-only probe is not part of the new route.
  assert.equal(catalog.items.find(item => item.id === 'CR-S03').briefings, undefined);
});
