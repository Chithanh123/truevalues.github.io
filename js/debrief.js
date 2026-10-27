/**
 * A descriptive view of a completed assessment, separate from its score summary.
 * Theme links are author choices. They do not establish a scale, an ideological
 * identity, or an explanation of why a participant chose an action.
 */
import { validateSession } from './engine.js';
import { debriefThemes, debriefVersion } from './debrief-content.js';
import { interpretDebrief } from './interpretation.js';

const agreementLabels = {
  2: 'Strongly agree', 1: 'Agree', 0: 'Neither agree nor disagree',
  '-1': 'Disagree', '-2': 'Strongly disagree',
};
const responseLabels = {
  uncertain: 'Uncertain', skip: 'Skipped', none: 'None of the offered choices',
  unanswered: 'Not answered',
};

function statementEvidence(item, answer) {
  const status = answer?.kind ?? 'unanswered';
  return {
    id: item.id,
    text: item.text,
    responseLabel: status === 'value' ? agreementLabels[answer.value] : responseLabels[status],
    status,
    value: status === 'value' ? answer.value : null,
  };
}

function scenarioEvidence(item, answer, world) {
  const status = answer?.kind ?? 'unanswered';
  const option = status === 'choice' ? item.options.find(value => value.id === answer.optionId) : null;
  const reason = answer?.reasonId ? item.reasons.find(value => value.id === answer.reasonId) : null;
  const preference = answer?.preference;
  const preferenceStatus = preference?.kind ?? 'not-provided';
  const preferredOption = preferenceStatus === 'choice'
    ? item.options.find(value => value.id === preference.optionId) : null;
  const preferenceLabel = preferredOption?.label
    ?? ({ uncertain: 'Uncertain', none: 'None of the offered packages' }[preferenceStatus])
    ?? 'Not provided (optional)';
  return {
    id: item.id,
    title: item.title,
    roleLabel: item.roleLabel,
    setting: item.setting,
    briefing: item.briefing,
    facts: item.facts.map(fact => ({ ...fact })),
    institutionalContext: world.scenarioNotes?.[item.id] ?? item.worldNotes?.[world.id] ?? '',
    authority: item.authority,
    status,
    actionLabel: option?.label ?? responseLabels[status],
    actionDescription: option?.description ?? null,
    actionTradeoff: option?.tradeoff ?? null,
    optionId: option?.id ?? null,
    reasonId: reason?.id ?? null,
    reasonLabel: reason?.label ?? 'No reason selected',
    preferenceLabel,
    preferenceStatus,
    preferenceOptionId: preferredOption?.id ?? null,
    comparisonOf: item.comparisonOf ?? null,
    descriptive: item.scoring === 'descriptive',
  };
}

function coverage(rows, scenario = false) {
  const counts = { total: rows.length, answered: 0, uncertain: 0, skipped: 0, unanswered: 0 };
  if (scenario) counts.unrepresented = 0;
  for (const row of rows) {
    if (row.status === 'value' || row.status === 'choice') counts.answered += 1;
    else if (row.status === 'uncertain') counts.uncertain += 1;
    else if (row.status === 'skip') counts.skipped += 1;
    else if (row.status === 'none' && scenario) counts.unrepresented += 1;
    else counts.unanswered += 1;
  }
  return counts;
}

function preferenceCoverage(scenarios) {
  // An explicit uncertainty or unrepresented preference is provided, but it is
  // not an option choice. Absence is never treated as agreement with the action.
  const counts = { total: scenarios.length, provided: 0, choices: 0, uncertain: 0, unrepresented: 0, unanswered: 0 };
  for (const scene of scenarios) {
    if (scene.preferenceStatus === 'choice') counts.choices += 1;
    else if (scene.preferenceStatus === 'uncertain') counts.uncertain += 1;
    else if (scene.preferenceStatus === 'none') counts.unrepresented += 1;
    else counts.unanswered += 1;
  }
  counts.provided = counts.choices + counts.uncertain + counts.unrepresented;
  return counts;
}

function overview(statements, foundations, scenarios) {
  return {
    values: coverage(statements),
    foundations: coverage(foundations),
    scenarios: coverage(scenarios, true),
    preferences: preferenceCoverage(scenarios),
  };
}

function checkThemes(themes, maps) {
  if (!Array.isArray(themes) || !themes.length) throw new Error('A non-empty debrief theme map is required.');
  const themeIds = new Set();
  const covered = Object.fromEntries(Object.keys(maps).map(key => [key, new Set()]));
  for (const theme of themes) {
    if (!theme || ['id', 'title', 'question', 'readingNote', 'reflectionPrompt']
      .some(key => typeof theme[key] !== 'string' || !theme[key].trim())) {
      throw new Error('Each debrief theme needs an ID and complete explanatory text.');
    }
    if (themeIds.has(theme.id)) throw new Error(`Duplicate debrief theme: ${theme.id}.`);
    themeIds.add(theme.id);
    let linked = 0;
    for (const [key, map] of Object.entries(maps)) {
      const ids = theme[key];
      if (!Array.isArray(ids) || new Set(ids).size !== ids.length) {
        throw new Error(`Invalid or duplicate ${key} in debrief theme ${theme.id}.`);
      }
      for (const id of ids) {
        if (!map.has(id)) throw new Error(`Unknown ${key} reference in debrief theme ${theme.id}.`);
        if (covered[key].has(id)) throw new Error(`A ${key} item appears in multiple debrief themes: ${id}.`);
        covered[key].add(id);
      }
      linked += ids.length;
    }
    if (!linked) throw new Error(`Debrief theme ${theme.id} has no linked items.`);
  }
  for (const [key, map] of Object.entries(maps)) {
    if (covered[key].size !== map.size) throw new Error(`The debrief does not cover every ${key} item.`);
  }
}

/**
 * Return fresh plain-data records for a valid completed session only.
 * `answered` counts a definite agreement value (including neutral) or action;
 * uncertainty, skipped and unrepresented records remain separate. Theme counts
 * are descriptive coverage, never score denominators or measurement precision.
 */
export function buildDebrief(instrument, session, themes = debriefThemes) {
  if (!session?.completed) throw new Error('Complete the assessment before opening a personal debrief.');
  const validation = validateSession(instrument, session);
  if (!validation.valid) throw new Error(`Cannot create a debrief from an invalid session: ${validation.error}`);
  const assignedWorld = instrument.worlds.find(world => world.id === session.worldId);
  const statements = instrument.statements.map(item => statementEvidence(item, session.answers[`statement:${item.id}`]));
  const foundations = (instrument.foundations?.items ?? [])
    .map(item => statementEvidence(item, session.answers[`foundation:${item.id}`]));
  const scenarios = instrument.scenarios.map(item => scenarioEvidence(item, session.answers[`scenario:${item.id}`], assignedWorld));
  const maps = {
    statementIds: new Map(statements.map(item => [item.id, item])),
    foundationIds: new Map(foundations.map(item => [item.id, item])),
    scenarioIds: new Map(scenarios.map(item => [item.id, item])),
  };
  checkThemes(themes, maps);
  const comparisons = instrument.scenarios.filter(scene => scene.comparisonOf).map(scene => {
    const original = maps.scenarioIds.get(scene.comparisonOf);
    const comparison = maps.scenarioIds.get(scene.id);
    return {
      scenarioId: scene.id,
      originalId: scene.comparisonOf,
      originalTitle: original.title,
      comparisonTitle: comparison.title,
      changedCondition: scene.changedCondition,
      originalActionLabel: original.actionLabel,
      comparisonActionLabel: comparison.actionLabel,
      changed: original.optionId && comparison.optionId ? original.optionId !== comparison.optionId : null,
      interpretationNote: 'The fixed order and repeated dilemma do not establish why an answer changed or identify a general trait.',
    };
  });
  return {
    version: debriefVersion,
    instrumentVersion: instrument.version,
    world: { id: assignedWorld.id, name: assignedWorld.name, inspiration: assignedWorld.inspiration },
    responseOverview: overview(statements, foundations, scenarios),
    themes: themes.map(theme => {
      const values = theme.statementIds.map(id => ({ ...maps.statementIds.get(id) }));
      const premises = theme.foundationIds.map(id => ({ ...maps.foundationIds.get(id) }));
      const decisions = theme.scenarioIds.map(id => ({ ...maps.scenarioIds.get(id) }));
      return {
        id: theme.id, title: theme.title, question: theme.question,
        readingNote: theme.readingNote, reflectionPrompt: theme.reflectionPrompt,
        statementIds: [...theme.statementIds], foundationIds: [...theme.foundationIds], scenarioIds: [...theme.scenarioIds],
        statements: values, foundations: premises, scenarios: decisions,
        coverage: overview(values, premises, decisions),
      };
    }),
    comparisons,
  };
}

function coverageLine(label, counts) {
  const bits = [`${counts.answered}/${counts.total} definite responses`, `${counts.uncertain} uncertain`, `${counts.skipped} skipped`];
  if (Object.hasOwn(counts, 'unrepresented')) bits.push(`${counts.unrepresented} none of the offered choices`);
  if (counts.unanswered) bits.push(`${counts.unanswered} unanswered`);
  return `${label}: ${bits.join('; ')}.`;
}

/** Plain text is suitable for a local download or copy; it contains no markup. */
export function createTextReport(instrument, session) {
  const report = buildDebrief(instrument, session);
  const interpretation = interpretDebrief(instrument, report);
  const lines = [
    'Political Context — your personal reflection',
    `Assessment version: ${report.instrumentVersion}. Reflection format: ${report.version}. Interpretation rules: ${interpretation.version}.`,
    '',
    'This report interprets patterns in your answers and retains the recorded responses behind them. The themes do not calculate scores, rank traditions, or identify a political ideology.',
    'A shared theme does not establish that one answer explains another. Only reasons you selected are recorded as your reasons.',
    '',
    'What your answers suggest',
    interpretation.overview.title,
    interpretation.overview.summary,
    ...interpretation.insights.flatMap(insight => ['', insight.title, insight.text,
      `Supporting response IDs: ${insight.evidenceIds.join(', ') || 'Response coverage only'}.`]),
    '',
    'Your setting, revealed after completion',
    report.world.name,
    report.world.inspiration,
    'This is a fictional setting with invented events and permissions, not a description of a country or its people.',
    '',
    'Your response coverage',
    coverageLine('Value statements', report.responseOverview.values),
    coverageLine('Starting assumptions', report.responseOverview.foundations),
    coverageLine('Situations', report.responseOverview.scenarios),
    `Optional personal preferences: ${report.responseOverview.preferences.provided}/${report.responseOverview.preferences.total} provided; ${report.responseOverview.preferences.choices} option choices, ${report.responseOverview.preferences.uncertain} uncertain, ${report.responseOverview.preferences.unrepresented} none of the offered packages, ${report.responseOverview.preferences.unanswered} not provided.`,
    'Coverage counts describe available responses; they are not confidence levels or measures of accuracy.',
  ];
  for (const theme of report.themes) {
    const meaning = interpretation.themes.find(item => item.id === theme.id);
    lines.push('', '— ' + theme.title + ' —', theme.question, '',
      'Interpretation: ' + meaning.headline, meaning.meaning, meaning.evidenceNote);
    for (const connection of meaning.connections) lines.push('', connection.title, connection.text,
      `Supporting response IDs: ${connection.evidenceIds.join(', ')}.`);
    if (meaning.premises.length) lines.push('', 'What your starting assumptions indicate');
    for (const premise of meaning.premises) lines.push(premise.meaning);
    if (meaning.decisions.length) lines.push('', 'What your decisions put into practice');
    for (const decision of meaning.decisions) lines.push(`${decision.title}: ${decision.meaning}`);
    lines.push('', 'Limits of this interpretation: ' + meaning.limit, '', 'Your supporting responses');
    for (const [heading, rows] of [['Value statements', theme.statements], ['Starting assumptions', theme.foundations]]) {
      if (!rows.length) continue;
      lines.push('', heading);
      for (const row of rows) lines.push(`[${row.id}] ${row.text}`, `Your recorded response: ${row.responseLabel}`, '');
    }
    if (theme.scenarios.length) {
      lines.push('Situations');
      for (const scene of theme.scenarios) {
        lines.push(`[${scene.id}] ${scene.title}`, `Assigned role: ${scene.roleLabel}. Setting: ${scene.setting}.`,
          scene.briefing, `Responsibility: ${scene.authority}`);
        if (scene.institutionalContext) lines.push(`In your assigned setting: ${scene.institutionalContext}`);
        for (const fact of scene.facts) lines.push(`${fact.label}: ${fact.text}`);
        lines.push(`Your action in this role: ${scene.actionLabel}`);
        if (scene.actionDescription) lines.push(`Chosen package: ${scene.actionDescription}`, `Tradeoff: ${scene.actionTradeoff}`);
        lines.push(`Your selected reason: ${scene.reasonLabel}`, `Your personal preference: ${scene.preferenceLabel}`);
        if (scene.descriptive) lines.push('This exploratory exercise is excluded from the existing profile markers.');
        if (scene.comparisonOf) lines.push('This repeated comparison is excluded from the existing profile markers.');
        lines.push('');
      }
    } else {
      lines.push('', 'No dedicated situation is linked to this theme in the current assessment.');
    }
    lines.push('Question for reflection: ' + theme.reflectionPrompt);
  }
  lines.push('', 'When a condition changed');
  for (const comparison of report.comparisons) {
    lines.push(comparison.changedCondition,
      `First version: ${comparison.originalActionLabel}`,
      `Changed version: ${comparison.comparisonActionLabel}`,
      comparison.changed === null ? 'There is not enough information to compare two actions.'
        : comparison.changed ? 'You chose a different action in the second version.' : 'You chose the same action in both versions.',
      comparison.interpretationNote, '');
  }
  lines.push('About this report',
    'The existing experimental profile markers remain available separately in the on-screen debrief and original JSON response export. This readable report adds no new scores and does not alter your recorded answers.',
    'Uncertain, skipped and unrepresented responses remain distinct. A missing optional preference is not agreement with the chosen role action.',
    'This file is created on your device. Downloading it does not send your answers to a study. Files already downloaded are not removed by erasing browser answers.', '');
  return lines.join('\n');
}
