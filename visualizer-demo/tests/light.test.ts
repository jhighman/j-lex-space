import { describe, expect, it } from "vitest";
import { MAJOR, MINOR, keyField } from "../src/audio/key";
import { CALM, FIELD_SATURATION, GREY, authored, blend, calmOf, fieldGround, fifthsHue, luxOf, shade } from "../src/law/light";

function hueSat({ r, g, b }: { r: number; g: number; b: number }) {
  const M = Math.max(r, g, b), m = Math.min(r, g, b), c = M - m;
  if (c === 0) return { h: 0, s: 0 };
  const h = M === r ? ((g - b) / c) % 6 : M === g ? (b - r) / c + 2 : (r - g) / c + 4;
  return { h: (h * 60 + 360) % 360, s: c / M };
}

describe("light may not change a colour", () => {
  it("keeps hue and saturation at every lux that does not clip", () => {
    for (let h = 0; h < 360; h += 17)
      for (const s of [0.2, 0.5, 0.9])
        for (const lux of [0.3, 0.86, 1, 1.2]) {
          const a = authored(h, s, 0.6);
          const base = hueSat(shade(a, 1)), lit = hueSat(shade(a, lux));
          expect(lit.h).toBeCloseTo(base.h, 6);
          expect(lit.s).toBeCloseTo(base.s, 6);
        }
  });

  it("returns the authored light exactly in silence", () => expect(luxOf(null)).toBe(1));

  it("swings a quarter, not a half", () => {
    expect(1 - luxOf({ energy: 0, beat: 0, flux: 0, bright: 0 })).toBeLessThanOrEqual(0.25);
    expect(luxOf({ energy: 1, beat: 1, flux: 1, bright: 1 }) - 1).toBeLessThanOrEqual(0.25);
  });
});

describe("the wheel is the circle of fifths", () => {
  it("puts keys a fifth apart side by side, and the tritone opposite", () => {
    expect(fifthsHue(7) - fifthsHue(0)).toBe(30);
    expect(Math.abs(fifthsHue(6) - fifthsHue(0))).toBe(180);
  });

  it("blends the short way round, and a grey takes the other's hue", () => {
    expect(blend(authored(350, 0.5, 1), authored(10, 0.5, 1), 0.5).h).toBeCloseTo(0, 6);
    expect(blend(GREY, authored(120, 0.6, 1), 0.3).h).toBeCloseTo(120, 6);
  });
});

describe("consonance may change saturation, and nothing else", () => {
  const chord = (levels: Record<number, number>, tonic = 0) => ({
    chroma: Array.from({ length: 12 }, (_, i) => levels[i] ?? 0.1), tonic, minor: false,
  });

  it("scales saturation by calm and leaves hue and value alone", () => {
    for (let h = 5; h < 360; h += 23) {
      const a = authored(h, 0.8, 0.7);
      const whole = hueSat(shade(a, 1)), tense = hueSat(shade(a, 1, 0.4));
      expect(tense.h).toBeCloseTo(whole.h, 6);
      expect(tense.s).toBeCloseTo(whole.s * 0.4, 6);
      const v = (c: { r: number; g: number; b: number }) => Math.max(c.r, c.g, c.b);
      expect(v(shade(a, 1, 0.4))).toBeCloseTo(v(shade(a, 1)), 6);
    }
  });

  it("leaves the perfect intervals whole and greys the dissonant ones", () => {
    expect(calmOf(chord({ 0: 1, 7: 0.8 }))).toBe(1);
    expect(calmOf(chord({ 0: 1, 5: 0.8 }))).toBeGreaterThan(0.9);
    expect(calmOf(chord({ 0: 1, 4: 0.8 }))).toBeGreaterThan(0.85);
    expect(calmOf(chord({ 0: 1, 6: 0.8 }))).toBeLessThan(0.45);
    expect(calmOf(chord({ 0: 1, 1: 0.8 }))).toBeLessThan(0.45);
  });

  it("ranks every interval in the textbook order of consonance", () => {
    const [P1, m2, M2, m3, M3, P4, TT, P5, m6, M6, m7, M7] = CALM;
    expect(P1).toBe(1);
    expect(P5).toBe(1);
    expect(P4).toBeGreaterThan(Math.max(M3, M6, m3, m6));
    expect(Math.min(M3, M6, m3, m6)).toBeGreaterThan(Math.max(M2, m7));
    expect(Math.min(M2, m7)).toBeGreaterThan(Math.max(M7, m2, TT));
    expect(Math.min(...CALM)).toBeGreaterThan(0.3);
  });

  it("is whole in silence, and loudness has no say in it", () => {
    expect(calmOf(null)).toBe(1);
    expect(calmOf.length).toBe(1);
  });
});

describe("the key field", () => {
  /* music squarely in a key: the key's own profile, turned to its tonic */
  const inKey = (tonic: number, minor = false) => Array.from({ length: 12 }, (_, i) => (minor ? MINOR : MAJOR)[(i - tonic + 12) % 12]);
  const apart = (x: number, y: number) => Math.abs(((x - y + 540) % 360) - 180);

  it("puts a clear key's ground at that key's hue, within half a fifth", () => {
    /* the relative minor fits too, and pulls it a little way round */
    for (const [tonic, minor] of [[0, false], [7, false], [8, false], [0, true], [9, true]] as const) {
      const g = fieldGround(keyField(inKey(tonic, minor)), 0.05);
      expect(apart(g.h, fifthsHue(tonic)), `${tonic}${minor ? "m" : ""}`).toBeLessThan(15);
      expect(g.v).toBe(0.05);
    }
  });

  it("puts a passage between A-flat major and C minor between their colours, and greyer", () => {
    const ab = keyField(inKey(8)), cm = keyField(inKey(0, true));
    const both = fieldGround(ab.map((w, i) => w + cm[i]), 0.05);
    expect(apart(both.h, fifthsHue(8))).toBeGreaterThan(30);
    expect(apart(both.h, fifthsHue(0))).toBeGreaterThan(30);
    expect(apart(both.h, fifthsHue(8)) + apart(both.h, fifthsHue(0))).toBeCloseTo(apart(fifthsHue(8), fifthsHue(0)), 6);
    expect(both.s).toBeLessThan(fieldGround(ab, 0.05).s);
  });

  it("greys toward the middle when the keys pull far apart", () => {
    const c = keyField(inKey(0)), fs = keyField(inKey(6));
    expect(fieldGround(c.map((w, i) => w + fs[i]), 0.05).s).toBeLessThan(fieldGround(c, 0.05).s * 0.6);
    expect(fieldGround(c, 0.05).s).toBeLessThanOrEqual(FIELD_SATURATION);
  });

  it("is grey with no field at all", () => expect(fieldGround(Array(12).fill(0), 0.05).s).toBe(0));
});
