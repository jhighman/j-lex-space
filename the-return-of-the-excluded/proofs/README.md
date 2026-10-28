# Proofs

What the loop of issue #5 entails, as theorems over its rules, in core
Lean 4 with no Mathlib. The model is the mean field of `../lab/model.js`:
excluded mass across generations, `x' = (num · x) / den + lam`, with
`R0 = num / den` and `lam` the system's own new material a generation;
and the two stores, the exterior and Lex's load, under the viewer's acts.
Levels are natural numbers. Each theorem is "if the loop is as written,
then this follows"; none is about a person.

| theorem | what it establishes | the claim it bears on |
|---|---|---|
| `gen_ge_self` | with `R0 ≥ 1` a generation never shrinks what it was handed | — |
| `supercritical_unbounded` | with `R0 ≥ 1`, after `n` generations the mass is at least `x₀ + n · lam`: unbounded while the system keeps speaking | **exclusion cannot keep up**; the brief's loop above its critical point |
| `subcritical_bounded`, `subcritical_bounded_iter` | with `lam · den + num · B ≤ B · den` (which has a solution exactly when `R0 < 1`) the mass never passes `B` once under it | **the excluded material settles** below the critical point |
| `exterior_mono` | under the viewer's acts alone (exclude, hold) the exterior never decreases | **nothing is gone**: the brief's claim that the exterior accumulates |
| `load_mono` | under the viewer's acts alone the load never falls, while under its cap | **Lex: dissociation burns bandwidth** |
| `permanent_exclusion_lowers_R0` | destroying content and returning only the act, with `a ≤ m`, does not raise `R0` | **the Unframeable bin lowers the loop's `R0`** |
| `supercritical_iff` | `R0 ≥ 1` is `(σ + δ) · m ≤ π · g · σ · a`, by definition | **the threshold moves; it does not vanish** |

The rules were transcribed by hand from `model.js`. If the model
changes, the transcription is what has to be checked.

## Checking

    cd the-return-of-the-excluded/proofs && lake build
    lake env lean Check.lean

**Status, 2026-10-28: checked.** `lake build` completes on Lean 4.35.0
(`leanprover/lean4:v4.35.0`, pinned in `lean-toolchain`), no `sorry`,
and `Check.lean` prints no axiom beyond Lean's own. The draft needed
three corrections to build: the orientation of a multiplication in the
division lemma, the subcritical bound restated without natural-number
subtraction (its hypothesis is now `lam · den + num · B ≤ B · den`, the
same condition in a form the arithmetic tactic can read), and the
induction steps on `run` unfolded before the case split. None changed
what a theorem states.
