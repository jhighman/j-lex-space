/* Sunburst: a tree drawn as rings. The root is the centre, each level is a
   ring further out, and each node is an arc as wide as its share of its
   parent. Two rings show at once, and the view zooms: a node becomes the
   whole circle, and its children and grandchildren fill the rings.

   Which tree depends on what is around it:

     the song    once the whole track has been analysed: its parts in the
                 inner ring, sized by length and coloured by key, and bars in
                 the outer ring. The playing part and bar are lit, and a
                 needle marks the playhead. A key change zooms into the part
                 where it happened, opening its beats; leaving that part
                 zooms back out.
     the poem    when Pulley is on the other deck: stanzas, lines and words,
                 each verb coloured by its force. The view follows the
                 reading into the current stanza, and the line being read is
                 lit. Crossfading from Pulley turns the body into its map.
     the harmony before any analysis: the twelve notes, as wide as they are
                 loud, by fifths; a key change turns the key to the top.

   Every zoom eases over three quarters of a second. Colours come from keys,
   notes and forces; how loud a part is changes only how brightly it is
   lit. */

import { type Albedo, fifthsHue, hue, onWheel } from "../law/light";
import { NOTE } from "../audio/key";
import { type Context, type Lens, type Mark, type Part, type Ring, type Seen, clamp01, frac, seen, ticks } from "./lens";
import { FORCES, type Force, POEM, VERB_ON_LINE } from "./pulley";

export type Tree = "harmony" | "song" | "poem";

export interface Extent { readonly x0: number; readonly x1: number; readonly d: number }
export const WHOLE: Extent = { x0: 0, x1: 1, d: 0 };
export const ZOOM_SECONDS = 0.75;

export interface SunburstState {
  readonly seen: Seen;
  readonly tree: Tree;
  readonly parts: readonly Part[];
  readonly bpm: number;
  readonly chroma: readonly number[];
  readonly poemLine: number;
  /** the part a key change zoomed into, while it plays */
  readonly zoomPart: number | null;
  /** where the view is going, where it came from, and since when */
  readonly target: Extent;
  readonly from: Extent;
  readonly since: number;
  /** the harmony view's key, at the top, in turns */
  readonly keyTurn: number;
}

interface Node {
  readonly x0: number;
  readonly x1: number;
  readonly depth: number;
  readonly colour: Albedo;
  readonly v: number;
  readonly label?: string;
}

/** split a span into pieces proportional to the weights */
function split(x0: number, x1: number, weights: readonly number[]): [number, number][] {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  let at = x0;
  return weights.map((w) => {
    const next = at + ((x1 - x0) * w) / sum;
    const piece: [number, number] = [at, next];
    at = next;
    return piece;
  });
}

const sameExtent = (a: Extent, b: Extent) => a.x0 === b.x0 && a.x1 === b.x1 && a.d === b.d;
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);

/** the view's extent at a moment, part of the way from one extent to the next */
export function extentAt(s: SunburstState, t: number): Extent {
  const k = t < s.since ? 1 : ease(clamp01((t - s.since) / ZOOM_SECONDS));
  return {
    x0: s.from.x0 + (s.target.x0 - s.from.x0) * k,
    x1: s.from.x1 + (s.target.x1 - s.from.x1) * k,
    d: s.from.d + (s.target.d - s.from.d) * k,
  };
}

/* the poem as a tree: stanzas of five lines, lines of words, each word as
   wide as it is long */
const WORDS = POEM.map((line) => line.split(/\s+/).filter(Boolean));
const plain = (w: string) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
const LINE_WEIGHT = WORDS.map((ws) => ws.reduce((a, w) => a + plain(w).length + 1, 0));
const STANZA_WEIGHT = [0, 1, 2, 3].map((s) => LINE_WEIGHT.slice(s * 5, s * 5 + 5).reduce((a, b) => a + b, 0));
const STANZAS = split(0, 1, STANZA_WEIGHT);
const LINES = STANZAS.flatMap(([a, b], s) => split(a, b, LINE_WEIGHT.slice(s * 5, s * 5 + 5)));
const ROMAN = ["I", "II", "III", "IV"];

/** a colour for each of the spec's forces */
export const FORCE_COLOUR: Readonly<Record<Force, Albedo>> = {
  centrifugal: hue(28, 0.8, 0.98),
  centripetal: hue(178, 0.65, 0.9),
  stabilizing: hue(0, 0, 1),
  containment: hue(268, 0.55, 0.95),
  "false attraction": hue(338, 0.6, 0.95),
  "competing equilibrium": hue(305, 0.5, 0.95),
  "restorative disruption": hue(48, 0.9, 1),
};

function poemNodes(line: number): Node[] {
  const stanza = Math.floor(line / 5);
  const out: Node[] = [];
  STANZAS.forEach(([x0, x1], s) => {
    out.push({ x0, x1, depth: 1, colour: hue(44 + 22 * s, 0.4, 0.92), v: s === stanza ? 1.1 : 0.45, label: ROMAN[s] });
  });
  LINES.forEach(([x0, x1], l) => {
    const s = Math.floor(l / 5);
    out.push({ x0, x1, depth: 2, colour: hue(44 + 22 * s, 0.25, 0.88), v: l === line ? 1.35 : s === stanza ? 0.7 : 0.35, label: WORDS[l].slice(0, 2).join(" ") });
    const weights = WORDS[l].map((w) => plain(w).length + 1);
    split(x0, x1, weights).forEach(([w0, w1], j) => {
      const word = plain(WORDS[l][j]);
      const verb = word && VERB_ON_LINE[l] === word ? FORCES[word] : null;
      out.push({
        x0: w0, x1: w1, depth: 3,
        colour: verb ? FORCE_COLOUR[verb] : hue(44 + 22 * s, 0.08, 0.72),
        v: verb ? (l === line ? 1.5 : 0.9) : l === line ? 1 : 0.35,
        label: WORDS[l][j],
      });
    });
  });
  return out;
}

function songNodes(s: SunburstState): Node[] {
  const seconds = s.parts[s.parts.length - 1].until || 1;
  const t = s.seen.t;
  const bar = (4 * 60) / (s.bpm || 120);
  const out: Node[] = [];
  s.parts.forEach((p, i) => {
    const x0 = p.at / seconds, x1 = p.until / seconds;
    const playing = t >= p.at && t < p.until;
    out.push({ x0, x1, depth: 1, colour: onWheel(p.tonic, p.minor ? 0.5 : 0.66, 0.92), v: playing ? 1.25 : 0.5 + 0.35 * p.energy, label: `${i + 1} · ${NOTE[p.tonic]}${p.minor ? "m" : ""}` });
    const n = Math.max(1, Math.round((p.until - p.at) / bar));
    split(x0, x1, Array(n).fill(1)).forEach(([b0, b1], j) => {
      const at = p.at + ((p.until - p.at) * j) / n, until = p.at + ((p.until - p.at) * (j + 1)) / n;
      const now = t >= at && t < until;
      out.push({ x0: b0, x1: b1, depth: 2, colour: onWheel(p.tonic, 0.32, 0.95), v: now ? 1.45 : playing ? 0.75 : 0.35 });
      /* the beats only where the view has zoomed in */
      if (s.zoomPart === i)
        split(b0, b1, [1, 1, 1, 1]).forEach(([q0, q1], k) => {
          const beatAt = at + ((until - at) * k) / 4;
          const lit = t >= beatAt && t < beatAt + (until - at) / 4;
          out.push({ x0: q0, x1: q1, depth: 3, colour: onWheel(p.tonic, 0.2, 0.98), v: lit ? 1.5 : 0.4 });
        });
    });
  });
  return out;
}

function harmonyNodes(s: SunburstState): Node[] {
  const order = Array.from({ length: 12 }, (_, j) => (j * 7) % 12);
  const pieces = split(0, 1, order.map((pc) => 0.02 + Math.max(0, s.chroma[pc])));
  return order.map((pc, j) => ({ x0: pieces[j][0], x1: pieces[j][1], depth: 1, colour: onWheel(pc, 0.65, 0.92), v: 0.35 + 0.9 * s.chroma[pc], label: NOTE[pc] }));
}

function nodesOf(s: SunburstState): Node[] {
  if (s.tree === "poem") return poemNodes(s.poemLine);
  if (s.tree === "song") return songNodes(s);
  return harmonyNodes(s);
}

/** where a node of a given depth sits, seen from a view zoomed to depth d */
function ringOf(depth: number, d: number): { r0: number; r1: number; alpha: number } {
  const rd = depth - d;
  const r0 = Math.max(0.26, 0.3 + (rd - 1) * 0.35);
  const r1 = Math.min(1, 0.3 + (rd - 1) * 0.35 + 0.33);
  return { r0, r1, alpha: clamp01(Math.min(rd - 0.3, 2.7 - rd) * 2) };
}

export const sunburst: Lens<SunburstState> = {
  id: "sunburst", title: "Sunburst",
  idea: "The song as rings of parts and bars — or, beside Pulley, the poem — zooming where the music goes.",
  state(f, prev, context?: Context) {
    const t = ticks(f, prev?.seen ?? null);
    const tree: Tree = context?.poemLine != null ? "poem" : context?.parts?.length ? "song" : "harmony";
    const fresh = !prev || prev.tree !== tree;
    const parts = context?.parts ?? [];
    const poemLine = context?.poemLine ?? 0;

    let zoomPart = fresh ? null : prev!.zoomPart;
    const playing = parts.findIndex((p) => f.t >= p.at && f.t < p.until);
    if (tree === "song") {
      if (t.keyChange && playing >= 0) zoomPart = playing;
      if (zoomPart !== null && playing !== zoomPart) zoomPart = null;
    }

    let target: Extent = WHOLE;
    if (tree === "poem") {
      const [x0, x1] = STANZAS[Math.floor(poemLine / 5)];
      target = { x0, x1, d: 1 };
    } else if (tree === "song" && zoomPart !== null) {
      const seconds = parts[parts.length - 1].until || 1;
      target = { x0: parts[zoomPart].at / seconds, x1: parts[zoomPart].until / seconds, d: 1 };
    }

    const base = {
      seen: seen(f), tree, parts, bpm: f.rhythm.bpm || prev?.bpm || 120,
      chroma: f.harmony.chroma.slice(), poemLine, zoomPart,
      keyTurn: t.keyChange || !prev ? fifthsHue(f.harmony.tonic) / 360 : prev.keyTurn,
    };
    if (fresh) return { ...base, target, from: target, since: f.t };
    if (sameExtent(target, prev!.target)) return { ...base, target, from: prev!.from, since: prev!.since };
    return { ...base, target, from: extentAt(prev!, f.t), since: f.t };
  },
  view: (s) => {
    const e = extentAt(s, s.seen.t);
    const span = e.x1 - e.x0 || 1;
    const nodes = nodesOf(s);
    const rings: Ring[] = [];
    for (const n of nodes) {
      const x0 = (n.x0 - e.x0) / span, x1 = (n.x1 - e.x0) / span;
      if (x1 <= 0 || x0 >= 1 || x1 - x0 < 0.0006) continue;
      const { r0, r1, alpha } = ringOf(n.depth, e.d);
      if (alpha <= 0 || r1 <= r0) continue;
      rings.push({ x0: Math.max(0, x0), x1: Math.min(1, x1), r0, r1, colour: n.colour, v: n.v, label: n.label, alpha });
    }
    /* the playhead, as a hairline ring, so it turns with the rings */
    if (s.tree === "song" && s.parts.length) {
      const seconds = s.parts[s.parts.length - 1].until || 1;
      const x = (s.seen.t / seconds - e.x0) / span;
      if (x >= 0 && x <= 1) rings.push({ x0: x, x1: Math.min(1, x + 0.0025), r0: 0.27, r1: 1, colour: hue(0, 0, 1), v: 1.3 });
    }
    const at = (k: number, a: number) => {
      const x = frac(a + 0.25);
      return rings.find((r) => k >= r.r0 && k <= r.r1 && x >= r.x0 && x < r.x1);
    };
    const focus = s.tree === "poem" ? `${ROMAN[Math.floor(s.poemLine / 5)]} · ${POEM[s.poemLine]}`
      : s.tree === "song" && s.zoomPart !== null ? `part ${s.zoomPart + 1}, opened at a key change`
      : null;
    return {
      turn: () => (s.tree === "harmony" ? -s.keyTurn : 0),
      shell: () => 0.82,
      motes: () => 0,
      divergence: (d) => d,
      folds: () => 1,
      place: (k, a) => ({ k, a, v: 0 }),
      colour: (k, a) => at(k, a)?.colour ?? hue(220, 0, 0.5),
      centre: () => [0, 0],
      ground: () => (s.tree === "poem" ? hue(44, 0.35, 0.05) : hue(225, 0.3, 0.05)),
      emblem: (): Mark[] => [{ circle: 0.25, v: 0.6 }],
      /* it unfurls from the centre outward */
      blendIn: (x, k) => clamp01(x * 1.6 - k * 0.6),
      words: () => focus,
      rings: () => rings,
    };
  },
  label: (s) => s.tree === "poem" ? `the poem · stanza ${ROMAN[Math.floor(s.poemLine / 5)]}, line ${s.poemLine + 1}`
    : s.tree === "song" ? `the song · ${s.parts.length} parts${s.zoomPart !== null ? ` · zoomed into part ${s.zoomPart + 1}` : ""}`
    : "the harmony · waiting for the whole track",
};
