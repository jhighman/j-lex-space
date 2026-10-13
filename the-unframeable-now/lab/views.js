/* The Unframeable Now · lab · views.js
 * The lab's drawings as functions that return SVG strings, so the lab page
 * and the paper render the same figures from the same code. Needs d3 on the
 * page (for scales, lines and areas) and the model's helpers for stats.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Views = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const d3 = (typeof window !== 'undefined' && window.d3) || (typeof require === 'function' ? require('d3') : null);
  const WANTS = new Set(['garden', 'art', 'music']);
  const DIMS = [['a', 'attention', '#55e2e1'], ['c', 'calm', '#d4af37'], ['g', 'agency', '#7fd1a8'], ['m', 'the minutes', '#e8e4d6'], ['e', 'disorder', '#ff626b']];
  const PERSONA_COLORS = ['#a788f5', '#55e2e1', '#ff626b', '#d4af37', '#7fd1a8', '#e8e4d6', '#ff9f6b', '#9bd1ff'];
  const pcol = (names) => { const m = {}; names.forEach((n, i) => (m[n] = PERSONA_COLORS[i % PERSONA_COLORS.length])); return (n) => m[n] || '#aaa'; };
  const mmss = (ms) => { const t = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
  const quantile = (xs, q) => { const a = xs.slice().sort((x, y) => x - y); const i = (a.length - 1) * q; const lo = Math.floor(i), hi = Math.ceil(i); return a[lo] + (a[hi] - a[lo]) * (i - lo); };
  const groups = (S) => { const g = new Map(); for (const r of S.runs) { const k = `${r.persona} · ${r.pace}`; if (!g.has(k)) g.set(k, []); g.get(k).push(r); } return g; };
  const wholeOf = (s) => (s.a + s.c + s.g + s.m) / 4;
  const medianRun = (runs) => { const med = quantile(runs.map((r) => wholeOf(r.summary)), 0.5); return runs.slice().sort((x, y) => Math.abs(wholeOf(x.summary) - med) - Math.abs(wholeOf(y.summary) - med))[0]; };
  const snapAt = (r, t) => { let v = r.snaps[0]; for (const s of r.snaps) { if (s.t <= t) v = s; else break; } return v; };
  const stats = (runs, key) => { const xs = runs.map((r) => r.summary[key]); const mean = xs.reduce((a, b) => a + b, 0) / xs.length; const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, xs.length - 1)); return { n: xs.length, mean, sd, min: Math.min(...xs), max: Math.max(...xs), p10: quantile(xs, 0.1), p50: quantile(xs, 0.5), p90: quantile(xs, 0.9) }; };
  const band = (runs, key, stepMs) => { const dur = Math.max(...runs.map((r) => r.snaps[r.snaps.length - 1].t)); const out = []; for (let t = 0; t <= dur; t += stepMs || 1000) { const vals = runs.map((r) => snapAt(r, t)[key]); out.push({ t, p10: quantile(vals, 0.1), p50: quantile(vals, 0.5), p90: quantile(vals, 0.9) }); } return out; };

  /* the report's disc */
  function disc(sn, size, label, opts = {}) {
    const cx = size / 2, cy = size / 2 + 4, R = size * 0.34;
    const ang = (i) => -Math.PI / 2 + i * Math.PI / 2;
    const keys = ['a', 'c', 'g', 'm'];
    const pts = []; const N = 72;
    for (let j = 0; j < N; j++) { const th = -Math.PI / 2 + (j / N) * Math.PI * 2; const seg = (j / N) * 4, i0 = Math.floor(seg) % 4, i1 = (i0 + 1) % 4, u = seg - Math.floor(seg); const v = sn[keys[i0]] * (1 - u) + sn[keys[i1]] * u; const tear = (1 - v) * 0.18 * Math.sin(j * 1.7) * Math.cos(j * 0.9 + sn.e * 5); const r = R * Math.max(0.04, v + tear); pts.push([cx + r * Math.cos(th), cy + r * Math.sin(th)]); }
    const path = d3.line().curve(d3.curveCatmullRomClosed.alpha(0.5))(pts);
    const ink = opts.print ? '#333' : 'rgba(255,255,255,0.14)';
    const labels = opts.axes ? keys.map((k, i) => { const lx = cx + (R + 16) * Math.cos(ang(i)), ly = cy + (R + 16) * Math.sin(ang(i)); return `<text x="${lx}" y="${ly + 3}" text-anchor="middle" font-size="7.5" fill="${opts.print ? '#555' : 'rgba(219,225,229,0.7)'}">${DIMS[i][1]} ${Math.round(sn[k] * 100)}</text>`; }).join('') : '';
    return `<svg viewBox="0 0 ${size} ${size + 8}" width="${size}" height="${size + 8}"><circle cx="${cx}" cy="${cy}" r="${R}" fill="${opts.print ? '#f3e8ea' : 'rgba(255,98,107,0.12)'}" stroke="${ink}"/><circle cx="${cx}" cy="${cy}" r="${R * 0.5}" fill="none" stroke="${opts.print ? '#e4e4e4' : 'rgba(255,255,255,0.06)'}"/>${keys.map((k, i) => `<line x1="${cx}" y1="${cy}" x2="${cx + R * Math.cos(ang(i))}" y2="${cy + R * Math.sin(ang(i))}" stroke="${opts.print ? '#ddd' : 'rgba(255,255,255,0.12)'}"/>`).join('')}<path d="${path}" fill="${opts.print ? 'rgba(120,90,220,0.35)' : 'rgba(167,136,245,0.35)'}" stroke="${opts.print ? '#5b3fc4' : '#a788f5'}" stroke-width="1.2"/>${labels}${label ? `<text x="${cx}" y="${size + 4}" text-anchor="middle" font-size="9" fill="${opts.print ? '#444' : 'rgba(219,225,229,0.6)'}">${label}</text>` : ''}</svg>`;
  }

  /* the superformula morph */
  function blob(sn, size, opts = {}) {
    const cx = size / 2, cy = size / 2, R = size * 0.36;
    const whole = wholeOf(sn);
    const m = 4, n1 = 0.3 + 2.2 * sn.c, n2 = 0.4 + 6 * (1 - sn.a), n3 = 0.4 + 6 * (1 - sn.g);
    const N = 160, rs = []; let maxr = 0;
    for (let i = 0; i < N; i++) { const th = (i / N) * Math.PI * 2; const r = Math.pow(Math.pow(Math.abs(Math.cos(m * th / 4)), n2) + Math.pow(Math.abs(Math.sin(m * th / 4)), n3), -1 / n1); rs.push(r); if (r > maxr) maxr = r; }
    const pts = [];
    for (let i = 0; i < N; i++) { const th = (i / N) * Math.PI * 2; const jit = 1 + (Math.sin(i * 2.3) * Math.cos(i * 0.7)) * 0.25 * sn.e; const r = R * (0.15 + 0.85 * whole) * (rs[i] / maxr) * jit; pts.push([cx + r * Math.cos(th), cy + r * Math.sin(th)]); }
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${opts.print ? '#ddd' : 'rgba(255,255,255,0.1)'}"/><path d="${d3.line().curve(d3.curveCatmullRomClosed)(pts)}" fill="${opts.print ? 'rgba(120,90,220,0.35)' : 'rgba(167,136,245,0.35)'}" stroke="${opts.print ? '#5b3fc4' : '#a788f5'}" stroke-width="1.2"/></svg>`;
  }

  /* the brain, by concept: left the session, right a baseline */
  function brain(sn, bs, size, seed, opts = {}) {
    const W = size, H = size * 1.18, cx = W / 2, cy = H / 2, rx = W * 0.42, ry = H * 0.44;
    const REG = [
      ['g', '#a788f5', (sgn) => `M${cx},${cy - ry} C${cx + sgn * rx * 0.95},${cy - ry} ${cx + sgn * rx},${cy - ry * 0.55} ${cx + sgn * rx * 0.98},${cy - ry * 0.2} L${cx},${cy - ry * 0.2} Z`],
      ['a', '#55e2e1', (sgn) => `M${cx},${cy - ry * 0.2} L${cx + sgn * rx * 0.98},${cy - ry * 0.2} C${cx + sgn * rx},${cy + ry * 0.05} ${cx + sgn * rx * 0.9},${cy + ry * 0.3} ${cx + sgn * rx * 0.7},${cy + ry * 0.42} L${cx},${cy + ry * 0.42} Z`],
      ['c', '#d4af37', (sgn) => `M${cx + sgn * rx * 0.98},${cy - ry * 0.2} L${cx + sgn * rx * 0.7},${cy + ry * 0.42} L${cx + sgn * rx * 0.72},${cy + ry * 0.62} C${cx + sgn * rx * 0.95},${cy + ry * 0.45} ${cx + sgn * rx * 1.0},${cy + ry * 0.1} ${cx + sgn * rx * 0.98},${cy - ry * 0.2} Z`],
      ['m', '#7fd1a8', (sgn) => `M${cx},${cy + ry * 0.42} L${cx + sgn * rx * 0.7},${cy + ry * 0.42} L${cx + sgn * rx * 0.72},${cy + ry * 0.62} C${cx + sgn * rx * 0.55},${cy + ry * 0.9} ${cx + sgn * rx * 0.3},${cy + ry} ${cx},${cy + ry} Z`],
    ];
    const PRINT = { '#a788f5': '#6b4fd0', '#55e2e1': '#1f9aa0', '#d4af37': '#b8901f', '#7fd1a8': '#3f9a6b' };
    let rnd = (seed || 1) * 7 + 13; const R = () => { rnd = (rnd * 9301 + 49297) % 233280; return rnd / 233280; };
    const bg = opts.print ? '#ffffff' : '#15171f', dark = opts.print ? '#ffffff' : '#0a0b10', edge = opts.print ? '#444' : 'rgba(255,255,255,0.18)';
    let out = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${bg}" stroke="${edge}"/>`;
    for (const sgn of [-1, 1]) {
      const S_ = sgn < 0 ? sn : bs;
      for (const [k, col0, path] of REG) {
        const col = opts.print ? PRINT[col0] : col0, v = S_[k];
        out += `<path d="${path(sgn)}" fill="${col}" fill-opacity="${0.08 + 0.72 * v}" stroke="${opts.print ? '#fff' : 'rgba(10,11,16,0.9)'}" stroke-width="1"/>`;
        for (let i = 0; i < 3; i++) { const y0 = cy - ry * 0.9 + (i + 0.5) * ry * 0.6 + (k === 'm' ? ry * 0.55 : k === 'a' ? ry * 0.05 : k === 'c' ? ry * 0.2 : -ry * 0.25); out += `<path d="M${cx + sgn * rx * 0.15},${y0} q${sgn * rx * 0.2},${-ry * 0.08} ${sgn * rx * 0.4},${ry * 0.02} q${sgn * rx * 0.15},${ry * 0.06} ${sgn * rx * 0.3},${-ry * 0.03}" fill="none" stroke="${opts.print ? 'rgba(255,255,255,0.7)' : 'rgba(10,11,16,0.55)'}" stroke-width="1.2" opacity="${0.2 + 0.7 * v}"/>`; }
        const dots = Math.round((1 - v) * 26 + S_.e * 18);
        for (let i = 0; i < dots; i++) { const a = R() * Math.PI * 2, rr = Math.sqrt(R()); const px = cx + sgn * Math.abs(Math.cos(a)) * rx * 0.9 * rr, py = cy + Math.sin(a) * ry * 0.9 * rr; out += `<circle cx="${px}" cy="${py}" r="${1 + R() * 1.6}" fill="${R() < S_.e ? (opts.print ? '#999' : '#777') : dark}" opacity="0.8"/>`; }
      }
    }
    out += `<path d="M${cx},${cy - ry} C${cx + 1},${cy - ry * 0.4} ${cx - 1},${cy + ry * 0.4} ${cx},${cy + ry}" fill="none" stroke="${dark}" stroke-width="${2 + 6 * sn.e}" stroke-linecap="round"/>`;
    out += `<text x="${cx}" y="${H - 2}" text-anchor="middle" font-size="9" fill="${opts.print ? '#666' : 'rgba(219,225,229,0.55)'}">front ↑</text></svg>`;
    return out;
  }

  /* petals: every session as a glyph, sorted by a key */
  function petals(runs, opts = {}) {
    const personas = [...new Set(runs.map((r) => r.persona))], col = pcol(personas);
    const sorted = runs.slice().sort((x, y) => x.summary[opts.sortBy || 'a'] - y.summary[opts.sortBy || 'a']);
    const cols = opts.cols || Math.ceil(Math.sqrt(sorted.length * 1.6)), size = opts.size || 56;
    const W = cols * size + 10, rows = Math.ceil(sorted.length / cols), H = rows * size + 10;
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%">`;
    sorted.forEach((r, i) => {
      const cx = 5 + (i % cols) * size + size / 2, cy = 5 + Math.floor(i / cols) * size + size / 2, R = size * 0.42, s = r.summary;
      const petal = ['a', 'c', 'g', 'm'].map((k, j) => { const a0 = -Math.PI / 2 + j * Math.PI / 2, w = Math.PI / 5, rr = R * s[k]; return `M${cx},${cy} Q${cx + rr * 1.1 * Math.cos(a0 - w)},${cy + rr * 1.1 * Math.sin(a0 - w)} ${cx + rr * Math.cos(a0)},${cy + rr * Math.sin(a0)} Q${cx + rr * 1.1 * Math.cos(a0 + w)},${cy + rr * 1.1 * Math.sin(a0 + w)} ${cx},${cy} Z`; }).join('');
      svg += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${opts.print ? '#eee' : 'rgba(255,255,255,0.05)'}"/><path d="${petal}" fill="${col(r.persona)}" opacity="${0.35 + 0.5 * (1 - s.e)}" stroke="${col(r.persona)}" stroke-width="0.6"><title>${r.persona} · ${r.pace} · seed ${r.seed}</title></path>`;
    });
    return { svg: svg + '</svg>', personas, col };
  }

  /* bands: one dimension over time, per persona, median with p10–p90 */
  function bands(S, key, pace, opts = {}) {
    const personas = [...new Set(S.runs.map((r) => r.persona))], col = opts.col || pcol(personas);
    const W = opts.W || 300, H = opts.H || 150, L = 30, R = 8, T = 20, B = 18;
    const dur = Math.max(...S.runs.map((r) => r.snaps[r.snaps.length - 1].t));
    const x = d3.scaleLinear().domain([0, dur]).range([L, W - R]), y = d3.scaleLinear().domain([0, 1]).range([H - B, T]);
    const name = DIMS.find((d) => d[0] === key)[1], c0 = DIMS.find((d) => d[0] === key)[2];
    const ink = opts.print ? '#333' : c0, grid = opts.print ? '#e6e6e6' : 'rgba(255,255,255,0.08)', tick = opts.print ? '#666' : 'rgba(219,225,229,0.5)';
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%"><text x="${L}" y="12" font-size="10" fill="${ink}" font-weight="600">${name} · ${pace}</text>`;
    for (const v of [0, 0.5, 1]) svg += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${grid}"/><text x="${L - 3}" y="${y(v) + 3}" font-size="8" text-anchor="end" fill="${tick}">${v * 100}</text>`;
    for (const p of personas) {
      const runs = S.runs.filter((r) => r.persona === p && r.pace === pace); if (!runs.length) continue;
      const b = band(runs, key, Math.max(1000, dur / 120));
      const area = d3.area().x((d) => x(d.t)).y0((d) => y(d.p10)).y1((d) => y(d.p90)).curve(d3.curveMonotoneX)(b);
      const line = d3.line().x((d) => x(d.t)).y((d) => y(d.p50)).curve(d3.curveMonotoneX)(b);
      svg += `<path d="${area}" fill="${col(p)}" opacity="0.14"/><path d="${line}" fill="none" stroke="${col(p)}" stroke-width="1.5"/>`;
    }
    svg += `<text x="${W - R}" y="${H - 4}" font-size="8" text-anchor="end" fill="${tick}">${mmss(dur)}</text></svg>`;
    return { svg, personas, col };
  }

  /* strips: the end state of every session, per group */
  function strips(S, key, opts = {}) {
    const G = groups(S), keys = [...G.keys()];
    const W = opts.W || 980, rowH = 22, L = 170, R = 20, T = 24, H = T + keys.length * rowH + 10;
    const x = d3.scaleLinear().domain([0, 1]).range([L, W - R]);
    const name = DIMS.find((d) => d[0] === key)[1], c0 = DIMS.find((d) => d[0] === key)[2];
    const col = opts.print ? { a: '#1f9aa0', c: '#b8901f', g: '#3f9a6b', m: '#777', e: '#c0392b' }[key] : c0;
    const ink = opts.print ? '#333' : 'rgba(237,242,244,0.8)', grid = opts.print ? '#e6e6e6' : 'rgba(255,255,255,0.07)', tick = opts.print ? '#666' : 'rgba(219,225,229,0.5)', mark = opts.print ? '#000' : '#fff';
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%"><text x="${L}" y="12" font-size="11" fill="${col}" font-weight="600">${name} at the end</text>`;
    for (const v of [0, 0.25, 0.5, 0.75, 1]) svg += `<line x1="${x(v)}" x2="${x(v)}" y1="${T - 4}" y2="${H - 8}" stroke="${grid}"/><text x="${x(v)}" y="${H - 1}" font-size="8" text-anchor="middle" fill="${tick}">${Math.round(v * 100)}</text>`;
    keys.forEach((g, i) => {
      const runs = G.get(g), y0 = T + i * rowH + rowH / 2, st = stats(runs, key);
      svg += `<text x="${L - 8}" y="${y0 + 3}" font-size="10" text-anchor="end" fill="${ink}">${g}</text><line x1="${x(st.p10)}" x2="${x(st.p90)}" y1="${y0}" y2="${y0}" stroke="${col}" stroke-width="3" opacity="0.25"/>`;
      for (const r of runs) svg += `<circle cx="${x(r.summary[key])}" cy="${y0 + (r.seed % 5 - 2) * 1.6}" r="2.2" fill="${col}" opacity="0.6"/>`;
      svg += `<line x1="${x(st.p50)}" x2="${x(st.p50)}" y1="${y0 - 7}" y2="${y0 + 7}" stroke="${mark}" stroke-width="1.5"/><circle cx="${x(st.min)}" cy="${y0}" r="3.5" fill="none" stroke="${mark}" opacity="0.8"/><circle cx="${x(st.max)}" cy="${y0}" r="3.5" fill="none" stroke="${mark}" opacity="0.8"/>`;
    });
    return svg + '</svg>';
  }

  /* lineage: a tangled tree of one session's causes. Layout after nitaku's
     Tangled Tree Visualization II, re-derived; the compression step is left out. */
  function tangleLayout(levels, c0) {
    levels.forEach((l, i) => l.forEach((n) => (n.level = i)));
    const nodes = levels.flat(), idx = {}; nodes.forEach((d) => (idx[d.id] = d));
    nodes.forEach((d) => { d.parents = (d.parents || []).map((p) => idx[p]).filter(Boolean); });
    levels.forEach((l, i) => {
      const index = {};
      l.forEach((n) => { if (!n.parents.length) return; const id = n.parents.map((d) => d.id).sort().join('-X-'); if (id in index) index[id].parents = index[id].parents.concat(n.parents); else index[id] = { id, parents: n.parents.slice(), level: i, span: i - d3.min(n.parents, (p) => p.level) }; n.bundle = index[id]; });
      l.bundles = Object.values(index); l.bundles.forEach((b, j) => (b.i = j));
    });
    const links = []; nodes.forEach((d) => d.parents.forEach((p) => links.push({ source: d, bundle: d.bundle, target: p })));
    const bundles = levels.flatMap((l) => l.bundles);
    bundles.forEach((b) => b.parents.forEach((p) => { p.bundles_index = p.bundles_index || {}; (p.bundles_index[b.id] = p.bundles_index[b.id] || []).push(b); }));
    nodes.forEach((n) => { n.bundles_index = n.bundles_index || {}; n.bundles = Object.values(n.bundles_index); n.bundles.sort((a, b) => d3.descending(d3.max(a, (d) => d.span), d3.max(b, (d) => d.span))); n.bundles.forEach((b, j) => (b.i = j)); });
    links.forEach((l) => { (l.bundle.links = l.bundle.links || []).push(l); });
    const padding = 8, node_height = 20, node_width = 86, bundle_width = 12, level_y_padding = 14, metro_d = 4, c = c0 || 14, bigc = node_width + c;
    nodes.forEach((n) => (n.height = (Math.max(1, n.bundles.length) - 1) * metro_d));
    let x_offset = padding, y_offset = padding;
    levels.forEach((l) => { x_offset += l.bundles.length * bundle_width; y_offset += level_y_padding; l.forEach((n) => { n.x = n.level * node_width + x_offset; n.y = node_height + y_offset + n.height / 2; y_offset += node_height + n.height; }); });
    let i = 0;
    levels.forEach((l) => { l.bundles.forEach((b) => { b.x = d3.max(b.parents, (d) => d.x) + node_width + (l.bundles.length - 1 - b.i) * bundle_width; b.y = i * node_height; }); i += l.length; });
    links.forEach((l) => { l.xt = l.target.x; l.yt = l.target.y + l.target.bundles_index[l.bundle.id][0].i * metro_d - (l.target.bundles.length * metro_d) / 2 + metro_d / 2; l.xb = l.bundle.x; l.yb = l.bundle.y; l.xs = l.source.x; l.ys = l.source.y; l.c1 = l.source.level - l.target.level > 1 ? Math.min(bigc, l.xb - l.xt, l.yb - l.yt) - c : c; l.c2 = c; });
    return { nodes, links, bundles, width: d3.max(nodes, (n) => n.x) + node_width + 2 * padding + 160, height: d3.max(nodes, (n) => n.y) + node_height / 2 + 2 * padding };
  }
  function lineage(run, win, opts = {}) {
    const dur = run.snaps[run.snaps.length - 1].t, K = Math.ceil(dur / win);
    const levels = Array.from({ length: 3 * K + 1 }, () => []);
    const win_ = (t) => Math.min(K, Math.floor(t / win) + 1);
    const EV = (k) => 3 * k - 2, CAUSED = (k) => 3 * k - 1, ST = (k) => 3 * k;
    const P = (v) => Math.round(v * 100);
    const KIND = opts.print ? { state: '#222', move: '#6b4fd0', echo: '#6b4fd0', like: '#3f9a6b', mute: '#c0392b', moment: '#000', ask: '#b8901f', want: '#3f9a6b' } : { state: '#e8e4d6', move: '#a788f5', echo: '#a788f5', like: '#7fd1a8', mute: '#ff626b', moment: '#ffffff', ask: '#d4af37', want: '#7fd1a8' };
    levels[0].push({ id: 's0', label: 'the start · whole', kind: 'state' });
    if (run.pace === 'busy') levels[0].push({ id: 'bad', label: 'a bad day', kind: 'moment' });
    const moveId = (i) => `m${i}`, moveWin = {};
    for (const e of run.events || []) {
      const k = win_(e.t);
      if (e.kind === 'move') { moveWin[e.move] = k; levels[EV(k)].push({ id: moveId(e.move), label: `you, ${e.said}`, kind: e.what === 'liked' ? 'like' : e.what === 'muted' ? 'mute' : 'move', parents: [`s${k - 1}`] }); }
      else if (e.kind === 'moment') levels[EV(k)].push({ id: 'q', label: 'something you did not ask for', kind: 'moment', parents: ['bad'] });
    }
    const echoes = {};
    for (const e of run.events || []) if (e.kind === 'echo') { const k = win_(e.t); (echoes[k] = echoes[k] || []).push(moveId(e.move)); }
    for (const [k, ms] of Object.entries(echoes)) levels[CAUSED(+k)].push({ id: `e${k}`, label: `${ms.length} × back as an item`, kind: 'echo', parents: [...new Set(ms)] });
    const agg = {};
    for (const e of run.events || []) {
      if (e.kind !== 'arrival') continue;
      const k = win_(e.t), parents = [];
      if (e.like !== null && e.like !== undefined) parents.push(moveId(e.like));
      if (e.mute !== null && e.mute !== undefined) parents.push(moveId(e.mute));
      const caused = parents.length > 0, key = caused ? `${k}|${e.source}|${parents.join(',')}` : `${k}|${e.want ? 'want' : 'ask'}`;
      if (!agg[key]) agg[key] = { k, caused, source: caused ? e.source : (e.want ? "what you'd rather" : 'things asking'), parents: caused ? parents : [`s${k - 1}`], n: 0, below: 0, want: e.want };
      agg[key].n += 1; if (e.below) agg[key].below += 1;
    }
    Object.entries(agg).forEach(([key, a], j) => { const sameWin = a.caused && a.parents.some((pid) => moveWin[+pid.slice(1)] === a.k); levels[sameWin ? CAUSED(a.k) : EV(a.k)].push({ id: `r${j}`, label: `${a.n} × ${a.source}${a.below ? ` · ${a.below} under the cut-off` : ''}`, kind: a.want ? 'want' : 'ask', parents: a.parents }); });
    for (let k = 1; k <= K; k++) { const t = Math.min(dur, k * win); const sn = snapAt(run, t); levels[ST(k)].push({ id: `s${k}`, label: `${mmss(t)} · a ${P(sn.a)} c ${P(sn.c)} g ${P(sn.g)} · e ${sn.e.toFixed(2)}`, kind: 'state', parents: [`s${k - 1}`, ...levels[EV(k)].map((n) => n.id), ...levels[CAUSED(k)].map((n) => n.id)] }); }
    const ids = new Set(levels.flat().map((n) => n.id));
    levels.forEach((l) => l.forEach((n) => { if (n.parents) n.parents = n.parents.filter((pid) => ids.has(pid)); }));
    const T = tangleLayout(levels);
    const bundleColor = (b) => KIND[(b.parents[0] && b.parents[0].kind) || 'state'];
    const halo = opts.print ? '#fff' : '#12141c';
    let svg = `<svg viewBox="0 0 ${T.width} ${T.height}" width="100%" style="max-width:${Math.min(T.width, 1400)}px;height:auto;display:block">`;
    for (const b of T.bundles) { const d = b.links.map((l) => `M${l.xt} ${l.yt} L${l.xb - l.c1} ${l.yt} A${l.c1} ${l.c1} 90 0 1 ${l.xb} ${l.yt + l.c1} L${l.xb} ${l.ys - l.c2} A${l.c2} ${l.c2} 90 0 0 ${l.xb + l.c2} ${l.ys} L${l.xs} ${l.ys}`).join(' '); svg += `<path d="${d}" fill="none" stroke="${halo}" stroke-width="5"/><path d="${d}" fill="none" stroke="${bundleColor(b)}" stroke-width="2" opacity="0.85"/>`; }
    for (const n of T.nodes) { const col = KIND[n.kind] || KIND.state; svg += `<line x1="${n.x}" y1="${n.y - n.height / 2 - 4}" x2="${n.x}" y2="${n.y + n.height / 2 + 4}" stroke="${halo}" stroke-width="8" stroke-linecap="round"/><line x1="${n.x}" y1="${n.y - n.height / 2 - 4}" x2="${n.x}" y2="${n.y + n.height / 2 + 4}" stroke="${col}" stroke-width="3" stroke-linecap="round"/><text x="${n.x + 6}" y="${n.y - n.height / 2 - 6}" font-size="10" fill="${n.kind === 'state' ? (opts.print ? '#000' : '#fff') : col}" font-weight="${n.kind === 'state' ? 600 : 400}" stroke="${halo}" stroke-width="3" paint-order="stroke">${n.label}</text>`; }
    return { svg: svg + '</svg>', nodes: T.nodes.length, links: T.links.length, width: T.width, height: T.height };
  }

  /* the moment: a dimension around the bad day's moment, with it and without it, aligned at t = 8 s */
  function momentPlot(S, key, opts = {}) {
    const AT = 8000, FROM = -6000, TO = opts.to || 90000, step = 1000;
    const W = opts.W || 640, H = opts.H || 220, L = 34, R = 10, T = 22, B = 20;
    const name = DIMS.find((d) => d[0] === key)[1];
    const sel = (m) => S.runs.filter((r) => r.pace === 'busy' && r.moment === m && (!opts.persona || r.persona === opts.persona));
    const withM = sel(true), without = sel(false);
    if (!withM.length || !without.length) return { svg: '', n: 0 };
    const series = (runs) => { const out = []; for (let dt = FROM; dt <= TO; dt += step) { const vals = runs.map((r) => snapAt(r, AT + dt)[key]); out.push({ t: dt, p10: quantile(vals, 0.1), p50: quantile(vals, 0.5), p90: quantile(vals, 0.9) }); } return out; };
    const a = series(withM), b = series(without);
    const x = d3.scaleLinear().domain([FROM, TO]).range([L, W - R]), y = d3.scaleLinear().domain([0, 1]).range([H - B, T]);
    const grid = opts.print ? '#e6e6e6' : 'rgba(255,255,255,0.08)', tick = opts.print ? '#666' : 'rgba(219,225,229,0.5)', ink = opts.print ? '#333' : '#e8e4d6';
    const cw = opts.print ? '#c0392b' : '#ff626b', co = opts.print ? '#1f9aa0' : '#55e2e1';
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%"><text x="${L}" y="12" font-size="10" fill="${ink}" font-weight="600">${name} around the moment · bad day${opts.persona ? ' · ' + opts.persona : ''}</text>`;
    for (const v of [0, 0.5, 1]) svg += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${grid}"/><text x="${L - 3}" y="${y(v) + 3}" font-size="8" text-anchor="end" fill="${tick}">${v * 100}</text>`;
    for (const dt of [0, 30000, 60000, 90000]) if (dt <= TO) svg += `<text x="${x(dt)}" y="${H - 6}" font-size="8" text-anchor="middle" fill="${tick}">${dt === 0 ? 'the moment' : '+' + dt / 1000 + ' s'}</text>`;
    svg += `<line x1="${x(0)}" x2="${x(0)}" y1="${T}" y2="${H - B}" stroke="${cw}" stroke-dasharray="3 3" opacity="0.7"/>`;
    const area = (d) => d3.area().x((p) => x(p.t)).y0((p) => y(p.p10)).y1((p) => y(p.p90)).curve(d3.curveMonotoneX)(d);
    const line = (d) => d3.line().x((p) => x(p.t)).y((p) => y(p.p50)).curve(d3.curveMonotoneX)(d);
    svg += `<path d="${area(b)}" fill="${co}" opacity="0.14"/><path d="${line(b)}" fill="none" stroke="${co}" stroke-width="1.6"/>`;
    svg += `<path d="${area(a)}" fill="${cw}" opacity="0.14"/><path d="${line(a)}" fill="none" stroke="${cw}" stroke-width="1.6"/>`;
    svg += `<rect x="${W - R - 150}" y="${T - 6}" width="8" height="3" fill="${cw}"/><text x="${W - R - 138}" y="${T - 2}" font-size="8" fill="${tick}">with the moment</text><rect x="${W - R - 60}" y="${T - 6}" width="8" height="3" fill="${co}"/><text x="${W - R - 48}" y="${T - 2}" font-size="8" fill="${tick}">without</text>`;
    return { svg: svg + '</svg>', n: withM.length + without.length, withM: a, without: b };
  }

  return { DIMS, pcol, mmss, quantile, groups, medianRun, snapAt, stats, band, wholeOf, disc, blob, brain, petals, bands, strips, lineage, tangleLayout, momentPlot, WANTS };
});
