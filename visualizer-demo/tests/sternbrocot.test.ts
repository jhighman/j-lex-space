/* The Stern–Brocot tree, held to what defines it, and the lens that walks it. */

import { describe, expect, it } from "vitest";
import { type Sounding, sounding } from "../src/audio/frame";
import { at, level, pathTo, shared } from "../src/lenses/sb";
import { AUDIBLE, interval } from "../src/lenses/lens";
import { ABOVE, type SternBrocotState, sternBrocot } from "../src/lenses/sternbrocot";

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

describe("the tree", () => {
  it("finds every fraction by its path, and every path ends at a fraction in lowest terms", () => {
    for (let p = 1; p <= 30; p++)
      for (let q = 1; q <= 30; q++) {
        const [a, b] = at(pathTo(p, q));
        expect(a * q).toBe(b * p);
        expect(gcd(a, b)).toBe(1);
      }
  });

  it("is a search tree: each level runs left to right from smallest to largest", () => {
    for (let d = 1; d <= 7; d++) {
      const values = level([], d).map((p) => at(p)).map(([a, b]) => a / b);
      for (let i = 1; i < values.length; i++) expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });

  it("makes each node the mediant of its nearest ancestors on either side", () => {
    for (const path of level([], 6)) {
      const [p, q] = at(path);
      const lefts = path.map((_, j) => path.slice(0, j)).filter((_, j) => path[j] === "R").map(at);
      const rights = path.map((_, j) => path.slice(0, j)).filter((_, j) => path[j] === "L").map(at);
      const [lp, lq] = lefts.length ? lefts[lefts.length - 1] : [0, 1];
      const [rp, rq] = rights.length ? rights[rights.length - 1] : [1, 0];
      expect([p, q]).toEqual([lp + rp, lq + rq]);
    }
  });

  it("puts consonance near the root and dissonance deep", () => {
    const depth = (p: number, q: number) => pathTo(p, q).length;
    expect(depth(1, 1)).toBe(0);
    expect(depth(2, 1)).toBe(1);
    expect(depth(3, 2)).toBe(2);
    expect(depth(5, 4)).toBe(4);
    expect(depth(16, 15)).toBe(15);
    expect(pathTo(3, 2).join("")).toBe("RL");
  });

  it("knows where two paths part", () => {
    expect(shared(pathTo(5, 4), pathTo(4, 3))).toBe(3);
    expect(shared(pathTo(3, 2), pathTo(2, 3))).toBe(0);
  });
});

/* a frame where the loudest note is `top` above C */
const heard = (beats: number, top: number, tonic = 0): Sounding => sounding({
  t: beats * 0.5,
  dynamics: { energy: 0.5, beat: 0, flux: 0.3, bright: 0.4 },
  harmony: { chroma: Array.from({ length: 12 }, (_, i) => (i === (tonic + top) % 12 ? 1 : 0.1)), tonic, minor: false },
  rhythm: { beats, phase: 0.2, bpm: 120 },
});

function walk(steps: [top: number, tonic?: number][]): SternBrocotState[] {
  let s: SternBrocotState | null = null;
  return steps.map(([top, tonic], n) => (s = sternBrocot.state(heard(n, top, tonic ?? 0), s)));
}

describe("the lens", () => {
  it("walks a step down the interval's path on each beat, and stops when it arrives", () => {
    const s = walk(Array.from({ length: 8 }, () => [4] as [number]));
    expect(s[0].path.join("")).toBe("RLLL");
    expect(s.map((x) => x.walked)).toEqual([0, 1, 2, 3, 4, 4, 4, 4]);
  });

  it("climbs back to where the paths part when the interval changes, then goes on", () => {
    const s = walk([[4], [4], [4], [4], [4], [5]]);
    /* 5/4 is RLLL and 4/3 is RLL: they share three turns, so the walk keeps them and is there */
    expect(s[4].walked).toBe(4);
    expect(s[5].target).toEqual([4, 3]);
    expect(s[5].walked).toBe(3);
  });

  it("re-roots at 1/1 on a key change, and recolours the tree", () => {
    const s = walk([[7], [7], [7], [7, 5]]);
    expect(s[2].walked).toBe(2);
    /* the key change falls on a beat: back to 1/1, then that beat's first step */
    expect(s[3].walked).toBe(1);
    const c = (x: SternBrocotState) => sternBrocot.view(x).colour(0.5, 0, 0).h;
    expect(c(s[3])).not.toBe(c(s[2]));
  });

  it("follows a deep walk down, keeping a few levels above where it stands", () => {
    const s = walk(Array.from({ length: 12 }, () => [1] as [number]));
    expect(s[0].path.length).toBe(15);
    expect(s[11].walked).toBe(11);
    expect(sternBrocot.view(s[11]).words()).toMatch(/16\/15 · minor second · 15 turns from 1\/1, 11 walked/);
    expect(ABOVE).toBeLessThan(11);
  });

  it("labels the fractions on the walked path", () => {
    const s = walk(Array.from({ length: 4 }, () => [7] as [number]));
    const labels = sternBrocot.view(s[3]).emblem().filter((m) => "text" in m).map((m) => ("text" in m ? m.text[2] : ""));
    expect(labels).toEqual(expect.arrayContaining(["1/1", "2/1", "3/2"]));
  });
});

describe("the interval it hears", () => {
  const chroma = (levels: Record<number, number>) => Array.from({ length: 12 }, (_, i) => levels[i] ?? 0.1);

  it("is the loudest note other than the tonic, even when the tonic is loudest", () => {
    /* a C chord with C loudest: the fifth, not unison */
    expect(interval(chroma({ 0: 1, 4: 0.6, 7: 0.8 }), 0)).toBe(7);
    expect(interval(chroma({ 0: 1, 4: 0.9, 7: 0.5 }), 0)).toBe(4);
  });

  it("is unison only when nothing else is sounding", () => {
    expect(interval(chroma({ 0: 1 }), 0)).toBe(0);
    expect(interval(chroma({ 0: 1, 7: AUDIBLE - 0.01 }), 0)).toBe(0);
  });

  it("counts up from the tonic", () => {
    /* in A-flat, E-flat above it is a fifth */
    expect(interval(chroma({ 8: 1, 3: 0.7 }), 8)).toBe(7);
  });

  it("walks toward the fifth while the tonic is the loudest note", () => {
    let s: SternBrocotState | null = null;
    for (let n = 0; n < 4; n++)
      s = sternBrocot.state(sounding({
        t: n * 0.5, dynamics: { energy: 0.5, beat: 0, flux: 0.3, bright: 0.4 },
        harmony: { chroma: chroma({ 0: 1, 7: 0.8 }), tonic: 0, minor: false },
        rhythm: { beats: n, phase: 0.2, bpm: 120 },
      }), s);
    expect(s!.target).toEqual([3, 2]);
    expect(s!.walked).toBe(2);
  });
});
