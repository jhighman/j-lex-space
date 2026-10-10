/* Bridson: the body fills with evenly spaced points, growing on the beat,
   by Bridson's algorithm for Poisson-disc sampling (`poisson.ts`).

     a beat       runs one round: every active point tries thirty candidates
                  in the ring around it, so the frontier spreads outward a
                  step at a time, like lichen. Active points glow; settled
                  ones dim.
     a key change clears a patch where the new key sits on the circle of
                  fifths and seeds a new growth there, in the new key's
                  colour, which grows back into the clearing
     at rest      once nothing has grown for four beats, a smaller patch
                  clears where the loudest note sits and regrows, so the
                  melody keeps working the lichen between key changes

   So a song with key changes leaves a patchwork, a map of where its
   harmony has been. The randomness is seeded and kept in the state, so the
   same music grows the same pattern. Colour is the key of each growth, and
   the ground under it takes a dark tint of the newest; faint lines show
   which point each new one grew from. */

import { NOTE } from "../audio/key";
import { fifthsHue, hue, onWheel } from "../law/light";
import { type Lens, type Mark, type Seen, clamp01, loudest, seen, ticks, toPolar } from "./lens";
import { type Sample, round, seedAt } from "./poisson";

/** the minimum distance between points, in units of the disc */
export const R = 0.05;
export const MAX = 1400;
export const CLEARING = 0.38;
/** the disc's radius, as a fraction of the body */
export const DISC = 0.92;
/** beats with nothing growing before the loudest note clears a patch */
export const REST = 4;
export const RENEWAL = 0.22;

export interface BridsonState {
  readonly seen: Seen;
  readonly samples: readonly Sample[];
  readonly seed: number;
  /** rounds run so far */
  readonly rounds: number;
  /** the key of the newest growth */
  readonly key: number;
  /** beats since anything grew */
  readonly idle: number;
}

export const bridson: Lens<BridsonState> = {
  id: "bridson", title: "Bridson",
  idea: "Evenly spaced points growing outward a step each beat; every key change clears a patch and grows it back in its own colour.",
  state(f, prev) {
    const t = ticks(f, prev?.seen ?? null);
    if (!prev) {
      return { seen: seen(f), samples: [{ x: 0, y: 0, pc: f.harmony.tonic, born: 0, active: true, parent: -1 }], seed: 20260 + f.harmony.tonic, rounds: 0, key: f.harmony.tonic, idle: 0 };
    }
    let { samples, seed, rounds, key, idle } = prev;
    const patch = (pc: number, r: number, clearing: number) => {
      const a = (fifthsHue(pc) / 360) * 2 * Math.PI - Math.PI / 2;
      samples = seedAt(samples, r * Math.cos(a), r * Math.sin(a), clearing, key, rounds);
    };
    if (t.keyChange) {
      key = f.harmony.tonic;
      patch(key, 0.5, CLEARING);
      idle = 0;
    }
    if (t.beat) {
      rounds++;
      idle = samples.some((p) => p.active) ? 0 : idle + 1;
      if (idle >= REST) { patch(loudest(f.harmony.chroma), 0.68, RENEWAL); idle = 0; }
      ({ samples, seed } = round(samples, R, seed, rounds, MAX));
    }
    return { seen: seen(f), samples, seed, rounds, key, idle };
  },
  view: (s) => {
    const active = s.samples.filter((p) => p.active);
    return {
      turn: () => 0,
      shell: () => DISC,
      motes: () => MAX,
      divergence: (d) => d,
      folds: () => 1,
      place: (_k, _a, i) => {
        const p = s.samples[i];
        if (!p) return { k: 0, a: 0, v: 0 };
        const [k, a] = toPolar(p.x * DISC, p.y * DISC);
        const age = s.rounds - p.born;
        return { k, a, v: p.active ? 1.55 : age < 2 ? 1.2 : 0.75 };
      },
      colour: (_k, _a, i) => {
        const p = s.samples[i];
        return p ? onWheel(p.pc, p.active ? 0.8 : 0.5, 0.95) : hue(0, 0, 0.5);
      },
      centre: () => [0, 0],
      ground: () => onWheel(s.key, 0.45, 0.05),
      emblem: (): Mark[] => [
        { circle: DISC, v: 0.3 },
        /* the newest links: which point each grew from */
        ...s.samples.flatMap((p) => {
          const q = s.samples[p.parent];
          return q && s.rounds - p.born < 6 ? [{ line: [q.x * DISC, q.y * DISC, p.x * DISC, p.y * DISC] as const, v: 0.4 }] : [];
        }),
        /* the frontier, each active point with its disc */
        ...active.slice(0, 240).map((p) => ({ dot: [p.x * DISC, p.y * DISC, (R / 2) * DISC] as const, v: 0.35 })),
      ],
      /* it grows in from the rim */
      blendIn: (x, k) => clamp01((x - 0.5 * (1 - k)) * 2),
      words: () => null,
      rings: () => [],
    };
  },
  label: (s) => {
    const keys = [...new Set(s.samples.map((p) => p.pc))].map((pc) => NOTE[pc]);
    return `${s.samples.length} points · ${s.samples.filter((p) => p.active).length} growing · ${keys.join(" ")}`;
  },
};
