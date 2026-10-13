#!/usr/bin/env node
/* The Unframeable Now · lab · paper.js
 * Render the paper to an A4 PDF, headless, the way the rounds were recorded.
 * Needs Playwright on NODE_PATH and the repository root served at --url.
 *
 *   NODE_PATH=…/node_modules node paper.js [--frame general|product|wellbeing] [--seeds 10] [--round 180] [--sample samples.json] [--url http://localhost:8000] [--out paper-general.pdf]
 */
const path = require('path');
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1]] : []).filter((x) => x.length));
const frame = args.frame || 'general', url = args.url || 'http://localhost:8743';
const out = args.out || path.join(__dirname, `paper-${frame}.pdf`);
const qs = new URLSearchParams({ frame, seeds: args.seeds || 10, round: args.round || 180, ...(args.sample ? { sample: args.sample } : {}) });

(async () => {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1400 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${url}/the-unframeable-now/lab/paper.html?${qs}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  await page.waitForTimeout(500);
  const status = await page.$eval('#st', (el) => el.textContent);
  await page.emulateMedia({ media: 'print' });
  const title = await page.title();
  const sty = 'font-family: -apple-system, Helvetica, Arial, sans-serif; font-size: 7px; letter-spacing: 0.12em; text-transform: uppercase; color: #8a8a8a; width: 100%; padding: 0 17mm; display: flex; justify-content: space-between;';
  await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true,
    headerTemplate: `<div style="${sty}"><span>The Unframeable Now · Decay Lab</span><span>${title.replace(' · Decay Lab', '')}</span></div>`,
    footerTemplate: `<div style="${sty}"><span>frame: ${frame}</span><span>page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`,
    margin: { top: '20mm', right: '17mm', bottom: '20mm', left: '17mm' } });
  await browser.close();
  console.log(`${status} → ${out}`);
  if (errors.length) { console.log('ERRORS', JSON.stringify(errors)); process.exit(1); }
})();
