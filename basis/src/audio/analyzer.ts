/* The analyzer: the only module that touches Web Audio. It writes frames;
   everything else reads them. `tests/channel.test.ts` fails if anything
   outside `audio/` mentions an analyser or an audio context. */

import { type Frame, type Harmony, silent, sounding } from "./frame";
import { keyOf, pitchClass } from "./key";

const FFT = 4096;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export class Analyzer {
  readonly ctx: AudioContext;
  private readonly an: AnalyserNode;
  private readonly bytes: Uint8Array<ArrayBuffer>;
  private readonly floats: Float32Array<ArrayBuffer>;
  private tap: MediaStreamAudioDestinationNode | null = null;
  private prev: Uint8Array | null = null;

  /* each reading is held against a ceiling of its own that falls slowly,
     so a mastered track that pins the meter still has a shape */
  private peak = 1e-4;
  private fluxMax = 1e-4;
  private bright = 0;

  private lastOnset = -1;
  private lastFlux = 0;
  private gaps: number[] = [];
  private beats = 0;

  private chroma = new Float64Array(12);
  private chromaSlow = new Float64Array(12);
  private key = { tonic: 0, minor: false };
  private pending: { tonic: number; minor: boolean; since: number } | null = null;

  constructor(private readonly audio: HTMLAudioElement) {
    this.ctx = new AudioContext();
    this.an = this.ctx.createAnalyser();
    this.an.fftSize = FFT;
    this.an.smoothingTimeConstant = 0.3;
    const src = this.ctx.createMediaElementSource(audio);
    src.connect(this.an);
    this.an.connect(this.ctx.destination);
    this.bytes = new Uint8Array(this.an.frequencyBinCount);
    this.floats = new Float32Array(this.an.frequencyBinCount);
  }

  /** the track as a stream, for recording a take. The analyser passes its
   *  input through unchanged, so this is exactly what is heard. */
  stream(): MediaStream {
    if (!this.tap) {
      this.tap = this.ctx.createMediaStreamDestination();
      this.an.connect(this.tap);
    }
    return this.tap.stream;
  }

  /** a fresh track starts a fresh count; ceilings learn the new master */
  reset(): void {
    this.prev = null;
    this.peak = this.fluxMax = 1e-4;
    this.bright = 0;
    this.lastOnset = -1;
    this.gaps = [];
    this.beats = 0;
    this.chroma.fill(0);
    this.chromaSlow.fill(0);
    this.pending = null;
  }

  read(): Frame {
    const t = this.audio.currentTime;
    if (this.audio.paused || this.audio.ended || this.ctx.state !== "running") return silent(t);
    /* a seek backwards leaves the last onset in the future */
    if (t < this.lastOnset) { this.lastOnset = -1; this.gaps = []; }

    const f = this.bytes;
    this.an.getByteFrequencyData(f);

    /* energy: the peak of the lower spectrum against its own ceiling */
    const n = Math.floor(f.length * 0.45);
    let p = 0;
    for (let i = 0; i < n; i++) if (f[i] > p) p = f[i];
    p /= 255;
    this.peak = Math.max(p, this.peak * 0.9995);
    const energy = clamp01(p / Math.max(0.08, this.peak));

    /* flux: how much of the spectrum got louder since the last frame —
       zero on a held chord however loud, large on a strike however quiet */
    let flux = 0;
    if (this.prev) {
      let d = 0;
      for (let i = 0; i < f.length; i++) { const k = f[i] - this.prev[i]; if (k > 0) d += k; }
      const raw = d / (f.length * 255);
      this.fluxMax = Math.max(raw, this.fluxMax * 0.995);
      flux = clamp01(raw / Math.max(8e-4, this.fluxMax));
      this.prev.set(f);
    } else {
      this.prev = new Uint8Array(f);
    }

    /* an onset is a rising edge through half the flux's own range, with a
       refractory gap so one strike is one beat */
    if (flux > 0.5 && this.lastFlux <= 0.5 && t - this.lastOnset > 0.12) {
      if (this.lastOnset >= 0) {
        const gap = t - this.lastOnset;
        if (gap < 2) { this.gaps.push(gap); if (this.gaps.length > 24) this.gaps.shift(); }
      }
      this.lastOnset = t;
      this.beats++;
    }
    this.lastFlux = flux;
    const beat = this.lastOnset < 0 ? 0 : clamp01(1 - (t - this.lastOnset) / 0.18);

    /* centroid */
    let num = 0, den = 0;
    for (let i = 0; i < f.length; i++) { num += i * f[i]; den += f[i]; }
    const br = den < 1 ? 0 : clamp01(num / den / (f.length * 0.34));
    this.bright += (br - this.bright) * 0.08;

    /* tempo: the median gap, folded into 70–180 bpm */
    let bpm = 0, period = 0.5;
    if (this.gaps.length >= 6) {
      const s = [...this.gaps].sort((a, b) => a - b);
      period = s[s.length >> 1];
      while (60 / period < 70) period /= 2;
      while (60 / period > 180) period *= 2;
      bpm = Math.round(60 / period);
    }
    const phase = this.lastOnset < 0 ? 0 : Math.min(0.999, (t - this.lastOnset) / period);

    return sounding({
      t,
      dynamics: { energy, beat, flux, bright: this.bright },
      harmony: this.harmony(t),
      rhythm: { beats: this.beats, phase, bpm },
    });
  }

  private harmony(t: number): Harmony {
    const fl = this.floats;
    this.an.getFloatFrequencyData(fl);
    const sr = this.ctx.sampleRate;
    const now = new Float64Array(12);
    for (let i = 1; i < fl.length; i++) {
      const hz = (i * sr) / FFT;
      if (hz < 55) continue;
      if (hz > 2000) break;
      const mag = Math.pow(10, fl[i] / 20);
      const pc = pitchClass(hz);
      now[pc] += mag;
    }
    let top = 1e-9;
    for (let i = 0; i < 12; i++) {
      this.chroma[i] += (now[i] - this.chroma[i]) * 0.25;
      this.chromaSlow[i] += (now[i] - this.chromaSlow[i]) * 0.01;
      top = Math.max(top, this.chroma[i]);
    }

    /* a key has to win for two seconds before it is the key, so a passing
       chord does not repaint the room */
    const k = keyOf(this.chromaSlow);
    if (k.tonic === this.key.tonic && k.minor === this.key.minor) this.pending = null;
    else if (!this.pending || this.pending.tonic !== k.tonic || this.pending.minor !== k.minor)
      this.pending = { tonic: k.tonic, minor: k.minor, since: t };
    else if (t - this.pending.since > 2) { this.key = { tonic: k.tonic, minor: k.minor }; this.pending = null; }

    return {
      chroma: Array.from(this.chroma, (v) => v / top),
      tonic: this.key.tonic,
      minor: this.key.minor,
    };
  }
}
