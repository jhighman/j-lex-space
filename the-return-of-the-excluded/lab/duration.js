#!/usr/bin/env node
/* The Return of the Excluded · lab · duration.js
 * A post-hoc test, written after the π sweep came back "slides" on every
 * frame (README, Results). The pre-registered verdict rule reads a bounded
 * end state; a quantity that diverges at a critical point does not step,
 * it grows, and in a finite session it grows smoothly. The right question
 * for a critical point is therefore not "is there a step in π" but "does
 * the end state depend on how long the session ran". Below R0 = 1 the
 * exterior should settle: a longer session ends about where a shorter one
 * did. Above it the exterior should keep growing with the session's length.
 *
 *   node duration.js [--gain 1.5] [--frame none] [--seeds 20]
 */
const M = require('./model.js');
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true] : []).filter((x) => x.length));
const gain = Number(args.gain || M.constants.GAIN), frame = args.frame || 'none', seeds = Number(args.seeds || 20);
const pis = [0.4, 0.6, 0.7, 0.8, 0.9, 1.0], rounds = [90, 180, 360, 720];
const sigma = M.constants.SPAWN_RATE, delta = M.constants.DECAY_RATE;
const pad = (s, n) => String(s).padEnd(n), f1 = (x) => x.toFixed(1), f2 = (x) => x.toFixed(2);
console.log(`median exterior at the end, gain ${gain}, frame ${frame}, ${seeds} seeds; R0 = π × ${f2(gain * sigma / (sigma + delta))}\n`);
console.log(pad('π', 6) + pad('R0', 6) + rounds.map((r) => pad(`${r}s`, 9)).join('') + pad('720/180', 9) + 'growth/min (log, last half of 720 s)');
for (const pi of pis) {
  // one 720 s run per seed; the same seed gives the same trajectory, so the shorter sessions are read off its snapshots
  const runs = Array.from({ length: seeds }, (_, s) => M.simulate({ seed: 1000 + s, roundSec: 720, propensity: pi, gain, frame }));
  const at = (r, sec) => { let v = r.snaps[0].exterior; for (const q of r.snaps) { if (q.t <= sec * 1000) v = q.exterior; else break; } return v; };
  const med = rounds.map((sec) => M.quantile(runs.map((r) => at(r, sec)), 0.5));
  const rate = M.quantile(runs.map((r) => (Math.log(Math.max(at(r, 720), 0.1)) - Math.log(Math.max(at(r, 360), 0.1))) / 6), 0.5);
  console.log(pad(f2(pi), 6) + pad(f2(pi * gain * sigma / (sigma + delta)), 6) + med.map((m) => pad(f1(m), 9)).join('') + pad(f2(med[3] / Math.max(med[1], 0.1)), 9) + (rate >= 0 ? '+' : '') + f2(rate));
}
console.log('\nsettled: the 720 s column is about the 180 s column and the growth rate is near zero. growing: the ratio is well above one and the rate positive.');
