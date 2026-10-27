/**
 * Rule-based readings of a completed descriptive report. Counts are displayed
 * evidence, not a new scale. No reason, ideology, or cause is inferred.
 */
import { interpretationThemes, premiseMeanings, decisionMeanings } from './interpretation-content.js';

export const interpretationVersion = '1.0.0';

function requireText(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing interpretation wording: ${label}.`);
}

function checkInputs(instrument, report) {
  if (!report || report.instrumentVersion !== instrument.version || !Array.isArray(report.themes) || !report.themes.length) {
    throw new Error('Interpretation requires a compatible completed debrief report.');
  }
  const source = {
    statements: new Map(instrument.statements.map(item => [item.id, item])),
    foundations: new Map(instrument.foundations.items.map(item => [item.id, item])),
    scenarios: new Map(instrument.scenarios.map(item => [item.id, item])),
  };
  const seen = { statements: new Set(), foundations: new Set(), scenarios: new Set() };
  const themeIds = new Set();
  for (const theme of report.themes) {
    if (themeIds.has(theme.id)) throw new Error(`Duplicate interpretation theme: ${theme.id}.`);
    themeIds.add(theme.id);
    const wording = interpretationThemes[theme.id];
    if (!wording) throw new Error(`Missing interpretation theme: ${theme.id}.`);
    requireText(wording.question, theme.id);
    for (const [key, items] of Object.entries(source)) {
      if (!Array.isArray(theme[key])) throw new Error(`Missing ${key} evidence in interpretation theme ${theme.id}.`);
      for (const row of theme[key]) {
        if (!items.has(row.id) || seen[key].has(row.id)) throw new Error(`Unknown or duplicate interpretation evidence: ${row.id}.`);
        seen[key].add(row.id);
        if (key === 'foundations') {
          requireText(premiseMeanings[row.id]?.agree, `${row.id}/agree`);
          requireText(premiseMeanings[row.id]?.disagree, `${row.id}/disagree`);
        }
        if (key === 'scenarios') {
          for (const option of items.get(row.id).options) requireText(decisionMeanings[row.id]?.[option.id], `${row.id}/${option.id}`);
          if (row.status === 'choice' && !items.get(row.id).options.some(option => option.id === row.optionId)) {
            throw new Error(`Unknown chosen package in interpretation evidence: ${row.id}.`);
          }
        }
      }
    }
    if (theme.statements.length) {
      for (const kind of ['positive', 'negative', 'mixed', 'neutral']) {
        requireText(wording[kind]?.title, `${theme.id}/${kind}/title`);
        requireText(wording[kind]?.meaning, `${theme.id}/${kind}/meaning`);
      }
    }
  }
  for (const [key, items] of Object.entries(source)) {
    if (seen[key].size !== items.size) throw new Error(`Interpretation report is missing ${key} evidence.`);
  }
  return source;
}

function statementPattern(rows, source) {
  const pattern = { kind: 'missing', positive: 0, negative: 0, neutral: 0, uncertain: 0, skipped: 0, total: rows.length };
  for (const row of rows) {
    if (row.status === 'value') {
      const signed = row.value * source.get(row.id).direction;
      if (signed > 0) pattern.positive += 1;
      else if (signed < 0) pattern.negative += 1;
      else pattern.neutral += 1;
    } else if (row.status === 'uncertain') pattern.uncertain += 1;
    else if (row.status === 'skip') pattern.skipped += 1;
  }
  if (pattern.positive && pattern.negative) pattern.kind = 'mixed';
  else if (pattern.positive >= 2) pattern.kind = 'positive';
  else if (pattern.negative >= 2) pattern.kind = 'negative';
  else if (pattern.positive + pattern.negative === 1) pattern.kind = 'limited';
  else if (pattern.neutral) pattern.kind = 'neutral';
  return pattern;
}

function premiseReading(theme) {
  const agreed = theme.foundations.filter(row => row.status === 'value' && row.value > 0);
  const disagreed = theme.foundations.filter(row => row.status === 'value' && row.value < 0);
  if (theme.id === 'knowledge-judgment') {
    if (agreed.length >= 2) return {
      headline: 'More than one source can inform judgment',
      meaning: 'You accept several premises about how political knowledge is gained or checked. This leaves room for combining sources rather than treating one source as sufficient; the answers do not decide which source should prevail when they conflict.',
    };
    if (agreed.length === 1) return {
      headline: 'One knowledge premise has your support',
      meaning: `${premiseMeanings[agreed[0].id].agree} Your other answers do not establish an exclusive source of authority.`,
    };
  }
  if (theme.id === 'care-ecological-dependence') {
    if (agreed.length === 2) return {
      headline: 'Care and ecological dependence both matter',
      meaning: 'You recognize care dependency as a source of political obligation and ecology as part of how societies must be understood. These are distinct commitments: one concerns obligations to people needing care, the other society’s dependence on living systems.',
    };
    if (agreed.length === 1) return {
      headline: agreed[0].id === 'premise-care-obligations' ? 'Care dependency has political significance' : 'Ecology belongs in the account of society',
      meaning: `${premiseMeanings[agreed[0].id].agree} The separate premise in this section does not have the same recorded endorsement.`,
    };
  }
  if (disagreed.length) return {
    headline: 'These starting assumptions remain contested',
    meaning: 'You reject one or more of these premises. That narrows the claims this report can attribute to you; rejecting a claim does not establish which alternative explanation or institution you would support.',
  };
  const neutrals = theme.foundations.filter(row => row.status === 'value' && row.value === 0).length;
  return neutrals ? {
    headline: 'No starting premise endorsed or rejected',
    meaning: 'Your neutral responses leave these starting claims open. This does not establish a compromise philosophy or an indifference to the topic.',
  } : {
    headline: 'Not enough evidence for a reading yet',
    meaning: 'There is no explicit agreement or disagreement to interpret here. Uncertainty and skipped items leave the question open rather than indicating a political position.',
  };
}

function countsText(theme, pattern) {
  if (pattern.total) return `${pattern.total} value statements: ${pattern.positive} toward the first emphasis below, ${pattern.negative} toward the second, ${pattern.neutral} neutral, ${pattern.uncertain} uncertain and ${pattern.skipped} skipped. These counts describe answers, not confidence or a new score.`;
  const agreed = theme.foundations.filter(row => row.status === 'value' && row.value > 0).length;
  const disagreed = theme.foundations.filter(row => row.status === 'value' && row.value < 0).length;
  const neutral = theme.foundations.filter(row => row.status === 'value' && row.value === 0).length;
  const uncertain = theme.foundations.filter(row => row.status === 'uncertain').length;
  const skipped = theme.foundations.filter(row => row.status === 'skip').length;
  return `${theme.foundations.length} starting assumptions: ${agreed} agreed, ${disagreed} disagreed, ${neutral} neutral, ${uncertain} uncertain and ${skipped} skipped. There is no dedicated situation here to test how these premises would guide a decision.`;
}

function addConnections(themes, evidence) {
  const agrees = id => evidence.get(id)?.status === 'value' && evidence.get(id).value > 0;
  const chose = (id, optionId) => evidence.get(id)?.status === 'choice' && evidence.get(id).optionId === optionId;
  const add = (themeId, id, title, text, evidenceIds) => themes.find(theme => theme.id === themeId)?.connections.push({ id, title, text, evidenceIds });
  if (agrees('economic-ownership') && chose('housing-urgent', 'sell')) add('ownership-provision-control', 'ownership-and-urgent-sale',
    'Public ownership in principle, a sale in this case',
    'You support retaining essential community assets in public ownership in the general statement, but selected a conditional depot sale in the urgent housing case. That package exchanges continuing ownership for immediate funding and other provision. The record shows a difference between a general commitment and this decision, without telling us why you accepted it.',
    ['economic-ownership', 'housing-urgent']);
  if (agrees('diplomatic-obligation') && chose('water-partnership', 'local')) add('belonging-obligations-cooperation', 'obligations-and-local-allocation',
    'Cross-border obligations, local allocation here',
    'You recognize obligations beyond national borders while allocating the full grant locally in the water case. Acknowledging an obligation and funding a particular partnership are different decisions; this allocation does not establish rejection of all cross-border duties.',
    ['diplomatic-obligation', 'water-partnership']);
  const provision = ['economic-services', 'economic-access'].filter(agrees);
  if (provision.length && agrees('premise-property-independence')) add('ownership-provision-control', 'public-private-independence',
    'Public guarantees and private independence',
    'You support a public responsibility for essential needs or access while also accepting widely distributed private property as a safeguard against dependence on government. Together, these answers allow public guarantees and private independence to coexist; they do not require a single ownership model for everything.',
    [...provision, 'premise-property-independence']);
  if (agrees('economic-ownership') && agrees('economic-market')) add('ownership-provision-control', 'ownership-and-competition',
    'Public ownership with competitive delivery',
    'You support retaining essential community assets in public ownership while preferring competition between providers when both approaches are feasible. Ownership and service operation are different decisions: these answers allow public assets and competitive delivery to coexist.',
    ['economic-ownership', 'economic-market']);
  if (agrees('premise-economic-power') && agrees('premise-workplace-control')) add('ownership-provision-control', 'economic-control-and-power',
    'Economic organization is also a question of power',
    'You see control of productive resources as a central source of lasting political power and support workers sharing major workplace decisions. Together, these answers make control and participation relevant alongside service outputs or funding; they do not establish that one belief caused the other.',
    ['premise-economic-power', 'premise-workplace-control']);
  if (agrees('premise-personal-agency') && agrees('premise-social-relations')) add('belonging-obligations-cooperation', 'agency-and-relationships',
    'Social influence with room for independent commitment',
    'You see relationships as shaping political interests while allowing people to form commitments independently of their groups. These claims can coexist: social influence need not mean that group membership determines every political judgment.',
    ['premise-personal-agency', 'premise-social-relations']);
  if (agrees('societal-new-voices') && agrees('premise-gradual-reform')) add('continuity-inclusion', 'inclusion-and-gradual-change',
    'Inclusion with gradual institutional change',
    'You support bringing previously absent groups into shared public culture and preserving relied-on functions while institutions change. This combines an inclusive direction with concern about the process of reform; inclusion need not imply rapid replacement of every institution.',
    ['societal-new-voices', 'premise-gradual-reform']);
  const freedoms = ['premise-own-good', 'premise-nondomination', 'premise-contestable-power'];
  if (freedoms.every(agrees)) add('freedoms-contestable-power', 'choice-and-protected-power',
    'Personal choice with safeguards against uncontrolled power',
    'Your account of freedom includes choosing a way of life, protection against power that can interfere at will, and an effective way to challenge institutional decisions. This gives freedom both a personal and an institutional dimension; it does not specify which courts, organizations or procedures should provide those safeguards.',
    freedoms);
  if (agrees('civil-dissent') && agrees('civil-management')) add('freedoms-contestable-power', 'expression-and-management',
    'Protected expression with management conditions',
    'You protect peaceful dissent even when inconvenient while accepting some temporary restrictions to manage shared space. The distinction is how far management should go and which safeguards should apply; it is not simply support for or opposition to all restrictions.',
    ['civil-dissent', 'civil-management']);
  if (agrees('diplomatic-obligation') && agrees('diplomatic-domestic')) add('belonging-obligations-cooperation', 'cross-border-domestic-priority',
    'Cross-border obligations with domestic priority',
    'You recognize obligations beyond national borders while giving domestic needs first call on public resources. These answers distinguish acknowledging an obligation from deciding its priority when resources compete; they leave the threshold for acting across borders open.',
    ['diplomatic-obligation', 'diplomatic-domestic']);
  const knowledge = ['premise-dispersed-knowledge', 'premise-situated-knowledge', 'premise-testable-explanations'];
  if (knowledge.every(agrees)) add('knowledge-judgment', 'experience-and-public-scrutiny',
    'Local experience alongside public scrutiny',
    'You recognize knowledge dispersed across society and knowledge gained through exclusion, while expecting political explanations to remain open to publicly examinable evidence. This supports learning from experience and checking explanations together; it does not settle who should have final decision authority.',
    knowledge);
}

/** Interpret only the records produced by the completed-session debrief gate. */
export function interpretDebrief(instrument, report) {
  const source = checkInputs(instrument, report);
  const evidence = new Map(report.themes.flatMap(theme => [...theme.statements, ...theme.foundations, ...theme.scenarios]).map(row => [row.id, row]));
  const themes = report.themes.map(theme => {
    const wording = interpretationThemes[theme.id];
    const pattern = statementPattern(theme.statements, source.statements);
    let reading;
    if (!theme.statements.length) reading = premiseReading(theme);
    else if (pattern.kind === 'limited') reading = {
      headline: 'One directional answer, not yet a general pattern',
      meaning: `The one value statement where you took a side points toward ${wording[pattern.positive ? 'positive' : 'negative'].title.toLowerCase()}. The remaining responses do not establish a broader emphasis across this theme.`,
    };
    else if (pattern.kind === 'missing') reading = {
      headline: 'Not enough value evidence for a reading yet',
      meaning: 'No value statement here has a directional or neutral answer to interpret. Any selected actions and premises below still describe specific commitments; they do not fill in your missing general position.',
    };
    else reading = { headline: wording[pattern.kind].title, meaning: wording[pattern.kind].meaning };
    const premises = theme.foundations.filter(row => row.status === 'value' && row.value !== 0).map(row => ({
      id: row.id, stance: row.value > 0 ? 'agree' : 'disagree', meaning: premiseMeanings[row.id][row.value > 0 ? 'agree' : 'disagree'],
    }));
    const decisions = theme.scenarios.filter(row => row.status === 'choice').map(row => ({ id: row.id, title: row.title, meaning: decisionMeanings[row.id][row.optionId] }));
    let evidenceNote = countsText(theme, pattern);
    if (theme.statements.length) evidenceNote = evidenceNote.replace('the first emphasis below', `“${wording.positive.title}”`).replace('the second', `“${wording.negative.title}”`);
    return { id: theme.id, title: theme.title, ...reading, evidenceNote, pattern, premises, decisions, connections: [], limit: theme.readingNote };
  });
  addConnections(themes, evidence);
  const scenes = report.themes.flatMap(theme => theme.scenarios);
  const compared = scenes.filter(scene => scene.status === 'choice' && scene.preferenceStatus === 'choice');
  const different = compared.filter(scene => scene.optionId !== scene.preferenceOptionId);
  const roleContrast = { compared: compared.length, different: different.length, same: compared.length - different.length, notComparable: scenes.length - compared.length };
  const contextualInsights = [];
  if (compared.length) contextualInsights.push({
    id: 'role-and-personal-preference',
    title: different.length ? 'Your role action and personal preference sometimes differ' : 'Your stated preference and role action match in the compared cases',
    text: `${different.length} of ${compared.length} situations with both an action and a personal package preference record different choices. ${different.length ? 'This separates what you preferred from what you selected within the assigned role; it does not establish why they differ or identify a more authentic belief.' : 'The same package was acceptable from both perspectives in these recorded cases; this does not establish agreement in situations without both answers.'} The repeated housing case, if compared, is a separate recorded choice rather than independent evidence of a trait.`,
    evidenceIds: compared.map(scene => scene.id),
  });
  for (const comparison of report.comparisons ?? []) {
    if (comparison.changed === null) continue;
    const connection = {
      id: `condition-${comparison.scenarioId}`,
      title: comparison.changed ? 'Your housing choice changes across the two deadlines' : 'Your housing choice holds across the two deadlines',
      text: comparison.changed
        ? 'You selected different packages in the urgent and longer-deadline versions. The pair identifies a concrete difference worth examining alongside your reasons, but fixed order and repetition prevent attributing that difference to the deadline alone.'
        : 'You retained the same package in the urgent and longer-deadline versions. That package remained your recorded choice under both stated conditions; this does not establish that deadlines or context never matter to you.',
      evidenceIds: [comparison.originalId, comparison.scenarioId],
    };
    themes.find(theme => theme.id === 'ownership-provision-control').connections.push(connection);
    contextualInsights.push(connection);
  }
  // One connection per theme keeps overview space from being dominated by the
  // theme with the most authored rules. All connections remain in its record.
  const connectedInsights = themes.map(theme => theme.connections.find(connection => !connection.id.startsWith('condition-'))).filter(Boolean);
  // Keep one overview slot for actual role/preference or condition contrasts,
  // even when several statement connections qualify. The remaining connections
  // are still available within their themes.
  const connectionSlots = contextualInsights.length ? 3 : 4;
  const insights = [...connectedInsights.slice(0, connectionSlots), ...contextualInsights].slice(0, 4).map(insight => ({ ...insight, evidenceIds: [...insight.evidenceIds] }));
  const directional = themes.reduce((sum, theme) => sum + theme.pattern.positive + theme.pattern.negative, 0);
  const commitments = themes.reduce((sum, theme) => sum + theme.premises.length, 0);
  const decisions = themes.reduce((sum, theme) => sum + theme.decisions.length, 0);
  if (!insights.length) {
    const clear = themes.find(theme => ['positive', 'negative'].includes(theme.pattern.kind) && theme.pattern.positive + theme.pattern.negative >= 4);
    if (clear) insights.push({ id: `emphasis-${clear.id}`, title: clear.headline, text: `${clear.meaning} This is a repeated emphasis among the value answers in this theme, not a classification of your overall politics.`, evidenceIds: report.themes.find(theme => theme.id === clear.id).statements.filter(row => row.status === 'value' && row.value !== 0).map(row => row.id) });
    else insights.push({
      id: 'interpretation-coverage',
      title: directional + commitments + decisions ? 'Read the patterns theme by theme' : 'Your responses leave the interpretation open',
      text: directional + commitments + decisions
        ? 'The clearest readings are attached to the individual themes below. Different priorities can coexist, and this report has no supported basis for compressing them into one overall political identity.'
        : 'No directional value answer, accepted or rejected premise, or selected action is available for a substantive interpretation. Neutrality, uncertainty and skipping are different responses, but none supplies a political identity in place of evidence.',
      evidenceIds: [],
    });
  }
  return {
    version: interpretationVersion,
    overview: {
      title: directional + commitments + decisions ? 'What your answers suggest' : 'What remains open',
      summary: 'These readings connect the priorities expressed in your statements, starting assumptions and decisions. Each finding links to its supporting responses; the themes below explain what those commitments and choices mean in practice.',
    },
    themes, insights, roleContrast,
  };
}
