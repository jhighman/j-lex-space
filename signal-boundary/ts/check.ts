/**
 * Does the screen's guarantee run through the tested function?
 *
 * QUESTION:   round 0 of the revision history says an interactive screen
 *             told a reader that completion restores State 0 even when the
 *             useful work raised, over a mechanism that had no failure path
 *             at all — and that the guarantee did exist, correctly
 *             implemented and tested, in a function the screen never
 *             called. The correction wired the screen to that function.
 *             This file is what the screen now calls.
 * METHOD:     the guard itself, and the transmission the screen runs
 *             through it, asked for both completion paths. No harness: the
 *             original suite is vitest and lives in the application this
 *             came from, which would need an install to run. Node strips
 *             the types and runs this directly.
 * REFUTED BY: a payload that returns without restoring State 0, a payload
 *             that raises without restoring it, a fault that does not
 *             reach the caller, or a caller able to tell the two paths
 *             apart by what the carrier is left holding.
 *
 *   node signal-boundary/ts/check.ts
 */

import {
  CQD_FRAMES,
  SOS_WAVEFORM,
  nextCqdMode,
  runProtectedSos,
  transmitWithOutcome,
} from "./signal-protocol.ts";

let failed = 0;

function check(name: string, holds: boolean, detail = ""): void {
  console.log(`  ${holds ? "holds" : "MOVED"}  ${name}`);
  if (detail) console.log(`         ${detail}`);
  if (!holds) failed += 1;
}

console.log("Does the screen's guarantee run through the tested function?");
console.log();

// The failure model, which passes by being broken.
check(
  "the weak protocol moves through its exposed corruption states",
  nextCqdMode("clean") === "interrupted" &&
    nextCqdMode("interrupted") === "reordered" &&
    nextCqdMode("reordered") === "clean",
);
check(
  "and its ordering is not an invariant",
  JSON.stringify(CQD_FRAMES.reordered.tokens) === JSON.stringify(["D", "Q", "C"]),
  `tokens after reordering: ${CQD_FRAMES.reordered.tokens.join("")}`,
);

// The carrier.
check(
  "the waveform is nine marks with no whitespace",
  SOS_WAVEFORM.length === 9 && !/\s/.test(SOS_WAVEFORM),
  `${SOS_WAVEFORM} — ${SOS_WAVEFORM.length} marks`,
);

// Teardown, on the path that returns.
let state = 1;
const marks = runProtectedSos((wave) => wave.length, () => {
  state = 0;
});
check("a payload that returns transmits nine marks", marks === 9);
check("and leaves the carrier at State 0", state === 0);

// Teardown, on the path that raises.
state = 1;
let reached = "";
try {
  runProtectedSos(
    () => {
      throw new Error("carrier fault");
    },
    () => {
      state = 0;
    },
  );
} catch (error) {
  reached = error instanceof Error ? error.message : String(error);
}
check("a payload that raises reaches the caller", reached === "carrier fault");
check("and still leaves the carrier at State 0", state === 0);

// The transmission the screen actually runs.
state = 1;
const clean = transmitWithOutcome(false, () => {
  state = 0;
});
check(
  "the clean transmission reports the path it took",
  clean.path === "completed" && clean.marks === SOS_WAVEFORM.length,
  JSON.stringify(clean),
);
check("and restored State 0", state === 0);

state = 1;
const faulted = transmitWithOutcome(true, () => {
  state = 0;
});
check(
  "the faulting transmission reports its fault without letting it escape",
  faulted.path === "raised" && faulted.message === "carrier fault",
  JSON.stringify(faulted),
);
check("and restored State 0 all the same", state === 0);

// The property the screen is for: the caller cannot tell the paths apart
// by what the carrier is left holding.
const left = new Set<number>();
for (const armed of [false, true]) {
  state = 1;
  transmitWithOutcome(armed, () => {
    state = 0;
  });
  left.add(state);
}
check(
  "no completion path leaves the carrier in a state the other does not",
  left.size === 1 && left.has(0),
  `states observed after both paths: {${[...left].join(", ")}}`,
);

console.log();
if (failed > 0) {
  console.log(`${failed} boundary check(s) failed.`);
  process.exit(1);
}
console.log("The guarantee is exercised, not asserted.");
