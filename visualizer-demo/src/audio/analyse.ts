/* The whole-track pass: the track, read once from end to end, as parts.

   A setlist asks for things a single moment cannot answer — the peak, a
   build, a new key — so fitting it needs the shape of the whole track
   before it plays. This is that shape: where the joins are, and for each
   part between them how loud, how bright, and in what key.

   It is plain arithmetic over samples. Decoding is in `decode.ts`; this
   file has no audio API in it, so the tests can hand it a synthetic signal
   and know exactly where the joins should fall. */

import type { TrackId } from "../marks/fingerprint";
import { magnitudes } from "./fft";
import { MAJOR, MINOR, correlate, keyOf, pitchClass } from "./key";

export interface Section {
  readonly i: number;
  readonly at: number;
  readonly until: number;
  /** mean loudness, 0..1 against the track's own peak (a 40 dB range) */
  readonly energy: number;
  /** mean spectral centroid, 0..1 */
  readonly bright: number;
  readonly tonic: number;
  readonly minor: boolean;
  /** how much better the best-fitting key fits this section than the key
   *  carried into it, as a difference of correlations; 0 when they agree */
  readonly drift: number;
}

export interface Analysis {
  readonly track: TrackId | null;
  readonly seconds: number;
  readonly sections: readonly Section[];
  /** every join between sections */
  readonly seams: readonly number[];
  /** the joins where the key on one side is not the key on the other */
  readonly keyAt: readonly number[];
}

const HOP = 0.25;
const N = 4096;
/** half the window on each side of a candidate seam */
const REACH = 16;
/** no section shorter than this, in hops */
const SPACING = 32;

const mean = (a: ArrayLike<number>, from: number, to: number) => {
  let s = 0;
  for (let i = from; i < to; i++) s += a[i];
  return to > from ? s / (to - from) : 0;
};

/* A key is carried forward, not re-guessed for every part. Guessed fresh,
   a song in C came back "F major" for every passage that leaned on the F
   chord: ten key changes in seventeen parts from a song that never
   modulates. C and F differ by one note, so a part full of F chords fits F
   slightly better without having left C.

   So each part keeps the key of the part before unless another key fits it
   clearly better, by KEY_MARGIN. A key change is where the old key stops
   fitting, not where a neighbour starts fitting a little more. */
export const KEY_MARGIN = 0.15;

/* relative keys are one key here: C major and A minor share every note,
   and a move between them is a change of weight, not of key */
const relative = (a: { tonic: number; minor: boolean }, b: { tonic: number; minor: boolean }) =>
  (a.tonic === b.tonic && a.minor === b.minor) ||
  (!a.minor && b.minor && (a.tonic + 9) % 12 === b.tonic) ||
  (a.minor && !b.minor && (b.tonic + 9) % 12 === a.tonic);

export function analyse(pcm: Float32Array, sr: number, track: TrackId | null = null): Analysis {
  const hop = Math.round(sr * HOP);
  const W = Math.max(1, Math.floor((pcm.length - N) / hop) + 1);
  const seconds = pcm.length / sr;

  const db = new Float64Array(W), cent = new Float64Array(W);
  const chroma = Array.from({ length: W }, () => new Float64Array(12));
  const re = new Float64Array(N), im = new Float64Array(N), mag = new Float64Array(N / 2);
  const hann = Float64Array.from({ length: N }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1)));
  const pcOf = Int8Array.from({ length: N / 2 }, (_, k) => {
    const hz = (k * sr) / N;
    return hz < 55 || hz > 2000 ? -1 : pitchClass(hz);
  });

  for (let w = 0; w < W; w++) {
    const o = w * hop;
    let sq = 0;
    for (let i = 0; i < N; i++) {
      const x = pcm[o + i] ?? 0;
      sq += x * x;
      re[i] = x * hann[i];
    }
    db[w] = 10 * Math.log10(sq / N + 1e-12);
    magnitudes(re, im, mag);
    let num = 0, den = 0;
    for (let k = 1; k < mag.length; k++) {
      num += k * mag[k]; den += mag[k];
      if (pcOf[k] >= 0) chroma[w][pcOf[k]] += mag[k];
    }
    cent[w] = den > 0 ? Math.min(1, num / den / (mag.length * 0.34)) : 0;
  }

  /* loudness against this track's own peak, so a quiet master and a loud
     one both span the range */
  let peak = -Infinity;
  for (const d of db) peak = Math.max(peak, d);
  const energy = Float64Array.from(db, (d) => Math.max(0, Math.min(1, (d - (peak - 40)) / 40)));
  for (let w = 0; w < W; w++) {
    if (db[w] < peak - 60) { chroma[w].fill(0); cent[w] = 0; continue; }
    let s = 0;
    for (const v of chroma[w]) s += v;
    if (s > 0) for (let k = 0; k < 12; k++) chroma[w][k] /= s;
  }

  /* **novelty**: how different the four seconds after a hop are from the
     four before it, in loudness, light and harmony together. A seam is
     where that peaks. */
  const novelty = new Float64Array(W);
  for (let t = REACH; t <= W - REACH; t++) {
    const de = mean(energy, t, t + REACH) - mean(energy, t - REACH, t);
    const dc = mean(cent, t, t + REACH) - mean(cent, t - REACH, t);
    const L = new Float64Array(12), R = new Float64Array(12);
    for (let i = t - REACH; i < t; i++) for (let k = 0; k < 12; k++) L[k] += chroma[i][k];
    for (let i = t; i < t + REACH; i++) for (let k = 0; k < 12; k++) R[k] += chroma[i][k];
    let dot = 0, nl = 0, nr = 0;
    for (let k = 0; k < 12; k++) { dot += L[k] * R[k]; nl += L[k] * L[k]; nr += R[k] * R[k]; }
    const cos = nl > 0 && nr > 0 ? dot / Math.sqrt(nl * nr) : 1;
    novelty[t] = 2 * Math.abs(de) + 2 * Math.abs(dc) + (1 - cos);
  }

  const peaks: number[] = [];
  for (let t = REACH; t <= W - REACH; t++)
    if (novelty[t] > 0 && novelty[t] >= novelty[t - 1] && novelty[t] > novelty[t + 1]) peaks.push(t);
  peaks.sort((a, b) => novelty[b] - novelty[a]);

  let mu = 0, sd = 0;
  for (const p of peaks) mu += novelty[p];
  mu /= Math.max(1, peaks.length);
  for (const p of peaks) sd += (novelty[p] - mu) ** 2;
  sd = Math.sqrt(sd / Math.max(1, peaks.length));

  /* the strongest first, never closer than eight seconds; a track with no
     strong joins still gets a few of its weaker ones, so a setlist has
     somewhere to put its scenes */
  const want = Math.min(4, Math.floor(seconds / 10));
  const room = Math.floor(seconds / (SPACING * HOP));
  const cut: number[] = [];
  for (const p of peaks) {
    if (cut.length + 1 >= room) break;
    const strong = novelty[p] > mu + 0.5 * sd && novelty[p] > 0.05;
    if (!strong && cut.length + 1 >= want) break;
    if (cut.every((c) => Math.abs(c - p) >= SPACING) && p >= SPACING / 1.5 && W - p >= SPACING / 1.5) cut.push(p);
  }
  cut.sort((a, b) => a - b);

  const bounds = [0, ...cut, W];
  const sections: Section[] = [];
  let carried: { tonic: number; minor: boolean } | null = null;
  for (let s = 0; s + 1 < bounds.length; s++) {
    const a = bounds[s], b = bounds[s + 1];
    const ch = new Float64Array(12);
    for (let w = a; w < b; w++) for (let k = 0; k < 12; k++) ch[k] += chroma[w][k];
    const best = keyOf(ch);
    const stay = carried ? correlate(ch, carried.minor ? MINOR : MAJOR, carried.tonic) : best.score;
    const drift = +(best.score - stay).toFixed(3);
    if (!carried || (drift > KEY_MARGIN && !relative(carried, best))) carried = { tonic: best.tonic, minor: best.minor };
    const k = carried;
    sections.push({
      i: s,
      at: +(a * HOP).toFixed(2),
      until: s + 2 === bounds.length ? +seconds.toFixed(2) : +(b * HOP).toFixed(2),
      energy: +mean(energy, a, b).toFixed(3),
      bright: +mean(cent, a, b).toFixed(3),
      tonic: k.tonic,
      minor: k.minor,
      drift,
    });
  }
  const seams = sections.slice(1).map((s) => s.at);
  const keyAt = sections.slice(1).filter((s, i) => !relative(sections[i], s)).map((s) => s.at);
  return { track, seconds: +seconds.toFixed(2), sections, seams, keyAt };
}
