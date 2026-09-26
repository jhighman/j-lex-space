# What a green suite measured

This is the finding that generalises beyond Ruby.

## Both suites passed

The sealing implementation ships eighteen assertions across three groups and
reports `passed`. The locking implementation ships seventeen and reports *all
post-conditions held*. Neither is padding: both suites test their subject
seriously, include adversarial cases, and are more rigorous than most
production test suites for comparable code.

And neither suite contains a single assertion about the failure mode the other
one found.

The sealing suite has no concurrency test — not a weak one, none — so four
overlapping transmissions and an idle indicator that lies went unreported. The
locking suite has no test for method-table sealing, so it never discovered
that the attack it declared unanswerable has an answer.

**Each suite was comprehensive about the attacks its author had in mind, and
silent about the rest.** The green result measured the author's threat model,
not the artifact.

## Why this is sharper than the usual observation

That tests reflect their author's assumptions is not a new claim. Two things
here make it sharper than the usual version.

**The blind spots were structural, not careless.** Each author omitted
precisely the tests that their design decision had made uninteresting. Having
decided the method table was the asset, concurrency was somebody else's
concern. Having decided in-process defence was futile, testing whether a seal
holds was pointless by construction. The omission follows from the
architecture, which means code review by the same author cannot find it — the
reviewer shares the premise that generated the gap.

**Both authors were competent and both were writing carefully.** The failure
is not a proxy for inattention, so remedies aimed at diligence do not touch
it.

## The practical consequence

For any boundary that matters, a suite written by whoever wrote the
implementation establishes that the implementation does what its author
intended. It does not establish that the boundary holds, and it cannot,
because the same model of the threat produced both artifacts.

What closed the gap here was **cross-examination by an implementation with a
different premise**. Not a better tester, and not more tests — a different
prior about what the asset was. Each suite, pointed at the other's subject,
found in minutes what its author's own suite could not have found at all.

This has a direct operational reading for systems assembled with
model-generated components, and it is not that the components are
untrustworthy. It is that a model generating both an artifact and its
verification will produce a consistent pair, and consistency is the property
one is trying to test, so it cannot also be the evidence. The verification has
to come from a source that does not share the generating premise — a different
model, a different author, or an adversary whose job is to disagree.

## What this does to the companion paper's argument

It strengthens it, by a different route than that paper took.

*Remove the Seam* argued that an in-process invariant should not be trusted
because hostile code can reach it. Section 3 shows that sealing answers much
of that. But this section shows something the sealing does not answer: the
author of an in-process guard cannot validate it, because the validation
shares the blind spot. The reason to move enforcement to a process boundary is
therefore not only that in-process guards are reachable. It is that a process
boundary is checkable by a party that did not build the thing being checked.
