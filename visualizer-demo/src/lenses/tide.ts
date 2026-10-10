/* Tide: the body fills like a basin. Beats pour water in and time drains
   it away, so a busy passage floods the body and a sparse one leaves it
   nearly dry. The water stays level — the body does not turn.

     beat        raises the water
     key change  brings a spring tide: for the next sixteen beats every rise
                 is doubled

   Colour is depth: the key's colour at the surface, darker and further
   round the wheel toward the bottom. It fades in from below. */

import { blend, fifthsHue, hue, onWheel } from "../law/light";
import { type Lens, type Seen, clamp01, seen, ticks, toXY } from "./lens";

export const RISE = 0.06;
export const DRAIN = 0.035;

export interface TideState {
  readonly seen: Seen;
  /** 0 empty .. 1 brim-full */
  readonly level: number;
  /** beats of spring tide left */
  readonly spring: number;
}

export const tide: Lens<TideState> = {
  id: "tide", title: "Tide",
  idea: "Beats pour water into the body and time drains it; a key change brings a spring tide.",
  state(f, prev) {
    const t = ticks(f, prev?.seen ?? null);
    let level = Math.max(0, (prev?.level ?? 0.3) - DRAIN * t.dt);
    let spring = t.keyChange ? 16 : (prev?.spring ?? 0);
    if (t.beat) {
      level = Math.min(1, level + RISE * (spring > 0 ? 2 : 1));
      spring = Math.max(0, spring - 1);
    }
    return { seen: seen(f), level, spring };
  },
  view: (s) => {
    /* the surface, in the body's y (down is positive), with a slow swell */
    const surface = 1 - 2 * s.level;
    const top = onWheel(s.seen.tonic, 0.5, 0.95);
    const deep = hue(fifthsHue(s.seen.tonic) + 70, 0.75, 0.55);
    return {
      turn: () => 0,
      shell: (r) => r,
      motes: (n) => n,
      divergence: (d) => d,
      folds: () => 1,
      place: (k, a) => {
        const [x, y] = toXY(k, a);
        const swell = 0.04 * Math.sin(x * 7 + s.seen.t * 1.6);
        return { k, a, v: y > surface + swell ? 1.15 : 0.1 };
      },
      colour: (k, a) => {
        const [, y] = toXY(k, a);
        return blend(top, deep, clamp01((y - surface) / 1.6));
      },
      centre: () => [0, 0],
      ground: () => hue(fifthsHue(s.seen.tonic) + 70, 0.5, 0.05),
      emblem: () => [
        { line: [1.3, -1, 1.3, 1], v: 0.4 },
        ...Array.from({ length: 11 }, (_, j) => ({ line: [1.26, -1 + j * 0.2, 1.34, -1 + j * 0.2] as const, v: 0.3 })),
        { dot: [1.3, surface, 0.04], v: 1 },
      ],
      rings: () => [],
      words: () => null,
      blendIn: (x) => clamp01(x * x * (3 - 2 * x)),
    };
  },
  label: (s) => `water ${Math.round(s.level * 100)}%${s.spring ? ` · spring tide, ${s.spring} beats` : ""}`,
};
