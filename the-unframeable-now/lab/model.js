/* The Unframeable Now · lab · model.js
 *
 * The premise's model, re-stated so it can run without a browser clock:
 * the stream, the feed that learns, the cortisol the music follows and the
 * load it keeps, the moment on a bad day and the aftershock after it, the
 * Empty Bin, and the decay from whole. Every constant here is copied from
 * ../index.html and named the same. If this file and the page disagree,
 * the page is right and this file is wrong; conformance.js measures the
 * gap. Nothing in here renders. Works in Node and the browser.
 *
 * Modules 1–5 (Empty Bin, dynamic moment, audio cues, aftershock,
 * allostatic load) follow Lex's spec in specs/unframeable-lab/, folded in
 * on 2026-10-14 with the adaptations named in ../README.md under
 * "Lex's modules".
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
  // the moment on a bad day: the feed strikes when she is calm and her hands are still
  // (vulnerability), and no later than the fallback (algorithmic impatience); never
  // before the earliest second, which is the page's constant from before the modules
  const MOMENT_EARLIEST_S = 8;
  const MOMENT_FALLBACK_MS = 16000;
  const MOMENT_STILL_MS = 4000;        // hands still this long counts as calm hands
  const MOMENT_CALM_SHARE = 0.8;       // calm at least this share of what the day allows, 1 − FLOOR
  const ALLOSTATIC_FLOOR_STEP = 0.12;  // what a moment leaves behind, for good
  const REFRACTORY_WINDOW_MS = 14000;  // the aftershock
  // slow asymptotic recovery toward the floor: a three-minute session keeps a residue
  const CORTISOL_RECOVERY_TIME_CONSTANT_MS = 20000;
  const MOMENT_AUDIO = {
    impact: { cue: 'moment_shock_impact', mode: 'algorithmic-shock-impact', release: 'abrupt' },
    refractory: { cue: 'refractory_aftershock', mode: 'low-dynamic-range-aftershock', release: 'decaying' },
  };
  const BIN_DECISION_WINDOW_S = 4.0;   // the Empty Bin: one per session, four seconds to choose
  const BIN_AUDIO = {
    countdown: { cue: 'bin_countdown_dissonance', mode: 'escalating-dissonance', release: 'held' },
    resolved: { cue: 'bin_resolved_chime', mode: 'high-harmonic-resonant-chime', release: 'decaying' },
    expired: { cue: 'bin_expired_clamp', mode: 'harsh-tone-clamp', release: 'held' },
  };

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
   * opts: { pace, roundSec, seed, persona, personaName, moment }
   * persona: function (api) that schedules actions; see PERSONAS.
   * moment: false runs the same bad day without the moment (the counterfactual).
   * returns { snaps, moves, events, arrivals, summary, momentState, allostasis, bin } */
  function simulate(opts) {
    const pace = opts.pace || 'steady';
    const ROUND = (opts.roundSec || 180) * 1000;
    const withMoment = opts.moment !== false;
    const rnd = mulberry32(opts.seed == null ? 1 : opts.seed);
    const R = (a, b) => a + rnd() * (b - a);
    const pick = (xs) => xs[Math.floor(rnd() * xs.length)];

    const st = {
      t: 0, fragments: [], weights: Object.fromEntries(CHANNEL_WEIGHTS), muted: new Set(),
      cortisol: 0, lastArrival: -1e9, lastMove: -1e9, decay: { a: 1, c: 1, g: 1, m: 1, e: 0 },
      snaps: [], moves: [], arrivals: 0, seen: { ask: 0, want: 0 }, below: { ask: 0, want: 0 },
      momentT: 0, momentTriggered: false, momentAt: null, momentArmed: false, momentTrigger: null,
      allostaticFloor: 0, refractoryUntil: null, nextId: 1,
      // the Empty Bin: one irrevocable act per session; the countdown is in seconds
      binAvailable: true, binCountdown: null, binTarget: null, severedBranches: new Set(),
      events: [], lastLike: {}, lastMute: null,
    };
    const queue = []; // { t, fn, branchId?, cancelled }
    const at = (t, fn, meta) => { const q = { t, fn, ...(meta || {}), cancelled: false }; queue.push(q); return q; };

    /* a branch is an item on its own, or a move with its echo. Items carry 'f' + id;
       moves carry their index, as Lex's spec has it. { id } names an item, { move } a
       move; a bare number names an item by id if one is in the field, else a move by
       index, which is the spec's lookup order. */
    function branchIdFor(detail) {
      if (detail && typeof detail === 'object') {
        if (detail.branchId != null) return detail.branchId;
        if (detail.id != null) { const f = st.fragments.find((x) => x.id === detail.id); return f ? f.branchId : `f${detail.id}`; }
        if (detail.move != null) { const g = st.moves[detail.move]; return g ? g.branchId : null; }
      }
      if (typeof detail === 'number') { const f = st.fragments.find((x) => x.id === detail); if (f) return f.branchId; const g = st.moves[detail]; return g ? g.branchId : null; }
      if (typeof detail === 'string') return detail;
      return null;
    }
    function severBranch(detail) {
      const branchId = branchIdFor(detail);
      if (branchId == null) return null;
      st.severedBranches.add(branchId);
      st.fragments = st.fragments.filter((f) => f.branchId !== branchId);
      for (const q of queue) if (q.branchId === branchId) q.cancelled = true;
      if (typeof branchId === 'number' && st.moves[branchId]) st.moves[branchId].severed = true;
      return branchId;
    }

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
      const id = st.nextId++;
      return { id, branchId: `f${id}`, kind: 'item', source: ch, want, score: want ? R(0.05, 0.62) : R(0.35, 0.98), threshold: R(0.1, 0.55), born: st.t, hidden: false, liked: false };
    }
    function enter(f) {
      if (!f) return;
      if (st.severedBranches.has(f.branchId)) return;
      st.fragments.push(f); while (st.fragments.length > MAX_FRAGMENTS) st.fragments.shift();
      if (f.kind === 'gesture') { st.events.push({ t: st.t, kind: 'echo', move: f.move }); return; }
      st.arrivals += 1;
      st.momentArmed = true; // a real arrival, not the seed and not her echo, opens the vulnerability condition
      st.events.push({ t: st.t, kind: 'arrival', source: f.source, want: f.want, below: f.score < f.threshold, like: st.lastLike[f.source] ?? null, mute: st.lastMute });
      const k = f.want ? 'want' : 'ask'; st.seen[k] += 1; if (f.score < f.threshold) st.below[k] += 1;
      st.cortisol = Math.min(1, st.cortisol + (f.want ? 0.005 : 0.015));
      st.lastArrival = st.t;
      st.decay.a = Math.max(0, st.decay.a - (f.want ? 0.002 : 0.006));
      if (!f.want && f.source === 'social') st.decay.c = Math.max(0, st.decay.c - 0.02);
    }
    function snap(cause) {
      const d = st.decay;
      st.snaps.push({ t: st.t, a: d.a, c: d.c, g: d.g, m: d.m, e: d.e, cortisol: st.cortisol, allostaticFloor: st.allostaticFloor, refractoryUntil: st.refractoryUntil, cause: cause || null });
    }
    function triggerMoment(trigger) {
      if (st.refractoryUntil != null && st.t < st.refractoryUntil) return false;
      const d = st.decay;
      st.momentTriggered = true; st.momentAt = st.t; st.momentTrigger = trigger;
      st.allostaticFloor = Math.min(1, st.allostaticFloor + ALLOSTATIC_FLOOR_STEP);
      d.c = Math.max(0, d.c - 0.40);
      d.a = Math.max(0, d.a - 0.20);
      st.cortisol = Math.max(st.allostaticFloor, st.cortisol, 0.65);
      st.refractoryUntil = st.t + REFRACTORY_WINDOW_MS;
      st.events.push({ t: st.t, kind: 'moment', trigger, audio: MOMENT_AUDIO.impact, impact: { cortisol: st.cortisol, calm: d.c, attention: d.a } });
      st.events.push({ t: st.t, kind: 'refractory_start', until: st.refractoryUntil, audio: MOMENT_AUDIO.refractory });
      snap('something you did not ask for');
      return true;
    }
    function move(kind, detail, said) {
      const g = { at: st.t, kind, detail, said, i: st.moves.length };
      g.branchId = g.i;
      st.moves.push(g);
      st.lastMove = st.t;
      st.events.push({ t: st.t, kind: 'move', move: g.i, said, what: kind, detail });
      if (kind === 'liked') st.lastLike[detail] = g.i;
      if (kind === 'muted') st.lastMute = g.i;
      st.cortisol = Math.min(1, st.cortisol + MOVE_CORTISOL[pace]);
      const d = st.decay;
      d.a = Math.max(0, d.a - ({ scrolled: 0.015, opened: 0.01, refreshed: 0.025 }[kind] || 0.008));
      d.g = Math.max(0, d.g - 0.02);
      if (kind === 'liked' && WANTS.has(detail)) d.g = Math.min(1, d.g + 0.08);
      if (kind === 'hid' || kind === 'muted') { d.c = Math.min(1, d.c + 0.05); st.cortisol = Math.max(st.allostaticFloor, st.cortisol - 0.15); }
      if (kind === 'emptied') { // the one thing that stays gone: relief, and agency back
        st.cortisol = Math.max(st.allostaticFloor, st.cortisol - 0.45);
        d.g = Math.min(1, d.g + 0.35); d.c = Math.min(1, d.c + 0.20);
      }
      // every move comes back, the Empty Bin's included; only what it emptied does not
      at(st.t + REENTRY_DELAY_MS, () => enter({ id: st.nextId++, branchId: g.branchId, kind: 'gesture', source: 'you', want: false, score: R(0.35, 0.98), threshold: R(0.1, 0.55), born: st.t, hidden: false, move: g.i }), { branchId: g.branchId, kind: 'gesture-reentry' });
      snap(`you, ${said}`);
      return true;
    }
    /* the Empty Bin: open it (a move), and within four seconds name one thing to go for good (a move);
       let it close and the clamp comes down (not a move: nobody did it) */
    function emptyBinTrigger(target) {
      if (!st.binAvailable) return false;
      st.binAvailable = false; st.binCountdown = BIN_DECISION_WINDOW_S; st.binTarget = target == null ? null : target;
      st.events.push({ t: st.t, kind: 'bin_countdown_start', detail: st.binTarget, audio: BIN_AUDIO.countdown });
      return move('binned', target == null ? '' : target, 'opening the bin');
    }
    function emptyBinResolve(target) {
      if (st.binCountdown == null) return false;
      const branchId = severBranch(target == null ? st.binTarget : target);
      if (branchId == null) return false; // a bin without a chosen thing is not a resolution; the countdown runs on
      st.binCountdown = null; st.binTarget = null;
      st.events.push({ t: st.t, kind: 'bin_resolved', detail: branchId, audio: BIN_AUDIO.resolved });
      return move('emptied', branchId, 'emptying one for good');
    }
    function emptyBinExpire() {
      st.cortisol = 1.0;
      st.decay.c = Math.max(0, st.decay.c - 0.30);
      st.binCountdown = null; st.binTarget = null;
      st.events.push({ t: st.t, kind: 'bin_expired', audio: BIN_AUDIO.expired });
      snap('the bin closed on its own');
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
      // the Empty Bin: trigger opens the four-second window; resolve names a move (a number) or an item ({ id })
      emptyBinTrigger: (target) => emptyBinTrigger(target),
      emptyBinResolve: (target) => emptyBinResolve(target),
      emptyBinState: () => ({ available: st.binAvailable, countdown: st.binCountdown, target: st.binTarget }),
      // empty the newest visible ask, if there is one
      emptyAnAsk: () => { const c = visible().filter((f) => !f.want); if (!c.length) return false; const f = c[c.length - 1]; return emptyBinResolve({ id: f.id }); },
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
      while (queue.length && queue[0].t <= st.t) { const q = queue.shift(); if (!q.cancelled) q.fn(); queue.sort((x, y) => x.t - y.t); }
      // ageing out, as the page's tick does
      for (const f of [...st.fragments]) if (st.t - f.born > FRAGMENT_LIFE_MS) st.fragments.splice(st.fragments.indexOf(f), 1);
      if (st.t % 100 === 0) {
        // recovery approaches the floor and never crosses it: a session's load is kept
        const surplus = Math.max(0, st.cortisol - st.allostaticFloor);
        st.cortisol = st.allostaticFloor + surplus * Math.exp(-100 / CORTISOL_RECOVERY_TIME_CONSTANT_MS);
      }
      if (pace === 'busy' && withMoment && !st.momentTriggered) {
        st.momentT += 0.05;
        const calmHands = st.t - st.lastMove >= MOMENT_STILL_MS;
        const vulnerable = st.momentArmed && st.momentT >= MOMENT_EARLIEST_S && calmHands && st.decay.c >= MOMENT_CALM_SHARE * (1 - FLOOR[pace]);
        const impatient = st.momentT * 1000 >= MOMENT_FALLBACK_MS;
        if (vulnerable) triggerMoment('vulnerability');
        else if (impatient) triggerMoment('algorithmic_impatience');
      }
      if (st.t - lastTick >= TICK_MS) {
        lastTick = st.t;
        const d = st.decay;
        if (st.t - st.lastArrival > 3000) d.a = Math.min(1, d.a + 0.004);
        const calmTarget = 1 - Math.max(FLOOR[pace] + st.allostaticFloor, st.cortisol);
        d.c += (calmTarget - d.c) * 0.06;
        const n = st.fragments.length, e = st.fragments.filter((f) => f.kind === 'gesture').length;
        d.g = Math.max(0, d.g - 0.004 * (n ? e / n : 0));
        d.m = Math.max(0, 1 - st.t / MINUTES_MS);
        d.e = entropyOf(st.fragments);
        if (st.binCountdown != null) { st.binCountdown = Math.max(0, st.binCountdown - TICK_MS / 1000); if (st.binCountdown === 0) emptyBinExpire(); }
        if (st.t % 1000 === 0) snap(null);
      }
    }
    snap('the end');
    const first = st.snaps[0], last = st.snaps[st.snaps.length - 1];
    const minOf = (k) => Math.min(...st.snaps.map((s) => s[k]));
    return {
      pace, roundSec: ROUND / 1000, seed: opts.seed, persona: opts.personaName || 'kate', moment: withMoment,
      snaps: st.snaps, moves: st.moves, events: st.events, arrivals: st.arrivals, seen: st.seen, below: st.below, momentAt: st.momentAt,
      momentState: { triggered: st.momentTriggered, armed: st.momentArmed, at: st.momentAt, trigger: st.momentTrigger },
      allostasis: { floor: st.allostaticFloor, refractoryUntil: st.refractoryUntil, refractoryActive: st.refractoryUntil != null && st.t < st.refractoryUntil },
      bin: { available: st.binAvailable, countdown: st.binCountdown, target: st.binTarget, severedBranches: [...st.severedBranches] },
      summary: { a: last.a, c: last.c, g: last.g, m: last.m, e: last.e, aMin: minOf('a'), cMin: minOf('c'), gMin: minOf('g'), eMax: Math.max(...st.snaps.map((s) => s.e)), moves: st.moves.length, arrivals: st.arrivals, cortisol: last.cortisol, floor: st.allostaticFloor },
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
      for (let t = 31000; t < ROUND; t += 9000) api.at(t, api.rnd() < 0.5 ? api.scroll : api.open);
    },
    // the same seven, then hands off after forty seconds
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
    // Kate's seven things, then at half a minute she opens the bin and empties the newest ask
    emptier: (api, pace, ROUND) => {
      PERSONAS.kate(api, pace, ROUND);
      api.at(26000, () => api.emptyBinTrigger()); api.at(27500, () => api.emptyAnAsk());
    },
    // Kate's seven things, then she opens the bin and cannot choose
    dawdler: (api, pace, ROUND) => {
      PERSONAS.kate(api, pace, ROUND);
      api.at(26000, () => api.emptyBinTrigger());
    },
  };

  /* ---- samples: many sessions, and the numbers across them ---- */
  function sample(spec) {
    const runs = [];
    const personas = spec.personas || Object.keys(PERSONAS);
    const paces = spec.paces || ['calm', 'steady', 'busy'];
    const seeds = spec.seeds || 20;
    const moments = spec.moments || [true];
    for (const personaName of personas) for (const pace of paces) for (const moment of moments) for (let s = 0; s < seeds; s++) {
      runs.push(simulate({ persona: PERSONAS[personaName], personaName, pace, moment, roundSec: spec.roundSec || 180, seed: (spec.seedBase || 1000) + s }));
    }
    return { spec: { personas, paces, seeds, moments, roundSec: spec.roundSec || 180 }, runs };
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

  return { simulate, sample, stats, band, extremes, quantile, PERSONAS, constants: { PACE, FRAGMENT_LIFE_MS, REENTRY_DELAY_MS, MAX_FRAGMENTS, MINUTES_MS, WANTS, CHANNEL_WEIGHTS, FLOOR, BPM, MOVE_CORTISOL, TICK_MS, MOMENT_EARLIEST_S, MOMENT_FALLBACK_MS, MOMENT_STILL_MS, MOMENT_CALM_SHARE, MOMENT_AUDIO, ALLOSTATIC_FLOOR_STEP, REFRACTORY_WINDOW_MS, CORTISOL_RECOVERY_TIME_CONSTANT_MS, BIN_DECISION_WINDOW_S, BIN_AUDIO } };
});
