/* The globe: an orthographic sphere, turned by the beat and lit by the key. */

import { describe, expect, it } from "vitest";
import { type Sounding, sounding } from "../src/audio/frame";
import { toXY } from "../src/lenses/lens";
import { type GlobeState, MOTES, SPHERE, SUN_SECONDS, globe, noteAt, onSphere, project, sunAt, sunNow } from "../src/lenses/globe";

const frame = (o: { beats?: number; phase?: number; t?: number; tonic?: number; chroma?: number[] } = {}): Sounding => sounding({
  t: o.t ?? (o.beats ?? 0) * 0.5,
  dynamics: { energy: 0.5, beat: 0, flux: 0.3, bright: 0.4 },
  harmony: { chroma: o.chroma ?? Array(12).fill(0.5), tonic: o.tonic ?? 0, minor: false },
  rhythm: { beats: o.beats ?? 0, phase: o.phase ?? 0, bpm: 120 },
});
const state = (o: Parameters<typeof frame>[0] = {}, prev: GlobeState | null = null) => globe.state(frame(o), prev);

describe("the sphere", () => {
  it("covers the sphere evenly, and every projected point lies on it", () => {
    let north = 0;
    for (let i = 0; i < MOTES; i++) {
      const { lat, lon } = onSphere(i);
      if (lat > 0) north++;
      expect(Math.hypot(...project(lat, lon, 0.37))).toBeCloseTo(1, 9);
    }
    expect(Math.abs(north - MOTES / 2)).toBeLessThanOrEqual(1);
  });

  it("shows only the near half, inside the disc", () => {
    const v = globe.view(state());
    let shown = 0;
    for (let i = 0; i < MOTES; i++) {
      const p = v.place(0, 0, i);
      if (p.v > 0) { shown++; expect(p.k).toBeLessThanOrEqual(SPHERE + 1e-9); }
    }
    expect(Math.abs(shown / MOTES - 0.5)).toBeLessThan(0.03);
  });

  it("paints the twelve notes round it in fifths order", () => {
    const bands = Array.from({ length: 12 }, (_, b) => noteAt(((b + 0.5) / 12) * 2 * Math.PI));
    expect(bands).toEqual([0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]);
  });
});

describe("the light", () => {
  it("lights the side facing the sun, and leaves the far side dim", () => {
    const s = state();
    const v = globe.view(s), sun = sunAt(sunNow(s, s.seen.t));
    let day = 0, dayN = 0, night = 0, nightN = 0;
    for (let i = 0; i < MOTES; i++) {
      const { lat, lon } = onSphere(i);
      const p = project(lat, lon, s.spin);
      if (p[2] <= 0) continue;
      const facing = p[0] * sun[0] + p[1] * sun[1] + p[2] * sun[2];
      const lit = v.place(0, 0, i).v;
      if (facing > 0.5) { day += lit; dayN++; } else if (facing < -0.2) { night += lit; nightN++; }
    }
    expect(day / dayN).toBeGreaterThan((night / nightN) * 5);
  });

  it("lights a note's band more brightly the louder that note sounds", () => {
    const quiet = Array(12).fill(0.1), loud = quiet.map((x, pc) => (pc === 0 ? 1 : x));
    const a = globe.view(state({ chroma: quiet })), b = globe.view(state({ chroma: loud }));
    let more = 0;
    for (let i = 0; i < MOTES; i++) if (noteAt(onSphere(i).lon) === 0 && a.place(0, 0, i).v > 0.2) { expect(b.place(0, 0, i).v).toBeGreaterThan(a.place(0, 0, i).v); more++; }
    expect(more).toBeGreaterThan(10);
  });

  it("moves the sun to the new key over a second and a half when the key changes", () => {
    const a = state({ t: 10, tonic: 0 });
    const b = state({ t: 10.1, tonic: 7 }, a);
    expect(b.sunSince).toBe(10.1);
    const mid = sunNow(b, 10.1 + SUN_SECONDS / 2), end = sunNow(b, 10.1 + SUN_SECONDS);
    expect(mid).not.toBe(a.sunTo);
    expect(((end % 1) + 1) % 1).toBeCloseTo(b.sunTo, 9);
  });

  it("draws the terminator square to the light", () => {
    const s = state({ tonic: 4 });
    const sun = sunAt(sunNow(s, s.seen.t));
    const lines = globe.view(s).emblem().filter((m) => "line" in m && m.v === 0.9);
    expect(lines.length).toBeGreaterThan(10);
    for (const m of lines) if ("line" in m) {
      const [x, y] = [m.line[0] / SPHERE, -m.line[1] / SPHERE];
      const z = Math.sqrt(Math.max(0, 1 - x * x - y * y));
      expect(Math.abs(x * sun[0] + y * sun[1] + z * sun[2])).toBeLessThan(0.02);
    }
  });
});

describe("the turn", () => {
  it("never turns back when the tempo estimate moves the phase, only when the song goes back", () => {
    const a = state({ beats: 10, phase: 0.9, t: 5 });
    const b = state({ beats: 10, phase: 0.4, t: 5.1 }, a);
    expect(b.spin).toBe(a.spin);
    const c = state({ beats: 2, phase: 0, t: 1 }, b);
    expect(c.spin).toBeLessThan(b.spin);
  });

  it("turns a twenty-fourth of the way round on each beat", () => {
    const a = state({ beats: 3 }), b = state({ beats: 4 }, a);
    expect(b.spin - a.spin).toBeCloseTo(1 / 24, 9);
    const where = (s: GlobeState) => toXY(globe.view(s).place(0, 0, 5).k, globe.view(s).place(0, 0, 5).a);
    expect(where(b)).not.toEqual(where(a));
  });
});
