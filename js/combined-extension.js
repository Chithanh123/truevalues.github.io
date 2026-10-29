/** Render the 60 authored draft questions inside the main assessment.
 * The parent owns navigation and persistence; no storage is opened here.
 */
import { instrument } from './content.js';
import { expandedItemIds } from './combined-session.js';

const statementValues = ['strongly_agree', 'agree', 'neutral', 'disagree', 'strongly_disagree', 'uncertain', 'skip'];
const choiceValues = ['A', 'B', 'C', 'uncertain', 'none', 'skip'];
const concreteChoices = new Set(['A', 'B', 'C']);
const labels = {
  strongly_agree: 'Strongly agree', agree: 'Agree', neutral: 'Neither agree nor disagree',
  disagree: 'Disagree', strongly_disagree: 'Strongly disagree', uncertain: 'Uncertain',
  none: 'None of these represents my decision', skip: 'Skip',
};
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));
const inline = value => escape(value).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');

/** Render only simple authored Markdown, escaping every authored character first. */
function markdown(source) {
  return String(source ?? '').replace(/\r\n?/g, '\n').split(/\n\s*\n/).map(block => {
    const lines = block.split('\n');
    if (lines.every(line => /^\s*\|.*\|\s*$/.test(line)) && lines.length >= 2 && /^\s*\|[\s:|\-]+\|\s*$/.test(lines[1])) {
      const cells = line => line.trim().slice(1, -1).split('|').map(cell => cell.trim());
      return `<div class="expanded-table-scroll"><table><thead><tr>${cells(lines[0]).map(cell => `<th scope="col">${inline(cell)}</th>`).join('')}</tr></thead><tbody>${lines.slice(2).map(line => `<tr>${cells(line).map(cell => `<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    if (lines.every(line => /^\s*[-*] /.test(line))) return `<ul>${lines.map(line => `<li>${inline(line.replace(/^\s*[-*] /, ''))}</li>`).join('')}</ul>`;
    return `<p>${lines.map(inline).join('<br>')}</p>`;
  }).join('');
}

/** Copy the validator's ordering so the renderer cannot drift from it. */
export function combinedExtensionIds() { return [...expandedItemIds]; }

function currentItem(catalog, session) {
  const index = session?.expanded?.index;
  if (!Number.isInteger(index) || index < 0 || index >= 60 || !Array.isArray(catalog?.items)) throw new Error('Invalid extended question position');
  const id = combinedExtensionIds()[index];
  const item = catalog.items.find(entry => entry.id === id);
  if (!item) throw new Error(`Missing question ${id}`);
  return item;
}

/** Pure HTML renderer for the current question; never renders country inspiration. */
export function renderCombinedExtension(catalog, session) {
  const item = currentItem(catalog, session);
  const index = session.expanded.index;
  const answer = session.expanded.answers[item.id];
  const world = instrument.worlds.find(entry => entry.id === session.legacy?.worldId);
  if (!world) throw new Error('Missing fictional setting');
  const isScenario = item.kind === 'scenario';
  const selected = isScenario ? answer?.choice : answer;
  const values = isScenario ? choiceValues : statementValues;
  const prompt = isScenario
    ? `<p class="eyebrow orange">Situation · ${escape(item.locality)} · ${escape(item.id)}</p><h1 class="question-title" id="step-title" tabindex="-1">${escape(item.title)}</h1><div class="expanded-briefing">${markdown(item.briefings.en)}</div>`
    : `<p class="eyebrow orange">Statement · ${escape(item.id)}</p><h1 class="question-title" id="step-title" tabindex="-1">${escape(item.texts.en.text)}</h1>`;
  const options = values.map(value => {
    const option = isScenario && concreteChoices.has(value) ? item.options.find(entry => entry.id === value) : null;
    const title = option ? `${value} — ${option.texts.en.label}` : labels[value];
    const description = option ? `<small>${escape(option.texts.en.description)}</small><small>${escape(option.texts.en.tradeoff)}</small>` : '';
    return `<label class="expanded-answer"><input type="radio" name="combined-response" value="${escape(value)}" ${selected === value ? 'checked' : ''}><span><strong>${escape(title)}</strong>${description}</span></label>`;
  }).join('');
  const reasons = isScenario ? item.reasons.en.map(reason => `<option value="${escape(reason)}" ${answer?.reason === reason ? 'selected' : ''}>${escape(reason)}</option>`).join('') : '';
  const preferences = isScenario ? choiceValues.map(value => {
    const option = concreteChoices.has(value) ? item.options.find(entry => entry.id === value) : null;
    const label = option ? `${value} — ${option.texts.en.label}` : labels[value];
    return `<option value="${escape(value)}" ${answer?.preference === value ? 'selected' : ''}>${escape(label)}</option>`;
  }).join('') : '';
  const followup = isScenario ? `<div class="expanded-followup"><div id="combined-reason-wrapper" ${!concreteChoices.has(selected) ? 'hidden' : ''}><label for="combined-reason">Optional reason for your choice</label><select id="combined-reason"><option value="">No reason selected</option>${reasons}</select></div><div><label for="combined-preference">${escape(item.personalPreferencePrompt.en)}</label><select id="combined-preference" ${selected ? '' : 'disabled'}><option value="">No personal preference selected</option>${preferences}</select></div><p>Your personal preference is separate from your assigned-role decision. A difference does not establish why it occurred.</p></div>` : '';
  return `<section class="combined-extension" aria-labelledby="step-title"><div class="expanded-progress-row"><p id="combined-progress" role="status">Question ${50 + index} of 109</p><progress max="109" value="${49 + index}" aria-label="Assessment progress"></progress></div><div class="expanded-setting"><strong>Fictional setting: ${escape(world.name)}.</strong> These situations use generic fictional institutions, not reviewed country-specific rules. <details><summary>About this fictional setting</summary><p>${escape(world.summary)}</p></details></div><article class="expanded-question combined-question" data-item-id="${escape(item.id)}">${prompt}<fieldset class="expanded-answer-list"><legend>${isScenario ? 'Which decision would you make?' : 'How much do you agree?'}</legend>${options}</fieldset>${followup}</article><p id="combined-error" class="expanded-error" role="alert" hidden></p><div class="expanded-navigation"><button type="button" class="button secondary" data-action="combined-back">← Back</button><button type="button" class="button" data-action="combined-next">${index === 59 ? 'See your results →' : 'Continue →'}</button></div></section>`;
}

/** Read the currently selected response. A missing primary response is null. */
export function captureCombinedExtension(root, catalog, session) {
  const item = currentItem(catalog, session);
  const selected = root.querySelector('input[name="combined-response"]:checked')?.value;
  if (!selected) return null;
  if (item.kind !== 'scenario') return statementValues.includes(selected) ? selected : null;
  if (!choiceValues.includes(selected)) return null;
  const reason = concreteChoices.has(selected) ? root.querySelector('#combined-reason')?.value || null : null;
  const preference = root.querySelector('#combined-preference')?.value || null;
  if (reason && !item.reasons.en.includes(reason)) return null;
  if (preference && !choiceValues.includes(preference)) return null;
  return {choice: selected, reason, preference};
}

/** Keep the optional reason control visible only for a concrete role action. */
export function syncCombinedExtensionVisibility(root) {
  const selected = root.querySelector('input[name="combined-response"]:checked')?.value;
  const wrapper = root.querySelector('#combined-reason-wrapper');
  if (wrapper) wrapper.hidden = !concreteChoices.has(selected);
  const preference = root.querySelector('#combined-preference');
  if (preference) preference.disabled = !selected;
}
