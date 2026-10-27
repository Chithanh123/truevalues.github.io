import test from 'node:test';
import assert from 'node:assert/strict';
import { instrument } from '../js/content.js';
import { validateSession } from '../js/engine.js';
import { pilotCases, pilotFixtureVersion, createPilotFixture } from '../js/pilot-fixtures.js';

const economic = fixture => fixture.interpretation.themes.find(theme => theme.id === 'ownership-provision-control');

test('six reproducible synthetic cases use complete valid records and one controlled setting', () => {
  assert.equal(pilotFixtureVersion, '1.0.0');
  assert.deepEqual(pilotCases.map(item => item.id), ['RP01', 'RP02', 'RP03', 'RP04', 'RP05', 'RP06']);
  const settings = new Set();
  for (const item of pilotCases) {
    const fixture = createPilotFixture(item.id);
    assert.deepEqual(fixture, createPilotFixture(item.id));
    assert.equal(validateSession(instrument, fixture.session).valid, true);
    assert.equal(fixture.session.completed, true);
    assert.equal(fixture.session.saveOnDevice, false);
    assert.equal(fixture.session.seed, 'results-comprehension-1.0.0');
    assert.equal(Object.keys(fixture.session.answers).length, 49);
    assert.equal(fixture.report.themes.flatMap(theme => [...theme.statements, ...theme.foundations, ...theme.scenarios]).length, 49);
    for (const field of ['title', 'purpose', 'facilitatorNotes']) {
      assert(item[field].en.trim());
      assert(item[field].vi.trim());
    }
    assert(item.taskIds.length && item.taskIds.every(id => /^T0[1-8]$/.test(id)));
    settings.add(fixture.session.worldId);
  }
  assert.equal(settings.size, 1);
});

test('the connected example keeps one role/preference difference distinct from missing preferences', () => {
  const fixture = createPilotFixture('RP01');
  assert.deepEqual(fixture.interpretation.roleContrast, { compared: 1, different: 1, same: 0, notComparable: 8 });
  assert.deepEqual(fixture.session.answers['scenario:housing-urgent'], { kind: 'choice', optionId: 'cooperative', reasonId: null, preference: { kind: 'choice', optionId: 'municipal' } });
  assert.equal(fixture.report.responseOverview.scenarios.answered, 9);
  assert.equal(fixture.report.responseOverview.preferences.provided, 1);
  assert.equal(fixture.report.comparisons[0].changed, false);
  assert(fixture.interpretation.insights.some(item => item.id === 'public-private-independence'));
  assert(fixture.interpretation.insights.some(item => item.id === 'role-and-personal-preference'));
  const care = fixture.interpretation.themes.find(theme => theme.id === 'care-ecological-dependence');
  assert.equal(care.premises.length, 2);
  assert.equal(care.decisions.length, 0);
  assert.match(care.limit, /no dedicated/);
});

test('mixed ownership and provision answers do not become neutral or a centrist identity', () => {
  const fixture = createPilotFixture('RP02');
  assert.deepEqual(economic(fixture).pattern, { kind: 'mixed', positive: 1, negative: 1, neutral: 4, uncertain: 0, skipped: 0, total: 6 });
  assert(economic(fixture).connections.some(item => item.id === 'ownership-and-competition'));
  assert.equal(economic(fixture).decisions.length, 2);
  assert(economic(fixture).decisions.some(item => item.id === 'housing-urgent' && /distinct institutional arrangement/.test(item.meaning)));
  assert.equal(fixture.report.responseOverview.foundations.skipped, 16);
  assert.equal(fixture.report.responseOverview.scenarios.answered, 2);
  assert.equal(fixture.interpretation.roleContrast.compared, 0);
  assert(!Object.hasOwn(fixture.interpretation, 'ideology'));
  assert(!Object.hasOwn(economic(fixture), 'score'));
});

test('neutral and uncertain examples preserve their different evidence states without inventing a position', () => {
  const neutral = createPilotFixture('RP03');
  const uncertain = createPilotFixture('RP04');
  assert.equal(neutral.report.responseOverview.values.answered, 24);
  assert.equal(neutral.report.responseOverview.foundations.answered, 16);
  assert.equal(neutral.report.responseOverview.scenarios.skipped, 9);
  assert.equal(economic(neutral).pattern.kind, 'neutral');
  assert.equal(uncertain.report.responseOverview.values.answered, 0);
  assert.equal(uncertain.report.responseOverview.values.uncertain, 24);
  assert.equal(uncertain.report.responseOverview.foundations.uncertain, 16);
  assert.equal(uncertain.report.responseOverview.scenarios.uncertain, 9);
  assert.equal(economic(uncertain).pattern.kind, 'missing');
  for (const fixture of [neutral, uncertain]) {
    assert.equal(fixture.interpretation.overview.title, 'What remains open');
    assert(fixture.interpretation.themes.every(theme => !theme.connections.length && !theme.premises.length && !theme.decisions.length));
    assert(fixture.interpretation.insights.every(insight => insight.evidenceIds.length === 0));
    assert.deepEqual(fixture.interpretation.roleContrast, { compared: 0, different: 0, same: 0, notComparable: 9 });
  }
});

test('a single directional response and none-of-these remain limited and unrepresented', () => {
  const fixture = createPilotFixture('RP05');
  assert.equal(economic(fixture).pattern.kind, 'limited');
  assert.equal(economic(fixture).pattern.positive, 1);
  assert.equal(fixture.report.responseOverview.values.skipped, 23);
  assert.equal(fixture.report.responseOverview.scenarios.answered, 0);
  assert.equal(fixture.report.responseOverview.scenarios.unrepresented, 1);
  assert.equal(fixture.report.responseOverview.scenarios.skipped, 8);
  assert.equal(fixture.report.responseOverview.preferences.unrepresented, 1);
  assert.equal(fixture.interpretation.roleContrast.compared, 0);
  assert.equal(fixture.report.comparisons[0].changed, null);
});

test('the housing example reports observed choices and selected reasons without causal attribution', () => {
  const fixture = createPilotFixture('RP06');
  assert.equal(fixture.report.comparisons[0].changed, true);
  assert.equal(fixture.report.responseOverview.scenarios.answered, 2);
  assert.equal(fixture.session.answers['scenario:housing-urgent'].reasonId, 'immediate');
  assert.equal(fixture.session.answers['scenario:housing-planned'].reasonId, 'ownership');
  assert.equal(fixture.report.responseOverview.preferences.provided, 0);
  const insight = fixture.interpretation.insights.find(item => item.id === 'condition-housing-planned');
  assert.deepEqual(insight.evidenceIds, ['housing-urgent', 'housing-planned']);
  assert.match(insight.text, /prevent attributing that difference to the deadline alone/);
});

test('mutating a returned case cannot change later fixtures or authored content', () => {
  const originalInstrument = structuredClone(instrument);
  const originalCases = structuredClone(pilotCases);
  const originalFixture = createPilotFixture('RP01');
  const fixture = createPilotFixture('RP01');
  fixture.case.title.en = 'Changed outside the fixture module';
  fixture.case.taskIds.push('T99');
  fixture.session.answers['scenario:housing-urgent'].preference.optionId = 'sell';
  fixture.report.themes[0].statements[0].text = 'Changed report wording';
  fixture.interpretation.insights[0].evidenceIds.push('unknown');
  assert.deepEqual(createPilotFixture('RP01'), originalFixture);
  assert.deepEqual(instrument, originalInstrument);
  assert.deepEqual(pilotCases, originalCases);
  assert.throws(() => { pilotCases[0].title.en = 'Change exported metadata'; }, TypeError);
});

test('unknown case IDs cannot substitute a participant save or arbitrary response object', () => {
  for (const id of [undefined, null, '', 'RP00', 'RP07', 'rp01', {}, { id: 'RP01', session: {} }]) {
    assert.throws(() => createPilotFixture(id), /Unknown synthetic pilot case/);
  }
});
