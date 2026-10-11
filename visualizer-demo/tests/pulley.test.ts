/* The Pulley lens, held to Lex's spec (specs/herbert/semantic_forces.md),
   one claim at a time. */

import { describe, expect, it } from "vitest";
import { type Sounding, sounding } from "../src/audio/frame";
import { toXY } from "../src/lenses/lens";
import { ANCHORS, CHARGE, CHARGE_ON_LINE, CORE, HOIST, LIFT_FROM, lift, FALSE_CENTRE, FORCES, LINE_BEATS, NOUNS, NOUNS_ON_LINE, POEM, type PulleyState, RADIUS, TOLERANCE, TO_JOY, TO_SORROW, VERB_ON_LINE, WORLD, anchorOf, chargeOf, ground, nounAt, pulley, verbAt } from "../src/lenses/pulley";

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
  const tossed = onLine(19, 1);
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

describe("the toss arrives: Lex's staged grounding (specs/test_harmonic_grounding.py)", () => {
  it("is a decade nearer home each beat, and absorbs once the remainder is within tolerance", () => {
    expect(ground(0)).toBe(0);
    expect([1, 2, 3, 4].map(ground)).toEqual([0.9, 0.99, 0.999, 0.9999]);
    expect(1 - ground(4)).toBeGreaterThan(TOLERANCE);
    expect(ground(5)).toBe(1);
    expect(ground(9)).toBe(1);
  });

  it("grounds the body from where the toss found it: drift, the false centre and the kept energy each shrink a decade a beat", () => {
    const s = onLine(19, 4);
    const from = s[1].departure!;
    expect(from.drift).toEqual(s[0].drift);
    expect(from.potential).toBe(s[0].potential);
    for (let k = 1; k <= 4; k++) {
      const left = 10 ** -k;
      expect(s[k].stages).toBe(k);
      expect(Math.hypot(...s[k].drift)).toBeCloseTo(Math.hypot(...from.drift) * left, 12);
      expect(s[k].falseRest).toBeCloseTo(from.falseRest * left, 12);
      expect(s[k].potential).toBeCloseTo(from.potential * left, 12);
      expect(s[k].spread).toBeCloseTo(from.spread + (from.homeSpread - from.spread) * (1 - left), 12);
    }
  });

  it("is home exactly on the fifth beat, not nearly, and holds there for the rest of the line", () => {
    const s = onLine(19, LINE_BEATS - 1);
    expect(Math.hypot(...s[4].drift)).toBeGreaterThan(0);
    for (let k = 5; k < s.length; k++) {
      expect(s[k].drift).toEqual([CORE[0], CORE[1]]);
      expect(s[k].falseRest).toBe(0);
      expect(s[k].potential).toBe(0);
      expect(s[k].spread).toBe(s[5].spread);
      expect(pulley.label(s[k])).toContain("· home");
    }
    expect(pulley.label(s[2])).toContain("grounding 0.99");
  });

  it("stays home through the lines that carry no verb, and lets go when the next verb acts", () => {
    let s: PulleyState | null = null;
    const states: PulleyState[] = [];
    for (let b = 0; b <= 19 * LINE_BEATS + 26; b++) { s = pulley.state(at(b), s); states.push(s); }
    const home = (x: PulleyState) => ground(x.stages) === 1;
    /* the two verbless lines after the toss, and pour's first beat */
    for (let b = 19 * LINE_BEATS + 8; b <= 19 * LINE_BEATS + 24; b++) { expect(home(states[b])).toBe(true); expect(states[b].drift).toEqual([0, 0]); }
    const poured = states[19 * LINE_BEATS + 25];
    expect(poured.line).toBe(2);
    expect(home(poured)).toBe(false);
    expect(poured.stages).toBe(0);
    expect(poured.departure).toBeNull();
    expect(poured.spread).toBeGreaterThan(states[19 * LINE_BEATS + 24].spread);
  });

  it("draws the rope taut once home", () => {
    const rope = (x: PulleyState) => pulley.view(x).emblem().find((m) => "line" in m && m.line[3] === -1.28);
    const v = (m: ReturnType<typeof rope>) => (m && "v" in m ? m.v ?? 0 : 0);
    expect(v(rope(onLine(19, 2)[2]))).toBeLessThan(0.5);
    expect(v(rope(onLine(19, 6)[6]))).toBeGreaterThan(0.7);
  });
});

describe("the rope stages the charge's elevation (spec §4's Z), in the plane", () => {
  const reading = () => {
    let s: PulleyState | null = null;
    const out: PulleyState[] = [];
    for (let b = 0; b <= LINE_BEATS * POEM.length + 2; b++) { s = pulley.state(at(b), s); out.push(s); }
    return out;
  };
  const states = reading();
  const atLine = (line: number) => states[(line - 1) * LINE_BEATS];

  it("lifts nothing below the threshold, and past it rises with the amplitude, faster at first", () => {
    expect(lift(0)).toBe(0);
    expect(lift(LIFT_FROM)).toBe(0);
    expect(lift(-LIFT_FROM)).toBe(0);
    expect(lift(1)).toBe(HOIST);
    expect(lift(-1)).toBe(HOIST);
    const mid = (LIFT_FROM + 1) / 2;
    expect(lift(mid)).toBeGreaterThan(HOIST / 2);
    expect(lift(mid)).toBeLessThan(HOIST);
  });

  it("the body stands on the plane while the charge is small: its centre is where it has drifted", () => {
    for (let line = 1; line <= 15; line++) {
      const s = atLine(line);
      expect(pulley.view(s).centre()).toEqual([s.drift[0], s.drift[1]]);
    }
  });

  it("'repining restlessness' hoists it up the rope, and the rope shows the length taking the weight", () => {
    const s = atLine(18);
    expect(Math.abs(s.charge)).toBe(1);
    const [x, y] = pulley.view(s).centre();
    expect(x).toBe(s.drift[0]);
    expect(y).toBeCloseTo(s.drift[1] - HOIST, 12);
    const rope = pulley.view(s).emblem().find((m) => "line" in m && m.line[1] === -1.28);
    expect(rope && "line" in rope ? rope.line[3] : null).toBeCloseTo(-HOIST, 12);
    expect(pulley.label(s)).toContain("hoisted 0.50");
  });

  it("the toss grounds the hoist with the charge: home, the body is on the fulcrum", () => {
    const toss = 19 * LINE_BEATS;
    expect(pulley.view(states[toss]).centre()[1]).toBeLessThan(-0.4);
    expect(pulley.view(states[toss + 5]).centre()).toEqual([0, 0]);
    expect(pulley.label(states[toss + 5])).not.toContain("hoisted");
  });
});

describe("the emotional arcs come from the text's charge (spec §4), not the key", () => {
  /** every state of a full reading of the poem, in a key that is minor or major throughout */
  const reading = (minor: boolean) => {
    let s: PulleyState | null = null;
    const out: PulleyState[] = [];
    for (let b = 0; b <= LINE_BEATS * POEM.length + 2; b++) { s = pulley.state(at(b, { minor }), s); out.push(s); }
    return out;
  };
  /** the state at the start of a line (1-based), after the previous line's last beat */
  const atLine = (states: PulleyState[], line: number) => states[(line - 1) * LINE_BEATS];
  const major = reading(false), minor = reading(true);

  it("finds the charge words on their lines in the text, with the valence the poem gives them", () => {
    const found = CHARGE_ON_LINE.map((ws, i) => (ws.length ? `${i + 1}:${ws.join(",")}` : null)).filter(Boolean);
    expect(found).toEqual(["15:losers", "17:repining,restlessness", "18:rich,weary", "19:goodness,weariness"]);
    expect(chargeOf(16)).toBe(-2);
    expect(chargeOf(17)).toBe(0);
    expect(CHARGE.rich).toBe(1);
    expect(CHARGE.weary).toBe(-1);
  });

  it("a word is one thing: no charge word is a noun anchor or a verb", () => {
    for (const w of Object.keys(CHARGE)) { expect(w in NOUNS).toBe(false); expect(w in FORCES).toBe(false); }
  });

  it("begins in joy, and the key does not turn it: the first sixteen lines are joy in a minor key as in a major one", () => {
    for (let line = 1; line <= 17; line++) { expect(atLine(major, line).joy).toBe(true); expect(atLine(minor, line).joy).toBe(true); }
  });

  it("joy radiates outward without coming away from the centre", () => {
    const s = onLine(6, LINE_BEATS * 6);
    for (const x of s) expect(x.spread).toBeLessThanOrEqual(1);
    expect(pulley.view(s[0]).folds(1)).toBe(2);
  });

  it("'repining restlessness' drives the charge down through its line, and the arc turns to sorrow at the line's end, whatever the key", () => {
    for (const r of [major, minor]) {
      const before = atLine(r, 17), after = atLine(r, 18);
      expect(before.joy).toBe(true);
      expect(after.charge).toBeLessThan(before.charge);
      expect(after.charge).toBeLessThanOrEqual(TO_SORROW);
      expect(after.joy).toBe(false);
      /* and only at the end: the line itself is still joy */
      for (let k = 1; k < LINE_BEATS; k++) expect(r[16 * LINE_BEATS + k].joy).toBe(true);
    }
  });

  it("'rich and weary' hold each other: the charge does not move on their line", () => {
    const before = atLine(major, 18), after = atLine(major, 19);
    expect(after.charge).toBeCloseTo(before.charge, 12);
    expect(after.joy).toBe(false);
  });

  it("sorrow draws inward, tied to the fulcrum by cords lit by the charge's amplitude", () => {
    /* line 18 has keep in force, which leaves the spread alone: what draws
       the body in over the line is sorrow (by line 17's end, joy had the spread at its cap) */
    expect(atLine(major, 18).spread).toBe(1);
    const sorrow = atLine(major, 19);
    expect(sorrow.spread).toBeLessThan(atLine(major, 18).spread);
    const cords = pulley.view(sorrow).emblem().filter((m) => "line" in m && m.line[0] === 0 && m.line[1] === 0 && m.line[3] !== -1.28);
    expect(cords.length).toBe(12);
    expect(cords[0].v).toBeGreaterThan(0.8);
  });

  it("the toss grounds the charge with everything else, and arriving home is what restores joy", () => {
    const toss = 19 * LINE_BEATS;
    expect(major[toss].charge).toBeLessThanOrEqual(TO_SORROW);
    expect(major[toss + 1].charge).toBeCloseTo(major[toss].charge * 0.1, 12);
    expect(major[toss + 5].charge).toBe(0);
    expect(major[toss + 5].joy).toBe(false);
    expect(major[toss + 5].charge).toBeGreaterThan(TO_JOY);
    expect(atLine(major, 21).joy).toBe(true);
    expect(minor[toss + LINE_BEATS].joy).toBe(true);
  });

  it("a line with no charge word lets the charge fade, so 'losers' alone does not turn the arc", () => {
    const lost = atLine(major, 16), later = atLine(major, 17);
    expect(lost.charge).toBeLessThan(0);
    expect(lost.charge).toBeGreaterThan(TO_SORROW);
    expect(Math.abs(later.charge)).toBeLessThan(Math.abs(lost.charge));
    expect(later.joy).toBe(true);
  });

  it("says the charge, and the words moving it, in its label", () => {
    expect(pulley.label(onLine(16, 3)[3])).toMatch(/sorrow|joy/);
    expect(pulley.label(onLine(16, 3)[3])).toContain("(repining, restlessness)");
    expect(pulley.label(onLine(16, 3)[3])).toMatch(/charge −0\.\d\d/);
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
