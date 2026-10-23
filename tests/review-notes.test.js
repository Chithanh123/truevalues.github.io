import test from 'node:test';
import assert from 'node:assert/strict';
import { instrument } from '../js/content.js';
import { viItems } from '../js/translations/vi-items.js';
import { viWorlds } from '../js/translations/vi-worlds.js';
import { viFoundations } from '../js/translations/vi-foundations.js';
import {
  REVIEW_STORAGE_KEY, MAX_REVIEW_BYTES, CSV_COLUMNS, createReviewNotes,
  buildReviewTargets, validateReviewNotes, upsertReviewEntry,
  removeReviewEntry, reviewNotesCsv,
} from '../js/review-notes.js';

const translations = { items: viItems, worlds: viWorlds, foundations: viFoundations };
const targets = buildReviewTargets(instrument, translations);
const findTarget = key => targets.find(target => target.key === key);
const makeEntry = (overrides = {}) => ({
  id: 'review-1', targetKey: targets[0].key, sourceFingerprint: targets[0].fingerprint,
  language: 'both', field: 'overall', criterion: 'clarity', severity: 'minor', outcome: 'revise',
  observation: 'The time constraint could be clearer.', proposedChange: 'Specify when the decision takes effect.',
  resolution: '', sourceNote: '', createdAt: '2026-10-22T10:00:00.000Z', updatedAt: '2026-10-22T10:00:00.000Z',
  ...overrides,
});
const withEntries = (...entries) => ({ ...createReviewNotes(instrument), entries });
const validation = notes => validateReviewNotes(instrument, targets, notes);

test('review targets cover all authored items and each setting-specific scenario', () => {
  assert.equal(REVIEW_STORAGE_KEY, 'political-context-review-notes');
  assert.notEqual(REVIEW_STORAGE_KEY, 'political-context-session');
  assert.equal(targets.length, 133);
  assert.equal(new Set(targets.map(target => target.key)).size, targets.length);
  assert.deepEqual(Object.fromEntries(['statement', 'foundation', 'lens', 'world', 'scenario'].map(kind => [kind, targets.filter(target => target.kind === kind).length])), {
    statement: 24, foundation: 16, lens: 13, world: 8, scenario: 72,
  });
  for (const target of targets) {
    assert.match(target.fingerprint, /^rv1-[0-9a-f]{8}$/);
    assert.ok(target.label.trim());
    if (target.kind === 'scenario') {
      assert.equal(target.key, `scenario:${target.itemId}:${target.worldId}`);
      assert.equal(target.roleId, instrument.scenarios.find(scene => scene.id === target.itemId).role);
    } else {
      assert.equal(target.worldId, null);
      assert.equal(target.roleId, null);
    }
  }
  assert.notEqual(findTarget('scenario:public-assembly:linden').fingerprint, findTarget('scenario:public-assembly:alder').fingerprint);
  assert.deepEqual(buildReviewTargets(instrument, translations), targets);
});

test('fingerprints track relevant wording, translation, and context without invalidating unrelated notes', () => {
  const changed = structuredClone(instrument);
  changed.worlds[0].scenarioNotes['public-assembly'] += ' Updated context.';
  const updatedTargets = buildReviewTargets(changed, translations);
  const changedKeys = updatedTargets.filter(target => target.fingerprint !== findTarget(target.key).fingerprint).map(target => target.key);
  assert.deepEqual(changedKeys.sort(), ['scenario:public-assembly:linden', 'world:linden']);

  const translated = structuredClone(translations);
  translated.items.statements[instrument.statements[0].id].text += ' Nội dung mới.';
  const translatedTargets = buildReviewTargets(instrument, translated);
  assert.deepEqual(translatedTargets.filter(target => target.fingerprint !== findTarget(target.key).fingerprint).map(target => target.key), [targets[0].key]);

  const reordered = { ...instrument, statements: instrument.statements.map(item => Object.fromEntries(Object.entries(item).reverse())) };
  assert.deepEqual(buildReviewTargets(reordered, translations), targets);
});

test('optional evidence changes stale the linked premise but do not alter the participant instrument', () => {
  const original = structuredClone(instrument);
  const itemId = instrument.foundations.items[0].id;
  const evidence = { items: [{ itemId, links: [{ sourceId: 'source-1', relation: 'debate', locator: 'Section A', note: 'Review the distinction.' }], openQuestion: 'Does this capture agency?' }], sources: [{ id: 'source-1', title: 'Candidate source', authors: ['Example'], url: 'https://example.test/source', locator: 'Section A', accessed: '', verification: 'proposed', note: '' }] };
  const withEvidence = buildReviewTargets(instrument, translations, evidence);
  const editedEvidence = structuredClone(evidence);
  editedEvidence.sources[0].url = 'https://example.test/revised-source';
  const revised = buildReviewTargets(instrument, translations, editedEvidence);
  assert.deepEqual(revised.filter(target => target.fingerprint !== withEvidence.find(row => row.key === target.key).fingerprint).map(target => target.key), [`foundation:${itemId}`]);
  assert.deepEqual(instrument, original);
});

test('notes serialize and validate independently of participant answers or a claimed approval', () => {
  const empty = createReviewNotes(instrument);
  assert.deepEqual(empty, {
    format: 'political-context-review-notes', notesVersion: 1,
    instrumentId: instrument.id, instrumentVersion: instrument.version,
    reviewerCode: '', entries: [],
  });
  assert.deepEqual(validation(empty), { valid: true, staleEntryIds: [] });
  const notes = withEntries(makeEntry(), makeEntry({ id: 'review-2', outcome: 'no-issue', severity: 'none', observation: '', proposedChange: '' }));
  notes.reviewerCode = 'reviewer-B';
  const imported = JSON.parse(JSON.stringify(notes));
  assert.deepEqual(imported, notes);
  assert.deepEqual(validation(imported), { valid: true, staleEntryIds: [] });
  assert.ok(!['answers', 'session', 'completed', 'approved'].some(key => Object.hasOwn(notes, key)));
});

test('same-version stale evidence remains identifiable without silently rewriting the original review', () => {
  const entry = makeEntry({ sourceFingerprint: 'rv1-00000000' });
  assert.notEqual(entry.sourceFingerprint, targets[0].fingerprint);
  const notes = withEntries(entry);
  const before = structuredClone(notes);
  assert.deepEqual(validation(notes), { valid: true, staleEntryIds: [entry.id] });
  assert.deepEqual(notes, before);
  const acknowledged = upsertReviewEntry(notes, { ...entry, sourceFingerprint: targets[0].fingerprint, updatedAt: '2026-10-22T11:00:00.000Z' });
  assert.deepEqual(validation(acknowledged), { valid: true, staleEntryIds: [] });
  assert.equal(notes.entries[0].sourceFingerprint, 'rv1-00000000');
});

test('critical findings can record invalid role powers while no-issue observations require severity none', () => {
  for (const outcome of ['revise', 'discuss']) {
    const notes = withEntries(makeEntry({ criterion: 'authority', severity: 'critical', outcome,
      observation: 'The described role cannot issue the decision under the stated authority.' }));
    assert.deepEqual(validation(notes), { valid: true, staleEntryIds: [] });
    notes.entries[0].severity = 'urgent';
    assert.equal(validation(notes).valid, false);
  }
  assert.equal(validation(withEntries(makeEntry({ outcome: 'no-issue', severity: 'critical' }))).valid, false);
});

test('foreign protocols, unknown targets, malformed fields, and inconsistent review outcomes are rejected atomically', () => {
  const mutations = [
    notes => { notes.format = 'political-context-response-export'; },
    notes => { notes.notesVersion = 2; },
    notes => { notes.instrumentId = 'another-instrument'; },
    notes => { notes.instrumentVersion = '0.3.0'; },
    notes => { notes.answers = {}; },
    notes => { notes.reviewerCode = null; },
    notes => { notes.entries[0].targetKey = 'scenario:public-assembly:not-a-world'; },
    notes => { notes.entries[0].targetKey = '__proto__'; },
    notes => { notes.entries[0].sourceFingerprint = 'not-a-fingerprint'; },
    notes => { notes.entries[0].language = 'fr'; },
    notes => { notes.entries[0].criterion = 'approved'; },
    notes => { notes.entries[0].field = '   '; },
    notes => { notes.entries[0].outcome = 'approved'; },
    notes => { notes.entries[0].severity = 'none'; },
    notes => { notes.entries[0].outcome = 'no-issue'; },
    notes => { notes.entries[0].observation = '   '; },
    notes => { notes.entries[0].sourceNote = {}; },
    notes => { delete notes.entries[0].proposedChange; },
    notes => { notes.entries[0].createdAt = '2026-10-22'; },
    notes => { notes.entries[0].updatedAt = '2026-10-21T10:00:00.000Z'; },
    notes => { notes.entries.push({ ...notes.entries[0] }); },
    notes => { notes.entries[0].id = '<script>'; },
  ];
  for (const mutate of mutations) {
    const notes = withEntries(makeEntry());
    mutate(notes);
    const before = structuredClone(notes);
    const result = validation(notes);
    assert.equal(result.valid, false);
    assert.ok(result.error);
    assert.deepEqual(result.staleEntryIds, []);
    assert.deepEqual(notes, before);
  }
});

test('text, entry-count, and aggregate UTF-8 limits keep every valid worksheet importable', () => {
  assert.equal(MAX_REVIEW_BYTES, 1048576);
  for (const [field, maximum] of [['field', 120], ['observation', 4000], ['proposedChange', 4000], ['resolution', 4000], ['sourceNote', 2000]]) {
    const notes = withEntries(makeEntry({ [field]: 'x'.repeat(maximum) }));
    assert.equal(validation(notes).valid, true, field);
    notes.entries[0][field] += 'x';
    assert.equal(validation(notes).valid, false, field);
  }
  const reviewer = withEntries(makeEntry());
  reviewer.reviewerCode = 'r'.repeat(121);
  assert.equal(validation(reviewer).valid, false);
  const tooMany = withEntries(...Array.from({ length: 2001 }, (_, index) => makeEntry({ id: `review-${index}` })));
  assert.match(validation(tooMany).error, /2000/);
  const large = withEntries(...Array.from({ length: 100 }, (_, index) => makeEntry({ id: `review-${index}`, observation: 'ệ'.repeat(4000) })));
  assert.ok(new TextEncoder().encode(JSON.stringify(large)).length > MAX_REVIEW_BYTES);
  assert.match(validation(large).error, /1 MiB/);
});

test('a compact JSON export round-trips at the exact UTF-8 byte budget and rejects one extra byte', () => {
  const byteLength = value => new TextEncoder().encode(value).length;
  const notes = withEntries(...Array.from({ length: 120 }, (_, index) => makeEntry({
    id: `review-${index}`, observation: `Nội dung ${'x'.repeat(3991)}`, proposedChange: 'x'.repeat(4000),
  })));
  let remaining = MAX_REVIEW_BYTES - byteLength(JSON.stringify(notes));
  assert.ok(remaining > 0);
  for (const entry of notes.entries) {
    const added = Math.min(4000, remaining);
    entry.resolution = 'x'.repeat(added);
    remaining -= added;
    if (!remaining) break;
  }
  assert.equal(remaining, 0);
  const compact = JSON.stringify(notes);
  assert.equal(byteLength(compact), MAX_REVIEW_BYTES);
  assert.ok(byteLength(JSON.stringify(notes, null, 2)) > MAX_REVIEW_BYTES);
  const imported = JSON.parse(compact);
  assert.deepEqual(validation(imported), { valid: true, staleEntryIds: [] });
  assert.deepEqual(imported, notes);
  const room = imported.entries.find(entry => entry.resolution.length < 4000);
  room.resolution += 'x';
  assert.equal(byteLength(JSON.stringify(imported)), MAX_REVIEW_BYTES + 1);
  assert.match(validation(imported).error, /1 MiB/);
});

test('non-JSON accessors, sparse lists, cycles, and injected properties fail without invoking getters', () => {
  let accessed = false;
  const getter = withEntries(makeEntry());
  Object.defineProperty(getter.entries[0], 'observation', { enumerable: true, get() { accessed = true; return 'Injected'; } });
  assert.equal(validation(getter).valid, false);
  assert.equal(accessed, false);
  const sparse = createReviewNotes(instrument);
  sparse.entries.length = 1;
  assert.equal(validation(sparse).valid, false);
  const arrayGetter = createReviewNotes(instrument);
  Object.defineProperty(arrayGetter.entries, '0', { configurable: true, enumerable: true, get() { accessed = true; return makeEntry(); } });
  assert.equal(validation(arrayGetter).valid, false);
  assert.equal(accessed, false);
  const cyclic = withEntries(makeEntry());
  cyclic.entries[0].sourceNote = cyclic;
  assert.equal(validation(cyclic).valid, false);
  const injected = JSON.parse(JSON.stringify(withEntries(makeEntry())).replace('"reviewerCode":""', '"reviewerCode":"","__proto__":{}'));
  assert.equal(validation(injected).valid, false);
});

test('upserting and deleting notes leave prior documents and entry objects untouched', () => {
  const original = withEntries(makeEntry(), makeEntry({ id: 'review-2' }));
  const snapshot = structuredClone(original);
  const replacement = { ...original.entries[0], observation: 'A revised observation.' };
  const updated = upsertReviewEntry(original, replacement);
  replacement.observation = 'Changed after saving.';
  updated.entries[1].proposedChange = 'Changed in new document.';
  assert.equal(updated.entries[0].observation, 'A revised observation.');
  assert.deepEqual(original, snapshot);
  const added = upsertReviewEntry(original, makeEntry({ id: 'review-3' }));
  assert.deepEqual(added.entries.map(entry => entry.id), ['review-1', 'review-2', 'review-3']);
  const removed = removeReviewEntry(original, 'review-1');
  assert.deepEqual(removed.entries.map(entry => entry.id), ['review-2']);
  removed.entries[0].observation = 'Another independent change.';
  assert.deepEqual(original, snapshot);
});

// Parse the CSV independently of JSON exports to test quotes, line breaks, and
// spreadsheet-safe text without requiring any external CSV package.
function parseCsv(source) {
  const result = []; let row = []; let cell = ''; let quoted = false;
  for (let index = source.charCodeAt(0) === 0xfeff ? 1 : 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"' && source[index + 1] === '"') { cell += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(cell); cell = ''; }
    else if (char === '\r' && source[index + 1] === '\n') { row.push(cell); result.push(row); row = []; cell = ''; index += 1; }
    else cell += char;
  }
  assert.equal(quoted, false);
  assert.equal(cell, '');
  return result;
}

test('CSV exports preserve Vietnamese, field context, quotes, and multiline notes while neutralizing spreadsheet formulas', () => {
  const target = findTarget('scenario:public-assembly:anbinh');
  const notes = withEntries(makeEntry({ targetKey: target.key, sourceFingerprint: target.fingerprint,
    observation: '=HYPERLINK("https://example.test","x")', proposedChange: 'Đổi "vai trò", giữ ý nghĩa.\nDòng thứ hai.',
    resolution: '\t+SUM(1,2)', sourceNote: '@source', language: 'vi', field: 'authority' }));
  notes.reviewerCode = ' -reviewer';
  const csv = reviewNotesCsv(notes, targets);
  assert.equal(csv.charCodeAt(0), 0xfeff);
  const [headers, values] = parseCsv(csv);
  assert.deepEqual(headers, CSV_COLUMNS);
  assert.equal(values.length, 22);
  const exported = Object.fromEntries(headers.map((key, index) => [key, values[index]]));
  assert.equal(exported.world_id, 'anbinh');
  assert.equal(exported.item_id, 'public-assembly');
  assert.equal(exported.role_id, 'constituent');
  assert.equal(exported.target_kind, 'scenario');
  assert.equal(exported.target_field, 'authority');
  assert.equal(exported.review_date, '2026-10-22');
  assert.equal(exported.review_round, '');
  assert.equal(exported.resolved_in_version, '');
  assert.equal(exported.status, 'revise');
  assert.equal(exported.observation, `'${notes.entries[0].observation}`);
  assert.equal(exported.resolution, `'${notes.entries[0].resolution}`);
  assert.equal(exported.source_note, `'${notes.entries[0].sourceNote}`);
  assert.equal(exported.reviewer_code, `'${notes.reviewerCode}`);
  assert.equal(exported.proposed_change, notes.entries[0].proposedChange);
  for (const start of ['=', '+', '-', '@', '\r', '\n', '\t', '\u0000', ' ']) {
    const variant = withEntries(makeEntry({ observation: `${start}=1+1` }));
    const rows = parseCsv(reviewNotesCsv(variant, targets));
    assert.equal(rows[1][headers.indexOf('observation')], `'${variant.entries[0].observation}`);
  }
});
