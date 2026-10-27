import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pilotCases, pilotFixtureVersion } from '../js/pilot-fixtures.js';
import { instrument } from '../js/content.js';

const root = new URL('../', import.meta.url);
const digest = value => createHash('sha256').update(value).digest('hex');

test('published synthetic examples track their exact source snapshot and application version', async () => {
  const manifest = JSON.parse(await readFile(new URL('docs/results-pilot/manifest.json', root), 'utf8'));
  const application = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
  assert.equal(manifest.synthetic_only, true);
  assert.equal(manifest.human_observations, 0);
  assert.equal(manifest.application_version, application.version);
  assert.equal(manifest.instrument_version, instrument.version);
  assert.equal(manifest.fixture_version, pilotFixtureVersion);
  assert.deepEqual(manifest.cases.map(item => item.id), pilotCases.map(item => item.id));
  for (const [name, hash] of Object.entries(manifest.source_sha256)) {
    assert.equal(digest(await readFile(new URL(name, root))), hash,
      `${name} changed: run npm run build:pilot to refresh the authored examples.`);
  }
  for (const [name, hash] of Object.entries(manifest.bundle_file_sha256)) {
    if (name.startsWith('reports/')) continue; // ZIP report bytes are checked by the Python kit tests.
    assert.equal(digest(await readFile(new URL(`docs/results-pilot/${name}`, root))), hash,
      `${name} differs from the downloadable synthetic kit.`);
  }
});

test('the public observation template contains only its header, never collected observations', async () => {
  const text = await readFile(new URL('docs/results-pilot/observation-log-template.csv', root), 'utf8');
  const rows = text.trim().split(/\r?\n/);
  assert.equal(rows.length, 1, 'Keep real observations outside the public repository.');
  const fields = rows[0].split(',');
  assert.equal(fields.length, 18);
  assert.equal(new Set(fields).size, fields.length);
  for (const field of ['case_id', 'task_id', 'paraphrase_status', 'evidence_navigation', 'retest_reference']) {
    assert(fields.includes(field));
  }
});
