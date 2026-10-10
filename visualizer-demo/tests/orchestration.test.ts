/* Orchestrations: read, checked, and played cue by cue. */

import { describe, expect, it } from "vitest";
import { due, read, seconds } from "../src/orchestra/orchestration";

const LENSES = ["tide", "pulley", "sunburst"];
const ok = (o: unknown, length: number | null = null) => {
  const r = read(o, LENSES, length);
  if (!r.ok) throw new Error(r.problems.join("; "));
  return r.orchestration;
};
const problems = (o: unknown, length: number | null = null) => {
  const r = read(o, LENSES, length);
  return r.ok ? [] : r.problems;
};

describe("times", () => {
  it("reads seconds and m:ss", () => {
    expect(seconds(12)).toBe(12);
    expect(seconds("12.5")).toBe(12.5);
    expect(seconds("1:21.8")).toBeCloseTo(81.8, 6);
    expect(seconds("0:05")).toBe(5);
    expect(seconds("soon")).toBeNull();
    expect(seconds(-1)).toBeNull();
    expect(seconds("1:75")).toBeNull();
  });
});

describe("reading an orchestration", () => {
  it("reads every kind of cue", () => {
    const o = ok({ title: "t", song: "samples/x.mp3", cues: [
      { at: 0, lens: "tide" }, { at: "0:05", cue: "pulley", note: "ready" }, { at: 6, cut: true },
      { at: 7, pad: "fold" }, { at: 8, blend: "sunburst", amount: 0.5, over: 4 }, { at: 9, reset: true },
      { at: 10, quantise: false }, { at: 11, lens: "none" },
    ] });
    expect(o.cues.map((c) => c.action.kind)).toEqual(["lens", "cue", "cut", "pad", "blend", "reset", "quantise", "lens"]);
    expect(o.cues[1].note).toBe("ready");
    expect(o.cues[4].action).toEqual({ kind: "blend", lens: "sunburst", amount: 0.5, over: 4 });
    expect(o.song).toBe("samples/x.mp3");
  });

  it("blends all the way over two seconds when it does not say", () => {
    expect(ok({ title: "t", cues: [{ at: 1, blend: "tide" }] }).cues[0].action).toEqual({ kind: "blend", lens: "tide", amount: 1, over: 2 });
  });

  it("says what is wrong, in words", () => {
    const p = problems({ title: "", cues: [
      { at: "soon", lens: "tide" }, { at: 2, lens: "jupiter" }, { at: 3, pad: "cymbal" },
      { at: 4, lens: "tide", pad: "fold" }, { at: 5, blend: "tide", amount: 2 }, { at: 1, cut: true },
    ] }).join("\n");
    expect(p).toMatch(/no title/);
    expect(p).toMatch(/no time it can read/);
    expect(p).toMatch(/“jupiter”, which is not a lens/);
    expect(p).toMatch(/“cymbal”, which is not a pad/);
    expect(p).toMatch(/exactly one thing/);
    expect(p).toMatch(/amount is how far/);
    expect(p).toMatch(/time order/);
  });

  it("refuses a cue after the song ends, when it knows how long the song is", () => {
    expect(problems({ title: "t", cues: [{ at: "3:50", cut: true }] }, 220).join()).toMatch(/after the song ends at 3:40/);
    expect(problems({ title: "t", cues: [{ at: "3:50", cut: true }] })).toEqual([]);
  });
});

describe("playing it", () => {
  const o = ok({ title: "t", cues: [{ at: 0, lens: "tide" }, { at: 5, cut: true }, { at: 5, pad: "burst" }, { at: 9, pad: "fold" }] });

  it("plays a cue at the start on the first step", () => {
    expect(due(o.cues, -1, 0.02).map((c) => c.at)).toEqual([0]);
  });

  it("plays each cue once, as the song passes it", () => {
    const steps = [-1, 0.02, 2, 4.99, 5, 5.01, 8.9, 9.2];
    const fired = steps.slice(1).flatMap((t, i) => due(o.cues, steps[i], t).map((c) => c.at));
    expect(fired).toEqual([0, 5, 5, 9]);
  });

  it("plays nothing on a seek backwards", () => {
    expect(due(o.cues, 9.2, 1)).toEqual([]);
  });
});

describe("the orchestrations that ship", () => {
  it("the Christmas orchestration reads cleanly against every lens and the song's 3:39.8", async () => {
    const { readFileSync } = await import("node:fs");
    const { LENSES: ALL } = await import("../src/lenses");
    const json = JSON.parse(readFileSync(new URL("../orchestrations/christmas.json", import.meta.url), "utf8"));
    const r = read(json, ALL.map((l) => l.id), 219.8);
    expect(r.ok ? [] : r.problems).toEqual([]);
  });
});
