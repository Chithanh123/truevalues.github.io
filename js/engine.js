/**
 * Political Context's local prototype engine.
 * These summaries describe this instrument's responses; they are not validated
 * ideological scales. Comparison variants and descriptive observations never
 * add weight or coverage to the directional profile.
 */

const ITEM_ID = /^[a-z][a-z0-9_-]*$/;
const SESSION_KEYS = [
  "instrumentId", "version", "seed", "worldId", "stepIndex", "answers",
  "completed", "saveOnDevice",
];
const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const onlyKeys = (object, keys) => Object.keys(object).every((key) => keys.includes(key));

function hashSeed(seed) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function freshSeed() {
  const bytes = new Uint8Array(16);
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("This browser cannot create a random assignment. Use a current browser over HTTPS.");
  }
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

function assignedWorld(instrument, seed) {
  return instrument.worlds[hashSeed(seed) % instrument.worlds.length].id;
}

export function makeSteps(instrument) {
  return [
    ...instrument.statements.map((statement) => ({
      id: `statement:${statement.id}`, type: "statement", itemId: statement.id,
    })),
    { id: "briefing", type: "briefing" },
    ...instrument.scenarios.map((scenario) => ({
      id: `scenario:${scenario.id}`, type: "scenario", itemId: scenario.id,
    })),
    { id: "results", type: "results" },
  ];
}

export function createSession(instrument, seed = freshSeed()) {
  const errors = validateInstrument(instrument);
  if (errors.length) throw new Error(`Invalid instrument: ${errors.join("; ")}`);
  if (typeof seed !== "string" || seed.length < 1 || seed.length > 256) {
    throw new Error("Assignment seed must be a non-empty string of at most 256 characters.");
  }
  return {
    instrumentId: instrument.id,
    version: instrument.version,
    seed,
    worldId: assignedWorld(instrument, seed),
    stepIndex: 0,
    answers: {},
    completed: false,
    saveOnDevice: false,
  };
}

export function setAnswer(session, stepId, answer) {
  if (typeof stepId !== "string" || !/^(statement|scenario):[a-z][a-z0-9_-]*$/.test(stepId)) {
    throw new Error("Only statement and scenario steps accept responses.");
  }
  if (!isRecord(answer)) throw new Error("A response must be an object.");
  return {
    ...session,
    answers: { ...session.answers, [stepId]: { ...answer } },
    completed: false,
  };
}

function summarizeResponses(items, getAnswer, getValue) {
  const values = [];
  let uncertain = 0;
  let skipped = 0;
  for (const item of items) {
    const answer = getAnswer(item);
    if (!answer) continue;
    if (answer.kind === "uncertain") uncertain += 1;
    // "None of these" is excluded; its exact response remains in the evidence.
    if (answer.kind === "skip" || answer.kind === "none") skipped += 1;
    const value = getValue(item, answer);
    if (typeof value === "number" && Number.isFinite(value)) values.push(value);
  }
  return {
    mean: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null,
    count: values.length,
    total: items.length,
    uncertain,
    skipped,
  };
}

export function summarize(instrument, session) {
  const answers = session.answers ?? {};
  return {
    dimensions: instrument.dimensions.map(({ id }) => ({
      id,
      statements: summarizeResponses(
        instrument.statements.filter((item) => item.dimension === id),
        (item) => answers[`statement:${item.id}`],
        (item, answer) => answer.kind === "value" ? answer.value * item.direction : null,
      ),
      scenarios: summarizeResponses(
        instrument.scenarios.filter((item) => item.dimension === id && !item.comparisonOf && item.scoring !== "descriptive"),
        (item) => answers[`scenario:${item.id}`],
        (item, answer) => answer.kind === "choice"
          ? item.options.find((option) => option.id === answer.optionId)?.score ?? null
          : null,
      ),
    })),
    comparisons: instrument.scenarios.filter((item) => item.comparisonOf).map((item) => {
      const original = answers[`scenario:${item.comparisonOf}`];
      const comparison = answers[`scenario:${item.id}`];
      const originalOptionId = original?.kind === "choice" ? original.optionId : null;
      const comparisonOptionId = comparison?.kind === "choice" ? comparison.optionId : null;
      return {
        scenarioId: item.id,
        originalId: item.comparisonOf,
        originalOptionId,
        comparisonOptionId,
        changed: originalOptionId && comparisonOptionId
          ? originalOptionId !== comparisonOptionId
          : null,
      };
    }),
  };
}

function validStatementAnswer(answer) {
  if (!isRecord(answer)) return false;
  if (answer.kind === "value") {
    return onlyKeys(answer, ["kind", "value"])
      && Number.isInteger(answer.value) && answer.value >= -2 && answer.value <= 2;
  }
  return ["uncertain", "skip"].includes(answer.kind) && onlyKeys(answer, ["kind"]);
}

function validScenarioAnswer(answer, item) {
  if (!isRecord(answer)) return false;
  if (answer.kind === "choice") {
    return onlyKeys(answer, ["kind", "optionId", "reasonId"])
      && item.options.some((option) => option.id === answer.optionId)
      && (answer.reasonId === null
        || item.reasons.some((reason) => reason.id === answer.reasonId));
  }
  return ["uncertain", "none", "skip"].includes(answer.kind)
    && onlyKeys(answer, ["kind", "reasonId"]) && answer.reasonId === null;
}

export function validateSession(instrument, candidate) {
  const invalid = (error) => ({ valid: false, error });
  if (validateInstrument(instrument).length) return invalid("The instrument definition is invalid.");
  if (!isRecord(candidate) || !onlyKeys(candidate, SESSION_KEYS)
    || !SESSION_KEYS.every((key) => own(candidate, key))) {
    return invalid("The saved session has an unexpected structure.");
  }
  if (candidate.instrumentId !== instrument.id || candidate.version !== instrument.version) {
    return invalid("This save belongs to a different instrument version.");
  }
  if (typeof candidate.seed !== "string" || !candidate.seed.length || candidate.seed.length > 256) {
    return invalid("The saved assignment seed is invalid.");
  }
  if (candidate.worldId !== assignedWorld(instrument, candidate.seed)) {
    return invalid("The saved world does not match its assignment.");
  }
  if (typeof candidate.completed !== "boolean" || typeof candidate.saveOnDevice !== "boolean") {
    return invalid("The saved completion or storage setting is invalid.");
  }
  const steps = makeSteps(instrument);
  if (!Number.isInteger(candidate.stepIndex) || candidate.stepIndex < 0
    || candidate.stepIndex >= steps.length) {
    return invalid("The saved assessment position is invalid.");
  }
  if (!isRecord(candidate.answers)) return invalid("The saved responses are invalid.");
  const statementMap = new Map(instrument.statements.map((item) => [`statement:${item.id}`, item]));
  const scenarioMap = new Map(instrument.scenarios.map((item) => [`scenario:${item.id}`, item]));
  for (const [id, answer] of Object.entries(candidate.answers)) {
    if (statementMap.has(id)) {
      if (!validStatementAnswer(answer)) return invalid(`Invalid response for ${id}.`);
    } else if (scenarioMap.has(id)) {
      if (!validScenarioAnswer(answer, scenarioMap.get(id))) return invalid(`Invalid response for ${id}.`);
    } else {
      return invalid("The saved responses contain an unknown item.");
    }
  }
  const priorSteps = steps.slice(0, candidate.stepIndex)
    .filter((step) => step.type === "statement" || step.type === "scenario");
  if (priorSteps.some((step) => !own(candidate.answers, step.id))) {
    return invalid("The save advances past an unanswered item.");
  }
  if (candidate.completed && steps[candidate.stepIndex].type !== "results") {
    return invalid("A completed save must be on the results step.");
  }
  return { valid: true };
}

export function validateInstrument(instrument) {
  const errors = [];
  const hasText = (value) => typeof value === "string" && value.trim().length > 0;
  if (!isRecord(instrument)) return ["Instrument must be an object."];
  if (typeof instrument.id !== "string" || !ITEM_ID.test(instrument.id)) {
    errors.push("Instrument ID is invalid.");
  }
  if (!hasText(instrument.version)) errors.push("Instrument version is required.");
  for (const key of ["dimensions", "statements", "worlds", "scenarios"]) {
    if (!Array.isArray(instrument[key]) || !instrument[key].length) {
      errors.push(`${key} must be a non-empty array.`);
    }
  }
  if (errors.length) return errors;

  const checkIds = (items, label) => {
    const seen = new Set();
    for (const item of items) {
      if (!isRecord(item) || typeof item.id !== "string" || !ITEM_ID.test(item.id)) {
        errors.push(`${label} contains an invalid ID.`);
        continue;
      }
      if (seen.has(item.id)) errors.push(`${label} contains duplicate ID ${item.id}.`);
      seen.add(item.id);
    }
    return seen;
  };
  const textFields = (item, fields, label, required = false) => {
    for (const field of fields) {
      if ((required || own(item, field)) && !hasText(item[field])) {
        errors.push(`${label} needs non-empty ${field}.`);
      }
    }
  };
  const labelTextRows = (rows, label) => {
    if (!Array.isArray(rows) || !rows.length) {
      errors.push(`${label} must be a non-empty array.`);
      return;
    }
    const labels = new Set();
    for (const row of rows) {
      if (!isRecord(row)) {
        errors.push(`${label} contains an invalid row.`);
        continue;
      }
      textFields(row, ["label", "text"], label, true);
      if (labels.has(row.label)) errors.push(`${label} repeats label ${row.label}.`);
      labels.add(row.label);
    }
  };
  const dimensions = checkIds(instrument.dimensions, "dimensions");
  checkIds(instrument.statements, "statements");
  const worldIds = checkIds(instrument.worlds, "worlds");
  const scenarioIds = checkIds(instrument.scenarios, "scenarios");
  let roles = null;
  if (own(instrument, "roles")) {
    if (!Array.isArray(instrument.roles) || !instrument.roles.length) {
      errors.push("roles must be a non-empty array when supplied.");
    } else {
      roles = checkIds(instrument.roles, "roles");
      for (const role of instrument.roles) {
        if (isRecord(role)) textFields(role, ["label"], `Role ${role.id}`, true);
      }
    }
  }
  for (const dimension of instrument.dimensions) {
    if (!isRecord(dimension)) continue;
    const detailed = ["label", "left", "right", "description"].some((field) => own(dimension, field));
    textFields(dimension, ["label", "left", "right", "description"], `Dimension ${dimension.id}`, detailed);
  }
  for (const item of instrument.statements) {
    if (!isRecord(item)) continue;
    if (!dimensions.has(item.dimension)) errors.push(`Statement ${item.id} has an unknown dimension.`);
    if (![1, -1].includes(item.direction)) errors.push(`Statement ${item.id} has an invalid direction.`);
    textFields(item, ["text"], `Statement ${item.id}`, true);
  }

  for (const item of instrument.scenarios) {
    if (!isRecord(item)) continue;
    const label = `Scenario ${item.id}`;
    const detailed = ["title", "briefing", "authority", "facts", "prompt"].some((field) => own(item, field));
    if (!dimensions.has(item.dimension)) errors.push(`${label} has an unknown dimension.`);
    const scoring = own(item, "scoring") ? item.scoring : "directional";
    if (!["directional", "descriptive"].includes(scoring)) {
      errors.push(`${label} has an unsupported scoring mode.`);
    }
    textFields(item, ["title", "role", "roleLabel", "locality", "setting", "briefing", "authority", "prompt"], label, detailed);
    if (own(item, "role") && (typeof item.role !== "string" || !ITEM_ID.test(item.role))) {
      errors.push(`${label} has an invalid role ID.`);
    }
    if (roles && !roles.has(item.role)) errors.push(`${label} has an unknown role.`);
    if ((detailed || own(item, "locality")) && !["urban", "rural"].includes(item.locality)) {
      errors.push(`${label} has an unsupported locality.`);
    }
    if (detailed || own(item, "facts")) labelTextRows(item.facts, `Facts for ${item.id}`);
    if (!Array.isArray(item.options) || item.options.length < 2) {
      errors.push(`${label} needs at least two options.`);
    } else {
      checkIds(item.options, `Options for ${item.id}`);
      for (const option of item.options) {
        if (!isRecord(option)) continue;
        if (scoring === "descriptive") {
          if (option.score !== null) errors.push(`Descriptive option ${option.id} must have a null score.`);
        } else if (typeof option.score !== "number" || !Number.isFinite(option.score)
          || option.score < -2 || option.score > 2) {
          errors.push(`Option ${option.id} has an invalid directional score.`);
        }
        textFields(option, ["label", "description", "tradeoff"], `Option ${option.id}`, detailed);
      }
    }
    if (!Array.isArray(item.reasons)) {
      errors.push(`${label} needs a reasons array.`);
    } else {
      checkIds(item.reasons, `Reasons for ${item.id}`);
      for (const reason of item.reasons) {
        if (isRecord(reason)) textFields(reason, ["label"], `Reason ${reason.id}`, detailed);
      }
    }
    if (own(item, "worldNotes")) {
      if (!isRecord(item.worldNotes)) errors.push(`${label} has invalid world notes.`);
      else {
        for (const [worldId, note] of Object.entries(item.worldNotes)) {
          if (!worldIds.has(worldId)) errors.push(`${label} references unknown world ${worldId}.`);
          if (!hasText(note)) errors.push(`${label} has empty context for ${worldId}.`);
        }
      }
    }

    if (item.comparisonOf !== null && item.comparisonOf !== undefined) {
      const originalIndex = instrument.scenarios.findIndex((other) => other?.id === item.comparisonOf);
      const original = instrument.scenarios[originalIndex];
      if (!original || originalIndex >= instrument.scenarios.indexOf(item) || original.comparisonOf) {
        errors.push(`Comparison ${item.id} must refer to an earlier main scenario.`);
        continue;
      }
      if (original.dimension !== item.dimension) errors.push(`Comparison ${item.id} changes dimension.`);
      if ((original.scoring ?? "directional") !== scoring) {
        errors.push(`Comparison ${item.id} changes scoring mode.`);
      }
      for (const field of ["role", "roleLabel", "locality", "authority"]) {
        if (original[field] !== item[field]) errors.push(`Comparison ${item.id} changes ${field}.`);
      }
      if (detailed) textFields(item, ["changedCondition"], `Comparison ${item.id}`, true);
      if (Array.isArray(original.options) && Array.isArray(item.options)) {
        const fields = ["id", "score", "label", "description", "tradeoff"];
        const sameOptions = original.options.length === item.options.length
          && original.options.every((option, index) => isRecord(option) && isRecord(item.options[index])
            && fields.every((field) => option[field] === item.options[index][field]));
        if (!sameOptions) errors.push(`Comparison ${item.id} must preserve option order, IDs, scores, and wording.`);
      }
      if (Array.isArray(original.reasons) && Array.isArray(item.reasons)) {
        const sameReasons = original.reasons.length === item.reasons.length
          && original.reasons.every((reason, index) => isRecord(reason) && isRecord(item.reasons[index])
            && reason.id === item.reasons[index].id && reason.label === item.reasons[index].label);
        if (!sameReasons) errors.push(`Comparison ${item.id} must preserve reasons and their order.`);
      }
      if (isRecord(original.worldNotes) && isRecord(item.worldNotes)) {
        const sameNotes = Object.keys(original.worldNotes).length === Object.keys(item.worldNotes).length
          && Object.entries(original.worldNotes).every(([id, note]) => item.worldNotes[id] === note);
        if (!sameNotes) errors.push(`Comparison ${item.id} must preserve its institutional notes.`);
      } else if (own(original, "worldNotes") !== own(item, "worldNotes")) {
        errors.push(`Comparison ${item.id} must preserve its institutional notes.`);
      }
    }
  }

  const codes = new Set();
  for (const world of instrument.worlds) {
    if (!isRecord(world)) continue;
    const label = `World ${world.id}`;
    const detailed = ["name", "code", "inspiration", "summary", "institutions", "scenarioNotes"].some((field) => own(world, field));
    textFields(world, ["name", "inspiration", "summary"], label, detailed);
    if (own(world, "code")) {
      if (typeof world.code !== "string" || !/^[A-Za-z][A-Za-z0-9]{1,2}$/.test(world.code)) {
        errors.push(`${label} needs a two- or three-character code.`);
      } else if (codes.has(world.code.toLowerCase())) {
        errors.push(`${label} repeats a world code.`);
      }
      codes.add(String(world.code).toLowerCase());
    }
    if (detailed) labelTextRows(world.institutions, `Institutions for ${world.id}`);
    // Bare world IDs remain valid for pure-engine fixtures. Authored profiles
    // require context for every displayed scenario, including comparison cases.
    if (detailed) {
      if (!isRecord(world.scenarioNotes)) errors.push(`${label} needs a scenarioNotes map.`);
      else {
        for (const scenarioId of scenarioIds) {
          if (!hasText(world.scenarioNotes[scenarioId])) errors.push(`${label} lacks context for ${scenarioId}.`);
        }
        for (const id of Object.keys(world.scenarioNotes)) {
          if (!scenarioIds.has(id)) errors.push(`${label} references unknown scenario ${id}.`);
        }
        for (const scenario of instrument.scenarios) {
          if (!isRecord(scenario) || !scenario.comparisonOf) continue;
          if (world.scenarioNotes[scenario.id] !== world.scenarioNotes[scenario.comparisonOf]) {
            errors.push(`${label} changes institutional context in comparison ${scenario.id}.`);
          }
        }
      }
    }
  }
  return errors;
}
