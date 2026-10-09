/* An in-place radix-2 FFT, for the offline analysis. The live analyzer uses the
   browser's analyser; a whole-track pass has to run where there is no
   audio graph — including in a test — so it carries its own. */

/** magnitudes of the first n/2 bins of a real signal; `re` is overwritten */
export function magnitudes(re: Float64Array, im: Float64Array, out: Float64Array): void {
  const n = re.length;
  im.fill(0);
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { const t = re[i]; re[i] = re[j]; re[j] = t; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const a = (-2 * Math.PI) / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const p = i + k, q = p + len / 2;
        const xr = re[q] * cr - im[q] * ci, xi = re[q] * ci + im[q] * cr;
        re[q] = re[p] - xr; im[q] = im[p] - xi;
        re[p] += xr; im[p] += xi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
  for (let i = 0; i < out.length; i++) out[i] = Math.hypot(re[i], im[i]);
}
