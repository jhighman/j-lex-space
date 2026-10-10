/* Atlas: Bridson's growth laid on Sunburst's timeline of the song. */

import { describe, expect, it } from "vitest";
import { type Sounding, sounding } from "../src/audio/frame";
import { type AtlasState, BEATS_PER_TURN, INNER, OUTER, R, RING, atlas, timelineOf } from "../src/lenses/atlas";
import type { Context, Part } from "../src/lenses/lens";

/* a 60-second song: A-flat, then C minor from 30 s */
const PARTS: Part[] = [
  { at: 0, until: 30, energy: 0.5, tonic: 8, minor: false },
  { at: 30, until: 60, energy: 0.8, tonic: 0, minor: true },
];

/* two beats a second; the live key follows the parts unless told otherwise */
const heard = (beats: number, tonic?: number): Sounding => {
  const t = beats * 0.5;
  const key = tonic ?? (t < 30 ? 8 : 0);
  return sounding({
    t,
    dynamics: { energy: 0.5, beat: 0, flux: 0.3, bright: 0.4 },
    harmony: { chroma: Array.from({ length: 12 }, (_, i) => (i === key ? 1 : 0.2)), tonic: key, minor: key === 0 },
    rhythm: { beats, phase: 0.2, bpm: 120 },
  });
};

function play(beats: number, context: Context = { parts: PARTS }, tonic?: (n: number) => number): AtlasState[] {
  const out: AtlasState[] = [];
  let s: AtlasState | null = null;
  for (let n = 0; n < beats; n++) out.push((s = atlas.state(heard(n, tonic?.(n)), s, context)));
  return out;
}

const run = play(120);

describe("the timeline", () => {
  it("moves the needle with the song's time once the parts are known", () => {
    expect(run[0].needle).toBe(0);
    expect(run[60].needle).toBeCloseTo(0.5, 6);
    expect(run[119].needle).toBeCloseTo(59.5 / 60, 6);
  });

  it("goes by beats before the analysis has finished", () => {
    const early = play(64, { parts: null });
    expect(early[63].needle).toBeCloseTo(63 / BEATS_PER_TURN, 6);
  });

  it("draws the analysed parts as a ring, each as wide as it is long, the playing one lit", () => {
    const rings = atlas.view(run[20]).rings();
    expect(rings.map((r) => [r.x0, r.x1])).toEqual([[0, 0.5], [0.5, 1]]);
    expect(rings.every((r) => r.r0 === RING[0] && r.r1 === RING[1])).toBe(true);
    expect(rings[0].v).toBeGreaterThan(rings[1].v);
    expect(rings[0].colour.h).not.toBe(rings[1].colour.h);
  });
});

describe("the growth", () => {
  it("never passes the needle, and stays in its band", () => {
    for (const s of [run[10], run[50], run[119]])
      for (const p of s.samples) {
        expect(timelineOf(p.x, p.y)).toBeLessThanOrEqual(s.needle + 1e-9);
        const r = Math.hypot(p.x, p.y);
        expect(r).toBeGreaterThanOrEqual(INNER - 1e-9);
        expect(r).toBeLessThanOrEqual(OUTER + 1e-9);
      }
  });

  it("never places two points closer than r", () => {
    const ps = run[119].samples;
    for (let i = 0; i < ps.length; i++)
      for (let j = i + 1; j < ps.length; j++) expect(Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y)).toBeGreaterThanOrEqual(R - 1e-9);
  });

  it("clears nothing: every point stays where it was put, in the key it was heard in", () => {
    const before = run[59].samples, after = run[119].samples;
    expect(after.length).toBeGreaterThan(before.length);
    before.forEach((p, i) => expect([after[i].x, after[i].y, after[i].pc]).toEqual([p.x, p.y, p.pc]));
  });

  it("colours the first half A-flat and the second C, as they were heard", () => {
    const ps = run[119].samples;
    const half = (p: { x: number; y: number }) => (timelineOf(p.x, p.y) < 0.5 ? "first" : "second");
    const first = ps.filter((p) => half(p) === "first"), second = ps.filter((p) => half(p) === "second");
    expect(first.length).toBeGreaterThan(20);
    expect(second.length).toBeGreaterThan(20);
    /* the change is heard a beat or so after 30 s, so a sliver past half is still A-flat */
    expect(first.every((p) => p.pc === 8)).toBe(true);
    expect(second.filter((p) => p.pc === 0).length / second.length).toBeGreaterThan(0.95);
  });

  it("marks where a key change was heard, and the analysis need not agree", () => {
    /* the live key moves at 20 s, ten seconds before the analysis says it does */
    const early = play(120, { parts: PARTS }, (n) => (n * 0.5 < 20 ? 8 : 0));
    const marks = early[119].changes;
    expect(marks.length).toBe(1);
    expect(marks[0].at).toBeCloseTo(20 / 60, 6);
    expect(marks[0].pc).toBe(0);
    /* growth heard in C sits inside the ring's A-flat part */
    const ps = early[119].samples.filter((p) => timelineOf(p.x, p.y) > 0.36 && timelineOf(p.x, p.y) < 0.48);
    expect(ps.length).toBeGreaterThan(0);
    expect(ps.every((p) => p.pc === 0)).toBe(true);
  });

  it("is the same growth every time from the same music", () => {
    expect(play(120)[119].samples).toEqual(run[119].samples);
  });
});
