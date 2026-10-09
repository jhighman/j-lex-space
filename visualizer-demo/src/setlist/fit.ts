/* Fitting a setlist to one track: finding, for each scene, the part of the
   track that best gives it what it asks for, in order.

   Three outcomes, and all three are reported:

     found   the track has what the scene asked for, where it could use it
     close   it took the nearest thing, and the note says what it gave up
     missing the track has nothing like it; the scene still gets a place,
             because a gap in the performance is worse than a compromise,
             and the note says so

   Nothing is placed without a reason written down. The log of every
   choice can be copied out beside the plan.

   It reads an `Analysis` — plain numbers about the parts of the track —
   and nothing of the audio. */

import type { Analysis, Section } from "../audio/analyse";
import { keyName } from "../audio/key";
import type { TrackId } from "../marks/fingerprint";
import { SHAPES, SPANS, type Scene, type Setlist, atLeast, check } from "./setlist";

export type Outcome = "found" | "close" | "missing";

export interface Placed {
  readonly name: string;
  readonly asks: string;
  readonly span: string;
  readonly lens: string | null;
  readonly caption: string | null;
  readonly outcome: Outcome;
  readonly note: string;
  readonly at: number;
  readonly until: number;
  readonly part: number;
}

export interface RuleCheck { readonly rule: string; readonly holds: boolean; readonly note: string }

export interface Plan {
  readonly version: 1;
  /** the track these times belong to */
  readonly track: TrackId | null;
  readonly setlist: string;
  readonly note: string | null;
  readonly seconds: number;
  readonly scenes: readonly Placed[];
  readonly rules: readonly RuleCheck[];
  /** things said once about the whole setlist rather than per scene */
  readonly notes: readonly string[];
}

export type Fitted = { readonly ok: true; readonly plan: Plan } | { readonly ok: false; readonly problems: string[] };

const sec = (t: number) => `${t.toFixed(1)}s`;

interface Pick { readonly s: Section; readonly outcome: Outcome; readonly note: string }

const RANKED: Record<string, { by: "energy" | "bright"; sign: 1 | -1 }> = {
  "the peak": { by: "energy", sign: 1 },
  "the lull": { by: "energy", sign: -1 },
  "the brightest": { by: "bright", sign: 1 },
  "the darkest": { by: "bright", sign: -1 },
};

/* a shape is there at all when it moves more than this on a 0..1 scale,
   and clearly there at a tenth of the range */
const FAINT = 0.04;
const CLEAR = 0.1;

/** how strongly the stretch starting at part i has a shape */
function strength(asks: string, parts: readonly Section[], i: number): number {
  const by = asks === "getting brighter" || asks === "getting darker" ? "bright" : "energy";
  const a = parts[i], b = parts[i + 1], c = parts[i + 2];
  const d1 = b ? b[by] - a[by] : 0;
  const d2 = c && b ? c[by] - b[by] : 0;
  switch (asks) {
    case "a build": case "getting brighter": return d1 + d2;
    case "a release": case "getting darker": return -(d1 + d2);
    case "a jump": return d1 - Math.abs(d2);
    case "a drop": return -d1 - Math.abs(d2);
    /* down, then back up: the low point of a stretch, not of the track */
    case "a dip": return -d1 + d2 - Math.abs(d1 + d2) * 0.5;
    default: return -(Math.abs(d1) + Math.abs(d2));
  }
}

function choose(scene: Scene, a: Analysis, lo: number, hi: number): Pick {
  const parts = a.sections;
  const reach = parts.slice(lo, hi + 1);
  const asks = scene.asks;

  if (asks === "the start")
    return lo === 0
      ? { s: parts[0], outcome: "found", note: "found: the first part" }
      : { s: reach[0], outcome: "close", note: `close: the start is behind this scene, so it took the first part left, at ${sec(reach[0].at)}` };

  if (asks in RANKED) {
    const { by, sign } = RANKED[asks];
    const best = (xs: readonly Section[]) => xs.reduce((m, s) => (sign * s[by] > sign * m[by] ? s : m));
    const all = best(parts), here = best(reach);
    if (all.i >= lo && all.i <= hi) return { s: all, outcome: "found", note: `found: ${asks}, at ${sec(all.at)}` };
    const why = all.i < lo ? "already behind this scene" : "past where this scene can go and still leave room for the scenes after it";
    return { s: here, outcome: "close", note: `close: ${asks} of the track is at ${sec(all.at)}, ${why}, so it took ${asks} of what it could reach, at ${sec(here.at)}` };
  }

  const boundary = reach.find((s) => s.i > 0) ?? reach[0];
  const boundaryWords = boundary.i > 0 ? `the boundary at ${sec(boundary.at)}` : "the first part, which has no boundary before it";

  if (asks === "a new key") {
    const k = reach.find((s) => s.i > 0 && a.keyAt.includes(s.at));
    if (k) {
      const was = parts[k.i - 1];
      return { s: k, outcome: "found", note: `found: ${keyName(was.tonic, was.minor)} to ${keyName(k.tonic, k.minor)} at ${sec(k.at)}` };
    }
    if (a.keyAt.length)
      return { s: boundary, outcome: "close", note: `close: the key changes only at ${a.keyAt.map(sec).join(", ")}, out of this scene's reach, so it took ${boundaryWords}` };
    return { s: boundary, outcome: "missing", note: `missing: this track stays in one key; the scene takes ${boundaryWords} instead` };
  }

  if (asks === "a boundary")
    return boundary.i > 0
      ? { s: boundary, outcome: "found", note: `found: a boundary at ${sec(boundary.at)}` }
      : { s: boundary, outcome: "close", note: "close: the only part in reach is the first, which has no boundary before it" };

  if (asks === "next") return { s: reach[0], outcome: "found", note: `found: the next part, at ${sec(reach[0].at)}` };

  if ((SHAPES as readonly string[]).includes(asks)) {
    if (parts.length < 2)
      return { s: reach[0], outcome: "missing", note: "missing: a track in one part has no shape; the scene takes it anyway" };
    /* The first clear instance, not the strongest. Picking the strongest
       let one scene jump most of the way through a five-minute track to
       where the rise was steepest, leaving the scenes after it a minute
       and a half between them. A setlist runs forward, so a shape is found
       where it first clearly happens, and the strongest one is named if it
       was passed over. */
    const strongest = reach.reduce((m, s) => (strength(asks, parts, s.i) > strength(asks, parts, m.i) ? s : m));
    const top = strength(asks, parts, strongest.i);
    const clear = (s: Section) => {
      const v = strength(asks, parts, s.i);
      return asks === "a plateau" ? v > -FAINT : v > Math.max(FAINT, Math.min(CLEAR, top / 2));
    };
    const got = reach.find(clear) ?? strongest;
    if (clear(got))
      return got === strongest
        ? { s: got, outcome: "found", note: `found: ${asks} from ${sec(got.at)}` }
        : { s: got, outcome: "found", note: `found: ${asks} from ${sec(got.at)}, the first clear one (the strongest is at ${sec(strongest.at)})` };
    /* When the shape is not there, the scene takes the next part and moves
       on. Settling on the nearest thing to the shape sent a missing build
       on a falling track to the last parts, and the release after it —
       which that track had plenty of — found nothing left. */
    return { s: reach[0], outcome: "close", note: `close: nothing in reach is ${asks}, so it took the next part, at ${sec(reach[0].at)}, and left the rest for the scenes after it` };
  }

  return { s: reach[0], outcome: "missing", note: `missing: nothing can be found for “${asks}”` };
}

export function fit(set: Setlist, a: Analysis): Fitted {
  const problems = check(set);
  if (problems.length) return { ok: false, problems };
  const parts = a.sections;
  const n = parts.length;
  if (!n) return { ok: false, problems: ["the analysis found no parts in this track"] };

  const scenes = set.scenes;
  const last = scenes.length - 1;
  const notes: string[] = [];

  /* How much each scene reserves, scaled to what the track has, so the
     scenes after this one always have somewhere to go. */
  let need = scenes.map((s, k) => {
    const n2 = SPANS[s.span ?? "one part"];
    if (n2 !== Infinity) return n2;
    if (k !== last) notes.push(`“${s.name}” asked to run to the end but is not the last scene, so it spans one part`);
    return 1;
  });
  need[last] = 1;
  const asked = need.reduce((x, y) => x + y, 0);
  if (asked > n) {
    need = scenes.map(() => 1);
    notes.push(`this setlist asks for ${asked} parts and the track has ${n}, so every scene spans one`);
    if (scenes.length > n) notes.push(`and there are ${scenes.length} scenes for ${n} parts, so some share a part`);
  }

  /* Forward, one scene at a time: each looks only from where the last one
     landed up to the latest part that still leaves room for the rest. */
  const picks: Pick[] = [];
  let cursor = 0;
  scenes.forEach((s, k) => {
    const room = need.slice(k + 1).reduce((x, y) => x + y, 0);
    const sharing = cursor > n - 1;
    const lo = Math.min(cursor, n - 1);
    const hi = Math.max(lo, n - 1 - room);
    let pick = choose(s, a, lo, hi);
    if (sharing) {
      const shared = `it shares that part with “${scenes[k - 1].name}” and takes the second half of it`;
      pick = pick.outcome === "found"
        ? { ...pick, outcome: "close", note: `close: no part was left, so ${shared} (${pick.note})` }
        : { ...pick, note: `${pick.note}; ${shared}` };
    }
    picks.push(pick);
    cursor = pick.s.i + need[k];
  });

  /* Each scene runs until the next begins, the last to the end of the
     track. A scene sharing a part takes the second half of what remains,
     so none is empty. */
  const ats: number[] = [];
  picks.forEach((p, k) => {
    let at = p.s.at;
    if (k > 0 && at <= ats[k - 1]) at = +(ats[k - 1] + (p.s.until - ats[k - 1]) / 2).toFixed(2);
    ats.push(at);
  });
  if (ats[0] > 0) notes.push(`the performance opens on ${sec(ats[0])} with no scene, before “${scenes[0].name}”`);

  const placed: Placed[] = picks.map((p, k) => ({
    name: scenes[k].name,
    asks: scenes[k].asks,
    span: scenes[k].span ?? "one part",
    lens: scenes[k].lens && scenes[k].lens !== "none" ? scenes[k].lens! : null,
    caption: scenes[k].caption ?? null,
    outcome: p.outcome,
    note: p.note,
    at: ats[k],
    until: k < last ? ats[k + 1] : a.seconds,
    part: p.s.i,
  }));

  return {
    ok: true,
    plan: {
      version: 1,
      track: a.track,
      setlist: set.title,
      note: set.note ?? null,
      seconds: a.seconds,
      scenes: placed,
      rules: (set.rules ?? []).map((r) => rule(r, placed, parts)),
      notes,
    },
  };
}

/* Rules are checked after fitting, and are allowed to fail. */
function rule(r: string, ps: readonly Placed[], parts: readonly Section[]): RuleCheck {
  if (r === "in order") {
    const ok = ps.every((p, k) => k === 0 || p.at > ps[k - 1].at);
    return { rule: r, holds: ok, note: ok ? "every scene comes after the one before it" : "a scene starts no later than the one before it" };
  }
  if (r === "end on the lull") {
    const lull = parts.reduce((m, s) => (s.energy < m.energy ? s : m));
    const end = ps[ps.length - 1];
    const ok = end.part === lull.i;
    return { rule: r, holds: ok, note: ok ? "the last scene is on the quietest part" : `the last scene is at ${sec(end.at)}; the quietest part is at ${sec(lull.at)}` };
  }
  if (r === "nothing missing") {
    const gone = ps.filter((p) => p.outcome === "missing");
    return { rule: r, holds: !gone.length, note: gone.length ? `missing: ${gone.map((p) => `“${p.name}”`).join(", ")}` : "every scene found what it asked for, or said what it took instead" };
  }
  const min = atLeast(r);
  if (min !== null) {
    const short = ps.filter((p) => p.until - p.at < min);
    return { rule: r, holds: !short.length, note: short.length ? short.map((p) => `“${p.name}” lasts ${sec(p.until - p.at)}`).join("; ") : `the shortest scene lasts ${sec(Math.min(...ps.map((p) => p.until - p.at)))}` };
  }
  return { rule: r, holds: false, note: "no such rule" };
}

/** the scene playing at a time, if any */
export const sceneAt = (plan: Plan, t: number): Placed | null =>
  plan.scenes.find((p) => t >= p.at && t < p.until) ?? null;

/** the log: every choice, in the setlist's own words, beside the plan */
export const log = (plan: Plan) => ({
  track: plan.track,
  setlist: plan.setlist,
  scenes: plan.scenes.map(({ name, asks, outcome, note, at, part }) => ({ name, asks, outcome, note, at, part })),
  rules: plan.rules,
  notes: plan.notes,
});
