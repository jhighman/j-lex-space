/* The Stern–Brocot tree: every positive fraction exactly once, in lowest
   terms. Begin with 0/1 on the left and 1/0 on the right; each node is the
   mediant of its nearest ancestors, (a+c)/(b+d). The root is 1/1. Going left
   makes a fraction smaller and going right larger, so each fraction has one
   path of turns from the root, and the deeper it sits, the more complicated
   it is. Musical intervals are fractions, and consonance roughly follows
   depth: the octave (2/1) is one turn down, the fifth (3/2) two, the major
   third (5/4) four, the minor second (16/15) fifteen.

   Plain arithmetic, no drawing: the lens draws it. */

export type Turn = "L" | "R";
export type Fraction = readonly [p: number, q: number];

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

/** the turns from 1/1 down to p/q */
export function pathTo(p: number, q: number): Turn[] {
  if (!(p > 0 && q > 0)) throw new Error("the tree holds positive fractions only");
  const g = gcd(p, q);
  let [a, b] = [p / g, q / g];
  const out: Turn[] = [];
  /* each step subtracts the smaller from the larger: the Euclidean
     algorithm, read as a walk */
  while (a !== b) {
    if (a > b) { out.push("R"); a -= b; }
    else { out.push("L"); b -= a; }
  }
  return out;
}

/** the fraction at the end of a path */
export function at(path: readonly Turn[]): Fraction {
  /* the bounds the mediant falls between: 0/1 on the left, 1/0 on the right */
  let lp = 0, lq = 1, rp = 1, rq = 0;
  let p = 1, q = 1;
  for (const t of path) {
    if (t === "L") { rp = p; rq = q; } else { lp = p; lq = q; }
    p = lp + rp;
    q = lq + rq;
  }
  return [p, q];
}

/** how many turns two paths share from the root */
export function shared(a: readonly Turn[], b: readonly Turn[]): number {
  let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n++;
  return n;
}

/** every path of a given length below a root path, left to right */
export function level(root: readonly Turn[], depth: number): Turn[][] {
  let paths: Turn[][] = [[...root]];
  for (let d = 0; d < depth; d++) paths = paths.flatMap((p) => [[...p, "L" as Turn], [...p, "R" as Turn]]);
  return paths;
}

export const show = ([p, q]: Fraction) => `${p}/${q}`;
