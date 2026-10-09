/* Marks are a list of times, and times mean nothing against the wrong
   audio: every mark lands somewhere it was not placed, and nothing looks
   wrong. So a mark set carries the track it belongs to — its name, its
   length in bytes and its SHA-256 — and is checked before it is shown.

   A set that names no track loads with a warning. A set that names a
   different one is refused, both hashes are shown, and loading it needs an
   explicit "anyway". */

export interface TrackId {
  readonly name: string;
  readonly bytes: number;
  readonly sha256: string;
}

export interface MarkSet {
  readonly version: 1;
  readonly track: TrackId | null;
  readonly marks: readonly number[];
}

export type Verdict =
  | { readonly kind: "same" }
  | { readonly kind: "unbound"; readonly why: string }
  | { readonly kind: "other"; readonly why: string };

const hex = (b: ArrayBuffer) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, "0")).join("");

export async function identify(name: string, data: ArrayBuffer): Promise<TrackId> {
  return { name, bytes: data.byteLength, sha256: hex(await crypto.subtle.digest("SHA-256", data)) };
}

/* the name is a courtesy; the bytes and the hash are the identity, so a
   renamed file is still the same track and a re-encode is not */
export const sameTrack = (a: TrackId, b: TrackId) => a.bytes === b.bytes && a.sha256 === b.sha256;

export function verdict(set: MarkSet, playing: TrackId): Verdict {
  if (!set.track) return { kind: "unbound", why: "these marks name no record; they may not be aimed at this one" };
  if (sameTrack(set.track, playing)) return { kind: "same" };
  return {
    kind: "other",
    why:
      `these marks were placed on “${set.track.name}” (${set.track.sha256.slice(0, 12)}…, ${set.track.bytes} bytes), ` +
      `not “${playing.name}” (${playing.sha256.slice(0, 12)}…, ${playing.bytes} bytes)`,
  };
}

export function parse(text: string): MarkSet {
  const j = JSON.parse(text) as Partial<MarkSet>;
  if (j.version !== 1 || !Array.isArray(j.marks) || !j.marks.every((m) => typeof m === "number" && m >= 0))
    throw new Error("not a mark set");
  const track = j.track && typeof j.track.sha256 === "string" && typeof j.track.bytes === "number" ? j.track : null;
  return { version: 1, track, marks: [...j.marks].sort((a, b) => a - b) };
}
