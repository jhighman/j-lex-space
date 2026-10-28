/-!
# The Unframeable Now · what the model's rules entail

Four of the piece's claims, proved from the update rules in
`../lab/model.js`, restated here over an abstract state. Nothing below is
a claim about a person; every theorem is of the form "if the model is as
written, then this follows". Core Lean 4 only, no Mathlib: levels are
thousandths as natural numbers, and the exponential recovery is any
factor between 0 and 1, which is all its proof needs.

Each section names the claim in the record it bears on.

- §1 the echo: *every frame applied re-enters as signal*; the band cannot
  be kept flat by acting (general.json's claim; the welcome card's game).
- §2 the pulse: the allostatic floor never comes down, and the pulse
  never crosses it (Lex's module 5; the scare frame's H1).
- §3 calm: after a moment, the ceiling calm relaxes toward is lower by
  the floor's step, for the rest of the session (H1 again, as structure).
- §4 agency: it does not come back when her echoes age out; being buried
  is not agency (the round-8 correction).
-/

namespace Unframeable

/-! ## §1 The echo -/

/-- Time in milliseconds. -/
abbrev Time := Nat

/-- A move at a moment, and whether the Empty Bin severed its return. -/
structure Move where
  t0 : Time
  severed : Bool

/-- A move's echo lands `d` after it and lasts `L`. It is live at `t` when
it has landed, has not aged out, and was not severed. -/
def echoLive (d L : Nat) (m : Move) (t : Time) : Bool :=
  !m.severed && decide (m.t0 + d ≤ t) && decide (t < m.t0 + d + L)

/-- How many of her echoes are in the field at `t`. The band on the page
is this over the field's size; it is zero exactly when this is. -/
def echoCount (d L : Nat) (ms : List Move) (t : Time) : Nat :=
  (ms.filter (fun m => echoLive d L m t)).length

/-- With no moves there is no echo, ever. The abstainer's band is flat. -/
theorem no_moves_no_echo (d L : Nat) (t : Time) : echoCount d L [] t = 0 := rfl

/-- One unsevered move puts an echo in the field the moment it lands. -/
theorem move_echoes (d L : Nat) (ms : List Move) (m : Move)
    (hm : m ∈ ms) (hs : m.severed = false) (hL : 0 < L) :
    0 < echoCount d L ms (m.t0 + d) := by
  unfold echoCount
  apply List.length_pos_of_mem (a := m)
  rw [List.mem_filter]
  refine ⟨hm, ?_⟩
  simp [echoLive, hs] <;> omega

/-- The Empty Bin severs at most one branch a session, and using it is
itself two moves. So any session with two or more moves has an unsevered
one, and its echo lands: the band cannot be kept flat by acting. -/
theorem acting_echoes (d L : Nat) (ms : List Move)
    (h2 : 2 ≤ ms.length) (hbin : (ms.filter (fun m => m.severed)).length ≤ 1) (hL : 0 < L) :
    ∃ t, 0 < echoCount d L ms t := by
  -- some move is unsevered: otherwise the severed filter is the whole list
  by_cases hex : ∃ m ∈ ms, m.severed = false
  · obtain ⟨m, hm, hs⟩ := hex
    exact ⟨m.t0 + d, move_echoes d L ms m hm hs hL⟩
  · exfalso
    have hself : ms.filter (fun m => m.severed) = ms := by
      rw [List.filter_eq_self]
      intro m hm
      cases h : m.severed with
      | true => rfl
      | false => exact absurd ⟨m, hm, h⟩ hex
    rw [hself] at hbin
    omega

/-! ## §2 The pulse and its floor -/

/-- The pulse (cortisol) and the allostatic floor under it, in thousandths.
`cap` is 1000 on the page. -/
structure Pulse where
  floor : Nat
  cort : Nat

/-- What happens to the pulse, one rule at a time, as `model.js` has them. -/
inductive PulseStep where
  /-- an arrival or a move: `min(1, cort + x)` -/
  | rise (x : Nat)
  /-- a hide, a mute or the bin: `max(floor, cort − x)` -/
  | relief (x : Nat)
  /-- the moment: the floor rises by `step`, the pulse to at least `atLeast` -/
  | moment (step atLeast : Nat)
  /-- recovery on the tick: `floor + (cort − floor) · r`, with `r ≤ 1` as `r/1000` -/
  | recover (r : Nat)
  /-- the bin closing unused: the pulse to the cap -/
  | clamp

def cap : Nat := 1000

def pulseStep : PulseStep → Pulse → Pulse
  | .rise x, p => { p with cort := min cap (p.cort + x) }
  | .relief x, p => { p with cort := max p.floor (p.cort - x) }
  | .moment step atLeast, p =>
      let f := min cap (p.floor + step)
      { floor := f, cort := max (max f p.cort) atLeast }
  | .recover r, p => { p with cort := p.floor + ((p.cort - p.floor) * r) / 1000 }
  | .clamp, p => { p with cort := cap }

/-- The invariant the page keeps: the floor is under the cap and under the pulse. -/
def Pulse.ok (p : Pulse) : Prop := p.floor ≤ cap ∧ p.floor ≤ p.cort

/-- No rule takes the pulse below the floor, or the floor above the cap. -/
theorem pulseStep_ok (s : PulseStep) (p : Pulse) (h : p.ok) : (pulseStep s p).ok := by
  obtain ⟨hc, hf⟩ := h
  cases s with
  | rise x => simp only [pulseStep, Pulse.ok, cap] at *; omega
  | relief x => simp only [pulseStep, Pulse.ok, cap] at *; omega
  | moment step atLeast => simp only [pulseStep, Pulse.ok, cap] at *; omega
  | recover r =>
      refine ⟨hc, ?_⟩
      simp only [pulseStep]
      exact Nat.le_add_right _ _
  | clamp => simp only [pulseStep, Pulse.ok, cap] at *; omega

/-- No rule lowers the floor. What a moment leaves, it leaves for good.
(The floor must start under the cap: the moment's `min cap` would otherwise
pull a floor already over the cap back down to it, which the page's
invariant rules out.) -/
theorem floor_mono (s : PulseStep) (p : Pulse) (hc : p.floor ≤ cap) :
    p.floor ≤ (pulseStep s p).floor := by
  cases s with
  | moment step atLeast => simp only [pulseStep, cap] at *; omega
  | rise x => exact Nat.le_refl _
  | relief x => exact Nat.le_refl _
  | recover r => exact Nat.le_refl _
  | clamp => exact Nat.le_refl _

/-- Over a whole session, then: the floor at the end is at least the floor
at any earlier point, and the pulse never dips under it. -/
def runPulse : List PulseStep → Pulse → Pulse
  | [], p => p
  | s :: ss, p => runPulse ss (pulseStep s p)

theorem runPulse_ok (ss : List PulseStep) (p : Pulse) (h : p.ok) : (runPulse ss p).ok := by
  induction ss generalizing p with
  | nil => exact h
  | cons s ss ih => exact ih _ (pulseStep_ok s p h)

theorem runPulse_floor_mono (ss : List PulseStep) (p : Pulse) (h : p.ok) :
    p.floor ≤ (runPulse ss p).floor := by
  induction ss generalizing p with
  | nil => exact Nat.le_refl _
  | cons s ss ih => exact Nat.le_trans (floor_mono s p h.1) (ih _ (pulseStep_ok s p h))

/-! ## §3 Calm's ceiling -/

/-- On the page calm relaxes toward `1 − max(paceFloor + floor, cort)`.
Whatever the pulse does, that target is under this ceiling. -/
def calmCeiling (paceFloor floor : Nat) : Nat := cap - paceFloor - floor

def calmTarget (paceFloor : Nat) (p : Pulse) : Nat := cap - max (paceFloor + p.floor) p.cort

theorem calmTarget_le_ceiling (paceFloor : Nat) (p : Pulse) :
    calmTarget paceFloor p ≤ calmCeiling paceFloor p.floor := by
  simp only [calmTarget, calmCeiling]; omega

/-- A moment that does not hit the cap lowers the ceiling by exactly its step. -/
theorem moment_lowers_ceiling (paceFloor step atLeast : Nat) (p : Pulse)
    (hroom : p.floor + step ≤ cap) :
    calmCeiling paceFloor (pulseStep (.moment step atLeast) p).floor
      = calmCeiling paceFloor p.floor - step := by
  simp only [pulseStep, calmCeiling, cap] at *
  omega

/-- And since the floor never comes down, neither does the ceiling, for the
rest of the session: the deficit the moment leaves persists as structure. -/
theorem ceiling_never_recovers (paceFloor : Nat) (ss : List PulseStep) (p : Pulse) (h : p.ok) :
    calmCeiling paceFloor (runPulse ss p).floor ≤ calmCeiling paceFloor p.floor := by
  have := runPulse_floor_mono ss p h
  simp only [calmCeiling]; omega

/-! ## §4 Agency -/

/-- What moves agency, as `model.js` has it. -/
inductive AgencyStep where
  /-- every move costs; the echo's share drags on the tick -/
  | cost (x : Nat)
  /-- a like on something she wanted, that worked -/
  | likedWant (x : Nat)
  /-- the bin emptied -/
  | emptied (x : Nat)

def agencyStep : AgencyStep → Nat → Nat
  | .cost x, g => g - x
  | .likedWant x, g => min cap (g + x)
  | .emptied x, g => min cap (g + x)

def runAgency : List AgencyStep → Nat → Nat
  | [], g => g
  | s :: ss, g => runAgency ss (agencyStep s g)

/-- The two acts that give agency back. -/
def AgencyStep.gives : AgencyStep → Bool
  | .likedWant _ => true
  | .emptied _ => true
  | .cost _ => false

/-- With neither of them, agency never rises. Her echoes ageing out is not
among the rules that move it, so being buried does not bring it back. -/
theorem agency_mono_without_gives (ss : List AgencyStep) (g : Nat)
    (h : ∀ s ∈ ss, s.gives = false) : runAgency ss g ≤ g := by
  induction ss generalizing g with
  | nil => exact Nat.le_refl _
  | cons s ss ih =>
      have hs : s.gives = false := h s List.mem_cons_self
      have hrest : ∀ s' ∈ ss, s'.gives = false := fun s' hs' => h s' (List.mem_cons.mpr (Or.inr hs'))
      cases s with
      | cost x =>
          simp only [runAgency, agencyStep]
          exact Nat.le_trans (ih _ hrest) (Nat.sub_le _ _)
      | likedWant x => simp [AgencyStep.gives] at hs
      | emptied x => simp [AgencyStep.gives] at hs

end Unframeable
