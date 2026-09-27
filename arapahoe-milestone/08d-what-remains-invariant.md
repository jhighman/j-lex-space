# What remains invariant

Two essays stand behind this section.

The first asked nine questions of a machine that a child confides in. A girl
tells a companion her dog's name and what happened with her friends; she is
not generating data, she is confiding. The argument was that *a toggle is not
a fact* — that a memory switch set to off proves a switch was flipped and
nothing more — and that the property worth defending is not what a company
arranged but what stays true after the company changes its mind. **Monday
should not be allowed to write Thursday.**

The second took the same distinction to a different scale. Thirteen Member
States have asked Europe to deep-clean its rulebook, and the question that
forces is not how much can be removed but what must survive removal, and who
can prove that it did. It named the failure mode precisely: complexity under
simplification does not vanish, it moves to whoever is least equipped to
carry it.

This section is what happened when the same pair of authors stopped writing
the argument and built something small enough to run it against.

## What ARAPAHOE is, for a reader arriving from those essays

ARAPAHOE began as a blueprint for a governed transaction lifecycle: an
unprivileged proposer's candidate crosses a narrow envelope, a component
called the Sentinel checks it against a body of rules, the accepted
transition is appended to a record, and privileged execution is released only
after that record returns a receipt. Sections 3 through 8 are what happened
when that blueprint met a bench of small adversarial experiments built for a
different question, and what each found in the other.

The part that matters here is the method rather than the architecture. The
bench's rule is that a claim nothing can fail is not a claim; every
experiment in it exits non-zero when a boundary moves. A docstring asserting
a property is prose. A test that believes the docstring believes prose.

And the smallest complete thing the collaboration has built is not a
transaction system at all. It is a game for four- and five-year-olds with no
words in it, described in section 9: a child and a three-legged dog walk a
warren of burrows, meet an animal in each, and learn that the only answer to
a frightened creature is to sit still and wait. Underneath it is a record in
the shape this document has been arguing for all along — a closed vocabulary,
rows only appended, every reading derived on the call.

It was built for a four-year-old. It happens to be the first artefact either
essay can be run against.

## The nine questions, asked of the warren

| | | |
|---|---|---|
| **1 · Is Monday still on the desk?** | holds | A gap of half an hour, or a new calendar day, closes the record and opens an empty one. Since this week a child can also watch it happen: the day opens on a dog asleep in a yard, and nothing is carried out of the doghouse because there is nothing in it |
| **2 · The letter and the photocopy** | holds, after a fix | Who walks with the child was kept as a list beside the record's own rows — a summary that could drift from them and would still have been sitting there after the record was thrown away. It now holds nothing and reads the rows. A fresh day sweeps the disk as well |
| **3 · Do the crumbs still talk?** | holds | Nothing persisted shapes a later session, because nothing persists. The one measurement that found bytes found compiled textures, which influence nothing |
| **4 · Did Monday become part of the voice?** | holds, trivially | Nothing here learns. There is no model, no training, no weights. This is a property of being small, not an achievement, and it is the question this artefact is least qualified to answer |
| **5 · Can Thursday go looking?** | holds | There is no store to search and no retrieval path to build one from |
| **6 · Could someone rebuild Monday from Thursday?** | holds | The record lives in memory and dies with the process. What survives is whatever a parent chose to read while it was alive |
| **7 · A door or a hole?** | holds | The only place this system invokes safety is the rest the game insists on, and it is a door: the guard asks the record how long the stretch has been, so the reason is a row a parent can read. The parent screen's own gate is labelled a speed bump rather than a lock, because that is what a two-second press on a paw is |
| **8 · Does the promise survive Wednesday?** | **it did not** | Below |
| **9 · If the boundary broke, who else would know?** | **nobody** | Below |

Seven of nine hold, and two of those hold only because the thing is small.
The two that fail are the two the essays cared most about.

## Question eight: the promise did not survive Wednesday

The record's vocabulary is closed. Twelve acts, and a word outside the list
cannot be written at all. That is a real invariant: it is enforced by the
writer and a test fails if it moves.

The claim *about* it was not.

The screen a parent reads told them the warren could write down **ten** kinds
of thing, and that there was no eleventh, while the engine was writing twelve
— two of which appeared in the transcript directly above the claim. Beneath
that, the function handing the screen its vocabulary kept **its own hardcoded
array of ten**, so the "complete vocabulary" omitted acts a parent could
already see listed. And a report drafted for parents split one act into three
that do not exist while losing two that do, describing a system that collects
more than this one does.

Three copies of one list. All written by hand. All describing a property that
was itself sound. All wrong within a day of each other.

The invariant never moved. Every description of it did — and the descriptions
were the only thing anyone outside the system could read, which is exactly
the position both essays put the affected person in.

The fix is the one this bench keeps arriving at from different directions:
stop having a second copy. Parsing walks the same array the export prints.
The figures a parent is shown are declared once, with their derivations, and
both the data the application decodes and the table in the document are built
by walking that declaration. The document is generated by the engine, and a
test fails when the file on disk is no longer what the engine would print.

> A guard pointed at a mechanism but never at the prose describing it leaves
> the prose as the only thing the outside world can read. Documentation is a
> surface, and unguarded surfaces drift.

Every claim on that screen was a guard's output except the claims the screen
made about itself. Those were the three that were false.

## Question nine: nobody else would know

Every property above was written and then verified by the same party. The
tests were written by the author of the thing they test. No hand that did not
build this has ever attacked it, and no child has ever played it.

The collaboration has already had to rule on the sharper form of this. An
earlier draft of this document claimed five independent arrivals at one
conclusion; the ruling in section 8b rejected it, because they shared an
actor, a record and a process, and were therefore one unit and one vote.
**Distinctness is not independence.**

That bears directly on the regulatory case. A simplification programme can
produce many confirmations that a property survived — from the implementing
body, its auditor, its supervisor, its consolidated reporting system — and
those may still be one voice several times if they share a pipeline, a
definition, or an incentive. The number of attestations is not the number of
witnesses.

This document also owes the observation that its own harness never rebuilt
the engine it was testing: a green run certified a file rather than a source
tree, and for a while nothing could say which binary produced the result.
Proof of an invariant is not proof unless something can say what was actually
measured.

## What the record cannot do at all

The second essay proposes six capabilities that must survive any
simplification. Run honestly against the warren, they come out three for six.

| | | |
|---|---|---|
| **Know** | held | Every act is a row; a refusal leaves one |
| **Attribute** | held | Each row carries its actor |
| **Understand** | held | Every figure derived on the call, each derivation stated in the generated document |
| **Contest** | **absent** | No mechanism exists by which anyone can dispute a row |
| **Correct** | **absent** | Append-only was chosen so that nothing can be amended |
| **Obtain redress** | **absent** | There is no remedy, because there is no authority to appeal to |

The core contains no code for amendment, dispute or deletion — zero
occurrences, by search as well as by design.

That trade should be stated rather than smuggled. An append-only record with
no correction mechanism is right where the recording party and the affected
party share an interest, which is the case here: a parent reading about their
own child's afternoon. It is wrong where they do not. Half of that test is
about what a person can do when the record is **wrong about them**, and on
that half this collaboration has built nothing and has no standing to advise.

## Burden displacement has a user interface

The second essay's sharpest contribution is naming how complexity moves
rather than disappears. That is usually described institutionally. It also
has a small physical form, and this week supplied one.

The parent screen was given a governance line: *this session is in memory,
nothing is retained on disk*. Rather than print the claim it was made to
measure itself, walking every directory the application may write to. The
first measurement returned **85,983 bytes in nine files** — compiled
textures, with no child anywhere in them, and not zero. The claim had been
false since the first build that drew a texture, and nothing would ever have
said so.

The screen then listed the nine file names. Each was a UUID. They were
truthful, complete, and they pushed the report off the bottom of the screen,
so a parent opening it saw nine meaningless hashes and none of their child's
afternoon.

Disclosure discharged by volume is not disclosure. It is the transfer of
interpretive work to the person least able to do it, performed while
appearing maximally transparent — and it looked more compliant than the
version that informs.

## The dog's name

The first essay opens with a child telling a machine her dog's name.

In the warren the dog has a name. He is called Milo, he has three legs, and
he is the reason a child crosses into the story at all — the day begins with
him asleep in a yard, and the way down does not open until the child has
played with him.

The record does not know he exists.

Not as a redaction, and not as a setting somebody switched off. The ledger is
never told about him, so there is no row to withhold and no field to leave
blank. The consequence is structural rather than decorative: at the bottom of
the warren there is an animal who will not come out for anybody alone, and
who emerges when three friends speak for the child. Milo cannot be one of
them. He is hers already, and a record that never learned his name cannot
count him as a voice.

That is what an invariant looks like when it is small enough to see. Not a
promise that the dog's name is safe. An architecture in which there is
nowhere to put it.

The rest of this document is about whether that scales. The honest answer, in
section 8's own column of debts, is that nobody outside this pair has tried
to break any of it — and that the smallest artefact, the one with a
four-year-old in front of it, is the one that has been attacked least.
