#!/usr/bin/env node
/* The Unframeable Now · lab · knee.js
 * Where does the knee in the arrival-interval sweep come from? A reading
 * by hand, checked against the sweep. On the page attention recovers only
 * on a tick when nothing has arrived for 3 s (QUIET_MS). The gap between
 * arrivals is paceMs × u with u uniform on [0.6, 1.5). So the share of
 * gaps long enough to recover in is
 *     q(p) = clamp((1.5 − QUIET_MS / p) / 0.9, 0, 1)
 * which is 0 for p ≤ 2000, 1 for p ≥ 5000, and linear in 1/p between.
 * That function is continuous. If the sweep's attention curve follows
 * it, the knee is this threshold meeting the arrival rate, and not a
 * transition in the state.
 *   node knee.js [sweep-paceMs.json]
 */
const fs = require('fs');
const file = process.argv[2] || `${__dirname}/sweep-paceMs.json`;
const S = JSON.parse(fs.readFileSync(file, 'utf8'));
const QUIET_MS = 3000;
const q = (p) => Math.min(1, Math.max(0, (1.5 - QUIET_MS / p) / 0.9));
const corr = (xs, ys) => { const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n; let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; } return sxy / Math.sqrt(sxx * syy); };
const pad = (s, n) => String(s).padEnd(n);
console.log(`${file.split('/').pop()} · pace ‘${S.pace}’ · ${S.seeds} seeds\n`);
console.log(pad('paceMs', 8) + pad('q(p) quiet share', 18) + S.personas.map((p) => pad(p, 14)).join('') + '  (median attention at the end)');
for (const [i, x] of S.grid.entries()) console.log(pad(Math.round(x), 8) + pad(q(x).toFixed(2), 18) + S.personas.map((p) => pad(S.curves[p].pts[i].a.toFixed(2), 14)).join(''));
console.log('\ncorrelation of each persona’s attention curve with q(p), across the grid:');
for (const p of S.personas) console.log(`  ${pad(p, 14)} r = ${corr(S.grid.map(q), S.curves[p].pts.map((pt) => pt.a)).toFixed(3)}`);
const first = S.grid.find((x) => q(x) < 1), last = S.grid.find((x) => q(x) <= 0);
console.log(`\nq(p) leaves 1 at p = ${Math.round(first)} and reaches 0 at p = ${Math.round(last)}; between them it is linear in 1/p. The page's paces: calm 6500 (q=${q(6500).toFixed(2)}), steady 3600 (q=${q(3600).toFixed(2)}), busy 1400 (q=${q(1400).toFixed(2)}).`);
