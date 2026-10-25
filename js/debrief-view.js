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
    `<li data-evidence-kind="${kind}" data-item-id="${escape(item.id)}"><p>${escape(item.text)}</p><span class="response-answer" data-status="${escape(item.status)}">${escape(item.responseLabel)}</span></li>`
  ).join('')}</ul></section>`;
}

function circumstancesView(item) {
  return `<details class="decision-circumstances"><summary>Recall the situation and constraints</summary><p>${escape(item.briefing)}</p>${item.institutionalContext ? `<p><strong>In your assigned setting:</strong> ${escape(item.institutionalContext)}</p>` : ''}<ul>${item.facts.map(fact => `<li><strong>${escape(fact.label)}:</strong> ${escape(fact.text)}</li>`).join('')}</ul></details>`;
}

function decisionsView(items) {
  if (!items.length) return '<p class="coverage-gap">No dedicated situation in this edition. The premises above do not establish how you would act in one.</p>';
  return `<section class="theme-response-group"><h4>Your decisions and reasons</h4>${items.map(item =>
    `<article class="decision-record" data-scenario-id="${escape(item.id)}"><h5>${escape(item.title)}</h5><p class="decision-context">${escape(item.roleLabel)} · ${escape(item.setting)}</p>${item.comparisonOf ? '<p class="decision-badge">Repeated situation · excluded from profile summaries</p>' : item.descriptive ? '<p class="decision-badge">Exploratory situation · unscored</p>' : ''}<dl><div><dt>Action within your role</dt><dd>${escape(item.actionLabel)}</dd></div><div><dt>Personal preference</dt><dd>${escape(item.preferenceLabel)}</dd></div><div><dt>Reason you selected</dt><dd>${escape(item.reasonLabel)}</dd></div></dl>${item.actionDescription ? `<p class="decision-action-detail">${escape(item.actionDescription)}<br><strong>Tradeoff:</strong> ${escape(item.actionTradeoff)}</p>` : ''}<p class="decision-authority"><strong>Your responsibility:</strong> ${escape(item.authority)}</p>${circumstancesView(item)}</article>`
  ).join('')}</section>`;
}

export function renderResponseReport(report) {
  const overview = report.responseOverview;
  return `<section class="response-report" aria-labelledby="response-report-title">
    <span class="eyebrow">Your responses, in context</span><h2 id="response-report-title">The questions behind your choices.</h2>
    <p class="report-intro">Explore your statements, starting assumptions and decisions together. These themes organize what you answered; they do not assign a new score or infer why you chose an action. Your selected reasons are shown in your own record.</p>
    <div class="response-overview" aria-label="Response coverage">${[
      ['Value statements', overview.values, false], ['Starting assumptions', overview.foundations, false],
      ['Contextual situations', overview.scenarios, true],
    ].map(([title, counts, decisions]) => `<div><h3>${title}</h3><p>${escape(responseCount(counts, decisions))}</p></div>`).join('')}</div>
    <p class="report-coverage-note">A neutral statement answer counts as a definite response. Uncertainty, skipped items and unrepresented choices remain distinct. Optional personal-preference responses: ${overview.preferences.provided}/${overview.preferences.total} recorded, including any explicit uncertainty or unrepresented preference.</p>
    <div class="report-themes">${report.themes.map((theme, index) => `<details class="report-theme" data-theme-id="${escape(theme.id)}"><summary><span class="theme-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span class="theme-heading"><strong>${escape(theme.title)}</strong><span>${escape(theme.question)}</span><small>${theme.statements.length} value statements · ${theme.foundations.length} assumptions · ${theme.scenarios.length} situations</small></span></summary><div class="theme-body"><p class="theme-reading-note">${escape(theme.readingNote)}</p><div class="theme-response-columns">${statementsView(theme.statements, 'Value statements', 'statement')}${statementsView(theme.foundations, 'Starting assumptions', 'foundation')}</div>${decisionsView(theme.scenarios)}<div class="reflection-prompt"><span class="eyebrow">For your reflection</span><p>${escape(theme.reflectionPrompt)}</p></div></div></details>`).join('')}</div>
  </section>`;
}
