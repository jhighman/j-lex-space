"use strict";

const assert = require("node:assert/strict");
const { simulate, constants } = require("../model.js");

function momentEvent(run) {
  return run.events.find((entry) => entry.kind === "moment");
}

function runVulnerabilityCase() {
  const run = simulate({
    pace: "busy",
    roundSec: 12,
    seed: 31,
    personaName: "unguarded",
    persona: () => {},
  });

  const impact = momentEvent(run);
  assert.ok(impact, "a busy session receives the Moment after a real stream arrival");
  assert.equal(impact.trigger, "vulnerability", "low cortisol and high calm take the vulnerability branch");
  assert.ok(impact.t < constants.MOMENT_FALLBACK_MS, "vulnerability fires before the fallback deadline");
  assert.ok(impact.t >= constants.MOMENT_EARLIEST_S * 1000, "and never before the page's earliest second");
  assert.ok(impact.impact.cortisol >= 0.65, "impact raises cortisol to at least 0.65");
  assert.ok(impact.impact.calm <= 0.6, "impact applies the 0.40 calm fall");
  assert.ok(impact.impact.attention <= 0.8, "impact applies the 0.20 attention fall");
  assert.deepEqual(impact.audio, constants.MOMENT_AUDIO.impact, "impact publishes the acoustic event contract");
  assert.equal(run.momentState.triggered, true, "moment state records a single trigger");
  assert.equal(run.events.filter((entry) => entry.kind === "moment").length, 1, "Moment triggers only once per session");
}

function runImpatienceFallbackCase() {
  const run = simulate({
    pace: "busy",
    roundSec: 18,
    seed: 32,
    personaName: "never-calm",
    // Sustained gestures keep cortisol well above the vulnerability threshold.
    persona: (api) => api.every(100, 100, api.open),
  });

  const impact = momentEvent(run);
  assert.ok(impact, "a busy session receives the fallback Moment");
  assert.equal(impact.trigger, "algorithmic_impatience", "persistent stress takes the time-based fallback branch");
  assert.equal(impact.t, constants.MOMENT_FALLBACK_MS, "fallback fires at the 16-second safeguard");
  assert.ok(impact.impact.cortisol >= 0.65, "fallback impact keeps the required cortisol floor");
  assert.deepEqual(impact.audio, constants.MOMENT_AUDIO.impact, "fallback uses the same shock-impact audio cue");
  assert.equal(run.events.filter((entry) => entry.kind === "moment").length, 1, "fallback remains one-shot");
}

runVulnerabilityCase();
runImpatienceFallbackCase();
console.log("Dynamic Moment conformance: pass");
