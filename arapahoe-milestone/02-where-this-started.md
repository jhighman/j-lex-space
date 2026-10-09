# Where this started

## Two distress protocols

In 1904 the Marconi Company circulated CQD as its distress call: `CQ`, the
general call to all stations, with `D` appended. Its weakness was not mainly
noise but collision with its own prefix — under degraded copy a distress call
was one dropped character from routine traffic addressed to everybody. The
failure mode was not corruption into nonsense but corruption into something
plausible.

In 1906 the Berlin convention replaced it with SOS, chosen because its rhythm
is unmistakable and sent as a single unspaced prosign. There is no seam
between the marks, so there is nothing at the seam to attack. The convention's
other achievement mattered as much: it compelled stations to accept distress
traffic regardless of whose equipment sent it, ending a commercial arrangement
under which the nearest receiver could be contractually deaf.

Two decisions, taken together. **Make the signal unmistakable, and make the
network obliged to hear it.** The first is a protocol property; the second is
governance, and no protocol design could have supplied it.

## What that became

Rendered as a runtime contract, the progression gives one entry point, an
immutable payload, and a teardown that does not depend on the caller
remembering. Two papers argue it — *Remove the Seam* and *Seal and Lock* — and
both now live in the repository with the Ruby that backs them.

They were wrong twice, and the corrections are the reason they are worth
citing. The first issue claimed no discipline expressed in Ruby prevents the
boundary being redefined at runtime; sealing the method table before untrusted
code loads disproves that, and a second implementation produced independently
demonstrated it. The second issue claimed abrupt termination strands the
guard; measuring nine ways of dying showed six of them run teardown, and that
what strands is never what a process held in memory — the operating system
reclaims that — but what the process wrote outside itself.

That second correction is the one that reaches ARAPAHOE, and section 6 spends
it.

## The transferable finding

*Seal and Lock* compared two implementations of the same specification,
produced independently. Both shipped a serious test suite. Both suites
reported complete success. **Neither contained a single assertion about the
failure the other one found.**

The omissions were not careless. Each followed from its author's premise about
what the asset was: having decided the method table was the thing to protect,
concurrency was somebody else's problem; having decided in-process defence was
futile, testing whether a seal holds was pointless by construction. Review by
the same author could not have found either gap, because the reviewer shares
the premise that produced it.

This bench already knew that rule, from the other end and at higher cost.
