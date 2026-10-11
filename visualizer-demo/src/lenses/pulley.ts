/* Pulley: George Herbert's "The Pulley" (1633), drawn as forces round a
   centre. The design is Lex's, in `specs/herbert/semantic_forces.md`:

   - The centre is the core the poem pulls toward — Rest, the fulcrum of
     the pulley. The rim is the human course through the verse and through
     time.
   - Each of the poem's principal verbs is a force: some push outward
     (pour, dispersed, flowed, bestow), some draw inward (contract, lead);
     stay fixes everything in place; keep holds energy without letting it
     move; adore pulls the body off its true centre toward the world; rest
     sets up a second, false centre that competes with the true one; and
     toss shakes everything while bringing it home.
   - The same verb can be locally disruptive and globally restorative.
     Toss is how the poem ends, and how everything is reunited.
   - Joy radiates outward from the centre without coming away from it;
     sorrow is a heavy pull inward, tied to the centre by tension cords.
   - Nouns are anchors (spec §4): the reference points the verbs act
     between. Without them the actions float. Each noun the poem names is
     placed where §1's topology puts it — the core, the human orbit, or
     the world at the rim — beside the line it is first read on, and the
     three points the forces reach for (the world adore drifts to, the
     false centre rest settles round, the breast toss comes home to) are
     the places of the nouns that name them.
   - Toss arrives. Lex's staged grounding (specs/test_harmonic_grounding.py)
     takes the body a decade nearer home on each beat of the toss — 0.9,
     0.99, 0.999 of the way — and once what is left is within tolerance it
     is home exactly, and holds there until the next verb acts. An ease
     that only ever gets nearer never arrives; this one does.

   How the music and the poem divide the work:

     the poem    sets the force. It is read in order, one line every eight
                 beats; a verb acts from its line until the next verb takes
                 over.
     a beat      applies the force once, and moves the reading on
     the key     colours the world: the rim takes the key's colour, bright
                 in a major key (joy) and dark in a minor one (sorrow). A key
                 change recolours the world and leaves the centre, gold,
                 exactly as it was.
     the arc     joy or sorrow follows how minor the music has been over
                 the last four lines or so, and changes only with
                 conviction: to sorrow when that passes 65%, back to joy
                 below 35%, only at the end of a line, and never again
                 within two lines of the last change.

   The arc has a memory because the live key follows the chords. On a track
   that alternates A-flat major and C minor chords — two triads with two
   notes in common — the live key alternated with them, and Pulley flipped
   between joy and sorrow every four to eight seconds for two minutes,
   turning the cords and the symmetry on and off. Deciding once a line was
   not enough, because successive lines really did lean different ways, and
   a shorter memory still turned twice in four seconds. An alternation that
   is half minor now leaves the arc where it is; a passage that stays minor
   turns it to sorrow about four lines in, and it stays.

   A key change does not move the reading. It once turned the poem to its
   next stanza, and on a real track the live key wavered often enough that
   the poem was read out of order — line 16, then 12, then 1.

   Colour comes from the poem's geometry and the key, never from loudness:
   gold at the centre, the world's colour at the rim, and rose wherever the
   body has drifted after the world or settled round the false centre. */

import { type Albedo, blend, hue, onWheel } from "../law/light";
import { type Lens, type Mark, type Seen, clamp01, seen, ticks, toPolar, toXY } from "./lens";

export const POEM = [
  "When God at first made man,",
  "Having a glass of blessings standing by,",
  "“Let us,” said he, “pour on him all we can.",
  "Let the world’s riches, which dispersèd lie,",
  "Contract into a span.”",
  "So strength first made a way;",
  "Then beauty flowed, then wisdom, honour, pleasure.",
  "When almost all was out, God made a stay,",
  "Perceiving that, alone of all his treasure,",
  "Rest in the bottom lay.",
  "“For if I should,” said he,",
  "“Bestow this jewel also on my creature,",
  "He would adore my gifts instead of me,",
  "And rest in Nature, not the God of Nature;",
  "So both should losers be.",
  "“Yet let him keep the rest,",
  "But keep them with repining restlessness;",
  "Let him be rich and weary, that at least,",
  "If goodness lead him not, yet weariness",
  "May toss him to my breast.”",
] as const;

export type Force = "centrifugal" | "centripetal" | "stabilizing" | "containment" | "false attraction" | "competing equilibrium" | "restorative disruption";

/* The verbs and their forces, as the spec classifies them. */
export const FORCES: Readonly<Record<string, Force>> = {
  pour: "centrifugal",
  dispersed: "centrifugal",
  contract: "centripetal",
  flowed: "centrifugal",
  stay: "stabilizing",
  bestow: "centrifugal",
  adore: "false attraction",
  rest: "competing equilibrium",
  keep: "containment",
  lead: "centripetal",
  toss: "restorative disruption",
};

export const LINE_BEATS = 8;

/* the arc's memory, in beats, and the thresholds it must cross */
export const MEMORY = 32;
export const TO_SORROW = 0.65;
export const TO_JOY = 0.35;
/** lines the arc holds after it changes */
export const HOLD_LINES = 2;

/* Which verb each line carries, found in the text rather than typed in.
   "Rest in the bottom lay" is the noun, the thing God holds back; the verb
   is "rest in Nature", three lines later, so a line counts only where the
   word is used as the spec uses it. */
const NOUN = /^Rest in the bottom/;
const wordsOf = (line: string): string[] => line.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/[a-z]+/g) ?? [];
export const VERB_ON_LINE: readonly (string | null)[] = POEM.map((line) => {
  if (NOUN.test(line)) return null;
  return wordsOf(line).find((w) => w in FORCES) ?? null;
});

/** the verb in force on a line: its own, or the last one before it in the poem */
export function verbAt(line: number): string | null {
  for (let j = line; j >= 0; j--) if (VERB_ON_LINE[j]) return VERB_ON_LINE[j];
  return null;
}

/* The nouns, and where each stands. Spec §4 makes nouns the anchors in the
   plane; §1 says where the plane's regions are: the core is God, Rest, the
   fulcrum; the perimeter is the human course through earthly time. So each
   noun the poem names is read as standing on the core, on the human orbit,
   or on the world's side at the rim. This is a reading, like the verb
   table, and is kept here in one place so it can be argued with.

   Left out, on purpose: restlessness, weariness and goodness, which are
   states rather than things and belong to the affective reading (§4's
   adjectives), and "way" and "losers", which name neither a thing nor a
   place. "Rest" is read as the core wherever it is the noun, including
   "keep the rest" (line 16), where the remainder carries the pun. */
export type Region = "core" | "orbit" | "world";
export const NOUNS: Readonly<Record<string, Region>> = {
  god: "core", rest: "core", treasure: "core", jewel: "core", breast: "core",
  man: "orbit", span: "orbit", creature: "orbit",
  glass: "world", blessings: "world", world: "world", riches: "world",
  strength: "world", beauty: "world", wisdom: "world", honour: "world", pleasure: "world",
  gifts: "world", nature: "world",
};
/** how far from the centre each region stands, as a fraction of the body */
export const RADIUS: Readonly<Record<Region, number>> = { core: 0, orbit: 0.45, world: 0.8 };

/* the nouns on each line, found in the text, each once however often the
   line says it ("Nature, not the God of Nature"); the word read as the
   line's verb is not also its noun ("rest in Nature" is the verb, Nature
   the noun) */
export const NOUNS_ON_LINE: readonly (readonly string[])[] = POEM.map((line, j) => [...new Set(wordsOf(line).filter((w) => w in NOUNS && w !== VERB_ON_LINE[j]))]);

export interface Anchor {
  readonly word: string;
  readonly region: Region;
  /** the line it is first read on */
  readonly line: number;
  /** where it stands: the core at the centre, the others along their line's arc */
  readonly at: readonly [number, number];
}

/** every noun once, placed where it is first read: nouns sharing a line
 *  are spread along that line's arc in the order the line says them */
export const ANCHORS: readonly Anchor[] = (() => {
  const out: Anchor[] = [];
  NOUNS_ON_LINE.forEach((nouns, line) => {
    const fresh = nouns.filter((w) => !out.some((a) => a.word === w) && NOUNS[w] !== "core");
    for (const word of nouns) {
      if (out.some((a) => a.word === word)) continue;
      const region = NOUNS[word];
      const i = fresh.indexOf(word);
      const at = region === "core" ? ([0, 0] as const) : toXY(RADIUS[region], (line + (i + 1) / (fresh.length + 1)) / POEM.length);
      out.push({ word, region, line, at });
    }
  });
  return out;
})();

export function anchorOf(word: string): readonly [number, number] {
  const a = ANCHORS.find((x) => x.word === word);
  if (!a) throw new Error(`the poem names no "${word}"`);
  return a.at;
}

/** the noun anchoring a line: the first on it, or the last one read before it */
export function nounAt(line: number): string | null {
  for (let j = line; j >= 0; j--) if (NOUNS_ON_LINE[j].length) return NOUNS_ON_LINE[j][0];
  return null;
}

/* the points the forces reach for are nouns: adore drifts toward the gifts,
   rest settles round Nature, and the core is where toss brings him home */
export const CORE = anchorOf("breast");
export const WORLD = anchorOf("gifts");
export const FALSE_CENTRE = anchorOf("nature");

const STEP = 0.05;
const MIN_SPREAD = 0.2;

/* Lex's staged grounding chain: after k beats of the toss the body is
   1 - 10^-k of the way home, and once the remainder is within TOLERANCE it
   is absorbed — home exactly, not nearly. */
export const TOLERANCE = 1e-5;
export function ground(stages: number): number {
  if (stages <= 0) return 0;
  const g = 1 - 10 ** -stages;
  return 1 - g <= TOLERANCE ? 1 : g;
}

/** where the body was when the toss began: what it is grounded from */
export interface Departure {
  readonly drift: readonly [number, number];
  readonly falseRest: number;
  readonly potential: number;
  readonly spread: number;
  /** the spread the toss brings it to */
  readonly homeSpread: number;
}

export interface PulleyState {
  readonly seen: Seen;
  readonly line: number;
  /** beats spent on this line so far */
  readonly onLine: number;
  /** how far the body reaches from the centre: 0.2 .. 1 */
  readonly spread: number;
  /** how far the whole body has drifted toward the world */
  readonly drift: readonly [number, number];
  /** how strongly half the body holds to the false centre */
  readonly falseRest: number;
  /** energy kept and not yet released */
  readonly potential: number;
  /** local disruption, 1 on a toss and settling after */
  readonly shake: number;
  /** beats of the toss so far; 0 until it, and again once another verb acts */
  readonly stages: number;
  readonly departure: Departure | null;
  readonly joy: boolean;
  /** how minor the music has been lately, 0..1, remembered over about MEMORY beats */
  readonly minorness: number;
  /** lines since the arc last changed */
  readonly held: number;
  /** the key's pitch class: the colour of the world at the rim */
  readonly key: number;
}

const lerp2 = (a: readonly [number, number], b: readonly [number, number], x: number): [number, number] => [a[0] + (b[0] - a[0]) * x, a[1] + (b[1] - a[1]) * x];

export const pulley: Lens<PulleyState> = {
  id: "pulley", title: "Pulley",
  idea: "Herbert's “The Pulley” as forces round a centre: each verb pushes, pulls, holds or tosses the body home.",
  state(f, prev) {
    const t = ticks(f, prev?.seen ?? null);
    let joy = prev ? prev.joy : !f.harmony.minor;
    let minorness = prev?.minorness ?? (f.harmony.minor ? 1 : 0);
    let held = prev?.held ?? HOLD_LINES;
    const key = f.harmony.tonic;
    let line = prev?.line ?? 0;
    let onLine = prev?.onLine ?? 0;
    let spread = prev?.spread ?? 0.55;
    let drift: [number, number] = prev ? [prev.drift[0], prev.drift[1]] : [0, 0];
    let falseRest = prev?.falseRest ?? 0;
    let potential = prev?.potential ?? 0;
    let shake = (prev?.shake ?? 0) * Math.exp(-1.6 * t.dt);
    let stages = prev?.stages ?? 0;
    let departure = prev?.departure ?? null;

    if (t.beat) {
      const verb = verbAt(line);
      const force = verb ? FORCES[verb] : null;
      switch (force) {
        case "centrifugal": spread += STEP; break;
        case "centripetal": spread -= STEP; drift = lerp2(drift, CORE, 0.15); falseRest *= 0.85; break;
        case "stabilizing": break;
        case "containment": potential = Math.min(1, potential + 0.08); break;
        case "false attraction": drift = lerp2(drift, WORLD, 0.12); break;
        case "competing equilibrium": falseRest = Math.min(1, falseRest + 0.12); break;
        case "restorative disruption": {
          /* the first beat throws; every beat grounds, a decade closer */
          if (stages === 0) {
            shake = 1;
            departure = { drift, falseRest, potential, spread, homeSpread: Math.max(MIN_SPREAD, spread - 0.24 - 0.2 * potential) };
          }
          stages++;
          const g = ground(stages), d = departure!;
          if (g === 1) {
            drift = [CORE[0], CORE[1]]; falseRest = 0; potential = 0; spread = d.homeSpread;
          } else {
            drift = lerp2(d.drift, CORE, g);
            falseRest = d.falseRest * (1 - g);
            potential = d.potential * (1 - g);
            spread = d.spread + (d.homeSpread - d.spread) * g;
          }
          break;
        }
      }
      /* another verb acting lets go of home */
      if (force && force !== "restorative disruption") { stages = 0; departure = null; }
      /* the arc, everywhere but where the poem has made a stay or the toss
         has the body: while it is being grounded, and once home, the chain
         owns the spread */
      if (force !== "stabilizing" && stages === 0) spread += joy ? 0.01 : -0.015;
      spread = Math.max(MIN_SPREAD, Math.min(joy ? 1 : 0.9, spread));

      minorness += ((f.harmony.minor ? 1 : 0) - minorness) / MEMORY;
      onLine++;
      if (onLine >= LINE_BEATS) {
        held++;
        if (held >= HOLD_LINES) {
          if (joy && minorness > TO_SORROW) { joy = false; held = 0; }
          else if (!joy && minorness < TO_JOY) { joy = true; held = 0; }
        }
        onLine = 0;
        line = (line + 1) % POEM.length;
      }
    }
    return { seen: seen(f), line, onLine, spread, drift, falseRest, potential, shake, stages, departure, joy, minorness, held, key };
  },
  view: (s) => {
    const verb = verbAt(s.line);
    const force = verb ? FORCES[verb] : null;
    const still = force === "stabilizing";
    const gold = hue(44, 0.6, 1);
    const rim: Albedo = s.joy ? onWheel(s.key, 0.45, 0.95) : onWheel(s.key, 0.6, 0.7);
    const rose = hue(338, 0.55, 0.92);
    const driftAmount = clamp01(Math.hypot(s.drift[0], s.drift[1]) / Math.hypot(WORLD[0], WORLD[1]));
    const home = ground(s.stages) === 1;
    return {
      turn: (x) => (still ? s.line / POEM.length : x * 0.4),
      shell: () => 0.3 + 0.62 * s.spread,
      motes: (n) => Math.max(900, n),
      divergence: (d) => d,
      /* joy is symmetric, except while the false centre holds: there is one
         false centre, and mirroring the body would make two */
      folds: (k) => (s.joy && s.falseRest < 0.15 ? k * 2 : k),
      place: (k, a, i) => {
        /* kept energy trembles in place; a toss throws every mote about. The
           throw is a fixed distance, not a share of the body's size: a toss
           also draws the body in, and a shake that shrank with it would
           grow gentler the harder it brought things home */
        const tremble = s.potential * 0.015 * Math.sin(i * 3.7 + s.seen.t * 23);
        const throwR = s.shake * 0.16 * (0.3 + k) * Math.sin(i * 12.9898 + s.seen.t * 31);
        const throwA = s.shake * 0.06 * Math.sin(i * 7.233 + s.seen.t * 27);
        let [x, y] = toXY(Math.max(0, k * s.spread + throwR), a + tremble + throwA);
        /* half the body settles round the false centre, as far as it rests */
        if (i % 2 === 1 && s.falseRest > 0) {
          const tx = FALSE_CENTRE[0] + x * 0.3, ty = FALSE_CENTRE[1] + y * 0.3;
          x += (tx - x) * s.falseRest;
          y += (ty - y) * s.falseRest;
        }
        const [kk, aa] = toPolar(x, y);
        return { k: Math.min(1.15, kk), a: aa, v: still ? 1.3 : 1 };
      },
      colour: (k, _a, i) => {
        let c = blend(gold, rim, clamp01(k));
        const worldly = Math.max(driftAmount * 0.6, i % 2 === 1 ? s.falseRest : 0);
        if (worldly > 0) c = blend(c, rose, worldly);
        return c;
      },
      centre: () => s.drift,
      ground: () => onWheel(s.key, 0.4, 0.05),
      emblem: () => {
        const marks: Mark[] = [
          /* the fulcrum, and the rope up to the pulley's wheel: taut once home */
          { circle: 0.05, v: 1 }, { circle: 0.1, v: home ? 0.9 : 0.45 },
          { line: [0, 0, 0, -1.28], v: home ? 0.75 : 0.25 }, { dot: [0, -1.32, 0.06], v: home ? 1 : 0.7 },
          /* the twenty lines of the poem round the rim, the one being read lit */
          ...POEM.map((_, j) => ({ arc: [1.14, j / POEM.length + 0.004, (j + 1) / POEM.length - 0.004] as const, v: j === s.line ? 1 : j < s.line ? 0.45 : 0.18 })),
        ];
        if (s.joy)
          for (let j = 0; j < 12; j++) {
            const a = (j / 12) * 2 * Math.PI;
            marks.push({ line: [Math.cos(a) * 1.2, Math.sin(a) * 1.2, Math.cos(a) * 1.3, Math.sin(a) * 1.3], v: 0.55 });
          }
        else
          for (let j = 0; j < 12; j++) {
            /* sorrow's tension cords, tied to the fulcrum */
            const a = (j / 12) * 2 * Math.PI;
            marks.push({ line: [0, 0, Math.cos(a) * 0.95 * s.spread, Math.sin(a) * 0.95 * s.spread], v: 0.9 });
          }
        if (s.falseRest > 0.05) marks.push({ dot: [FALSE_CENTRE[0], FALSE_CENTRE[1], 0.045], v: s.falseRest });
        if (driftAmount > 0.05) marks.push({ dot: [WORLD[0], WORLD[1], 0.035], v: driftAmount });
        /* the nouns: every anchor off the core as a faint point beside its
           line, and the noun anchoring the line being read named where it
           stands */
        const noun = nounAt(s.line);
        for (const a of ANCHORS) if (a.region !== "core") marks.push({ dot: [a.at[0], a.at[1], 0.018], v: a.word === noun ? 0.9 : 0.22 });
        if (noun) {
          const a = ANCHORS.find((x) => x.word === noun)!;
          marks.push({ text: [a.at[0], a.at[1] + (a.region === "core" ? 0.17 : 0.07), noun], v: 0.8 });
        }
        return marks;
      },
      /* hoisted: it lifts a little, then settles into place */
      blendIn: (x) => clamp01(x - 0.12 * Math.sin(2 * Math.PI * x)),
      rings: () => [],
      words: () => POEM[s.line],
    };
  },
  label: (s) => {
    const verb = verbAt(s.line);
    const noun = nounAt(s.line);
    const g = ground(s.stages);
    const grounding = s.stages === 0 ? "" : g === 1 ? " · home" : ` · grounding ${g.toFixed(s.stages)}`;
    return `line ${s.line + 1} of ${POEM.length} · ${verb ? `${verb}, ${FORCES[verb]}` : "before the first verb"}${noun ? ` · at ${noun}, ${NOUNS[noun]}` : ""}${grounding} · ${s.joy ? "joy" : "sorrow"}`;
  },
};
