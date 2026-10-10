/* Atlas: two lenses in one body. Sunburst's map of the song is the
   scaffold, and Bridson's growth fills it in as the song is heard.

   The circle is the song's timeline, clockwise from the top, as in
   Sunburst: the analysed parts sit in a ring round the rim, each as wide
   as it is long and in the colour of its key, and a needle marks the
   playhead. Inside the ring, the growth is Bridson's Poisson-disc sampling
   (`poisson.ts`), held to the part of the circle the song has reached:

     a beat       plants a seed at the needle, in the key being heard, and
                  runs one round: every growing point tries thirty
                  candidates round it, never closer than r to another and
                  never past the needle. A point takes the key that was
                  heard at its place on the timeline, not its parent's, so
                  growth that spreads on from an old key is recoloured as
                  it crosses into the new one
     a key change plants the new key's first seed at once, and leaves a
                  tick on the timeline where it was heard, just inside the
                  ring of parts

   Nothing is cleared. Bridson's patchwork is a map of where the harmony
   has been, redrawn over itself; here it is laid out in time, so by the
   end the circle is the song as it was heard, and it sits inside the song
   as it was analysed. Where the two agree, the growth matches the colour
   of the ring outside it; where the live key heard something the analysis
   did not, it shows.

   Before the analysis has finished there are no parts and no length, so
   the needle goes round once in BEATS_PER_TURN beats instead. A lens on
   the other deck can be blended over it while it keeps growing. Colour is
   the key, of each point and each part; loudness changes neither. */

import { NOTE } from "../audio/key";
import { onWheel } from "../law/light";
import { type Context, type Lens, type Mark, type Part, type Ring, type Seen, clamp01, frac, seen, ticks, toPolar } from "./lens";
import { type Sample, plant, random, round } from "./poisson";

/** the minimum distance between points, in units of the body */
export const R = 0.035;
export const MAX = 1600;
/** the growth's band, inside the ring of parts */
export const INNER = 0.2;
export const OUTER = 0.74;
/** the ring of parts */
export const RING: readonly [number, number] = [0.8, 0.92];
export const BEATS_PER_TURN = 256;

export interface AtlasState {
  readonly seen: Seen;
  readonly parts: readonly Part[];
  /** how far round the song the needle is, 0..1 from the top */
  readonly needle: number;
  readonly samples: readonly Sample[];
  readonly seed: number;
  readonly rounds: number;
  /** the key heard first, and where on the timeline each change was heard */
  readonly first: number;
  readonly changes: readonly { readonly at: number; readonly pc: number }[];
}

/** the key heard at a place on the timeline */
export function keyAt(s: Pick<AtlasState, "first" | "changes">, at: number): number {
  let pc = s.first;
  for (const c of s.changes) if (c.at <= at) pc = c.pc;
  return pc;
}

/** a point at a place on the timeline, `at` turns clockwise from the top */
export const onTimeline = (at: number, r: number): [number, number] =>
  [r * Math.cos(at * 2 * Math.PI - Math.PI / 2), r * Math.sin(at * 2 * Math.PI - Math.PI / 2)];

/** how far clockwise from the top a point is, in turns */
export const timelineOf = (x: number, y: number) => frac(Math.atan2(y, x) / (2 * Math.PI) + 0.25);

/** where the needle is: by time once the parts are known, by beats before */
function needleAt(f: { t: number; rhythm: { beats: number } }, parts: readonly Part[]): number {
  const seconds = parts.length ? parts[parts.length - 1].until : 0;
  return seconds > 0 ? clamp01(f.t / seconds) : clamp01(f.rhythm.beats / BEATS_PER_TURN);
}

/** the band the song has reached */
const reached = (needle: number) => (x: number, y: number) => {
  const r = Math.hypot(x, y);
  return r >= INNER && r <= OUTER && timelineOf(x, y) <= needle;
};

export const atlas: Lens<AtlasState> = {
  id: "atlas", title: "Atlas",
  idea: "Bridson's growth inside Sunburst's map of the song: each beat grows the circle at the needle, in the key it heard, so it ends as the song as heard, inside the song as analysed.",
  state(f, prev, context?: Context) {
    const t = ticks(f, prev?.seen ?? null);
    const parts = context?.parts ?? prev?.parts ?? [];
    const needle = Math.max(prev?.needle ?? 0, needleAt(f, parts));
    const sow = (samples: readonly Sample[], seed: number, rounds: number) => {
      const [u, next] = random(seed);
      const [x, y] = onTimeline(needle, INNER + (OUTER - INNER) * u);
      return { samples: plant(samples, x, y, R, f.harmony.tonic, rounds), seed: next };
    };
    if (!prev) {
      const first = sow([], 20261 + f.harmony.tonic, 0);
      return { seen: seen(f), parts, needle, ...first, rounds: 0, first: f.harmony.tonic, changes: [] };
    }
    let { samples, seed, rounds, changes } = prev;
    if (t.keyChange) {
      changes = [...changes, { at: needle, pc: f.harmony.tonic }];
      ({ samples, seed } = sow(samples, seed, rounds));
    }
    if (t.beat && samples.length < MAX) {
      rounds++;
      ({ samples, seed } = sow(samples, seed, rounds));
      ({ samples, seed } = round(samples, R, seed, rounds, MAX, reached(needle)));
      const heard = { first: prev.first, changes };
      samples = samples.map((p) => (p.born === rounds && p.parent >= 0 ? { ...p, pc: keyAt(heard, timelineOf(p.x, p.y)) } : p));
    }
    return { seen: seen(f), parts, needle, samples, seed, rounds, first: prev.first, changes };
  },
  view: (s) => {
    const seconds = s.parts.length ? s.parts[s.parts.length - 1].until : 0;
    const playing = (p: Part) => seconds > 0 && s.needle * seconds >= p.at && s.needle * seconds < p.until;
    return {
      turn: () => 0,
      shell: () => 0.94,
      motes: () => MAX,
      divergence: (d) => d,
      folds: () => 1,
      place: (_k, _a, i) => {
        const p = s.samples[i];
        if (!p) return { k: 0, a: 0, v: 0 };
        const [k, a] = toPolar(p.x, p.y);
        const age = s.rounds - p.born;
        return { k, a, v: p.active ? 1.6 : age < 2 ? 1.3 : 1 };
      },
      colour: (_k, _a, i) => {
        const p = s.samples[i];
        return onWheel(p ? p.pc : s.seen.tonic, p?.active ? 0.8 : 0.55, 0.95);
      },
      centre: () => [0, 0],
      ground: () => onWheel(s.seen.tonic, 0.35, 0.045),
      emblem: (): Mark[] => {
        const [nx0, ny0] = onTimeline(s.needle, INNER * 0.6), [nx1, ny1] = onTimeline(s.needle, RING[1]);
        return [
          { circle: INNER, v: 0.25 },
          { circle: OUTER + R, v: 0.2 },
          /* where each key change was heard: a tick between the growth and
             the ring, so it can be read against the analysed parts */
          ...s.changes.map(({ at }) => {
            const [x0, y0] = onTimeline(at, OUTER + R), [x1, y1] = onTimeline(at, RING[0]);
            return { line: [x0, y0, x1, y1] as const, v: 0.7 };
          }),
          /* the newest links: which point each grew from */
          ...s.samples.flatMap((p) => {
            const q = s.samples[p.parent];
            return q && s.rounds - p.born < 6 ? [{ line: [q.x, q.y, p.x, p.y] as const, v: 0.35 }] : [];
          }),
          /* the needle */
          { line: [nx0, ny0, nx1, ny1], v: 1 },
        ];
      },
      /* it grows in from the middle, the scaffold last */
      blendIn: (x, k) => clamp01(x * 1.6 - k * 0.6),
      words: () => null,
      rings: (): Ring[] => s.parts.map((p, i) => ({
        x0: p.at / seconds, x1: p.until / seconds, r0: RING[0], r1: RING[1],
        colour: onWheel(p.tonic, p.minor ? 0.5 : 0.66, 0.92),
        v: playing(p) ? 1.2 : 0.4 + 0.3 * p.energy,
        label: `${i + 1} · ${NOTE[p.tonic]}${p.minor ? "m" : ""}`,
      })),
    };
  },
  label: (s) => {
    const keys = [...new Set(s.samples.map((p) => p.pc))].map((pc) => NOTE[pc]);
    const seconds = s.parts.length ? s.parts[s.parts.length - 1].until : 0;
    const part = s.parts.findIndex((p) => s.needle * seconds >= p.at && s.needle * seconds < p.until);
    return `${s.samples.length} points · heard ${keys.join(" ")}${part >= 0 ? ` · part ${part + 1} of ${s.parts.length}` : ""}`;
  },
};
