/* Frost: a crystal that grows on the beat. Each beat adds a ring to a
   six-armed dendrite, with side spurs where the rings fall. It keeps what
   it has grown while the music plays; a silence melts it from the outside
   in.

     beat        grows the crystal one ring
     key change  half-thaws it
     silence     more than two seconds melts two rings

   Colour ignores the key altogether: ice, white at the core and bluer
   toward the tips. It fades in by freezing outward from the centre. */

import { hue } from "../law/light";
import { type Lens, type Seen, frac, seen, ticks } from "./lens";

export const RINGS = 12;
export const MELT_AFTER = 2;

export interface FrostState {
  readonly seen: Seen;
  readonly rings: number;
}

export const frost: Lens<FrostState> = {
  id: "frost", title: "Frost",
  idea: "Beats grow a six-armed crystal; silence melts it and a key change half-thaws it.",
  state(f, prev) {
    const t = ticks(f, prev?.seen ?? null);
    let rings = prev?.rings ?? 1;
    if (prev && f.t - prev.seen.t > MELT_AFTER) rings = Math.max(1, rings - 2);
    if (t.beat) rings = Math.min(RINGS, rings + 1);
    if (t.keyChange) rings = Math.max(1, Math.floor(rings / 2));
    return { seen: seen(f), rings };
  },
  view: (s) => {
    const reach = s.rings / RINGS;
    return {
      turn: () => s.rings * 0.004,
      shell: () => 0.25 + 0.65 * reach,
      motes: (n) => Math.max(1200, n),
      divergence: (d) => d,
      folds: (k) => k * 6,
      place: (k, a) => {
        /* within one twelfth of a turn either side of an arm: the arm itself,
           and wider spurs just past each ring */
        const ring = k * RINGS, nearRing = frac(ring) < 0.35;
        const width = nearRing ? 0.055 * (1 - frac(ring) / 0.35) : 0.006;
        const across = (frac(a * 12) - 0.5) * 2;
        return { k, a: across * width, v: k <= reach ? 1.25 : 0 };
      },
      colour: (k) => hue(195 + 25 * k, 0.1 + 0.55 * k, 0.98),
      centre: () => [0, 0],
      ground: () => hue(215, 0.4, 0.05),
      emblem: () => Array.from({ length: 6 }, (_, j) => {
        const a0 = (j / 6) * 2 * Math.PI, a1 = ((j + 1) / 6) * 2 * Math.PI;
        return { line: [Math.cos(a0) * 1.15, Math.sin(a0) * 1.15, Math.cos(a1) * 1.15, Math.sin(a1) * 1.15] as const, v: 0.35 };
      }),
      blendIn: (x, k) => (k <= x * 1.05 ? 1 : 0),
    };
  },
  label: (s) => `${s.rings} of ${RINGS} rings`,
};
