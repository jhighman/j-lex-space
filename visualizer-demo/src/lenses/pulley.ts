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
export const VERB_ON_LINE: readonly (string | null)[] = POEM.map((line) => {
  if (NOUN.test(line)) return null;
  const words = line.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").match(/[a-z]+/g) ?? [];
  return words.find((w) => w in FORCES) ?? null;
});

/** the verb in force on a line: its own, or the last one before it in the poem */
export function verbAt(line: number): string | null {
  for (let j = line; j >= 0; j--) if (VERB_ON_LINE[j]) return VERB_ON_LINE[j];
  return null;
}

/* where the world draws the body when it adores, and where the false
   centre stands when it rests */
export const WORLD: readonly [number, number] = [0.42, -0.24];
export const FALSE_CENTRE: readonly [number, number] = [0.46, 0.3];

const STEP = 0.05;
const MIN_SPREAD = 0.2;

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

    if (t.beat) {
      const verb = verbAt(line);
      const force = verb ? FORCES[verb] : null;
      switch (force) {
        case "centrifugal": spread += STEP; break;
        case "centripetal": spread -= STEP; drift = lerp2(drift, [0, 0], 0.15); falseRest *= 0.85; break;
        case "stabilizing": break;
        case "containment": potential = Math.min(1, potential + 0.08); break;
        case "false attraction": drift = lerp2(drift, WORLD, 0.12); break;
        case "competing equilibrium": falseRest = Math.min(1, falseRest + 0.12); break;
        case "restorative disruption":
          shake = 1;
          spread -= 0.12 + 0.1 * potential;
          potential *= 0.4;
          drift = lerp2(drift, [0, 0], 0.5);
          falseRest *= 0.5;
          break;
      }
      /* the arc, everywhere but where the poem has made a stay */
      if (force !== "stabilizing") spread += joy ? 0.01 : -0.015;
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
    return { seen: seen(f), line, onLine, spread, drift, falseRest, potential, shake, joy, minorness, held, key };
  },
  view: (s) => {
    const verb = verbAt(s.line);
    const force = verb ? FORCES[verb] : null;
    const still = force === "stabilizing";
    const gold = hue(44, 0.6, 1);
    const rim: Albedo = s.joy ? onWheel(s.key, 0.45, 0.95) : onWheel(s.key, 0.6, 0.7);
    const rose = hue(338, 0.55, 0.92);
    const driftAmount = clamp01(Math.hypot(s.drift[0], s.drift[1]) / Math.hypot(WORLD[0], WORLD[1]));
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
          /* the fulcrum, and the rope up to the pulley's wheel */
          { circle: 0.05, v: 1 }, { circle: 0.1, v: 0.45 },
          { line: [0, 0, 0, -1.28], v: 0.25 }, { dot: [0, -1.32, 0.06], v: 0.7 },
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
        return marks;
      },
      /* hoisted: it lifts a little, then settles into place */
      blendIn: (x) => clamp01(x - 0.12 * Math.sin(2 * Math.PI * x)),
      words: () => POEM[s.line],
    };
  },
  label: (s) => {
    const verb = verbAt(s.line);
    return `line ${s.line + 1} of ${POEM.length} · ${verb ? `${verb}, ${FORCES[verb]}` : "before the first verb"} · ${s.joy ? "joy" : "sorrow"}`;
  },
};
