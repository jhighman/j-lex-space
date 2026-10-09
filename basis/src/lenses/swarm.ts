/* Swarm: the motes are a flock. A beat scatters them; between beats they
   draw back together round a point. A fast rhythm keeps the flock loose; a
   slow one lets it gather into a tight ball.

     beat        scatters the flock
     key change  moves the point the flock gathers round

   Colour is the flock's: one colour from the key, deeper when it is
   gathered and paler when it is scattered. It fades in mote by mote, each
   one arriving on its own. */

import { onWheel } from "../law/light";
import { type Lens, type Seen, hash01, seen, ticks } from "./lens";

export const KICK = 0.35;
export const CALM = 1.4;

export interface SwarmState {
  readonly seen: Seen;
  /** 0 gathered .. 1 scattered */
  readonly spread: number;
  /** where the flock gathers, in turns round the body */
  readonly home: number;
}

export const swarm: Lens<SwarmState> = {
  id: "swarm", title: "Swarm",
  idea: "Each beat scatters the flock and it regathers; a key change moves where it gathers.",
  state(f, prev) {
    const t = ticks(f, prev?.seen ?? null);
    let spread = (prev?.spread ?? 0.2) * Math.exp(-CALM * t.dt);
    if (t.beat) spread = Math.min(1, spread + KICK);
    const home = !prev || t.keyChange ? f.harmony.tonic / 12 : prev.home;
    return { seen: seen(f), spread, home };
  },
  view: (s) => {
    const off: [number, number] = [0.18 * Math.cos(s.home * 2 * Math.PI), 0.18 * Math.sin(s.home * 2 * Math.PI)];
    return {
      turn: (x) => x * 0.6,
      shell: (r) => r * (0.7 + 0.5 * s.spread),
      motes: (n) => n,
      divergence: (d) => d,
      folds: (k) => k,
      place: (k, a, i) => ({
        k: Math.min(1.25, k * (0.45 + 0.55 * s.spread) + s.spread * 0.5 * hash01(i)),
        a: a + s.spread * 0.25 * (hash01(i + 7) - 0.5),
        v: 1,
      }),
      colour: () => onWheel(s.seen.tonic, 0.3 + 0.5 * (1 - s.spread), 0.95),
      centre: () => off,
      ground: () => onWheel(s.seen.tonic, 0.3, 0.05),
      emblem: () => [{ dot: [0, 0, 0.03], v: 0.8 }, { circle: 0.08, v: 0.4 }],
      blendIn: (x, k) => (x >= hash01(Math.round(k * 997)) ? 1 : 0),
    };
  },
  label: (s) => `${s.spread > 0.5 ? "scattered" : "gathered"} · ${Math.round(s.spread * 100)}%`,
};
