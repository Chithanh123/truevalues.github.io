/** Descriptive presentation only. All answer text is escaped; no score is computed. */
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

function responseCount(count, decisions = false) {
  const parts = [`${count.answered}/${count.total} ${decisions ? 'actions selected' : 'definite responses'}`];
  if (count.uncertain) parts.push(`${count.uncertain} uncertain`);
  if (count.unrepresented) parts.push(`${count.unrepresented} none of the offered choices`);
  if (count.skipped) parts.push(`${count.skipped} skipped`);
  if (count.unanswered) parts.push(`${count.unanswered} not answered`);
  return parts.join(' · ');
}

function statementsView(items, title, kind) {
  if (!items.length) return '';
  return `<section class="theme-response-group"><h4>${escape(title)}</h4><ul class="response-list">${items.map(item =>
    `<li id="evidence-${escape(item.id)}" tabindex="-1" data-evidence-kind="${kind}" data-item-id="${escape(item.id)}"><p>${escape(item.text)}</p><span class="response-answer" data-status="${escape(item.status)}">${escape(item.responseLabel)}</span></li>`
  ).join('')}</ul></section>`;
}

function circumstancesView(item) {
  return `<details class="decision-circumstances"><summary>Recall the situation and constraints</summary><p>${escape(item.briefing)}</p>${item.institutionalContext ? `<p><strong>In your assigned setting:</strong> ${escape(item.institutionalContext)}</p>` : ''}<ul>${item.facts.map(fact => `<li><strong>${escape(fact.label)}:</strong> ${escape(fact.text)}</li>`).join('')}</ul></details>`;
}

function decisionsView(items) {
  if (!items.length) return '<p class="coverage-gap">No dedicated situation in this edition. The premises above do not establish how you would act in one.</p>';
  return `<section class="theme-response-group"><h4>Your decisions and reasons</h4>${items.map(item =>
    `<article id="evidence-${escape(item.id)}" tabindex="-1" class="decision-record" data-scenario-id="${escape(item.id)}"><h5>${escape(item.title)}</h5><p class="decision-context">${escape(item.roleLabel)} · ${escape(item.setting)}</p>${item.comparisonOf ? '<p class="decision-badge">Repeated situation · excluded from profile summaries</p>' : item.descriptive ? '<p class="decision-badge">Exploratory situation · unscored</p>' : ''}<dl><div><dt>Action within your role</dt><dd>${escape(item.actionLabel)}</dd></div><div><dt>Personal preference</dt><dd>${escape(item.preferenceLabel)}</dd></div><div><dt>Reason you selected</dt><dd>${escape(item.reasonLabel)}</dd></div></dl>${item.actionDescription ? `<p class="decision-action-detail">${escape(item.actionDescription)}<br><strong>Tradeoff:</strong> ${escape(item.actionTradeoff)}</p>` : ''}<p class="decision-authority"><strong>Your responsibility:</strong> ${escape(item.authority)}</p>${circumstancesView(item)}</article>`
  ).join('')}</section>`;
}

function evidenceLinks(ids) {
  if (!ids?.length) return '';
  return `<div class="interpretation-evidence"><span>Based on your responses:</span>${ids.map((id, index) => `<a href="#evidence-${escape(id)}" data-action="show-evidence" data-evidence-target="${escape(id)}" aria-label="Show supporting response ${index + 1}">${index + 1}</a>`).join('')}</div>`;
}

function insightsView(interpretation) {
  if (!interpretation) return '';
  return `<section class="interpretation-overview" aria-labelledby="interpretation-title"><span class="eyebrow orange">Your result, explained</span><h2 id="interpretation-title">${escape(interpretation.overview.title)}</h2><p class="interpretation-lead">${escape(interpretation.overview.summary)}</p><div class="insight-grid">${interpretation.insights.map(insight => `<article class="insight-card" data-insight-id="${escape(insight.id)}"><h3>${escape(insight.title)}</h3><p>${escape(insight.text)}</p>${evidenceLinks(insight.evidenceIds)}</article>`).join('')}</div><p class="interpretation-note">These are interpretations of this set of answers, not a diagnosis or a validated political identity. Different priorities can coexist; an action does not reveal an unselected motive.</p></section>`;
}

function themeInterpretationView(meaning, theme) {
  if (!meaning) return '';
  const connections = meaning.connections.map(connection => `<article class="theme-connection"><h4>${escape(connection.title)}</h4><p>${escape(connection.text)}</p>${evidenceLinks(connection.evidenceIds)}</article>`).join('');
  const premises = meaning.premises.length ? `<section class="premise-interpretation"><h4>What your starting assumptions indicate</h4><ul>${meaning.premises.map(premise => `<li><p>${escape(premise.meaning)}</p>${evidenceLinks([premise.id])}</li>`).join('')}</ul></section>` : '';
  const decisions = meaning.decisions.length ? `<section class="decision-interpretation"><h4>What your decisions put into practice</h4>${meaning.decisions.map(decision => {
    const record = theme.scenarios.find(scene => scene.id === decision.id);
    return `<article><h5>${escape(decision.title)}</h5><p>${escape(decision.meaning)}</p>${record?.reasonId ? `<p class="interpreted-reason"><strong>Your selected justification:</strong> ${escape(record.reasonLabel)}</p>` : ''}${evidenceLinks([decision.id])}</article>`;
  }).join('')}</section>` : '';
  return `<div class="theme-interpretation"><p class="interpretation-coverage">${escape(meaning.evidenceNote)}</p>${connections}${premises}${decisions}<p class="interpretation-limit">${escape(meaning.limit)}</p></div>`;
}

export function renderResponseReport(report, interpretation = null) {
  const overview = report.responseOverview;
  return `<section class="response-report" aria-labelledby="response-report-title">
    ${insightsView(interpretation)}
    <span class="eyebrow">A closer reading</span><h2 id="response-report-title">Your priorities, theme by theme.</h2>
    <p class="report-intro">Read what your answers indicate about each political question. Open a theme for its reasoning, decisions and supporting responses. The original answer record remains available beneath each interpretation.</p>
    <div class="response-overview" aria-label="Response coverage">${[
      ['Value statements', overview.values, false], ['Starting assumptions', overview.foundations, false],
      ['Contextual situations', overview.scenarios, true],
    ].map(([title, counts, decisions]) => `<div><h3>${title}</h3><p>${escape(responseCount(counts, decisions))}</p></div>`).join('')}</div>
    <p class="report-coverage-note">A neutral statement answer counts as a definite response. Uncertainty, skipped items and unrepresented choices remain distinct. Optional personal-preference responses: ${overview.preferences.provided}/${overview.preferences.total} recorded, including any explicit uncertainty or unrepresented preference.</p>
    <div class="report-themes">${report.themes.map((theme, index) => {
      const meaning = interpretation?.themes.find(item => item.id === theme.id);
      return `<details class="report-theme" data-theme-id="${escape(theme.id)}"><summary><span class="theme-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span class="theme-heading"><strong>${escape(theme.title)}</strong>${meaning ? `<span class="theme-takeaway">${escape(meaning.headline)}</span><span class="theme-meaning">${escape(meaning.meaning)}</span>` : `<span>${escape(theme.question)}</span>`}<small>${theme.statements.length} value statements · ${theme.foundations.length} assumptions · ${theme.scenarios.length} situations</small></span></summary><div class="theme-body">${themeInterpretationView(meaning, theme)}${meaning ? '' : `<p class="theme-reading-note">${escape(theme.readingNote)}</p>`}<details class="theme-evidence"><summary>See the responses behind this interpretation</summary><div class="theme-response-columns">${statementsView(theme.statements, 'Value statements', 'statement')}${statementsView(theme.foundations, 'Starting assumptions', 'foundation')}</div>${decisionsView(theme.scenarios)}</details><div class="reflection-prompt"><span class="eyebrow">For your reflection</span><p>${escape(theme.reflectionPrompt)}</p></div></div></details>`;
    }).join('')}</div>
  </section>`;
}
