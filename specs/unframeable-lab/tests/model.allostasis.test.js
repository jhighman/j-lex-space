"use strict";

const assert = require("node:assert/strict");
const { simulate, constants } = require("../lab/model.js");

function event(run, kind) {
  return run.events.find((entry) => entry.kind === kind);
}

function events(run, kind) {
  return run.events.filter((entry) => entry.kind === kind);
}

function runAllostaticFloorCase() {
  const run = simulate({
    pace: "busy",
    roundSec: 180,
    seed: 51,
    personaName: "single-shock-recovery",
    persona: () => {},
  });

  const impact = event(run, "moment");
  assert.ok(impact, "a busy session reaches a Moment");
  assert.equal(run.allostasis.floor, constants.ALLOSTATIC_FLOOR_STEP, "a singularity raises the cumulative floor by 0.12");
  assert.ok(run.snaps.at(-1).cortisol >= run.allostasis.floor, "natural recovery never crosses the allostatic floor");
  assert.ok(run.snaps.at(-1).cortisol > run.allostasis.floor, "three minutes leave a residual stress load above the floor");
  assert.ok(event(run, "refractory_start"), "Moment starts the fourteen-second refractory window");
}

function runRefractoryCase() {
  const run = simulate({
    pace: "busy",
    roundSec: 31,
    seed: 52,
    personaName: "guarded-aftershock",
    // First immediate Moment is vulnerability-triggered. The busy fallback becomes eligible at 16 s,
    // but must be suppressed while the first 14 s refractory state is active.
    persona: () => {},
  });

  const impacts = events(run, "moment");
  assert.equal(impacts.length, 1, "a refractory window prevents any second Moment/singularity trigger");
  const refractory = event(run, "refractory_start");
  assert.equal(refractory.until - impacts[0].t, constants.REFRACTORY_WINDOW_MS, "refractory interval lasts exactly fourteen seconds");
  assert.deepEqual(refractory.audio, constants.MOMENT_AUDIO.refractory, "refractory state publishes its muted-dynamics audio cue");
}

function runBinFloorCase() {
  const run = simulate({
    pace: "busy",
    roundSec: 6,
    seed: 53,
    personaName: "bin-respects-load",
    persona: (api) => {
      api.at(100, api.open);
      api.at(700, () => api.emptyBinTrigger(0));
      api.at(1000, () => api.emptyBinResolve(0));
    },
  });

  const resolved = event(run, "bin_resolved");
  assert.ok(resolved, "Empty Bin resolves while the allostatic floor exists");
  const resolutionSnap = run.snaps.find((snap) => snap.t === resolved.t);
  assert.ok(resolutionSnap.cortisol >= resolutionSnap.allostaticFloor, "Empty Bin cannot drive cortisol below accumulated load");
}

runAllostaticFloorCase();
runRefractoryCase();
runBinFloorCase();
console.log("Allostatic and refractory conformance: pass");
