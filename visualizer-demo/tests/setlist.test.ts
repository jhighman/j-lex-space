/* A setlist, fitted. The analyses here are literals: fitting reads numbers
   about the parts of a track and nothing of the audio. */

import { describe, expect, it } from "vitest";
import type { Analysis, Section } from "../src/audio/analyse";
import { EXAMPLES } from "../src/setlist/examples";
import { fit, log } from "../src/setlist/fit";
import { type Setlist, check } from "../src/setlist/setlist";

const ID = { name: "t.wav", bytes: 10, sha256: "ab".repeat(32) };

/** a track from a list of part energies (and optionally brightness and key) */
function track(energy: number[], o: { bright?: number[]; tonic?: number[] } = {}): Analysis {
  const sections: Section[] = energy.map((e, i) => ({
    i, at: i * 10, until: (i + 1) * 10, energy: e,
    bright: o.bright?.[i] ?? 0.3, tonic: o.tonic?.[i] ?? 0, minor: false, drift: 0,
  }));
  const keyAt = sections.slice(1).filter((s, i) => s.tonic !== sections[i].tonic).map((s) => s.at);
  return { track: ID, seconds: energy.length * 10, sections, seams: sections.slice(1).map((s) => s.at), keyAt };
}

const ok = (set: Setlist, a: Analysis) => {
  const r = fit(set, a);
  if (!r.ok) throw new Error(r.problems.join("; "));
  return r.plan;
};

const RISING = track([0.1, 0.15, 0.4, 0.7, 0.9, 0.9]);
const FALLING = track([0.9, 0.9, 0.7, 0.4, 0.15, 0.1]);

describe("a setlist gives no times", () => {
  it("refuses a scene that says when", () => {
    expect(check({ title: "x", scenes: [{ name: "a", asks: "the start", at: 12 }] }).join()).toMatch(/gives a time/);
  });

  it("refuses a time hidden in what a scene asks for or how long it spans", () => {
    expect(check({ title: "x", scenes: [{ name: "a", asks: "next", span: "12s" }] }).join()).toMatch(/gives a time/);
    expect(check({ title: "x", scenes: [{ name: "a", asks: "1:30" }] }).join()).toMatch(/gives a time/);
  });

  it("refuses an ask the analysis cannot answer, a lens that does not exist, and a name used twice", () => {
    const p = check({ title: "x", scenes: [
      { name: "a", asks: "the saddest" },
      { name: "b", asks: "next", lens: "jupiter" },
      { name: "b", asks: "next" },
    ] }).join("\n");
    expect(p).toMatch(/cannot find/);
    expect(p).toMatch(/not a lens/);
    expect(p).toMatch(/two scenes are called/);
  });

  it("has no problems in the setlists that ship", () => {
    for (const s of EXAMPLES) expect(check(s), s.title).toEqual([]);
  });
});

describe("fitting", () => {
  for (const s of EXAMPLES)
    for (const [name, a] of [["rising", RISING], ["falling", FALLING], ["flat", track([0.5, 0.5, 0.5])]] as const)
      it(`“${s.title}” on a ${name} track: every scene placed, in order, inside the track`, () => {
        const p = ok(s, a);
        expect(p.scenes.map((x) => x.name)).toEqual(s.scenes.map((x) => x.name));
        p.scenes.forEach((x, k) => {
          expect(x.at).toBeGreaterThanOrEqual(0);
          expect(x.until).toBeLessThanOrEqual(a.seconds);
          expect(x.until).toBeGreaterThan(x.at);
          if (k) expect(x.at).toBe(p.scenes[k - 1].until);
          expect(x.note).toMatch(/^(found|close|missing)/);
        });
      });

  it("fits one setlist to two tracks of opposite shape without editing it", () => {
    const s: Setlist = { title: "x", scenes: [
      { name: "start", asks: "the start" },
      { name: "up", asks: "a build" },
      { name: "down", asks: "a release" },
    ] };
    const r = ok(s, RISING), f = ok(s, FALLING);
    expect(r.scenes[1].outcome).toBe("found");
    expect(f.scenes[2].outcome).toBe("found");
    expect(f.scenes[1].outcome).toBe("close");
    expect(f.scenes[1].note).toMatch(/nothing in reach is a build/);
  });

  it("says what it gave up when the peak is behind a scene", () => {
    const p = ok({ title: "x", scenes: [{ name: "a", asks: "the start", span: "two parts" }, { name: "b", asks: "the peak" }] }, FALLING);
    expect(p.scenes[1].outcome).toBe("close");
    expect(p.scenes[1].note).toMatch(/the peak of the track is at 0\.0s, already behind this scene/);
  });

  it("reports what the track cannot give as missing, and the rule fails", () => {
    const p = ok({ title: "x", rules: ["nothing missing"], scenes: [{ name: "a", asks: "a new key" }] }, RISING);
    expect(p.scenes[0].outcome).toBe("missing");
    expect(p.scenes[0].note).toMatch(/stays in one key/);
    expect(p.rules[0]).toMatchObject({ holds: false });
  });

  it("finds a new key where there is one", () => {
    const p = ok({ title: "x", scenes: [{ name: "a", asks: "the start" }, { name: "b", asks: "a new key" }] }, track([0.5, 0.5, 0.5, 0.5], { tonic: [0, 0, 7, 7] }));
    expect(p.scenes[1]).toMatchObject({ outcome: "found", at: 20 });
    expect(p.scenes[1].note).toMatch(/C major to G major/);
  });

  it("checks every rule, and a rule can fail", () => {
    const p = ok({ title: "x", rules: ["in order", "end on the lull", "scenes at least 25 seconds"], scenes: [
      { name: "a", asks: "the start" }, { name: "b", asks: "the peak" },
    ] }, RISING);
    expect(p.rules.map((r) => r.holds)).toEqual([true, false, false]);
    expect(p.rules[1].note).toMatch(/quietest part is at 0\.0s/);
  });

  it("says once when a setlist asks for more than the track has, and leaves no scene empty", () => {
    const set: Setlist = { title: "x", scenes: Array.from({ length: 6 }, (_, i) => ({ name: `s${i}`, asks: "next" as const, span: "two parts" })) };
    const p = ok(set, track([0.2, 0.5, 0.8]));
    expect(p.notes.join()).toMatch(/asks for \d+ parts and the track has 3/);
    expect(p.notes.join()).toMatch(/share/);
    for (const x of p.scenes) expect(x.until - x.at).toBeGreaterThan(0);
  });

  it("finds a shape where it first clearly happens, not where it is strongest", () => {
    const p = ok({ title: "x", scenes: [{ name: "a", asks: "the start" }, { name: "b", asks: "a build" }, { name: "c", asks: "next" }] },
      track([0.3, 0.45, 0.6, 0.6, 0.6, 0.6, 0.2, 0.6, 0.95]));
    expect(p.scenes[1]).toMatchObject({ outcome: "found", at: 10 });
    expect(p.scenes[1].note).toMatch(/the first clear one \(the strongest is at 60\.0s\)/);
  });

  it("never calls the first part a boundary, and says who a shared part is shared with", () => {
    const a = ok({ title: "x", scenes: [{ name: "a", asks: "a new key" }, { name: "b", asks: "next" }] }, track([0.5, 0.5, 0.5], { tonic: [0, 0, 7] }));
    expect(a.scenes[0].note).not.toMatch(/boundary at 0\.0s/);
    const b = ok({ title: "x", scenes: [{ name: "a", asks: "next" }, { name: "b", asks: "next" }, { name: "c", asks: "the lull" }] }, track([0.5, 0.2]));
    expect(b.scenes[2].note).toMatch(/shares that part with “b”/);
  });

  it("ties the plan and its log to the track", () => {
    const p = ok(EXAMPLES[0], RISING);
    expect(p.track).toEqual(ID);
    expect(log(p).track).toEqual(ID);
    expect(log(p).scenes).toHaveLength(EXAMPLES[0].scenes.length);
  });
});
