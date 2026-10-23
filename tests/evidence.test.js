import test from 'node:test';
import assert from 'node:assert/strict';
import { instrument } from '../js/content.js';
import { foundationEvidence } from '../js/foundation-evidence.js';
import { validateEvidence } from '../scripts/validate-evidence.js';

const copy = () => structuredClone(foundationEvidence);

test('the source-verification queue covers the foundation bank without implying completed source checks', () => {
  assert.deepEqual(validateEvidence(instrument, foundationEvidence), []);
  assert.equal(foundationEvidence.items.length, 16);
  assert.equal(foundationEvidence.sources.length, 12);
  assert.ok(foundationEvidence.sources.every(source => source.verification === 'unverified'));
  assert.ok(foundationEvidence.sources.every(source => source.authors.length === 0));
  assert.ok(foundationEvidence.sources.every(source => /403/.test(source.note)));
  assert.ok(foundationEvidence.items.some(item => item.links.some(link => link.relation === 'contrast')));
});

test('source-map checks reject missing, foreign, duplicate, and dangling identities', () => {
  for (const mutate of [
    draft => { draft.items.pop(); },
    draft => { draft.items[0].itemId = 'not-a-foundation'; },
    draft => { draft.items.push(structuredClone(draft.items[0])); },
    draft => { draft.sources.push(structuredClone(draft.sources[0])); },
    draft => { draft.items[0].links[0].sourceId = 'missing-source'; },
    draft => { draft.items[0].links.push(structuredClone(draft.items[0].links[0])); },
  ]) {
    const draft = copy();
    mutate(draft);
    assert.ok(validateEvidence(instrument, draft).length > 0);
  }
});

test('citation URLs reject executable schemes, credentials, whitespace, and malformed addresses', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,test', '/relative', 'https://user:secret@example.org/entry', 'https://example.org/entry\n', 'https://']) {
    const draft = copy();
    draft.sources[0].url = value;
    assert.ok(validateEvidence(instrument, draft).some(error => /URL/.test(error)), value);
  }
  const anchored = copy();
  anchored.sources[0].url = 'https://example.org/entry#section';
  assert.deepEqual(validateEvidence(instrument, anchored), []);
});

test('source metadata preserves review status, instrument versions, and honest verification states', () => {
  for (const mutate of [
    draft => { draft.instrumentVersion = '0.3.0'; },
    draft => { draft.instrumentId = 'another-instrument'; },
    draft => { draft.evidenceVersion = 2; },
    draft => { draft.reviewStatus = 'validated'; },
    draft => { draft.sources[0].verification = 'approved'; },
    draft => { draft.sources[0].verification = 'text-checked'; },
    draft => { draft.sources[0].accessed = '2026-02-30'; },
    draft => { draft.sources[0].authors = ['']; },
    draft => { draft.items[0].links[0].relation = 'proves'; },
  ]) {
    const draft = copy();
    mutate(draft);
    assert.ok(validateEvidence(instrument, draft).length > 0);
  }
  const attributed = copy();
  attributed.sources[0].verification = 'metadata-checked';
  attributed.sources[0].authors = ['Example attribution for validator fixture'];
  assert.deepEqual(validateEvidence(instrument, attributed), []);
});

test('source-map checks fail gracefully on malformed structures and require review questions', () => {
  for (const draft of [null, [], {}, {...copy(), sources: null}, {...copy(), items: null}]) {
    assert.ok(validateEvidence(instrument, draft).length > 0);
  }
  for (const mutate of [
    draft => { draft.sources[0].extra = 'unexpected'; },
    draft => { draft.items[0].openQuestion = ' '; },
    draft => { draft.items[0].links = []; },
    draft => { draft.items[0].links[0].note = ''; },
    draft => { draft.sources[0].locator = null; },
  ]) {
    const draft = copy();
    mutate(draft);
    assert.ok(validateEvidence(instrument, draft).length > 0);
  }
});
