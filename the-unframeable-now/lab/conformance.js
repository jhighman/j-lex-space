#!/usr/bin/env node
/* The Unframeable Now · lab · conformance.js
 * Does the lab's model agree with the piece? Run the same scripted session
 * on the page (headless, real clock) N times and in the lab 20 times, and
 * compare the end state per dimension. The page is the reference; a gap is
 * a bug in model.js. Needs playwright (NODE_PATH to a node_modules that has
 * it) and the repository root served at --url.
 *
 *   NODE_PATH=/path/to/node_modules node conformance.js [--url http://localhost:8743] [--pace busy] [--round 40] [--n 5]
 */
const M = require('./model.js');
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1]] : []).filter((x) => x.length));
const URL = args.url || 'http://localhost:8743';
const pace = args.pace || 'busy', round = Number(args.round || 40), N = Number(args.n || 5);

// the same script, in page time and in lab time: Kate's seven things, then nothing
const SCRIPT = [[2600, 'scroll'], [5100, 'open'], [9100, 'like'], [13000, 'hide'], [16300, 'mute'], [19600, 'search'], [22700, 'refresh']];
const persona = (api) => { api.at(0, api.paced); for (const [t, k] of SCRIPT) api.at(t, { scroll: api.scroll, open: api.open, like: () => api.like(true) || api.like(), hide: () => api.hide(true), mute: () => api.mute(), search: () => api.search('garden'), refresh: api.refresh }[k]); };

(async () => {
  const lab = []; for (let s = 0; s < 20; s++) lab.push(M.simulate({ persona, pace, roundSec: round, seed: 5000 + s }).summary);
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page_ = [];
  for (let i = 0; i < N; i++) {
    const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await p.goto(`${URL}/the-unframeable-now/?round=${round}`, { waitUntil: 'load' }); await p.waitForTimeout(300);
    await p.click('#start'); await p.click(`.pace button[data-pace="${pace}"]`);
    const t0 = Date.now();
    for (const [t, k] of SCRIPT) {
      while (Date.now() - t0 < t) await new Promise((r) => setTimeout(r, 20));
      try {
        if (k === 'scroll') { await p.hover('#feed'); await p.mouse.wheel(0, 160); }
        else if (k === 'open') { await p.click('#cards .fcard:not(.you) >> nth=1', { timeout: 1500 }); }
        else if (k === 'like') { const w = await p.$('#cards .fcard.want'); await (w || (await p.$('#cards .fcard:not(.you)'))).click(); await p.waitForTimeout(150); await p.click('#cards .fcard.open .like', { timeout: 1500 }); }
        else if (k === 'hide') { await p.click('#cards .fcard:not(.you):not(.want) >> nth=0', { timeout: 1500 }); await p.waitForTimeout(150); await p.click('#cards .fcard.open .hide', { timeout: 1500 }); }
        else if (k === 'mute') { await p.click('#cards .fcard:not(.you):not(.want):not(.open) >> nth=0', { timeout: 1500 }); await p.waitForTimeout(150); await p.click('#cards .fcard.open .mute', { timeout: 1500 }); }
        else if (k === 'search') { await p.click('#phoneSearch'); await p.type('#phoneSearch', 'garden'); }
        else if (k === 'refresh') { await p.click('#refresh'); }
      } catch (e) { /* a card may not be there; the lab's persona skips too */ }
    }
    await p.waitForFunction(() => session.phase === 'done', null, { timeout: round * 1000 + 15000 });
    page_.push(await p.evaluate(() => { const s = DECAY.snaps[DECAY.snaps.length - 1]; return { a: s.a, c: s.c, g: s.g, m: s.m, e: s.e, moves: session.moves.length, arrivals: session.seen.ask + session.seen.want }; }));
    await p.close();
  }
  await browser.close();
  const st = (xs) => { const m = xs.reduce((a, b) => a + b, 0) / xs.length; const sd = Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(1, xs.length - 1)); return { m, sd }; };
  console.log(`conformance · ${pace} · ${round}s · page n=${N} vs lab n=20\n`);
  console.log('dim        page mean ± sd      lab mean ± sd       gap    verdict');
  let worst = 0;
  for (const [k, name] of [['a', 'attention'], ['c', 'calm'], ['g', 'agency'], ['m', 'minutes'], ['e', 'disorder'], ['moves', 'moves'], ['arrivals', 'arrivals']]) {
    const P = st(page_.map((r) => r[k])), L = st(lab.map((r) => r[k]));
    const gap = Math.abs(P.m - L.m), tol = Math.max(0.05, 2 * Math.max(P.sd, L.sd), k === 'arrivals' ? 12 : k === 'moves' ? 1 : 0);
    const ok = gap <= tol; if (!ok) worst += 1;
    console.log(`${name.padEnd(10)} ${P.m.toFixed(2)} ± ${P.sd.toFixed(2)}        ${L.m.toFixed(2)} ± ${L.sd.toFixed(2)}        ${gap.toFixed(2)}   ${ok ? 'within' : 'OUTSIDE'} (tol ${tol.toFixed(2)})`);
  }
  console.log(worst ? `\n${worst} dimension(s) outside tolerance: model.js has drifted from the page.` : '\nall within tolerance: the lab agrees with the piece on this script.');
  process.exit(worst ? 1 : 0);
})();
