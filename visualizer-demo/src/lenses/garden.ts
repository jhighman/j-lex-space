/* Garden: stems grow out from the centre, one at a time. Beats lengthen
   the stem that is growing; a key change plants a new one, pointing at the
   new key, and the old stems stay where they are. A piece that modulates
   ends as a garden of differently coloured stems; a piece that does not
   ends as one long stem.

     beat        grows the current stem
     key change  plants a new stem

   Colour is the key each stem was planted in, paler at the tip. It fades
   in by growing out from the centre. */

import { fifthsHue, hue, onWheel } from "../law/light";
import { type Lens, type Seen, clamp01, seen, ticks } from "./lens";

export const GROW = 0.06;
const MAX = 8;

export interface Stem { readonly angle: number; readonly pc: number; readonly length: number }

export interface GardenState {
  readonly seen: Seen;
  readonly stems: readonly Stem[];
}

export const garden: Lens<GardenState> = {
  id: "garden", title: "Garden",
  idea: "Beats grow a stem; each key change plants a new one in its own colour, and the old ones stay.",
  state(f, prev) {
    const t = ticks(f, prev?.seen ?? null);
    const plant = (): Stem => ({ angle: fifthsHue(f.harmony.tonic) / 360 - 0.25, pc: f.harmony.tonic, length: 0.08 });
    let stems = prev?.stems ?? [plant()];
    if (t.keyChange) stems = [...stems, plant()].slice(-MAX);
    if (t.beat) stems = stems.map((s, j) => (j === stems.length - 1 ? { ...s, length: Math.min(1, s.length + GROW) } : s));
    return { seen: seen(f), stems };
  },
  view: (s) => ({
    turn: () => 0,
    shell: (r) => 0.35 + 0.5 * Math.max(...s.stems.map((st) => st.length)) + (r - 0.4) * 0.1,
    motes: (n) => Math.max(800, n),
    divergence: (d) => d,
    folds: () => 1,
    place: (k, _a, i) => {
      const st = s.stems[i % s.stems.length];
      /* along the stem, with a gentle curve and leaflets off every fifth mote */
      const u = k / 0.94;
      const leaf = i % 5 === 0 ? 0.045 * u * (i % 10 === 0 ? 1 : -1) : 0;
      return { k: u * 0.95, a: st.angle + 0.05 * Math.sin(u * 5 + st.pc) + leaf, v: u <= st.length ? 1.15 : 0 };
    },
    colour: (k, _a, i) => {
      const st = s.stems[i % s.stems.length];
      return onWheel(st.pc, 0.65 - 0.3 * k, 0.8 + 0.18 * k);
    },
    centre: () => [0, 0],
    ground: () => hue(95, 0.35, 0.05),
    emblem: () => [{ dot: [0, 0, 0.05], v: 0.7 }, { circle: 0.1, v: 0.3 }],
    rings: () => [],
    words: () => null,
    blendIn: (x, k) => clamp01((x - k * 0.5) * 2),
  }),
  label: (s) => `${s.stems.length} stem${s.stems.length > 1 ? "s" : ""} · growing ${Math.round(s.stems[s.stems.length - 1].length * 100)}%`,
};
