import test from 'node:test';
import assert from 'node:assert/strict';
import { instrument } from '../js/content.js';
import { createSession, makeSteps, summarize } from '../js/engine.js';
import { buildDebrief } from '../js/debrief.js';
import { interpretDebrief } from '../js/interpretation.js';
import { interpretationThemes, premiseMeanings, decisionMeanings } from '../js/interpretation-content.js';

function sessionWithSkips(seed = 'interpretation-fixture') {
  const session = createSession(instrument, seed);
  for (const item of instrument.statements) session.answers[`statement:${item.id}`] = { kind: 'skip' };
  for (const item of instrument.foundations.items) session.answers[`foundation:${item.id}`] = { kind: 'skip' };
  for (const item of instrument.scenarios) session.answers[`scenario:${item.id}`] = { kind: 'skip', reasonId: null };
  session.stepIndex = makeSteps(instrument).length - 1;
  session.completed = true;
  return session;
}

function answer(session, id, value) {
  const type = id.startsWith('premise-') ? 'foundation' : 'statement';
  session.answers[`${type}:${id}`] = typeof value === 'number' ? { kind: 'value', value } : { kind: value };
}

function choose(session, id, optionId, preference, reasonId = null) {
  session.answers[`scenario:${id}`] = { kind: 'choice', optionId, reasonId, ...(preference ? { preference } : {}) };
}

function read(session) { return interpretDebrief(instrument, buildDebrief(instrument, session)); }
function theme(result, id = 'ownership-provision-control') { return result.themes.find(item => item.id === id); }

test('directional readings use the existing item keys while opposite and mixed answers remain distinct', () => {
  const session = sessionWithSkips();
  const economic = instrument.statements.filter(item => item.dimension === 'economic');
  for (const item of economic) answer(session, item.id, item.direction * 2);
  let result = theme(read(session));
  assert.equal(result.pattern.kind, 'positive');
  assert.equal(result.pattern.positive, 6);
  assert.equal(result.headline, interpretationThemes[result.id].positive.title);
  for (const item of economic) answer(session, item.id, item.direction * -2);
  result = theme(read(session));
  assert.equal(result.pattern.kind, 'negative');
  assert.equal(result.pattern.negative, 6);
  assert.equal(result.headline, interpretationThemes[result.id].negative.title);
  for (const [index, item] of economic.entries()) answer(session, item.id, item.direction * (index % 2 ? 2 : -2));
  result = theme(read(session));
  assert.equal(result.pattern.kind, 'mixed');
  assert.equal(result.pattern.positive, 3);
  assert.equal(result.pattern.negative, 3);
  assert.equal(result.pattern.neutral, 0);
  assert.equal(result.headline, interpretationThemes[result.id].mixed.title);
  assert(!Object.hasOwn(result, 'score'));
  assert(!Object.hasOwn(result.pattern, 'mean'));
});

test('one directional answer never becomes a general emphasis and uncertainty is not neutrality', () => {
  const session = sessionWithSkips();
  answer(session, 'economic-ownership', 2);
  answer(session, 'economic-market', 'uncertain');
  answer(session, 'economic-services', 0);
  const result = theme(read(session));
  assert.equal(result.pattern.kind, 'limited');
  assert.deepEqual(result.pattern, { kind: 'limited', positive: 1, negative: 0, neutral: 1, uncertain: 1, skipped: 3, total: 6 });
  assert.match(result.headline, /not yet a general pattern/);
  assert.match(result.meaning, /remaining responses do not establish/);
});

test('all-neutral and all-skipped routes do not acquire a political identity or fabricated evidence', () => {
  const session = sessionWithSkips();
  let result = read(session);
  assert.equal(result.overview.title, 'What remains open');
  assert(result.themes.every(item => item.pattern.kind === 'missing' && !item.premises.length && !item.decisions.length && !item.connections.length));
  assert.deepEqual(result.roleContrast, { compared: 0, different: 0, same: 0, notComparable: 9 });
  for (const item of instrument.statements) answer(session, item.id, 0);
  for (const item of instrument.foundations.items) answer(session, item.id, 0);
  result = read(session);
  assert.equal(result.overview.title, 'What remains open');
  assert(result.themes.filter(item => item.pattern.total).every(item => item.pattern.kind === 'neutral'));
  assert(result.themes.every(item => !item.premises.length));
  assert.equal(result.insights[0].id, 'interpretation-coverage');
  assert.match(result.insights[0].text, /none supplies a political identity/);
});

test('premise meanings keep disagreement separate from endorsing an opposite philosophy', () => {
  const session = sessionWithSkips();
  answer(session, 'premise-ecological-dependence', -2);
  answer(session, 'premise-care-obligations', 2);
  const result = theme(read(session), 'care-ecological-dependence');
  assert.equal(result.headline, 'Care dependency has political significance');
  assert.equal(result.premises.find(item => item.id === 'premise-ecological-dependence').meaning, premiseMeanings['premise-ecological-dependence'].disagree);
  assert.match(result.premises.find(item => item.id === 'premise-ecological-dependence').meaning, /does not establish indifference/);
  assert.equal(result.decisions.length, 0);
  assert.match(result.evidenceNote, /no dedicated situation/);
});

test('independent sources of knowledge can coexist without being ranked or made exclusive', () => {
  const session = sessionWithSkips();
  answer(session, 'premise-dispersed-knowledge', 2);
  answer(session, 'premise-situated-knowledge', 1);
  answer(session, 'premise-testable-explanations', 2);
  const result = theme(read(session), 'knowledge-judgment');
  assert.equal(result.headline, 'More than one source can inform judgment');
  assert.match(result.meaning, /do not decide which source should prevail/);
  const connection = result.connections.find(item => item.id === 'experience-and-public-scrutiny');
  assert.deepEqual(connection.evidenceIds, ['premise-dispersed-knowledge', 'premise-situated-knowledge', 'premise-testable-explanations']);
});

test('cross-answer readings require every stated premise and only cite actual supporting answers', () => {
  const session = sessionWithSkips();
  for (const id of ['economic-services', 'premise-property-independence', 'premise-personal-agency', 'premise-social-relations', 'societal-new-voices', 'premise-gradual-reform', 'premise-own-good', 'premise-nondomination', 'premise-contestable-power']) answer(session, id, 1);
  let result = read(session);
  const all = result.themes.flatMap(item => item.connections);
  for (const id of ['public-private-independence', 'agency-and-relationships', 'inclusion-and-gradual-change', 'choice-and-protected-power']) assert(all.some(item => item.id === id));
  assert.equal(result.insights.length, 4);
  const owners = result.insights.map(insight => result.themes.find(item => item.connections.some(connection => connection.id === insight.id)).id);
  assert.equal(new Set(owners).size, owners.length);
  for (const connection of all) {
    for (const id of connection.evidenceIds) {
      const response = session.answers[`${id.startsWith('premise-') ? 'foundation' : 'statement'}:${id}`];
      assert.equal(response.kind, 'value');
      assert(response.value > 0);
    }
  }
  answer(session, 'premise-property-independence', 'uncertain');
  answer(session, 'premise-personal-agency', 0);
  answer(session, 'premise-gradual-reform', -1);
  answer(session, 'premise-contestable-power', 'skip');
  result = read(session);
  assert.equal(result.themes.flatMap(item => item.connections).length, 0);
});

test('all chosen packages have factual meanings and zero-score options do not become centrist traits', () => {
  for (const scene of instrument.scenarios) {
    for (const option of scene.options) {
      const session = sessionWithSkips();
      choose(session, scene.id, option.id);
      const result = read(session);
      const decision = result.themes.flatMap(item => item.decisions).find(item => item.id === scene.id);
      assert.equal(decision.meaning, decisionMeanings[scene.id][option.id]);
      if (option.score === 0) assert.doesNotMatch(decision.meaning, /(?:you are|identifies you as|indicates a)\s+(?:an?\s+)?(?:centrist|moderate)/i);
      const before = structuredClone(result);
      session.answers[`scenario:${scene.id}`].reasonId = scene.reasons[0].id;
      assert.deepEqual(read(session), before, 'A selected reason must not be converted into an inferred identity or causal explanation.');
    }
  }
});

test('general commitments can be contrasted with specific actions without imputing the reason for the difference', () => {
  const session = sessionWithSkips();
  answer(session, 'economic-ownership', 2);
  answer(session, 'diplomatic-obligation', 1);
  choose(session, 'housing-urgent', 'sell');
  choose(session, 'water-partnership', 'local');
  let result = read(session);
  const ownership = theme(result).connections.find(item => item.id === 'ownership-and-urgent-sale');
  assert.deepEqual(ownership.evidenceIds, ['economic-ownership', 'housing-urgent']);
  assert.match(ownership.text, /without telling us why/);
  const obligations = theme(result, 'belonging-obligations-cooperation').connections.find(item => item.id === 'obligations-and-local-allocation');
  assert.deepEqual(obligations.evidenceIds, ['diplomatic-obligation', 'water-partnership']);
  assert.match(obligations.text, /does not establish rejection of all cross-border duties/);
  answer(session, 'economic-ownership', 0);
  choose(session, 'water-partnership', 'partnership');
  result = read(session);
  assert(!result.themes.flatMap(item => item.connections).some(item => ['ownership-and-urgent-sale', 'obligations-and-local-allocation'].includes(item.id)));
});

test('role/preference contrasts require two explicit packages and retain the incomplete denominator', () => {
  const session = sessionWithSkips();
  choose(session, 'housing-urgent', 'municipal', { kind: 'choice', optionId: 'sell' });
  choose(session, 'service-contract', 'public', { kind: 'choice', optionId: 'public' });
  choose(session, 'public-assembly', 'conditions', { kind: 'uncertain' });
  choose(session, 'public-records', 'on-request', { kind: 'none' });
  session.answers['scenario:water-partnership'] = { kind: 'none', reasonId: null, preference: { kind: 'choice', optionId: 'local' } };
  const result = read(session);
  assert.deepEqual(result.roleContrast, { compared: 2, different: 1, same: 1, notComparable: 7 });
  const insight = result.insights.find(item => item.id === 'role-and-personal-preference');
  assert.deepEqual(insight.evidenceIds, ['housing-urgent', 'service-contract']);
  assert.match(insight.text, /does not establish why/);
  assert(!insight.evidenceIds.includes('public-records'));
});

test('an actual role comparison remains visible when many belief connections qualify', () => {
  const session = sessionWithSkips();
  for (const item of instrument.statements) answer(session, item.id, 2);
  for (const item of instrument.foundations.items) answer(session, item.id, 2);
  choose(session, 'housing-urgent', 'cooperative');
  session.answers['scenario:housing-urgent'].preference = { kind: 'choice', optionId: 'municipal' };
  const result = read(session);
  assert.equal(result.insights.length, 4);
  const contrast = result.insights.find(item => item.id === 'role-and-personal-preference');
  assert.deepEqual(contrast.evidenceIds, ['housing-urgent']);
  assert.match(contrast.text, /1 of 1 situations/);
  assert(result.themes.find(item => item.id === 'continuity-inclusion').connections.length > 0);
});

test('the housing contrast describes observed change and never treats a missing action as change', () => {
  const session = sessionWithSkips();
  choose(session, 'housing-urgent', 'sell');
  assert(!theme(read(session)).connections.some(item => item.id === 'condition-housing-planned'));
  choose(session, 'housing-planned', 'municipal');
  let connection = theme(read(session)).connections.find(item => item.id === 'condition-housing-planned');
  assert.match(connection.title, /changes/);
  assert.match(connection.text, /prevent attributing that difference to the deadline alone/);
  choose(session, 'housing-planned', 'sell');
  connection = theme(read(session)).connections.find(item => item.id === 'condition-housing-planned');
  assert.match(connection.title, /holds/);
  assert.match(connection.text, /does not establish that deadlines or context never matter/);
});

test('interpretation preserves scores, answers, authored copy and all eight assigned setting records', () => {
  const checked = new Set();
  const originalContent = structuredClone(instrument);
  const originalWording = structuredClone({ interpretationThemes, premiseMeanings, decisionMeanings });
  for (let index = 0; index < 200 && checked.size < instrument.worlds.length; index += 1) {
    const session = sessionWithSkips(`interpretation-setting-${index}`);
    if (checked.has(session.worldId)) continue;
    checked.add(session.worldId);
    answer(session, 'economic-services', 2);
    answer(session, 'premise-property-independence', 1);
    choose(session, 'housing-urgent', 'cooperative');
    const saved = structuredClone(session);
    const scores = summarize(instrument, session);
    const report = buildDebrief(instrument, session);
    const reportBefore = structuredClone(report);
    const result = interpretDebrief(instrument, report);
    result.themes[0].headline = 'Changed by consumer';
    result.themes[0].connections[0].evidenceIds.push('foreign');
    result.insights[0].evidenceIds.push('outside');
    assert.deepEqual(report, reportBefore);
    assert.deepEqual(session, saved);
    assert.deepEqual(summarize(instrument, session), scores);
  }
  assert.equal(checked.size, instrument.worlds.length);
  assert.deepEqual(instrument, originalContent);
  assert.deepEqual({ interpretationThemes, premiseMeanings, decisionMeanings }, originalWording);
});

test('incompatible, omitted and unknown editorial evidence fails clearly instead of inventing a reading', () => {
  const report = buildDebrief(instrument, sessionWithSkips());
  assert.throws(() => interpretDebrief(instrument, null), /compatible completed debrief/);
  assert.throws(() => interpretDebrief(instrument, { ...report, instrumentVersion: 'other' }), /compatible completed debrief/);
  const missing = structuredClone(report);
  missing.themes[0].statements.pop();
  assert.throws(() => interpretDebrief(instrument, missing), /missing statements evidence/);
  const duplicate = structuredClone(report);
  duplicate.themes.push(duplicate.themes[0]);
  assert.throws(() => interpretDebrief(instrument, duplicate), /Duplicate interpretation theme/);
  const unknown = structuredClone(report);
  unknown.themes[0].id = 'unknown';
  assert.throws(() => interpretDebrief(instrument, unknown), /Missing interpretation theme/);
});
