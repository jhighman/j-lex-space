/* The hand, played with literal frames: no page, no pointer, no audio. */

import { describe, expect, it } from "vitest";
import { sounding, silent } from "../src/audio/frame";
import { Hand, PATIENCE } from "../src/hand/hand";
import { LENSES, PLAIN } from "../src/lenses";
import { mix } from "../src/lenses/mix";

const beat = (beats: number, t = 0) => sounding({
  t,
  dynamics: { energy: 0.5, beat: 0, flux: 0, bright: 0.3 },
  harmony: { chroma: Array(12).fill(0.1), tonic: 0, minor: false },
  rhythm: { beats, phase: 0.5, bpm: 120 },
});

describe("the hand proposes, the beat disposes", () => {
  it("arms a pad between beats and lands it on the next onset", () => {
    const h = new Hand();
    h.step(beat(4), 0);
    h.press("burst", 0.1);
    expect(h.step(beat(4), 0.2)).toEqual([]);
    expect(h.isArmed("burst")).toBe(true);
    expect(h.step(beat(5), 0.3)).toEqual(["burst"]);
    expect(h.view(0.3).burst).toBe(1);
    expect(h.view(1.5).burst).toBe(0);
  });

  it("lands anyway if the music gives no onset, so no pad waits forever", () => {
    const h = new Hand();
    h.step(beat(4), 0);
    h.press("reverse", 0);
    expect(h.step(beat(4), PATIENCE - 0.01)).toEqual([]);
    expect(h.step(beat(4), PATIENCE + 0.01)).toEqual(["reverse"]);
    expect(h.view(1).reverse).toBe(true);
  });

  it("lands at once when nothing is playing, or when quantising is off", () => {
    const h = new Hand();
    h.press("trails", 0);
    expect(h.step(silent(0), 0.01)).toEqual(["trails"]);
    const g = new Hand();
    g.quantise = false;
    g.step(beat(1), 0);
    g.press("fold", 0.1);
    expect(g.view(0.1).folds).toBe(2);
  });

  it("does not arm the same pad twice", () => {
    const h = new Hand();
    h.step(beat(1), 0);
    h.press("fold", 0); h.press("fold", 0.05);
    h.step(beat(2), 0.1);
    expect(h.view(0.1).folds).toBe(2);
  });

  it("cuts across to the other deck over one beat", () => {
    const h = new Hand();
    h.step(beat(1), 0);
    expect(h.onAir()).toBe("a");
    h.press("cut", 0);
    h.step(beat(2), 0.1);
    h.step(beat(2), 0.35);
    const mid = h.view(0.35).fader;
    expect(mid).toBeGreaterThan(0.2);
    expect(mid).toBeLessThan(0.8);
    h.step(beat(2), 0.7);
    expect(h.view(0.7).fader).toBe(1);
    expect(h.onAir()).toBe("b");
  });
});

describe("the crossfader shows nothing neither lens showed", () => {
  const a = LENSES[0].view(LENSES[0].state(beat(3), null));
  const b = LENSES[3].view(LENSES[3].state(beat(3), null));
  /* a mote at radius k, part of the way across */

  it("is each deck at its ends", () => {
    expect(mix(a, b, 0)).toBe(a);
    expect(mix(a, b, 1)).toBe(b);
  });

  it("says nothing between them that neither said", () => {
    const m = mix(a, b, 0.5);
    for (const r of [0.2, 0.6]) {
      const lo = Math.min(a.shell(r), b.shell(r)), hi = Math.max(a.shell(r), b.shell(r));
      expect(m.shell(r)).toBeGreaterThanOrEqual(lo);
      expect(m.shell(r)).toBeLessThanOrEqual(hi);
    }
    expect([a.folds(1), b.folds(1)]).toContain(m.folds(1));
    for (const k of [0.1, 0.5, 0.9]) {
      const v = m.place(k, 0.2, 3).v, va = a.place(k, 0.2, 3).v, vb = b.place(k, 0.2, 3).v;
      expect(v).toBeGreaterThanOrEqual(Math.min(va, vb) - 1e-9);
      expect(v).toBeLessThanOrEqual(Math.max(va, vb) + 1e-9);
    }
  });

  it("fades each lens in its own way: frost freezes outward, prism comes in wedge by wedge", () => {
    const fr = LENSES.find((l) => l.id === "frost")!, pr = LENSES.find((l) => l.id === "prism")!;
    const vf = fr.view(fr.state(beat(3), null)), vp = pr.view(pr.state(beat(3), null));
    expect(vf.blendIn(0.5, 0.2)).toBe(1);
    expect(vf.blendIn(0.5, 0.9)).toBe(0);
    expect(new Set([0.1, 0.12, 0.14].map((x) => vp.blendIn(x, 0.5))).size).toBe(1);
  });

  it("turns the short way round", () => {
    const u = { ...PLAIN, turn: () => 0.95 }, v = { ...PLAIN, turn: () => 0.05 };
    expect(mix(u, v, 0.5).turn(0)).toBeCloseTo(1, 5);  // through 1.0, not back through 0.5
  });
});

describe("a take", () => {
  it("writes MP4 where the browser can, and says WebM where it cannot", async () => {
    const { format } = await import("../src/record/take");
    expect(format((m) => m.startsWith("video/mp4"))?.ext).toBe("mp4");
    expect(format((m) => m.startsWith("video/webm"))?.ext).toBe("webm");
    expect(format(() => false)).toBeNull();
  });
});

describe("a timed blend", () => {
  it("glides the fader to a position over the seconds asked", () => {
    const h = new Hand();
    h.step(beat(1), 0);
    h.glideFader(0.5, 0, 4);
    h.step(beat(1), 2);
    const mid = h.view(2).fader;
    expect(mid).toBeGreaterThan(0.1);
    expect(mid).toBeLessThan(0.4);
    h.step(beat(1), 4);
    expect(h.view(4).fader).toBe(0.5);
  });
});
