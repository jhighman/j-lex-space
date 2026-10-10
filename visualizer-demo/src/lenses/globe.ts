/* Globe: the body as a sphere, in orthographic projection, lit like a
   planet.

   Motes are spread evenly over the sphere, and the twelve notes are painted
   round it as bands of longitude, in fifths order, so neighbouring bands
   are a fifth apart. Each band is the colour of its note and as bright as
   that note is sounding. Only the near half shows; a faint graticule of
   meridians and the equator turns with it.

     a beat       turns the globe a twenty-fourth of the way round
     a key change moves the sun: the light comes from the key's place on the
                  circle of fifths, and as it moves the terminator, the line
                  between day and night, sweeps across the globe

   The shading is brightness only: each mote is lit by the cosine of the
   angle between its surface and the sun, with a faint night side. So the
   key decides where the light falls, the notes decide the colours, and
   loudness changes neither. It fades in as the globe turns toward you. */

import { NOTE } from "../audio/key";
import { fifthsHue, hue, onWheel } from "../law/light";
import { type Lens, type Mark, type Seen, clamp01, seen, ticks, toPolar } from "./lens";

export const MOTES = 1400;
/** the sphere's radius, as a fraction of the body */
export const SPHERE = 0.9;
export const TILT = 0.38;
export const SUN_SECONDS = 1.5;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

export interface GlobeState {
  readonly seen: Seen;
  readonly chroma: readonly number[];
  /** turns of the globe: a twenty-fourth a beat, with the phase between */
  readonly spin: number;
  /** the sun's angle round the screen, in turns, and where it is moving from */
  readonly sunTo: number;
  readonly sunFrom: number;
  readonly sunSince: number;
}

type V3 = [number, number, number];
const norm = ([x, y, z]: V3): V3 => { const m = Math.hypot(x, y, z) || 1; return [x / m, y / m, z / m]; };
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** mote i's latitude and longitude on an evenly covered sphere */
export function onSphere(i: number): { lat: number; lon: number } {
  const j = ((i % MOTES) + MOTES) % MOTES;
  const y = 1 - (2 * (j + 0.5)) / MOTES;
  return { lat: Math.asin(y), lon: (((j * GOLDEN) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) };
}

/** a point on the globe in view space: x right, y up, z toward the viewer */
export function project(lat: number, lon: number, spin: number): V3 {
  const l = lon + spin * 2 * Math.PI;
  const x = Math.cos(lat) * Math.sin(l), y = Math.sin(lat), z = Math.cos(lat) * Math.cos(l);
  return [x, y * Math.cos(TILT) - z * Math.sin(TILT), y * Math.sin(TILT) + z * Math.cos(TILT)];
}

/** the note painted at a longitude: twelve bands round the globe, by fifths */
export const noteAt = (lon: number) => (Math.floor((lon / (2 * Math.PI)) * 12) % 12) * 7 % 12;

/** the direction the light comes from, in view space, for a sun angle in turns */
export function sunAt(turns: number): V3 {
  const a = turns * 2 * Math.PI;
  return norm([Math.cos(a) * 0.75, -Math.sin(a) * 0.75, 0.62]);
}

/** where the sun is at a moment, part of the way along the short way round */
export function sunNow(s: GlobeState, t: number): number {
  const k = t < s.sunSince ? 1 : clamp01((t - s.sunSince) / SUN_SECONDS);
  let d = (s.sunTo - s.sunFrom) % 1;
  if (d > 0.5) d -= 1;
  if (d < -0.5) d += 1;
  return s.sunFrom + d * (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
}

/** a view-space point as the body's polar coordinates (screen y is down) */
const screen = ([x, y]: V3): [number, number] => toPolar(x * SPHERE, -y * SPHERE);

export const globe: Lens<GlobeState> = {
  id: "globe", title: "Globe",
  idea: "The notes painted round a turning globe, lit by a sun that sits where the key is.",
  state(f, prev) {
    const t = ticks(f, prev?.seen ?? null);
    const key = fifthsHue(f.harmony.tonic) / 360;
    /* the beat clock's phase can step back when the tempo estimate changes;
       a globe that turned backwards for it would judder, so the turn only
       goes forward, unless the song itself has gone back */
    const raw = (f.rhythm.beats + f.rhythm.phase) / 24;
    const spin = prev && f.t >= prev.seen.t ? Math.max(prev.spin, raw) : raw;
    if (!prev) return { seen: seen(f), chroma: f.harmony.chroma.slice(), spin, sunTo: key, sunFrom: key, sunSince: f.t };
    const moved = t.keyChange || prev.sunTo !== key;
    return {
      seen: seen(f), chroma: f.harmony.chroma.slice(), spin,
      sunTo: key,
      sunFrom: moved ? sunNow(prev, f.t) : prev.sunFrom,
      sunSince: moved ? f.t : prev.sunSince,
    };
  },
  view: (s) => {
    const light = sunAt(sunNow(s, s.seen.t));
    /* a polyline on the sphere, as line marks for the part that faces us */
    const curve = (points: V3[], v: number): Mark[] => {
      const out: Mark[] = [];
      for (let j = 1; j < points.length; j++) {
        const a = points[j - 1], b = points[j];
        if (a[2] <= 0 || b[2] <= 0) continue;
        out.push({ line: [a[0] * SPHERE, -a[1] * SPHERE, b[0] * SPHERE, -b[1] * SPHERE], v });
      }
      return out;
    };
    const steps = (n: number) => Array.from({ length: n + 1 }, (_, j) => j / n);
    return {
      turn: () => 0,
      shell: () => SPHERE,
      motes: () => MOTES,
      divergence: (d) => d,
      folds: () => 1,
      place: (_k, _a, i) => {
        const { lat, lon } = onSphere(i);
        const p = project(lat, lon, s.spin);
        if (p[2] <= 0) return { k: 0, a: 0, v: 0 };
        const [k, a] = screen(p);
        const lit = Math.max(0, dot(p, light));
        const loud = 0.35 + 0.65 * clamp01(s.chroma[noteAt(lon)]);
        return { k, a, v: 0.07 + 1.35 * lit * loud };
      },
      colour: (_k, _a, i) => onWheel(noteAt(onSphere(i).lon), 0.62, 0.95),
      centre: () => [0, 0],
      ground: () => hue(232, 0.4, 0.035),
      emblem: (): Mark[] => {
        const marks: Mark[] = [];
        /* the twelve meridians between the note bands, and the equator */
        for (let m = 0; m < 12; m++)
          marks.push(...curve(steps(24).map((u) => project(-Math.PI / 2 + u * Math.PI, (m / 12) * 2 * Math.PI, s.spin)), 0.18));
        marks.push(...curve(steps(48).map((u) => project(0, u * 2 * Math.PI, s.spin)), 0.28));
        /* the terminator: the great circle square to the light */
        const side = norm(Math.abs(light[1]) < 0.9 ? [light[2], 0, -light[0]] : [0, light[2], -light[1]]);
        const up: V3 = [light[1] * side[2] - light[2] * side[1], light[2] * side[0] - light[0] * side[2], light[0] * side[1] - light[1] * side[0]];
        marks.push(...curve(steps(64).map((u) => {
          const c = Math.cos(u * 2 * Math.PI), d = Math.sin(u * 2 * Math.PI);
          return [side[0] * c + up[0] * d, side[1] * c + up[1] * d, side[2] * c + up[2] * d] as V3;
        }), 0.9));
        /* the point under the sun */
        if (light[2] > 0) marks.push({ dot: [light[0] * SPHERE, -light[1] * SPHERE, 0.02], v: 1 });
        return marks;
      },
      /* it turns in toward you */
      blendIn: (x, k) => clamp01(x * 1.4 - (1 - k) * 0.4),
      words: () => null,
      rings: () => [],
    };
  },
  label: (s) => {
    const loud = s.chroma.map((v, pc) => [v, pc] as const).filter(([v]) => v > 0.6).map(([, pc]) => NOTE[pc]);
    return `the sun over ${NOTE[Math.round(s.sunTo * 12 * 7) % 12]} · ${Math.round((s.spin % 1) * 360)}° round · lit: ${loud.join(" ") || "nothing loud"}`;
  },
};
