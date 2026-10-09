import { describe, expect, it } from "vitest";
import { GREY, authored, blend, fifthsHue, luxOf, shade } from "../src/law/light";

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
