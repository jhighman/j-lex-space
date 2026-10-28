/* The Return of the Excluded · lab · model.js
 *
 * The brief of issue #5 as rules, with Lex's extension, run headless and
 * seeded. A field of signals; the viewer excludes or holds; excluded mass
 * goes to an exterior that returns it, louder, above a threshold; each
 * exclusion raises a load that recovers slowly. There is no page yet; the
 * constants are the bench's and are the thing to argue with. Works in
 * Node and the browser, no dependencies.
 *
 * simulate(opts) → one session. opts:
 *   { seed, roundSec, propensity (π), gain (g), frame ('none'|'fatigue'|'reactivity'),
 *     actMass (a: what returns when content is destroyed; null = the brief, content returns),
 *     override: { spawnRate, decayRate, threshold, baseMs, holdMs, reactMs, loadStep, loadRecoveryMs } }
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ExcludedModel = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ---- constants: the bench's, not a page's ---- */
  const BASE_MS = 4000;          // a signal of the system's own arrives about this often (× U[0.6, 1.5))
  const HOLD_MS = 6000;          // a held signal dissolves after this long in the field
  const REACT_MS = 1500;         // the viewer acts on a signal this long after it appears
  const SPAWN_RATE = 0.05;       // σ: returns per second per unit of exterior mass above the threshold
  const DECAY_RATE = 0.01;       // δ: share of the exterior that dissipates per second
  const THRESHOLD = 2;           // θ: exterior mass before anything returns (the brief's "above a threshold")
  const GAIN = 1.5;              // g: a returned signal's mass against the unit that left
  const LOAD_STEP = 0.05;        // Lex: what one exclusion costs the body
  const LOAD_RECOVERY_MS = 60000;// Lex: the load's recovery time constant
  const RETURNS_PER_TICK_CAP = 50; // the field can only show so much at once; above R0 = 1 the exterior would otherwise return millions a tick
  const TICK_MS = 100;

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function simulate(opts) {
    const OV = (opts && opts.override) || {};
    const C = {
      baseMs: OV.baseMs ?? BASE_MS, holdMs: OV.holdMs ?? HOLD_MS, reactMs: OV.reactMs ?? REACT_MS,
      spawnRate: OV.spawnRate ?? SPAWN_RATE, decayRate: OV.decayRate ?? DECAY_RATE, threshold: OV.threshold ?? THRESHOLD,
      loadStep: OV.loadStep ?? LOAD_STEP, loadRecoveryMs: OV.loadRecoveryMs ?? LOAD_RECOVERY_MS,
    };
    const pi = opts.propensity ?? 1;
    const gain = opts.gain ?? GAIN;
    const frame = opts.frame || 'none';
    const actMass = opts.actMass ?? null; // null: the content returns (the brief). A number: content destroyed, the act returns with this mass
    const ROUND = (opts.roundSec || 180) * 1000;
    const rnd = mulberry32(opts.seed == null ? 1 : opts.seed);
    const R = (a, b) => a + rnd() * (b - a);

    const st = {
      t: 0, field: [], exterior: 0, sink: 0, load: 0,
      exclusions: 0, holds: 0, returns: 0, arrivals: 0, baseMass: 0, nextId: 1,
      nextBase: C.baseMs * R(0.6, 1.5), snaps: [], events: [], exteriorPeak: 0,
    };
    const snap = (cause) => st.snaps.push({ t: st.t, exterior: st.exterior, field: st.field.length, fieldMass: st.field.reduce((a, s) => a + s.mass, 0), load: st.load, exclusions: st.exclusions, returns: st.returns, cause: cause || null });

    function appear(mass, origin) {
      st.field.push({ id: st.nextId++, mass, born: st.t, origin, decided: false });
      if (origin === 'base') { st.arrivals += 1; st.baseMass += mass; } else st.returns += 1;
      st.events.push({ t: st.t, kind: origin === 'base' ? 'arrival' : 'return', mass });
    }
    /* the propensity the body allows this tick, under the frame */
    function effectivePi() {
      if (frame === 'fatigue') return pi * Math.max(0, 1 - st.load);
      if (frame === 'reactivity') return Math.min(1, pi * (1 + st.load));
      return pi;
    }
    function exclude(s) {
      st.field = st.field.filter((x) => x !== s);
      st.exclusions += 1;
      if (actMass == null) st.exterior += s.mass;            // the content goes to the exterior (the brief)
      else { st.sink += s.mass; st.exterior += actMass; }     // the content is destroyed; the act returns
      st.load = Math.min(1, st.load + C.loadStep);
      st.events.push({ t: st.t, kind: 'exclude', mass: s.mass, origin: s.origin });
      st.exteriorPeak = Math.max(st.exteriorPeak, st.exterior);
    }
    function hold(s) { s.decided = true; st.holds += 1; st.events.push({ t: st.t, kind: 'hold', mass: s.mass }); }
    function dissolve(s) { st.field = st.field.filter((x) => x !== s); st.sink += s.mass; st.events.push({ t: st.t, kind: 'dissolve', mass: s.mass }); }

    snap('the start');
    while (st.t < ROUND) {
      st.t += TICK_MS;
      const dt = TICK_MS / 1000;
      // the system's own signals
      if (st.t >= st.nextBase) { appear(1, 'base'); st.nextBase = st.t + C.baseMs * R(0.6, 1.5); }
      // the exterior returns, above the threshold, one unit of mass at a time, louder by the gain
      const above = Math.max(0, st.exterior - C.threshold);
      const expected = C.spawnRate * above * dt;
      let k = Math.floor(expected); if (rnd() < expected - k) k += 1;
      k = Math.min(k, RETURNS_PER_TICK_CAP);
      for (let i = 0; i < k && st.exterior >= 1; i++) { st.exterior -= 1; appear(gain, 'return'); }
      // the exterior dissipates
      st.exterior = Math.max(0, st.exterior * (1 - C.decayRate * dt));
      // the body recovers toward zero
      st.load = st.load * Math.exp(-TICK_MS / C.loadRecoveryMs);
      // the viewer acts on what has sat long enough; a held signal dissolves after the hold
      for (const s of [...st.field]) {
        if (!s.decided && st.t - s.born >= C.reactMs) {
          if (rnd() < effectivePi()) exclude(s); else hold(s);
        } else if (s.decided && st.t - s.born >= C.reactMs + C.holdMs) dissolve(s);
      }
      if (st.t % 1000 === 0) snap(null);
    }
    snap('the end');
    const last = st.snaps[st.snaps.length - 1];
    const sigma = C.spawnRate, delta = C.decayRate;
    const r0 = pi * gain * (sigma / (sigma + delta)) * (actMass == null ? 1 : actMass / 1);
    return {
      seed: opts.seed, roundSec: ROUND / 1000, propensity: pi, gain, frame, actMass, r0,
      snaps: st.snaps, events: st.events,
      summary: {
        exterior: last.exterior, field: last.field, fieldMass: last.fieldMass, load: last.load,
        exteriorPeak: Math.max(st.exteriorPeak, last.exterior), exclusions: st.exclusions, holds: st.holds,
        returns: st.returns, arrivals: st.arrivals, sink: st.sink,
        // the share of all mass that ever entered that sits in the exterior at the end
        pollution: last.exterior / Math.max(1e-9, st.baseMass + st.returns * gain),
      },
    };
  }

  function quantile(xs, q) { const a = xs.slice().sort((x, y) => x - y); const i = (a.length - 1) * q; const lo = Math.floor(i), hi = Math.ceil(i); return a[lo] + (a[hi] - a[lo]) * (i - lo); }
  function stats(runs, key) {
    const xs = runs.map((r) => r.summary[key]);
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
    return { n: xs.length, mean, min: Math.min(...xs), max: Math.max(...xs), p10: quantile(xs, 0.1), p50: quantile(xs, 0.5), p90: quantile(xs, 0.9) };
  }

  return { simulate, quantile, stats, constants: { BASE_MS, HOLD_MS, REACT_MS, SPAWN_RATE, DECAY_RATE, THRESHOLD, GAIN, LOAD_STEP, LOAD_RECOVERY_MS, RETURNS_PER_TICK_CAP, TICK_MS } };
});
