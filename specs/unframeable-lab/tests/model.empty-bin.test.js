"use strict";

const assert = require("node:assert/strict");
const { simulate, constants } = require("../lab/model.js");

function event(run, kind) {
  return run.events.find((entry) => entry.kind === kind);
}

function events(run, kind) {
  return run.events.filter((entry) => entry.kind === kind);
}

function runResolutionCase() {
  const run = simulate({
    pace: "steady",
    roundSec: 7,
    seed: 41,
    moment: false,
    personaName: "bin-resolve",
    persona: (api) => {
      api.at(100, api.open);                 // move branch 0, with a reentry due at 2300 ms
      api.at(500, () => api.emptyBinTrigger(0));
      api.at(1100, () => api.emptyBinResolve(0));
    },
  });

  const start = event(run, "bin_countdown_start");
  const resolved = event(run, "bin_resolved");
  assert.ok(start, "Empty Bin starts a decision window");
  assert.ok(resolved, "selected branch is permanently resolved");
  assert.deepEqual(start.audio, constants.BIN_AUDIO.countdown, "countdown exposes its dissonance cue");
  assert.deepEqual(resolved.audio, constants.BIN_AUDIO.resolved, "resolution exposes its decaying chime cue");
  assert.equal(events(run, "bin_expired").length, 0, "resolution prevents expiry");
  assert.equal(events(run, "echo").some((entry) => entry.move === 0), false, "severed move never re-enters");
  assert.equal(run.bin.available, false, "Empty Bin remains spent for the session");
  assert.equal(run.bin.countdown, null, "resolved window is closed");
  assert.deepEqual(run.bin.severedBranches, [0], "severed branch is recorded");
}

function runTimeoutCase() {
  const run = simulate({
    pace: "steady",
    roundSec: 7,
    seed: 42,
    moment: false,
    personaName: "bin-expire",
    persona: (api) => api.at(500, () => api.emptyBinTrigger(1)),
  });

  const expired = event(run, "bin_expired");
  assert.ok(expired, "unresolved window expires after four seconds");
  assert.deepEqual(expired.audio, constants.BIN_AUDIO.expired, "expiry exposes the harsh clamp cue");
  const expirySnap = run.snaps.find((snap) => snap.t === expired.t);
  const preExpirySnap = run.snaps.filter((snap) => snap.t < expired.t).at(-1);
  assert.ok(expirySnap.c <= preExpirySnap.c - 0.29, "expiry applies the specified 0.30 calm penalty");
  assert.equal(run.bin.countdown, null, "expired window is closed");
}

function runOneTimeCase() {
  const run = simulate({
    pace: "steady",
    roundSec: 7,
    seed: 43,
    moment: false,
    personaName: "bin-once",
    persona: (api) => {
      api.at(100, () => api.emptyBinTrigger(1));
      api.at(300, () => api.emptyBinResolve(1));
      api.at(900, () => api.emptyBinTrigger(2));
    },
  });

  assert.equal(events(run, "bin_countdown_start").length, 1, "a second trigger has no effect");
  assert.equal(events(run, "bin_resolved").length, 1, "only the first branch can be removed");
}

runResolutionCase();
runTimeoutCase();
runOneTimeCase();
console.log("Empty Bin conformance: pass");
