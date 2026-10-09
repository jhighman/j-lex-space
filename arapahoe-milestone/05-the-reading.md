# The reading

On 2026-09-26 the blueprint was read against the bench's standing rules and
the result written to `ARAPAHOE-READING.md`. It was named a reading rather
than a finding, and says so in its first lines: **nothing was run**. No Rust
Sentinel and no Alexicon were supplied, so nothing was attacked. A reading of
a diagram that called itself a finding would be inference promoting itself to
evidence in the act of reviewing somebody else's boundary.

Four observations came from this repository's own rules.

**The refused identifier.** The pivotal artifact is a *commit certificate*,
and the release condition is stated in terms of it. This repository refuses
that identifier for functions, act strings and rows, on the stated ground that
a workshop saying the word fifty times a day about the repository cannot keep a
reservation that collides with it. The replacement was already in the
vocabulary: what the Sentinel does when invariants hold is **accept**.

**The refusal that leaves no row.** Verification is read-only and the freeze
writes no partial state, so the only edge into the ledger is on the accepting
path. A refused proposal leaves nothing behind. `decline.py` names this
exactly: a gate at the wall cannot keep its own refusal ledger.

**One voice, and no weight.** The Sentinel verifies, certifies, receives the
receipt and releases. Every transition costs the same whether it answers a
query or reaches the world — where this bench prices stopping in distinct
outside voices, scaled to the heaviest act.

**Derived, or believed.** The Sentinel reads "the relevant Canon state" while
deciding, and the blueprint does not say whether that reading is derived at the
proposal's entry or taken from something stored. `reading.py` cost three routes
to learn which of those is safe.

## The part that was already visible in the tests

The blueprint's Minimal Acceptance Tests require a conforming implementation to
refuse an out-of-scope proposal **without changing Alexicon**.

The suite does not overlook the silence. It certifies it.

That is not carelessness, and saying so is the point. The tests were written
from the same premise as the architecture, and a premise that makes a property
invisible makes the test for that property uninteresting to write. It is the
finding from *Seal and Lock* arriving from the other end, and it is this
bench's standing rule with a different subject: a suite is part of what the
premise produced, so it cannot be the thing that checks the premise.
