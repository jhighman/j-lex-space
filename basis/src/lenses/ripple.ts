/* Ripple: a pond. Each beat drops a stone at the angle of the loudest
   note, and its ring spreads across the body and fades; where rings cross
   they add. The body is dark except where a ring is passing.

     beat        drops a stone
     key change  calms the water: every ring stops

   Colour comes with the stone: each ring keeps the colour of the note that
   dropped it, so a melody leaves a pattern of colours on the water. It
   fades in with a shimmer. */

import { GREY, fifthsHue, hue, onWheel } from "../law/light";
import { type Lens, type Seen, clamp01, loudest, seen, ticks, toXY } from "./lens";

export const LIFE = 3;
const SPEED = 0.4;
const MAX = 10;

export interface Drop { readonly x: number; readonly y: number; readonly t0: number; readonly pc: number }

export interface RippleState {
  readonly seen: Seen;
  readonly drops: readonly Drop[];
}

/** a note's place round the pond, by fifths so a chord's stones fall together */
const angleOf = (pc: number) => fifthsHue(pc) / 360;

export const ripple: Lens<RippleState> = {
  id: "ripple", title: "Ripple",
  idea: "Every beat drops a stone where the loudest note is; rings spread, cross and fade.",
  state(f, prev) {
    const t = ticks(f, prev?.seen ?? null);
    let drops = t.keyChange ? [] : (prev?.drops ?? []).filter((d) => f.t - d.t0 < LIFE);
    if (t.beat) {
      const pc = loudest(f.harmony.chroma);
      const [x, y] = toXY(0.55, angleOf(pc));
      drops = [...drops, { x, y, t0: f.t, pc }].slice(-MAX);
    }
    return { seen: seen(f), drops };
  },
  view: (s) => {
    const wave = (k: number, a: number): [number, number] => {
      const [x, y] = toXY(k, a);
      let sum = 0, best = -1, bestV = 0;
      s.drops.forEach((d, j) => {
        const age = s.seen.t - d.t0;
        const off = Math.hypot(x - d.x, y - d.y) - age * SPEED;
        const v = Math.exp(-(off * off) / 0.0025) * (1 - age / LIFE);
        sum += v;
        if (v > bestV) { bestV = v; best = j; }
      });
      return [sum, best];
    };
    return {
      turn: (x) => x * 0.15,
      shell: (r) => r,
      motes: (n) => Math.max(900, n),
      divergence: (d) => d,
      folds: (k) => k,
      place: (k, a) => ({ k, a, v: 0.06 + 1.3 * Math.min(1.2, wave(k, a)[0]) }),
      colour: (k, a) => {
        const [, j] = wave(k, a);
        return j < 0 ? GREY : onWheel(s.drops[j].pc, 0.65, 0.95);
      },
      centre: () => [0, 0],
      ground: () => hue(200, 0.45, 0.05),
      emblem: () => [{ circle: 1.12, v: 0.35 }, ...s.drops.map((d) => ({ dot: [d.x, d.y, 0.025] as const, v: 0.9 }))],
      blendIn: (x, k) => clamp01(x + 0.18 * Math.sin(k * 40) * x * (1 - x) * 4),
    };
  },
  label: (s) => `${s.drops.length} rings on the water`,
};
