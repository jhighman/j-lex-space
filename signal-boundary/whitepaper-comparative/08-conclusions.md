# Conclusions

## On the two implementations

**The sealing implementation is the better answer to the question as asked.**
It identified the correct analogue of the inter-token gap — the message send —
derived its defence from that identification, executed the defence correctly,
and documented its residual hole before demonstrating it. It withstood three
attacks its own suite never attempts. Its history is more precise. Its
refinement test is more sophisticated than anything in the comparison.

**It has one defect and it is not minor.** A distress boundary with no mutual
exclusion, whose idle indicator reports free while transmissions are live,
would fail in the condition it exists to serve. The fix is roughly six lines.

**The locking implementation was right about the carrier and wrong about the
ceiling.** It generalised from one successful attack on an undefended class to
a claim about the language, and used that generalisation to justify not
attempting a mitigation that works. Its revocable capability was correct as a
pattern and misapplied to an immutable payload.

## On the method

Three practices earned their place, and all three are cheap.

**Execute the specification.** Every behavioural claim in this comparison came
from running code. The `prepend` result was a genuine surprise — the
expectation was that it would breach — and no amount of reading would have
produced it.

**Document the hole before testing it.** The sealing implementation's comment
about `bind_call`, written above the test that demonstrates it, is the single
best practice on display. It makes the limitation part of the specification
rather than a finding an auditor extracts later.

**Have the artifact examined by something that does not share its premise.**
This is what neither author could do for themselves, and it is the whole of
section 6.

## The finding worth carrying

A green test suite written by the author of an implementation establishes
internal consistency. Both suites here were rigorous, both reported complete
success, and each was silent on exactly the failure the other found — not
through carelessness, but because each author's architectural premise made the
other's tests uninteresting to write.

For boundaries that matter, verification must come from a source that does not
share the premise that produced the artifact. When artifact and verification
are generated together, that condition is violated by construction, and the
green result is evidence of coherence rather than of correctness.

The union of the two designs is better than either, and includes a property
neither author proposed. That is the practical case for resolving a
disagreement by building both, rather than by deciding which author was right.
