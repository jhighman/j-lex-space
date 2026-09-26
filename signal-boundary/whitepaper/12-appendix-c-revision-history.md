# Appendix C — How the argument was corrected

This paper argues that a property should be exercised rather than asserted.
That standard applies to the paper. Every substantive claim in it was written
first and tested second; three survived contact and three did not. This
appendix records what each round changed, what falsified it, and what the
amended claim became — because the corrections are better evidence for the
thesis than the original text was.

## Round 0 — the origin

The work began with an interactive teaching screen that told the reader
*completion restores State 0, even if the useful work had raised*, over a
mechanism that modelled transmission with a timer and had no failure path at
all. The guarantee did exist, correctly implemented and tested — in a function
the screen never called.

Nothing was wrong with the code. What was wrong was that the claim and the
mechanism had drifted apart, and the screen asserted a property the code
beneath it did not exercise. The correction wired the screen to the tested
function and added a control that makes the payload raise, so the reader
watches the state row refuse to move.

**Pattern: prose ahead of mechanism.** It recurs in every round below.

## Round 1 — the specification

*Claim as written.* State 0 is unconditional.

*What was run.* `exit!` inside the closure; `instance_variable_set` outside
it; `Thread#kill`; an exception.

*Outcome.* `ensure` survived the exception and the killed thread, and did not
survive `exit!`. And the invariant could be violated without entering the
guarded method at all.

*Amended to.* State 0 is restored on every completion path that returns
control to the Ruby runtime, in a process where no code has modified the class
or its instances.

## Round 2 — the metaprogramming ceiling

*Claim as written.* No discipline expressed in Ruby prevents the boundary
being redefined at runtime. Ruby cannot be defended from Ruby.

*What was run.* A second implementation of the same specification, produced
independently from the same prompt, which seals the method table at end of
boot. Four attacks were put to it: the six-line monkey patch,
`Module#prepend`, `Module#include`, and restoring `:new` through the class's
singleton.

*Outcome.* All four raised `FrozenError`. `prepend` was expected to succeed,
because it edits the ancestor chain rather than the method table. It did not.

*Amended to.* Ruby can be defended from Ruby up to the allocator, and only
inside a window that closes when untrusted code loads.

**This correction could not have come from re-reading.** The original claim
was internally consistent, supported by a working demonstration, and wrong.
What falsified it was an artifact built on a different premise about what the
asset was.

## Round 3 — process death

*Claim as written.* Abrupt termination skips teardown, leaving the carrier
stuck at State 1; the same applies to `SIGKILL`, a native fault and the OOM
killer.

*What was run.* Nine termination modes, each acquiring an external resource
before the closure and releasing it in an application-level `ensure`.

*Outcome.* Two errors. Teardown runs on six of the nine — `exit` and `SIGTERM`
among them, which the text had grouped with `exit!`. And nothing was stuck at
State 1, because the process was gone; a fresh process reported State 0. What
stranded was the external lease.

*Amended to.* Three of nine modes skip teardown, and what strands is state
mirrored outside the process. Crash-only design applies there and nowhere
else.

## Round 4 — the specification, again

*What prompted it.* Not a falsified claim, but an inconsistency the first
three rounds created. Section 4 specified a carrier that sections 5 and 6 then
spent several pages dismantling, while a version answering all three defects
existed in the repository and was never mentioned in the paper.

*Outcome.* Section 6b now gives the hardened specification, and section 4 is
explicitly labelled the baseline. Section 8 was rewritten to reflect rounds 2
and 3, which it had not previously absorbed.

## The shape of it

| Round | What fell | What did it |
|---|---|---|
| 0 | A claim on screen with no mechanism behind it | Reading the code the screen called |
| 1 | "State 0 is unconditional" | Executing four completion paths |
| 2 | "Ruby cannot be defended from Ruby" | An implementation with a different premise |
| 3 | "Abrupt termination strands the carrier" | Measuring nine termination modes |
| 4 | Internal inconsistency | Auditing the paper against its own repository |

Three observations, none of them flattering to the original text.

**Every correction came from running something or building something. None
came from re-reading.** The prose was re-read many times between rounds and
survived each time, because a claim is only as good as the attempt to falsify
it, and re-reading is not an attempt.

**The two largest corrections came from outside.** Round 2 came from an
independently produced implementation; round 3 from a reader's restatement
that exposed an untested generalisation by stating it plainly. In both cases
the falsifying input carried a premise the author did not hold.

**The paper got stronger each time, not weaker.** Round 2 narrowed a sweeping
claim into an actionable one — *seal, and know what the window buys you* is
advice; *the language cannot help you* is not. Round 3 converted a vague
warning about cleanup into a specific design question: which part of this
invariant outlives the process?

## What is still only asserted

The same standard, applied to the current issue. The following are in the text
and have **not** been executed, and a reader should treat them accordingly.

**Measured on one runtime only.** Every result comes from Ruby 2.6.10 on
arm64-darwin. `$SAFE`'s removal in 3.0 and the availability of
`UnboundMethod#bind_call` from 2.7 are from documentation, and the sealing
results have not been re-run on 3.x.

**Two termination modes are reasoned, not measured.** The OOM killer and a
hypervisor removing the host are grouped with `SIGKILL` on the argument that
they are also uncatchable. That is likely and untested here. A native
segmentation fault *was* measured.

**The transfer to other languages is asserted.** Section 6 claims the argument
applies with minor variations to Python, JavaScript and the JVM under
reflection. Nothing was run in any of them.

**Sections 7 and 8 are architectural recommendations, not measured
properties.** Process isolation, receiver-side enforcement, lease expiry and
external reconciliation are argued from the measurements, not demonstrated. No
supervisor was built and no reconciliation was observed repairing anything.

**The history in section 2 is from secondary sources.** Circular 57, the
Berlin convention's interoperation requirement, and the claim that CQD's
weakness was prefix collision with `CQ` are not primary-source verified.

If a later round falsifies one of these, it belongs in this appendix rather
than in a quiet edit to the body.
