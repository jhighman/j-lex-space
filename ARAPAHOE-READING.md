# A reading of the ARAPAHOE blueprint

Read 2026-09-26, against the blueprint dated the same day: the governed
epistemic transaction lifecycle, its mermaid architecture, and its minimal
acceptance tests.

**What this is.** A reading of a document against the rules already standing
in this repository. Four of the six observations below are this bench's own
rules meeting an outside artifact; two come from elsewhere and are marked.

**What this is not.** Nothing was run when this was written. No
implementation of ARAPAHOE was attacked, because none was supplied — the
blueprint describes a Rust Sentinel and an Alexicon that this reading never
executed. Every observation here is therefore a candidate claim about a
described architecture, and it stays one until something is built and
something else attacks it. The distinction matters more than usual here: a
reading of a diagram that called itself a finding would be inference
promoting itself to evidence, which is the error this instrument exists to
refuse, made in the act of reviewing somebody else's boundary.

## What the blueprint has right

The shape is the one this bench keeps arriving at. Reasoning explores
without write authority; a narrow envelope strips ambient authority at the
perimeter; the component that decides is not the component that proposed;
the record is append-only under "Answer, never edit"; an undecidable
transition freezes rather than guessing. The human who resolves a halt
re-enters through the envelope as a new transaction and cannot write to
Alexicon directly — a side door for the operator is the thing most
architectures of this shape get wrong, and this one closes it explicitly.

One ordering deserves to be named because it is easy to get backwards and
expensive to discover later. The blueprint fixes **verify, certify, append,
receive receipt, release**. Appending before releasing means a process that
dies mid-transaction leaves a record with no action, rather than an action
with no record. That asymmetry is the right way round, and nothing below
disturbs it.

## The refused identifier

The pivotal artifact is named the **commit certificate**, and Stage 4 is
named for the same word, and the release condition is stated in terms of it.

This repository refuses that identifier outright. Prose may speak of
commitment; no function, act string, or row may wear the word, for the
stated reason that a workshop saying it fifty times a day about the
repository cannot keep a reservation that collides with the commonest verb
in the room. `vocabulary.py` parses `framework/sentinel.py` and would not
catch a Rust implementation, so the collision would arrive unenforced and
stay.

The replacement is already in the vocabulary. What the Sentinel does when
invariants hold is **accept** — a judgment about warrant. It issues a
certificate of acceptance; Alexicon appends the accepted transition; Stage 4
becomes immutable append and authorized execution. The word is named here
only in order to retire it.

**Since built** (`experiments/vocabulary.py`, 2026-09-26). The reservation
now reaches past the framework: the guard carries a list of transaction
surfaces and holds each to the same two rules, so a lifecycle built here
cannot wear the borrowed identifier without the guard refusing. It was
tested by being broken — the word was added to a surface and the guard
exited non-zero, twice, once for each refused word. What it still cannot
reach is a Sentinel written in another language, which is the part of this
observation that stays a reading.

## The refusal that leaves no row

This is the observation worth the reading.

Stage 3 says the lock bites, and that it does not repair, guess, **write a
partial state**, or release. Verification is read-only. The only edge into
the ledger anywhere in the diagram is the certificate on the valid path. A
proposal that is invalid, undecidable, or out of scope therefore leaves
nothing behind.

`decline.py` has the shape this misses: a refusal nobody can see is
indistinguishable from an oversight, and a gate at the wall cannot keep its
own refusal ledger, because refusing the row and recording the refusal are
one statement and the rollback takes both. ARAPAHOE is a gate at the wall.
The freeze is deterministic, and it is also silent.

It compounds with the corollary `unmeasured.py` paid for. Where the record
cannot say how something got in, it charges as though it got in easily. A
proposer refused ninety-nine times before its hundredth proposal is accepted
is indistinguishable, in Alexicon, from one accepted at the first attempt.
Nothing in the ledger prices persistence, because persistence left no rows.
That is a discount available to anybody willing to retry, which is the same
shape as the claim that went around the door and was asked four questions
where the same claim through it was asked seven.

The remedy is `decline.py`'s: the row enters, and the *spending* is refused,
so that the refusal is a derivation anyone can re-run rather than an absence
anyone must take on trust.

**Since run** (`experiments/envelope.py`, 2026-09-26). Both envelopes were
built beside the record and handed the same traffic: an author refused
ninety-nine times before its hundredth proposal is accepted, beside one
accepted at its first. Under the silent envelope the record holds one
proposal from each and no refusals at all, and the two authors are
indistinguishable. Under the recorded envelope the stubborn author has a
hundred proposals and ninety-nine declines, each a row anyone can re-read.
The silence is no longer a reading; it is priced.

**The acceptance tests hold the gap in place.** A conforming implementation
is required to refuse an out-of-scope proposal *without changing Alexicon*.
The suite does not overlook the silence — it certifies it. This is worth
stating plainly because the suite is not careless: it was written from the
same premise as the architecture, and a premise that makes a property
invisible makes the test for that property uninteresting to write. Which is
this bench's standing rule arriving from the other end — nothing is
evaluated by the process that produced it, and a suite is part of what the
premise produced.

## One voice, and no weight

The Sentinel verifies the transition, issues the certificate, receives the
receipt, and releases execution. Every transition costs the same regardless
of what it reaches: one Sentinel, one certificate, whether the transition
answers a query or releases privileged execution against the external world.

This bench already prices stopping differently. An episode's close takes
answers from as many distinct outside voices as its heaviest act would cost
to promote, and one willing voice writing many rows pays nothing extra.
ARAPAHOE has no weight axis at all, and privileged execution is the heaviest
act on its diagram. Whether a transaction architecture should carry the same
scaling is a question this reading raises rather than settles, but its
absence is not visible in the blueprint as written, and absence that nobody
named is how the value layer went.

**Since built** (`experiments/weight.py`, 2026-09-26). Reach is classified
by somebody other than the author, and the price is paid in distinct voices.
One voice endorsing nine times remains one voice and does not pay for the
world; an author endorsing itself counts for nothing, and neither does the
Sentinel adjudicating it. A reach an author wrote about its own proposal is
surfaced and buys no discount, because unplaced is unpayable rather than
free — which is `unmeasured.py`'s rule kept at this end too.

## Derived, or believed

Stage 3 has the Sentinel read "the relevant Canon state" while deciding. The
blueprint does not say whether that reading is derived at the proposal's own
entry or taken from something stored.

`reading.py` cost this bench three routes to learn which of those is safe:
the door repeated a stored body, and one forged row in the Sentinel's name
bought a number friction could not produce. Two rules came out of it, and
both take a forger's choice away — only the first admit row counts, and the
anchor is the claim's entry rather than the admit row's moment. A
transaction architecture reading Canon state to decide is standing exactly
where the door stood.

Related, and from the same page of the record: nothing in the blueprint
binds the certificate to the Sentinel. The Sentinel is a role here as it is
here, and a certificate in its name is indistinguishable from a certificate
it issued. No acceptance test covers forgery.

**Since built** (`experiments/canon.py`, 2026-09-26). Two Sentinels over the
same rows: one that stores what it saw and one that re-derives the Canon as
it stood at the proposal's own entry. A first reading forged in the
Sentinel's name buys the believer and not the deriver, and a Canon furnished
after the proposal entered moves the believer's answer while the deriver's
stays put. `void_readings()` surfaces every disagreement. Both of
`reading.py`'s rules carried up a floor unchanged.

## What outlives the process

This one is not from this bench. It is from the signal-boundary papers
imported alongside, and it is stated because the blueprint's own ordering
invites it.

Teardown that does not run is survivable when what it would have released is
held in memory, because a dead process's memory is reclaimed by the
operating system — a stronger guarantee than any teardown. What survives a
death is what the process wrote outside itself. In this architecture that is
exactly **privileged execution**: an action released a moment before the
Sentinel dies is live in the world, and the blueprint carries no lease on
it, no expiry, and no reconciler that does not share fate with the Sentinel.

The append-before-release ordering already protects the record. Nothing yet
protects the world from a record that is correct about an action nobody is
still watching.

**Since built** (`experiments/outlives.py`, 2026-09-26). A world beside the
ledger, which does not close when the releaser stops. An effect past its
term is named and reclaimed by a free function sharing fate with nothing; an
effect that never carried a term stays live, and the record says so rather
than implying it. A lease cannot be extended from inside, because only the
first one written against a release counts. The residue defends the
blueprint's own ordering: an effect whose release was never appended is an
orphan no reconciler can name, so append-before-release is what makes the
rest possible.

## What this reading cannot establish

- **It read a document.** Every observation above is a claim about a described
  architecture, not about any artifact. An implementation could answer all six
  in ways the blueprint does not say, and a reading cannot tell the difference
  between a gap in a system and a gap in its description.
- **The silence may be deliberate and answered elsewhere.** If refusals are
  recorded somewhere this blueprint does not draw, the second observation is
  about the drawing rather than the architecture. That would still be worth
  fixing, since the acceptance tests are drawn from the same page.
- **All six have since been built, and that is not the same as ARAPAHOE
  having been attacked.** Each observation was translated into this record's
  idiom and attacked there, which prices the mechanism and not the blueprint.
  A Rust Sentinel reading a real Canon could fail differently, or not fail at
  all, and nothing here would know. What the five guards establish is that the
  shapes are reachable and the costs are real, not that ARAPAHOE has them.
- **The reader is not disinterested.** The last observation cites papers the
  same reader wrote, and the first four cite rules this repository already
  holds. The second kind is the stronger: those four are the bench catching an
  outside artifact on its own terms, and they stand or fall with rules that were
  paid for by attack rather than by argument.
