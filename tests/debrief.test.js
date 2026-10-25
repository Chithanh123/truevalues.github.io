import test from 'node:test';
import assert from 'node:assert/strict';
import { instrument } from '../js/content.js';
import { createSession, makeSteps, summarize, validateSession } from '../js/engine.js';
import { buildDebrief, createTextReport } from '../js/debrief.js';
import { debriefThemes } from '../js/debrief-content.js';

function completeSession(seed = 'debrief-fixture') {
  const session = createSession(instrument, seed);
  for (const item of instrument.statements) session.answers[`statement:${item.id}`] = { kind: 'value', value: 0 };
  for (const item of instrument.foundations.items) session.answers[`foundation:${item.id}`] = { kind: 'value', value: 0 };
  for (const item of instrument.scenarios) {
    session.answers[`scenario:${item.id}`] = { kind: 'choice', optionId: item.options[0].id, reasonId: null };
  }
  session.stepIndex = makeSteps(instrument).length - 1;
  session.completed = true;
  assert.equal(validateSession(instrument, session).valid, true);
  return session;
}

function allRows(report, key) {
  return report.themes.flatMap(theme => theme[key]);
}

test('the authored theme map covers each of the 49 current items once with valid references', () => {
  for (const [key, source] of [['statementIds', instrument.statements], ['foundationIds', instrument.foundations.items], ['scenarioIds', instrument.scenarios]]) {
    const refs = debriefThemes.flatMap(theme => theme[key]);
    assert.equal(new Set(refs).size, refs.length, `${key} should not double-count a response`);
    assert.deepEqual([...refs].sort(), source.map(item => item.id).sort());
  }
  const report = buildDebrief(instrument, completeSession());
  assert.equal(report.responseOverview.values.total + report.responseOverview.foundations.total + report.responseOverview.scenarios.total, 49);
  const untested = report.themes.filter(theme => !theme.scenarios.length);
  assert(untested.length >= 2);
  for (const theme of untested) assert.match(theme.readingNote, /no |does not |not /i);
});

test('completion and session integrity gate every report before country disclosure', () => {
  for (const candidate of [null, createSession(instrument, 'partial'), { ...completeSession(), completed: false }]) {
    for (const produce of [buildDebrief, createTextReport]) {
      assert.throws(() => produce(instrument, candidate), error => {
        assert.match(error.message, /Complete the assessment/);
        for (const world of instrument.worlds) assert(!error.message.includes(world.inspiration));
        return true;
      });
    }
  }
  const missing = completeSession();
  delete missing.answers[`foundation:${instrument.foundations.items[0].id}`];
  assert.throws(() => buildDebrief(instrument, missing), /invalid session/);
  const invalid = completeSession();
  invalid.answers[`scenario:${instrument.scenarios[0].id}`].optionId = 'invented';
  assert.throws(() => createTextReport(instrument, invalid), /invalid session/);
});

test('neutral, uncertainty, skipping and unrepresented choices remain different coverage records', () => {
  const session = completeSession();
  session.answers[`statement:${instrument.statements[0].id}`] = { kind: 'uncertain' };
  session.answers[`statement:${instrument.statements[1].id}`] = { kind: 'skip' };
  session.answers[`foundation:${instrument.foundations.items[0].id}`] = { kind: 'uncertain' };
  session.answers[`foundation:${instrument.foundations.items[1].id}`] = { kind: 'skip' };
  for (const [index, kind] of ['uncertain', 'none', 'skip'].entries()) {
    session.answers[`scenario:${instrument.scenarios[index].id}`] = { kind, reasonId: null };
  }
  const report = buildDebrief(instrument, session);
  assert.deepEqual(report.responseOverview.values, { total: 24, answered: 22, uncertain: 1, skipped: 1, unanswered: 0 });
  assert.deepEqual(report.responseOverview.foundations, { total: 16, answered: 14, uncertain: 1, skipped: 1, unanswered: 0 });
  assert.deepEqual(report.responseOverview.scenarios, { total: 9, answered: 6, uncertain: 1, skipped: 1, unanswered: 0, unrepresented: 1 });
  assert(allRows(report, 'statements').some(item => item.value === 0 && item.responseLabel === 'Neither agree nor disagree'));
  assert(allRows(report, 'scenarios').some(item => item.status === 'none' && item.actionLabel === 'None of the offered choices'));
});

test('raw agreement is not reverse-keyed or converted into a theme score', () => {
  const session = completeSession();
  const reverse = instrument.statements.find(item => item.direction === -1);
  session.answers[`statement:${reverse.id}`] = { kind: 'value', value: 2 };
  const report = buildDebrief(instrument, session);
  const row = allRows(report, 'statements').find(item => item.id === reverse.id);
  assert.equal(row.value, 2);
  assert.equal(row.responseLabel, 'Strongly agree');
  for (const theme of report.themes) {
    assert.equal(Object.hasOwn(theme, 'score'), false);
    assert.equal(Object.hasOwn(theme, 'mean'), false);
  }
});

test('selected reasons and optional preferences are retained without inferred agreement', () => {
  const session = completeSession();
  const [first, second, third] = instrument.scenarios;
  session.answers[`scenario:${first.id}`].reasonId = first.reasons.at(-1).id;
  session.answers[`scenario:${first.id}`].preference = { kind: 'choice', optionId: first.options.at(-1).id };
  session.answers[`scenario:${second.id}`].preference = { kind: 'uncertain' };
  session.answers[`scenario:${third.id}`].preference = { kind: 'none' };
  const report = buildDebrief(instrument, session);
  const scenes = allRows(report, 'scenarios');
  const firstRow = scenes.find(item => item.id === first.id);
  assert.equal(firstRow.reasonLabel, first.reasons.at(-1).label);
  assert.equal(firstRow.preferenceLabel, first.options.at(-1).label);
  assert.notEqual(firstRow.preferenceOptionId, firstRow.optionId);
  assert.deepEqual(report.responseOverview.preferences, { total: 9, provided: 3, choices: 1, uncertain: 1, unrepresented: 1, unanswered: 6 });
  const absent = scenes.find(item => item.id === instrument.scenarios[3].id);
  assert.equal(absent.reasonLabel, 'No reason selected');
  assert.equal(absent.preferenceStatus, 'not-provided');
  assert.equal(absent.preferenceOptionId, null);
  assert.equal(absent.preferenceLabel, 'Not provided (optional)');
});

test('housing comparisons describe same, different, and insufficient answers without score changes', () => {
  const session = completeSession();
  const comparison = instrument.scenarios.find(item => item.comparisonOf);
  assert.equal(buildDebrief(instrument, session).comparisons[0].changed, false);
  session.answers[`scenario:${comparison.id}`].optionId = comparison.options[1].id;
  const before = summarize(instrument, session);
  const report = buildDebrief(instrument, session);
  assert.equal(report.comparisons[0].changed, true);
  assert.equal(report.comparisons[0].changedCondition, comparison.changedCondition);
  assert.equal(allRows(report, 'scenarios').find(item => item.id === comparison.id).comparisonOf, comparison.comparisonOf);
  assert.equal(allRows(report, 'scenarios').find(item => item.id === 'public-records').descriptive, true);
  assert.deepEqual(summarize(instrument, session), before);
  session.answers[`scenario:${comparison.id}`] = { kind: 'uncertain', reasonId: null };
  assert.equal(buildDebrief(instrument, session).comparisons[0].changed, null);
});

test('plain-text report includes exact responses, coverage gaps, exclusions and final setting reveal', () => {
  const session = completeSession();
  const scene = instrument.scenarios[0];
  session.answers[`scenario:${scene.id}`].reasonId = scene.reasons[1].id;
  const text = createTextReport(instrument, session);
  const world = instrument.worlds.find(item => item.id === session.worldId);
  assert(text.includes(world.name));
  assert(text.includes(world.inspiration));
  for (const item of [...instrument.statements, ...instrument.foundations.items, ...instrument.scenarios]) {
    assert(text.includes(`[${item.id}]`), item.id);
    assert(text.includes(item.text ?? item.title));
  }
  assert(text.includes(scene.reasons[1].label));
  assert(text.includes(scene.options[0].description));
  assert.match(text, /No dedicated situation is linked/);
  assert.match(text, /exploratory exercise is excluded/);
  assert.match(text, /repeated comparison is excluded/);
  assert.match(text, /Not provided \(optional\)/);
  assert.match(text, /recorded responses/);
  assert(!text.includes('[object Object]'));
});

test('report construction is pure and returned records do not alias authored data', () => {
  const session = completeSession();
  const sourceBefore = structuredClone(instrument);
  const answersBefore = structuredClone(session);
  const themesBefore = structuredClone(debriefThemes);
  const report = buildDebrief(instrument, session);
  createTextReport(instrument, session);
  report.themes[0].statements[0].text = 'Changed outside the model';
  report.themes[0].statementIds.push('unrelated');
  report.themes[0].scenarios[0].facts[0].text = 'Changed outside the model';
  report.world.name = 'Different';
  assert.deepEqual(instrument, sourceBefore);
  assert.deepEqual(session, answersBefore);
  assert.deepEqual(debriefThemes, themesBefore);
});

test('reports retain each assigned setting and the constraints under which decisions were made', () => {
  const checked = new Set();
  for (let seed = 0; seed < 200 && checked.size < instrument.worlds.length; seed += 1) {
    const session = completeSession(`report-setting-${seed}`);
    if (checked.has(session.worldId)) continue;
    checked.add(session.worldId);
    const world = instrument.worlds.find(item => item.id === session.worldId);
    const report = buildDebrief(instrument, session);
    const text = createTextReport(instrument, session);
    for (const scene of allRows(report, 'scenarios')) {
      const source = instrument.scenarios.find(item => item.id === scene.id);
      assert.equal(scene.briefing, source.briefing);
      assert.deepEqual(scene.facts, source.facts);
      assert.equal(scene.institutionalContext, world.scenarioNotes[scene.id]);
      assert(text.includes(source.briefing));
      assert(text.includes(world.scenarioNotes[scene.id]));
      for (const fact of source.facts) assert(text.includes(fact.text));
    }
  }
  assert.equal(checked.size, instrument.worlds.length);
});

test('broken or incomplete editorial theme maps fail instead of dropping or inventing evidence', () => {
  const session = completeSession();
  const unknown = structuredClone(debriefThemes);
  unknown[0].statementIds.push('unknown-statement');
  assert.throws(() => buildDebrief(instrument, session, unknown), /Unknown/);
  const duplicate = structuredClone(debriefThemes);
  duplicate[0].statementIds.push(duplicate[0].statementIds[0]);
  assert.throws(() => buildDebrief(instrument, session, duplicate), /duplicate/);
  const overlap = structuredClone(debriefThemes);
  overlap[1].statementIds.push(overlap[0].statementIds[0]);
  assert.throws(() => buildDebrief(instrument, session, overlap), /multiple debrief themes/);
  const incomplete = structuredClone(debriefThemes);
  incomplete[0].statementIds.pop();
  assert.throws(() => buildDebrief(instrument, session, incomplete), /does not cover/);
  assert.throws(() => buildDebrief(instrument, session, []), /non-empty/);
});
