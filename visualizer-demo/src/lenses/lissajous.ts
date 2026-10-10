/* Lissajous: the sounding interval drawn as the figure two oscillators
   make together. A fifth vibrates 3 against 2 and draws a three-lobed
   knot; a semitone, 16 against 15, a dense weave.

     beat        turns the phase between the two oscillators a quarter, so
                 the figure rolls over on itself in time
     key change  swaps the axes: what was across is now up

   Colour is the pair of notes making the figure: the tonic at the centre,
   the loudest note at the edge. It fades in smoothly, the way a scope
   trace settles. */

import { blend, onWheel } from "../law/light";
import { type Lens, type Seen, clamp01, loudest, seen, ticks, toPolar } from "./lens";

/* small whole-number frequency ratios for each interval above the tonic */
export const RATIO: readonly (readonly [number, number])[] = [
  [1, 1], [16, 15], [9, 8], [6, 5], [5, 4], [4, 3], [7, 5], [3, 2], [8, 5], [5, 3], [7, 4], [15, 8],
];

export interface LissajousState {
  readonly seen: Seen;
  readonly top: number;
  readonly a: number;
  readonly b: number;
  /** quarter turns of phase between the oscillators */
  readonly phase: number;
  readonly swapped: boolean;
}

export const lissajous: Lens<LissajousState> = {
  id: "lissajous", title: "Lissajous",
  idea: "The interval as two oscillators' figure; every beat rolls the phase a quarter turn.",
  state(f, prev) {
    const t = ticks(f, prev?.seen ?? null);
    const top = loudest(f.harmony.chroma);
    const [a, b] = RATIO[(((top - f.harmony.tonic) % 12) + 12) % 12];
    return {
      seen: seen(f), top, a, b,
      phase: (prev?.phase ?? 0) + (t.beat ? 1 : 0),
      swapped: t.keyChange ? !prev?.swapped : (prev?.swapped ?? false),
    };
  },
  view: (s) => {
    const inner = onWheel(s.seen.tonic, 0.55, 0.95), outer = onWheel(s.top, 0.7, 0.95);
    const delta = (s.phase % 4) * (Math.PI / 2) + Math.PI / 4;
    const [fx, fy] = s.swapped ? [s.b, s.a] : [s.a, s.b];
    return {
      turn: () => 0,
      shell: (r) => r,
      motes: (n) => n,
      divergence: (d) => d,
      folds: (k) => k,
      place: (k, an) => {
        /* nested traces: each radius draws the same figure, smaller */
        const t = an * 2 * Math.PI, size = 0.2 + 0.78 * k;
        const [r, a] = toPolar(Math.sin(fx * t + delta) * size, Math.sin(fy * t) * size);
        return { k: Math.min(1, r), a, v: 1 };
      },
      colour: (k) => blend(inner, outer, k),
      centre: () => [0, 0],
      ground: () => onWheel(s.seen.tonic, 0.4, 0.06),
      emblem: () => [
        { line: [-1, -1, 1, -1], v: 0.4 }, { line: [1, -1, 1, 1], v: 0.4 },
        { line: [1, 1, -1, 1], v: 0.4 }, { line: [-1, 1, -1, -1], v: 0.4 },
        { line: [-1.08, 0, 1.08, 0], v: 0.25 }, { line: [0, -1.08, 0, 1.08], v: 0.25 },
      ],
      rings: () => [],
      words: () => null,
      blendIn: (x) => clamp01(0.5 - 0.5 * Math.cos(Math.PI * x)),
    };
  },
  label: (s) => `${s.a}:${s.b} · phase ${(s.phase % 4) * 90}°${s.swapped ? " · swapped" : ""}`,
};
