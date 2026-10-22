import test from 'node:test';
import assert from 'node:assert/strict';
import { instrument } from '../js/content.js';
import { viItems } from '../js/translations/vi-items.js';
import { viWorlds } from '../js/translations/vi-worlds.js';
import { validateTranslations } from '../scripts/validate-translations.js';

const copyDrafts = () => ({ items: structuredClone(viItems), worlds: structuredClone(viWorlds) });
const errorsFor = ({ items, worlds }) => validateTranslations(instrument, items, worlds);

test('the bilingual review draft covers the current authored instrument without changing identities or figures', () => {
  assert.deepEqual(validateTranslations(instrument, viItems, viWorlds), []);
  assert.equal(Object.keys(viItems.statements).length, 24);
  assert.equal(Object.keys(viItems.scenarios).length, 9);
  assert.equal(Object.keys(viWorlds.worlds).length, 8);
  assert.equal(viItems.reviewStatus, 'draft');
  assert.equal(viWorlds.reviewStatus, 'draft');
});

test('translation checks detect missing, foreign, and reordered response identities', () => {
  const cases = [
    draft => { delete draft.items.statements[instrument.statements[0].id]; },
    draft => { draft.items.statements['not-a-source-item'] = { text: 'Nội dung khác' }; },
    draft => { draft.items.scenarios['public-assembly'].options[0].id = 'foreign-option'; },
    draft => { draft.items.scenarios['public-assembly'].reasons.reverse(); },
    draft => { delete draft.worlds.worlds.mbala.scenarioNotes['public-records']; },
    draft => { draft.worlds.worlds.mbala.scenarioNotes['foreign-case'] = 'Bối cảnh khác'; },
  ];
  for (const mutate of cases) {
    const draft = copyDrafts();
    mutate(draft);
    assert.ok(errorsFor(draft).length > 0);
  }
});

test('translation checks protect quantities without interpreting political or linguistic validity', () => {
  const draft = copyDrafts();
  const option = draft.items.scenarios['housing-urgent'].options.find(option => option.id === 'sell');
  assert.match(option.description, /240/);
  option.description = option.description.replace('240', '241');
  assert.ok(errorsFor(draft).some(message => /numeric tokens/.test(message)));
  const blank = copyDrafts();
  blank.items.statements[instrument.statements[0].id].text = '   ';
  assert.ok(errorsFor(blank).some(message => /non-empty/.test(message)));
});

test('translation metadata cannot silently use an older instrument or claim completed review', () => {
  for (const mutate of [
    draft => { draft.items.version = '0.2.0'; },
    draft => { draft.worlds.version = '0.2.0'; },
    draft => { draft.items.reviewStatus = 'validated'; },
    draft => { draft.worlds.reviewStatus = 'human-reviewed'; },
    draft => { draft.worlds.worlds.linden.code = 'Other'; },
    draft => { draft.items.scenarios['public-records'].options[0].score = -2; },
  ]) {
    const draft = copyDrafts();
    mutate(draft);
    assert.ok(errorsFor(draft).length > 0);
  }
});

test('the translated housing contrast preserves the shared action, authority, and context wording', () => {
  const cases = [
    draft => { draft.items.scenarios['housing-planned'].options[0].label += ' khác'; },
    draft => { draft.items.scenarios['housing-planned'].authority += ' khác'; },
    draft => { draft.items.scenarios['housing-planned'].reasons[0].label += ' khác'; },
    draft => { draft.items.scenarios['housing-planned'].facts[0].text += ' khác'; },
    draft => { draft.worlds.worlds.hoshima.scenarioNotes['housing-planned'] += ' khác'; },
  ];
  for (const mutate of cases) {
    const draft = copyDrafts();
    // The authored pair intentionally shares arrays. Detach the comparison to
    // simulate an accidental edit to one serialized translation only.
    draft.items.scenarios['housing-planned'] = structuredClone(draft.items.scenarios['housing-planned']);
    mutate(draft);
    assert.ok(errorsFor(draft).some(message => /Comparison housing-planned/.test(message)));
  }
});
