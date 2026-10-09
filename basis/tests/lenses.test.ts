/* The eight lenses, played with literal frames: no page, no audio, no clock. */

import { describe, expect, it } from "vitest";
import { type Sounding, sounding } from "../src/audio/frame";
import { LENSES } from "../src/lenses";
import { frost, MELT_AFTER, RINGS } from "../src/lenses/frost";
import { garden } from "../src/lenses/garden";
import { glow, kiln } from "../src/lenses/kiln";
import { GOLDEN, type Lens, PLAIN } from "../src/lenses/lens";
import { lissajous } from "../src/lenses/lissajous";
import { prism } from "../src/lenses/prism";
import { LIFE, ripple } from "../src/lenses/ripple";
import { KICK, swarm } from "../src/lenses/swarm";
import { DRAIN, RISE, tide } from "../src/lenses/tide";

const C_MAJOR = [1, 0, 0.2, 0, 0.7, 0.1, 0, 0.8, 0, 0.3, 0, 0.1];

interface F { beats?: number; t?: number; energy?: number; tonic?: number; minor?: boolean; chroma?: number[] }
const at = (o: F = {}): Sounding => sounding({
  t: o.t ?? (o.beats ?? 0) * 0.5,
  dynamics: { energy: o.energy ?? 0.5, beat: (o.energy ?? 0.5) > 0.7 ? 1 : 0, flux: o.energy ?? 0.5, bright: 0.4 },
  harmony: { chroma: o.chroma ?? C_MAJOR, tonic: o.tonic ?? 0, minor: o.minor ?? false },
  rhythm: { beats: o.beats ?? 0, phase: 0.3, bpm: 120 },
});

/** a fixed little piece: 40 beats, the harmony moving, a key change at 20 */
const PIECE = (energy: (n: number) => number) => Array.from({ length: 40 }, (_, n) => at({
  beats: n, energy: energy(n), tonic: n < 20 ? 0 : 7,
  chroma: C_MAJOR.map((v, i) => (i === (n * 5) % 12 ? 1 : v * 0.8)),
}));

function play<S>(l: Lens<S>, frames: Sounding[]): S[] {
  const out: S[] = [];
  let prev: S | null = null;
  for (const f of frames) { prev = l.state(f, prev); out.push(prev); }
  return out;
}

const PROBES: [number, number, number][] = [[0.1, 0.05, 0], [0.5, 0.2, 7], [0.9, 0.7, 13], [0.3, 0.45, 2], [0.7, 0.9, 5]];

/* what a lens does, with every field name stripped out */
function signature(l: Lens<unknown>, s: unknown): number[] {
  const v = l.view(s);
  const out = [v.turn(0.3), v.shell(0.5), v.motes(1000), v.divergence(GOLDEN), v.folds(1), ...v.centre(), v.ground().h];
  for (const [k, a, i] of PROBES) {
    const p = v.place(k, a, i), c = v.colour(k, a, i);
    out.push(p.k, p.a, p.v, c.h, c.s);
  }
  return out.map((x) => Math.round(x * 1000) / 1000);
}

describe("every lens", () => {
  for (const l of LENSES as Lens<unknown>[]) {
    it(`${l.id} is a pure function of a literal frame`, () => {
      const f = at({ beats: 9 });
      expect(l.state(f, null)).toEqual(l.state(f, null));
    });

    it(`${l.id} answers everything the body asks and nothing more`, () => {
      expect(Object.keys(l.view(l.state(at(), null))).sort()).toEqual(Object.keys(PLAIN).sort());
    });

    it(`${l.id}: loudness never changes a colour`, () => {
      const quiet = play(l, PIECE(() => 0.1)), loud = play(l, PIECE((n) => (n % 3 ? 0.95 : 0.3)));
      quiet.forEach((s, n) => {
        const a = l.view(s), b = l.view(loud[n]);
        for (const [k, an, i] of PROBES) {
          expect(b.colour(k, an, i).h, `${l.id} at beat ${n}`).toBeCloseTo(a.colour(k, an, i).h, 6);
          expect(b.colour(k, an, i).s).toBeCloseTo(a.colour(k, an, i).s, 6);
        }
      });
    });

    it(`${l.id} does something on a key change`, () => {
      const same = play(l, PIECE(() => 0.5).map((f) => at({ beats: f.rhythm.beats, chroma: [...f.harmony.chroma] })));
      const moved = play(l, PIECE(() => 0.5));
      expect(JSON.stringify(signature(l, moved[22]))).not.toBe(JSON.stringify(signature(l, same[22])));
    });

    it(`${l.id} does not write into the frame`, () => {
      const f = at({ beats: 3 });
      l.state(f, l.state(at({ beats: 2 }), null));
      expect(f).toEqual(at({ beats: 3 }));
    });
  }
});

describe("eight lenses, not one lens with eight colour schemes", () => {
  it("no two make the same changes on the same music", () => {
    const frames = PIECE((n) => 0.3 + 0.6 * ((n * 7) % 5) / 4);
    const runs = (LENSES as Lens<unknown>[]).map((l) => ({ id: l.id, sig: JSON.stringify(play(l, frames).map((s) => signature(l, s))) }));
    for (let a = 0; a < runs.length; a++)
      for (let b = a + 1; b < runs.length; b++)
        expect(runs[a].sig, `${runs[a].id} vs ${runs[b].id}`).not.toBe(runs[b].sig);
  });

  it("with no lens, no colour", () => {
    for (const [k, a, i] of PROBES) expect(PLAIN.colour(k, a, i).s).toBe(0);
  });
});

describe("each lens, checked on its own idea", () => {
  it("lissajous draws the interval's ratio, rolls on the beat, and swaps on a key change", () => {
    const fifth = Array.from({ length: 12 }, (_, i) => (i === 7 ? 1 : i === 0 ? 0.5 : 0));
    const [a, b, c] = play(lissajous, [at({ beats: 0, chroma: fifth }), at({ beats: 1, chroma: fifth }), at({ beats: 1, chroma: fifth, tonic: 2 })]);
    expect([a.a, a.b]).toEqual([3, 2]);
    expect(b.phase).toBe(a.phase + 1);
    expect(c.swapped).toBe(true);
  });

  it("tide rises on the beat, drains with time, and doubles in a spring tide", () => {
    const [a, b] = play(tide, [at({ beats: 0, t: 0 }), at({ beats: 1, t: 0.5 })]);
    expect(b.level).toBeCloseTo(a.level - DRAIN * 0.5 + RISE, 6);
    const c = tide.state(at({ beats: 1, t: 0.6, tonic: 4 }), b);
    const d = tide.state(at({ beats: 2, t: 0.6, tonic: 4 }), c);
    expect(d.level - c.level).toBeCloseTo(RISE * 2, 6);
  });

  it("ripple drops a stone where the loudest note is, lets it fade, and calms on a key change", () => {
    const e = Array.from({ length: 12 }, (_, i) => (i === 4 ? 1 : 0));
    const [, b] = play(ripple, [at({ beats: 0, chroma: e }), at({ beats: 1, chroma: e })]);
    expect(b.drops.map((d) => d.pc)).toEqual([4]);
    expect(ripple.state(at({ beats: 1, t: 0.5 + LIFE + 0.1, chroma: e }), b).drops).toEqual([]);
    expect(ripple.state(at({ beats: 1, t: 0.6, chroma: e, tonic: 9 }), b).drops).toEqual([]);
  });

  it("swarm scatters on the beat, regathers with time, and moves home on a key change", () => {
    const [a, b] = play(swarm, [at({ beats: 0, t: 0 }), at({ beats: 1, t: 0 })]);
    expect(b.spread).toBeCloseTo(Math.min(1, a.spread + KICK), 6);
    expect(swarm.state(at({ beats: 1, t: 3 }), b).spread).toBeLessThan(b.spread / 2);
    expect(swarm.state(at({ beats: 1, t: 0.1, tonic: 6 }), b).home).toBe(0.5);
  });

  it("frost grows a ring a beat, melts in silence, and half-thaws on a key change", () => {
    const rs = play(frost, Array.from({ length: 20 }, (_, n) => at({ beats: n })));
    expect(rs[5].rings).toBe(6);
    expect(rs[19].rings).toBe(RINGS);
    expect(frost.state(at({ beats: 20, t: rs[19].seen.t + MELT_AFTER + 1 }), rs[19]).rings).toBe(RINGS - 2 + 1);
    expect(frost.state(at({ beats: 19, t: 9.6, tonic: 3 }), rs[19]).rings).toBe(RINGS / 2);
  });

  it("kiln heats on the beat and cools with time, and its colour is its heat, not the key", () => {
    const rs = play(kiln, Array.from({ length: 30 }, (_, n) => at({ beats: n, t: n * 0.1 })));
    expect(rs[29].heat).toBeGreaterThan(rs[5].heat);
    /* ten seconds of quiet, frame by frame, from where it got to */
    let cooled = rs[29];
    for (let n = 1; n <= 20; n++) cooled = kiln.state(at({ beats: 29, t: 2.9 + n * 0.5 }), cooled);
    expect(cooled.heat).toBeCloseTo(rs[29].heat * Math.exp(-10 / 7), 6);
    expect(glow(0.1).h).toBeLessThan(glow(0.5).h);
    expect(glow(0.95).s).toBeLessThan(glow(0.5).s);
    const a = kiln.view(kiln.state(at({ tonic: 0 }), null)).colour(0.2, 0, 0);
    const b = kiln.view(kiln.state(at({ tonic: 6 }), null)).colour(0.2, 0, 0);
    expect(b).toEqual(a);
  });

  it("garden grows only the newest stem, and a key change plants another in the new key", () => {
    const rs = play(garden, [at({ beats: 0 }), at({ beats: 1 }), at({ beats: 1, tonic: 5 }), at({ beats: 2, tonic: 5 })]);
    expect(rs[3].stems.map((s) => s.pc)).toEqual([0, 5]);
    expect(rs[3].stems[0].length).toBe(rs[1].stems[0].length);
    expect(rs[3].stems[1].length).toBeGreaterThan(rs[2].stems[1].length);
  });

  it("prism gives a loud note a wider, brighter wedge, turns on the beat, and reorders on a key change", () => {
    const fifth = Array.from({ length: 12 }, (_, i) => (i === 0 ? 1 : i === 7 ? 1 : 0));
    const [a, b, c] = play(prism, [at({ beats: 0, chroma: fifth }), at({ beats: 1, chroma: fifth }), at({ beats: 1, chroma: fifth, tonic: 2 })]);
    const lit = Array.from({ length: 360 }, (_, j) => prism.view(a).place(0.5, j / 360, j).v > 0.8).filter(Boolean).length;
    expect(lit / 360).toBeGreaterThan(0.8);
    expect(b.turns).toBe(a.turns + 1);
    const hues = (st: typeof b) => Array.from({ length: 72 }, (_, j) => prism.view(st).colour(0.5, j / 72, 0).h);
    expect(hues(c)).not.toEqual(hues(b));
  });
});
