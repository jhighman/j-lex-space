## About this document

ARAPAHOE was a blueprint: a governed transaction lifecycle in which an
unprivileged proposer's candidate crosses a narrow envelope, a Sentinel
verifies it against a Canon, the accepted transition is appended, and
privileged execution is released only after the ledger returns a receipt.

This document records what happened when that blueprint met a bench whose
rules were built for a different question. It is written for both authors,
and for a reader arriving with no context at all — section 2 assumes
nothing.

**Status.** A milestone, not a conclusion, and **not signed off**. The
co-author's rulings of 26 September are recorded in section 8b; where they
correct this document, section 7 has been amended rather than quietly
edited. Everything reported as a result was executed on 2026-09-26 and can
be re-run from the repository in one command each. Everything reported as
open is listed in section 7 rather than left for the reader to notice.

---

## Summary

ARAPAHOE proposed an architecture the bench had already been arguing toward
from the other side. Reasoning explores without write authority; an envelope
strips ambient authority at the perimeter; the component that decides is not
the component that proposed; the record appends and never edits. Its
ordering — append the transition, take the receipt, only then release — is
the right way round, and section 6 defends it rather than qualifying it.

**Read against this bench's standing rules, four things were missing.** The
pivotal artifact wore an identifier this repository refuses. The freeze
wrote no row, so a refusal left nothing anyone could enumerate. Every
transition cost the same whether it answered a query or reached the world.
And the Canon the Sentinel read while deciding was not said to be derived at
the proposal's entry rather than taken from something stored.

**All four were then built, and a fifth question came from outside.** Five
guards now stand in `experiments/`, sixty-two checks between them, each
exiting non-zero when a boundary moves. The headline number is the one the
reading could not produce: handed identical traffic, the silent envelope
records ninety-nine refusals as **zero rows**, and an author refused
ninety-nine times is indistinguishable from one accepted at its first
attempt. The recorded envelope holds a hundred proposals and ninety-nine
declines.

**Four of the five re-derived rules the bench already held**, and the record
says so in the weaker of its two columns. That is the honest result and it
is worth more than a triumphant one: the rules were not specific to closure
and warrant, and they reproduce one floor up in a transaction lifecycle
without adjustment. The fifth — what a released action leaves live when the
releaser stops — was not derivable from anything here, and arrived from the
signal-boundary papers imported alongside.

**What remains is named in section 7.** Since the reading was written a
substrate has appeared — a Rust engine, a harness that attacks it from
outside its own process, and a kernel sandbox under which the record is held
by its own principal. It cites these guards by name and asks the reading's
observations as six questions. That answers part of what section 7 lists and
sharpens the rest, and it leaves the largest item exactly where it was: the
blueprint itself has still never been attacked, and the founding-roster
question has now survived five mechanisms built against it.

**Section 9 carries the rules somewhere with no ledger in it.** A wordless
game for four- and five-year-olds was built on the same shape — a closed
vocabulary, rows only appended, every reading derived — from a children's
concept document that turns out to be this argument with a playground drawn
on top. Four safety properties were retrofitted to it; three were already
true by accident of how it was built, and the fourth, a stop the game
insists on so that play does not run forever, was absent altogether.

Section 9 has since produced a second finding, and it is about this
repository's own method. A guard that fails when a boundary moves had been
pointed at what the record may say and at what the readings compute, and
never once at the prose describing either. Three separate hand-written
copies of the act list drifted from the engine in a single day — a screen
that said ten while twelve were being written, an exported list that kept
its own stale array of ten beside a transcript contradicting it, and a
report for parents that split one act into three and lost two others. Every
claim on that screen was a guard's output except the claims about the screen
itself, and those were the three that were wrong.

Both are now generated from the arrays the engine uses, and a test fails
when the document on disk is no longer what the engine would print. A
governance line that was to have read *zero bytes retained* was measured
rather than printed, and the first measurement returned 85,983 bytes of
compiled textures — no child in them, and not zero.

That retrofit produced the finding most likely to outlive it. **A closed
vocabulary does not stop a true word being written about a false event.** A
row read *sat still and waited* on the branch where the child had reached
for a frightened animal: the word is in the list, correctly spelled, written
by the one call allowed to write it, and every guard in this document passes
it. The guards check a record's vocabulary and its derivations, and nothing
between them asks whether a row is true of the event that caused it.

**Section 10 answers the two essays that stand behind this work.** The first
asked nine questions of a machine that a child confides in, and argued that
a toggle is not a fact — that what matters is not what a company arranged
but what stays true after it changes its mind. The second took that
distinction to the scale of a rulebook thirteen Member States have asked
Europe to deep-clean, and named how complexity moves rather than disappears
under simplification.

Section 10 stops arguing and runs both against something built. Of the nine
questions, seven hold and two of those hold only because the artefact is
small. The two that fail are the two the essays cared most about: the
promise did not survive Wednesday — a closed vocabulary held while three
separate hand-written descriptions of it drifted within a day — and if the
boundary broke, nobody outside this pair would know. Of the second essay's
six capabilities, three hold and three are absent by design, which is stated
rather than smuggled.

Both of that repository's declarations were reproduced here

Both of that repository's declarations were reproduced here from a clean
toolchain, byte for byte. The reproduction is not the useful part. The
useful part is what went wrong while producing it: the attacking side does
not link the engine, which is correct, and the cost is that the command its
README recommends rebuilds only half of what it runs — so a mutation can be
tested against an engine that does not contain it, and the suite stays
green.
