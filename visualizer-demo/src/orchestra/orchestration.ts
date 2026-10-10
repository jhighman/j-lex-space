/* An orchestration: a performance of one song, written down so that it
   can be played again exactly — by the page, by a script, or by anyone who
   opens the right URL.

   Unlike a setlist, which asks for moments and is fitted to whatever track
   it meets, an orchestration is written against one song and names times.
   Each cue is a time and one action a performer could take: switch lens,
   cue one on the other deck, cut, play a pad, blend toward a lens over a
   few seconds, or let go of everything.

     {
       "title": "…",
       "song": "samples/….mp3",
       "cues": [
         { "at": "0:00", "lens": "tide" },
         { "at": "0:31", "lens": "pulley", "note": "the turn to F minor" },
         { "at": "0:45", "cue": "sunburst" },
         { "at": "0:46", "blend": "sunburst", "amount": 0.5, "over": 8 },
         { "at": "1:02", "pad": "fold" }
       ]
     }

   A time is seconds or m:ss(.s). `check` lists everything wrong with an
   orchestration in plain words; `due` says which cues fall between two
   moments, which is all a player needs. */

export type PadName = "burst" | "reverse" | "fold" | "trails";

export type Action =
  | { readonly kind: "lens"; readonly lens: string }
  | { readonly kind: "cue"; readonly lens: string }
  | { readonly kind: "cut" }
  | { readonly kind: "pad"; readonly pad: PadName }
  | { readonly kind: "blend"; readonly lens: string; readonly amount: number; readonly over: number }
  | { readonly kind: "reset" }
  | { readonly kind: "quantise"; readonly on: boolean };

export interface Cue {
  readonly at: number;
  readonly action: Action;
  readonly note?: string;
}

export interface Orchestration {
  readonly title: string;
  readonly song: string | null;
  readonly cues: readonly Cue[];
}

export const PADS: readonly PadName[] = ["burst", "reverse", "fold", "trails"];

/** seconds from a number or "m:ss(.s)"; null if it is neither */
export function seconds(t: unknown): number | null {
  if (typeof t === "number") return Number.isFinite(t) && t >= 0 ? t : null;
  if (typeof t !== "string") return null;
  const m = /^(\d+):([0-5]?\d(?:\.\d+)?)$/.exec(t.trim());
  if (m) return Number(m[1]) * 60 + Number(m[2]);
  const s = /^\d+(?:\.\d+)?$/.test(t.trim()) ? Number(t) : NaN;
  return Number.isFinite(s) ? s : null;
}

const clock = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;

/**
 * Check an orchestration and read it. `lenses` are the ids that exist
 * ("none" is always allowed); `length` is the song's length in seconds, if
 * known, so cues past the end can be refused.
 */
export function read(input: unknown, lenses: readonly string[], length: number | null = null):
  { readonly ok: true; readonly orchestration: Orchestration } | { readonly ok: false; readonly problems: string[] } {
  const problems: string[] = [];
  if (!input || typeof input !== "object") return { ok: false, problems: ["an orchestration is an object with a title and cues"] };
  const o = input as Record<string, unknown>;
  if (typeof o.title !== "string" || !o.title.trim()) problems.push("the orchestration has no title");
  if (o.song !== undefined && typeof o.song !== "string") problems.push("song is the path or URL of the song, as text");
  if (!Array.isArray(o.cues) || !o.cues.length) return { ok: false, problems: [...problems, "the orchestration has no cues"] };

  const known = new Set(["none", ...lenses]);
  const cues: Cue[] = [];
  /* every time that can be read, so order is checked even beside a broken cue */
  const times: number[] = [];
  o.cues.forEach((raw, n) => {
    const where = `cue ${n + 1}`;
    if (!raw || typeof raw !== "object") { problems.push(`${where} is not an object`); return; }
    const c = raw as Record<string, unknown>;
    const at = seconds(c.at);
    if (at === null) { problems.push(`${where} has no time it can read: "at" is seconds or m:ss`); return; }
    times.push(at);
    const here = `${where} (${clock(at)})`;
    if (length !== null && at > length) problems.push(`${here} is after the song ends at ${clock(length)}`);
    const lensOk = (id: unknown) => typeof id === "string" && known.has(id);
    const lensProblem = (id: unknown) => `${here} names “${String(id)}”, which is not a lens; the lenses are ${[...known].join(", ")}`;

    const kinds = ["lens", "cue", "cut", "pad", "blend", "reset", "quantise"].filter((k) => k in c);
    if (kinds.length !== 1) { problems.push(`${here} must do exactly one thing: lens, cue, cut, pad, blend, reset or quantise`); return; }
    let action: Action | null = null;
    switch (kinds[0]) {
      case "lens":
      case "cue":
        if (!lensOk(c[kinds[0]])) problems.push(lensProblem(c[kinds[0]]));
        else action = { kind: kinds[0], lens: c[kinds[0]] as string };
        break;
      case "cut": action = { kind: "cut" }; break;
      case "reset": action = { kind: "reset" }; break;
      case "pad":
        if (!PADS.includes(c.pad as PadName)) problems.push(`${here} plays “${String(c.pad)}”, which is not a pad; the pads are ${PADS.join(", ")}`);
        else action = { kind: "pad", pad: c.pad as PadName };
        break;
      case "quantise":
        if (typeof c.quantise !== "boolean") problems.push(`${here}: quantise is true or false`);
        else action = { kind: "quantise", on: c.quantise };
        break;
      case "blend": {
        const amount = c.amount === undefined ? 1 : Number(c.amount), over = c.over === undefined ? 2 : Number(c.over);
        if (!lensOk(c.blend)) problems.push(lensProblem(c.blend));
        else if (!(amount >= 0 && amount <= 1)) problems.push(`${here}: amount is how far toward the lens, from 0 to 1`);
        else if (!(over >= 0 && over <= 60)) problems.push(`${here}: over is seconds, from 0 to 60`);
        else action = { kind: "blend", lens: c.blend as string, amount, over };
        break;
      }
    }
    if (action) cues.push({ at, action, ...(typeof c.note === "string" ? { note: c.note } : {}) });
  });
  for (let k = 1; k < times.length; k++)
    if (times[k] < times[k - 1]) problems.push(`cues must run in time order; ${clock(times[k])} comes after ${clock(times[k - 1])}`);

  if (problems.length) return { ok: false, problems };
  return { ok: true, orchestration: { title: (o.title as string).trim(), song: (o.song as string | undefined) ?? null, cues } };
}

/**
 * The cues that fall after `from` and at or before `to`. A cue at 0 is due
 * on the first step from before the start. Moving backwards is a seek, and
 * nothing is due: the player starts again from wherever the song now is.
 */
export function due(cues: readonly Cue[], from: number, to: number): Cue[] {
  if (to < from) return [];
  return cues.filter((c) => c.at > from && c.at <= to);
}
