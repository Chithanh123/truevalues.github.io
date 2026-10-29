/** Stable identity of the content used by the experimental follow-up.
 * SQLite files and catalog provenance are deliberately excluded: rebuilding an
 * unchanged catalog can change its metadata without changing a participant's
 * questions. Increment INTERPRETATION_VERSION if the result rules change in a
 * way that would reinterpret an existing saved session.
 */
const INTERPRETATION_VERSION = 'expanded-interpretation-1.0.0';
const requireString = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing ${label}`);
  return value;
};

/** Return deterministic content that affects answering or interpreting the 60-item route. */
export function expandedContentSnapshot(catalog, worlds) {
  if (!Array.isArray(catalog?.items) || !Array.isArray(worlds)) throw new Error('Missing expanded catalog or worlds');
  const byId = new Map(catalog.items.map(item => [item.id, item]));
  if (byId.size !== catalog.items.length) throw new Error('Duplicate catalog item IDs');
  const items = [];
  for (let n = 13; n <= 24; n++) {
    for (const suffix of 'ABCD') {
      const id = `CR-${n}${suffix}`;
      const item = byId.get(id);
      if (!item || item.kind !== 'foundation_statement') throw new Error(`Missing statement ${id}`);
      items.push({id, kind:item.kind, text:requireString(item.texts?.en?.text, `${id} text`),
        rationale:requireString(item.rationale, `${id} rationale`)});
    }
    const id = `CR-S${String(n - 6).padStart(2, '0')}`;
    const item = byId.get(id);
    if (!item || item.kind !== 'scenario' || !Array.isArray(item.options) || item.options.length !== 3 ||
        !Array.isArray(item.reasons?.en) || !item.reasons.en.length) throw new Error(`Missing situation ${id}`);
    const options = item.options.map(option => ({id:requireString(option.id, `${id} option ID`),
      label:requireString(option.texts?.en?.label, `${id} option label`),
      description:requireString(option.texts?.en?.description, `${id} option description`),
      tradeoff:requireString(option.texts?.en?.tradeoff, `${id} option tradeoff`)}));
    if (options.map(option => option.id).join('') !== 'ABC') throw new Error(`Invalid options ${id}`);
    items.push({id, kind:item.kind, title:requireString(item.title, `${id} title`),
      locality:requireString(item.locality, `${id} locality`),
      briefing:requireString(item.briefings?.en, `${id} briefing`),
      reasons:item.reasons.en.map(reason => requireString(reason, `${id} reason`)),
      personalPreferencePrompt:requireString(item.personalPreferencePrompt?.en, `${id} preference prompt`), options});
  }
  const normalizedWorlds = worlds.map(world => ({id:requireString(world.id, 'world ID'),
    name:requireString(world.name, 'world name'), summary:requireString(world.summary, 'world summary'),
    inspiration:requireString(world.inspiration, 'world inspiration')})).sort((a, b) => a.id.localeCompare(b.id, 'en'));
  if (normalizedWorlds.length !== 8 || new Set(normalizedWorlds.map(world => world.id)).size !== 8) throw new Error('Expected eight distinct worlds');
  return {interpretationVersion:INTERPRETATION_VERSION, items, worlds:normalizedWorlds};
}

export async function createExpandedFingerprint(catalog, worlds) {
  const bytes = new TextEncoder().encode(JSON.stringify(expandedContentSnapshot(catalog, worlds)));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
