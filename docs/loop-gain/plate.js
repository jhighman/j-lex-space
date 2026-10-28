/* Loop Gain · plate.js
 *
 * The vibrating plate from ../what-does-sound-look-like/, ported as a module
 * so the piece can draw it into its own canvas and record it. Same model,
 * same constants: a round plate as Bessel modes with a free edge, a square
 * plate as crossed standing waves, twenty-two thousand grains that take a
 * random step scaled by how much the plate moves under them plus a drift
 * down the slope of the squared displacement, a Lorentzian resonance 22 Hz
 * wide. The pitches are chosen for listening and are not measured from a
 * real plate; that page says so in its last line and so does this one.
 *
 *   const plate = makePlate({ size: 560, shape: 'square' });
 *   plate.setTarget(870);      // Hz; the sand follows at the plate's own ease
 *   plate.frame();             // advance one animation frame
 *   plate.draw(ctx, x, y, w);  // paint into a 2D context
 *   plate.freq, plate.mode, plate.strength, plate.describe()
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.makePlate = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const PI = Math.PI;
  const WIDTH = 22, FMIN = 100, FMAX = 2700, RN = 2048;

  // Bessel functions by the full-period trapezoid rule, as on the page
  const BT = 160, bth = [], bsn = [];
  for (let k = 0; k < BT; k++) { const t = 2 * PI * k / BT; bth.push(t); bsn.push(Math.sin(t)); }
  function J(m, x) { let s = 0; for (let k = 0; k < BT; k++) s += Math.cos(m * bth[k] - x * bsn[k]); return s / BT; }
  const dJ = (m, x) => (m === 0 ? -J(1, x) : 0.5 * (J(m - 1, x) - J(m + 1, x)));
  function zerosOfDJ(m, count) {
    const out = []; let x = 0.3, prev = dJ(m, x);
    while (out.length < count && x < 32) {
      const nx = x + 0.02, cur = dJ(m, nx);
      if (prev === 0 || prev * cur < 0) { let a = x, b = nx; for (let i = 0; i < 40; i++) { const c = (a + b) / 2; (dJ(m, a) * dJ(m, c) <= 0) ? (b = c) : (a = c); } out.push((a + b) / 2); }
      x = nx; prev = cur;
    }
    return out;
  }

  const SQUARE = [
    { n: 1, m: 2, s: -1 }, { n: 1, m: 3, s: 1 }, { n: 2, m: 3, s: -1 }, { n: 1, m: 4, s: -1 },
    { n: 3, m: 4, s: 1 }, { n: 2, m: 5, s: -1 }, { n: 1, m: 6, s: 1 }, { n: 4, m: 5, s: -1 },
    { n: 3, m: 6, s: 1 }, { n: 2, m: 7, s: -1 }, { n: 5, m: 6, s: 1 }, { n: 3, m: 8, s: -1 }, { n: 6, m: 7, s: 1 },
  ].map((md, i) => ({ ...md, i, f: 30 * (md.n * md.n + md.m * md.m) }));

  const ROUND = (() => {
    const cands = [];
    for (let m = 0; m <= 8; m++) zerosOfDJ(m, 4).forEach((k, j) => { const f = Math.round(80 + 5.2 * k * k); if (f >= FMIN && f <= FMAX - 60 && !(m === 0 && j === 0 && k < 1)) cands.push({ m, k, f }); });
    cands.sort((a, b) => a.f - b.f);
    const kept = [];
    for (const c of cands) if (!kept.length || c.f - kept[kept.length - 1].f >= 105) kept.push(c);
    return kept.slice(0, 14).map((c, i) => ({ ...c, i }));
  })();
  function radialTable(md) {
    if (md.tab) return md;
    const tab = new Float32Array(RN), dtab = new Float32Array(RN); let max = 0;
    for (let j = 0; j < RN; j++) { tab[j] = J(md.m, md.k * j / (RN - 1)); max = Math.max(max, Math.abs(tab[j])); }
    for (let j = 0; j < RN; j++) tab[j] /= max;
    for (let j = 0; j < RN; j++) { const a = tab[Math.max(0, j - 1)], b = tab[Math.min(RN - 1, j + 1)]; dtab[j] = (b - a) / ((Math.min(RN - 1, j + 1) - Math.max(0, j - 1)) / (RN - 1)); }
    let rings = 0, last = 0;
    for (let j = 1; j < RN; j++) { const v = tab[j]; if (Math.abs(v) < 1e-4) continue; const sg = Math.sign(v); if (last && sg !== last) rings++; last = sg; }
    Object.assign(md, { tab, dtab, rings }); return md;
  }
  ROUND.forEach(radialTable);

  function makePlate(opts) {
    const SIZE = (opts && opts.size) || 560, N = (opts && opts.grains) || 22000;
    const colours = Object.assign({ plate: [236, 228, 212], ground: [252, 252, 250], rule: [200, 190, 170], sand: [70, 60, 48], brass: [196, 138, 26] }, opts && opts.colours);
    const st = { shape: (opts && opts.shape) || 'square', MODES: null, freq: 0, target: 0, mode: null, strength: 1, showField: false, field: null, fieldKey: '' };
    st.MODES = st.shape === 'round' ? ROUND : SQUARE;
    st.mode = st.MODES[Math.min(4, st.MODES.length - 1)]; st.freq = st.target = st.mode.f;
    const xs = new Float32Array(N), ys = new Float32Array(N), counts = new Uint16Array(SIZE * SIZE);
    const img = typeof ImageData !== 'undefined' ? new ImageData(SIZE, SIZE) : { data: new Uint8ClampedArray(SIZE * SIZE * 4), width: SIZE, height: SIZE };
    const px = img.data;
    const backgrounds = {};
    function background(shape) {
      if (backgrounds[shape]) return backgrounds[shape];
      const bg = new Uint8ClampedArray(SIZE * SIZE * 3);
      for (let yy = 0; yy < SIZE; yy++) for (let xx = 0; xx < SIZE; xx++) {
        const o = (yy * SIZE + xx) * 3; let c = colours.plate;
        if (shape === 'round') { const r = Math.hypot((xx + 0.5) / SIZE - 0.5, (yy + 0.5) / SIZE - 0.5) / 0.5; c = r > 1.003 ? colours.ground : r > 0.993 ? colours.rule : colours.plate; }
        bg[o] = c[0]; bg[o + 1] = c[1]; bg[o + 2] = c[2];
      }
      return (backgrounds[shape] = bg);
    }
    const nearest = (f) => { let best = st.MODES[0]; for (const md of st.MODES) if (Math.abs(md.f - f) < Math.abs(best.f - f)) best = md; return best; };
    const resonance = (f, md) => 1 / (1 + ((f - md.f) / WIDTH) ** 2);
    function scatter() {
      for (let i = 0; i < N; i++) {
        if (st.shape === 'round') { const r = 0.5 * Math.sqrt(Math.random()), t = 2 * PI * Math.random(); xs[i] = 0.5 + r * Math.cos(t); ys[i] = 0.5 + r * Math.sin(t); }
        else { xs[i] = Math.random(); ys[i] = Math.random(); }
      }
    }
    function stepSquare(md, amp) {
      const { n, m, s } = md, nP = n * PI, mP = m * PI, jit = 0.022 * amp, desc = 0.00012 * amp, grain = 0.0016 * amp;
      for (let i = 0; i < N; i++) {
        let x = xs[i], y = ys[i];
        const cnx = Math.cos(nP * x), cmx = Math.cos(mP * x), cny = Math.cos(nP * y), cmy = Math.cos(mP * y);
        const z = cnx * cmy + s * cmx * cny, a = Math.abs(z);
        const gx = -nP * Math.sin(nP * x) * cmy - s * mP * Math.sin(mP * x) * cny;
        const gy = -mP * cnx * Math.sin(mP * y) - s * nP * cmx * Math.sin(nP * y);
        x += (Math.random() - 0.5) * (jit * a + grain) - desc * z * gx; y += (Math.random() - 0.5) * (jit * a + grain) - desc * z * gy;
        if (x < 0) x = -x; else if (x > 1) x = 2 - x; if (y < 0) y = -y; else if (y > 1) y = 2 - y;
        xs[i] = x; ys[i] = y;
      }
    }
    function stepRound(md, amp) {
      const { m, tab, dtab } = md, jit = 0.03 * amp, desc = 0.00009 * amp, grain = 0.0016 * amp;
      for (let i = 0; i < N; i++) {
        let dx = xs[i] - 0.5, dy = ys[i] - 0.5;
        const r = Math.hypot(dx, dy) * 2, th = Math.atan2(dy, dx), j = Math.min(RN - 1, (r * (RN - 1)) | 0);
        const R = tab[j], dR = dtab[j], c = Math.cos(m * th), sn = Math.sin(m * th), z = R * c, a = Math.abs(z);
        const dzdr = dR * c, dzdt = -m * R * sn, rr = Math.max(r, 1e-3), ct = Math.cos(th), stt = Math.sin(th);
        const gx = 2 * (dzdr * ct - (dzdt / rr) * stt), gy = 2 * (dzdr * stt + (dzdt / rr) * ct);
        dx += (Math.random() - 0.5) * (jit * a + grain) - desc * z * gx; dy += (Math.random() - 0.5) * (jit * a + grain) - desc * z * gy;
        const nr = Math.hypot(dx, dy) * 2; if (nr > 1) { const k = (2 - nr) / nr; dx *= k; dy *= k; }
        xs[i] = 0.5 + dx; ys[i] = 0.5 + dy;
      }
    }
    const step = (md, amp) => { if (amp < 0.01) return; st.shape === 'round' ? stepRound(md, amp) : stepSquare(md, amp); };
    function render() {
      counts.fill(0);
      for (let i = 0; i < N; i++) { const xx = (xs[i] * (SIZE - 2)) | 0, yy = (ys[i] * (SIZE - 2)) | 0, o = yy * SIZE + xx; counts[o]++; counts[o + 1]++; counts[o + SIZE]++; counts[o + SIZE + 1]++; }
      const bg = background(st.shape), S = colours.sand;
      for (let p = 0, q = 0, o = 0; p < counts.length; p++, q += 4, o += 3) {
        let r = bg[o], g = bg[o + 1], b = bg[o + 2]; const c = counts[p];
        if (c) { const t = Math.min(1, 0.32 + c * 0.12); r += (S[0] - r) * t; g += (S[1] - g) * t; b += (S[2] - b) * t; }
        px[q] = r; px[q + 1] = g; px[q + 2] = b; px[q + 3] = 255;
      }
    }
    const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
    const api = {
      get freq() { return st.freq; }, get mode() { return st.mode; }, get strength() { return st.strength; }, get shape() { return st.shape; },
      MODES: () => st.MODES, nearest, size: SIZE,
      setShape(next) { if (next === st.shape) return; st.shape = next; st.MODES = next === 'round' ? ROUND : SQUARE; scatter(); st.mode = nearest(st.freq); st.target = st.mode.f; },
      setTarget(f) { st.target = Math.max(FMIN, Math.min(FMAX, f)); },
      snap(f) { st.freq = st.target = Math.max(FMIN, Math.min(FMAX, f)); },
      scatter,
      settle(k) { for (let i = 0; i < (k || 320); i++) step(st.mode, 1); },
      frame(ease) {
        st.freq += (st.target - st.freq) * (ease == null ? 0.06 : ease);
        if (Math.abs(st.target - st.freq) < 0.05) st.freq = st.target;
        st.mode = nearest(st.freq); st.strength = resonance(st.freq, st.mode);
        step(st.mode, st.strength); step(st.mode, st.strength);
      },
      describe() { const md = st.mode; if (st.shape === 'round') return `figure ${md.i + 1} · ${plural(md.m, 'line', 'lines')} · ${plural(md.rings, 'ring', 'rings')}`; return `figure ${md.i + 1} · (${md.n}, ${md.m})`; },
      draw(ctx, x, y, w) { render(); if (!api._tmp) { api._tmp = document.createElement('canvas'); api._tmp.width = SIZE; api._tmp.height = SIZE; } api._tmp.getContext('2d').putImageData(img, 0, 0); ctx.drawImage(api._tmp, x, y, w, w); },
      // for tests without a DOM: the sand's positions and the counts
      _xs: xs, _ys: ys, _render: render, _counts: counts,
    };
    scatter();
    return api;
  }
  makePlate.ROUND = ROUND; makePlate.SQUARE = SQUARE; makePlate.WIDTH = WIDTH;
  return makePlate;
});
