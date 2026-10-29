import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { instrument } from '../js/content.js';
import { createSession, makeSteps, summarize, validateSession } from '../js/engine.js';
import { createExpandedFingerprint } from '../js/expanded-fingerprint.js';
import { createCombined, validateCombined, expandedItemIds, setExpandedAnswer, setExpandedIndex, isCombinedComplete, createCombinedExport } from '../js/combined-session.js';

const catalog = JSON.parse(await readFile(new URL('../data/question-catalog.json', import.meta.url), 'utf8'));
const fingerprint = await createExpandedFingerprint(catalog, instrument.worlds);
const steps = makeSteps(instrument);
function original(completed = false) {
  const session = createSession(instrument, 'combined-session-test-seed');
  if (completed) {
    for (const step of steps) {
      if (step.type === 'statement' || step.type === 'foundation') session.answers[step.id] = {kind:'skip'};
      if (step.type === 'scenario') session.answers[step.id] = {kind:'skip', reasonId:null};
    }
    session.stepIndex = steps.length - 1;
    session.completed = true;
  }
  assert.equal(validateSession(instrument, session).valid, true);
  return session;
}
function complete() {
  let session = createCombined(original(true), fingerprint);
  for (const id of expandedItemIds) {
    const value = id.startsWith('CR-S') ? {choice:'none',reason:null,preference:'A'} : 'uncertain';
    session = setExpandedAnswer(session, id, value);
  }
  return setExpandedIndex(session, expandedItemIds.length);
}
const valid = session => validateCombined(session, instrument, catalog, fingerprint);

test('original saves migrate without changing their assignment, response data or storage setting', () => {
  for (const previous of [original(), original(true)]) {
    previous.saveOnDevice = true;
    const before = structuredClone(previous);
    const combined = createCombined(previous, fingerprint);
    assert.deepEqual(combined.legacy, before);
    assert.notStrictEqual(combined.legacy, previous);
    assert.equal(valid(combined).valid, true);
    assert.equal(isCombinedComplete(combined,instrument,catalog,fingerprint), false);
    assert.throws(() => createCombinedExport(combined,instrument,catalog,fingerprint), /Complete both/);
    assert.deepEqual(previous, before);
  }
});

test('ordered expanded items are exhaustive and cannot be skipped without an explicit response', () => {
  assert.equal(expandedItemIds.length, 60);
  assert.equal(new Set(expandedItemIds).size, 60);
  assert.deepEqual(expandedItemIds.slice(0,5), ['CR-13A','CR-13B','CR-13C','CR-13D','CR-S07']);
  let session = createCombined(original(true), fingerprint);
  session = setExpandedIndex(session, 1);
  assert.match(valid(session).error, /unanswered/);
  session = setExpandedAnswer(session, 'CR-13A', 'skip');
  assert.equal(valid(session).valid, true);
  assert.throws(() => setExpandedAnswer(session, 'not-a-question', 'skip'), /Unknown/);
});

test('scenario uncertainty, missing choice and optional preferences remain distinct', () => {
  let session = createCombined(original(true), fingerprint);
  const id = 'CR-S07';
  for (const choice of ['uncertain','none','skip']) {
    const next = setExpandedAnswer(session, id, {choice,reason:null,preference:'A'});
    assert.equal(valid(next).valid, true, choice);
    assert.equal(next.expanded.answers[id].preference, 'A');
    const invalid = setExpandedAnswer(session, id, {choice,reason:'invented',preference:'A'});
    assert.equal(valid(invalid).valid, false, choice);
  }
  assert.equal(valid(setExpandedAnswer(session,id,{choice:'A',reason:'invented',preference:null})).valid, false);
  assert.equal(valid(setExpandedAnswer(session,id,{choice:'A',reason:null,preference:null})).valid, true);
});

test('the final combined export includes both evidence sets only after all 109 responses', () => {
  const session = complete();
  assert.equal(valid(session).valid, true);
  assert.equal(isCombinedComplete(session,instrument,catalog,fingerprint), true);
  const result = createCombinedExport(session,instrument,catalog,fingerprint);
  assert.equal(result.format,'political-context-combined-response-export');
  assert.equal(Object.keys(result.session.legacy.answers).length,49);
  assert.equal(Object.keys(result.session.expanded.answers).length,60);
  assert.equal(result.assignmentReveal.worldId, session.legacy.worldId);
  assert.ok(result.assignmentReveal.inspiration);
  assert.deepEqual(result.originalSummary, summarize(instrument,session.legacy));
  assert.equal(result.expandedInterpretation.themes.length,12);
  assert.equal(result.expandedInterpretation.statementCounts.uncertain,48);
  result.session.expanded.answers['CR-13A']='agree';
  assert.equal(session.expanded.answers['CR-13A'],'uncertain');
});

test('returning to an original answer preserves later responses but gates results and disclosure', () => {
  const session = complete();
  const revisiting = structuredClone(session);
  revisiting.legacy.stepIndex = steps.length - 2;
  revisiting.legacy.completed = false;
  assert.equal(valid(revisiting).valid,true);
  assert.equal(Object.keys(revisiting.expanded.answers).length,60);
  assert.equal(isCombinedComplete(revisiting,instrument,catalog,fingerprint),false);
  assert.throws(() => createCombinedExport(revisiting,instrument,catalog,fingerprint), /Complete both/);
});

test('mismatched fingerprints and malformed or altered saves are rejected without mutation', () => {
  const session = complete();
  const before = structuredClone(session);
  assert.equal(validateCombined(session,instrument,catalog,'0'.repeat(64)).valid,false);
  for (const modify of [
    s => {s.legacy.worldId = 'not-assigned';},
    s => {s.expanded.answers['unknown']='agree';},
    s => {delete s.expanded.answers['CR-13A'];},
    s => {s.expanded.answers['CR-S07']={choice:'A',reason:null,preference:null,extra:'x'};},
    s => {s.schemaVersion = 2;},
    s => {s.extra = true;},
  ]) {
    const bad=structuredClone(session); modify(bad);
    assert.equal(valid(bad).valid,false);
  }
  assert.deepEqual(session,before);
});
