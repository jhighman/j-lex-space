import Excluded
/-! Which axioms each theorem rests on. Run with `lake env lean Check.lean`.
`propext`, `Classical.choice` and `Quot.sound` are Lean's own; `sorryAx`
would mean a proof is missing. -/
open Excluded
#print axioms gen_ge_self
#print axioms supercritical_unbounded
#print axioms subcritical_bounded
#print axioms subcritical_bounded_iter
#print axioms exterior_mono
#print axioms load_mono
#print axioms permanent_exclusion_lowers_R0
#print axioms supercritical_iff
