/* A lens: one way of turning the music into the body.

   Every lens reads the same frames. What makes one lens different from
   another is not its colours or its numbers but what it *does* when
   something happens — what a beat changes, and what a key change changes —
   so each one here keeps its own state, steps it on those two events, and
   is tested against all the others on the same music.

   `state` is a pure function of one sounding frame and the lens's last
   state, so a test can hand it literals and get the same answer every
   time. `view` tells the body how to draw that state: where each mote
   sits, how lit it is, what colour it is, plus a faint emblem described as
   data. A lens is never handed a canvas or the audio, so the only way it
   can reach the picture is through these answers.

   No lens is a defined state: `PLAIN` draws the grey body. When nothing is
   playing there is no state to read, and the view is `PLAIN`. */

import type { Sounding } from "../audio/frame";
import { type Albedo, GREY, GREY_GROUND } from "../law/light";

/** a mark on a lens's emblem, in units of the body's radius, angles in turns */
export type Mark =
  | { readonly circle: number; readonly v?: number }
  | { readonly arc: readonly [r: number, from: number, to: number]; readonly v?: number }
  | { readonly line: readonly [x1: number, y1: number, x2: number, y2: number]; readonly v?: number }
  | { readonly dot: readonly [x: number, y: number, r: number]; readonly v?: number }
  | { readonly text: readonly [x: number, y: number, s: string]; readonly v?: number };

/** where a mote is drawn: radius 0..1 of the body, angle in turns, and a value */
export interface Place { readonly k: number; readonly a: number; readonly v: number }

export interface View {
  /** the body's turn, 0..1, given the beat clock's */
  turn(x: number): number;
  /** the shell's radius as a fraction of the half-height */
  shell(r: number): number;
  /** how many motes */
  motes(n: number): number;
  /** the angle between one mote and the next, in turns */
  divergence(d: number): number;
  /** how many times the body is mirrored round its centre; 1 is none */
  folds(k: number): number;
  /** where mote i, at radius k and angle a, is drawn, and how lit (0..1.5) */
  place(k: number, a: number, i: number): Place;
  /** the colour of mote i */
  colour(k: number, a: number, i: number): Albedo;
  /** where the body's centre stands, as a fraction of its radius */
  centre(): readonly [number, number];
  /** the ground the body stands on */
  ground(): Albedo;
  /** a faint emblem, drawn under the body */
  emblem(): readonly Mark[];
  /** how this lens fades in: x is the crossfader's progress toward it, k a
   *  mote's radius; returns that mote's progress */
  blendIn(x: number, k: number): number;
  /** words to set under the body, if the lens has any */
  words(): string | null;
  /** filled rings to draw in place of motes, if the lens draws any */
  rings(): readonly Ring[];
}

/** a filled arc of a ring: from x0 to x1 (turns, from the top), from radius
 *  r0 to r1 (fractions of the body), in a colour, lit by v */
export interface Ring {
  readonly x0: number;
  readonly x1: number;
  readonly r0: number;
  readonly r1: number;
  readonly colour: Albedo;
  readonly v: number;
  readonly label?: string;
  /** how much of it shows, for crossfades; 1 if not given */
  readonly alpha?: number;
}

/* What a lens may know beyond the frame: plain data, given by the page, so
   a lens stays a pure function a test can hand literals. */
export interface Context {
  /** the whole track as parts, once the analysis has finished */
  readonly parts?: readonly Part[] | null;
  /** the line Pulley is reading, when Pulley is on the other deck */
  readonly poemLine?: number | null;
}

export interface Part {
  readonly at: number;
  readonly until: number;
  readonly energy: number;
  readonly tonic: number;
  readonly minor: boolean;
}

export interface Lens<S> {
  readonly id: string;
  readonly title: string;
  /** one line on what it does, for the page */
  readonly idea: string;
  state(f: Sounding, prev: S | null, context?: Context): S;
  view(s: S): View;
  label(s: S): string;
}

export const PLAIN: View = Object.freeze({
  turn: (x: number) => x,
  shell: (r: number) => r,
  motes: (n: number) => n,
  divergence: (d: number) => d,
  folds: (k: number) => k,
  place: (k: number, a: number) => ({ k, a, v: 1 }),
  colour: () => GREY,
  centre: () => [0, 0] as const,
  ground: () => GREY_GROUND,
  emblem: () => [],
  blendIn: (x: number) => x,
  words: () => null,
  rings: () => [],
});

/** the golden angle, in turns */
export const GOLDEN = 1 - 2 / (1 + Math.sqrt(5));

export const steps = (x: number, n: number) => Math.round(x * n) / n;
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const frac = (x: number) => ((x % 1) + 1) % 1;

/** a fixed pseudo-random number in 0..1 for an integer, so motes keep their character */
export function hash01(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/** polar (radius, turns) to the body's x/y, and back */
export const toXY = (k: number, a: number): [number, number] => [k * Math.cos(a * 2 * Math.PI), k * Math.sin(a * 2 * Math.PI)];
export const toPolar = (x: number, y: number): [number, number] => [Math.hypot(x, y), frac(Math.atan2(y, x) / (2 * Math.PI))];

/* What happened since the last frame. A beat is a new onset on the
   analyser's count; a key change is its key moving, which the analyser
   holds for two seconds before it believes it. */
export interface Seen { readonly beats: number; readonly tonic: number; readonly minor: boolean; readonly t: number }

export interface Ticks { readonly beat: boolean; readonly keyChange: boolean; readonly beats: number; readonly dt: number }

export function ticks(f: Sounding, prev: Seen | null): Ticks {
  return {
    beats: f.rhythm.beats,
    beat: !!prev && f.rhythm.beats > prev.beats,
    keyChange: !!prev && (f.harmony.tonic !== prev.tonic || f.harmony.minor !== prev.minor),
    dt: prev ? Math.max(0, Math.min(0.5, f.t - prev.t)) : 0,
  };
}

export const seen = (f: Sounding): Seen => ({ beats: f.rhythm.beats, tonic: f.harmony.tonic, minor: f.harmony.minor, t: f.t });

export function loudest(ch: readonly number[]): number {
  let top = 0;
  for (let i = 1; i < 12; i++) if (ch[i] > ch[top]) top = i;
  return top;
}
