/** Descriptive readings for the experimental extended assessment.
 * These are authored interpretations, not scales or political identities.
 */
const STATUSES = Object.freeze({
  strongly_agree: 'Strongly agree', agree: 'Agree', neutral: 'Neither agree nor disagree',
  disagree: 'Disagree', strongly_disagree: 'Strongly disagree', uncertain: 'Uncertain', skip: 'Skipped',
});
const SCENARIO_STATUSES = Object.freeze({uncertain: 'Uncertain', none: 'None of these represents my decision', skip: 'Skipped'});
const AGREE = new Set(['strongly_agree', 'agree']);
const DISAGREE = new Set(['strongly_disagree', 'disagree']);
const CHOICES = new Set(['A', 'B', 'C']);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const THEMES = Object.freeze([
  ['13', 'Disability, access and autonomy', 'These questions distinguish directing support, its cost, access for excluded people and compliance with formal standards. A position on one need not settle the others.'],
  ['14', 'Household authority and care', 'These questions separate voluntary care arrangements, claims to income, financial decision-making and explanations of gender roles.'],
  ['15', 'Emergency powers and accountability', 'These questions distinguish acting quickly, legal authorization, renewal safeguards and local discretion when information is incomplete.'],
  ['16', 'Digital decisions and data governance', 'These questions separate individual consent, collective effects, participation in system rules and individual reconsideration.'],
  ['17', 'Shared resources and representation', 'These questions distinguish local control, equal votes, regional coordination and the voice of people affected downstream.'],
  ['18', 'Insecure work and collective action', 'These questions separate control over working time, responsibility for lost income, individual negotiation and solidarity.'],
  ['19', 'Production, investment and distribution', 'These questions distinguish work as a source of income, returns to investment, who decides how money is used and the role of unpaid care.'],
  ['20', 'Economic life, institutions and culture', 'These questions examine how rules and economic power, beliefs and economic organization, and traditions and past arrangements can relate. They do not assume a single direction of cause.'],
  ['21', 'How social institutions exist', 'These questions explore institutions over time, organizational goals, relations of work and ownership, and recognition of group membership. They do not form an ontology score.'],
  ['22', 'Knowing and explaining social outcomes', 'These questions distinguish reliable patterns, disagreement between researchers, explanation without precise prediction and judgments about what matters.'],
  ['23', 'Methods of social inquiry', 'These questions consider comparisons, lived meaning, historical explanation and participation in setting research questions. Different methods can be combined.'],
  ['24', 'International relations and cooperation', 'These questions distinguish repeated interaction, security concerns, shared expectations and unequal bargaining between states.'],
]);
const RULES = Object.freeze([
  {ids:['CR-13A','CR-13C'], title:'Directing support and enabling access', text:'You agreed that directing help can be a form of independence and that enabling access for people currently excluded can take priority. Together, these answers recognize agency within support arrangements and the importance of access; they do not identify which service design you would choose.'},
  {ids:['CR-14A','CR-14B'], title:'Voluntary care and claims to income', text:'You accepted that a freely agreed unequal division of care can be fair under the stated conditions, and that an adult who gives up earnings to care is entitled to a share of household income. These commitments can coexist; they do not prescribe the same division for every household.'},
  {ids:['CR-15A','CR-15C'], title:'Urgent action with a renewal safeguard', text:'You accepted that temporary powers can be justified in the specified urgent situation, and also supported expiry unless restrictions are justified for renewal. These answers combine room for emergency action with a limit on its continuation; they do not establish support for every emergency measure.'},
  {ids:['CR-16B','CR-16C'], title:'Voice over rules and individual reconsideration', text:'You supported shared authority for people affected by ranking rules and a right to human reconsideration of an individual decision. One concerns how rules are governed; the other concerns a particular decision. Neither answer establishes that a human or an algorithm is always more accurate.'},
  {ids:['CR-17A','CR-17D'], title:'Local authority and a downstream voice', text:'You supported final routine authority for the maintaining community within stated downstream protections, and a binding say for materially affected downstream people. An actual arrangement would need to specify how those powers fit together; these answers do not determine its constitution.'},
  {ids:['CR-18C','CR-18D'], title:'Individual choice and solidarity', text:'You supported freedom to negotiate separately and also supported accepting a temporary personal loss for a shared claim benefiting lower-paid colleagues. A right to choose and a reason to act in solidarity can coexist; the answers do not establish what you would do in every workplace.'},
  {ids:['CR-19A','CR-19B'], title:'Joint work and returns to investment', text:'You agreed that workers’ joint activity can be a main source of increased enterprise income and that investors can reasonably receive a return under the stated conditions. These answers allow both contributions to matter; they do not decide the size of either share or who should control the enterprise.'},
  {ids:['CR-20A','CR-20B'], title:'Rules and ideas can both shape economic life', text:'You agreed that formally equal rules can sustain unequal economic power and that changing shared beliefs can change economic organization. These are distinct possible influences. Your answers do not establish that either influence always comes first or caused a particular historical change.'},
  {ids:['CR-21A','CR-21B'], title:'Institutions beyond individual membership', text:'You accepted that an institution can continue after its personnel change, and that an organization can pursue a goal no member personally wants. These answers leave room to consider institutional continuity and collective outcomes separately from individual preferences; they do not prove any particular theory of society.'},
  {ids:['CR-22C','CR-22D'], title:'Explanation and judgments about importance', text:'You accepted that an explanation can count as knowledge without predicting a particular individual, and that evidence about consequences cannot alone settle which consequences matter most. These distinguish explanatory knowledge from judgments of importance; they do not mean evidence is irrelevant.'},
  {ids:['CR-23B','CR-23D'], title:'Understanding experience and sharing research authority', text:'You gave priority to understanding participants’ meanings in the stated tradeoff and supported affected people being able to change research questions. These concern what is learned and who can shape the inquiry; they do not rule out combining other research methods.'},
  {ids:['CR-24A','CR-24B'], title:'Cooperation alongside security concerns', text:'You accepted that repeated relations can influence agreements without a world government and that defensive steps can make another state feel less secure. Cooperation and uncertainty about security can coexist. These answers do not identify an international-relations school or predict a government’s actions.'},
]);

function itemText(item) { return item?.texts?.en?.text ?? ''; }
function selectedOption(item, id) {
  const option = item?.options?.find(candidate => candidate.id === id);
  const text = option?.texts?.en;
  return text ? {id, label:text.label, description:text.description, tradeoff:text.tradeoff} : null;
}
function scenarioRecord(item, response) {
  const answer = response && typeof response === 'object' && !Array.isArray(response) ? response : {};
  const choice = CHOICES.has(answer.choice) ? selectedOption(item, answer.choice) : null;
  const preference = CHOICES.has(answer.preference) ? selectedOption(item, answer.preference) : null;
  const choiceStatus = choice ? choice.label : SCENARIO_STATUSES[answer.choice] || 'Not answered';
  const preferenceStatus = preference ? preference.label : SCENARIO_STATUSES[answer.preference] || null;
  let comparison = null;
  if (choice && preference) comparison = choice.id === preference.id
    ? 'Your personal preference and assigned-role action selected the same package under the stated constraints.'
    : 'Your personal preference and assigned-role action selected different packages under the stated constraints. This difference does not establish why you chose either package.';
  return {id:item?.id ?? '', title:item?.title ?? '', choice, choiceStatus,
    reason:typeof answer.reason === 'string' && answer.reason.trim() ? answer.reason : null,
    preference, preferenceStatus, comparison};
}
function coverageText(counts) {
  if (counts.agreed && counts.disagreed) return 'You agreed with at least one and disagreed with at least one different statement. The statements ask different questions, so that pattern is not by itself a contradiction.';
  if (counts.agreed) return 'You agreed with at least one statement in this area. Read the individual propositions and their conditions before drawing a broader conclusion.';
  if (counts.disagreed) return 'You disagreed with at least one statement in this area. Disagreement does not by itself tell us which alternative you prefer.';
  if (counts.neutral && !counts.uncertain && !counts.skipped && !counts.missing) return 'Your responses in this area were neutral. A neutral answer is recorded separately from uncertainty or skipping.';
  if (counts.uncertain && !counts.neutral && !counts.skipped && !counts.missing) return 'Your responses in this area were uncertain. Uncertainty is not treated as agreement, disagreement or a neutral position.';
  if (counts.skipped && !counts.neutral && !counts.uncertain && !counts.missing) return 'You skipped the statements in this area; they provide no directional evidence.';
  if (counts.neutral || counts.uncertain || counts.skipped || counts.missing) return 'These responses include neutral, uncertain, skipped or unanswered statements. They do not supply a direction for this area.';
  return 'No directional evidence is available for this area.';
}

/** Keep all question responses separate. Counts describe answers, not a trait or score. */
export function buildExpandedResult(catalog, session) {
  if (!Array.isArray(catalog?.items) || !session || typeof session !== 'object') throw new TypeError('A catalog and expanded session are required');
  const items = new Map(catalog.items.map(item => [item.id, item]));
  const answers = session.answers && typeof session.answers === 'object' ? session.answers : {};
  const themes = THEMES.map(([number, title, context]) => {
    const statements = [...'ABCD'].map(suffix => {
      const id = `CR-${number}${suffix}`;
      const item = items.get(id);
      if (!item) throw new Error(`Missing expanded statement ${id}`);
      const response = answers[id];
      return {id, text:itemText(item), focus:item.rationale || '', response:STATUSES[response] || 'Not answered', rawResponse:response};
    });
    const counts = {agreed:0, disagreed:0, neutral:0, uncertain:0, skipped:0, missing:0};
    for (const statement of statements) {
      const value = statement.rawResponse;
      if (AGREE.has(value)) counts.agreed++;
      else if (DISAGREE.has(value)) counts.disagreed++;
      else if (value === 'neutral') counts.neutral++;
      else if (value === 'uncertain') counts.uncertain++;
      else if (value === 'skip') counts.skipped++;
      else counts.missing++;
    }
    const scenarioId = `CR-S${String(Number(number) - 6).padStart(2, '0')}`;
    const scenario = items.get(scenarioId);
    if (!scenario) throw new Error(`Missing expanded situation ${scenarioId}`);
    return {id:`CR-${number}`, title, context, counts, meaning:coverageText(counts), statements,
      scenario:scenarioRecord(scenario, answers[scenarioId])};
  });
  const findings = RULES.filter(rule => rule.ids.every(id => AGREE.has(answers[id]))).map(rule => ({
    title:rule.title, text:rule.text,
    evidence:rule.ids.map(id => ({id, text:itemText(items.get(id)), response:STATUSES[answers[id]]})),
  }));
  const totals = themes.reduce((acc, theme) => {
    for (const key of Object.keys(theme.counts)) acc[key] += theme.counts[key];
    return acc;
  }, {agreed:0, disagreed:0, neutral:0, uncertain:0, skipped:0, missing:0});
  const situationTotals = {selected:0, uncertain:0, none:0, skipped:0, missing:0};
  for (const theme of themes) {
    const record = answers[theme.scenario.id];
    if (record && CHOICES.has(record.choice) && theme.scenario.choice) situationTotals.selected++;
    else if (record?.choice === 'uncertain') situationTotals.uncertain++;
    else if (record?.choice === 'none') situationTotals.none++;
    else if (record?.choice === 'skip') situationTotals.skipped++;
    else situationTotals.missing++;
  }
  return {themes, findings, statementCounts:totals, situationCounts:situationTotals};
}

function countsText(c) {
  return `${c.agreed} agreement, ${c.disagreed} disagreement, ${c.neutral} neutral, ${c.uncertain} uncertain, ${c.skipped} skipped, ${c.missing} unanswered`;
}
function renderScenario(scenario) {
  let html = `<h4>${escape(scenario.id)} · ${escape(scenario.title)}</h4><p><strong>Assigned-role action:</strong> ${escape(scenario.choiceStatus)}</p>`;
  if (scenario.choice) html += `<p>${escape(scenario.choice.description)}</p><p><strong>Tradeoff:</strong> ${escape(scenario.choice.tradeoff)}</p>`;
  if (scenario.reason) html += `<p><strong>Your selected reason:</strong> ${escape(scenario.reason)}</p>`;
  if (scenario.preferenceStatus) html += `<p><strong>Personal preference:</strong> ${escape(scenario.preferenceStatus)}</p>`;
  if (scenario.comparison) html += `<p>${escape(scenario.comparison)}</p>`;
  return html;
}

export function renderExpandedResults(catalog, session) {
  const result = buildExpandedResult(catalog, session);
  const findings = result.findings.length
    ? result.findings.map(finding => `<article class="expanded-reading"><h3>${escape(finding.title)}</h3><p>${escape(finding.text)}</p><details><summary>Supporting responses</summary>${finding.evidence.map(e => `<p><strong>${escape(e.id)} · ${escape(e.response)}</strong><br>${escape(e.text)}</p>`).join('')}</details></article>`).join('')
    : '<p>No paired reading was triggered by the specific agreements these examples require. Neutral, uncertain, skipped and other responses do not count as agreement. You can still inspect each theme below.</p>';
  const themes = result.themes.map(theme => `<details class="expanded-result-theme"><summary>${escape(theme.title)}</summary><p>${escape(theme.context)}</p><p>${escape(theme.meaning)}</p><p class="expanded-response-counts">Four statements: ${escape(countsText(theme.counts))}. These are answer counts, not a score.</p><details><summary>Read the four statement responses</summary>${theme.statements.map(s => `<p><strong>${escape(s.id)} · ${escape(s.response)}</strong><br>${escape(s.text)}${s.focus ? `<br><em>What this question distinguishes:</em> ${escape(s.focus)}` : ''}</p>`).join('')}</details><section class="expanded-scenario-result">${renderScenario(theme.scenario)}</section></details>`).join('');
  const s = result.situationCounts;
  return `<section class="expanded-results" aria-labelledby="expanded-readings-title"><h2 id="expanded-readings-title">What your responses suggest</h2><p>These are tentative, descriptive readings of this experimental question set. They are not an ideology label, a validated measure or a verdict on consistency. Each reading is limited to the responses shown.</p><h3>Connections in your answers</h3>${findings}<h3>Explore each area</h3><p>Across the 48 statements: ${escape(countsText(result.statementCounts))}. These are response counts, not a score. Across the 12 situations: ${s.selected} selected package, ${s.uncertain} uncertain, ${s.none} none of the options, ${s.skipped} skipped and ${s.missing} unanswered.</p>${themes}<p>Assigned roles and fictional situations are prompts for reflection. A choice can have more than one reason; it does not prove the cause of your response. The situations use generic fictional institutions that have not been reviewed for each world.</p></section>`;
}

export function createExpandedTextReport(catalog, session) {
  const result = buildExpandedResult(catalog, session);
  const lines = ['POLITICAL CONTEXT — EXPERIMENTAL EXTENDED ASSESSMENT', '',
    'These are tentative descriptive readings, not validated scores, ideology labels or diagnoses.', '', 'CONNECTIONS IN YOUR ANSWERS'];
  if (!result.findings.length) lines.push('No paired reading was triggered by the specific agreements required. Other responses do not count as agreement.');
  for (const finding of result.findings) {
    lines.push('', finding.title, finding.text);
    for (const e of finding.evidence) lines.push(`  ${e.id} — ${e.response}: ${e.text}`);
  }
  lines.push('', `48 statements: ${countsText(result.statementCounts)}. These are answer counts, not a score.`);
  const s = result.situationCounts;
  lines.push(`12 situations: ${s.selected} selected package, ${s.uncertain} uncertain, ${s.none} none of the options, ${s.skipped} skipped, ${s.missing} unanswered.`);
  for (const theme of result.themes) {
    lines.push('', theme.title.toUpperCase(), theme.context, theme.meaning, `Four statements: ${countsText(theme.counts)}.`);
    for (const item of theme.statements) {
      lines.push(`${item.id} — ${item.response}: ${item.text}`);
      if (item.focus) lines.push(`What this question distinguishes: ${item.focus}`);
    }
    const scene = theme.scenario;
    lines.push(`${scene.id} — ${scene.title}`, `Assigned-role action: ${scene.choiceStatus}`);
    if (scene.choice) lines.push(scene.choice.description, `Tradeoff: ${scene.choice.tradeoff}`);
    if (scene.reason) lines.push(`Selected reason: ${scene.reason}`);
    if (scene.preferenceStatus) lines.push(`Personal preference: ${scene.preferenceStatus}`);
    if (scene.comparison) lines.push(scene.comparison);
  }
  lines.push('', 'A situated choice can have more than one reason and does not prove the cause of your response. The fictional institutions have not been reviewed for each world.', '');
  return lines.join('\n');
}
