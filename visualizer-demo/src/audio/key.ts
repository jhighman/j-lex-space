/* Key-finding, shared by the live analyzer and the whole-track pass so the two
   cannot come to disagree about what a key is. Krumhansl–Kessler
   profiles, from C. */

export const MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
export const MINOR = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

export const NOTE = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];

export function correlate(x: ArrayLike<number>, profile: readonly number[], rot: number): number {
  let mx = 0, mp = 0;
  for (let i = 0; i < 12; i++) { mx += x[i]; mp += profile[i]; }
  mx /= 12; mp /= 12;
  let num = 0, dx = 0, dp = 0;
  for (let i = 0; i < 12; i++) {
    const a = x[(i + rot) % 12] - mx, b = profile[i] - mp;
    num += a * b; dx += a * a; dp += b * b;
  }
  return dx > 0 && dp > 0 ? num / Math.sqrt(dx * dp) : 0;
}

/** the best-fitting key for a chroma vector */
export function keyOf(chroma: ArrayLike<number>): { tonic: number; minor: boolean; score: number } {
  let best = { tonic: 0, minor: false, score: -Infinity };
  for (let r = 0; r < 12; r++) {
    const M = correlate(chroma, MAJOR, r), m = correlate(chroma, MINOR, r);
    if (M > best.score) best = { tonic: r, minor: false, score: M };
    if (m > best.score) best = { tonic: r, minor: true, score: m };
  }
  return best;
}

export const keyName = (tonic: number, minor: boolean) => `${NOTE[tonic]} ${minor ? "minor" : "major"}`;

/** the pitch class of a frequency, C = 0 */
export const pitchClass = (hz: number) => (((Math.round(12 * Math.log2(hz / 440)) + 9) % 12) + 12) % 12;
