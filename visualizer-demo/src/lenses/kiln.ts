/* Kiln: the body is heated by the beat and cools in the quiet between.
   Its colour is the colour of its heat — dull red, orange, yellow, white —
   so how hot it has got is how much has been played lately, never how loud
   it was. Hot, the body churns.

     beat        adds heat
     key change  opens a draft: half the heat goes at once

   Colour ignores the key: it is the glow of a body at that temperature,
   hottest at the core. It fades in like something warming up. */

import { type Albedo, hue } from "../law/light";
import { type Lens, type Seen, clamp01, seen, ticks } from "./lens";

export const HEAT = 0.05;
export const COOL = 7;

export interface KilnState {
  readonly seen: Seen;
  /** 0 cold .. 1 white-hot */
  readonly heat: number;
}

/** the glow of a body at a heat between 0 and 1 */
export function glow(h: number): Albedo {
  const x = clamp01(h);
  if (x < 0.35) return hue(2 + 20 * (x / 0.35), 0.95, 0.35 + 0.6 * (x / 0.35));
  if (x < 0.7) return hue(22 + 30 * ((x - 0.35) / 0.35), 0.95 - 0.3 * ((x - 0.35) / 0.35), 0.95);
  if (x < 0.9) return hue(52, 0.65 - 0.6 * ((x - 0.7) / 0.2), 1);
  return hue(210, 0.2 * ((x - 0.9) / 0.1), 1);
}

export const kiln: Lens<KilnState> = {
  id: "kiln", title: "Kiln",
  idea: "Beats heat the body and quiet cools it; its colour is its temperature.",
  state(f, prev) {
    const t = ticks(f, prev?.seen ?? null);
    let heat = (prev?.heat ?? 0.15) * Math.exp(-t.dt / COOL);
    if (t.beat) heat = Math.min(1, heat + HEAT);
    if (t.keyChange) heat *= 0.5;
    return { seen: seen(f), heat };
  },
  view: (s) => ({
    turn: (x) => x * 0.3,
    shell: (r) => r * (0.85 + 0.25 * s.heat),
    motes: (n) => n,
    divergence: (d) => d,
    folds: (k) => k,
    place: (k, a) => ({
      /* convection: hot bodies churn in cells */
      k: k * (0.94 + 0.06 * s.heat * Math.sin(a * 2 * Math.PI * 6 + s.seen.t * 1.3)),
      a: a + 0.02 * s.heat * Math.sin(k * 14 + s.seen.t * 1.7),
      v: 0.55 + 0.6 * s.heat,
    }),
    colour: (k) => glow(s.heat * (1.15 - 0.45 * k)),
    centre: () => [0, 0],
    ground: () => hue(8, 0.7, 0.04 + 0.04 * s.heat),
    emblem: () => [
      { arc: [1.2, 0.62, 0.88], v: 0.3 },
      { arc: [1.2, 0.62, 0.62 + 0.26 * s.heat], v: 1 },
    ],
    rings: () => [],
    words: () => null,
    blendIn: (x) => clamp01(Math.pow(x, 0.7)),
  }),
  label: (s) => `${Math.round(700 + s.heat * 5800)} K`,
};
