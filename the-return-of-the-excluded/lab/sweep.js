#!/usr/bin/env node
/* The Return of the Excluded · lab · sweep.js
 * Push the propensity to exclude (π) or the gain (g) through a range and
 * watch the exterior at the end of a session, per frame. The hypotheses
 * are in ../README.md, written before this ran. The verdict rule is the
 * one from the Unframeable sweep, unchanged, so the two loops are read by
 * the same rule.
 *
 *   node sweep.js [--knob propensity|gain] [--gain 1.5] [--propensity 1] [--frames none,fatigue,reactivity]
 *                 [--actMass 0.5] [--seeds 20] [--round 180] [--points 24] [--out sweep-propensity]
 */
const fs = require('fs');
const path = require('path');
const M = require('./model.js');

const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true] : []).filter((x) => x.length));
const knob = args.knob || 'propensity';
const frames = args.frames ? String(args.frames).split(',') : ['none', 'fatigue', 'reactivity', 'ironic'];
const seeds = Number(args.seeds || 20);
const roundSec = Number(args.round || 180);
const points = Number(args.points || 24);
const gainFixed = Number(args.gain || M.constants.GAIN);
const piFixed = Number(args.propensity || 1);
const actMass = args.actMass != null ? Number(args.actMass) : null;
const out = String(args.out || path.join(__dirname, `sweep-${knob}${args.gain ? `-g${args.gain}` : ''}${actMass != null ? `-a${actMass}` : ''}`));

// linear grids: π in [0, 1]; g in [0.5, 2]
const RANGE = { propensity: [0, 1], gain: [0.5, 2] };
const [lo, hi] = RANGE[knob];
const grid = Array.from({ length: points }, (_, i) => lo + (hi - lo) * i / (points - 1));
const label = knob === 'propensity' ? `propensity to exclude π (gain ${gainFixed})` : `gain g (propensity ${piFixed})`;
const sigma = M.constants.SPAWN_RATE, delta = M.constants.DECAY_RATE;
const r0 = (x) => (knob === 'propensity' ? x * gainFixed : piFixed * x) * (sigma / (sigma + delta)) * (actMass == null ? 1 : actMass);
const critical = knob === 'propensity' ? (sigma + delta) / (sigma * gainFixed * (actMass == null ? 1 : actMass)) : (sigma + delta) / (sigma * piFixed * (actMass == null ? 1 : actMass));

const t0 = Date.now();
const runs = [];
for (const frame of frames) for (const x of grid) for (let s = 0; s < seeds; s++) {
  const r = M.simulate({ seed: 1000 + s, roundSec, frame, actMass, propensity: knob === 'propensity' ? x : piFixed, gain: knob === 'gain' ? x : gainFixed });
  runs.push({ frame, x, seed: r.seed, r0: r.r0, ...r.summary });
}
const ms = Date.now() - t0;

/* the verdict rule, as in the Unframeable sweep, on the exterior at the end normalised by the frame's maximum */
const med = (xs) => M.quantile(xs, 0.5);
const curves = {};
for (const f of frames) {
  const pts = grid.map((x) => { const rs = runs.filter((r) => r.frame === f && r.x === x); const g = (k) => med(rs.map((r) => r[k])); return { x, r0: r0(x), exterior: g('exterior'), peak: g('exteriorPeak'), load: g('load'), exclusions: g('exclusions'), returns: g('returns'), field: g('field'), pollution: g('pollution') }; });
  const maxE = Math.max(...pts.map((q) => q.exterior), 1e-9);
  const ws = pts.map((q) => q.exterior / maxE);
  const range = Math.max(...ws) - Math.min(...ws);
  const steps = ws.slice(1).map((w, i) => ({ i, from: pts[i].x, to: pts[i + 1].x, d: w - ws[i] }));
  const sharpest = steps.reduce((a, b) => (Math.abs(b.d) > Math.abs(a.d) ? b : a), steps[0]);
  const typical = med(steps.map((s) => Math.abs(s.d)));
  const loW = Math.min(...ws);
  const cross = (level) => { for (let i = 1; i < pts.length; i++) { const a = ws[i - 1], b = ws[i]; if ((a - level) * (b - level) <= 0 && a !== b) return pts[i - 1].x + (pts[i].x - pts[i - 1].x) * (level - a) / (b - a); } return null; };
  const x10 = cross(loW + 0.1 * range), x90 = cross(loW + 0.9 * range);
  // on a linear grid the "decade" measure becomes the span as a share of the range
  const span = x10 != null && x90 != null ? Math.abs(x90 - x10) / (hi - lo) : null;
  const verdict = range < 0.15 ? 'flat' : Math.abs(sharpest.d) >= range / 3 ? 'cliff' : (span != null && span < 0.25) ? 'steep' : 'slides';
  curves[f] = { pts, maxE, ws, range, sharpest, typical, x10, x90, span, verdict };
}

/* print */
const pad = (s, n) => String(s).padEnd(n);
const f2 = (x) => (x == null ? '–' : (Math.round(x * 100) / 100).toFixed(2));
const f1 = (x) => (x == null ? '–' : (Math.round(x * 10) / 10).toFixed(1));
console.log(`${runs.length} sessions of ${roundSec}s, ${label}${actMass != null ? `, content destroyed and the act returns with mass ${actMass}` : ''}, ${points} points from ${f2(lo)} to ${f2(hi)}, ${seeds} seeds, in ${ms} ms`);
console.log(`R0 = ${knob === 'propensity' ? 'π' : 'g'} × ${f2((knob === 'propensity' ? gainFixed : piFixed) * (sigma / (sigma + delta)) * (actMass == null ? 1 : actMass))}; the mean-field critical ${knob === 'propensity' ? 'π' : 'g'}* = ${f2(critical)}\n`);
console.log(pad('frame', 12) + pad('exterior at end: max', 22) + pad('sharpest step (of max)', 28) + pad('10%→90% span', 16) + pad('verdict', 9) + 'nearest grid point to the step');
for (const f of frames) {
  const c = curves[f];
  console.log(pad(f, 12) + pad(f1(c.maxE), 22) + pad(`${f2(c.sharpest.d)} at ${f2(c.sharpest.from)}→${f2(c.sharpest.to)}`, 28) + pad(c.span == null ? '–' : `${f2(c.x10)}→${f2(c.x90)}`, 16) + pad(c.verdict, 9) + `${f2((c.sharpest.from + c.sharpest.to) / 2)} (critical ${f2(critical)})`);
}
console.log('\nverdict on the exterior at the end, normalised by the frame\'s maximum: flat < 0.15 of range; cliff: one step ≥ a third of the fall; steep: 10→90% within a quarter of the range; else slides.');
console.log(`\n${pad(knob === 'propensity' ? 'π' : 'g', 12)}${grid.map((x) => pad(f2(x), 7)).join('')}`);
console.log(pad('R0', 12) + grid.map((x) => pad(f2(r0(x)), 7)).join(''));
for (const f of frames) console.log(pad(`${f} ext`, 12) + curves[f].pts.map((q) => pad(f1(q.exterior), 7)).join(''));
for (const f of frames) console.log(pad(`${f} load`, 12) + curves[f].pts.map((q) => pad(f2(q.load), 7)).join(''));
for (const f of frames) console.log(pad(`${f} excl`, 12) + curves[f].pts.map((q) => pad(Math.round(q.exclusions), 7)).join(''));

/* figure: exterior at the end per frame against the knob, linear x, with R0 = 1 marked */
const W = 1020, H = 420, L = 70, R = 310, T = 36, B = 56;
const xs = (x) => L + (x - lo) / (hi - lo) * (W - L - R);
const maxAll = Math.max(...frames.map((f) => curves[f].maxE), 1);
// log scale on the exterior, as log10(1 + E), so a supercritical tail does not flatten the other frames
const ly = (e) => Math.log10(1 + Math.max(0, e));
const ys = (e) => T + (1 - ly(e) / ly(maxAll)) * (H - T - B);
const COLOURS = ['#6b6b6b', '#2a7f9e', '#b23a3a', '#c48a1a', '#7b3fa0'];
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="system-ui, sans-serif" font-size="12">
<rect width="${W}" height="${H}" fill="#fcfcfa"/>
<text x="${L}" y="20" font-size="14" fill="#222">Exterior mass at the end against ${label}${actMass != null ? ` · act returns with ${actMass}` : ''} · ${roundSec}s, median of ${seeds} seeds</text>
<line x1="${L}" y1="${ys(0)}" x2="${W - R}" y2="${ys(0)}" stroke="#999"/><line x1="${L}" y1="${ys(maxAll)}" x2="${L}" y2="${ys(0)}" stroke="#999"/>
<text x="${L - 8}" y="${ys(0) + 4}" text-anchor="end" fill="#555">0</text>
<text x="${L - 8}" y="${T - 8}" text-anchor="end" fill="#555" font-size="10">exterior, log</text>`;
for (const v of [1, 3, 10, 30, 100, 300, 1000, 3000, 10000].filter((v) => v <= maxAll)) svg += `<line x1="${L - 4}" y1="${ys(v)}" x2="${L}" y2="${ys(v)}" stroke="#999"/><text x="${L - 8}" y="${ys(v) + 4}" text-anchor="end" fill="#555">${v}</text>`;
for (let v = lo; v <= hi + 1e-9; v += (hi - lo) / 5) svg += `<line x1="${xs(v)}" y1="${ys(0)}" x2="${xs(v)}" y2="${ys(0) + 5}" stroke="#999"/><text x="${xs(v)}" y="${ys(0) + 18}" text-anchor="middle" fill="#555">${f2(v)}</text>`;
svg += `<text x="${(L + W - R) / 2}" y="${H - 14}" text-anchor="middle" fill="#333">${label}</text>`;
if (critical >= lo && critical <= hi) svg += `<line x1="${xs(critical)}" y1="${ys(maxAll)}" x2="${xs(critical)}" y2="${ys(0)}" stroke="#bbb" stroke-dasharray="3 3"/><text x="${xs(critical) + 3}" y="${ys(maxAll) + 10}" fill="#888" font-size="10">R0 = 1, by the mean field</text>`;
frames.forEach((f, i) => {
  const c = curves[f], col = COLOURS[i % COLOURS.length];
  svg += `<polyline fill="none" stroke="${col}" stroke-width="2" points="${c.pts.map((q) => `${xs(q.x).toFixed(1)},${ys(q.exterior).toFixed(1)}`).join(' ')}"/>`;
  if (c.verdict === 'cliff' || c.verdict === 'steep') { const s = c.sharpest; svg += `<circle cx="${xs((s.from + s.to) / 2)}" cy="${ys((c.pts[s.i].exterior + c.pts[s.i + 1].exterior) / 2)}" r="5" fill="none" stroke="${col}" stroke-width="2"/>`; }
  svg += `<text x="${W - R + 10}" y="${T + 16 + i * 18}" fill="${col}">${f} · ${c.verdict}</text>`;
});
svg += `<text x="${W - R + 10}" y="${T + 16 + frames.length * 18 + 10}" fill="#777" font-size="10">○ the sharpest step of a cliff or a steep curve</text></svg>`;
fs.writeFileSync(`${out}.svg`, svg);
fs.writeFileSync(`${out}.json`, JSON.stringify({ knob, label, gainFixed, piFixed, actMass, roundSec, seeds, grid, frames, critical, curves, runs }));
console.log(`\nwritten: ${out}.svg, ${out}.json`);
