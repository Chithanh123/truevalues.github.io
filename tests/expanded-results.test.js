import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildExpandedResult, renderExpandedResults, createExpandedTextReport } from '../js/expanded-results.js';

const catalog = JSON.parse(await readFile(new URL('../data/question-catalog.json', import.meta.url), 'utf8'));
const session = answers => ({ schemaVersion: 1, catalogVersion: catalog.catalogVersion, index: 60, answers });

test('paired readings require both actual agreements, never a neutral, uncertain, skipped or missing answer', () => {
  for (const value of ['neutral', 'uncertain', 'skip', 'disagree', 'strongly_disagree', undefined]) {
    const model = buildExpandedResult(catalog, session({'CR-19A':'agree', 'CR-19B':value}));
    assert.equal(model.findings.some(f => f.title === 'Joint work and returns to investment'), false, String(value));
  }
  const model = buildExpandedResult(catalog, session({'CR-19A':'strongly_agree', 'CR-19B':'agree', 'CR-24A':'agree', 'CR-24B':'strongly_agree'}));
  assert.deepEqual(model.findings.map(f => f.title), ['Joint work and returns to investment', 'Cooperation alongside security concerns']);
  assert.deepEqual(model.findings[0].evidence.map(e => [e.id,e.response]), [['CR-19A','Strongly agree'],['CR-19B','Agree']]);
  assert.match(model.findings[0].text, /do not decide the size/);
});

test('coverage keeps disagreement, neutrality, uncertainty, skips and missing distinct without calculating a score', () => {
  const model = buildExpandedResult(catalog, session({'CR-20A':'agree', 'CR-20B':'disagree', 'CR-20C':'neutral', 'CR-20D':'uncertain', 'CR-21A':'skip'}));
  const theme = model.themes.find(t => t.id === 'CR-20');
  assert.deepEqual(theme.counts, {agreed:1, disagreed:1, neutral:1, uncertain:1, skipped:0, missing:0});
  assert.match(theme.meaning, /not by itself a contradiction/);
  assert.equal(model.statementCounts.skipped, 1);
  assert.equal(model.statementCounts.missing, 43);
  assert.equal('score' in model, false);
});

test('only explicit scenario actions and preferences support a comparison, and selected tradeoffs remain visible', () => {
  const base = {'CR-S13':{choice:'A', reason:'Other reason', preference:'C'}};
  const theme = buildExpandedResult(catalog, session(base)).themes.find(t => t.id === 'CR-19');
  assert.match(theme.scenario.comparison, /different packages/);
  assert.match(theme.scenario.choice.tradeoff, /No additional income/);
  assert.equal(theme.scenario.reason, 'Other reason');
  const partial = buildExpandedResult(catalog, session({'CR-S13':{choice:'none', reason:null, preference:'C'}})).themes.find(t => t.id === 'CR-19').scenario;
  assert.equal(partial.choice, null);
  assert.equal(partial.choiceStatus, 'None of these represents my decision');
  assert.equal(partial.comparison, null);
  assert.ok(partial.preferenceStatus);
});

test('HTML escapes authored and answer text, while text export retains all 60 records and limits', () => {
  const copy = structuredClone(catalog);
  copy.items.find(i => i.id === 'CR-19A').texts.en.text = '<img src=x onerror=alert(1)>';
  const answers = {'CR-19A':'agree', 'CR-19B':'agree', 'CR-S13':{choice:'A', reason:'<script>bad()</script>', preference:'B'}};
  const html = renderExpandedResults(copy, session(answers));
  assert.match(html, /aria-labelledby="expanded-readings-title"/);
  assert.match(html, /id="expanded-readings-title"/);
  assert.doesNotMatch(html, /id="expanded-results-title"/);
  assert.ok(!html.includes('<img src=x'));
  assert.ok(!html.includes('<script>bad()'));
  assert.match(html, /&lt;img src=x/);
  assert.match(html, /&lt;script&gt;bad\(\)&lt;\/script&gt;/);
  const report = createExpandedTextReport(catalog, session(answers));
  for (let n=13; n<=24; n++) {
    for (const suffix of 'ABCD') assert.match(report, new RegExp(`CR-${n}${suffix} —`));
    assert.match(report, new RegExp(`CR-S${String(n-6).padStart(2,'0')} —`));
  }
  assert.match(report, /not validated scores, ideology labels or diagnoses/);
  assert.match(report, /does not establish why/);
});

test('a fully answered example covers each of the twelve areas and all paired evidence references', () => {
  const answers = {};
  for (let n=13; n<=24; n++) {
    for (const suffix of 'ABCD') answers[`CR-${n}${suffix}`] = 'agree';
    answers[`CR-S${String(n-6).padStart(2,'0')}`] = {choice:'skip', reason:null, preference:null};
  }
  const model = buildExpandedResult(catalog, session(answers));
  assert.equal(model.themes.length, 12);
  assert.equal(model.findings.length, 12);
  assert.equal(model.statementCounts.agreed, 48);
  assert.equal(model.situationCounts.skipped, 12);
  const recorded = new Set(model.themes.flatMap(t => t.statements.map(s => s.id)));
  for (const finding of model.findings) {
    assert.equal(finding.evidence.length, 2);
    for (const evidence of finding.evidence) {
      assert.ok(recorded.has(evidence.id));
      assert.ok(evidence.text);
      assert.equal(evidence.response, 'Agree');
    }
  }
});
