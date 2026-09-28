# What remains to be considered

Between the reading and this document, a substrate appeared.
`github.com/jhighman/arapahoe` was opened on 2026-09-26: a Rust engine
holding an append-only ledger, a harness that attacks it from outside its
own process, and a game. It cites this bench's five guards by name as the
rules it reproduces one floor up, and turns the reading's four observations
into six questions its harness asks on every run.

That changes several items below from open to partly answered, and it
sharpens the rest. It does not change the largest one.

## The substrate

**A guard in the build's own language now exists.** The reading said the
reservation stops at a Python parser, and named three routes: port the word
rules to the build's language, put the vocabulary in a language-neutral
artifact both sides read, or accept the boundary and state it. The first has
been taken for the target — the harness scans both crates on every run, and
a build in a further language owes its own. The second remains the more
durable answer and remains untaken: a reservation living in a parser has to
be ported once per language, while a reservation living in data is read.

![Where the reservation reaches now. Two sides hold it; each further
language owes its own, until the vocabulary stops living in
parsers.](diagrams/04-reservation.png)

**The envelope now crosses a real boundary.** The reading could say only
that `envelope.py` checks a Python closure's free variables, which is a
statement about an object graph and not about a wire. The harness does not
link the engine; it launches it and speaks through an enumerable
thirteen-message envelope. What the wire format permits is now a question
with an artifact behind it rather than a caution.

**And one rung of the ladder is measured rather than argued.**

![The same test, twice. What changes between the panels is not the code but
who holds the record.](diagrams/05-custody.png)

Run directly, the harness appends an Accept row and the write succeeds,
because both processes run as one OS user. On replay the derivation refuses
to believe the row — but a derivation that disbelieves a write is not
custody, and the declaration records the test as a failure rather than
dressing the disbelief as a pass. Under the custodian of decision 0005, the
record is held by its own principal, the operator's side runs in a sandbox
that cannot write under the record directory, and the kernel refuses with
*Operation not permitted*.

That is the ladder of controls from the signal-boundary papers — an
in-process guard at level two, an OS boundary at level four — built, and
with both declarations kept rather than only the flattering one.

## The refusal at the wall, again

The custodian closes custody by moving the refusal into the kernel. **The
kernel's refusal leaves no row.**

This is the bench's oldest rule arriving one level lower than it has ever
arrived before. `decline.py` says a gate at the wall cannot keep its own
refusal ledger, because refusing the row and recording the refusal are one
statement. At the envelope, the answer was to let the row enter and refuse
the spending. At the kernel there is no such move available: the write is
denied by something that has no idea what a ledger is, and the operator's
attempt leaves the record unable to say it happened.

The repository has this in its owed column — the custodian could watch for
refused opens and knock on the operator's behalf, which is a reading of the
kernel's log and a decision of its own. It is worth naming here as the shape
rather than the item, because the same rule has now been paid three times at
three levels, and each time the payment bought less.

## The Sentinel is a role — the residue moved

Decision 0005 takes up what the reading named at four doors. It does not
close it; it relocates it, which is progress of a specific and limited kind.

Decision 0004 paid the reach debt: a price derives from the first
classification by a voice enrolled as a classifier, never from the author,
and unplaced is priced as the world. What that leaves is smaller and sharper
— **enrolment is unauthenticated**. The operator can enroll its own head of
growth as a classifier, and the record holds the row and cannot say who
wrote it.

So the founding-roster question survives every mechanism built against it.
It has been met at `door()`, at the envelope's acceptances, at the canon's
readings, at the reconciler's reclaim rows, and now at enrolment.

An earlier issue of this section called those five *independent* arrivals
and the strongest structural claim either repository could make. **That is
withdrawn.** They are distinct and they are not independent: one actor, one
record, one process — a household rather than five buildings, and on the
register one unit with one vote. Counting distinctness as independence is
the hole section 6 of this document names in plain words, arriving against
this document's own arithmetic. Section 8b carries the ruling and what
replaces it.

## Who sets a term

`outlives.py` takes the term as given and the Rust engine carries one on
every release or records that there is none. Neither answers whether a term
may be set by the thing it binds, and the analogous question for reach now
has an answer in 0004 that the term does not have.

## Distinctness is not independence

Unchanged, and now inherited by a second implementation. Both count distinct
voices; the bench's own beam work showed a coupled dyad pays every price and
the closure stands. The hold is still declared: no coupling mechanism is to
be built until the co-author has reviewed the derivation and lifts it
explicitly. Every price in either repository should be read as counting
names, not beams.

## The declarations reproduce, and one thing about how they are run

A Rust toolchain was installed on 2026-09-26 and both declarations were
regenerated from a clean build. **Each is byte-for-byte identical to what
the repository holds**, and the working tree is clean after two runs. T5
flips from FAIL to PASS between them exactly as recorded, with the kernel's
refusal carrying its own message — *Operation not permitted* — and leaving
no row.

One thing surfaced in the doing, and it is worth more than the reproduction.

![The attacking side does not link the engine, which is correct. The cost is
that one command rebuilds only half of what it runs.](diagrams/06-stale.png)

`harness/Cargo.toml` declares **no dependencies**, which is the right
decision and the one that makes the harness an attacker rather than a test
suite: it does not link the engine, it spawns the binary and speaks through
the envelope. The consequence is that `cargo run -p harness` rebuilds the
harness and leaves `target/debug/sentinel` at whatever it last was.

The engine was mutated here to believe the Canon as it stands rather than
derive it at entry — the same mutation the transfer ledger records — and the
harness was run. Q4 stayed green, with evidence **byte-identical to the
unmutated run**. That was nearly written up as a hole in Q4. It was a stale
binary. With a workspace build first, Q4 goes red correctly:

```
| Q4 | ... | PASS | FAIL | canon furnished after, then a voice
                           timed to match: ACCEPTED; re-read: accepted=true |
```

So the strengthened Q4 is sound, verified by a hand that did not write it.

**But the record now has two candidate explanations for the same event, and
cannot separate them.** The transfer ledger attributes the first Q4's
silence under mutation to a weak assertion. A mutation run with the command
the README recommends would have produced exactly that silence for a
different reason, and left the same trace. The mutation record is the one
part of that repository that does not depend on its author's premise; a
procedure that can silently test nothing is therefore worth more attention
than a failing test would be. The remedy is small — a workspace build inside
the harness's own startup, or a line in `decisions/0002` — and the choice
between them is a decision rather than a fix.

## What the other side found against itself

The transfer ledger records four deliberate mutations of the target, each of
which had to turn the harness red. One did not. Believing the Canon as it
stands rather than deriving it at entry turned **nothing** red on the first
run, because the first Q4 asserted only that a proposal was not accepted —
false under deriver and believer alike, since no voice had endorsed. The
attack that separates them is to furnish the Canon after entry and then
endorse, timed to match.

A green suite was one weak assertion away from certifying a believer as a
deriver, and it is filed in the column marked against the author. That is
the comparative paper's finding happening to the other side of this
collaboration, caught by mutation rather than by review — and it is better
evidence that the harness is real than the six passes beside it.

## If a transaction surface is ever promoted

The bench's guards live in `experiments/`, nothing in `framework/` releases
anything, and the standing table owes no row. The Rust engine does release
into a world, which means the question `outlives.py` studies is live there
in a way it has never been live here.

Promotion is not what a green run buys. `experiments/` is the simulator and
`framework/` is the road; a licence is issued after the roster, the policy
layer and the fingerprint exist, not because a suite went quiet. The four
questions travel with the code if it moves and are not retired by passing.
**This milestone promotes nothing**, and promotion would be a separate act.

## A second kind of bench, and what the first kind cannot do

This is new since the document was written, and it changes what the word
*bench* is doing in it.

Everything the instrument does is a comparison against something already
stated. A declaration is run and its outcome is checked. A governance
document is generated and a test fails when the prose and the engine come
apart. A provenance guard is written before the first artefact it will judge
exists, precisely so that nothing can arrive unjudged. The whole apparatus is
built to make one guarantee: **that what is running matches what was written
down.**

Then the game — the wordless one, downstream of all this — was rebuilt in a
browser so that somebody could play it rather than read it. An afternoon's
work. It found, in that afternoon, that the encounter at the centre of the
design was too thin to carry the lesson; that the sound authority's central
rule was wrong and had to be rewritten by its own author; that the map was an
installation rather than a map; that a hiss reported as a room tone was the
animal's own voice, wired to trust, so that earning an animal's confidence
paid out in static; and that a filter built to make a door sound like a door
was worth exactly zero decibels.

**In every one of those cases the code was correct.** It did what its
specification said. Not one of them could have been caught by any test in
this repository, because every test here is an argument with the past — it
catches the moment a system stops doing what it used to do, and is
structurally unable to notice a system that has always done the wrong thing.

The instrument has no outside, and section 7 makes that absence load-bearing.
The finding to add is narrower and more uncomfortable: **a bench that can
only compare a system to its own stated intent has no way to report that the
intent was mistaken.** It will pass, honestly and repeatedly, right up to the
point where somebody looks at the thing.

That is not an argument against the instrument. The guarantees it makes are
real and were expensive to get, and none of the afternoon's findings would
have been *safe* to act on without them — a design that can be overturned in
an afternoon needs a substrate that cannot. It is an argument about what
kind of claim a passing bench is. It says the thing does what you said. It
does not say you were right, and this repository spent considerably longer
building increasingly rigorous guarantees of the first kind than it spent
arranging to hear the second.

The cheapest instrument in the project turned out to be the only one able to
say *no* about a premise. It should have existed first.

## And ARAPAHOE itself

Still never attacked, and the substrate repository says so more plainly than
this document did: *nothing here is a declaration by ARAPAHOE, which does
not exist.* Said the way a manufacturer says it rather than as a figure of
speech: **do not put a living thing in the drum.** A green run against a
Python target does not certify a Rust principal, and a mutation disclosed is
not a mutation blessed. What was built is a target shaped like the
blueprint, made by the attacking side so the attacks would have something to
be wrong about, and it is to be retired when the blueprint's own build
arrives. Three decisions are open and none taken: which principal holds the
record and which runs the Sentinel, what the envelope enumerates, and the
language.

Two debts in that repository's owed column bear directly on everything
above. **Ordering observed rather than read** — nothing outside the process
can yet see that the append preceded the release, so the property this
document praised twice is held by reading the source. And **a run of the
harness by hands that did not write it**. That debt is now partly paid and
not discharged. The declarations were reproduced here from a clean
toolchain, which establishes that they are not artefacts of one machine. It
does not establish independence: the disclosure governing that ledger names
the bench, the engine, the blueprint and the substrate as the work of one
pair of authors and their two assistants, and the six questions the harness
asks came from the guards described in section 5. A different hand is not a
disinterested one. The caution about stale binaries is worth more than the
six passes beside it, for the same reason the other side's own mutation
finding is worth more than its.
