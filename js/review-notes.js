/**
 * Local reviewer worksheet model. This module does not access assessment
 * answers, browser storage, or a network service. Fingerprints detect content
 * changes for review; they are not signatures or security guarantees.
 */
export const REVIEW_STORAGE_KEY = 'political-context-review-notes';
export const MAX_REVIEW_BYTES = 1024 * 1024;
export const CRITERIA = Object.freeze(['clarity', 'construct', 'viewpoint', 'translation', 'authority', 'feasibility', 'facts', 'source', 'other']);
export const OUTCOMES = Object.freeze(['revise', 'discuss', 'no-issue']);
export const LANGUAGES = Object.freeze(['en', 'vi', 'both']);
export const SEVERITIES = Object.freeze(['none', 'minor', 'major', 'critical']);
export const CSV_COLUMNS = Object.freeze([
  'review_id', 'instrument_version', 'reviewer_code', 'review_date', 'review_round',
  'review_type', 'world_id', 'item_id', 'role_id', 'criterion', 'severity',
  'observation', 'proposed_change', 'status', 'resolution', 'resolved_in_version',
  'language', 'target_kind', 'target_field', 'source_fingerprint', 'source_note', 'updated_at',
]);

const DOCUMENT_KEYS = ['format', 'notesVersion', 'instrumentId', 'instrumentVersion', 'reviewerCode', 'entries'];
const ENTRY_KEYS = ['id', 'targetKey', 'sourceFingerprint', 'language', 'field', 'criterion', 'severity', 'outcome', 'observation', 'proposedChange', 'resolution', 'sourceNote', 'createdAt', 'updatedAt'];
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const hasExactKeys = (value, keys) => isRecord(value)
  && Reflect.ownKeys(value).length === keys.length
  && keys.every(key => Object.hasOwn(Object.getOwnPropertyDescriptor(value, key) ?? {}, 'value'));
const text = (value, max, required = false) => typeof value === 'string'
  && value.length <= max && (!required || value.trim().length > 0);
const list = value => Array.isArray(value) ? value : [];

// Sorted object keys make an editorial change identifier independent of object
// construction order. Shared references are deliberately serialized by value.
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (isRecord(value)) return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value ?? null);
}

function fingerprint(value) {
  const source = canonical(value);
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `rv1-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export function createReviewNotes(instrument) {
  return {
    format: 'political-context-review-notes', notesVersion: 1,
    instrumentId: instrument.id, instrumentVersion: instrument.version,
    reviewerCode: '', entries: [],
  };
}

/** Targets include every setting-specific scenario, not just the visible filter. */
export function buildReviewTargets(instrument, translations, evidence = null) {
  const targets = [];
  const add = (kind, item, translated, context = null, world = null) => {
    const key = `${kind}:${item.id}${world ? `:${world.id}` : ''}`;
    targets.push({
      key, kind, itemId: item.id, worldId: world?.id ?? null,
      roleId: kind === 'scenario' ? item.role : null,
      label: `${item.title ?? item.label ?? item.name ?? item.text}${world ? ` · ${world.name}` : ''}`,
      fingerprint: fingerprint({ item, translated, context }),
    });
  };
  for (const item of list(instrument.statements)) {
    const dimension = list(instrument.dimensions).find(row => row.id === item.dimension);
    add('statement', item, translations.items?.statements?.[item.id], {
      dimension, translatedDimension: translations.items?.dimensions?.[item.dimension],
    });
  }
  for (const item of list(instrument.foundations?.items)) {
    const evidenceItem = list(evidence?.items).find(row => row.itemId === item.id);
    add('foundation', item, translations.foundations?.items?.[item.id], {
      category: list(instrument.foundations?.categories).find(row => row.id === item.category),
      translatedCategory: translations.foundations?.categories?.[item.category],
      lenses: list(item.lenses).map(id => list(instrument.foundations?.lenses).find(row => row.id === id)),
      translatedLenses: list(item.lenses).map(id => translations.foundations?.lenses?.[id]),
      evidence: evidenceItem ?? null,
      sources: list(evidenceItem?.links).map(link => list(evidence?.sources).find(row => row.id === link.sourceId)),
    });
  }
  for (const item of list(instrument.foundations?.lenses)) {
    add('lens', item, translations.foundations?.lenses?.[item.id]);
  }
  for (const world of list(instrument.worlds)) {
    add('world', world, translations.worlds?.worlds?.[world.id]);
    for (const item of list(instrument.scenarios)) {
      const translatedWorld = translations.worlds?.worlds?.[world.id];
      add('scenario', item, translations.items?.scenarios?.[item.id], {
        world: { id: world.id, name: world.name, inspiration: world.inspiration,
          summary: world.summary, institutions: world.institutions,
          scenarioNote: world.scenarioNotes?.[item.id] ?? item.worldNotes?.[world.id] },
        translatedWorld: translatedWorld ? {
          name: translatedWorld.name, inspiration: translatedWorld.inspiration,
          summary: translatedWorld.summary, institutions: translatedWorld.institutions,
          scenarioNote: translatedWorld.scenarioNotes?.[item.id],
        } : null,
        dimension: list(instrument.dimensions).find(row => row.id === item.dimension),
        translatedDimension: translations.items?.dimensions?.[item.dimension],
      }, world);
    }
  }
  return targets;
}

const validTimestamp = value => {
  if (typeof value !== 'string' || value.length !== 24) return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString() === value;
};

/** Reject malformed or foreign notes without changing the caller's data. */
export function validateReviewNotes(instrument, targets, candidate) {
  const invalid = error => ({ valid: false, error, staleEntryIds: [] });
  if (!hasExactKeys(candidate, DOCUMENT_KEYS)) return invalid('The review file has an unexpected structure.');
  if (candidate.format !== 'political-context-review-notes' || candidate.notesVersion !== 1) {
    return invalid('This is not a supported reviewer worksheet.');
  }
  if (candidate.instrumentId !== instrument.id || candidate.instrumentVersion !== instrument.version) {
    return invalid('These notes belong to a different instrument or version. Keep the original file for reference.');
  }
  if (!text(candidate.reviewerCode, 120)) return invalid('The reviewer code must be text of at most 120 characters.');
  if (!Array.isArray(candidate.entries) || candidate.entries.length > 2000) {
    return invalid('The worksheet must contain at most 2000 entries.');
  }
  if (Reflect.ownKeys(candidate.entries).length !== candidate.entries.length + 1
    || Array.from({ length: candidate.entries.length }, (_, index) =>
      Object.getOwnPropertyDescriptor(candidate.entries, String(index)))
      .some(descriptor => !Object.hasOwn(descriptor ?? {}, 'value'))) {
    return invalid('The review entries must be a plain, complete list.');
  }
  if (!Array.isArray(targets)) return invalid('Review targets are unavailable.');
  const targetMap = new Map(targets.map(target => [target.key, target]));
  const ids = new Set();
  const staleEntryIds = [];
  for (const entry of candidate.entries) {
    if (!hasExactKeys(entry, ENTRY_KEYS)) return invalid('A review entry has unexpected or missing fields.');
    if (typeof entry.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,99}$/.test(entry.id) || ids.has(entry.id)) {
      return invalid('Review entry IDs must be distinct, valid identifiers.');
    }
    ids.add(entry.id);
    if (typeof entry.targetKey !== 'string' || !targetMap.has(entry.targetKey)) return invalid('A review entry references unknown content or a setting.');
    if (typeof entry.sourceFingerprint !== 'string' || !/^rv1-[0-9a-f]{8}$/.test(entry.sourceFingerprint)) {
      return invalid('A review entry has an invalid source fingerprint.');
    }
    if (!LANGUAGES.includes(entry.language) || !CRITERIA.includes(entry.criterion)
      || !SEVERITIES.includes(entry.severity) || !OUTCOMES.includes(entry.outcome)) {
      return invalid('A review entry has an unsupported language, criterion, severity, or outcome.');
    }
    if ((entry.outcome === 'no-issue') !== (entry.severity === 'none')) {
      return invalid('Use severity none only for a no-issue observation; revisions and discussion need minor, major, or critical.');
    }
    if (!text(entry.field, 120, true) || !text(entry.observation, 4000, entry.outcome !== 'no-issue')
      || !text(entry.proposedChange, 4000) || !text(entry.resolution, 4000) || !text(entry.sourceNote, 2000)) {
      return invalid('Review text is missing or exceeds its field limit.');
    }
    if (!validTimestamp(entry.createdAt) || !validTimestamp(entry.updatedAt) || entry.updatedAt < entry.createdAt) {
      return invalid('Review dates must be UTC ISO timestamps, with an update no earlier than creation.');
    }
    if (entry.sourceFingerprint !== targetMap.get(entry.targetKey).fingerprint) staleEntryIds.push(entry.id);
  }
  try {
    if (new TextEncoder().encode(JSON.stringify(candidate)).length > MAX_REVIEW_BYTES) {
      return invalid('The review file exceeds the 1 MiB limit.');
    }
  } catch {
    return invalid('The review file cannot be serialized.');
  }
  return { valid: true, staleEntryIds };
}

/** Entries contain primitive values, so a shallow copy protects prior documents. */
export function upsertReviewEntry(notes, entry) {
  const found = notes.entries.some(row => row.id === entry.id);
  return { ...notes, entries: found
    ? notes.entries.map(row => row.id === entry.id ? { ...entry } : { ...row })
    : [...notes.entries.map(row => ({ ...row })), { ...entry }] };
}

export function removeReviewEntry(notes, id) {
  return { ...notes, entries: notes.entries.filter(row => row.id !== id).map(row => ({ ...row })) };
}

// A leading apostrophe neutralizes spreadsheet formulas and prefixes that
// spreadsheet applications may trim before evaluating a formula. CSV always
// quotes cells and uses CRLF; the UTF-8 BOM preserves Vietnamese in common apps.
const csvCell = value => {
  let cell = String(value ?? '');
  if (/^[\s\u0000-\u001f\u007f=+\-@]/u.test(cell)) cell = `'${cell}`;
  return `"${cell.replaceAll('"', '""')}"`;
};

export function reviewNotesCsv(notes, targets) {
  const targetMap = new Map(targets.map(target => [target.key, target]));
  const rows = notes.entries.map(entry => {
    const target = targetMap.get(entry.targetKey);
    if (!target) throw new Error('Cannot export a review note for unknown content.');
    return [
      entry.id, notes.instrumentVersion, notes.reviewerCode, entry.createdAt.slice(0, 10), '',
      'worksheet', target.worldId ?? '', target.itemId, target.roleId ?? '', entry.criterion, entry.severity,
      entry.observation, entry.proposedChange, entry.outcome, entry.resolution, '',
      entry.language, target.kind, entry.field, entry.sourceFingerprint, entry.sourceNote, entry.updatedAt,
    ];
  });
  return `\uFEFF${[CSV_COLUMNS, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}
