/* Sunburst, with its context given as literals: the song's parts, or the
   line Pulley is reading. */

import { describe, expect, it } from "vitest";
import { type Sounding, sounding } from "../src/audio/frame";
import type { Context, Part } from "../src/lenses/lens";
import { POEM } from "../src/lenses/pulley";
import { FORCE_COLOUR, type SunburstState, WHOLE, ZOOM_SECONDS, extentAt, sunburst } from "../src/lenses/sunburst";

const at = (t: number, o: { beats?: number; tonic?: number; minor?: boolean; chroma?: number[] } = {}): Sounding => sounding({
  t,
  dynamics: { energy: 0.5, beat: 0, flux: 0.3, bright: 0.4 },
  harmony: { chroma: o.chroma ?? Array(12).fill(0.3), tonic: o.tonic ?? 0, minor: o.minor ?? false },
  rhythm: { beats: o.beats ?? Math.floor(t * 2), phase: 0.2, bpm: 120 },
});

const PARTS: Part[] = [
  { at: 0, until: 20, energy: 0.4, tonic: 8, minor: false },
  { at: 20, until: 60, energy: 0.9, tonic: 0, minor: true },
  { at: 60, until: 80, energy: 0.6, tonic: 8, minor: false },
];
const SONG: Context = { parts: PARTS };

function run(frames: Sounding[], context: (n: number) => Context): SunburstState[] {
  let s: SunburstState | null = null;
  return frames.map((f, n) => (s = sunburst.state(f, s, context(n))));
}

describe("the song", () => {
  it("draws the parts in the inner ring, as wide as they are long, coloured by key", () => {
    const [s] = run([at(30)], () => SONG);
    expect(s.tree).toBe("song");
    const inner = sunburst.view(s).rings().filter((r) => r.label);
    expect(inner.map((r) => +(r.x1 - r.x0).toFixed(3))).toEqual([0.25, 0.5, 0.25]);
    expect(inner[0].colour.h).toBe(inner[2].colour.h);
    expect(inner[1].colour.h).not.toBe(inner[0].colour.h);
  });

  it("lights the part that is playing", () => {
    const [s] = run([at(30)], () => SONG);
    const inner = sunburst.view(s).rings().filter((r) => r.label);
    expect(inner[1].v).toBeGreaterThan(Math.max(inner[0].v, inner[2].v));
  });

  it("lets a part's loudness light it, never colour it", () => {
    const quiet = run([at(5)], () => ({ parts: PARTS.map((p) => ({ ...p, energy: 0.1 })) }))[0];
    const loud = run([at(5)], () => ({ parts: PARTS.map((p) => ({ ...p, energy: 1 })) }))[0];
    const q = sunburst.view(quiet).rings(), l = sunburst.view(loud).rings();
    q.forEach((r, i) => expect(l[i].colour).toEqual(r.colour));
    expect(l.find((r) => r.label === "3 · A♭")!.v).toBeGreaterThan(q.find((r) => r.label === "3 · A♭")!.v);
  });

  it("zooms into the part where a key change happens, opens its beats, and zooms out when it ends", () => {
    const s = run([at(30, { tonic: 0 }), at(31, { tonic: 3 })], () => SONG);
    expect(s[1].zoomPart).toBe(1);
    expect(s[1].target).toEqual({ x0: 0.25, x1: 0.75, d: 1 });
    const settled = sunburst.state(at(31 + ZOOM_SECONDS, { tonic: 3 }), s[1], SONG);
    const before = sunburst.view(s[0]).rings().length, after = sunburst.view(settled).rings().length;
    expect(after).toBeGreaterThan(before);
    const out = sunburst.state(at(61, { tonic: 3 }), settled, SONG);
    expect(out.zoomPart).toBeNull();
    expect(out.target).toEqual(WHOLE);
  });

  it("eases every zoom over three quarters of a second", () => {
    const s = run([at(30, { tonic: 0 }), at(31, { tonic: 3 })], () => SONG)[1];
    const mid = extentAt(s, 31 + ZOOM_SECONDS / 2), end = extentAt(s, 31 + ZOOM_SECONDS);
    expect(mid.x0).toBeGreaterThan(0);
    expect(mid.x0).toBeLessThan(0.25);
    expect(end).toEqual(s.target);
  });

  it("marks the playhead with a needle", () => {
    const [s] = run([at(40)], () => SONG);
    const needle = sunburst.view(s).rings().find((r) => r.r0 < 0.28 && r.r1 === 1);
    expect(needle!.x0).toBeCloseTo(0.5, 2);
  });
});

describe("the poem, beside Pulley", () => {
  const POEM_AT = (line: number): Context => ({ poemLine: line });

  it("becomes the poem when Pulley is on the other deck, zoomed into the stanza being read", () => {
    const [s] = run([at(10)], () => POEM_AT(7));
    expect(s.tree).toBe("poem");
    expect(s.target.d).toBe(1);
    expect(sunburst.view(s).words()).toBe(`II · ${POEM[7]}`);
  });

  it("colours each verb by its force, and only where it is the verb", () => {
    const rings = (line: number) => sunburst.view(run([at(10)], () => POEM_AT(line))[0]).rings();
    /* words are labelled as written, quotation marks and all */
    const word = (r: { label?: string }, w: string) => r.label?.replace(/[^\p{L}]/gu, "") === w;
    const pour = rings(2).find((r) => word(r, "pour"));
    expect(pour!.colour).toEqual(FORCE_COLOUR.centrifugal);
    /* "Rest in the bottom lay" is the noun */
    const noun = rings(9).find((r) => word(r, "Rest"));
    expect(noun!.colour).not.toEqual(FORCE_COLOUR["competing equilibrium"]);
    const verb = rings(13).find((r) => word(r, "rest"));
    expect(verb!.colour).toEqual(FORCE_COLOUR["competing equilibrium"]);
  });

  it("lights the line being read", () => {
    const view = sunburst.view(run([at(10)], () => POEM_AT(12))[0]);
    const lines = view.rings().filter((r) => r.r0 < 0.4 && r.label);
    const lit = lines.reduce((m, r) => (r.v > m.v ? r : m));
    expect(lit.label).toBe("He would");
  });

  it("zooms to the next stanza as the reading moves on", () => {
    const s = run([at(10), at(11)], (n) => POEM_AT(n === 0 ? 4 : 5));
    expect(s[1].target.x0).toBeCloseTo(s[0].target.x1, 6);
    expect(s[1].since).toBe(11);
  });
});

describe("the harmony, before any analysis", () => {
  it("draws the twelve notes, as wide as they are loud", () => {
    const chroma = Array.from({ length: 12 }, (_, i) => (i === 0 ? 1 : i === 7 ? 0.5 : 0));
    const [s] = run([at(1, { chroma })], () => ({}));
    const r = sunburst.view(s).rings();
    expect(r).toHaveLength(12);
    const c = r.find((x) => x.label === "C")!, g = r.find((x) => x.label === "G")!;
    expect(c.x1 - c.x0).toBeGreaterThan(g.x1 - g.x0);
  });

  it("turns the key to the top on a key change", () => {
    const s = run([at(1, { tonic: 0 }), at(2, { tonic: 7 })], () => ({}));
    expect(sunburst.view(s[1]).turn(0)).not.toBe(sunburst.view(s[0]).turn(0));
  });
});
