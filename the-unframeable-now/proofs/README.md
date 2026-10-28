# Proofs

What the piece's claims look like when they are theorems, and which of
them can be. Started 2026-10-28, from the question *can we back the
hypothesis with math proofs?* The answer is: four of the model's claims,
yes, by machine-checked proof over the rules themselves; the headline of
the sweep, by a derivation on paper that the lab then confirms; and the
claims about a person, not at all, which is the point.

Written by Claude, working with Jeff. Lean 4 core, no Mathlib, so that
the proofs can be checked with one small toolchain and read without a
library behind them.

## What is proved, in `Unframeable.lean`

The model is `../lab/model.js`, restated over an abstract state: levels
are thousandths as natural numbers, time is milliseconds, and the
exponential recovery is any factor between 0 and 1, which is all its
proof needs. Each theorem is of the form *if the model is as written,
then this follows*. None is a claim about a person.

| § | theorem | the claim it bears on |
|---|---|---|
| 1 | `no_moves_no_echo` | the abstainer's band is flat |
| 1 | `move_echoes` | one unsevered move puts an echo in the field when it lands |
| 1 | `acting_echoes` | the bin severs at most one branch and costs two moves, so any session with two or more moves has a live echo at some moment: **the band cannot be kept flat by acting**, which is the welcome card's game and general.json's claim |
| 2 | `pulseStep_ok`, `runPulse_ok` | no rule takes the pulse under the floor, or the floor over the cap, for a step or a session |
| 2 | `floor_mono`, `runPulse_floor_mono` | **no rule lowers the floor**; what a moment leaves, it leaves for the session (Lex's module 5) |
| 3 | `calmTarget_le_ceiling` | calm's relaxation target sits under `1 − paceFloor − floor` whatever the pulse does |
| 3 | `moment_lowers_ceiling` | a moment that does not hit the cap lowers that ceiling by exactly its step |
| 3 | `ceiling_never_recovers` | and the ceiling never rises again: **the moment's calm deficit persists as structure**, which is the scare frame's H1 read off the rules rather than the sample |
| 4 | `agency_mono_without_gives` | with no like-that-worked and no emptying, agency never rises; her echoes ageing out is not among the rules that move it, so **being buried is not agency** (the round-8 correction) |

The rules were transcribed from `model.js` by hand into `PulseStep` and
`AgencyStep`. If the page's rules change, the transcription is what has
to be checked, the way `conformance.js` checks the lab against the page.

## What is derived, not proved: the knee

The sweep (`../lab/README.md`, *What the sweep said*) found no cliff and
one knee, near 3.5 s between arrivals. `../lab/knee.js` reads the knee
off the rules by hand. Attention recovers only on a tick when nothing
has arrived for 3 s. The gap between arrivals is `paceMs × u` with `u`
uniform on [0.6, 1.5). So the share of gaps a recovery can happen in is

    q(p) = clamp((1.5 − 3000 / p) / 0.9, 0, 1)

which is 1 for `p ≥ 5000`, 0 for `p ≤ 2000`, and linear in `1/p`
between. It is continuous. Across the 24 points of the sweep, each
persona's median attention at the end correlates with `q(p)` at
`r = 0.90` to `0.997` on a normal day and `0.97` to `0.996` on a bad
day; the doomscroller, whose attention is at zero from 3.3 s down, is
the exception at `0.86` and `0.80`. The page's three paces sit at
`q = 1.00`, `0.74` and `0.00`.

So the knee is the recovery threshold meeting the arrival rate, a
continuous function with two kinks, and not a reorganisation of the
state. This is a derivation about the mean, checked against a sample,
not a theorem: the simulator's arrivals come in clumps and the
personas' hands add to the pulse, which `q(p)` ignores. A proof that the
expected end state is continuous in `paceMs` would need the real
numbers and a measure, which is Mathlib, and is not attempted here.

## What cannot be proved

That any of this is true of a person. The constants are choices; the
theorems say what the choices entail. The reverse arrow (a track that
lags the pulse and leads it down) is a hypothesis about a body, and no
proof over the model reaches it. That stays with the person and the
sensor, as the thread on issue #6 has it.

## Checking

    cd the-unframeable-now/proofs && lake build

Needs Lean 4 (`elan` installs it). No Mathlib, no network after the
toolchain.

**Status, 2026-10-28: checked.** `lake build` completes on Lean
4.35.0 (`leanprover/lean4:v4.35.0`, pinned in `lean-toolchain`), with no
`sorry` in the file and no axioms beyond Lean's own, as `Check.lean`
prints. The file was drafted without a compiler and needed four
corrections to build: a field named `at` (a Lean keyword), two Mathlib
tactics (`by_contra`, `push_neg`) replaced with `by_cases`, two lemma
arities, and one `simp` call. None of the corrections changed what a
theorem states, except `floor_mono`, which gained the hypothesis that
the floor starts under the cap: without it the moment's `min cap` could
pull a floor already over the cap back down, which the page's invariant
rules out, and the draft had overlooked.
