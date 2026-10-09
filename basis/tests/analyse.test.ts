/* The whole-track pass, on signals whose seams are known in advance. */

import { describe, expect, it } from "vitest";
import { analyse } from "../src/audio/analyse";

const SR = 8000;
const C_MAJOR = [261.63, 329.63, 392.0];
const FS_MAJOR = [369.99, 466.16, 554.37];

/** stretches of a held chord at a level, end to end */
function track(parts: { secs: number; amp: number; chord?: number[] }[]): Float32Array {
  const total = parts.reduce((a, p) => a + p.secs, 0);
  const pcm = new Float32Array(Math.round(total * SR));
  let o = 0;
  for (const p of parts) {
    const n = Math.round(p.secs * SR);
    for (let i = 0; i < n; i++) {
      const t = (o + i) / SR;
      pcm[o + i] = (p.chord ?? C_MAJOR).reduce((a, f) => a + Math.sin(2 * Math.PI * f * t), 0) * (p.amp / 3);
    }
    o += n;
  }
  return pcm;
}

describe("the whole-track pass", () => {
  it("puts its seams where the loudness changes", () => {
    const a = analyse(track([{ secs: 16, amp: 0.05 }, { secs: 16, amp: 0.8 }, { secs: 16, amp: 0.05 }]), SR);
    expect(a.seams.length).toBeGreaterThanOrEqual(2);
    for (const want of [16, 32]) expect(Math.min(...a.seams.map((s) => Math.abs(s - want)))).toBeLessThan(1.5);
    const loudest = a.sections.reduce((m, s) => (s.energy > m.energy ? s : m));
    expect(loudest.at).toBeGreaterThan(14);
    expect(loudest.until).toBeLessThan(34);
  });

  it("hears a key change at the join, and not elsewhere", () => {
    const a = analyse(track([{ secs: 20, amp: 0.5, chord: C_MAJOR }, { secs: 20, amp: 0.5, chord: FS_MAJOR }]), SR);
    expect(a.keyAt.length).toBe(1);
    expect(Math.abs(a.keyAt[0] - 20)).toBeLessThan(1.5);
    expect(a.sections[0].tonic).toBe(0);
    expect(a.sections[a.sections.length - 1].tonic).toBe(6);
  });

  it("covers the track with sections, end to end, in order", () => {
    const a = analyse(track([{ secs: 12, amp: 0.3 }, { secs: 12, amp: 0.6 }, { secs: 12, amp: 0.2 }]), SR);
    expect(a.sections[0].at).toBe(0);
    expect(a.sections[a.sections.length - 1].until).toBeCloseTo(36, 1);
    a.sections.forEach((s, i) => { if (i) expect(s.at).toBe(a.sections[i - 1].until); });
  });

  it("gives a track with no strong joins a few weak ones, so a setlist has somewhere to put its scenes", () => {
    const a = analyse(track([{ secs: 48, amp: 0.5 }]), SR);
    expect(a.sections.length).toBeGreaterThanOrEqual(2);
  });
});

describe("a key is carried, not re-guessed", () => {
  const F_MAJOR = [349.23, 440.0, 523.25];
  it("does not call a passage on the IV chord a key change", () => {
    /* C, then a long stretch of F chords with C's own notes under them, then C */
    const a = analyse(track([
      { secs: 16, amp: 0.5, chord: C_MAJOR },
      { secs: 16, amp: 0.8, chord: [...F_MAJOR, 261.63, 392.0] },
      { secs: 16, amp: 0.5, chord: C_MAJOR },
    ]), SR);
    expect(a.keyAt).toEqual([]);
  });
});
