#!/usr/bin/env node
/** Structural checks for an authored source-verification queue, not source approval. */
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const record = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const idPattern = /^[a-z][a-z0-9-]*$/;
const verificationStates = new Set(['unverified', 'metadata-checked', 'text-checked']);

export function validateEvidence(instrument, evidence) {
  const errors = [];
  const fail = message => errors.push(message);
  const keys = (value, expected, at) => {
    if (!record(value) || Object.keys(value).length !== expected.length
      || !expected.every(key => Object.prototype.hasOwnProperty.call(value, key))) {
      fail(`${at} has an unexpected structure.`);
      return false;
    }
    return true;
  };
  const text = (value, at, max = 4000) => {
    if (typeof value !== 'string' || !value.trim() || value.length > max) fail(`${at} must contain non-empty text of at most ${max} characters.`);
  };
  const validId = (value, at) => {
    if (typeof value !== 'string' || value.length > 120 || !idPattern.test(value)) fail(`${at} has an invalid ID.`);
  };
  const date = (value, at) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)
      || !Number.isFinite(Date.parse(`${value}T00:00:00Z`))
      || new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value) fail(`${at} must be a valid calendar date.`);
  };
  const url = (value, at) => {
    if (typeof value !== 'string' || !value || value.length > 2000 || /[\s\u0000-\u001f\u007f]/u.test(value)) {
      fail(`${at} must be an HTTP(S) URL without whitespace or control characters.`);
      return;
    }
    try {
      const parsed = new URL(value);
      if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) throw new Error('invalid citation URL');
    } catch { fail(`${at} must be an HTTP(S) URL without embedded credentials.`); }
  };

  if (!record(instrument) || !Array.isArray(instrument.foundations?.items)
    || !instrument.foundations.items.length) return ['The instrument must define a non-empty foundation item bank.'];
  if (!keys(evidence, ['evidenceVersion', 'instrumentId', 'instrumentVersion', 'reviewStatus', 'sources', 'items'], 'Evidence map')) return errors;
  if (evidence.evidenceVersion !== 1) fail('Unsupported evidence-map version.');
  if (evidence.instrumentId !== instrument.id || evidence.instrumentVersion !== instrument.version) fail('Evidence-map instrument identity and version must match the instrument.');
  if (evidence.reviewStatus !== 'author-draft') fail('The evidence map must retain its author-draft review status.');
  if (!Array.isArray(evidence.sources) || !evidence.sources.length) fail('Evidence sources must be a non-empty array.');
  if (!Array.isArray(evidence.items)) fail('Evidence item links must be an array.');
  const sourceIds = new Set();
  for (const source of Array.isArray(evidence.sources) ? evidence.sources : []) {
    if (!keys(source, ['id', 'title', 'authors', 'url', 'locator', 'accessed', 'verification', 'note'], 'Source')) continue;
    validId(source.id, 'Source');
    if (sourceIds.has(source.id)) fail(`Duplicate source ID ${source.id}.`);
    sourceIds.add(source.id);
    for (const field of ['title', 'locator', 'note']) text(source[field], `Source ${source.id}.${field}`);
    if (!verificationStates.has(source.verification)) fail(`Source ${source.id} has an unknown verification state.`);
    if (!Array.isArray(source.authors) || (source.verification !== 'unverified' && !source.authors.length)) {
      fail(`Source ${source.id}.authors must be an array; checked metadata requires an author attribution.`);
    } else {
      source.authors.forEach((author, index) => text(author, `Source ${source.id}.authors[${index}]`, 300));
      if (new Set(source.authors).size !== source.authors.length) fail(`Source ${source.id} repeats an author.`);
    }
    url(source.url, `Source ${source.id}.url`);
    date(source.accessed, `Source ${source.id}.accessed`);
  }
  const requiredItems = new Set(instrument.foundations.items.map(item => item.id));
  const seenItems = new Set();
  for (const item of Array.isArray(evidence.items) ? evidence.items : []) {
    if (!keys(item, ['itemId', 'links', 'openQuestion'], 'Evidence item')) continue;
    validId(item.itemId, 'Evidence item');
    if (!requiredItems.has(item.itemId)) fail(`Evidence item ${item.itemId} is not in the foundation bank.`);
    if (seenItems.has(item.itemId)) fail(`Duplicate evidence item ${item.itemId}.`);
    seenItems.add(item.itemId);
    text(item.openQuestion, `Evidence item ${item.itemId}.openQuestion`);
    if (!Array.isArray(item.links) || !item.links.length) {
      fail(`Evidence item ${item.itemId} needs at least one proposed source link.`);
      continue;
    }
    const seenLinks = new Set();
    for (const link of item.links) {
      if (!keys(link, ['sourceId', 'relation', 'locator', 'note'], `Evidence link for ${item.itemId}`)) continue;
      if (!sourceIds.has(link.sourceId)) fail(`Evidence item ${item.itemId} references an unknown source.`);
      if (!['background', 'contrast'].includes(link.relation)) fail(`Evidence item ${item.itemId} has an invalid source relation.`);
      const linkKey = `${link.sourceId}:${link.relation}`;
      if (seenLinks.has(linkKey)) fail(`Evidence item ${item.itemId} repeats a source relation.`);
      seenLinks.add(linkKey);
      for (const field of ['locator', 'note']) text(link[field], `Evidence link ${item.itemId}.${field}`);
    }
  }
  for (const itemId of requiredItems) if (!seenItems.has(itemId)) fail(`Foundation item ${itemId} has no evidence-map row.`);
  return errors;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    const [{ instrument }, { foundationEvidence }] = await Promise.all([
      import('../js/content.js'), import('../js/foundation-evidence.js'),
    ]);
    const errors = validateEvidence(instrument, foundationEvidence);
    const report = {
      instrumentId: instrument.id,
      instrumentVersion: instrument.version,
      valid: errors.length === 0,
      reviewStatus: foundationEvidence.reviewStatus,
      counts: {
        foundationItems: foundationEvidence.items.length,
        sources: foundationEvidence.sources.length,
        unverified: foundationEvidence.sources.filter(source => source.verification === 'unverified').length,
        metadataChecked: foundationEvidence.sources.filter(source => source.verification === 'metadata-checked').length,
        textChecked: foundationEvidence.sources.filter(source => source.verification === 'text-checked').length,
        proposedLinks: foundationEvidence.items.reduce((count, item) => count + item.links.length, 0),
      },
      errors,
      limitation: 'Coverage and reference checks do not verify bibliography, source text, conceptual relevance, or measurement validity. Unverified rows are a source-checking queue.',
    };
    if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
    else {
      console.log(`Political Context ${instrument.version} — foundation source-map checks`);
      console.table([report.counts]);
      if (errors.length) { console.error(`FAIL: ${errors.length} issue(s).`); for (const error of errors) console.error(`- ${error}`); }
      else console.log('PASS: authored item coverage, source identities, URL structure, and verification-state fields.');
      console.log(report.limitation);
    }
    if (errors.length) process.exitCode = 1;
  } catch (error) {
    console.error(`Evidence validation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
