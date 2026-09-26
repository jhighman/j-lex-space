## About this paper

This paper takes a historical progression in distress signalling — the Marconi
Company's CQD procedure of 1904 and its replacement by SOS at the 1906 Berlin
Radiotelegraphic Convention — and formalises it into a runtime specification.
It then asks the harder question: what does that analogy actually license, and
where does it quietly mislead?

It is written for engineers who build safety interlocks, emergency stops, and
agent harnesses, and who are being asked to accept *make the boundary atomic*
as an architectural principle. It is also written for reviewers who have to
decide whether a proposed invariant is enforced or merely agreed to.

**Amended.** Section 6 has been revised since first issue. A second
implementation of this specification, produced independently, seals the method
table at boot and thereby answers much of what section 6 originally treated as
unanswerable. The companion paper *Seal and Lock* reports that comparison in
full; the revision is incorporated here.

**Status.** Draft for review. Every executable claim in this paper was run.
The results in section 5 and Appendix A are transcript, not intent. Appendix C
records how the argument was corrected across four rounds, and marks which
claims in the current text remain untested.

---

## Summary

In 1904 the Marconi Company circulated CQD as its distress call. In 1906 the
Berlin convention replaced it with SOS, sent as a single unspaced prosign with
no gaps between the letters. The engineering instinct this invites — **remove
the seam, and there is nothing at the seam to attack** — is sound, and it
translates cleanly into a runtime contract: one entry point, an immutable
payload, an unconditional teardown.

This paper builds that contract in Ruby, and then reports what happened when
it was attacked.

**The contract holds against every in-language completion path.** A returning
payload, a raising payload, a killed thread, eight contending threads — all
land the carrier back at State 0. That much is real, and it is worth having.

**Against an unsealed class it does not hold against anything else.** A
six-line monkey patch removed the lock, the state machine and the teardown
together. A single call to `instance_variable_set` violated the invariant
without ever entering the guarded method.

**Teardown reaches further than first reported, and what strands is
narrower.** Of nine termination modes tested, six run `ensure` — including
`exit` and `SIGTERM`, which an earlier issue of this paper wrongly grouped
with `exit!`. And when teardown is skipped, in-memory state does not strand:
the process is gone and the operating system has reclaimed it. What strands is
state mirrored outside the process, which is where section 7 scopes the
remedy.

**Sealing answers more of that than this paper first allowed.** A class whose
method table is frozen before untrusted code loads resists the patch, and
resists `Module#prepend`, `Module#include` and a restored allocator besides —
all four verified. What survives sealing is narrower: a same-privilege
allocator bypass that yields a duplicate holding no authority, the object's
own mutable state, and process death. Section 6 sets out the amended claim.

The conclusion is not that metaprogramming should be banned at the boundary,
though it should. It is sharper than that. **Metaprogramming is not the
threat; it is the diagnostic.** Where it can void an invariant, the invariant
was resting on agreement rather than on structure. Applied to an unsealed
class that is the whole story — what enforced the invariant was every author
in the process agreeing not to write the patch, which is a convention, and
eliminating conventions at a distress boundary is the entire point of the 1906
story. Applied to a sealed one it returns a narrower and more useful answer:
the seam did not disappear, it moved, and it now lies between the end of boot
and everything that loads afterwards.

So the ban is real but its justification changes. Prohibit dynamic
redefinition at the boundary for **review integrity** — so that the reviewed
callable surface equals the runtime callable surface — and place the
**security** boundary where it can actually be enforced: at a process and
privilege boundary, checked by a receiver that does not execute the code it is
guarding.

Section 8 applies this to AI safety harnesses, where the same error appears in
a more expensive form. A harness that shares an address space with the thing
it constrains is documentation.
