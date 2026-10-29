import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { instrument } from '../js/content.js';
import { createExpandedFingerprint, expandedContentSnapshot } from '../js/expanded-fingerprint.js';

const catalog = JSON.parse(await readFile(new URL('../data/question-catalog.json', import.meta.url), 'utf8'));
const fingerprint = (c = catalog, worlds = instrument.worlds) => createExpandedFingerprint(c, worlds);
const item = (data, id) => data.items.find(record => record.id === id);

test('semantic fingerprint is deterministic for the 60 playable questions and eight fictional worlds', async () => {
  const snapshot = expandedContentSnapshot(catalog, instrument.worlds);
  assert.equal(snapshot.items.length, 60);
  assert.equal(snapshot.worlds.length, 8);
  assert.deepEqual(snapshot.items.slice(0, 5).map(row => row.id), ['CR-13A', 'CR-13B', 'CR-13C', 'CR-13D', 'CR-S07']);
  assert.match(await fingerprint(), /^[0-9a-f]{64}$/);
  assert.equal(await fingerprint(), await fingerprint(structuredClone(catalog), structuredClone(instrument.worlds)));
});

test('database rebuild metadata, unrelated content and world order do not invalidate saved answers', async () => {
  const altered = structuredClone(catalog);
  altered.catalogVersion = 'new metadata version';
  altered.provenance.database.sha256 = '0'.repeat(64);
  altered.provenance.sources = {};
  item(altered, 'CR-01A').texts.en.text += ' unrelated content changed';
  item(altered, 'CR-13A').texts.vi.text += ' bản dịch khác';
  assert.equal(await fingerprint(), await fingerprint(altered, [...instrument.worlds].reverse()));
});

test('changed playable wording, selected action, explanation, or fictional setting invalidates saved answers', async () => {
  const original = await fingerprint();
  for (const update of [
    c => { item(c, 'CR-13A').texts.en.text += ' changed'; },
    c => { item(c, 'CR-13A').rationale += ' changed'; },
    c => { item(c, 'CR-S07').title += ' changed'; },
    c => { item(c, 'CR-S07').locality = 'rural'; },
    c => { item(c, 'CR-S07').briefings.en += ' changed'; },
    c => { item(c, 'CR-S07').options[0].texts.en.description += ' changed'; },
    c => { item(c, 'CR-S07').options[0].texts.en.tradeoff += ' changed'; },
    c => { item(c, 'CR-S07').reasons.en[0] += ' changed'; },
    c => { item(c, 'CR-S07').personalPreferencePrompt.en += ' changed'; },
  ]) {
    const modified = structuredClone(catalog);
    update(modified);
    assert.notEqual(await fingerprint(modified), original);
  }
  const modifiedWorlds = structuredClone(instrument.worlds);
  modifiedWorlds[0].inspiration += ' changed';
  assert.notEqual(await fingerprint(catalog, modifiedWorlds), original);
});

test('incomplete or ambiguous playable catalogs are rejected', async () => {
  const missing = structuredClone(catalog);
  missing.items = missing.items.filter(row => row.id !== 'CR-13A');
  await assert.rejects(fingerprint(missing), /Missing statement CR-13A/);
  const duplicate = structuredClone(catalog);
  duplicate.items.push(structuredClone(item(duplicate, 'CR-13A')));
  await assert.rejects(fingerprint(duplicate), /Duplicate catalog item IDs/);
  const missingWorld = instrument.worlds.slice(1);
  await assert.rejects(fingerprint(catalog, missingWorld), /eight distinct worlds/);
});
