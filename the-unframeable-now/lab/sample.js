#!/usr/bin/env node
/* The Unframeable Now · lab · sample.js
 * Draw a sample of simulated sessions and write it as JSON, with the
 * numbers across them printed as a table. No dependencies.
 *
 *   node sample.js [--personas kate,doomscroller] [--paces busy] [--seeds 50] [--round 180] [--out samples.json]
 */
const fs = require('fs');
const path = require('path');
const M = require('./model.js');

const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true] : []).filter((x) => x.length));
const spec = {
  personas: args.personas ? String(args.personas).split(',') : undefined,
  paces: args.paces ? String(args.paces).split(',') : undefined,
  seeds: args.seeds ? Number(args.seeds) : 20,
  roundSec: args.round ? Number(args.round) : 180,
};
const t0 = Date.now();
const S = M.sample(spec);
const ms = Date.now() - t0;

const pad = (s, n) => String(s).padEnd(n);
const f = (x) => (Math.round(x * 100) / 100).toFixed(2);
console.log(`${S.runs.length} sessions of ${spec.roundSec}s in ${ms} ms\n`);
console.log(pad('persona', 14) + pad('pace', 8) + pad('n', 4) + pad('attention', 22) + pad('calm', 22) + pad('agency', 22) + pad('disorder', 22) + 'moves  arrivals');
for (const p of S.spec.personas) for (const pc of S.spec.paces) {
  const runs = S.runs.filter((r) => r.persona === p && r.pace === pc);
  const cell = (k) => { const s = M.stats(runs, k); return `${f(s.p50)} [${f(s.p10)}–${f(s.p90)}]`; };
  const mv = M.stats(runs, 'moves'), ar = M.stats(runs, 'arrivals');
  console.log(pad(p, 14) + pad(pc, 8) + pad(runs.length, 4) + pad(cell('a'), 22) + pad(cell('c'), 22) + pad(cell('g'), 22) + pad(cell('e'), 22) + `${f(mv.p50)}  ${f(ar.p50)}`);
}
console.log('\nmedian [p10–p90] of the end state; disorder is the field\'s, the rest are hers');
const ex = M.extremes(S.runs, 'a', 3);
console.log('\nextremes on attention, furthest from the median:');
for (const r of ex) console.log(`  ${r.persona} / ${r.pace} / seed ${r.seed}: attention ${f(r.summary.a)}, calm ${f(r.summary.c)}, agency ${f(r.summary.g)}, disorder ${f(r.summary.e)}, ${r.moves.length} moves, ${r.arrivals} arrivals`);

const out = args.out ? String(args.out) : path.join(__dirname, 'samples.json');
fs.writeFileSync(out, JSON.stringify(S));
console.log(`\nwritten: ${out} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
