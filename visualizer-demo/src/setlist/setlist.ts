/* A setlist: the scenes of a performance, in order, written before the
   track is chosen. Each scene says what moment of the music it wants —
   the peak, a build, a new key — never when, because when depends on the
   track. Fitting the setlist to a track (`fit.ts`) finds the times.

   A scene may also say which lens it shows and a caption to put on
   screen. `check` lists everything wrong with a setlist in plain words,
   and refuses one that gives times. */

import { LENSES } from "../lenses";

/* **Moments** pick one place by ranking the whole track: there is only one
   peak. A setlist written in moments fits one track well and others
   badly. */
export const MOMENTS = [
  "the start", "the peak", "the lull", "the brightest", "the darkest",
  "a new key", "a boundary", "next",
] as const;

/* **Shapes** describe a stretch rather than rank the track, and most
   tracks have some of each, so a setlist written in shapes fits tracks it
   has never heard. The first six follow loudness, the last two
   brightness. */
export const SHAPES = [
  "a build", "a release", "a jump", "a drop", "a dip", "a plateau",
  "getting brighter", "getting darker",
] as const;

export const ASKS: readonly string[] = [...MOMENTS, ...SHAPES];
export type Ask = (typeof MOMENTS)[number] | (typeof SHAPES)[number];

/** how many parts of the track a scene reserves */
export const SPANS: Readonly<Record<string, number>> = {
  "one part": 1,
  "two parts": 2,
  "three parts": 3,
  "to the end": Infinity,
};

/* Rules are checked after fitting and can fail. They say what the setlist
   needed to be true of the whole performance, so a failure is worth
   reading. */
export const RULES = ["in order", "end on the lull", "nothing missing", "scenes at least N seconds"] as const;
const AT_LEAST = /^scenes at least (\d+(?:\.\d+)?) seconds$/;

export interface Scene {
  readonly name: string;
  readonly asks: Ask;
  readonly span?: string;
  /** a lens id, or "none" for the grey body */
  readonly lens?: string;
  readonly caption?: string;
}

export interface Setlist {
  readonly title: string;
  readonly note?: string;
  readonly rules?: readonly string[];
  readonly scenes: readonly Scene[];
}

const TIME_KEYS = new Set(["at", "time", "start", "end", "until", "seconds", "from", "to", "duration"]);
const TIME_TEXT = /\b\d+(?:\.\d+)?\s*(?:s|sec|secs|seconds|ms)\b|\b\d+:\d{2}\b/i;

export const lensIds = () => ["none", ...LENSES.map((l) => l.id)];

/** everything wrong with a setlist, in words; empty when it can be fitted */
export function check(input: unknown): string[] {
  const out: string[] = [];
  if (!input || typeof input !== "object") return ["a setlist is an object with a title and scenes"];
  const set = input as Record<string, unknown>;
  if (typeof set.title !== "string" || !set.title.trim()) out.push("the setlist has no title");
  if (!Array.isArray(set.scenes) || set.scenes.length === 0) return [...out, "the setlist has no scenes"];
  if (set.scenes.length > 16) out.push("sixteen scenes at most");

  const names = new Set<string>();
  const lenses = lensIds();
  set.scenes.forEach((raw, n) => {
    const where = `scene ${n + 1}`;
    if (!raw || typeof raw !== "object") { out.push(`${where} is not an object`); return; }
    const s = raw as Record<string, unknown>;
    const name = typeof s.name === "string" && s.name.trim() ? `“${s.name}”` : where;
    if (typeof s.name !== "string" || !s.name.trim()) out.push(`${where} has no name`);
    else if (names.has(s.name)) out.push(`two scenes are called “${s.name}”`);
    else names.add(s.name);

    for (const k of Object.keys(s))
      if (TIME_KEYS.has(k.toLowerCase())) out.push(`${name} gives a time (“${k}”): say what moment it wants, and fitting will find when`);
    for (const k of ["asks", "span"] as const)
      if (typeof s[k] === "string" && TIME_TEXT.test(s[k] as string)) out.push(`${name}'s ${k} gives a time: say what moment it wants, not when`);

    if (typeof s.asks !== "string" || !ASKS.includes(s.asks))
      out.push(`${name} asks for “${String(s.asks)}”, which the analysis cannot find; it may ask for ${ASKS.map((w) => `“${w}”`).join(", ")}`);
    if (s.span !== undefined && (typeof s.span !== "string" || !(s.span in SPANS)))
      out.push(`${name} spans “${String(s.span)}”; a span is one of ${Object.keys(SPANS).map((h) => `“${h}”`).join(", ")}`);
    if (s.lens !== undefined && (typeof s.lens !== "string" || !lenses.includes(s.lens)))
      out.push(`${name} shows “${String(s.lens)}”, which is not a lens; the lenses are ${lenses.join(", ")}`);
    if (s.caption !== undefined && typeof s.caption !== "string") out.push(`${name} has a caption that is not text`);
  });

  if (set.rules !== undefined) {
    if (!Array.isArray(set.rules)) out.push("rules are a list");
    else for (const r of set.rules)
      if (typeof r !== "string" || !(RULES.includes(r as never) || AT_LEAST.test(r))) out.push(`no such rule “${String(r)}”`);
  }
  return out;
}

export const atLeast = (rule: string): number | null => {
  const m = AT_LEAST.exec(rule);
  return m ? Number(m[1]) : null;
};
