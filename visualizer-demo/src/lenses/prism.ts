/* Prism: the chord split into its twelve notes, each a wedge of the body
   as wide as that note is loud in the harmony. A bare fifth is two broad
   wedges; a cluster is a fan of thin ones.

     beat        turns the prism one wedge
     key change  switches the order of the colours between the circle of
                 fifths and the chromatic scale

   Colour is the note each wedge belongs to. It fades in one wedge at a
   time. */

import { fifthsHue, hue } from "../law/light";
import { type Lens, type Seen, frac, seen, steps, ticks } from "./lens";

export interface PrismState {
  readonly seen: Seen;
  readonly chroma: readonly number[];
  readonly turns: number;
  readonly chromatic: boolean;
}

export const prism: Lens<PrismState> = {
  id: "prism", title: "Prism",
  idea: "The chord split into twelve wedges as wide as each note is loud; every beat turns it one wedge.",
  state(f, prev) {
    const t = ticks(f, prev?.seen ?? null);
    return {
      seen: seen(f),
      chroma: f.harmony.chroma.slice(),
      turns: (prev?.turns ?? 0) + (t.beat ? 1 : 0),
      chromatic: t.keyChange ? !prev?.chromatic : (prev?.chromatic ?? false),
    };
  },
  view: (s) => {
    const w = s.chroma.map((v) => 0.02 + Math.max(0, v));
    const sum = w.reduce((a, b) => a + b, 0);
    const edges: number[] = [];
    let run = 0;
    for (const v of w) { edges.push(run / sum); run += v; }
    const wedge = (a: number) => {
      const x = frac(a - s.turns / 12);
      let j = 11;
      while (j > 0 && edges[j] > x) j--;
      return j;
    };
    const colourOf = (pc: number) => hue(s.chromatic ? pc * 30 : fifthsHue(pc), 0.7, 0.95);
    return {
      turn: () => 0,
      shell: (r) => r,
      motes: (n) => Math.max(1000, n),
      divergence: (d) => d,
      folds: () => 1,
      place: (k, a) => ({ k, a, v: 0.25 + 0.9 * s.chroma[wedge(a)] }),
      colour: (_k, a) => colourOf(wedge(a)),
      centre: () => [0, 0],
      ground: () => hue(260, 0.3, 0.05),
      emblem: () => edges.map((e) => {
        const a = (e + s.turns / 12) * 2 * Math.PI;
        return { line: [Math.cos(a) * 0.1, Math.sin(a) * 0.1, Math.cos(a) * 1.15, Math.sin(a) * 1.15] as const, v: 0.3 };
      }),
      words: () => null,
      blendIn: (x) => (x >= 1 ? 1 : steps(x - 1 / 24, 12)),
    };
  },
  label: (s) => `${s.chroma.filter((v) => v > 0.4).length} strong notes · ${s.chromatic ? "chromatic" : "fifths"} order`,
};
