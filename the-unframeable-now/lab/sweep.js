#!/usr/bin/env node
/* The Unframeable Now · lab · sweep.js
 * Push one of the page's constants through a range and watch where the
 * end state goes. The question, from issue #4's framing: as the feed is
 * turned up, does a persona's end state slide, or does it drop at a
 * critical value? A slide is a slope; a drop is a phase transition.
 * No dependencies. The model is ../lab/model.js with `override`.
 *
 *   node sweep.js [--knob paceMs|askWeight|reentryMs|lifeMs] [--personas kate,tidier]
 *                 [--pace steady] [--seeds 10] [--round 120] [--points 24] [--out sweep]
 *
 * Writes <out>.json (every run's end state) and <out>.svg (the median
 * wholeness per persona against the knob, with the sharpest step marked).
 */
const fs = require('fs');
const path = require('path');
const M = require('./model.js');

const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true] : []).filter((x) => x.length));
const knob = args.knob || 'paceMs';
const personas = args.personas ? String(args.personas).split(',') : ['abstainer', 'kateStops', 'kate', 'gardener', 'tidier', 'doomscroller'];
const pace = args.pace || 'steady';
const seeds = Number(args.seeds || 10);
const roundSec = Number(args.round || 120);
const points = Number(args.points || 24);
const out = String(args.out || path.join(__dirname, `sweep-${knob}`));

// ranges: log-spaced, the page's value inside each
const RANGE = {
  paceMs: [12000, 300],      // seconds between arrivals, 12 s down to 0.3 s; the page: 6500 / 3600 / 1400
  askWeight: [0.125, 16],    // the asks' weight against the wants'; the page: 1
  reentryMs: [200, 30000],   // how long a move takes to come back; the page: 2200
  lifeMs: [4000, 120000],    // how long an item lasts; the page: 32000
};
const [lo, hi] = RANGE[knob];
const grid = Array.from({ length: points }, (_, i) => lo * Math.pow(hi / lo, i / (points - 1)));
const label = { paceMs: 'ms between arrivals', askWeight: 'asks’ weight ×', reentryMs: 'ms until a move returns', lifeMs: 'ms an item lasts' }[knob];

const wholeness = (s) => (s.a + s.c + s.g) / 3; // the minutes drain with the clock whatever happens; left out
const t0 = Date.now();
const runs = [];
for (const personaName of personas) for (const x of grid) for (let s = 0; s < seeds; s++) {
  const r = M.simulate({ persona: M.PERSONAS[personaName], personaName, pace, roundSec, seed: 1000 + s, override: { [knob]: x } });
  runs.push({ persona: personaName, x, seed: r.seed, a: r.summary.a, c: r.summary.c, g: r.summary.g, e: r.summary.e, echo: r.summary.echo, echoPeak: r.summary.echoPeak, moves: r.summary.moves, arrivals: r.summary.arrivals, w: wholeness(r.summary) });
}
const ms = Date.now() - t0;

/* per persona: the median curve, and the sharpest step in it */
const med = (xs) => M.quantile(xs, 0.5);
const curves = {};
for (const p of personas) {
  const pts = grid.map((x) => {
    const rs = runs.filter((r) => r.persona === p && r.x === x);
    return { x, w: med(rs.map((r) => r.w)), a: med(rs.map((r) => r.a)), c: med(rs.map((r) => r.c)), g: med(rs.map((r) => r.g)), echo: med(rs.map((r) => r.echo)), echoPeak: med(rs.map((r) => r.echoPeak)), arrivals: med(rs.map((r) => r.arrivals)) };
  });
  const ws = pts.map((q) => q.w);
  const range = Math.max(...ws) - Math.min(...ws);
  const steps = pts.slice(1).map((q, i) => ({ i, from: pts[i].x, to: q.x, d: q.w - pts[i].w }));
  const sharpest = steps.reduce((a, b) => (Math.abs(b.d) > Math.abs(a.d) ? b : a), steps[0]);
  const typical = med(steps.map((s) => Math.abs(s.d)));
  // the span of the knob over which the curve crosses from 90% to 10% of its range (narrow = a cliff)
  const hiW = Math.max(...ws), loW = Math.min(...ws);
  const cross = (level) => { for (let i = 1; i < pts.length; i++) { const a = pts[i - 1].w, b = pts[i].w; if ((a - level) * (b - level) <= 0 && a !== b) return pts[i - 1].x * Math.pow(pts[i].x / pts[i - 1].x, (level - a) / (b - a)); } return null; };
  const x90 = cross(loW + 0.9 * range), x10 = cross(loW + 0.1 * range);
  const decades = x90 && x10 ? Math.abs(Math.log10(x10 / x90)) : null;
  // the verdict, by rule. flat: the curve moves less than 0.15 across the whole range, which ten
  // seeds cannot tell from noise. cliff: one step carries a third of the fall or more, the shape a
  // discontinuity would have at this grid (points 0.07 decades apart). steep: no single step does,
  // but the 90→10% crossing fits in under half a decade. slides: everything else. The ratio to the
  // typical step is reported but does not decide: on a flat curve the typical step is near zero
  // and the ratio says nothing.
  const verdict = range < 0.15 ? 'flat' : Math.abs(sharpest.d) >= range / 3 ? 'cliff' : (decades != null && decades < 0.5) ? 'steep' : 'slides';
  curves[p] = { pts, range, sharpest, typical, ratio: typical ? Math.abs(sharpest.d) / typical : null, x90, x10, decades, verdict };
}

/* print */
const pad = (s, n) => String(s).padEnd(n);
const f2 = (x) => (x == null ? '    –' : (Math.round(x * 100) / 100).toFixed(2));
const fx = (x) => (x == null ? '–' : knob === 'askWeight' ? x.toFixed(2) : Math.round(x).toString());
console.log(`${runs.length} sessions of ${roundSec}s, ${label}, ${points} points from ${fx(lo)} to ${fx(hi)}, ${seeds} seeds, pace ‘${pace}’, in ${ms} ms\n`);
console.log(pad('persona', 14) + pad('whole: high → low', 20) + pad('sharpest step', 26) + pad('vs typical', 12) + pad('90%→10% span', 24) + pad('decades', 9) + 'verdict');
for (const p of personas) {
  const c = curves[p];
  console.log(pad(p, 14) + pad(`${f2(Math.max(...c.pts.map((q) => q.w)))} → ${f2(Math.min(...c.pts.map((q) => q.w)))}`, 20) + pad(`${f2(c.sharpest.d)} at ${fx(c.sharpest.from)}→${fx(c.sharpest.to)}`, 26) + pad(c.ratio == null ? '–' : `×${c.ratio.toFixed(1)}`, 12) + pad(`${fx(c.x90)} → ${fx(c.x10)}`, 24) + pad(c.decades == null ? '–' : c.decades.toFixed(2), 9) + c.verdict);
}
console.log('\nwhole = mean of attention, calm, agency at the end (median over seeds). flat: the curve moves under 0.15. cliff: one step carries a third of the fall or more. steep: no step does, but the 90→10% crossing fits in under half a decade. slides: everything else.');
console.log(`\n${pad('persona', 14)}${grid.map((x) => pad(fx(x), 7)).join('')}`);
for (const p of personas) console.log(pad(p, 14) + curves[p].pts.map((q) => pad(f2(q.w), 7)).join(''));
console.log(`\n${pad('echo at end', 14)}${grid.map((x) => pad(fx(x), 7)).join('')}`);
for (const p of personas) console.log(pad(p, 14) + curves[p].pts.map((q) => pad(f2(q.echo), 7)).join(''));

/* the figure: median wholeness per persona against the knob, log x */
const W = 1020, H = 420, L = 60, R = 310, T = 36, B = 56;
const xs = (x) => L + (Math.log(x) - Math.log(Math.min(lo, hi))) / (Math.log(Math.max(lo, hi)) - Math.log(Math.min(lo, hi))) * (W - L - R);
const ys = (w) => T + (1 - w) * (H - T - B);
const COLOURS = ['#6b6b6b', '#2a7f9e', '#7b3fa0', '#3a8f4a', '#c48a1a', '#b23a3a', '#1f5fbf', '#8a5a2a'];
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="system-ui, sans-serif" font-size="12">
<rect width="${W}" height="${H}" fill="#fcfcfa"/>
<text x="${L}" y="20" font-size="14" fill="#222">Wholeness at the end against ${label} · pace ‘${pace}’, ${roundSec}s, median of ${seeds} seeds</text>
<line x1="${L}" y1="${ys(0)}" x2="${W - R}" y2="${ys(0)}" stroke="#999"/><line x1="${L}" y1="${ys(1)}" x2="${L}" y2="${ys(0)}" stroke="#999"/>
<text x="${L - 8}" y="${ys(1) + 4}" text-anchor="end" fill="#555">1</text><text x="${L - 8}" y="${ys(0) + 4}" text-anchor="end" fill="#555">0</text>
<text x="${L - 8}" y="${ys(0.5) + 4}" text-anchor="end" fill="#555">whole</text>`;
const ticks = knob === 'askWeight' ? [0.125, 0.25, 0.5, 1, 2, 4, 8, 16] : [300, 1000, 3000, 10000, 30000, 100000].filter((v) => v >= Math.min(lo, hi) && v <= Math.max(lo, hi));
for (const v of ticks) svg += `<line x1="${xs(v)}" y1="${ys(0)}" x2="${xs(v)}" y2="${ys(0) + 5}" stroke="#999"/><text x="${xs(v)}" y="${ys(0) + 18}" text-anchor="middle" fill="#555">${fx(v)}</text>`;
svg += `<text x="${(L + W - R) / 2}" y="${H - 14}" text-anchor="middle" fill="#333">${label} (log)${knob === 'paceMs' ? ' · the feed is faster to the left' : ''}</text>`;
const pageVals = knob === 'paceMs' ? Object.entries(M.constants.PACE) : knob === 'askWeight' ? [['page', 1]] : knob === 'reentryMs' ? [['page', M.constants.REENTRY_DELAY_MS]] : [['page', M.constants.FRAGMENT_LIFE_MS]];
for (const [name, v] of pageVals) svg += `<line x1="${xs(v)}" y1="${ys(1)}" x2="${xs(v)}" y2="${ys(0)}" stroke="#bbb" stroke-dasharray="3 3"/><text x="${xs(v) + 3}" y="${ys(1) + 10}" fill="#888" font-size="10">${name}</text>`;
personas.forEach((p, i) => {
  const c = curves[p], col = COLOURS[i % COLOURS.length];
  svg += `<polyline fill="none" stroke="${col}" stroke-width="2" points="${c.pts.map((q) => `${xs(q.x).toFixed(1)},${ys(q.w).toFixed(1)}`).join(' ')}"/>`;
  const s = c.sharpest; const mx = xs(Math.sqrt(s.from * s.to)), my = ys((c.pts[s.i].w + c.pts[s.i + 1].w) / 2);
  if (c.verdict === 'cliff') svg += `<circle cx="${mx}" cy="${my}" r="5" fill="none" stroke="${col}" stroke-width="2"/>`;
  svg += `<text x="${W - R + 10}" y="${T + 16 + i * 18}" fill="${col}">${p} · ${c.verdict}</text>`;
});
svg += `<text x="${W - R + 10}" y="${T + 16 + personas.length * 18 + 10}" fill="#777" font-size="10">○ a cliff's sharpest step, if any curve has one</text></svg>`;
fs.writeFileSync(`${out}.svg`, svg);
fs.writeFileSync(`${out}.json`, JSON.stringify({ knob, label, pace, roundSec, seeds, grid, personas, curves, runs }));
console.log(`\nwritten: ${out}.svg, ${out}.json`);
