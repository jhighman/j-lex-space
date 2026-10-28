import Unframeable
/-! Which axioms each theorem rests on. Run with `lake env lean Check.lean`.
`propext`, `Classical.choice` and `Quot.sound` are Lean's own; `sorryAx`
would mean a proof is missing. -/
open Unframeable
#print axioms no_moves_no_echo
#print axioms move_echoes
#print axioms acting_echoes
#print axioms pulseStep_ok
#print axioms floor_mono
#print axioms runPulse_ok
#print axioms runPulse_floor_mono
#print axioms calmTarget_le_ceiling
#print axioms moment_lowers_ceiling
#print axioms ceiling_never_recovers
#print axioms agency_mono_without_gives
