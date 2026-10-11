/* The Pulley lens, held to Lex's spec (specs/herbert/semantic_forces.md),
   one claim at a time. */

import { describe, expect, it } from "vitest";
import { type Sounding, sounding } from "../src/audio/frame";
import { toXY } from "../src/lenses/lens";
import { ANCHORS, CORE, FALSE_CENTRE, FORCES, LINE_BEATS, NOUNS, NOUNS_ON_LINE, POEM, type PulleyState, RADIUS, VERB_ON_LINE, WORLD, anchorOf, nounAt, pulley, verbAt } from "../src/lenses/pulley";

const at = (beats: number, o: { t?: number; minor?: boolean; tonic?: number } = {}): Sounding => sounding({
  t: o.t ?? beats * 0.5,
  dynamics: { energy: 0.5, beat: 0, flux: 0.3, bright: 0.4 },
  harmony: { chroma: Array(12).fill(0.3), tonic: o.tonic ?? 0, minor: o.minor ?? false },
  rhythm: { beats, phase: 0.2, bpm: 120 },
});

/** play from the start of a line until n beats into it */
function onLine(line: number, n: number, o: { minor?: boolean } = {}): PulleyState[] {
  const start = line * LINE_BEATS;
  let s: PulleyState | null = null;
  const out: PulleyState[] = [];
  for (let b = 0; b <= start + n; b++) { s = pulley.state(at(b, o), s); out.push(s); }
  return out.slice(start);
}

/** where mote i actually is, in the body's coordinates, centre included */
function where(s: PulleyState, i: number): [number, number] {
  const v = pulley.view(s);
  const k = 0.94 * Math.sqrt(i / 400), a = i * 0.381966;
  const p = v.place(k, a, i);
  const [x, y] = toXY(p.k, p.a);
  const [cx, cy] = v.centre();
  return [x + cx, y + cy];
}
const meanDistance = (s: PulleyState) => {
  let d = 0;
  for (let i = 0; i < 400; i++) d += Math.hypot(...where(s, i));
  return d / 400;
};

describe("the poem and its verbs", () => {
  it("carries the twenty lines of the poem, and the eleven verbs of the spec", () => {
    expect(POEM).toHaveLength(20);
    expect(Object.keys(FORCES).sort()).toEqual(["adore", "bestow", "contract", "dispersed", "flowed", "keep", "lead", "pour", "rest", "stay", "toss"]);
  });

  it("finds each verb on its line in the text, and reads 'Rest in the bottom lay' as the noun", () => {
    const found = VERB_ON_LINE.map((v, i) => (v ? `${i + 1}:${v}` : null)).filter(Boolean);
    expect(found).toEqual(["3:pour", "4:dispersed", "5:contract", "7:flowed", "8:stay", "12:bestow", "13:adore", "14:rest", "16:keep", "17:keep", "19:lead", "20:toss"]);
  });

  it("classifies the forces as the spec does", () => {
    for (const v of ["pour", "dispersed", "flowed", "bestow"]) expect(FORCES[v]).toBe("centrifugal");
    for (const v of ["contract", "lead"]) expect(FORCES[v]).toBe("centripetal");
    expect(FORCES.stay).toBe("stabilizing");
    expect(FORCES.keep).toBe("containment");
    expect(FORCES.adore).toBe("false attraction");
    expect(FORCES.rest).toBe("competing equilibrium");
  });

  it("keeps a verb in force until the next one, and has none before the first", () => {
    expect(verbAt(0)).toBeNull();
    expect(verbAt(5)).toBe("contract");
    expect(verbAt(9)).toBe("stay");
  });
});

describe("the nouns anchor (spec §4), placed by its topology (§1)", () => {
  it("finds the nouns on each line in the text, and never the word read as the line's verb", () => {
    const found = NOUNS_ON_LINE.map((ns, i) => (ns.length ? `${i + 1}:${ns.join(",")}` : null)).filter(Boolean);
    expect(found).toEqual([
      "1:god,man", "2:glass,blessings", "4:world,riches", "5:span", "6:strength", "7:beauty,wisdom,honour,pleasure",
      "8:god", "9:treasure", "10:rest", "12:jewel,creature", "13:gifts", "14:nature,god", "16:rest", "20:breast",
    ]);
    /* "rest in Nature" is the verb; Nature is the noun */
    expect(VERB_ON_LINE[13]).toBe("rest");
    expect(NOUNS_ON_LINE[13]).not.toContain("rest");
  });

  it("places every noun once, where it is first read: the core at the centre, the orbit between, the world at the rim beside its line", () => {
    expect(ANCHORS.map((a) => a.word)).toEqual([...new Set(NOUNS_ON_LINE.flat())]);
    for (const a of ANCHORS) {
      expect(Math.hypot(...a.at)).toBeCloseTo(RADIUS[a.region], 9);
      if (a.region !== "core") {
        /* within its line's arc: the arc spans line/20 .. (line+1)/20 turns */
        const turns = ((Math.atan2(a.at[1], a.at[0]) / (2 * Math.PI)) % 1 + 1) % 1;
        expect(turns).toBeGreaterThan(a.line / POEM.length);
        expect(turns).toBeLessThan((a.line + 1) / POEM.length);
      }
    }
    /* no two anchors off the core stand on one point */
    const off = ANCHORS.filter((a) => a.region !== "core");
    for (const a of off) for (const b of off) if (a !== b) expect(Math.hypot(a.at[0] - b.at[0], a.at[1] - b.at[1])).toBeGreaterThan(0.02);
    /* a line's nouns keep the line's order round the rim */
    const line7 = off.filter((a) => a.line === 6).map((a) => a.word);
    expect(line7).toEqual(["beauty", "wisdom", "honour", "pleasure"]);
    expect(RADIUS.core).toBe(0);
    expect(RADIUS.orbit).toBeGreaterThan(RADIUS.core);
    expect(RADIUS.world).toBeGreaterThan(RADIUS.orbit);
    expect(anchorOf("god")).toEqual([0, 0]);
    expect(() => anchorOf("fulcrum")).toThrow();
  });

  it("a noun anchors its line and every line after it until the next, as a verb does", () => {
    expect(nounAt(0)).toBe("god");
    expect(nounAt(2)).toBe("glass");
    expect(nounAt(10)).toBe("rest");
    expect(nounAt(18)).toBe("rest");
    expect(nounAt(19)).toBe("breast");
  });

  it("the points the forces reach for are nouns: the gifts adored, the Nature rested in, the breast tossed to", () => {
    expect(WORLD).toEqual(anchorOf("gifts"));
    expect(NOUNS.gifts).toBe("world");
    expect(FALSE_CENTRE).toEqual(anchorOf("nature"));
    expect(NOUNS.nature).toBe("world");
    expect(CORE).toEqual(anchorOf("breast"));
    expect(CORE).toEqual([0, 0]);
  });

  it("draws every anchor off the core beside its line, and names the one anchoring the line being read", () => {
    const marks = pulley.view(onLine(12, 0)[0]).emblem();
    const named = marks.filter((m) => "text" in m).map((m) => ("text" in m ? m.text[2] : ""));
    expect(named).toEqual(["gifts"]);
    const dots = marks.filter((m) => "dot" in m && m.dot[2] === 0.018);
    expect(dots.length).toBe(ANCHORS.filter((a) => a.region !== "core").length);
    /* a core noun is named at the centre, under the fulcrum */
    const atRest = pulley.view(onLine(9, 0)[0]).emblem().find((m) => "text" in m);
    expect(atRest && "text" in atRest ? atRest.text : null).toEqual([0, 0.17, "rest"]);
  });

  it("says in its label where the body is anchored", () => {
    expect(pulley.label(onLine(13, 0)[0])).toContain("at nature, world");
  });
});

describe("each force does what the spec says", () => {
  it("pour expands the body outward", () => {
    const s = onLine(2, LINE_BEATS - 1);
    expect(s[s.length - 1].spread).toBeGreaterThan(s[0].spread);
  });

  it("contract draws it inward", () => {
    const s = onLine(4, LINE_BEATS - 1);
    expect(s[s.length - 1].spread).toBeLessThan(s[0].spread);
  });

  it("stay arrests everything: nothing moves for the whole line", () => {
    const s = onLine(7, LINE_BEATS - 1);
    const last = s[s.length - 1];
    expect(last.spread).toBe(s[0].spread);
    expect(last.drift).toEqual(s[0].drift);
  });

  it("keep holds energy without moving the body", () => {
    const s = onLine(15, LINE_BEATS - 1);
    const last = s[s.length - 1];
    expect(last.potential).toBeGreaterThan(s[0].potential);
  });

  it("adore pulls the whole body off its true centre, toward the world", () => {
    const s = onLine(12, LINE_BEATS - 1);
    const d = (x: PulleyState) => Math.hypot(x.drift[0] - WORLD[0], x.drift[1] - WORLD[1]);
    expect(d(s[s.length - 1])).toBeLessThan(d(s[0]));
  });

  it("rest sets up a false centre that half the body settles round", () => {
    const s = onLine(13, LINE_BEATS - 1);
    const last = s[s.length - 1];
    expect(last.falseRest).toBeGreaterThan(0.5);
    const [x, y] = where(last, 401);
    expect(Math.hypot(x - FALSE_CENTRE[0], y - FALSE_CENTRE[1])).toBeLessThan(Math.hypot(x, y));
  });
});

describe("the key invariant: toss is locally disruptive and globally restorative", () => {
  const before = onLine(19, 0)[0];
  const tossed = onLine(19, 2);
  const after = tossed[tossed.length - 1];

  it("throws every mote about: positions jump between moments", () => {
    const jump = (s: PulleyState) => {
      const later = { ...s, seen: { ...s.seen, t: s.seen.t + 0.05 } };
      let d = 0;
      for (let i = 0; i < 200; i++) { const [a, b] = where(s, i), [c, e] = where(later, i); d += Math.hypot(a - c, b - e); }
      return d / 200;
    };
    expect(after.shake).toBe(1);
    /* at least three times the trembling of the energy kept before it */
    expect(jump(after)).toBeGreaterThan(jump(before) * 3);
  });

  it("and brings the body home: nearer the true centre, the false one and the world let go, the kept energy released", () => {
    const calm = (s: PulleyState) => ({ ...s, shake: 0 });
    expect(meanDistance(calm(after))).toBeLessThan(meanDistance(calm(before)));
    expect(Math.hypot(...after.drift)).toBeLessThan(Math.hypot(...before.drift) + 1e-9);
    expect(after.falseRest).toBeLessThan(before.falseRest + 1e-9);
    expect(after.potential).toBeLessThan(before.potential);
  });
});

describe("the emotional arcs", () => {
  it("joy radiates outward without coming away from the centre", () => {
    const s = onLine(6, LINE_BEATS * 6);
    for (const x of s) expect(x.spread).toBeLessThanOrEqual(1);
    expect(pulley.view(s[0]).folds(1)).toBe(2);
  });

  it("sorrow draws inward, tied to the fulcrum by tension cords", () => {
    const joy = onLine(5, 4)[4], sorrow = onLine(5, 4, { minor: true })[4];
    expect(sorrow.spread).toBeLessThan(joy.spread);
    const cords = pulley.view(sorrow).emblem().filter((m) => "line" in m && m.line[0] === 0 && m.line[1] === 0 && m.line[3] !== -1.28);
    expect(cords.length).toBe(12);
  });

  /** the arc at every beat, for a run of beats whose mode is given */
  const arcs = (minorAt: (b: number) => boolean, beats: number) => {
    let s: PulleyState | null = null;
    const out: boolean[] = [];
    for (let b = 0; b < beats; b++) { s = pulley.state(at(b, { minor: minorAt(b) }), s); out.push(s.joy); }
    return out;
  };
  const changes = (xs: boolean[]) => xs.filter((x, i) => i > 0 && x !== xs[i - 1]).length;

  it("turns to sorrow when the music stays minor, and only at the end of a line", () => {
    const a = arcs((b) => b >= LINE_BEATS * 2, LINE_BEATS * 8);
    const turn = a.indexOf(false);
    expect(turn).toBeGreaterThan(LINE_BEATS * 2);
    /* lines end on beats 8, 16, 24…: the first frame is not a beat */
    expect(turn % LINE_BEATS).toBe(0);
    expect(a.slice(turn).every((x) => !x)).toBe(true);
  });

  it("holds its arc while the key alternates half and half, chord by chord", () => {
    /* major and minor alternating every four beats, as an A-flat / C minor vamp did */
    expect(changes(arcs((b) => Math.floor(b / 4) % 2 === 1, LINE_BEATS * 20))).toBe(0);
    /* and every line */
    expect(changes(arcs((b) => Math.floor(b / LINE_BEATS) % 2 === 1, LINE_BEATS * 20))).toBe(0);
  });

  it("holds a change for at least two lines", () => {
    const a = arcs((b) => Math.floor(b / (LINE_BEATS * 5)) % 2 === 0, LINE_BEATS * 40);
    let run = 0;
    for (let i = 1; i < a.length; i++) {
      if (a[i] !== a[i - 1]) { if (run) expect(run).toBeGreaterThanOrEqual(LINE_BEATS * 2); run = 0; }
      run++;
    }
  });

  it("comes back to joy when the music stays major again", () => {
    const a = arcs((b) => b < LINE_BEATS * 6, LINE_BEATS * 16);
    expect(a[LINE_BEATS * 6]).toBe(false);
    expect(a[a.length - 1]).toBe(true);
  });

  it("a key change recolours the world at the rim, and leaves the centre and the reading alone", () => {
    const s = onLine(2, 1);
    const last = s[s.length - 1];
    const moved = pulley.state(at(18, { tonic: 7 }), last);
    expect(moved.line).toBe(last.line);
    const [a, b] = [pulley.view(last), pulley.view(moved)];
    expect(b.colour(0, 0, 0)).toEqual(a.colour(0, 0, 0));
    expect(b.colour(1, 0, 0).h).not.toBe(a.colour(1, 0, 0).h);
  });

  it("reads the poem in order, whatever the key does", () => {
    let s: PulleyState | null = null;
    const lines: number[] = [];
    for (let b = 0; b < LINE_BEATS * 20; b++) {
      s = pulley.state(at(b, { tonic: (b * 7) % 12, minor: b % 3 === 0 }), s);
      if (!lines.length || lines[lines.length - 1] !== s.line) lines.push(s.line);
    }
    expect(lines).toEqual(Array.from({ length: 20 }, (_, i) => i));
  });

  it("sets the line being read under the body", () => {
    expect(pulley.view(onLine(19, 0)[0]).words()).toBe("May toss him to my breast.”");
  });
});
