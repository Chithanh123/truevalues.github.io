import { instrument } from './content.js';
import { createSession, makeSteps, setAnswer, summarize, validateSession, validateInstrument } from './engine.js';
import { buildDebrief, createTextReport } from './debrief.js';
import { interpretDebrief } from './interpretation.js';
import { renderResponseReport } from './debrief-view.js';

const app = document.querySelector('#app');
const dialog = document.querySelector('#info-dialog');
const dialogContent = document.querySelector('#dialog-content');
const steps = makeSteps(instrument);
const STORAGE_KEY = 'political-context-session';
const labels = { 2: 'Strongly agree', 1: 'Agree', 0: 'Neither agree nor disagree', '-1': 'Disagree', '-2': 'Strongly disagree' };
const e = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
let storageWarning = '';
let recoverySave = null;
let session = readSaved();
let screen = 'home';

function readSaved() {
  for (const storeName of ['sessionStorage', 'localStorage']) {
    try {
      const raw = window[storeName].getItem(STORAGE_KEY);
      if (!raw) continue;
      const candidate = JSON.parse(raw);
      const result = validateSession(instrument, candidate);
      if (result.valid && (storeName === 'sessionStorage' || candidate.saveOnDevice)) return candidate;
      recoverySave = raw;
      storageWarning = 'Saved progress could not be restored because its format or assessment version changed. You can begin a new assessment or erase the old save in Your data.';
    } catch {
      storageWarning = 'Saved progress could not be read. You can continue in this page; browser storage may be unavailable.';
    }
  }
  return null;
}

function announce(message) {
  document.querySelector('#announcement').textContent = message;
}

function persist() {
  if (!session) return false;
  const raw = JSON.stringify(session);
  const failures = [];
  try { sessionStorage.setItem(STORAGE_KEY, raw); } catch { failures.push('Progress may be lost if you reload this tab.'); }
  try {
    if (session.saveOnDevice) localStorage.setItem(STORAGE_KEY, raw);
    else localStorage.removeItem(STORAGE_KEY);
  } catch { failures.push('Device storage could not be updated. An older save may remain in this browser.'); }
  if (failures.length) {
    storageWarning = failures.join(' ');
    const notice = document.querySelector('#storage-warning');
    if (notice) { notice.hidden = false; notice.textContent = storageWarning; }
    announce(storageWarning);
  }
  return failures.length === 0;
}

function clearSaved() {
  let failed = false;
  for (const name of ['sessionStorage', 'localStorage']) {
    try { window[name].removeItem(STORAGE_KEY); } catch { failed = true; }
  }
  session = null;
  recoverySave = null;
  storageWarning = failed ? 'Answers were cleared from this page, but browser storage could not be accessed. Clear this site’s data in your browser settings to remove any older save.' : '';
  announce(failed ? storageWarning : 'Your answers have been erased from this tab and the saved device copy.');
}

function notice() {
  return `<div id="storage-warning" class="notice" role="status" ${storageWarning ? '' : 'hidden'}>${e(storageWarning)}${recoverySave ? ' <button class="text-button" data-action="recover-save">Download the previous save</button>' : ''}</div>`;
}

function focusContent() {
  requestAnimationFrame(() => {
    const target = document.querySelector('#step-title') || document.querySelector('#main');
    target.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
}

function saveControl() {
  return `<label class="check-label save-preference"><input type="checkbox" data-setting="save" ${session?.saveOnDevice ? 'checked' : ''}><span>Remember progress on this device<br><small>Optional. Otherwise, progress stays in this tab.</small></span></label>`;
}

function art() {
  return `<div class="hero-art" aria-hidden="true">
    <div class="art-top"><span>THE CONTEXT FILES</span><span>01 / ${String(instrument.scenarios.length).padStart(2, '0')}</span></div>
    <svg class="map-illustration" viewBox="0 0 420 240" fill="none">
      <defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" stroke="#738568" stroke-opacity=".13"/></pattern></defs>
      <rect x="0" y="0" width="420" height="240" fill="url(#grid)"/>
      <path d="M-20 183C60 143 67 218 138 167S190 99 262 141S353 195 437 101" stroke="#a9bfa0" stroke-width="20"/>
      <path d="M-20 183C60 143 67 218 138 167S190 99 262 141S353 195 437 101" stroke="#d5e2cc" stroke-width="12"/>
      <path d="M28 42L151 42L151 100L224 100L224 55L393 55M74 5V111H119M308 8V104M184 20V68M263 181V233M58 213H181" stroke="#819476" stroke-width="2"/>
      <path d="M41 57H65V97H41zM84 57H137V81H84zM164 112H194V138H164zM237 68H290V91H237zM323 68H371V94H323zM326 185H380V219H326zM204 190H242V224H204z" fill="#c8d5bc" stroke="#a7b99b"/>
      <path d="M84 87H107V109H84zM194 35H238V80H194zM28 197H53V226H28z" fill="#b9c9aa" stroke="#8fa580"/>
      <rect x="77" y="126" width="60" height="33" rx="2" fill="#e2ab8b" stroke="#bf7753"/>
      <path d="M82 126V116H132V126M91 132V151M103 132V151M115 132V151M127 132V151" stroke="#bf7753"/>
      <circle cx="107" cy="142" r="48" stroke="#bd4c2e" stroke-dasharray="3 5"/>
      <circle cx="107" cy="142" r="4" fill="#bd4c2e"/>
      <path d="M150 123L194 104H250" stroke="#bd4c2e"/>
      <rect x="244" y="90" width="146" height="30" rx="3" fill="#fffef9" stroke="#ccd5c3"/>
      <text x="254" y="109" font-size="8.5" fill="#344c3a" font-family="Arial,sans-serif">A PUBLIC SITE. THREE PATHS.</text>
      <circle cx="380" cy="24" r="13" stroke="#7b9071"/><path d="M380 14L375 29L380 26L385 29Z" fill="#7b9071"/>
    </svg>
    <div class="art-card"><span class="eyebrow">Your role · Local leader</span><p>Homes for tomorrow.<br>Or urgent needs today?</p><div class="art-card-footer"><span>Resources are finite. Your reasons matter.</span><span>→</span></div></div>
    <p class="art-caption">A FICTIONAL PLACE. A RECOGNIZABLE TRADEOFF.</p>
  </div>`;
}

function renderHome() {
  screen = 'home';
  document.title = 'Political Context — Principles meet circumstance';
  app.innerHTML = `${notice()}
    <section class="hero" aria-labelledby="hero-title">
      <div><span class="eyebrow orange">PRINCIPLES MEET CIRCUMSTANCE</span><h1 id="hero-title">Your values.<br>A world of<br><em>tradeoffs.</em></h1>
        <p class="hero-copy">What matters to you—and what changes when you’re the one making the decision? Explore political values through the lives and responsibilities of others.</p>
        <div class="hero-actions"><button class="button" data-action="${session ? 'resume' : 'begin'}">${session ? (session.completed ? 'Return to your debrief' : 'Continue assessment') : 'Begin assessment'} <span aria-hidden="true">→</span></button><span class="meta-note">◷ &nbsp; About 25–35 minutes · estimate</span></div>
        <p class="hero-note">No account. No answers submitted. A space to think.</p>
        ${session ? '<button class="text-button" data-action="restart">Start a fresh assessment</button>' : ''}
      </div>${art()}
    </section>
    <section class="stats-strip" aria-label="Assessment at a glance"><div class="stat"><strong>${instrument.statements.length + instrument.foundations.items.length}</strong><span>VALUES &amp;<br>ASSUMPTIONS</span></div><div class="stat"><strong>${String(instrument.scenarios.length).padStart(2, '0')}</strong><span>CONTEXTUAL<br>DECISIONS</span></div><div class="stat"><strong>${String(instrument.worlds.length).padStart(2, '0')}</strong><span>FICTIONAL<br>WORLDS</span></div><div class="stat"><strong>01</strong><span>PERSONAL<br>DEBRIEF</span></div></section>
    <section class="worlds-preview" aria-labelledby="worlds-title"><div><span class="eyebrow orange">Different institutions. Shared dilemmas.</span><h2 id="worlds-title">Eight worlds.<br> Five viewpoints.</h2><p>One setting stays with you for the whole assessment. Its real-world inspiration is revealed in your final debrief. Your responsibilities change as you encounter different parts of public life.</p><button class="text-button" data-action="worlds">Explore the fictional settings →</button></div><div class="world-chips">${instrument.worlds.map(world => `<div class="world-chip"><span class="world-code" aria-hidden="true">${e(world.code)}</span><span><strong>${e(world.name)}</strong><small>Institutional setting · fictional</small></span></div>`).join('')}</div></section>
    <section class="intro-section"><div><span class="eyebrow">How it unfolds</span><h2>From principle<br>to perspective.</h2></div><div class="process-grid"><div><span class="process-number">01</span><h3>Start with your values</h3><p>Consider values about rights, resources, and change, then assumptions about people, society, authority, and knowledge.</p></div><div><span class="process-number">02</span><h3>Step into a situation</h3><p>Take a role in a fictional society. Weigh real constraints and competing needs.</p></div><div><span class="process-number">03</span><h3>Reflect on your choices</h3><p>See your stated values and decisions side by side, with the reasons behind them.</p></div></div></section>
    <aside class="research-note"><span class="eyebrow">A work in progress</span><p><strong>A research prototype, with room for nuance.</strong> This edition includes ${instrument.worlds.length} settings and ${instrument.roles.length} roles. Its country briefs and decision rubrics are author drafts awaiting independent review. Its summaries are experimental, not a validated measure of ideology. Every choice comes with context. <button class="text-button" data-action="method">Read the method →</button></p></aside><section class="review-banner"><div><span class="eyebrow">Help shape the next edition</span><h2>Before we measure, we listen.</h2><p>The next research step is to check whether people understand the situations as intended. Browse the <a href="question-bank.html">question bank</a>, including draft questions and their intended outcomes.</p></div><button class="button secondary" data-action="review">For reviewers <span aria-hidden="true">→</span></button></section>`;
}

function topProgress(step) {
  const completedItems = steps.slice(0, session.stepIndex).filter(s => ['statement', 'foundation', 'scenario'].includes(s.type)).length;
  const total = instrument.statements.length + instrument.foundations.items.length + instrument.scenarios.length;
  const phase = ['statement', 'foundation'].includes(step.type) ? 0 : step.type === 'results' ? 2 : 1;
  return `<div class="assessment-top"><div class="phase-trail" aria-label="Assessment stages">${['Your perspective', 'In context', 'Your debrief'].map((name, i) => `<span class="${i === phase ? 'active' : ''}" ${i === phase ? 'aria-current="step"' : ''}><b>${i + 1}</b>${name}</span>`).join('')}</div><span class="progress-caption">${completedItems} of ${total} responses</span></div><div class="progress-track" role="progressbar" aria-label="Assessment progress" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${completedItems}"><div class="progress-fill" style="width:${completedItems / total * 100}%"></div></div>`;
}

function sidebar(step, scene) {
  const world = instrument.worlds.find(w => w.id === session.worldId);
  if (step.type === 'foundation') return `<aside class="side-note"><div><span class="eyebrow">Part one · Assumptions</span><h2>What you start from.</h2></div><p>Consider beliefs about people, society, authority, and knowledge. You can agree with ideas that draw on several political traditions.</p><div class="side-divider"><p>These exploratory responses stay separate from the profile markers. There is no preferred combination of answers.</p>${saveControl()}</div><span class="mobile-context">Assumptions, in your own words.<br>Recorded separately from profile scores.</span></aside>`;
  if (step.type === 'statement') return `<aside class="side-note"><div><span class="eyebrow">Part one</span><h2>Your starting point.</h2></div><p>Answer as yourself, before taking on anyone else’s responsibilities.</p><div class="side-divider"><p>There is no preferred answer. “Uncertain” is different from being neutral.</p>${saveControl()}</div><span class="mobile-context">Answer as yourself.<br>No right or wrong answer.</span></aside>`;
  return `<aside class="side-note"><div><span class="eyebrow">Your assigned world</span><h2>${e(world.name)}</h2></div><p>Institutions and events are fictional. The real-world inspiration is revealed after your last decision.</p>${scene ? `<dl><dt>Your role</dt><dd>${e(scene.roleLabel)}</dd><dt>Your surroundings</dt><dd>${e(scene.locality === 'urban' ? 'City / urban' : 'Rural district')}</dd><dt>Place</dt><dd>${e(scene.setting)}</dd></dl>` : ''}<div class="side-divider"><p>You’ll encounter different perspectives within the same society.</p>${saveControl()}</div><span class="mobile-context">${e(scene ? scene.roleLabel : 'A place to get acquainted')}<br>${e(scene ? (scene.locality === 'urban' ? 'Urban setting' : 'Rural setting') : 'Fictional institutions')}</span></aside>`;
}

function footer(step, allowSkip = true) {
  return `<div class="answer-footer"><button class="back-button" data-action="back" ${session.stepIndex === 0 ? 'disabled' : ''}>← Back</button><div>${allowSkip ? '<button class="text-button" data-action="skip">Skip this item</button>' : ''}<button class="button" data-action="next" ${step.type !== 'briefing' && !session.answers[step.id] ? 'disabled' : ''}>${step.type === 'briefing' ? 'Enter the first situation' : session.stepIndex === steps.length - 2 ? 'See your debrief' : 'Continue'} <span aria-hidden="true">→</span></button></div></div><p class="keyboard-note">Use Tab to move between controls and arrow keys to change a selected response.</p>`;
}

function statementView(step) {
  const isFoundation = step.type === 'foundation';
  const items = isFoundation ? instrument.foundations.items : instrument.statements;
  const item = items.find(s => s.id === step.itemId);
  const answer = session.answers[step.id];
  const number = items.indexOf(item) + 1;
  return `<div class="assessment-layout">${sidebar(step)}<section><div class="step-header"><span class="eyebrow">${isFoundation ? 'Assumption' : 'Statement'} ${String(number).padStart(2, '0')} / ${items.length}</span><span class="step-tag">${isFoundation ? 'Exploratory · unscored' : 'Your own perspective'}</span></div><h1 class="question-title" id="step-title" tabindex="-1">${e(item.text)}</h1><p class="step-description">How closely does this reflect what you believe in general?</p><fieldset class="answer-options"><legend class="sr-only">Your agreement with the statement</legend>${[2, 1, 0, -1, -2].map(value => `<label class="option"><input type="radio" name="answer" value="${value}" data-response="value" ${answer?.kind === 'value' && answer.value === value ? 'checked' : ''}><span class="option-title">${labels[value]}</span><span class="option-hint" aria-hidden="true">${value === 2 ? '++' : value === 1 ? '+' : value === 0 ? '○' : value === -1 ? '−' : '−−'}</span></label>`).join('')}<label class="option"><input type="radio" name="answer" value="uncertain" data-response="uncertain" ${answer?.kind === 'uncertain' ? 'checked' : ''}><span class="option-title">I’m uncertain</span><span class="option-hint">Kept separate from neutral</span></label></fieldset>${footer(step)}</section></div>`;
}

function briefingView(step) {
  const world = instrument.worlds.find(w => w.id === session.worldId);
  return `<div class="assessment-layout">${sidebar(step)}<section><span class="eyebrow orange">Part two · A change of perspective</span><h1 class="question-title" id="step-title" tabindex="-1" style="margin-top:17px">Welcome to ${e(world.name)}.</h1><p class="step-description">You’ve considered your values and starting assumptions. Now consider what you would do with specific responsibilities, limited resources, and other people affected by your choices.</p><div class="world-brief"><div class="world-map" aria-hidden="true"><div class="map-grid"></div><div class="world-symbol">${e(world.code)}<span>CONTEXT FILE / ${String(instrument.worlds.indexOf(world) + 1).padStart(2, '0')}</span></div></div><span class="eyebrow">A fictional society</span><h2>${e(world.name)}</h2><p class="step-description">${e(world.summary)}</p><div class="institution-grid">${world.institutions.map(fact => `<div><h3>${e(fact.label)}</h3><p>${e(fact.text)}</p></div>`).join('')}</div></div><div class="authority-note"><strong>A note on your roles</strong>You’ll act as a constituent, a civil society leader, a non-elected public servant, a local leader, and a national leader. Decisions concern both city and rural communities. Each card explains what you can decide. Choose within those responsibilities; your assigned role does not describe who you are.</div><p class="meta-note">The setting was assigned at random and stays the same throughout this assessment.</p>${footer(step, false)}</section></div>`;
}

function preferenceView(scene, answer) {
  const preference = answer?.preference;
  const selected = preference?.kind === 'choice' ? `option:${preference.optionId}` : preference?.kind || '';
  return `<div class="preference-field"><label for="personal-preference">Your personal preference <span>(optional, unscored)</span></label><p id="preference-description">Putting this assigned role aside, which of these same packages would you personally prefer? Keep the budget, facts, and other people’s rights unchanged.</p><select id="personal-preference" aria-describedby="preference-description" ${!answer ? 'disabled' : ''}><option value="">Leave personal preference unanswered</option>${scene.options.map(option => `<option value="option:${e(option.id)}" ${selected === `option:${option.id}` ? 'selected' : ''}>${e(option.label)}</option>`).join('')}<option value="uncertain" ${selected === 'uncertain' ? 'selected' : ''}>I’m uncertain about my personal preference</option><option value="none" ${selected === 'none' ? 'selected' : ''}>None of these expresses my personal preference</option></select><small>This is separate from the action in your role and does not change any profile score.</small></div>`;
}

function personalPreferenceText(scene, answer) {
  const preference = answer?.preference;
  if (!preference) return 'Not provided (optional)';
  if (preference.kind === 'uncertain') return 'Uncertain';
  if (preference.kind === 'none') return 'None of the offered packages';
  return scene.options.find(option => option.id === preference.optionId)?.label || 'Not provided';
}

function scenarioView(step) {
  const scene = instrument.scenarios.find(s => s.id === step.itemId);
  const answer = session.answers[step.id];
  const number = instrument.scenarios.indexOf(scene) + 1;
  const world = instrument.worlds.find(w => w.id === session.worldId);
  const contextNote = world.scenarioNotes?.[scene.id] || scene.worldNotes?.[session.worldId];
  return `<div class="assessment-layout">${sidebar(step, scene)}<section><div class="step-header"><span class="eyebrow">Situation ${String(number).padStart(2, '0')} / ${instrument.scenarios.length}</span><span class="step-tag">${scene.comparisonOf ? 'One condition changes' : scene.scoring === 'descriptive' ? 'Exploratory decision' : e(scene.locality === 'urban' ? 'City perspective' : 'Rural perspective')}</span></div><h1 class="question-title" id="step-title" tabindex="-1">${e(scene.title)}</h1>${scene.comparisonOf ? `<p class="step-description"><strong>Revisit the housing decision.</strong> ${e(scene.changedCondition)} Consider this version on its own; you do not need to repeat your earlier answer.</p>` : ''}<p class="step-description">${e(scene.briefing)}</p><div class="fact-grid">${scene.facts.map(f => `<div><strong>${e(f.label)}</strong><p>${e(f.text)}</p></div>`).join('')}</div><div class="authority-note"><strong>Your room to act</strong>${e(scene.authority)}</div>${contextNote ? `<details class="context-details"><summary>More about the institutions in this setting</summary><p>${e(contextNote)}</p></details>` : ''}<h2 class="decision-prompt">${e(scene.prompt)}</h2>${scene.scoring === 'descriptive' ? '<p class="exploratory-note">This decision explores transparency and staff capacity. Your choice and reason appear in the debrief, but do not move a profile marker.</p>' : ''}<fieldset class="answer-options"><legend class="sr-only">Choose an action for this situation</legend>${scene.options.map(option => `<label class="option scenario-option"><input type="radio" name="answer" value="${e(option.id)}" data-response="choice" ${answer?.kind === 'choice' && answer.optionId === option.id ? 'checked' : ''}><span class="option-copy"><span class="option-title">${e(option.label)}</span><span class="option-description">${e(option.description)}</span><span class="tradeoff">${e(option.tradeoff)}</span></span></label>`).join('')}<div class="alternative-options">${[['uncertain', 'I’m uncertain'], ['none', 'None of these represents my choice']].map(([kind, label]) => `<label class="option"><input type="radio" name="answer" value="${kind}" data-response="${kind}" ${answer?.kind === kind ? 'checked' : ''}><span class="option-title">${label}</span></label>`).join('')}</div></fieldset><div class="reason-field"><label for="reason">What mattered most? <span style="font-weight:400">(optional)</span></label><select id="reason" ${answer?.kind !== 'choice' ? 'disabled' : ''}><option value="">Choose a reason, or leave this unanswered</option>${scene.reasons.map(reason => `<option value="${e(reason.id)}" ${answer?.reasonId === reason.id ? 'selected' : ''}>${e(reason.label)}</option>`).join('')}</select><p>Your reason adds context. It does not add points to your profile.</p></div>${preferenceView(scene, answer)}${footer(step)}</section></div>`;
}

function answerText(item, answer, isStatement = false) {
  if (!answer) return 'Not answered';
  if (answer.kind === 'uncertain') return 'Uncertain';
  if (answer.kind === 'skip') return 'Skipped';
  if (answer.kind === 'none') return 'None of the offered choices';
  if (isStatement) return labels[answer.value];
  return item.options.find(o => o.id === answer.optionId)?.label || 'Not answered';
}

function profilePosition(mean, dim) {
  if (mean === null) return 'No scored responses';
  if (mean > 0.35) return `Toward ${dim.right.toLowerCase()}`;
  if (mean < -0.35) return `Toward ${dim.left.toLowerCase()}`;
  return 'Near the middle of this provisional rubric';
}

function foundationDebrief() {
  return `<section class="evidence-section foundation-debrief"><span class="eyebrow">Your starting assumptions · unscored</span><h2>More than a position on a line.</h2><p>These statements explore different kinds of premises. Each response stands on its own: no tradition score, ranking, or ideology label is calculated. Agreement with one idea does not establish agreement with a whole political tradition.</p>${instrument.foundations.categories.map(category => `<details><summary>${e(category.label)}</summary><div class="evidence-body"><p>${e(category.description)}</p>${instrument.foundations.items.filter(item => item.category === category.id).map(item => `<p><strong>${e(item.text)}</strong><br>${e(answerText(item, session.answers[`foundation:${item.id}`], true))}</p>`).join('')}</div></details>`).join('')}<details><summary>The political traditions behind the research questions</summary><div class="evidence-body"><p>This author-draft map draws on overlapping traditions and disagreements within them. The lenses below describe questions for further research; they are not matches to your answers.</p>${instrument.foundations.lenses.map(lens => `<p><strong>${e(lens.label)}</strong><br>${e(lens.description)}<br><em>${e(lens.cautions)}</em></p>`).join('')}<p><a href="docs/FOUNDATIONS.md">Read the expanded aims and development framework</a></p></div></details></section>`;
}

function resultsView() {
  const summary = summarize(instrument, session);
  const report = buildDebrief(instrument, session);
  const interpretation = interpretDebrief(instrument, report);
  const world = instrument.worlds.find(w => w.id === session.worldId);
  const count = Object.keys(session.answers).length;
  const pair = summary.comparisons[0];
  const original = instrument.scenarios.find(s => s.id === pair.originalId);
  const comparison = instrument.scenarios.find(s => s.id === pair.scenarioId);
  return `<section class="debrief-heading"><span class="eyebrow orange">Your field notes · Assessment complete</span><h1 id="step-title" tabindex="-1">Your priorities.<br>In context.</h1><p>Here’s what your answers suggest about public responsibilities, personal freedom, belonging, and change. Explore the connections and the evidence behind them.</p><div class="result-meta"><span>${e(world.name)}</span><span>${count} recorded responses</span><span>Experimental · v${e(instrument.version)}</span></div></section>
  ${renderResponseReport(report, interpretation)}
  <details class="experimental-summary" id="experimental-profiles"><summary>Explore the four provisional profiles <span>Optional · original scoring rubric</span></summary><div class="results-layout"><section class="result-panel"><span class="eyebrow">Two perspectives</span><h2>Principles &amp; decisions</h2><p>Illustrative positions under the published rubric. Each domain has six statements and one or two scored situations. The assumption statements and records exercise stay outside the markers. This short, unvalidated sample does not establish a reliable ideological classification.</p><div class="profile-legend"><span><i class="legend-dot"></i>Stated values</span><span><i class="legend-dot context"></i>Contextual decisions</span></div>${summary.dimensions.map(result => { const dim = instrument.dimensions.find(d => d.id === result.id); return `<div class="dimension-row"><h3>${e(dim.label)}</h3><div class="scale-labels"><span>${e(dim.left)}</span><span>${e(dim.right)}</span></div><div class="scale-line" aria-hidden="true">${result.statements.mean === null ? '' : `<span class="marker" style="left:${(result.statements.mean + 2) / 4 * 100}%"></span>`}${result.scenarios.mean === null ? '' : `<span class="marker context" style="left:${(result.scenarios.mean + 2) / 4 * 100}%"></span>`}</div><div class="coverage"><span>Values: ${result.statements.count}/${result.statements.total} included</span><span>Situations: ${result.scenarios.count}/${result.scenarios.total} included</span></div><p class="profile-text">Values: ${e(profilePosition(result.statements.mean, dim))}.<br>Situations: ${e(profilePosition(result.scenarios.mean, dim))}.</p></div>`; }).join('')}</section>
  <aside class="results-aside"><section class="result-panel"><span class="eyebrow">Interpret with care</span><h2>A reflection,<br>not a verdict.</h2><p>Different choices can reflect responsibilities, uncertainty, or competing needs. A difference between the two markers is not a measure of hypocrisy.</p><p>These categories are provisional. Their positions are not validated equivalent measurements, and they are not population percentiles.</p><button class="text-button" data-action="method">How the summaries work →</button></section><section class="result-panel"><span class="eyebrow">What stays separate</span><p>Uncertainty, skipped items, and “none of these” are excluded from the directional summaries. Your reasons and optional personal preferences remain visible in your report. Personal preferences are recorded separately from role actions and do not alter any score.</p><p>The repeated housing situation is shown separately, so it does not count twice. The public-records exercise is also excluded from the markers: its transparency and staffing tradeoff needs its own construct review.</p></section></aside></div></details>
  <details class="raw-response-record" id="raw-foundations"><summary>Review all starting assumptions and research traditions</summary>${foundationDebrief()}</details>
  <section class="comparison-card"><span class="eyebrow orange">A closer look · Context comparison</span><h2>When the deadline changed.</h2><p>${e(comparison.changedCondition)}</p><div class="comparison-pair"><div><h3>Urgent school repairs</h3><p>${e(answerText(original, session.answers[`scenario:${original.id}`]))}</p></div><div><h3>More time for repairs</h3><p>${e(answerText(comparison, session.answers[`scenario:${comparison.id}`]))}</p></div></div><p><strong>${pair.changed === null ? 'There is not enough information to compare two actions.' : pair.changed ? 'You chose a different action in the second version.' : 'You chose the same action in both versions.'}</strong> This describes these answers. The fixed order and repeated dilemma mean we cannot establish why a choice changed, or infer a general trait.</p></section>
  <details class="raw-response-record" id="raw-decisions"><summary>Review the full decision and value-statement record</summary><section class="evidence-section"><span class="eyebrow">The detail behind the summary</span><h2 style="margin-top:10px">Your recorded decisions.</h2>${instrument.scenarios.map(scene => { const answer = session.answers[`scenario:${scene.id}`]; const reason = scene.reasons.find(r => r.id === answer?.reasonId); return `<details><summary>${e(scene.title)}${scene.comparisonOf ? ' — comparison' : scene.scoring === 'descriptive' ? ' — exploratory' : ''}</summary><div class="evidence-body"><p>${e(scene.roleLabel)} · ${e(scene.setting)}</p><p><strong>Your response in this role:</strong> ${e(answerText(scene, answer))}</p><p><strong>Your personal preference:</strong> ${e(personalPreferenceText(scene, answer))}</p><p><strong>Your selected reason:</strong> ${reason ? e(reason.label) : 'No reason selected'}</p><p><strong>Responsibility:</strong> ${e(scene.authority)}</p>${scene.scoring === 'descriptive' ? '<p><strong>Interpretation:</strong> This exploratory exercise does not contribute to the civil marker. Choosing request-led access within the same legal safeguards does not establish support for public-order restrictions.</p>' : ''}</div></details>`; }).join('')}<details><summary>Review your ${instrument.statements.length} value statements</summary><div class="evidence-body">${instrument.statements.map(item => `<p><strong>${e(item.text)}</strong><br>${e(answerText(item, session.answers[`statement:${item.id}`], true))}</p>`).join('')}</div></details></section></details>
  <section id="country-reveal" class="comparison-card"><span class="eyebrow orange">The setting revealed</span><h2>${e(world.name)}</h2><p><strong>${e(world.inspiration)}.</strong> Its real-world inspiration was withheld during the decisions to give you room to consider the stated institutions and constraints.</p><p>The setting combines selected institutional features with invented events, permissions, and geography. It is not a simulation of a country or a description of its people. These facts can suggest an inspiration; concealing its label does not establish a blinded experiment.</p><button class="text-button" data-action="worlds">Reveal all eight correspondences →</button></section>
  <div id="report-downloads" class="results-actions"><button class="button" data-action="report">Download readable report <span aria-hidden="true">↓</span></button><button class="button secondary" data-action="print-report">Print / save as PDF</button><button class="button secondary" data-action="export">Export response data (JSON) <span aria-hidden="true">↓</span></button><button class="button secondary" data-action="back">Review previous answer</button><button class="button secondary" data-action="restart">Start again</button><button class="text-button" data-action="erase">Erase my answers</button></div><p class="full-width-note">The readable report is a text file; the JSON export preserves structured response data. Printing lets you save a PDF where your browser supports it. All include personal answers and the revealed setting. Nothing is uploaded.</p>`;
}

function renderAssessment(shouldFocus = true) {
  if (!session) { renderHome(); return; }
  screen = 'assessment';
  const step = steps[session.stepIndex];
  document.title = step.type === 'results' ? 'Your debrief — Political Context' : 'Assessment — Political Context';
  const body = ['statement', 'foundation'].includes(step.type) ? statementView(step) : step.type === 'briefing' ? briefingView(step) : step.type === 'scenario' ? scenarioView(step) : resultsView();
  app.innerHTML = notice() + topProgress(step) + body;
  if (shouldFocus) focusContent();
}

function showDialog(kind) {
  if (kind === 'method') {
    dialogContent.innerHTML = `<h2 id="dialog-title">An inquiry, in progress.</h2><p>Political Context explores the relationship between values expressed in general and choices made with specific responsibilities. This is an early instrument prototype, not a validated political test or an active recruitment study.</p><ul><li><strong>${instrument.statements.length} statements:</strong> six each about economic priorities, shared obligations, rights, and cultural change.</li><li><strong>${instrument.foundations.items.length} assumption statements:</strong> exploratory premises about social reality, values, knowledge, and institutions. Responses are shown individually and never contribute to the four profile markers.</li><li><strong>${instrument.worlds.length} fictional worlds:</strong> one is assigned randomly. Institutional facts are visible throughout; real-world inspirations are revealed in the final debrief. These are authored settings, not representations of national populations.</li><li><strong>${instrument.scenarios.filter(scene => !scene.comparisonOf).length} main situations:</strong> all five roles, in city and rural settings. One of these, public records, is descriptive only. A further situation revisits housing with a different repair deadline.</li></ul><p>Statement agreement runs from −2 to +2, with item direction recorded in the content bank. Scored actions use a provisional −2 to +2 rubric. The public-records exercise is excluded because its transparency and staff-capacity tradeoff does not establish a civil-liberties preference. Each domain’s mean is shown separately for statements and main decisions. Reasons and optional personal preferences do not score. The personal-preference prompt keeps the same packages and material constraints, and does not establish a hidden or more authentic ideology. The comparison is excluded from the main summary.</p><p>Two scenarios per domain cannot establish a stable ideological scale. Country and role descriptions bundle several conditions; statements may prime later choices. Fixed question and option order may also affect responses. Independent review, cognitive interviews, and validation studies remain ahead.</p>${session?.completed ? '<p><a href="docs/RESEARCH.md">Read the research specification</a> · <a href="docs/FOUNDATIONS.md">Read the assumptions framework</a> · <a href="js/content.js">Inspect the items and provisional rubric</a></p>' : '<p>Research documents and author-review materials reveal the country inspirations and research lenses. Links become available after your debrief.</p>'}<p class="version-note">Pilot ${e(instrument.version)}. Built on the MIT-licensed 8values fork. This edition includes all eight planned country inspirations and all five roles. The content is awaiting independent review.</p>`;
  } else if (kind === 'worlds') {
    dialogContent.innerHTML = `<h2 id="dialog-title">Eight fictional societies.</h2><p>Each briefing is an author draft describing institutions in the exercise, not the people of a real country. Real-world correspondences are revealed after the assessment. The settings have not yet undergone independent country-context review.</p><p>Browsing does not choose your assignment or change an existing assessment.</p><div class="world-review-list">${instrument.worlds.map(world => `<details><summary><span class="world-code" aria-hidden="true">${e(world.code)}</span><span>${e(world.name)}${session?.completed ? `<small>${e(world.inspiration)}</small>` : ''}</span></summary><div><p>${e(world.summary)}</p>${world.institutions.map(fact => `<p><strong>${e(fact.label)}:</strong> ${e(fact.text)}</p>`).join('')}</div></details>`).join('')}</div><p class="version-note">All ${instrument.roles.length} roles appear in every route. The same decision families are used across settings, with explicit institutional notes. This does not establish cross-country measurement equivalence.</p>`;
  } else if (kind === 'review') {
    if (!session?.completed) {
      dialogContent.innerHTML = `<h2 id="dialog-title">Research materials after your debrief.</h2><p>The bilingual review workspace and author packet include the real-world country inspirations, item rationales, and political-tradition lenses. To keep these details out of your decisions, participant links become available after the assessment.</p><p>This does not enroll you in research. Independent content review and comprehension interviews are still pending.</p><div class="dialog-actions"><button class="button" data-action="close-dialog">Return to the assessment</button></div>`;
    } else dialogContent.innerHTML = `<h2 id="dialog-title">Make the assumptions visible.</h2><p>This edition is ready for content inspection and technical testing. Human comprehension interviews and independent rubric review are still pending.</p><ol><li>Can readers explain their role’s powers and limits?</li><li>Are the actions feasible and the tradeoffs equally clear?</li><li>Does the country briefing introduce assumptions the scenario does not state?</li><li>Does the housing pair preserve everything except the repair deadline?</li></ol><p><a href="review.html">Open the bilingual review workspace / Không gian rà soát song ngữ</a> · <a href="docs/PILOT-GUIDE.md">Open the cognitive interview guide</a> · <a href="docs/review-log-template.csv" download>Download an empty review log</a></p><div class="dialog-actions"><button class="button" data-action="packet">Download review packet <span aria-hidden="true">↓</span></button><button class="button secondary" data-action="close-dialog">Done</button></div><p class="version-note">The packet contains the complete authored instrument and provisional rubric. It contains no personal responses or saved session. Downloading it does not enroll anyone in a study.</p>`;
  } else if (kind === 'privacy') {
    dialogContent.innerHTML = `<h2 id="dialog-title">Your answers stay with you.</h2><p>This prototype processes your responses in your browser. It has no response-collection endpoint, advertising, tracking scripts, or remote fonts. As with any hosted site, the host may keep ordinary request logs; answers are not included in those requests.</p><p>Progress is saved for the current tab when browser storage is available. Choosing device storage also keeps a copy after you close the tab, until you erase it. Other open tabs may retain separate copies after erasure. Anyone using this browser profile may be able to access that copy.</p>${session ? saveControl() : '<p>Device storage is off by default. You can enable it during the assessment.</p>'}<p>An export contains your answers, assignment, instrument version, and provisional summary. Downloading does not submit it to a study.</p><div class="dialog-actions"><button class="button secondary" data-action="erase">Erase saved answers</button><button class="button" data-action="close-dialog">Got it</button></div><p class="version-note">Future research collection needs a separate study protocol and informed consent. This prototype does not collect research data.</p>`;
  } else if (kind === 'begin') {
    dialogContent.innerHTML = `<h2 id="dialog-title">A little room to think.</h2><p>Begin with value statements and exploratory assumptions about political life. Then you’ll take five roles in one randomly assigned fictional society. Its real-world inspiration is revealed at the end. Read each role’s powers and constraints before choosing.</p><p>You can go back, skip an item, or choose “uncertain.” Your responses stay in your browser. This is a self-guided prototype, not enrollment in a research study.</p>${recoverySave ? '<p class="notice">Your previous save is incompatible with this edition. Download it before beginning; a new assessment replaces the stored save. <button class="text-button" data-action="recover-save">Download the previous save</button></p>' : ''}<label class="check-label"><input id="initial-save" type="checkbox"><span>Remember my progress on this device.<br><small>Leave unchecked to keep progress in this tab only.</small></span></label><div class="dialog-actions"><button class="button" data-action="start">Let’s begin <span aria-hidden="true">→</span></button><button class="button secondary" data-action="close-dialog">Not now</button></div>`;
  } else if (kind === 'erase' || kind === 'restart') {
    dialogContent.innerHTML = `<h2 id="dialog-title">${kind === 'restart' ? 'Begin with a clean page?' : 'Erase your answers?'}</h2><p>This removes this assessment’s saved answers from the current tab and the saved device copy. Other open tabs may retain their own copies. ${kind === 'restart' ? 'A fresh assessment will receive a new random setting assignment.' : 'Files you already exported are not deleted.'}</p><div class="dialog-actions"><button class="button" data-action="${kind === 'restart' ? 'confirm-restart' : 'confirm-erase'}">${kind === 'restart' ? 'Erase and start again' : 'Erase my answers'}</button><button class="button secondary" data-action="close-dialog">Keep my progress</button></div>`;
  }
  if (!dialog.open) dialog.showModal();
}

function startAssessment(remember = false) {
  try {
    storageWarning = '';
    session = createSession(instrument);
    session.saveOnDevice = remember;
    persist();
    dialog.close();
    renderAssessment();
  } catch (error) {
    storageWarning = error.message;
    dialog.close();
    renderHome();
  }
}

function advance(skip = false) {
  const step = steps[session.stepIndex];
  if (skip && ['statement', 'foundation', 'scenario'].includes(step.type)) {
    session = setAnswer(session, step.id, step.type !== 'scenario' ? { kind: 'skip' } : { kind: 'skip', reasonId: null });
  }
  if (step.type !== 'briefing' && !session.answers[step.id]) return;
  if (session.stepIndex >= steps.length - 1) return;
  session.stepIndex += 1;
  session.completed = steps[session.stepIndex].type === 'results';
  persist();
  renderAssessment();
}

function exportResponses() {
  if (!session?.completed) return;
  const payload = {
    format: 'political-context-response-export',
    exportVersion: 2,
    note: 'Experimental local prototype. Summaries are not validated ideological measurements.',
    session,
    assignmentReveal: (() => { const world = instrument.worlds.find(item => item.id === session.worldId); return {worldId: world.id, name: world.name, inspiration: world.inspiration}; })(),
    summary: summarize(instrument, session),
    presentedOptionOrder: Object.fromEntries(instrument.scenarios.map(s => [s.id, s.options.map(o => o.id)])),
  };
  downloadJson(payload, `political-context-${instrument.version}.json`);
  announce('Your responses were exported to a file on your device.');
}

function downloadJson(payload, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportReadableReport() {
  if (!session?.completed) return;
  const url = URL.createObjectURL(new Blob([createTextReport(instrument, session)], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `political-context-reflection-${instrument.version}.txt`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce('Your readable reflection report was downloaded to your device. Nothing was submitted.');
}

let printDetailState = null;
function prepareReportPrint() {
  if (!session?.completed || screen !== 'assessment' || printDetailState) return;
  printDetailState = [...app.querySelectorAll('.report-theme, .theme-evidence, .decision-circumstances')].map(detail => [detail, detail.open]);
  printDetailState.forEach(([detail]) => { detail.open = true; });
  document.body.classList.add('printing-debrief');
}
function restoreReportPrint() {
  printDetailState?.forEach(([detail, open]) => { detail.open = open; });
  printDetailState = null;
  document.body.classList.remove('printing-debrief');
}
window.addEventListener('beforeprint', prepareReportPrint);
window.addEventListener('afterprint', restoreReportPrint);

function exportRecoveredSave() {
  if (!recoverySave) return;
  downloadJson({format: 'political-context-save-recovery', note: 'Unvalidated previous browser save, preserved as text. Not migrated or used in the current assessment.', previousSave: recoverySave}, 'political-context-previous-save.json');
  announce('The previous save was downloaded. It has not been migrated into this assessment.');
}

function exportReviewPacket() {
  if (!session?.completed) return;
  const main = instrument.scenarios.filter(scene => !scene.comparisonOf);
  const coverage = {
    worlds: instrument.worlds.map(world => world.id),
    roles: instrument.roles.map(role => role.id),
    localities: [...new Set(main.map(scene => scene.locality))],
    statementCount: instrument.statements.length,
    foundationCount: instrument.foundations.items.length,
    mainScenarioCount: main.length,
    directionalScenarioCount: main.filter(scene => scene.scoring !== 'descriptive').length,
    descriptiveScenarioCount: main.filter(scene => scene.scoring === 'descriptive').length,
    comparisonCount: instrument.scenarios.length - main.length,
    dimensions: instrument.dimensions.map(dim => ({id: dim.id, statements: instrument.statements.filter(item => item.dimension === dim.id).length, mainScenarios: main.filter(scene => scene.dimension === dim.id).length, directionalScenarios: main.filter(scene => scene.dimension === dim.id && scene.scoring !== 'descriptive').length})),
  };
  downloadJson({format: 'political-context-review-packet', packetVersion: 1, reviewStatus: 'author-draft', instrument, coverage, notes: ['Authored content awaiting independent review and cognitive interviewing.', 'No participant responses or saved session are included.', 'The rubric and context comparison are exploratory and unvalidated.']}, `political-context-review-${instrument.version}.json`);
  announce('The author review packet was downloaded. It contains no personal responses.');
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  event.preventDefault();
  if (['method', 'privacy', 'begin', 'erase', 'restart', 'worlds', 'review'].includes(action)) { showDialog(action); return; }
  if (action === 'packet') { exportReviewPacket(); return; }
  if (action === 'recover-save') { exportRecoveredSave(); return; }
  if (action === 'close-dialog') { dialog.close(); return; }
  if (action === 'start') { startAssessment(document.querySelector('#initial-save').checked); return; }
  if (action === 'resume') { renderAssessment(); return; }
  if (action === 'home') { renderHome(); focusContent(); return; }
  if (action === 'confirm-erase') { clearSaved(); dialog.close(); renderHome(); focusContent(); return; }
  if (action === 'confirm-restart') { clearSaved(); startAssessment(false); return; }
  if (!session) return;
  if (action === 'show-evidence' && session.completed && screen === 'assessment') {
    const record = document.getElementById(`evidence-${button.dataset.evidenceTarget}`);
    if (!record || !app.contains(record)) return;
    for (let details = record.parentElement.closest('details'); details; details = details.parentElement?.closest('details')) details.open = true;
    record.focus({ preventScroll: true });
    record.scrollIntoView({ block: 'center' });
    announce('The supporting response is expanded and focused.');
    return;
  }
  if (action === 'next') advance();
  if (action === 'skip') advance(true);
  if (action === 'back' && session.stepIndex > 0) {
    session.stepIndex -= 1;
    session.completed = false;
    persist();
    renderAssessment();
  }
  if (action === 'export') exportResponses();
  if (action === 'report') exportReadableReport();
  if (action === 'print-report' && session.completed) {
    prepareReportPrint();
    try { window.print(); } catch { restoreReportPrint(); announce('Printing is unavailable. You can download the readable report instead.'); }
  }
});

document.addEventListener('change', event => {
  const target = event.target;
  if (target.matches('[data-setting="save"]') && session) {
    session.saveOnDevice = target.checked;
    const stored = persist();
    document.querySelectorAll('[data-setting="save"]').forEach(input => { input.checked = target.checked; });
    if (stored) announce(target.checked ? 'Progress will also be saved on this device.' : 'Device storage is off. Progress remains in this tab.');
    return;
  }
  if (!session || screen !== 'assessment') return;
  const step = steps[session.stepIndex];
  if (target.matches('[data-response]')) {
    const kind = target.dataset.response;
    const oldAnswer = session.answers[step.id];
    let answer;
    if (['statement', 'foundation'].includes(step.type)) answer = kind === 'value' ? { kind, value: Number(target.value) } : { kind };
    else answer = kind === 'choice' ? { kind, optionId: target.value, reasonId: oldAnswer?.kind === 'choice' ? oldAnswer.reasonId : null } : { kind, reasonId: null };
    if (step.type === 'scenario' && oldAnswer && Object.hasOwn(oldAnswer, 'preference')) answer.preference = oldAnswer.preference;
    session = setAnswer(session, step.id, answer);
    persist();
    const next = document.querySelector('[data-action="next"]');
    if (next) next.disabled = false;
    const preference = document.querySelector('#personal-preference');
    if (preference) preference.disabled = false;
    const reason = document.querySelector('#reason');
    if (reason) { reason.disabled = kind !== 'choice'; reason.value = answer.reasonId || ''; }
  }
  if (target.id === 'personal-preference' && step.type === 'scenario' && session.answers[step.id]) {
    const preference = target.value.startsWith('option:') ? {kind: 'choice', optionId: target.value.slice(7)} : target.value ? {kind: target.value} : null;
    session = setAnswer(session, step.id, {...session.answers[step.id], preference});
    persist();
  }
  if (target.id === 'reason' && session.answers[step.id]?.kind === 'choice') {
    session = setAnswer(session, step.id, { ...session.answers[step.id], reasonId: target.value || null });
    persist();
  }
});

dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }
});

const errors = validateInstrument(instrument);
if (errors.length) app.innerHTML = '<p class="notice">The assessment content could not be loaded. Please refresh or try again later.</p>';
else renderHome();
