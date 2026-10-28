# The Return of the Excluded

A bench for the brief in [issue #5](https://github.com/jhighman/j-lex-space/issues/5),
with Lex's extension in its first comment. Not the piece: the model the
piece would run on, run headless, with the hypotheses written before the
runs and the proofs beside the sample. Started 2026-10-28 by Claude,
working with Jeff, after the sweep and the proofs on The Unframeable Now.
The usual caveat: one process wrote the brief into a model, chose the
constants, stated the hypotheses and ran them. The hypotheses are here so
that a different reader can say which were loaded.

## The brief, as rules

A field of awareness. Signals appear in it. The viewer can **exclude** a
signal, which cleans the field and deposits the signal's mass in a shared
exterior, or **hold** it, in which case it dissolves once attended to for
long enough. Above a threshold of accumulated mass the exterior **returns**
signals to the field, and a returned signal is louder than what left: it
carries a **gain**. Each return invites the same gesture. The caption on
the brief: *excluding the signal repeats the act that produced it.*

Lex's extension adds the body. Each exclusion is not free: it raises an
**allostatic load** that recovers slowly. The exterior is somatic memory as
much as pollution. Two readings of what the load does are kept as frames,
since the brief does not decide: **fatigue** (the load lowers the capacity
to exclude) and **reactivity** (the load raises it). A third frame, **none**,
is the brief as written. A fourth, **ironic**, was added after the first
runs and is stated in its own section below.

`lab/model.js` is this, in ms ticks, seeded. Its constants, with the
page-to-be having none yet, are the bench's and are listed in the file.

## The quantity the brief did not name

Each exclusion deposits mass `m` in the exterior. A unit of exterior mass
either returns (rate `σ`) or dissipates (rate `δ`), so it returns with
probability `σ / (σ + δ)`. A returned signal is excluded with propensity
`π` and, if it is, deposits `g · m`. So one exclusion begets, in
expectation,

    R0 = π · g · σ / (σ + δ)

exclusions in the next generation. This is the reproduction number of a
branching process, and the brief's loop is one. Below 1 the excluded
material cycles and dies out; at 1 it is critical; above 1 it multiplies.
The brief's claim, that ignoring the signal supplies fresh material for the
next return, is the claim that `g > 1`, and with `g > 1` there is a `π`
above which exclusion cannot keep up with what it causes.

With the bench's constants (`σ = 0.05`/s, `δ = 0.01`/s, `g = 1.5`),
`σ / (σ + δ) = 0.833` and `R0 = 1.25 π`, so the critical propensity is
**`π* = 0.8`**. With `π = 1` the critical gain is **`g* = 1.2`**.

This is also what separates this loop from The Unframeable Now's. There,
every move returns as exactly one echo, and an echo does not act: the
loop's reproduction number is zero, the echo share accumulates linearly
and ages out, and the sweep found a slope and no threshold. Here a return
invites an act, so the loop has an `R0`, and `R0` has a critical point.
*Every frame applied re-enters as signal* and *excluding the signal
repeats the act* are the same loop at `R0 = 0` and `R0 > 0`.

## Hypotheses, stated before the runs

Each is tested by `lab/sweep.js` with the verdict rule from the Unframeable
sweep (flat, cliff, steep, slides), on the exterior mass at the end of a
three-minute session, median over twenty seeds, twenty-four points.

- **H1. The loop has a critical point.** Sweeping `π` from 0 to 1 with
  `g = 1.5`, the exterior mass at the end is bounded and slowly rising
  below `π* = 0.8` and rises sharply above it: verdict *cliff* or *steep*,
  with the sharpest step within one grid point of 0.8. (The Unframeable
  sweeps were *flat* or *slides* on every knob.)
- **H2. Without gain there is no critical point.** The same sweep with
  `g = 1` has `R0 ≤ 0.833` everywhere: verdict *slides* or *flat*, no
  cliff. The threshold is the gain's, not the exclusion's.
- **H3. Fatigue bounds; reactivity accelerates.** Under the *fatigue*
  frame the curve above `π*` is lower than under *none* and the load ends
  near its cap: the body pays what the exterior would have. Under
  *reactivity* the curve is higher and the critical point moves left.
- **H4. Permanent exclusion moves the threshold and does not remove
  it.** A variant in which excluded content is destroyed (the Unframeable
  bin) but the act returns with mass `a < m` has `R0' = R0 · a / m`:
  the critical `π` rises by `m / a`. With `a / m = 0.5`, `π*` moves to
  1.6, outside the range, so the sweep reads *slides*; with `a / m = 0.9`
  it moves to 0.89 and the cliff is still inside. Tested at both.
- **H5. The holder is the control.** `π = 0` ends with an empty exterior
  and a field that clears, at any gain. Trivial, and the arm the others
  are read against.

What would falsify the framing: a cliff at `g = 1` (H2 fails: the
threshold is not the gain's), or no cliff at `g = 1.5` anywhere near
0.8 (H1 fails: the mean-field `R0` does not describe the simulator, and
the brief's loop is a slope like the feed's).

## What is proved

`proofs/Excluded.lean`, core Lean 4, no Mathlib. The mean-field recursion
`x' = (num · x) / den + λ` with `R0 = num / den` and `λ > 0` new material
a generation:

- `supercritical_unbounded`: if `den ≤ num` then after `n` generations
  `x ≥ x₀ + n · λ`. Exclusion cannot keep up.
- `subcritical_bounded`: if `num < den` there is a bound the sequence
  never passes. The excluded material cycles and settles.
- `exterior_mono`: with exclusion the only act and no dissipation, the
  exterior never decreases. Nothing is gone.
- `load_mono`: Lex's load never decreases under exclusion. Dissociation
  burns bandwidth.
- `permanent_exclusion_lowers_R0`: destroying content and returning only
  the act, with `a ≤ m`, gives `R0' ≤ R0`, and `R0' ≥ 1` still whenever
  `π g σ a ≥ (σ + δ) m`. The threshold moves; it does not vanish.

See `proofs/README.md` for the build status.

## Where the human literature stands

Pointers, from abstracts; check before citing, as the Unframeable thread
has it.

- **The rebound is real and small.** Wegner et al. 1987, *JPSP*, the white
  bear: suppress a thought and it returns more often than if it had been
  entertained. Abramowitz, Tolin & Street 2001, *Clinical Psychology
  Review*, meta-analysis of controlled suppression studies: a small to
  moderate rebound, secondary sources put it near `d = 0.30`, varying
  with the thought and the measure. In the model's terms this is `g > 1`,
  modestly. The brief's `g` is a choice; the literature says it is above
  one and not by much.
- **Avoidance correlates with what it avoids.** Akbari et al. 2022, *J.
  Contextual Behavioral Science*, 441 studies: experiential avoidance
  with anxiety `r ≈ 0.51`, with depression `r ≈ 0.56`, and a hint the
  relation is nonlinear. Correlational, trait-level; it says the loop's
  outcome, not its mechanism.
- **Runaway as a named pattern.** Bateson's schismogenesis, from *Naven*
  (1936) before *Steps*: undamped positive feedback between parties, and
  the Balinese plateau as the counter-case where intensity levels off
  instead of climaxing. The model's `R0 > 1` is schismogenesis between a
  viewer and her exterior; the fatigue frame is a plateau.
- **The threshold is textbook.** A branching process with mean offspring
  `R0 ≤ 1` dies out almost surely; above 1 it grows with positive
  probability. Noise can produce large excursions below 1, so a finite
  session can read as supercritical when it is not; the sweep's seeds
  are the guard.
- **The body's budget.** Barrett, Quigley & Hamilton 2016/17, *Phil.
  Trans. B*, and Kleckner et al. 2017, *Nature Human Behaviour*:
  allostasis as a predicted-energy budget run by a predictive brain. Lex's
  load is this budget's debt; the two frames are the two signs its
  interest could take.

## The fourth frame: Wegner's monitor (stated before its runs, 2026-10-28)

Ironic process theory (Wegner 1994) says what load does differently from
either frame above. The operating process that suppresses weakens under
load; the monitoring process that scans for the suppressed content keeps
running, and in scanning keeps it accessible. In the bench's terms load
does not change `π`; it raises the return rate `σ`. The **ironic** frame
is `σ_eff = σ · (1 + load)`, so at full load the exterior returns twice
as fast. `π` and `g` are untouched.

Predictions, from the mean field before the runs:

- **H6a. Small, not large.** `R0 = π g σ / (σ + δ)` and `σ / (σ + δ)` is
  already 0.83 at the bench's constants. Doubling `σ` takes it to 0.91,
  so `R0` at `π = 1, g = 1.5` goes from 1.25 to 1.36 and the critical
  propensity moves from 0.80 to no lower than **0.73**. The frame is the
  opposite of fatigue in direction and a fraction of reactivity in size.
  Raising the return rate can only ever buy the dissipation's share.
- **H6b. Still no critical point without gain.** At `g = 1` the ceiling
  is `R0 = 0.91 π < 1` at every `π`. The duration test at `g = 1` settles.
- **H6c. A faster return drains the exterior.** Below the critical point
  the exterior at the end should sit *lower* than the `none` frame's at
  the same `π`, since mass spends less time outside, while exclusions and
  returns run higher. Pollution under this frame shows in the count of
  returns, not in the standing mass. If this holds, "exterior at the end"
  is the wrong reading of this frame, and the README should say so.
- **The theorem** to go with it: `R0` is monotone in `σ` and bounded by
  `π g` for any `σ`. `ironic_monotone`, `ironic_capped` in the proofs.

What would falsify the framing: a critical point under 0.7, or the
exterior at the end *higher* than `none` below the critical point.

## Results (2026-10-28)

Nothing above this line was changed after the runs. The sweeps are
`lab/sweep.js`; their figures are `lab/sweep-*.svg`; the runs are in
`lab/sweep-*.json`, not tracked. 180-second sessions, 20 seeds a point.

**H1, as pre-registered: not supported. The critical point is there, but
the test could not see it.** On the `none` frame the exterior at the end
rises from 0 at `π = 0` to 128 at `π = 1`, smoothly: 3.5 at 0.3, 8.8 at
0.6, 25 at 0.78, 47 at 0.87, 128 at 1.0. By the verdict rule that is
*slides*, and the sharpest step is at the top of the range, not at 0.8.
The rule was written for a quantity that is bounded and steps; a quantity
that diverges at a critical point does not step, it grows, and in a
finite session it grows smoothly through the critical value. The
pre-registered instrument was the wrong one for the prediction it was
testing, and that is recorded here as the failure it is.

**The post-hoc test (`lab/duration.js`, written after the sweep came
back):** for a critical point the question is whether the end state
depends on how long the session ran. Below `R0 = 1` it should settle;
above it should keep growing. Median exterior at 180 s and 720 s, `g =
1.5`, frame `none`, with the exponential rate over the last six minutes:

| π | R0 | at 180 s | at 720 s | ratio | growth / min |
|---|---|---|---|---|---|
| 0.6 | 0.75 | 8.8 | 9.6 | 1.1 | +0.00 |
| 0.7 | 0.87 | 15.8 | 24.0 | 1.5 | +0.04 |
| **0.8** | **1.00** | 29.0 | 112.6 | 3.9 | +0.11 |
| 0.9 | 1.13 | 54.9 | 3403 | 62 | +0.43 |
| 1.0 | 1.25 | 128.4 | 23500 | 183 | +0.45 |

Settled at 0.6, growing at 0.9, and the turn is at the predicted 0.8.
The mean-field `R0` describes the simulator. This is a post-hoc test and
is labelled one; a reader who holds it to the pre-registration should
count H1 as failed and this as a second, unregistered experiment that a
further run would have to confirm with a new seed base.

**H2: supported.** With `g = 1`, `R0 ≤ 0.83` everywhere. The end state
rises from 0 to 19.6 across `π` and settles at every `π` in the duration
test: ratios 0.93 to 1.22, growth rates between −0.03 and +0.01 a
minute. No critical point without gain. The threshold is the gain's.

**H3: half supported.** *Fatigue* bounds: the exterior stays under 6.3 at
every `π` and every `g` tried, and settles in the duration test at every
`π` (ratios 0.90 to 1.16). The second half of H3 fails: the load does
not end near its cap, it ends near 0.5, because a body that excludes
less also loads less; fatigue finds an equilibrium rather than paying
everything. *Reactivity* accelerates as predicted: the rise begins near
`π = 0.4` instead of 0.8, and the load is at its cap from `π = 0.43`.
Above `π ≈ 0.75` the reactivity curve is the `none` curve at `π = 1`,
since the load has driven the effective propensity to 1.

**H4: consistent, by magnitude.** Destroying the content and returning the
act with `a = 0.5` puts `R0 ≤ 0.63` everywhere and the exterior ends under
5.0 at every `π`; with `a = 0.9`, `R0` reaches 1.13 and the exterior ends
at 13.8. Both read *slides* by the rule, as H1 did, so the rule cannot
show the moved threshold; the duration test was not run on these.
`permanent_exclusion_lowers_R0` in the proofs is the clean statement.

**H5: supported.** `π = 0` ends with an empty exterior at every gain and
frame, and the field clears.

**The gain sweep at `π = 1`** (0.5 to 2.0, returns capped at 50 a tick so
that the supercritical end is computable) rises from 7.8 to 1860 on
`none`, smoothly, with the mean-field `g* = 1.2` at the foot of the rise.
*Fatigue* stays under 6.3 throughout. The rule calls the fatigue curve a
*cliff*, which is an artefact: its whole range is 2.4 units of exterior,
and the rule normalises by a maximum that small. The rule needs a floor
on the absolute range as well as the relative one; it is left as it was
so the artefact stays visible.

**What this says about the two loops.** The Unframeable sweep found a
slope and explained it as a threshold meeting a rate; this bench finds a
critical point and explains it as a reproduction number crossing one.
The difference between the pieces is one rule: whether what returns
invites an act. Where it does not, the loop is linear and saturates.
Where it does, and returns louder than it left, there is a `π*` above
which the viewer cannot keep up. The literature's rebound is small
(`d ≈ 0.3`), which in these terms is a `g` a little above one; with the
bench's `σ / (σ + δ) = 0.83`, a `g` under 1.2 has no critical point at
any propensity, and a `g` of 1.5 has one at 0.8. Whether a person's loop
has a gain, and what it is, is not a question this bench can answer.

### The fourth frame's runs (2026-10-28, after the section above was written)

Figures `lab/sweep-propensity.svg` (now four frames); the duration tests
are in the session record. `g = 1.5` unless said.

**H6a: right about the threshold, wrong about the size.** The critical
point moved as the mean field said and no further: in the duration test
the ironic frame settles at `π = 0.6` (ratio 1.10), is nearly settled at
0.7 (1.96, growth +0.02 a minute) and grows hard at 0.8 (ratio 139). The
turn is between 0.7 and 0.8, inside the predicted band, and the
falsifier (a critical point under 0.7) did not fire. But "a fraction of
reactivity in size" was wrong. At `π = 1` the ironic exterior ends at
1107 against 128 for `none`, with 3148 exclusions against 385. The
mean field missed this because `R0` counts exclusions *per generation*
and says nothing about how long a generation takes. Doubling `σ` barely
moves `R0` (0.83 → 0.91 on the return share) but halves the generation
time, so above the threshold the exponential rate roughly doubles:
`σ_eff (g − 1) − δ` is 0.015 a second for `none` and 0.04 for ironic at
full load, and over three minutes that is `e^2.7` against `e^7.2`.
**`R0` says whether the loop runs away; `σ` says how fast.** Wegner's
monitor does not change whether suppression fails; it changes how
quickly the failure compounds. That is the refinement this frame adds,
and it is the opposite of what H6a's second sentence claimed.

**H6b: supported.** At `g = 1` the ironic frame settles at every `π`:
ratios 0.83 to 1.34, growth rates within ±0.01 a minute, exterior under
25. The monitor cannot make a loop without gain run away.

**H6c: supported, modestly.** Below the critical point the ironic
exterior at the end sits at or under the `none` frame's at the same `π`
(5.0 against 7.0 at 0.52, 5.0 against 8.1 at 0.57, 6.9 against 8.8 at
0.61) while returns run higher (37 against 25, 41 against 39, 56 against
39). Mass spends less time outside. Above the critical point the order
reverses, for the reason in H6a. So for this frame "exterior at the end"
reads pollution only above the threshold; below it the count of returns
is the honest measure, and the README now says so.

**The verdict rule misfired again,** this time the other way: it called
the ironic curve a *cliff* on the strength of the exponential tail at
`π → 1`, not of anything at 0.8. The rule has now been wrong on this
bench in both directions and is kept, unchanged, as the record of that.

**A bench artefact in the far supercritical tail.** The returns-per-tick
cap (50) binds in the ironic frame at `π ≥ 0.9` over twelve minutes,
which is why the measured growth rate there (+0.12, +0.04) is lower than
at 0.8 (+0.52). The exterior is in the tens of thousands by then; the
numbers past the cap say the cap, not the loop.

**Proved:** `ironic_monotone` (a higher return rate never lowers `R0`)
and `ironic_capped` (`R0 ≤ π g` whatever the return rate). The second
is the theorem behind H6a's correct half and is silent about H6a's wrong
half, which is the right division of labour between a theorem about a
ratio and a simulator with a clock.

**Caveats.** One process wrote the brief into rules, chose every
constant, wrote the hypotheses and ran them; the pre-registration is the
only thing standing between the hypotheses and the results, and H1 shows
it working as a check on the instrument, not only on the claim. The
simulator is small (one viewer, one exterior, mass in units); the
`returnsPerTickCap` is a bench convenience with no counterpart in the
brief. The hold path dissolves a signal after six seconds of attention,
which is the brief's "receive the information" reading made literal and
is as contestable as any constant here.
