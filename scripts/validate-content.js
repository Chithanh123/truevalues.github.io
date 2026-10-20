#!/usr/bin/env node
/** Check the authored content matrix without installing browser dependencies. */
import { instrument } from '../js/content.js';
import { validateInstrument } from '../js/engine.js';

const list = value => Array.isArray(value) ? value : [];
const statements = list(instrument.statements);
const worlds = list(instrument.worlds);
const scenarios = list(instrument.scenarios);
const dimensions = list(instrument.dimensions);
const main = scenarios.filter(scene => !scene.comparisonOf);
const comparisons = scenarios.filter(scene => scene.comparisonOf);
const directionalMain = main.filter(scene => scene.scoring !== 'descriptive');
const descriptiveMain = main.filter(scene => scene.scoring === 'descriptive');
const requiredWorlds = ['linden', 'alder', 'mere', 'hoshima', 'namoa', 'anbinh', 'suryan', 'mbala'];
const requiredRoles = ['constituent', 'local_leader', 'civil_society', 'public_servant', 'national_leader'];
const roles = [...new Set(main.map(scene => scene.role))].sort();
const localities = [...new Set(main.map(scene => scene.locality))].sort();
const errors = validateInstrument(instrument);
const requireCount = (label, actual, expected) => {
  if (actual !== expected) errors.push(`${label}: expected ${expected}, found ${actual}.`);
};

requireCount('Worlds', worlds.length, 8);
requireCount('Statements', statements.length, 24);
requireCount('Main scenarios', main.length, 8);
requireCount('Directional main scenarios', directionalMain.length, 7);
requireCount('Descriptive main scenarios', descriptiveMain.length, 1);
requireCount('Comparison scenarios', comparisons.length, 1);
for (const id of requiredWorlds) {
  if (!worlds.some(world => world.id === id)) errors.push(`Required setting ${id} is missing.`);
}
for (const role of requiredRoles) {
  if (!roles.includes(role)) errors.push(`No main scenario covers role ${role}.`);
}
if (roles.some(role => !requiredRoles.includes(role))) {
  errors.push('Main scenarios contain a role outside the five-role design.');
}
for (const locality of ['urban', 'rural']) {
  if (!localities.includes(locality)) errors.push(`No main scenario covers locality ${locality}.`);
}

const domainCoverage = dimensions.map(dimension => {
  const row = {
    domain: dimension.id,
    statements: statements.filter(item => item.dimension === dimension.id).length,
    mainScenarios: main.filter(scene => scene.dimension === dimension.id).length,
    directionalMainScenarios: directionalMain.filter(scene => scene.dimension === dimension.id).length,
    descriptiveMainScenarios: descriptiveMain.filter(scene => scene.dimension === dimension.id).length,
    comparisons: comparisons.filter(scene => scene.dimension === dimension.id).length,
  };
  requireCount(`Statements in ${dimension.id}`, row.statements, 6);
  requireCount(`Main scenarios in ${dimension.id}`, row.mainScenarios, 2);
  requireCount(`Directional main scenarios in ${dimension.id}`, row.directionalMainScenarios, dimension.id === 'civil' ? 1 : 2);
  return row;
});

const roleCoverage = roles.map(role => ({
  role,
  mainScenarios: main.filter(scene => scene.role === role).length,
  localities: [...new Set(main.filter(scene => scene.role === role).map(scene => scene.locality))].join(', '),
}));
const worldCoverage = worlds.map(world => {
  const covered = scenarios.filter(scene =>
    typeof world.scenarioNotes?.[scene.id] === 'string'
    && world.scenarioNotes[scene.id].trim().length > 0,
  ).length;
  if (covered !== scenarios.length) {
    errors.push(`Setting ${world.id} has context notes for ${covered}/${scenarios.length} scenarios.`);
  }
  return {
    setting: world.id,
    name: world.name ?? '(missing name)',
    scenarioContexts: covered,
    requiredContexts: scenarios.length,
  };
});

const report = {
  instrument: instrument.id,
  version: instrument.version,
  valid: errors.length === 0,
  counts: {
    worlds: worlds.length,
    roles: roles.length,
    localities: localities.length,
    statements: statements.length,
    mainScenarios: main.length,
    directionalMainScenarios: directionalMain.length,
    descriptiveMainScenarios: descriptiveMain.length,
    comparisons: comparisons.length,
  },
  domainCoverage,
  roleCoverage,
  worldCoverage,
  errors,
  interpretation: 'Checks authored structural coverage, including unscored descriptive scenes; does not establish cultural accuracy or measurement validity.',
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Political Context ${instrument.version} — content coverage`);
  console.table([report.counts]);
  console.log('Domains');
  console.table(domainCoverage);
  console.log('Roles');
  console.table(roleCoverage);
  console.log('Settings and authored scenario contexts');
  console.table(worldCoverage);
  if (errors.length) {
    console.error(`FAIL: ${errors.length} content issue${errors.length === 1 ? '' : 's'}.`);
    for (const error of errors) console.error(`- ${error}`);
  } else {
    console.log('PASS: all declared content and coverage checks.');
  }
  console.log(report.interpretation);
}
if (errors.length) process.exitCode = 1;
