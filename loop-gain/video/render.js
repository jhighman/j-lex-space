/* frame-exact render of the film: drive the film's clock at 30 fps, encode each frame with WebCodecs (H.264), mux to MP4 in the page, stream the bytes out.
   node render.js <out.mp4> [seconds] [fps] [kbps] [query]   e.g. query 'subs=1' for the burned-in captions cut */
const puppeteer = require('puppeteer-core'); const fs = require('fs'); const path = require('path');
const out = process.argv[2] || 'loop-gain-film.mp4'; const seconds = Number(process.argv[3] || 0); const fps = Number(process.argv[4] || 30); const kbps = Number(process.argv[5] || 4000); const query = process.argv[6] ? '?' + process.argv[6] : '';
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, protocolTimeout: 3600000, args: ['--window-size=1300,760', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'] });
  const page = await browser.newPage(); await page.setViewport({ width: 1300, height: 760 });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const fd = fs.openSync(out, 'w'); let written = 0;
  await page.exposeFunction('__sink', (b64) => { const buf = Buffer.from(b64, 'base64'); fs.writeSync(fd, buf); written += buf.length; });
  await page.exposeFunction('__log', (s) => console.log(new Date().toISOString().slice(11, 19), s));
  await page.goto('http://127.0.0.1:8000/loop-gain/video/film.html' + query, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__film && window.__film.ready, { timeout: 60000 }); await page.evaluate(() => window.__film.ready);
  await page.addScriptTag({ content: fs.readFileSync(path.join(path.dirname(require.resolve('mp4-muxer')), 'mp4-muxer.js'), 'utf8') }); // needs puppeteer-core and mp4-muxer on the module path: run from a folder that has them, or set NODE_PATH
  const result = await page.evaluate(async ({ seconds, fps, kbps }) => {
    const F = window.__film; const total = seconds > 0 ? seconds : F.TOTAL; const n = Math.round(total * fps);
    const { Muxer, ArrayBufferTarget } = Mp4Muxer;
    const muxer = new Muxer({ target: new ArrayBufferTarget(), video: { codec: 'avc', width: F.canvas.width, height: F.canvas.height }, fastStart: 'in-memory', firstTimestampBehavior: 'offset' });
    const codec = F.canvas.width > 1920 ? 'avc1.640033' : 'avc1.640028'; // High profile; level 5.1 above 1080p
    const support = await VideoEncoder.isConfigSupported({ codec, width: F.canvas.width, height: F.canvas.height, bitrate: kbps * 1000, framerate: fps });
    if (!support.supported) return { error: 'H.264 encoding not supported here' };
    let encErr = null; const encoder = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => { encErr = String(e); } });
    encoder.configure({ codec, width: F.canvas.width, height: F.canvas.height, bitrate: kbps * 1000, framerate: fps, latencyMode: 'quality', avc: { format: 'avc' } });
    const t0 = performance.now();
    for (let i = 0; i < n; i++) {
      F.render(i / fps);
      const frame = new VideoFrame(F.canvas, { timestamp: Math.round(i * 1e6 / fps), duration: Math.round(1e6 / fps) });
      encoder.encode(frame, { keyFrame: i % (fps * 2) === 0 }); frame.close();
      while (encoder.encodeQueueSize > 4) await new Promise((r) => setTimeout(r, 5));
      if (encErr) return { error: encErr };
      if (i % (fps * 20) === 0 && i) window.__log(`${(i / fps).toFixed(0)} s rendered of ${total} · ${(i / ((performance.now() - t0) / 1000)).toFixed(1)} fps throughput`);
    }
    await encoder.flush(); encoder.close(); muxer.finalize();
    const bytes = new Uint8Array(muxer.target.buffer); const CH = 4 * 1024 * 1024;
    for (let o = 0; o < bytes.length; o += CH) { let s = ''; const sub = bytes.subarray(o, Math.min(o + CH, bytes.length)); for (let k = 0; k < sub.length; k += 0x8000) s += String.fromCharCode.apply(null, sub.subarray(k, k + 0x8000)); await window.__sink(btoa(s)); }
    return { frames: n, seconds: total, bytes: bytes.length, wall: (performance.now() - t0) / 1000 };
  }, { seconds, fps, kbps });
  fs.closeSync(fd);
  console.log('result:', JSON.stringify(result), '| written', written, 'bytes', '| errors:', errors.length ? errors.join(' | ') : 'none');
  await browser.close();
})().catch((e) => { console.error('render failed:', e.message); process.exit(1); });
