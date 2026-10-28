/* Loop Gain · lenses.js
 *
 * Two of the visualizer's lenses, Bridson and Atlas, ported from
 * ../visualizer-demo/src/lenses/ (bridson.ts, atlas.ts, poisson.ts) into
 * plain JavaScript, with the same algorithm and the same constants where
 * they apply, and driven here by the piece's events instead of a song's
 * beats. Lex named them, with Guard, as the readings that stayed legible
 * to a viewer without the caption (issue #9). Guard lives in Studio B and
 * is not in this repository.
 *
 *   Bridson: Poisson-disc growth in a disc, one round per event; a "key
 *   change" clears a patch and regrows it in the new colour. Here the
 *   events are what the loop carries, and the keys are its regimes.
 *   Atlas:   the same growth laid out on a timeline ring, planted at the
 *   needle, inside a ring of parts. Here the timeline is the piece's and
 *   the parts are its movements.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LoopLenses = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const K = 30;
  /* mulberry32, as in poisson.ts: a number and the next seed */
  function random(seed) { const s = (seed + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s]; }
  function grid(samples, r) {
    const size = r / Math.SQRT2, cells = new Map();
    const key = (x, y) => `${Math.floor(x / size)},${Math.floor(y / size)}`;
    samples.forEach((s, i) => cells.set(key(s.x, s.y), i));
    return {
      clear(x, y) { const cx = Math.floor(x / size), cy = Math.floor(y / size); for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) { const i = cells.get(`${cx + dx},${cy + dy}`); if (i !== undefined && Math.hypot(samples[i].x - x, samples[i].y - y) < r) return false; } return true; },
      add(x, y, i) { cells.set(key(x, y), i); },
    };
  }
  const DISC_REGION = (x, y) => x * x + y * y <= 1;
  /** one round: every active sample tries K candidates in the ring r..2r; a sample that places none retires */
  function round(samples, r, seed, beat, limit, inside) {
    const out = samples.slice(), g = grid(out, r); let s = seed, u;
    const active = out.map((p, i) => (p.active ? i : -1)).filter((i) => i >= 0);
    for (const i of active) {
      const p = out[i]; let placed = false;
      for (let k = 0; k < K && out.length < (limit == null ? Infinity : limit); k++) {
        [u, s] = random(s); const a = u * 2 * Math.PI; [u, s] = random(s);
        const d = Math.sqrt(r * r + u * 3 * r * r), x = p.x + d * Math.cos(a), y = p.y + d * Math.sin(a);
        if (!(inside || DISC_REGION)(x, y) || !g.clear(x, y)) continue;
        out.push({ x, y, pc: p.pc, born: beat, active: true, parent: i }); g.add(x, y, out.length - 1); placed = true;
      }
      if (!placed) out[i] = { ...p, active: false };
    }
    return { samples: out, seed: s };
  }
  function plant(samples, x, y, r, pc, beat) { if (samples.some((s) => Math.hypot(s.x - x, s.y - y) < r)) return samples.slice(); return [...samples, { x, y, pc, born: beat, active: true, parent: -1 }]; }
  function seedAt(samples, x, y, clearing, pc, beat) {
    const kept = samples.map((s, i) => ({ s, i })).filter(({ s }) => Math.hypot(s.x - x, s.y - y) >= clearing);
    const index = new Map(kept.map(({ i }, j) => [i, j]));
    const moved = kept.map(({ s }) => ({ ...s, parent: index.get(s.parent) ?? -1 }));
    return [...moved, { x, y, pc, born: beat, active: true, parent: -1 }];
  }

  /* ---- Bridson, as the exterior ----
     R, MAX, CLEARING, DISC, REST, RENEWAL are bridson.ts's constants. A
     "key" here is a regime, 0 1 2, and its colour is given by the piece. */
  const B = { R: 0.05, MAX: 1400, CLEARING: 0.38, DISC: 0.92, REST: 4, RENEWAL: 0.22 };
  function makeBridson(seed0) {
    const st = { samples: [{ x: 0, y: 0, pc: 0, born: 0, active: true, parent: -1 }], seed: seed0 || 20260, rounds: 0, key: 0, idle: 0 };
    const patch = (pc, r, clearing, angleTurns) => { const a = angleTurns * 2 * Math.PI - Math.PI / 2; st.samples = seedAt(st.samples, r * Math.cos(a), r * Math.sin(a), clearing, pc, st.rounds); };
    return {
      state: st,
      /** a key change: clear a patch where the new key sits and grow it back in the new colour */
      keyChange(pc, angleTurns) { st.key = pc; patch(pc, 0.5, B.CLEARING, angleTurns == null ? pc / 3 : angleTurns); st.idle = 0; },
      /** a beat: one round of growth; at rest for REST beats, a smaller patch clears and regrows */
      beat(angleTurns) {
        st.rounds++;
        st.idle = st.samples.some((p) => p.active) ? 0 : st.idle + 1;
        if (st.idle >= B.REST) { patch(st.key, 0.68, B.RENEWAL, angleTurns == null ? ((st.rounds * 0.381966) % 1) : angleTurns); st.idle = 0; }
        const r = round(st.samples, B.R, st.seed, st.rounds, B.MAX); st.samples = r.samples; st.seed = r.seed;
      },
      full() { return st.samples.length >= B.MAX || !st.samples.some((p) => p.active); },
      /** draw into a 2D context: centre cx, cy, radius rad; colour(pc, active) → css colour; ground(pc) → css colour */
      draw(ctx, cx, cy, rad, colour, ground) {
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 2 * Math.PI); ctx.fillStyle = ground(st.key); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1; ctx.stroke();
        const D = B.DISC * rad;
        // the newest links: which point each grew from
        ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 0.8; ctx.beginPath();
        for (const p of st.samples) { const q = st.samples[p.parent]; if (q && st.rounds - p.born < 6) { ctx.moveTo(cx + q.x * D, cy + q.y * D); ctx.lineTo(cx + p.x * D, cy + p.y * D); } }
        ctx.stroke();
        for (const p of st.samples) {
          const age = st.rounds - p.born; const v = p.active ? 1 : age < 2 ? 0.85 : 0.6;
          ctx.fillStyle = colour(p.pc, p.active, v); ctx.beginPath(); ctx.arc(cx + p.x * D, cy + p.y * D, (p.active ? 3.2 : 2.4) * (rad / 180), 0, 2 * Math.PI); ctx.fill();
        }
        ctx.restore();
      },
      label() { return `${st.samples.length} points · ${st.samples.filter((p) => p.active).length} growing`; },
    };
  }

  /* ---- Atlas, as the piece's own map ----
     R, MAX, INNER, OUTER, RING are atlas.ts's constants. The timeline is
     the piece's; parts are its movements; a key is a movement's colour. */
  const A = { R: 0.035, MAX: 1600, INNER: 0.2, OUTER: 0.74, RING: [0.8, 0.92] };
  const onTimeline = (at, r) => [r * Math.cos(at * 2 * Math.PI - Math.PI / 2), r * Math.sin(at * 2 * Math.PI - Math.PI / 2)];
  const frac = (x) => x - Math.floor(x);
  const timelineOf = (x, y) => frac(Math.atan2(y, x) / (2 * Math.PI) + 0.25);
  function makeAtlas(parts, seed0) {
    // parts: [{ at, until, pc, label }] in seconds; the ring is the whole piece
    const total = parts[parts.length - 1].until;
    const st = { parts, needle: 0, samples: [], seed: seed0 || 20261, rounds: 0, first: parts[0].pc, changes: [] };
    const keyAt = (at) => { let pc = st.first; for (const c of st.changes) if (c.at <= at) pc = c.pc; return pc; };
    const reached = (needle) => (x, y) => { const r = Math.hypot(x, y); return r >= A.INNER && r <= A.OUTER && timelineOf(x, y) <= needle; };
    const sow = (pc) => { const [u, next] = random(st.seed); st.seed = next; const [x, y] = onTimeline(st.needle, A.INNER + (A.OUTER - A.INNER) * u); st.samples = plant(st.samples, x, y, A.R, pc, st.rounds); };
    return {
      state: st,
      /** move the needle to a time in seconds */
      at(sec) { st.needle = Math.max(st.needle, Math.min(1, sec / total)); },
      /** a key change, heard at the needle */
      keyChange(pc) { st.changes = [...st.changes, { at: st.needle, pc }]; sow(pc); },
      /** a beat: plant at the needle and grow, never past it; a new point takes the key heard at its place */
      beat(pc) {
        if (st.samples.length >= A.MAX) return;
        st.rounds++; sow(pc);
        const r = round(st.samples, A.R, st.seed, st.rounds, A.MAX, reached(st.needle)); st.samples = r.samples; st.seed = r.seed;
        st.samples = st.samples.map((p) => (p.born === st.rounds && p.parent >= 0 ? { ...p, pc: keyAt(timelineOf(p.x, p.y)) } : p));
      },
      draw(ctx, cx, cy, rad, colour, ground, labels) {
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 2 * Math.PI); ctx.fillStyle = ground(keyAt(st.needle)); ctx.fill();
        // the ring of parts
        for (const p of st.parts) {
          const x0 = p.at / total, x1 = p.until / total, playing = st.needle * total >= p.at && st.needle * total < p.until;
          ctx.beginPath(); ctx.arc(cx, cy, A.RING[1] * rad, x0 * 2 * Math.PI - Math.PI / 2, x1 * 2 * Math.PI - Math.PI / 2); ctx.arc(cx, cy, A.RING[0] * rad, x1 * 2 * Math.PI - Math.PI / 2, x0 * 2 * Math.PI - Math.PI / 2, true); ctx.closePath();
          ctx.fillStyle = colour(p.pc, playing, playing ? 1 : 0.55); ctx.fill();
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(cx, cy, A.INNER * rad, 0, 2 * Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, (A.OUTER + A.R) * rad, 0, 2 * Math.PI); ctx.stroke();
        // where each key change was heard
        ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1.2;
        for (const c of st.changes) { const [x0, y0] = onTimeline(c.at, A.OUTER + A.R), [x1, y1] = onTimeline(c.at, A.RING[0]); ctx.beginPath(); ctx.moveTo(cx + x0 * rad, cy + y0 * rad); ctx.lineTo(cx + x1 * rad, cy + y1 * rad); ctx.stroke(); }
        // the growth
        for (const p of st.samples) { const age = st.rounds - p.born, v = p.active ? 1 : age < 2 ? 0.85 : 0.65; ctx.fillStyle = colour(p.pc, p.active, v); ctx.beginPath(); ctx.arc(cx + p.x * rad, cy + p.y * rad, (p.active ? 2.6 : 2) * (rad / 120), 0, 2 * Math.PI); ctx.fill(); }
        // the needle
        const [nx0, ny0] = onTimeline(st.needle, A.INNER * 0.6), [nx1, ny1] = onTimeline(st.needle, A.RING[1]);
        ctx.strokeStyle = 'rgba(0,0,0,0.8)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx + nx0 * rad, cy + ny0 * rad); ctx.lineTo(cx + nx1 * rad, cy + ny1 * rad); ctx.stroke();
        if (labels) { ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.font = `${Math.max(9, rad / 9)}px system-ui, sans-serif`; ctx.textAlign = 'center'; for (const p of st.parts) { const mid = (p.at + p.until) / 2 / total, [lx, ly] = onTimeline(mid, (A.RING[0] + A.RING[1]) / 2 * rad * 1.17); ctx.fillText(p.label, cx + lx, cy + ly + 3); } ctx.textAlign = 'left'; }
        ctx.restore();
      },
      label() { return `${st.samples.length} points`; },
    };
  }

  return { random, round, plant, seedAt, makeBridson, makeAtlas, B, A };
});
