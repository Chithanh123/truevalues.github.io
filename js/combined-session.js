/** Versioned, local-only record for the combined original and extended quiz.
 * The original session stays in its existing strict 0.4.0 format. A setting is
 * assigned exactly once there and reused for the extended questions.
 */
import { summarize, validateSession } from './engine.js';
import { buildExpandedResult } from './expanded-results.js';

export const expandedItemIds = Object.freeze(Array.from({ length: 12 }, (_, i) => {
  const n = i + 13;
  return [...'ABCD'].map(letter => `CR-${n}${letter}`).concat(`CR-S${String(n - 6).padStart(2, '0')}`);
}).flat());
export const expandedQuestionIds = () => [...expandedItemIds];

const STATEMENTS = new Set(['strongly_agree','agree','neutral','disagree','strongly_disagree','uncertain','skip']);
const CHOICES = new Set(['A','B','C','uncertain','none','skip']);
const CONCRETE = new Set(['A','B','C']);
const own = (value, key) => Object.hasOwn(value, key);
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const keys = (value, expected) => Object.keys(value).length === expected.length && expected.every(key => own(value, key));
const clone = value => structuredClone(value);

/** Wrap, but never rewrite or remove, a previous assessment session. */
export function createCombined(legacy, fingerprint) {
  if (!record(legacy) || typeof fingerprint !== 'string' || !/^[0-9a-f]{64}$/.test(fingerprint)) {
    throw new Error('A previous session and a valid question fingerprint are required.');
  }
  return {schemaVersion: 1, legacy: clone(legacy), expanded: {index: 0, answers: {}}, catalogFingerprint: fingerprint};
}

function validAnswer(item, answer) {
  if (item.kind === 'foundation_statement') return typeof answer === 'string' && STATEMENTS.has(answer);
  if (item.kind !== 'scenario' || !record(answer) || !keys(answer, ['choice','reason','preference'])
      || !CHOICES.has(answer.choice)) return false;
  if (!(answer.reason === null || (typeof answer.reason === 'string' && item.reasons?.en?.includes(answer.reason)))) return false;
  if (!(answer.preference === null || CHOICES.has(answer.preference))) return false;
  return CONCRETE.has(answer.choice) || answer.reason === null;
}

/** The fingerprint is calculated from the exact playable questions and worlds. */
export function validateCombined(value, instrument, catalog, expectedFingerprint) {
  const invalid = error => ({valid:false, error});
  if (!record(value) || !keys(value, ['schemaVersion','legacy','expanded','catalogFingerprint']) || value.schemaVersion !== 1) {
    return invalid('The combined save has an unexpected format.');
  }
  if (typeof expectedFingerprint !== 'string' || !/^[0-9a-f]{64}$/.test(expectedFingerprint)
      || value.catalogFingerprint !== expectedFingerprint) return invalid('The playable question set has changed.');
  const legacy = validateSession(instrument, value.legacy);
  if (!legacy.valid) return invalid(`The original assessment save is invalid: ${legacy.error}`);
  const expanded = value.expanded;
  if (!record(expanded) || !keys(expanded, ['index','answers']) || !Number.isInteger(expanded.index)
      || expanded.index < 0 || expanded.index > expandedItemIds.length || !record(expanded.answers)) {
    return invalid('The expanded responses or position are invalid.');
  }
  if (!Array.isArray(catalog?.items)) return invalid('The question catalog is unavailable.');
  const itemMap = new Map(catalog.items.map(item => [item.id, item]));
  if (itemMap.size !== catalog.items.length || expandedItemIds.some(id => !itemMap.has(id))) {
    return invalid('The question catalog is incomplete or ambiguous.');
  }
  const permitted = new Set(expandedItemIds);
  for (const [id, answer] of Object.entries(expanded.answers)) {
    if (!permitted.has(id) || !validAnswer(itemMap.get(id), answer)) return invalid(`Invalid expanded response for ${id}.`);
  }
  if (expandedItemIds.slice(0, expanded.index).some(id => !own(expanded.answers, id))) {
    return invalid('The save advances past an unanswered expanded question.');
  }
  // Answers can remain while the person goes back into the original section.
  // This does not make the combined assessment complete while they are there.
  return {valid:true};
}

export function setExpandedAnswer(session, id, answer) {
  if (!expandedItemIds.includes(id)) throw new Error('Unknown expanded question.');
  if (!record(session?.expanded) || !record(session.expanded.answers)) throw new Error('Invalid expanded session.');
  return {...session, expanded: {...session.expanded, answers: {...session.expanded.answers, [id]: clone(answer)}}};
}

export function setExpandedIndex(session, index) {
  if (!Number.isInteger(index) || index < 0 || index > expandedItemIds.length || !record(session?.expanded)) {
    throw new Error('Invalid expanded position.');
  }
  return {...session, expanded: {...session.expanded, index}};
}

export function isCombinedComplete(session, instrument, catalog, fingerprint) {
  return validateCombined(session, instrument, catalog, fingerprint).valid
    && session.legacy.completed && session.expanded.index === expandedItemIds.length;
}

/** Final export is gated: a partial quiz never discloses country inspiration. */
export function createCombinedExport(session, instrument, catalog, fingerprint) {
  if (!isCombinedComplete(session, instrument, catalog, fingerprint)) throw new Error('Complete both sections before exporting results.');
  const world = instrument.worlds.find(candidate => candidate.id === session.legacy.worldId);
  if (!world) throw new Error('The assigned fictional setting is unavailable.');
  return {
    format:'political-context-combined-response-export', exportVersion:1,
    note:'Experimental descriptive results; the expanded questions do not add scores or identify an ideology.',
    session:clone(session),
    assignmentReveal:{worldId:world.id, name:world.name, inspiration:world.inspiration},
    originalSummary:summarize(instrument, session.legacy),
    expandedInterpretation:buildExpandedResult(catalog, {answers:session.expanded.answers}),
  };
}
