## About this paper

Two implementations of the same specification were produced independently, by
different language models, from substantially the same prompt: formalise the
1904 CQD to 1906 SOS progression into a Ruby distress boundary, and answer
whether metaprogramming should be allowed to mutate it at runtime.

This paper compares them under test. Both were executed. Each was then
attacked with the probes the *other* implementation's test suite implied,
which is where the interesting result is.

It is a companion to *Remove the Seam*. The amendment it produced has since
been folded into that paper's sections 6 and 7; what follows is the comparison
the amendment rests on, which does not fit inside it.

**Status.** Draft for review. Every claim about behaviour in this paper was
run on Ruby 2.6.10 (arm64-darwin). Appendix A is transcript.

---

## Summary

The two answers converged on the same architecture — one entry point, a frozen
payload, teardown in `ensure` — and then diverged on which threat each took
seriously. Neither divergence was arbitrary. Each is a coherent reading of the
prompt, and **each implementation passes its own test suite completely.**

**The second implementation seals the method table at boot.** It freezes the
carrier class, its eigenclass and the constant table before untrusted code
loads, and undefines `new` and `allocate`. This defeats the monkey patch that
the first implementation treated as unanswerable. Attacked with three vectors
its own suite never tries — `Module#prepend`, `Module#include`, and restoring
`:new` through the class's singleton — it held on all three. `prepend` is the
vector that usually gets past a frozen class, because it edits the ancestor
chain rather than the method table. It does not get past this one.

**The first implementation locks the carrier.** It serialises transmission
with a mutex and refuses re-entry with a domain error rather than a
`ThreadError`.

Neither did both. Under four threads, the sealed implementation permitted
**four simultaneous transmissions**, and its idle indicator reports State 0
while transmissions are still live — because the first payload to finish
clears a shared flag for all the others. The locked implementation, meanwhile,
could be dismantled by six lines of reopened class.

**The general finding is about evaluation, not about Ruby.** Each suite was
shaped by its author's threat model, so each was comprehensive about the
attacks its author had in mind and silent about the rest. Both reported that
everything passed. A green suite measured the author's imagination, not the
artifact.

Section 7 builds the union: seal plus lock. Combining them also removes a hole
that *both* originals conceded — the state can be held in a closure local
rather than an instance variable, at which point the carrier has no instance
variables, can be frozen outright, and `instance_variable_set` has nothing to
reach. Sixteen post-conditions, all passing, in Appendix A.
