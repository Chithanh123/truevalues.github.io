import test from "node:test";
import assert from "node:assert/strict";
import {
  createSession, makeSteps, setAnswer, summarize, validateSession, validateInstrument,
} from "../js/engine.js";
import { instrument as pilotInstrument } from "../js/content.js";

const instrument = {
  id: "test-instrument",
  version: "0.1.0",
  dimensions: [{ id: "economic" }, { id: "civil" }],
  statements: [
    { id: "ownership", dimension: "economic", direction: 1, text: "Public ownership." },
    { id: "markets", dimension: "economic", direction: -1, text: "Market allocation." },
    { id: "rights", dimension: "civil", direction: 1, text: "Civil rights." },
  ],
  worlds: [{ id: "alder" }, { id: "linden" }],
  scenarios: [
    {
      id: "housing", dimension: "economic", role: "local_leader", locality: "urban",
      comparisonOf: null,
      options: [{ id: "sell", score: -2 }, { id: "retain", score: 2 }],
      reasons: [{ id: "capacity", label: "Fiscal capacity" }],
    },
    {
      id: "protest", dimension: "civil", role: "constituent", locality: "rural",
      comparisonOf: null,
      options: [{ id: "permit", score: 2 }, { id: "restrict", score: -2 }],
      reasons: [{ id: "liberty", label: "Individual liberty" }],
    },
    {
      id: "housing_comparison", dimension: "economic", role: "local_leader", locality: "urban",
      comparisonOf: "housing",
      options: [{ id: "sell", score: -2 }, { id: "retain", score: 2 }],
      reasons: [{ id: "capacity", label: "Fiscal capacity" }],
    },
  ],
};

function filledSession() {
  let session = createSession(instrument, "fixture");
  for (const item of instrument.statements) {
    session = setAnswer(session, `statement:${item.id}`, { kind: "value", value: 1 });
  }
  for (const item of instrument.scenarios) {
    session = setAnswer(session, `scenario:${item.id}`, {
      kind: "choice", optionId: item.options[0].id, reasonId: null,
    });
  }
  return session;
}

test("world assignment is reproducible, covers both worlds, and rejects invalid seeds", () => {
  assert.deepEqual(createSession(instrument, "assigned"), createSession(instrument, "assigned"));
  const worlds = new Set(Array.from({ length: 40 }, (_, i) => createSession(instrument, `seed-${i}`).worldId));
  assert.deepEqual(worlds, new Set(["alder", "linden"]));
  assert.throws(() => createSession(instrument, ""), /seed/i);
  assert.throws(() => createSession(instrument, 123), /seed/i);
  assert.equal(validateSession(instrument, createSession(instrument)).valid, true);
});

test("steps preserve a distinct briefing and results phase", () => {
  assert.deepEqual(makeSteps(instrument).map((step) => step.id), [
    "statement:ownership", "statement:markets", "statement:rights", "briefing",
    "scenario:housing", "scenario:protest", "scenario:housing_comparison", "results",
  ]);
});

test("re-answering replaces rather than accumulates and does not mutate previous state", () => {
  const initial = { ...createSession(instrument, "seed"), completed: true };
  const first = setAnswer(initial, "statement:ownership", { kind: "value", value: 2 });
  const second = setAnswer(first, "statement:ownership", { kind: "value", value: -1 });
  assert.deepEqual(initial.answers, {});
  assert.equal(first.answers["statement:ownership"].value, 2);
  assert.equal(second.answers["statement:ownership"].value, -1);
  assert.equal(second.completed, false);
  assert.equal(summarize(instrument, second).dimensions[0].statements.mean, -1);
  assert.throws(() => setAnswer(second, "__proto__", {}), /Only/);
});

test("reverse-keyed responses, neutral, uncertainty, and missing items stay distinguishable", () => {
  let session = createSession(instrument, "seed");
  session = setAnswer(session, "statement:ownership", { kind: "value", value: 0 });
  session = setAnswer(session, "statement:markets", { kind: "value", value: 2 });
  session = setAnswer(session, "statement:rights", { kind: "uncertain" });
  const summary = summarize(instrument, session);
  assert.deepEqual(summary.dimensions[0].statements, {
    mean: -1, count: 2, total: 2, uncertain: 0, skipped: 0,
  });
  assert.deepEqual(summary.dimensions[1].statements, {
    mean: null, count: 0, total: 1, uncertain: 1, skipped: 0,
  });
  assert.equal(summary.dimensions[0].scenarios.mean, null);
  session = setAnswer(session, "statement:rights", { kind: "skip" });
  assert.equal(summarize(instrument, session).dimensions[1].statements.skipped, 1);
});

test("comparison variants and reasons never add to the contextual profile", () => {
  let session = filledSession();
  session = setAnswer(session, "scenario:housing_comparison", {
    kind: "choice", optionId: "retain", reasonId: "capacity",
  });
  const summary = summarize(instrument, session);
  assert.deepEqual(summary.dimensions[0].scenarios, {
    mean: -2, count: 1, total: 1, uncertain: 0, skipped: 0,
  });
  assert.deepEqual(summary.comparisons, [{
    scenarioId: "housing_comparison", originalId: "housing",
    originalOptionId: "sell", comparisonOptionId: "retain", changed: true,
  }]);
  session = setAnswer(session, "scenario:housing_comparison", {
    kind: "none", reasonId: null,
  });
  assert.equal(summarize(instrument, session).comparisons[0].changed, null);
});

test("none-of-these and scenario uncertainty are excluded rather than scored as neutral", () => {
  let session = filledSession();
  session = setAnswer(session, "scenario:housing", { kind: "none", reasonId: null });
  session = setAnswer(session, "scenario:protest", { kind: "uncertain", reasonId: null });
  const summary = summarize(instrument, session);
  assert.deepEqual(summary.dimensions[0].scenarios, {
    mean: null, count: 0, total: 1, uncertain: 0, skipped: 1,
  });
  assert.equal(summary.dimensions[1].scenarios.uncertain, 1);
});

test("valid completion requires all answers; retaining later answers while going Back is valid", () => {
  const complete = { ...filledSession(), stepIndex: 7, completed: true };
  assert.equal(validateSession(instrument, complete).valid, true);
  assert.equal(validateSession(instrument, { ...complete, completed: false, stepIndex: 1 }).valid, true);
  const missing = structuredClone(complete);
  delete missing.answers["scenario:protest"];
  assert.equal(validateSession(instrument, missing).valid, false);
  assert.equal(validateSession(instrument, { ...complete, stepIndex: 1 }).valid, false);
  assert.equal(validateSession(instrument, { ...createSession(instrument, "seed"), stepIndex: 2 }).valid, false);
});

test("skipped and uncertain responses count as completed items without generating scores", () => {
  let session = createSession(instrument, "seed");
  for (const item of instrument.statements) {
    session = setAnswer(session, `statement:${item.id}`, { kind: "skip" });
  }
  for (const item of instrument.scenarios) {
    session = setAnswer(session, `scenario:${item.id}`, { kind: "uncertain", reasonId: null });
  }
  session = { ...session, stepIndex: 7, completed: true };
  assert.equal(validateSession(instrument, session).valid, true);
  assert.ok(summarize(instrument, session).dimensions.every(
    (dimension) => dimension.statements.mean === null && dimension.scenarios.mean === null,
  ));
});

test("malformed, stale, mismatched, and injected saves are rejected", () => {
  const base = filledSession();
  const badCandidates = [
    null,
    [],
    { ...base, version: "0.0.1" },
    { ...base, instrumentId: "other" },
    { ...base, seed: "" },
    { ...base, worldId: base.worldId === "alder" ? "linden" : "alder" },
    { ...base, stepIndex: -1 },
    { ...base, stepIndex: 8 },
    { ...base, stepIndex: 0.5 },
    { ...base, completed: "yes" },
    { ...base, saveOnDevice: null },
    { ...base, extraData: "not part of this schema" },
    { ...base, answers: [] },
    { ...base, answers: { "statement:unknown": { kind: "value", value: 1 } } },
    { ...base, answers: { "statement:ownership": { kind: "value", value: 3 } } },
    { ...base, answers: { "statement:ownership": { kind: "value", value: "1" } } },
    { ...base, answers: { "statement:ownership": { kind: "uncertain", value: 0 } } },
    { ...base, answers: { "scenario:housing": { kind: "choice", optionId: "unknown", reasonId: null } } },
    { ...base, answers: { "scenario:housing": { kind: "choice", optionId: "sell", reasonId: "liberty" } } },
    { ...base, answers: { "scenario:housing": { kind: "choice", optionId: "sell" } } },
    { ...base, answers: { "scenario:housing": { kind: "none", reasonId: "capacity" } } },
    { ...base, answers: JSON.parse('{"__proto__":{"kind":"skip"}}') },
  ];
  for (const candidate of badCandidates) {
    assert.equal(validateSession(instrument, candidate).valid, false, JSON.stringify(candidate));
  }
});

test("instrument validation catches broken dimensions, IDs, scales, and comparisons", () => {
  assert.deepEqual(validateInstrument(instrument), []);
  const cases = [
    (copy) => { copy.statements[0].dimension = "missing"; },
    (copy) => { copy.statements[0].direction = 0; },
    (copy) => { copy.statements[1].id = "ownership"; },
    (copy) => { copy.worlds = []; },
    (copy) => { copy.scenarios[0].options[0].score = Infinity; },
    (copy) => { copy.scenarios[2].comparisonOf = "missing"; },
    (copy) => { copy.scenarios[2].dimension = "civil"; },
    (copy) => { copy.scenarios[2].role = "constituent"; },
    (copy) => { copy.scenarios[2].options[0].id = "different"; },
    (copy) => { copy.scenarios[2].options[0].score = 0; },
  ];
  for (const mutate of cases) {
    const copy = structuredClone(instrument);
    mutate(copy);
    assert.ok(validateInstrument(copy).length > 0);
    assert.throws(() => createSession(copy, "seed"), /Invalid instrument/);
  }
  assert.ok(validateInstrument({}).length > 0);
});

test("the shipped pilot has valid routes with statement and main-case evidence in every dimension", () => {
  assert.deepEqual(validateInstrument(pilotInstrument), []);
  for (const dimension of pilotInstrument.dimensions) {
    assert.ok(pilotInstrument.statements.some((item) => item.dimension === dimension.id));
    assert.ok(pilotInstrument.scenarios.some(
      (item) => item.dimension === dimension.id && !item.comparisonOf,
    ));
  }
  let session = createSession(pilotInstrument, "shipped-content");
  for (const item of pilotInstrument.statements) {
    session = setAnswer(session, `statement:${item.id}`, { kind: "value", value: 0 });
  }
  for (const item of pilotInstrument.scenarios) {
    session = setAnswer(session, `scenario:${item.id}`, {
      kind: "choice", optionId: item.options[0].id, reasonId: null,
    });
  }
  session = { ...session, stepIndex: makeSteps(pilotInstrument).length - 1, completed: true };
  assert.equal(validateSession(pilotInstrument, JSON.parse(JSON.stringify(session))).valid, true);
  const summary = summarize(pilotInstrument, session);
  assert.ok(summary.dimensions.every((dimension) => dimension.statements.mean === 0));
  const scoredCount = summary.dimensions.reduce((count, dimension) => count + dimension.scenarios.count, 0);
  assert.equal(scoredCount, pilotInstrument.scenarios.filter((item) => !item.comparisonOf && item.scoring !== "descriptive").length);
  assert.equal(summary.comparisons.length, pilotInstrument.scenarios.filter((item) => item.comparisonOf).length);
});

function displayedInstrument() {
  const result = structuredClone(instrument);
  result.roles = [
    { id: "local_leader", label: "Local leader" },
    { id: "constituent", label: "Ordinary constituent" },
  ];
  result.dimensions = result.dimensions.map((dimension) => ({
    ...dimension, label: dimension.id, left: "Left", right: "Right", description: "Candidate construct.",
  }));
  result.scenarios = result.scenarios.map((scene) => ({
    ...scene, title: scene.id, roleLabel: scene.role, setting: "A fictional locality",
    briefing: "Relevant circumstances.", authority: `Delegated authority for ${scene.role}.`,
    prompt: "Which action would you choose?", facts: [{ label: "Budget", text: "The budget is fixed." }],
    changedCondition: scene.comparisonOf ? "Only urgency changes." : null,
    options: scene.options.map((option) => ({
      ...option, label: option.id, description: `Implement ${option.id}.`, tradeoff: `A cost of ${option.id}.`,
    })),
  }));
  result.worlds = result.worlds.map((world, index) => ({
    ...world, name: world.id, code: `W${index}`, inspiration: "A fictional inspiration",
    summary: "Institutions and resources are explicit.",
    institutions: [{ label: "Authority", text: "Scenario powers are stipulated." }],
    scenarioNotes: Object.fromEntries(result.scenarios.map((scene) => [
      scene.id, `Institutional context for ${scene.comparisonOf || scene.id}.`,
    ])),
  }));
  return result;
}

test("authored context profiles require complete, known scenario references and distinct codes", () => {
  const valid = displayedInstrument();
  assert.deepEqual(validateInstrument(valid), []);
  const cases = [
    (copy) => { delete copy.worlds[0].scenarioNotes; },
    (copy) => { delete copy.worlds[0].scenarioNotes.housing; },
    (copy) => { copy.worlds[0].scenarioNotes.protest = " "; },
    (copy) => { copy.worlds[0].scenarioNotes.unknown = "Unexpected context."; },
    (copy) => { copy.worlds[1].code = copy.worlds[0].code.toLowerCase(); },
    (copy) => { copy.worlds[0].code = "LongCode"; },
    (copy) => { copy.worlds[0].institutions[0].text = ""; },
    (copy) => { copy.scenarios[0].worldNotes = { unknown: "Unknown world." }; },
    (copy) => { copy.scenarios[0].role = "unknown_role"; },
    (copy) => { copy.scenarios[0].locality = "unknown_locality"; },
    (copy) => { copy.roles[0].label = " "; },
    (copy) => { copy.scenarios[0].options[0].tradeoff = ""; },
    (copy) => { copy.scenarios[0].facts = []; },
  ];
  for (const mutate of cases) {
    const copy = structuredClone(valid);
    mutate(copy);
    assert.ok(validateInstrument(copy).length > 0);
    assert.throws(() => createSession(copy, "seed"), /Invalid instrument/);
  }
});

test("a comparison preserves option wording/order, reasons, authority, and world context", () => {
  const valid = displayedInstrument();
  const cases = [
    (copy) => { copy.scenarios[2].options[0].label = "A newly framed choice"; },
    (copy) => { copy.scenarios[2].options[0].description = "A different consequence."; },
    (copy) => { copy.scenarios[2].options[0].tradeoff = "A different cost."; },
    (copy) => { copy.scenarios[2].options.reverse(); },
    (copy) => { copy.scenarios[2].reasons[0].label = "Another reason"; },
    (copy) => { copy.scenarios[2].authority = "More power than before."; },
    (copy) => { copy.scenarios[2].roleLabel = "A different responsibility"; },
    (copy) => { copy.scenarios[2].changedCondition = ""; },
    (copy) => { copy.worlds[0].scenarioNotes.housing_comparison = "Different institutions."; },
  ];
  for (const mutate of cases) {
    const copy = structuredClone(valid);
    mutate(copy);
    assert.ok(validateInstrument(copy).some((error) => /comparison/i.test(error)));
  }
});

test("the expanded instrument covers every requested setting, role, and domain", () => {
  assert.equal(pilotInstrument.version, "0.3.0");
  assert.equal(pilotInstrument.worlds.length, 8);
  assert.equal(pilotInstrument.statements.length, 24);
  const mainCases = pilotInstrument.scenarios.filter((scene) => !scene.comparisonOf);
  assert.equal(mainCases.length, 8);
  assert.equal(pilotInstrument.scenarios.length - mainCases.length, 1);
  const requiredRoles = new Set([
    "constituent", "civil_society", "public_servant", "local_leader", "national_leader",
  ]);
  assert.deepEqual(new Set(pilotInstrument.roles.map((role) => role.id)), requiredRoles);
  assert.deepEqual(new Set(mainCases.map((scene) => scene.role)), requiredRoles);
  assert.deepEqual(new Set(mainCases.map((scene) => scene.locality)), new Set(["urban", "rural"]));
  for (const dimension of pilotInstrument.dimensions) {
    assert.equal(pilotInstrument.statements.filter((item) => item.dimension === dimension.id).length, 6);
    assert.equal(mainCases.filter((item) => item.dimension === dimension.id).length, 2);
  }
  for (const world of pilotInstrument.worlds) {
    assert.deepEqual(new Set(Object.keys(world.scenarioNotes)), new Set(pilotInstrument.scenarios.map((item) => item.id)));
    for (const scene of pilotInstrument.scenarios.filter((item) => item.comparisonOf)) {
      assert.equal(world.scenarioNotes[scene.id], world.scenarioNotes[scene.comparisonOf]);
    }
  }
});

test("all eight assigned worlds support a complete versioned assessment", () => {
  const assignments = new Map();
  for (let index = 0; index < 512 && assignments.size < pilotInstrument.worlds.length; index += 1) {
    const session = createSession(pilotInstrument, `coverage-${index}`);
    assignments.set(session.worldId, session);
  }
  assert.deepEqual(new Set(assignments.keys()), new Set(pilotInstrument.worlds.map((world) => world.id)));
  for (let session of assignments.values()) {
    for (const item of pilotInstrument.statements) {
      session = setAnswer(session, `statement:${item.id}`, { kind: "value", value: 0 });
    }
    for (const item of pilotInstrument.scenarios) {
      session = setAnswer(session, `scenario:${item.id}`, {
        kind: "choice", optionId: item.options.at(-1).id, reasonId: item.reasons[0].id,
      });
    }
    session = { ...session, stepIndex: makeSteps(pilotInstrument).length - 1, completed: true };
    const restored = JSON.parse(JSON.stringify(session));
    assert.equal(validateSession(pilotInstrument, restored).valid, true);
    const summary = summarize(pilotInstrument, restored);
    for (const dimension of summary.dimensions) {
      assert.equal(dimension.statements.count, 6);
      assert.equal(dimension.scenarios.count, dimension.id === "civil" ? 1 : 2);
      assert.equal(dimension.scenarios.total, dimension.id === "civil" ? 1 : 2);
      assert.equal(dimension.statements.mean, 0);
    }
    assert.equal(validateSession(pilotInstrument, { ...restored, version: "0.1.0" }).valid, false);
  }
});

test("descriptive decisions preserve raw responses without changing a profile or its denominator", () => {
  const expanded = structuredClone(instrument);
  const descriptive = {
    ...structuredClone(expanded.scenarios[1]),
    id: "records-observation", scoring: "descriptive",
    options: [{ id: "requests", score: null }, { id: "publication", score: null }],
  };
  expanded.scenarios.splice(2, 0, descriptive);
  assert.deepEqual(validateInstrument(expanded), []);
  let session = createSession(expanded, "descriptive-case");
  session = setAnswer(session, "scenario:protest", {
    kind: "choice", optionId: "permit", reasonId: null,
  });
  const before = summarize(expanded, session).dimensions.find((dimension) => dimension.id === "civil");
  session = setAnswer(session, "scenario:records-observation", {
    kind: "choice", optionId: "requests", reasonId: "liberty",
  });
  const first = summarize(expanded, session).dimensions.find((dimension) => dimension.id === "civil");
  assert.deepEqual(first, before);
  assert.deepEqual(first.scenarios, { mean: 2, count: 1, total: 1, uncertain: 0, skipped: 0 });
  session = setAnswer(session, "scenario:records-observation", {
    kind: "choice", optionId: "publication", reasonId: null,
  });
  assert.deepEqual(summarize(expanded, session).dimensions.find((dimension) => dimension.id === "civil"), before);
  assert.deepEqual(session.answers["scenario:records-observation"], {
    kind: "choice", optionId: "publication", reasonId: null,
  });
  session = setAnswer(session, "scenario:records-observation", { kind: "uncertain", reasonId: null });
  assert.deepEqual(summarize(expanded, session).dimensions.find((dimension) => dimension.id === "civil"), before);
});

test("null option scores are permitted only on explicitly descriptive scenarios", () => {
  const descriptive = structuredClone(instrument);
  descriptive.scenarios[1].scoring = "descriptive";
  descriptive.scenarios[1].options.forEach((option) => { option.score = null; });
  assert.deepEqual(validateInstrument(descriptive), []);
  const cases = [
    (copy) => { delete copy.scenarios[1].scoring; },
    (copy) => { copy.scenarios[1].scoring = "directional"; },
    (copy) => { copy.scenarios[1].scoring = "unrecognized"; },
    (copy) => { copy.scenarios[1].scoring = null; },
    (copy) => { copy.scenarios[1].options[0].score = 0; },
    (copy) => { delete copy.scenarios[1].options[0].score; },
  ];
  for (const mutate of cases) {
    const copy = structuredClone(descriptive);
    mutate(copy);
    assert.ok(validateInstrument(copy).length > 0);
  }
  const directional = structuredClone(instrument);
  directional.scenarios[0].scoring = "directional";
  assert.deepEqual(validateInstrument(directional), []);
});

test("optional personal preferences validate independently of the primary response kind", () => {
  const base = filledSession();
  for (const primary of [
    { kind: "choice", optionId: "sell", reasonId: "capacity" },
    { kind: "uncertain", reasonId: null },
    { kind: "none", reasonId: null },
    { kind: "skip", reasonId: null },
  ]) {
    for (const preference of [
      null, { kind: "choice", optionId: "retain" }, { kind: "uncertain" }, { kind: "none" },
    ]) {
      const updated = setAnswer(base, "scenario:housing", { ...primary, preference });
      assert.equal(validateSession(instrument, updated).valid, true);
      assert.equal(validateSession(instrument, JSON.parse(JSON.stringify(updated))).valid, true);
    }
    assert.equal(validateSession(instrument, setAnswer(base, "scenario:housing", primary)).valid, true);
  }
});

test("personal preferences reject unknown choices and malformed nested fields", () => {
  const base = filledSession();
  const invalidPreferences = [
    undefined, [], "retain", 1, true, {},
    { kind: "skip" }, { kind: "neutral" }, { kind: "choice" },
    { kind: "choice", optionId: "permit" },
    { kind: "choice", optionId: 1 },
    { kind: "choice", optionId: "retain", score: 2 },
    { kind: "choice", optionId: "retain", reasonId: null },
    { kind: "uncertain", optionId: "retain" },
    { kind: "none", value: 0 },
    JSON.parse('{"kind":"none","__proto__":{}}'),
  ];
  for (const preference of invalidPreferences) {
    const candidate = setAnswer(base, "scenario:housing", {
      kind: "choice", optionId: "sell", reasonId: null, preference,
    });
    assert.equal(validateSession(instrument, candidate).valid, false, JSON.stringify(preference));
  }
  for (const answer of [
    { kind: "value", value: 1, preference: null },
    { kind: "uncertain", preference: { kind: "uncertain" } },
    { kind: "skip", preference: { kind: "none" } },
  ]) {
    assert.equal(validateSession(instrument, setAnswer(base, "statement:ownership", answer)).valid, false);
  }
});

test("personal preferences remain separate from scores and the controlled housing comparison", () => {
  const initial = filledSession();
  const baseline = summarize(instrument, initial);
  let session = setAnswer(initial, "scenario:housing", {
    ...initial.answers["scenario:housing"], preference: { kind: "choice", optionId: "retain" },
  });
  const first = summarize(instrument, session);
  assert.deepEqual(first.dimensions, baseline.dimensions);
  assert.deepEqual(first.comparisons, baseline.comparisons);
  assert.deepEqual(first.preferences, [
    { scenarioId: "housing", actionOptionId: "sell", preferredOptionId: "retain", status: "choice", different: true },
    { scenarioId: "protest", actionOptionId: "permit", preferredOptionId: null, status: "not-provided", different: null },
    { scenarioId: "housing_comparison", actionOptionId: "sell", preferredOptionId: null, status: "not-provided", different: null },
  ]);
  session = setAnswer(session, "scenario:housing", {
    ...session.answers["scenario:housing"], preference: { kind: "choice", optionId: "sell" },
  });
  assert.equal(summarize(instrument, session).preferences[0].different, false);
  for (const preference of [{ kind: "uncertain" }, { kind: "none" }, null]) {
    session = setAnswer(session, "scenario:housing", { ...session.answers["scenario:housing"], preference });
    const summary = summarize(instrument, session);
    assert.equal(summary.preferences[0].status, preference?.kind ?? "not-provided");
    assert.equal(summary.preferences[0].preferredOptionId, null);
    assert.equal(summary.preferences[0].different, null);
    assert.deepEqual(summary.dimensions, baseline.dimensions);
    assert.deepEqual(summary.comparisons, baseline.comparisons);
  }
  session = setAnswer(session, "scenario:housing", {
    kind: "uncertain", reasonId: null, preference: { kind: "choice", optionId: "retain" },
  });
  assert.equal(summarize(instrument, session).preferences[0].actionOptionId, null);
  assert.equal(summarize(instrument, session).preferences[0].different, null);
});

test("updating an answer copies the nested preference without mutating earlier state", () => {
  const initial = createSession(instrument, "preference-copy");
  const preference = { kind: "choice", optionId: "retain" };
  const first = setAnswer(initial, "scenario:housing", {
    kind: "choice", optionId: "sell", reasonId: null, preference,
  });
  preference.optionId = "sell";
  assert.equal(first.answers["scenario:housing"].preference.optionId, "retain");
  const replacement = setAnswer(first, "scenario:housing", {
    ...first.answers["scenario:housing"], preference: { kind: "none" },
  });
  replacement.answers["scenario:housing"].preference.kind = "uncertain";
  assert.deepEqual(first.answers["scenario:housing"].preference, { kind: "choice", optionId: "retain" });
  assert.deepEqual(initial.answers, {});
});

test("descriptive and comparison personal preferences never acquire directional weight", () => {
  let session = createSession(pilotInstrument, "shipped-personal-preference");
  const baseline = summarize(pilotInstrument, session);
  for (const id of ["public-records", "housing-planned"]) {
    const scene = pilotInstrument.scenarios.find((item) => item.id === id);
    session = setAnswer(session, `scenario:${id}`, {
      kind: "choice", optionId: scene.options[0].id, reasonId: scene.reasons[0].id,
      preference: { kind: "choice", optionId: scene.options[1].id },
    });
  }
  assert.equal(validateSession(pilotInstrument, session).valid, true);
  assert.deepEqual(summarize(pilotInstrument, session).dimensions, baseline.dimensions);
  assert.equal(summarize(pilotInstrument, session).preferences.filter((row) => row.status === "choice").length, 2);
});

test("the preference protocol version rejects old saves without changing their source data", () => {
  assert.equal(pilotInstrument.version, "0.3.0");
  const current = createSession(pilotInstrument, "new-protocol");
  const old = { ...current, version: "0.2.0" };
  const serialized = JSON.stringify(old);
  assert.equal(validateSession(pilotInstrument, old).valid, false);
  assert.equal(JSON.stringify(old), serialized);
  assert.equal(validateSession(pilotInstrument, current).valid, true);
});
