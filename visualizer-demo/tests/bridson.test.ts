/* Bridson's algorithm, held to its guarantees, and the lens that grows it. */

import { describe, expect, it } from "vitest";
import { type Sounding, sounding } from "../src/audio/frame";
import { type BridsonState, CLEARING, MAX, R, REST, bridson } from "../src/lenses/bridson";
import { type Sample, random, round, seedAt } from "../src/lenses/poisson";

function grow(seed: number, rounds: number, r = R): Sample[] {
  let samples: Sample[] = [{ x: 0, y: 0, pc: 0, born: 0, active: true, parent: -1 }];
  for (let n = 1; n <= rounds; n++) ({ samples, seed } = round(samples, r, seed, n));
  return samples;
}

describe("the sampling", () => {
  it("draws numbers in [0, 1) from a seed, the same ones every time", () => {
    let s = 7;
    const a: number[] = [];
    for (let i = 0; i < 1000; i++) { let u: number; [u, s] = random(s); a.push(u); }
    expect(Math.min(...a)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...a)).toBeLessThan(1);
    let t = 7, b: number;
    [b, t] = random(t);
    expect(b).toBe(a[0]);
  });

  const full = grow(42, 200, 0.08);

  it("never places two points closer than r, and keeps them all in the disc", () => {
    for (let i = 0; i < full.length; i++) {
      expect(Math.hypot(full[i].x, full[i].y)).toBeLessThanOrEqual(1 + 1e-9);
      for (let j = i + 1; j < full.length; j++) expect(Math.hypot(full[i].x - full[j].x, full[i].y - full[j].y)).toBeGreaterThanOrEqual(0.08 - 1e-9);
    }
  });

  it("finishes with nothing active and no gap wider than 2r", () => {
    expect(full.filter((p) => p.active)).toEqual([]);
    for (let x = -0.95; x <= 0.95; x += 0.05)
      for (let y = -0.95; y <= 0.95; y += 0.05) {
        if (x * x + y * y > 0.9) continue;
        const near = Math.min(...full.map((p) => Math.hypot(p.x - x, p.y - y)));
        expect(near).toBeLessThan(2 * 0.08);
      }
  });

  it("grows the same pattern from the same seed", () => {
    expect(grow(9, 12)).toEqual(grow(9, 12));
    expect(grow(9, 12)).not.toEqual(grow(10, 12));
  });

  it("clears a patch round a new seed, and keeps every link pointing at a sample that is there", () => {
    const before = grow(3, 30);
    const after = seedAt(before, 0.5, 0, 0.3, 7, 30);
    expect(after.filter((p) => Math.hypot(p.x - 0.5, p.y) < 0.3)).toEqual([after[after.length - 1]]);
    for (const p of after) expect(p.parent).toBeLessThan(after.length);
  });
});

const frame = (beats: number, tonic = 0): Sounding => sounding({
  t: beats * 0.5,
  dynamics: { energy: 0.5, beat: 0, flux: 0.3, bright: 0.4 },
  harmony: { chroma: Array(12).fill(0.5), tonic, minor: false },
  rhythm: { beats, phase: 0.2, bpm: 120 },
});

function play(steps: [beats: number, tonic?: number][]): BridsonState[] {
  let s: BridsonState | null = null;
  return steps.map(([b, k]) => (s = bridson.state(frame(b, k ?? 0), s)));
}

describe("the lens at rest", () => {
  it("clears a small patch where the loudest note is once nothing has grown for a while, and regrows it", () => {
    const s = play(Array.from({ length: 70 }, (_, b) => [b] as [number]));
    const full = s.findIndex((x) => x.samples.length > 300 && !x.samples.some((p) => p.active));
    expect(full).toBeGreaterThan(0);
    const after = s.slice(full + 1, full + REST + 3);
    expect(after.some((x) => x.samples.some((p) => p.active))).toBe(true);
  });
});

describe("the lens", () => {
  it("starts from one seed at the centre, in the key's colour", () => {
    const [s] = play([[0, 4]]);
    expect(s.samples).toHaveLength(1);
    expect(s.samples[0]).toMatchObject({ x: 0, y: 0, pc: 4 });
  });

  it("runs one round a beat, and nothing between beats", () => {
    const s = play([[0], [1], [1], [2]]);
    expect(s[1].samples.length).toBeGreaterThan(1);
    expect(s[2].samples).toBe(s[1].samples);
    expect(s[3].samples.length).toBeGreaterThan(s[1].samples.length);
    expect(s[3].rounds).toBe(2);
  });

  it("fills the body over the beats, up to its limit", () => {
    const s = play(Array.from({ length: 40 }, (_, b) => [b] as [number]));
    expect(s[39].samples.length).toBeGreaterThan(400);
    expect(s[39].samples.length).toBeLessThanOrEqual(MAX);
  });

  it("clears a patch at the new key on a key change, and grows it back in the new colour", () => {
    const s = play([...Array.from({ length: 40 }, (_, b) => [b] as [number]), [40, 7], [41, 7], [42, 7], [43, 7]]);
    const grown = s[39], seeded = s[40];
    expect(seeded.samples.length).toBeLessThan(grown.samples.length);
    const fresh = s[43].samples.filter((p) => p.pc === 7);
    expect(fresh.length).toBeGreaterThan(5);
    /* the new growth is round the new key's place, within the clearing */
    const [cx, cy] = [fresh.reduce((a, p) => a + p.x, 0) / fresh.length, fresh.reduce((a, p) => a + p.y, 0) / fresh.length];
    expect(Math.hypot(cx, cy)).toBeGreaterThan(0.25);
    expect(Math.min(...fresh.map((p) => Math.hypot(p.x - fresh[0].x, p.y - fresh[0].y)))).toBeLessThan(CLEARING);
    const colour = (st: BridsonState, pc: number) => bridson.view(st).colour(0, 0, st.samples.findIndex((p) => p.pc === pc));
    expect(colour(s[43], 7).h).not.toBe(colour(s[43], 0).h);
  });
});
