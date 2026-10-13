/* The Unframeable Now · lab · model.js
 *
 * The premise's model, re-stated so it can run without a browser clock:
 * the stream, the feed that learns, the cortisol the music follows, the
 * moment on a bad day, and the decay from whole. Every constant here is
 * copied from ../index.html and named the same. If this file and the page
 * disagree, the page is right and this file is wrong; conformance.js
 * measures the gap. Nothing in here renders. Works in Node and the browser.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DecayModel = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---- constants, from the page ---- */
  const PACE = { calm: 6500, steady: 3600, busy: 1400 };
  const FRAGMENT_LIFE_MS = 32000;
  const REENTRY_DELAY_MS = 2200;
  const MAX_FRAGMENTS = 48;
  const TICK_MS = 250;
  const MINUTES_MS = 20 * 60 * 1000;
  const WANTS = new Set(['garden', 'art', 'music']);
  const CHANNEL_WEIGHTS = [['social', 3], ['news', 3], ['work', 2], ['family', 2], ['garden', 1], ['art', 1], ['music', 1]];
  const FLOOR = { calm: 0, steady: 0.1, busy: 0.3 };
  const BPM = { calm: 60, steady: 84, busy: 120 };
  const MOVE_CORTISOL = { calm: 0.14, steady: 0.08, busy: 0.06 };
  const MOMENT_AT_S = 8;               // the bad day's moment, seconds of busy running time

  /* ---- a seeded random, so a sample can be repeated ---- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function entropyOf(fr) {
    if (!fr.length) return 0;
    const counts = {}; for (const f of fr) counts[f.source] = (counts[f.source] || 0) + 1;
    const ps = Object.values(counts).map((c) => c / fr.length);
    const H = -ps.reduce((a, p) => a + p * Math.log(p), 0) / Math.log(8);
    const echo = fr.filter((f) => f.kind === 'gesture').length / fr.length;
    const below = fr.filter((f) => f.score < f.threshold).length / fr.length;
    return Math.min(1, 0.55 * H + 0.3 * echo + 0.15 * below);
  }

  /* ---- one session ----
   * opts: { pace, roundSec, seed, persona }
   * persona: function (api) that schedules actions; see PERSONAS.
   * returns { snaps, moves, arrivals, summary } */
  function simulate(opts) {
    const pace = opts.pace || 'steady';
    const ROUND = (opts.roundSec || 180) * 1000;
    const rnd = mulberry32(opts.seed == null ? 1 : opts.seed);
    const R = (a, b) => a + rnd() * (b - a);
    const pick = (xs) => xs[Math.floor(rnd() * xs.length)];

    const st = {
      t: 0, fragments: [], weights: Object.fromEntries(CHANNEL_WEIGHTS), muted: new Set(),
      cortisol: 0, lastArrival: -1e9, decay: { a: 1, c: 1, g: 1, m: 1, e: 0 },
      snaps: [], moves: [], arrivals: 0, seen: { ask: 0, want: 0 }, below: { ask: 0, want: 0 },
      momentT: 0, momentFired: false, momentAt: null, nextId: 1,
      events: [], lastLike: {}, lastMute: null,
    };
    const queue = []; // { t, fn }
    const at = (t, fn) => { queue.push({ t, fn }); };

    function pickChannel() {
      const entries = Object.entries(st.weights).filter(([c, w]) => w > 0 && !st.muted.has(c));
      const total = entries.reduce((a, [, w]) => a + w, 0);
      if (!total) return null;
      let r = rnd() * total;
      for (const [c, w] of entries) { if ((r -= w) < 0) return c; }
      return entries[0][0];
    }
    function makeItem() {
      const ch = pickChannel(); if (!ch) return null;
      const want = WANTS.has(ch);
      return { id: st.nextId++, kind: 'item', source: ch, want, score: want ? R(0.05, 0.62) : R(0.35, 0.98), threshold: R(0.1, 0.55), born: st.t, hidden: false, liked: false };
    }
    function enter(f) {
      if (!f) return;
      st.fragments.push(f); while (st.fragments.length > MAX_FRAGMENTS) st.fragments.shift();
      if (f.kind === 'gesture') { st.events.push({ t: st.t, kind: 'echo', move: f.move }); return; }
      st.arrivals += 1;
      st.events.push({ t: st.t, kind: 'arrival', source: f.source, want: f.want, below: f.score < f.threshold, like: st.lastLike[f.source] ?? null, mute: st.lastMute });
      const k = f.want ? 'want' : 'ask'; st.seen[k] += 1; if (f.score < f.threshold) st.below[k] += 1;
      st.cortisol = Math.min(1, st.cortisol + (f.want ? 0.005 : 0.015));
      st.lastArrival = st.t;
      st.decay.a = Math.max(0, st.decay.a - (f.want ? 0.002 : 0.006));
      if (!f.want && f.source === 'social') st.decay.c = Math.max(0, st.decay.c - 0.02);
    }
    function snap(cause) {
      const d = st.decay;
      st.snaps.push({ t: st.t, a: d.a, c: d.c, g: d.g, m: d.m, e: d.e, cause: cause || null });
    }
    function move(kind, detail, said) {
      const g = { at: st.t, kind, detail, said, i: st.moves.length };
      st.moves.push(g);
      st.events.push({ t: st.t, kind: 'move', move: g.i, said, what: kind, detail });
      if (kind === 'liked') st.lastLike[detail] = g.i;
      if (kind === 'muted') st.lastMute = g.i;
      st.cortisol = Math.min(1, st.cortisol + MOVE_CORTISOL[pace]);
      const d = st.decay;
      d.a = Math.max(0, d.a - ({ scrolled: 0.015, opened: 0.01, refreshed: 0.025 }[kind] || 0.008));
      d.g = Math.max(0, d.g - 0.02);
      if (kind === 'liked' && WANTS.has(detail)) d.g = Math.min(1, d.g + 0.08);
      if (kind === 'hid' || kind === 'muted') { d.c = Math.min(1, d.c + 0.05); st.cortisol = Math.max(0, st.cortisol - 0.15); }
      at(st.t + REENTRY_DELAY_MS, () => enter({ id: st.nextId++, kind: 'gesture', source: 'you', want: false, score: R(0.35, 0.98), threshold: R(0.1, 0.55), born: st.t, hidden: false, move: g.i }));
      snap(`you, ${said}`);
    }

    /* what a persona can do; each is a move, as on the page */
    const visible = () => st.fragments.filter((f) => f.kind !== 'gesture' && !f.hidden && !st.muted.has(f.source));
    const api = {
      t: () => st.t, rnd,
      scroll: () => move('scrolled', '', 'scrolling'),
      open: () => move('opened', '', 'tapping one open'),
      like: (wantOnly) => { const c = visible().filter((f) => !f.liked && (!wantOnly || f.want)); if (!c.length) return false; const f = pick(c); move('opened', '', 'tapping one open'); f.liked = true; st.weights[f.source] = Math.max(0.5, (st.weights[f.source] || 0) + 1); move('liked', f.source, `liking ${f.source}`); return true; },
      hide: (askOnly) => { const c = visible().filter((f) => !askOnly || !f.want); if (!c.length) return false; const f = pick(c); move('opened', '', 'tapping one open'); f.hidden = true; st.weights[f.source] = Math.max(0.5, (st.weights[f.source] || 1) - 1); move('hid', f.source, `hiding ${f.source}`); return true; },
      mute: (ch) => { const c = ch ? [ch] : [...new Set(visible().filter((f) => !f.want).map((f) => f.source))]; if (!c.length) return false; const m = pick(c); if (st.muted.has(m)) return false; move('opened', '', 'tapping one open'); st.muted.add(m); move('muted', m, `muting ${m}`); return true; },
      refresh: () => { for (let i = 0; i < 3; i++) enter(makeItem()); move('refreshed', '', 'pulling to refresh'); },
      search: (q) => move('filtered', q, `searching for ${q}`),
      why: () => move('why', '', 'asking why about one'),
      paced: () => move('paced', pace, `calling it a ${{ calm: 'quiet evening', steady: 'normal day', busy: 'bad day' }[pace]}`),
      at: (tMs, fn) => at(tMs, fn),
      every: (fromMs, everyMs, fn) => { for (let t = fromMs; t < ROUND; t += everyMs) at(t, fn); },
    };

    /* the stream, as on the page: clumps, uneven gaps */
    function streamTick() {
      const burst = rnd() < 0.3 ? 2 + Math.floor(rnd() * 2) : 1;
      for (let i = 0; i < burst; i++) at(st.t + i * 350, () => enter(makeItem()));
      at(st.t + PACE[pace] * (0.6 + rnd() * 0.9), streamTick);
    }
    // seed, as on the page: seven items already there, born before the start
    for (let i = 0; i < 7; i++) { const f = makeItem(); if (f) { f.born = -(7 - i) * PACE.steady; st.fragments.push(f); } }
    at(PACE[pace], streamTick);
    (opts.persona || PERSONAS.kate)(api, pace, ROUND);
    snap('the start');

    /* run: 50 ms steps, so the 250 ms tick lands where the page's does; the queue fires in order */
    let lastTick = 0;
    queue.sort((x, y) => x.t - y.t);
    while (st.t < ROUND) {
      st.t += 50;
      while (queue.length && queue[0].t <= st.t) { const q = queue.shift(); q.fn(); queue.sort((x, y) => x.t - y.t); }
      // ageing out, as the page's tick does
      for (const f of [...st.fragments]) if (st.t - f.born > FRAGMENT_LIFE_MS) st.fragments.splice(st.fragments.indexOf(f), 1);
      if (st.t % 100 === 0) st.cortisol = Math.max(0, st.cortisol - 0.0015);
      if (pace === 'busy') { st.momentT += 0.05; if (!st.momentFired && st.momentT >= MOMENT_AT_S) { st.momentFired = true; st.momentAt = st.t; st.decay.c = Math.max(0, st.decay.c - 0.35); st.decay.a = Math.max(0, st.decay.a - 0.15); st.events.push({ t: st.t, kind: 'moment' }); snap('something you did not ask for'); } }
      if (st.t - lastTick >= TICK_MS) {
        lastTick = st.t;
        const d = st.decay;
        if (st.t - st.lastArrival > 3000) d.a = Math.min(1, d.a + 0.004);
        const calmTarget = 1 - Math.max(FLOOR[pace], st.cortisol);
        d.c += (calmTarget - d.c) * 0.06;
        const n = st.fragments.length, e = st.fragments.filter((f) => f.kind === 'gesture').length;
        d.g = Math.max(0, d.g - 0.004 * (n ? e / n : 0));
        d.m = Math.max(0, 1 - st.t / MINUTES_MS);
        d.e = entropyOf(st.fragments);
        if (st.t % 1000 === 0) snap(null);
      }
    }
    snap('the end');
    const first = st.snaps[0], last = st.snaps[st.snaps.length - 1];
    const minOf = (k) => Math.min(...st.snaps.map((s) => s[k]));
    return {
      pace, roundSec: ROUND / 1000, seed: opts.seed, persona: opts.personaName || 'kate',
      snaps: st.snaps, moves: st.moves, events: st.events, arrivals: st.arrivals, seen: st.seen, below: st.below, momentAt: st.momentAt,
      summary: { a: last.a, c: last.c, g: last.g, m: last.m, e: last.e, aMin: minOf('a'), cMin: minOf('c'), gMin: minOf('g'), eMax: Math.max(...st.snaps.map((s) => s.e)), moves: st.moves.length, arrivals: st.arrivals },
    };
  }

  /* ---- personas: how a session is used ----
   * Each schedules moves on the api. They are the sample's independent
   * variable; add one here and it is available everywhere. */
  const PERSONAS = {
    // Kate's seven things in the first twenty seconds, then a scroll or a tap now and then
    kate: (api, pace, ROUND) => {
      api.at(2600, api.scroll); api.at(5100, api.open); api.at(9100, () => api.like(true) || api.like());
      api.at(13000, () => api.hide(true)); api.at(16300, () => api.mute()); api.at(19600, () => api.search('garden')); api.at(22700, api.refresh);
      api.every(30000, 9000, () => (api.rnd() < 0.5 ? api.scroll() : api.open()));
    },
    // Kate, then hands off after forty-five seconds
    kateStops: (api) => {
      api.at(2600, api.scroll); api.at(5100, api.open); api.at(9100, () => api.like(true) || api.like());
      api.at(13000, () => api.hide(true)); api.at(16300, () => api.mute()); api.at(19600, () => api.search('garden')); api.at(22700, api.refresh);
      api.at(31500, api.open); api.at(39500, api.scroll);
    },
    // never stops: a scroll every three seconds, a tap every seven, a refresh every twenty
    doomscroller: (api) => { api.every(1500, 3000, api.scroll); api.every(4000, 7000, api.open); api.every(10000, 20000, api.refresh); },
    // hides and mutes everything that asks, and nothing else
    tidier: (api) => { api.every(3000, 4000, () => api.hide(true) || api.mute()); },
    // likes only what she wanted, never touches an ask
    gardener: (api) => { api.every(4000, 6000, () => api.like(true)); api.every(9000, 15000, api.scroll); },
    // opens it and does nothing
    abstainer: () => {},
  };

  /* ---- samples: many sessions, and the numbers across them ---- */
  function sample(spec) {
    const runs = [];
    const personas = spec.personas || Object.keys(PERSONAS);
    const paces = spec.paces || ['calm', 'steady', 'busy'];
    const seeds = spec.seeds || 20;
    for (const personaName of personas) for (const pace of paces) for (let s = 0; s < seeds; s++) {
      runs.push(simulate({ persona: PERSONAS[personaName], personaName, pace, roundSec: spec.roundSec || 180, seed: (spec.seedBase || 1000) + s }));
    }
    return { spec: { personas, paces, seeds, roundSec: spec.roundSec || 180 }, runs };
  }
  function quantile(xs, q) { const a = xs.slice().sort((x, y) => x - y); const i = (a.length - 1) * q; const lo = Math.floor(i), hi = Math.ceil(i); return a[lo] + (a[hi] - a[lo]) * (i - lo); }
  function stats(runs, key) {
    const xs = runs.map((r) => r.summary[key]);
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
    const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, xs.length - 1));
    return { n: xs.length, mean, sd, min: Math.min(...xs), max: Math.max(...xs), p10: quantile(xs, 0.1), p50: quantile(xs, 0.5), p90: quantile(xs, 0.9) };
  }
  /* the median trajectory of a group, with a p10–p90 band, resampled to a common clock */
  function band(runs, key, stepMs) {
    const dur = Math.max(...runs.map((r) => r.snaps[r.snaps.length - 1].t));
    const out = [];
    for (let t = 0; t <= dur; t += stepMs || 1000) {
      const vals = runs.map((r) => { let v = r.snaps[0][key]; for (const s of r.snaps) { if (s.t <= t) v = s[key]; else break; } return v; });
      out.push({ t, p10: quantile(vals, 0.1), p50: quantile(vals, 0.5), p90: quantile(vals, 0.9) });
    }
    return out;
  }
  /* the extremes: the runs furthest from their group's median on a key */
  function extremes(runs, key, k) {
    const med = quantile(runs.map((r) => r.summary[key]), 0.5);
    return runs.slice().sort((x, y) => Math.abs(y.summary[key] - med) - Math.abs(x.summary[key] - med)).slice(0, k || 3);
  }

  return { simulate, sample, stats, band, extremes, quantile, PERSONAS, constants: { PACE, FRAGMENT_LIFE_MS, REENTRY_DELAY_MS, MAX_FRAGMENTS, MINUTES_MS, WANTS, CHANNEL_WEIGHTS, FLOOR, BPM, MOMENT_AT_S } };
});
