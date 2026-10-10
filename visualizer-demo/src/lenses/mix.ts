/* Two lenses at once: the crossfader.

   Both lenses answer for the same mote and the answers are interpolated,
   so a half-way mix shows nothing that neither lens showed. A count of
   folds cannot be half of anything, so it belongs to whichever lens is
   nearer.

   How far along each mote is depends on the lenses, not only the fader:
   each one says how it fades in (`blendIn`) — Frost freezes outward,
   Swarm arrives mote by mote, Prism wedge by wedge — and a mote's progress
   is the average of the incoming lens's manner and the outgoing one's in
   reverse. The same fader position is a different picture for every
   pair. */

import { blend } from "../law/light";
import type { View } from "./lens";

const lerp = (a: number, b: number, x: number) => a + (b - a) * x;

/** the shorter way round between two turns */
export function turnLerp(a: number, b: number, x: number): number {
  let d = (b - a) % 1;
  if (d > 0.5) d -= 1;
  if (d < -0.5) d += 1;
  return a + d * x;
}

export function mix(a: View, b: View, x: number): View {
  if (x <= 0) return a;
  if (x >= 1) return b;
  const w = (k: number) => (b.blendIn(x, k) + 1 - a.blendIn(1 - x, k)) / 2;
  const wm = w(0.5);
  const ca = a.centre(), cb = b.centre();
  return {
    turn: (t) => turnLerp(a.turn(t), b.turn(t), wm),
    shell: (r) => lerp(a.shell(r), b.shell(r), wm),
    motes: (n) => Math.round(lerp(a.motes(n), b.motes(n), wm)),
    divergence: (d) => lerp(a.divergence(d), b.divergence(d), wm),
    folds: (k) => (wm < 0.5 ? a.folds(k) : b.folds(k)),
    place: (k, an, i) => {
      const p = a.place(k, an, i), q = b.place(k, an, i), m = w(k);
      return { k: lerp(p.k, q.k, m), a: turnLerp(p.a, q.a, m), v: lerp(p.v, q.v, m) };
    },
    colour: (k, an, i) => blend(a.colour(k, an, i), b.colour(k, an, i), w(k)),
    centre: () => [lerp(ca[0], cb[0], wm), lerp(ca[1], cb[1], wm)],
    ground: () => blend(a.ground(), b.ground(), wm),
    /* the emblems are drawn by the body, each at its own deck's share */
    emblem: () => [],
    blendIn: (t) => t,
    words: () => (wm < 0.5 ? a.words() : b.words()),
  };
}
