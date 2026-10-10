/* Colour and light, and who may change which.

   1. With no lens, no colour: the body is grey until a lens is chosen.
   2. A lens chooses the colours. It builds them from its own state — the
      notes sounding, a count of beats, a temperature — and never from how
      loud the music is.
   3. Loudness changes brightness only. `luxOf` turns the dynamics into
      one number and `shade` can only scale a colour's value by it, so a
      beat that brightens the body cannot change what colour it is.
      `tests/lenses.test.ts` plays every lens loud and quiet and requires
      the colours to agree.
   4. Consonance sets saturation. The interval sounding above the key
      (`interval`) is a degree of calm: the perfect intervals leave every
      colour as the lens drew it, and the dissonant ones pull it toward
      grey. `calmOf` turns the harmony into that one number and `shade`
      scales saturation by it, so hue is still the lens's alone, and
      loudness still reaches value and nothing else.
   5. The hand never colours. It moves shapes; `tests/channel.test.ts`
      keeps colour out of `src/hand/`.

   The wheel lenses use for notes is the circle of fifths, so keys a fifth
   apart sit side by side and a tritone is the opposite colour. A lens may
   ignore the wheel altogether: Frost and Kiln do. */

import type { Dynamics, Harmony } from "../audio/frame";
import { interval } from "../audio/key";

declare const albedo: unique symbol;

/** a surface colour in HSV. Branded: only the constructors here make one. */
export type Albedo = { readonly h: number; readonly s: number; readonly v: number } & { readonly [albedo]: true };

export interface RGB { readonly r: number; readonly g: number; readonly b: number }

const make = (h: number, s: number, v: number) =>
  Object.freeze({ h: ((h % 360) + 360) % 360, s: Math.max(0, Math.min(1, s)), v: Math.max(0, Math.min(1, v)) }) as Albedo;

/** a colour chosen by a person, not by the music */
export const authored = (h: number, s: number, v: number): Albedo => make(h, s, v);

/** the body with no lens: grey, with no cast anywhere */
export const GREY = make(220, 0, 0.78);
export const GREY_GROUND = make(220, 0, 0.06);

/** where a pitch class sits on the wheel: C at the top, a fifth per step */
export const fifthsHue = (pc: number) => ((((pc * 7) % 12) + 12) % 12) * 30;

/** a note on the wheel, at a saturation and value the lens chooses */
export const onWheel = (pc: number, s = 0.62, v = 0.9): Albedo => make(fifthsHue(pc), s, v);

/** any hue a lens names outright */
export const hue = (h: number, s = 0.62, v = 0.9): Albedo => make(h, s, v);

/** part of the way from one colour to another, the short way round the wheel */
export function blend(a: Albedo, b: Albedo, x: number): Albedo {
  if (x <= 0) return a;
  if (x >= 1) return b;
  /* a grey has no hue to travel from, so it takes the other's */
  const ha = a.s < 0.02 ? b.h : a.h, hb = b.s < 0.02 ? a.h : b.h;
  let d = (hb - ha) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return make(ha + d * x, a.s + (b.s - a.s) * x, a.v + (b.v - a.v) * x);
}

/** the most the music may lift or dim the light, either way */
export const SWING = 0.25;

/* With nothing playing the light is exactly 1, the colours as drawn. A
   quiet passage dims them a little and a loud beat lifts them a little,
   never more than a quarter either way. */
export function luxOf(d: Dynamics | null): number {
  if (!d) return 1;
  const e = Math.max(0, Math.min(1, d.energy));
  const k = Math.max(0, Math.min(1, d.beat));
  return 0.84 + 0.2 * e + 0.18 * k;
}

/**
 * How calm each interval above the key is, by semitones: the saturation it
 * leaves. Unison, fourth, fifth and octave are perfect and leave colour
 * whole; thirds and sixths nearly so; seconds and sevenths less; the minor
 * second, major seventh and tritone least. The order is the textbook one of
 * consonance; the numbers are chosen so the most dissonant interval still
 * keeps its hue legible.
 */
export const CALM: readonly number[] = [1, 0.42, 0.68, 0.86, 0.9, 0.96, 0.38, 1, 0.84, 0.88, 0.66, 0.48];

/* With nothing playing there is no interval, and colour is as drawn. */
export function calmOf(h: Harmony | null): number {
  if (!h) return 1;
  return CALM[interval(h.chroma, h.tonic)];
}

/** the most the key field may saturate a ground */
export const FIELD_SATURATION = 0.5;

/**
 * A ground from the key field: every key's weight placed at its tonic on
 * the circle of fifths and added as a vector. The direction is the hue; how
 * much the keys agree is the saturation, so two keys a fifth apart blend to
 * the colour between them, and two far apart cancel toward grey. The value
 * is the lens's own.
 */
export function fieldGround(weights: readonly number[], v: number): Albedo {
  let x = 0, y = 0, sum = 0;
  for (let pc = 0; pc < 12; pc++) {
    const a = (fifthsHue(pc) * Math.PI) / 180;
    x += weights[pc] * Math.cos(a);
    y += weights[pc] * Math.sin(a);
    sum += weights[pc];
  }
  if (sum <= 0) return make(0, 0, v);
  return make((Math.atan2(y, x) * 180) / Math.PI, FIELD_SATURATION * Math.hypot(x, y) / sum, v);
}

function hsvToRgb(h: number, s: number, v: number): RGB {
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] :
    h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return { r: r + m, g: g + m, b: b + m };
}

/* All that the music may do to a colour once a lens has chosen it: light
   scales value, and calm scales saturation. Hue comes back untouched, and
   there is no parameter through which anything else could arrive. */
export function shade(a: Albedo, lux: number, calm = 1): RGB {
  return hsvToRgb(a.h, a.s * Math.max(0, Math.min(1, calm)), Math.max(0, Math.min(1, a.v * lux)));
}

export const css = (c: RGB, alpha = 1) =>
  `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${alpha})`;
