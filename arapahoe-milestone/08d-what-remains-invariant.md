# What remains invariant

Thirteen Member States have asked Europe to deep-clean its rulebook. The
request is political rather than legal — no instrument has been repealed and
no obligation suspended — but the question it forces is an engineering one,
and it is the question this bench has been asking in miniature for two
months:

> When the mechanism is simplified, what must remain true, and who can prove
> that it remained so?

The distinction the argument turns on is between a **safeguard** and an
**invariant**. A safeguard is what a system intends. An invariant is a
property it is not permitted to violate while implementations, institutions,
incentives and governments change around it.

That is this repository's own distinction under a better name. `forgery.py`
established it early and crudely: a test that believes a docstring is a test
believing prose. Every guard since has been an attempt to convert a stated
intention into something that fails when a boundary moves. The bench has
nothing to say about European law. It has something to say about what
happens to invariants that are only written down.

## The boundary test, run against the record

The argument proposes six capabilities that must survive any simplification.
Run honestly against the warren's record — the smallest complete instance of
this collaboration's method, built for a four-year-old and a parent rather
than a data subject and a controller — it scores three of six.

| | | |
|---|---|---|
| **Know** | held | Every act is a row. A refusal leaves a row; the whole point of `envelope.py` was that a silence which writes nothing cannot be enumerated later |
| **Attribute** | held | Each row carries its actor. The record cannot say *something happened*; it says what, and to whom |
| **Understand** | held | Every figure is derived on the call from rows, and `GOVERNANCE.md` states each derivation. Nothing is stored as a total, so no total can drift from what it claims to summarise |
| **Contest** | **absent** | There is no mechanism by which a parent, or a child, can dispute a row |
| **Correct** | **absent** | Append-only was chosen precisely so nothing can be amended. The property that makes the record trustworthy is the property that makes it unchallengeable |
| **Obtain redress** | **absent** | There is no remedy of any kind, because there is no authority to appeal to |

The core contains no code for amendment, deletion, dispute or correction —
zero occurrences, by search. That was a deliberate design and it is defended
elsewhere in this document. It is also, measured against this test, a system
that is excellent at the first three capabilities *because* it forgoes the
last three.

That trade should be stated rather than smuggled. An append-only record with
no correction mechanism is the right architecture when the recording party
and the affected party share an interest — a parent reading about their own
child's afternoon. It is the wrong architecture when they do not. Half of the
boundary test is about what a person can do when the record is **wrong about
them**, and on that half this bench has built nothing and has no standing to
advise.

## Burden displacement has a user interface

The essay's sharpest contribution is naming the failure mode: complexity does
not vanish under simplification, it moves to whoever is least equipped to
carry it. The operator's side gets cleaner; the affected person's side gets
harder; the total is unchanged or worse.

That is usually described institutionally. It also has a small, physical
form, and this document can supply an instance from the same week.

The parent screen was given a governance line: *this session is in memory,
nothing is retained on disk*. Rather than print the claim it was made to
measure itself, walking every directory the application may write to. The
first measurement returned 85,983 bytes in nine files — compiled textures,
with no child anywhere in them, and not zero. The claim had been false since
the first build that drew a texture, and nothing would ever have said so.

The screen then listed the nine file names. Each was a UUID. They were
truthful, complete, and they pushed the actual report off the bottom of the
screen, so that a parent opening it saw nine meaningless hashes and none of
their child's afternoon.

That is burden displacement at the scale of one page. Disclosure discharged
by volume is not disclosure; it is the transfer of interpretive work to the
person least able to do it, performed while appearing maximally transparent.
The fix was to state the number, say what kind of thing the files are, and
stop naming them. **A system can satisfy a disclosure obligation and defeat
its purpose in the same gesture**, and it will usually look more compliant
while doing so.

## An invariant that is only written down is a safeguard again

The strongest thing this bench can contribute to the argument is a failure it
inflicted on itself three times in a single day.

The record's vocabulary is closed: twelve acts, and a word outside the list
cannot be written at all. That is a genuine invariant, enforced by the writer
and tested. The claim *about* it was not.

The parent screen told parents the warren could write down **ten** kinds of
thing, and that there was no eleventh, while the engine was writing twelve —
two of which appeared in the transcript directly above the claim. Beneath
that, the function that hands the screen its vocabulary kept **its own
hardcoded array of ten**, so the screen's "complete vocabulary" omitted acts
a parent could already see. And a report drafted for parents split one act
into three that do not exist while losing two that do, describing a system
that collects more than this one does.

Three copies of one list, all written by hand, all describing a property that
was itself sound, all wrong within a day of each other.

The invariant never moved. Every description of it did. And the descriptions
were what anyone outside the system had to rely on — which is precisely the
position the essay puts the affected person in.

The fix is the one this bench keeps arriving at from different directions:
stop having a second copy. Parsing now walks the same array the export
prints. The figures a parent is shown are declared once, with their
derivations, and both the JSON the application decodes and the table in the
document are built by walking that declaration. The document is generated by
the engine, and **a test fails when the file on disk is no longer what the
engine would print**. A stale description is now a red build rather than a
wrong sentence in front of a parent.

The generalisation is uncomfortable and worth stating plainly:

> A guard pointed at a mechanism but never at the prose describing it leaves
> the prose as the only thing the outside world can read, and unguarded
> surfaces drift. Documentation is a surface.

Every claim on that screen was a guard's output except the claims the screen
made about itself, and those were the three that were false.

## Who can prove that it remained so

The essay ends on the question of proof, and this collaboration has already
had to rule on a sharper version of it.

An earlier draft of this document claimed five independent arrivals at the
same conclusion. The ruling recorded in section 8b rejected it: they shared
an actor, a record and a process, and therefore constituted one unit and one
vote. Distinctness is not independence.

That ruling bears directly on regulatory attestation. A simplification
programme can produce many confirmations that a property survived — from the
implementing body, its auditor, its supervisory authority, its consolidated
reporting system — and those may still be one voice several times if they
share a pipeline, a definition, or an incentive. **The number of attestations
is not the number of witnesses.**

The same document also owes, in its own column of debts, the observation that
its harness never rebuilt the engine it was testing: a green run certified a
file rather than a source tree, and for a while nothing could say which
binary had produced the result. Proof of an invariant is not proof unless
something can say *what was actually measured*.

## What this does not establish

A bench of Python guards, a Rust ledger of a few hundred lines, and a
wordless game for four-year-olds are not evidence about European
administrative law, and nothing here should be read as advice about it.

The transfer claimed is of method, not of authority. Three things seem to
hold at both scales, and only because they were found the hard way at the
small one:

- An invariant that exists only as a sentence reverts to a safeguard, and
  will drift from the mechanism it describes without anyone noticing.
- Measuring a claim rather than printing it tends to falsify it immediately,
  which is an argument for measuring rather than against the claim.
- Disclosure that buries is not disclosure, and looks more compliant than the
  version that informs.

The largest item in this repository's owed column remains what it was: the
thing itself has never been attacked by hands that did not build it. Until it
has, everything above is a method that survived its author, which is the
weakest form of survival there is.
