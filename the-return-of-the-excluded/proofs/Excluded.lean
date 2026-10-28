/-!
# The Return of the Excluded · what the loop's rules entail

The brief of issue #5 as a branching process, and what follows from it
in core Lean 4 (no Mathlib). Quantities are natural numbers; the
reproduction number is a fraction `num / den`; the mean-field recursion
for the excluded mass across generations is

    x' = (num · x) / den + lam

with `lam` the system's own new material each generation. Each theorem
is "if the loop is as written, then this follows"; none is about a
person. The README beside this file says which claim each bears on.
-/

namespace Excluded

/-! ## §1 The mean field across generations -/

/-- One generation: what the exterior returns and the viewer re-excludes,
plus what the system supplies on its own. -/
def gen (num den lam : Nat) (x : Nat) : Nat := (num * x) / den + lam

/-- `n` generations on. -/
def iter (num den lam : Nat) : Nat → Nat → Nat
  | 0, x => x
  | n + 1, x => iter num den lam n (gen num den lam x)

/-- With `R0 ≥ 1` a generation never shrinks what it was handed. -/
theorem gen_ge_self (num den lam x : Nat) (hden : 0 < den) (hR : den ≤ num) :
    x ≤ gen num den lam x := by
  unfold gen
  have h1 : x ≤ (num * x) / den := by
    rw [Nat.le_div_iff_mul_le hden, Nat.mul_comm x den]
    exact Nat.mul_le_mul_right x hR
  omega

/-- **Supercritical: exclusion cannot keep up.** With `R0 ≥ 1` and new
material `lam` each generation, after `n` generations the excluded mass
is at least `x₀ + n · lam`: unbounded as long as the system keeps
speaking. -/
theorem supercritical_unbounded (num den lam : Nat) (hden : 0 < den) (hR : den ≤ num) :
    ∀ n x, x + n * lam ≤ iter num den lam n x := by
  intro n
  induction n with
  | zero => intro x; simp [iter]
  | succ n ih =>
      intro x
      simp only [iter]
      have h2 := ih (gen num den lam x)
      have h3 : x + lam ≤ gen num den lam x := by
        unfold gen
        have : x ≤ (num * x) / den := by
          rw [Nat.le_div_iff_mul_le hden, Nat.mul_comm x den]
          exact Nat.mul_le_mul_right x hR
        omega
      rw [Nat.add_mul, Nat.one_mul]
      omega

/-- **Subcritical: the excluded material settles.** With `R0 < 1` there is
a bound the mass never passes once under it. The bound `B` is any number
with `lam · den + num · B ≤ B · den`, which is `B ≥ lam · den / (den − num)`
and exists exactly when `num < den`. -/
theorem subcritical_bounded (num den lam x B : Nat) (hden : 0 < den)
    (hB : lam * den + num * B ≤ B * den) (hx : x ≤ B) :
    gen num den lam x ≤ B := by
  unfold gen
  have h1 : (num * x) / den ≤ (num * B) / den := Nat.div_le_div_right (Nat.mul_le_mul_left num hx)
  have hq : (num * B) / den * den ≤ num * B := Nat.div_mul_le_self (num * B) den
  have h3 : ((num * B) / den + lam) * den ≤ B * den := by rw [Nat.add_mul]; omega
  have h4 : (num * B) / den + lam ≤ B := Nat.le_of_mul_le_mul_right h3 hden
  omega

theorem subcritical_bounded_iter (num den lam B : Nat) (hden : 0 < den)
    (hB : lam * den + num * B ≤ B * den) :
    ∀ n x, x ≤ B → iter num den lam n x ≤ B := by
  intro n
  induction n with
  | zero => intro x hx; simpa [iter] using hx
  | succ n ih => intro x hx; exact ih _ (subcritical_bounded num den lam x B hden hB hx)

/-! ## §2 The exterior and the body -/

/-- The two stores the brief names, and the one Lex added. -/
structure Field where
  exterior : Nat
  load : Nat

/-- The acts. The brief's exclusion deposits `m`; dissipation and return
take from the exterior; a hold costs nothing anywhere. `cap` bounds the
load as on the Unframeable page. -/
inductive Act where
  | exclude (m : Nat)
  | hold
  | dissipate (m : Nat)
  | returned (m : Nat)
  | recover (r : Nat)

def cap : Nat := 1000
def loadStep : Nat := 50

def act : Act → Field → Field
  | .exclude m, f => { exterior := f.exterior + m, load := min cap (f.load + loadStep) }
  | .hold, f => f
  | .dissipate m, f => { f with exterior := f.exterior - m }
  | .returned m, f => { f with exterior := f.exterior - m }
  | .recover r, f => { f with load := (f.load * r) / 1000 }

def run : List Act → Field → Field
  | [], f => f
  | a :: as, f => run as (act a f)

/-- An act is the viewer's if it is an exclusion or a hold. -/
def Act.viewers : Act → Bool
  | .exclude _ => true
  | .hold => true
  | _ => false

/-- **With exclusion the only thing happening, nothing is gone.** The
exterior never decreases under the viewer's acts alone. -/
theorem exterior_mono (as : List Act) (f : Field) (h : ∀ a ∈ as, a.viewers = true) :
    f.exterior ≤ (run as f).exterior := by
  induction as generalizing f with
  | nil => exact Nat.le_refl _
  | cons a as ih =>
      have ha : a.viewers = true := h a List.mem_cons_self
      have hrest : ∀ a' ∈ as, a'.viewers = true := fun a' h' => h a' (List.mem_cons.mpr (Or.inr h'))
      simp only [run]
      cases a with
      | exclude m => exact Nat.le_trans (Nat.le_add_right f.exterior m) (ih (act (.exclude m) f) hrest)
      | hold => exact ih _ hrest
      | dissipate m => simp [Act.viewers] at ha
      | returned m => simp [Act.viewers] at ha
      | recover r => simp [Act.viewers] at ha

/-- **Lex: dissociation burns bandwidth.** Under the viewer's acts alone the
load never falls, as long as it is under its cap. -/
theorem load_mono (as : List Act) (f : Field) (hc : f.load ≤ cap) (h : ∀ a ∈ as, a.viewers = true) :
    f.load ≤ (run as f).load := by
  induction as generalizing f with
  | nil => exact Nat.le_refl _
  | cons a as ih =>
      have ha : a.viewers = true := h a List.mem_cons_self
      have hrest : ∀ a' ∈ as, a'.viewers = true := fun a' h' => h a' (List.mem_cons.mpr (Or.inr h'))
      simp only [run]
      cases a with
      | exclude m =>
          have h1 : f.load ≤ min cap (f.load + loadStep) := by simp only [cap, loadStep] at *; omega
          have h2 : (act (.exclude m) f).load ≤ cap := Nat.min_le_left _ _
          exact Nat.le_trans h1 (ih (act (.exclude m) f) h2 hrest)
      | hold => exact ih _ hc hrest
      | dissipate m => simp [Act.viewers] at ha
      | returned m => simp [Act.viewers] at ha
      | recover r => simp [Act.viewers] at ha

/-! ## §3 Permanent exclusion -/

/-- `R0` as a numerator over a denominator: `π g σ a` over `(σ + δ) m`,
all scaled to naturals. Destroying the content and returning only the
act replaces `m` (what left) by `a` (what the act weighs) in the
numerator. -/
def r0num (pi g sigma a : Nat) : Nat := pi * g * sigma * a
def r0den (sigma delta m : Nat) : Nat := (sigma + delta) * m

/-- **The threshold moves; it does not vanish.** With `a ≤ m` the
reproduction number does not rise, and it is still at least one exactly
when `π g σ a ≥ (σ + δ) m`. -/
theorem permanent_exclusion_lowers_R0 (pi g sigma m a : Nat) (ha : a ≤ m) :
    r0num pi g sigma a ≤ r0num pi g sigma m := by
  unfold r0num; exact Nat.mul_le_mul_left _ ha

theorem supercritical_iff (pi g sigma delta m a : Nat) :
    (r0den sigma delta m ≤ r0num pi g sigma a) ↔ ((sigma + delta) * m ≤ pi * g * sigma * a) := by
  rfl

/-! ## §4 The fourth frame: load raising the return rate -/

/-- `R0`'s dependence on `σ` is through `σ / (σ + δ)`. Compared as fractions
by cross-multiplication: a higher return rate never lowers `R0`. -/
theorem ironic_monotone (s1 s2 delta : Nat) (h : s1 ≤ s2) :
    s1 * (s2 + delta) ≤ s2 * (s1 + delta) := by
  simp only [Nat.mul_add]
  have h1 : s1 * delta ≤ s2 * delta := Nat.mul_le_mul_right delta h
  rw [Nat.mul_comm s1 s2]
  omega

/-- **Raising the return rate can only buy the dissipation's share.** For any
`σ`, `π g σ ≤ π g (σ + δ)`: `R0` never exceeds `π g`, whatever load does to
the monitor. Growth *above* the threshold is another matter; the rate of
that growth is not `R0`'s to bound. -/
theorem ironic_capped (pi g sigma delta : Nat) :
    r0num pi g sigma 1 ≤ pi * g * (sigma + delta) := by
  unfold r0num
  rw [Nat.mul_one]
  exact Nat.mul_le_mul_left _ (Nat.le_add_right _ _)

end Excluded
