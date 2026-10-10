/* Bridson's algorithm for Poisson-disc sampling, one round at a time, in a
   disc: points spread at random, but never closer together than `r`.

   Each active point tries up to K candidates in the ring between r and 2r
   around it, and keeps any that are inside the disc and at least r from
   every point already placed. A point that places none retires. Run until
   nothing is active, the disc is full: no point of it is further than 2r
   from a sample.

   Plain arithmetic with a seeded generator, so the same seed grows the
   same pattern, and a test can check the guarantees. */

export interface Sample {
  readonly x: number;
  readonly y: number;
  /** the pitch class of the growth it belongs to */
  readonly pc: number;
  /** the beat it was placed on */
  readonly born: number;
  readonly active: boolean;
  /** the sample it grew from, or -1 for a seed */
  readonly parent: number;
}

export const K = 30;

/** a small seeded generator (mulberry32); returns a number and the next seed */
export function random(seed: number): [number, number] {
  const s = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s];
}

/** a lookup grid with cells small enough to hold one sample each */
function grid(samples: readonly Sample[], r: number) {
  const size = r / Math.SQRT2;
  const cells = new Map<string, number>();
  const key = (x: number, y: number) => `${Math.floor(x / size)},${Math.floor(y / size)}`;
  samples.forEach((s, i) => cells.set(key(s.x, s.y), i));
  const clear = (x: number, y: number) => {
    const cx = Math.floor(x / size), cy = Math.floor(y / size);
    for (let dx = -2; dx <= 2; dx++)
      for (let dy = -2; dy <= 2; dy++) {
        const i = cells.get(`${cx + dx},${cy + dy}`);
        if (i !== undefined && Math.hypot(samples[i].x - x, samples[i].y - y) < r) return false;
      }
    return true;
  };
  return { clear, add: (x: number, y: number, i: number) => cells.set(key(x, y), i) };
}

/** the unit disc, where growth may go unless a lens says otherwise */
export const DISC_REGION = (x: number, y: number) => x * x + y * y <= 1;

/**
 * One round: every active sample tries its K candidates, keeping those
 * inside the region. Returns the samples after the round and the next seed.
 */
export function round(samples: readonly Sample[], r: number, seed: number, beat: number, limit = Infinity, inside = DISC_REGION): { samples: Sample[]; seed: number } {
  const out: Sample[] = samples.slice();
  const g = grid(out, r);
  let s = seed, u: number;
  const active = out.map((p, i) => (p.active ? i : -1)).filter((i) => i >= 0);
  for (const i of active) {
    const p = out[i];
    let placed = false;
    for (let k = 0; k < K && out.length < limit; k++) {
      [u, s] = random(s);
      const a = u * 2 * Math.PI;
      [u, s] = random(s);
      /* uniform in the ring's area, between r and 2r */
      const d = Math.sqrt(r * r + u * 3 * r * r);
      const x = p.x + d * Math.cos(a), y = p.y + d * Math.sin(a);
      if (!inside(x, y) || !g.clear(x, y)) continue;
      out.push({ x, y, pc: p.pc, born: beat, active: true, parent: i });
      g.add(x, y, out.length - 1);
      placed = true;
    }
    if (!placed) out[i] = { ...p, active: false };
  }
  return { samples: out, seed: s };
}

/** a new growth at a point, if no sample is closer than r; otherwise none */
export function plant(samples: readonly Sample[], x: number, y: number, r: number, pc: number, beat: number): Sample[] {
  if (samples.some((s) => Math.hypot(s.x - x, s.y - y) < r)) return samples.slice();
  return [...samples, { x, y, pc, born: beat, active: true, parent: -1 }];
}

/** seed a growth at a point, clearing a patch round it first */
export function seedAt(samples: readonly Sample[], x: number, y: number, clearing: number, pc: number, beat: number): Sample[] {
  /* parents are indexes, so a cleared sample's children point at nothing;
     they keep their places and draw no link */
  const kept = samples.map((s, i) => ({ s, i })).filter(({ s }) => Math.hypot(s.x - x, s.y - y) >= clearing);
  const index = new Map(kept.map(({ i }, j) => [i, j]));
  const moved = kept.map(({ s }) => ({ ...s, parent: index.get(s.parent) ?? -1 }));
  return [...moved, { x, y, pc, born: beat, active: true, parent: -1 }];
}
