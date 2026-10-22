#!/usr/bin/env node
/** Mechanical checks for authored Vietnamese review drafts, not translation approval. */
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const record = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const numericTokens = value => (typeof value === 'string' ? value.match(/\d+(?:[.,]\d+)?/g) ?? [] : []).sort();
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);

export function validateTranslations(english, items, worlds, foundations) {
  const errors = [];
  const fail = message => errors.push(message);
  const keys = (value, expected, at) => {
    if (!record(value)) { fail(`${at} must be an object.`); return false; }
    const actual = Object.keys(value).sort();
    if (!same(actual, [...expected].sort())) fail(`${at} must contain exactly: ${expected.join(', ')}.`);
    return true;
  };
  const text = (translated, original, at) => {
    if (typeof translated !== 'string' || !translated.trim()) {
      fail(`${at} must be non-empty Vietnamese text.`);
      return;
    }
    if (!same(numericTokens(translated), numericTokens(original))) {
      fail(`${at} changes the source's numeric tokens.`);
    }
  };
  const fields = (translated, original, names, at) => {
    if (!record(translated)) { fail(`${at} must be an object.`); return; }
    for (const field of names) text(translated[field], original[field], `${at}.${field}`);
  };
  const pairs = (translated, original, names, at) => {
    if (!Array.isArray(translated) || translated.length !== original.length) {
      fail(`${at} must preserve the source array length.`);
      return;
    }
    original.forEach((source, index) => {
      const target = translated[index];
      if (!keys(target, source.id ? ['id', ...names] : names, `${at}[${index}]`)) return;
      if (source.id && target.id !== source.id) fail(`${at}[${index}] must preserve option/reason ID and order.`);
      fields(target, source, names, `${at}[${index}]`);
    });
  };

  if (!record(english) || !['dimensions', 'roles', 'statements', 'scenarios', 'worlds'].every(key => Array.isArray(english[key]))) {
    return ['The English instrument must define dimensions, roles, statements, scenarios, and worlds.'];
  }
  if (!keys(items, ['version', 'reviewStatus', 'dimensions', 'roles', 'statements', 'scenarios'], 'viItems')
    || !keys(worlds, ['version', 'reviewStatus', 'worlds'], 'viWorlds')) return errors;
  for (const [at, draft] of [['viItems', items], ['viWorlds', worlds]]) {
    if (draft.version !== english.version) fail(`${at}.version must match the English instrument.`);
    if (draft.reviewStatus !== 'draft') fail(`${at}.reviewStatus must remain draft until a reviewed release is authorized.`);
  }

  for (const [category, names] of [
    ['dimensions', ['label', 'left', 'right', 'description']],
    ['roles', ['label']],
    ['statements', ['text']],
  ]) {
    if (!keys(items[category], english[category].map(item => item.id), `viItems.${category}`)) continue;
    for (const source of english[category]) {
      const target = items[category][source.id];
      keys(target, names, `viItems.${category}.${source.id}`);
      fields(target, source, names, `viItems.${category}.${source.id}`);
    }
  }
  if (keys(items.scenarios, english.scenarios.map(item => item.id), 'viItems.scenarios')) {
    for (const source of english.scenarios) {
      const at = `viItems.scenarios.${source.id}`;
      const target = items.scenarios[source.id];
      if (!keys(target, ['title', 'roleLabel', 'setting', 'briefing', 'authority', 'facts', 'prompt', 'options', 'reasons', 'changedCondition'], at)) continue;
      fields(target, source, ['title', 'roleLabel', 'setting', 'briefing', 'authority', 'prompt'], at);
      pairs(target.facts, source.facts, ['label', 'text'], `${at}.facts`);
      pairs(target.options, source.options, ['label', 'description', 'tradeoff'], `${at}.options`);
      pairs(target.reasons, source.reasons, ['label'], `${at}.reasons`);
      if (source.changedCondition === null) {
        if (target.changedCondition !== null) fail(`${at}.changedCondition must preserve null for a main case.`);
      } else text(target.changedCondition, source.changedCondition, `${at}.changedCondition`);
    }
  }
  if (keys(worlds.worlds, english.worlds.map(world => world.id), 'viWorlds.worlds')) {
    for (const source of english.worlds) {
      const at = `viWorlds.worlds.${source.id}`;
      const target = worlds.worlds[source.id];
      if (!keys(target, ['name', 'code', 'inspiration', 'summary', 'institutions', 'scenarioNotes'], at)) continue;
      fields(target, source, ['name', 'inspiration', 'summary'], at);
      if (target.code !== source.code) fail(`${at}.code must preserve the original setting code.`);
      pairs(target.institutions, source.institutions, ['label', 'text'], `${at}.institutions`);
      if (keys(target.scenarioNotes, english.scenarios.map(scene => scene.id), `${at}.scenarioNotes`)) {
        for (const scene of english.scenarios) text(target.scenarioNotes[scene.id], source.scenarioNotes[scene.id], `${at}.scenarioNotes.${scene.id}`);
      }
    }
  }

  if (own(english, 'foundations')) {
    const source = english.foundations;
    if (!record(source) || !['aims', 'categories', 'lenses', 'items'].every(key => Array.isArray(source[key]))) {
      fail('The English foundation framework must define aims, categories, lenses, and items.');
    } else if (keys(foundations, ['version', 'reviewStatus', 'aims', 'categories', 'lenses', 'items'], 'viFoundations')) {
      if (foundations.version !== english.version) fail('viFoundations.version must match the English instrument.');
      if (foundations.reviewStatus !== 'draft') fail('viFoundations.reviewStatus must remain draft until a reviewed release is authorized.');
      if (!Array.isArray(foundations.aims) || foundations.aims.length !== source.aims.length) {
        fail('viFoundations.aims must preserve the source array length.');
      } else {
        source.aims.forEach((aim, index) => text(foundations.aims[index], aim, `viFoundations.aims[${index}]`));
      }
      for (const [category, names] of [
        ['categories', ['label', 'description']],
        ['lenses', ['label', 'description', 'cautions']],
        ['items', ['text', 'rationale']],
      ]) {
        const at = `viFoundations.${category}`;
        if (!keys(foundations[category], source[category].map(entry => entry.id), at)) continue;
        for (const original of source[category]) {
          const translated = foundations[category][original.id];
          if (!keys(translated, names, `${at}.${original.id}`)) continue;
          fields(translated, original, names, `${at}.${original.id}`);
        }
      }
    }
  } else if (foundations !== undefined) {
    fail('A foundation translation was supplied without an English foundation framework.');
  }

  for (const comparison of english.scenarios.filter(scene => scene.comparisonOf)) {
    const original = english.scenarios.find(scene => scene.id === comparison.comparisonOf);
    const first = items.scenarios?.[original?.id];
    const second = items.scenarios?.[comparison.id];
    if (!original || !record(first) || !record(second)) continue;
    for (const field of ['options', 'reasons', 'authority', 'roleLabel']) {
      if (!same(first[field], second[field])) fail(`Comparison ${comparison.id} changes translated ${field}.`);
    }
    if (Array.isArray(first.facts) && Array.isArray(second.facts)) {
      original.facts.forEach((fact, index) => {
        if (same(fact, comparison.facts[index]) && !same(first.facts[index], second.facts[index])) {
          fail(`Comparison ${comparison.id} changes an unchanged translated fact at ${index}.`);
        }
      });
    }
    for (const source of english.worlds) {
      const notes = worlds.worlds?.[source.id]?.scenarioNotes;
      if (record(notes) && !same(notes[original.id], notes[comparison.id])) {
        fail(`Comparison ${comparison.id} changes translated institutional context for ${source.id}.`);
      }
    }
  }
  return errors;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    const [{ instrument }, { viItems }, { viWorlds }, { viFoundations }] = await Promise.all([
      import('../js/content.js'), import('../js/translations/vi-items.js'), import('../js/translations/vi-worlds.js'), import('../js/translations/vi-foundations.js'),
    ]);
    const errors = validateTranslations(instrument, viItems, viWorlds, viFoundations);
    const report = {
      instrumentId: instrument.id, version: instrument.version,
      reviewStatus: 'draft', valid: errors.length === 0,
      translated: { statements: Object.keys(viItems.statements ?? {}).length, foundationItems: Object.keys(viFoundations.items ?? {}).length, researchLenses: Object.keys(viFoundations.lenses ?? {}).length, scenarios: Object.keys(viItems.scenarios ?? {}).length, worlds: Object.keys(viWorlds.worlds ?? {}).length },
      errors,
      limitation: 'Structural, numeric-token, and paired-case checks do not establish linguistic or measurement equivalence. Independent bilingual review and cognitive interviews remain pending.',
    };
    if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
    else {
      console.log(`Political Context ${instrument.version} — Vietnamese translation-draft checks`);
      console.table([report.translated]);
      if (errors.length) { console.error(`FAIL: ${errors.length} issue(s).`); for (const error of errors) console.error(`- ${error}`); }
      else console.log('PASS: authored coverage, IDs, numeric tokens, and comparison invariants.');
      console.log(report.limitation);
    }
    if (errors.length) process.exitCode = 1;
  } catch (error) {
    console.error(`Translation validation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
