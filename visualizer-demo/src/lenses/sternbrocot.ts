/* Stern–Brocot: the tree of every fraction, drawn round the body, with the
   sounding interval found in it.

   The root, 1/1, is the centre; each level is a ring further out, smaller
   fractions to the left and larger to the right, and each node is labelled
   with its fraction. The interval sounding above the key is a fraction —
   3/2 for a fifth, 5/4 for a major third, 16/15 for a minor second — and it
   has one path of turns down from 1/1. Consonant intervals are near the
   root and dissonant ones deep.

     a beat       reads the interval and walks one step down its path. If the
                  interval has changed, the walk first climbs back to where
                  the old path and the new one part. Motes stream along the
                  edges walked so far, with a bright cluster where it stands.
     a key change re-roots the walk at 1/1, and recolours the tree

   A deep fraction does not fit on the screen, so the view follows the walk
   down, keeping a few levels above it and the rest below.

   Colour is the note each fraction would sound above the key, on the
   circle of fifths; the walked path is saturated and the rest of the tree
   pale. It fades in level by level from the centre. */

import { type Albedo, onWheel } from "../law/light";
import { type Lens, type Mark, type Seen, clamp01, frac, hash01, loudest, seen, ticks, toPolar } from "./lens";
import { RATIO } from "./lissajous";
import { type Fraction, type Turn, at, pathTo, shared, show } from "./sb";

export const DEPTH = 6;
/** levels kept above the walk once it goes deeper than the screen */
export const ABOVE = 4;

const NAMES = ["unison", "minor second", "major second", "minor third", "major third", "fourth",
  "tritone", "fifth", "minor sixth", "major sixth", "minor seventh", "major seventh"];

export interface SternBrocotState {
  readonly seen: Seen;
  readonly semis: number;
  readonly target: Fraction;
  readonly path: readonly Turn[];
  /** how many turns of the path have been walked */
  readonly walked: number;
}

/** the note a fraction sounds above the tonic, in semitones */
const semitonesOf = ([p, q]: Fraction) => (((Math.round(12 * Math.log2(p / q)) % 12) + 12) % 12);

interface Node { readonly path: Turn[]; readonly x: number; readonly y: number; readonly k: number }

/* a radial layout of the tree below `root`, DEPTH levels deep: each node
   takes the middle of its wedge, a left child the first half, a right child
   the second, starting from the whole circle with left on the left */
function layout(root: readonly Turn[]): { nodes: Node[]; links: [Node, Node][] } {
  const nodes: Node[] = [];
  const links: [Node, Node][] = [];
  const place = (path: Turn[], k: number, lo: number, hi: number, parent: Node | null) => {
    const a = (lo + hi) / 2, r = k === 0 ? 0 : 0.1 + ((k - 1) * 0.86) / (DEPTH - 1);
    const n: Node = { path, k, x: r * Math.cos(a * 2 * Math.PI), y: r * Math.sin(a * 2 * Math.PI) };
    nodes.push(n);
    if (parent) links.push([parent, n]);
    if (k < DEPTH) {
      place([...path, "L"], k + 1, lo, a, n);
      place([...path, "R"], k + 1, a, hi, n);
    }
  };
  place([...root], 0, 0.25, 1.25, null);
  return { nodes, links };
}

export const sternBrocot: Lens<SternBrocotState> = {
  id: "sternbrocot", title: "Stern–Brocot",
  idea: "The tree of every fraction: the interval sounding is found in it, a beat at a time, consonant near the root and dissonant deep.",
  state(f, prev) {
    const t = ticks(f, prev?.seen ?? null);
    const read = () => {
      const semis = (((loudest(f.harmony.chroma) - f.harmony.tonic) % 12) + 12) % 12;
      const target = RATIO[semis] as Fraction;
      return { semis, target, path: pathTo(target[0], target[1]) };
    };
    if (!prev) return { seen: seen(f), ...read(), walked: 0 };
    let { semis, target, path, walked } = prev;
    if (t.keyChange) { ({ semis, target, path } = read()); walked = 0; }
    if (t.beat) {
      const next = read();
      if (next.semis !== semis) { walked = Math.min(walked, shared(path, next.path)); ({ semis, target, path } = next); }
      walked = Math.min(path.length, walked + 1);
    }
    return { seen: seen(f), semis, target, path, walked };
  },
  view: (s) => {
    const top = Math.max(0, s.walked - ABOVE);
    const { nodes, links } = layout(s.path.slice(0, top));
    const onPath = (p: readonly Turn[]) => p.length <= s.walked && p.every((t, j) => t === s.path[j]);
    const lit = links.filter(([, b]) => onPath(b.path));
    const here = nodes.find((n) => n.path.length === s.walked && onPath(n.path)) ?? nodes[0];
    const tonic = s.seen.tonic;
    const tone = (p: readonly Turn[], bright: boolean): Albedo => onWheel(tonic + semitonesOf(at(p)), bright ? 0.72 : 0.22, bright ? 0.98 : 0.8);

    /* which part of the picture each mote belongs to: four in ten stream
       along the walked edges, one in ten clusters where the walk stands,
       the rest lie still along every edge */
    const role = (i: number): { link?: [Node, Node]; node?: Node; lit: boolean } => {
      const g = i % 10;
      if (g < 4 && lit.length) return { link: lit[i % lit.length], lit: true };
      if (g === 4 || (g < 4 && !lit.length)) return { node: here, lit: true };
      return { link: links[i % links.length], lit: false };
    };
    return {
      turn: () => 0,
      shell: () => 0.94,
      motes: () => 900,
      divergence: (d) => d,
      folds: () => 1,
      place: (_k, _a, i) => {
        const r = role(i);
        let x: number, y: number;
        if (r.node) {
          const j = hash01(i) * 2 * Math.PI, d = 0.012 + 0.02 * hash01(i + 9);
          x = r.node.x + Math.cos(j) * d;
          y = r.node.y + Math.sin(j) * d;
        } else {
          const [a, b] = r.link!;
          const u = r.lit ? frac(hash01(i) + s.seen.t * 0.6) : hash01(i);
          x = a.x + (b.x - a.x) * u;
          y = a.y + (b.y - a.y) * u;
        }
        const [k, a] = toPolar(x, y);
        return { k, a, v: r.node ? 1.6 : r.lit ? 1.35 : 0.3 };
      },
      colour: (_k, _a, i) => {
        const r = role(i);
        return tone(r.node ? r.node.path : r.link![1].path, r.lit);
      },
      centre: () => [0, 0],
      ground: () => onWheel(tonic, 0.3, 0.05),
      emblem: (): Mark[] => [
        ...links.map(([a, b]) => ({ line: [a.x, a.y, b.x, b.y] as const, v: onPath(b.path) ? 0.9 : 0.16 })),
        ...nodes
          .filter((n) => n.k <= 3 || onPath(n.path))
          .map((n) => {
            const r = Math.hypot(n.x, n.y) || 1, out = n.k === 0 ? 0 : 0.045;
            return { text: [n.x * (1 + out / r), n.y * (1 + out / r) - (n.k === 0 ? 0.05 : 0), show(at(n.path))] as const, v: onPath(n.path) ? 1.8 : 0.5 };
          }),
      ],
      /* level by level, from the centre */
      blendIn: (x, k) => clamp01(x * (DEPTH + 1) - Math.floor(k * DEPTH)),
      words: () => `${show(s.target)} · ${NAMES[s.semis]} · ${s.path.length} turn${s.path.length === 1 ? "" : "s"} from 1/1${s.walked < s.path.length ? `, ${s.walked} walked` : ""}`,
      rings: () => [],
    };
  },
  label: (s) => `${show(s.target)} ${NAMES[s.semis]} · ${s.walked} of ${s.path.length} turns · ${s.path.join("") || "the root"}`,
};
