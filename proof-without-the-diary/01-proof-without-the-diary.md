# Proof Without the Diary

*Safeguards and Invariants, part three. If you have arrived here first, the
next few paragraphs are all you need; the earlier parts are worth going back
for, but this does not depend on them.*

---

## Where this is in the series

This series is about a distinction that sounds like pedantry until something
goes wrong with it.

A **safeguard** is what an organisation arranged: a policy, a control, a
switch, a promise. An **invariant** is a property the system is not permitted
to violate, whatever the organisation later decides, however the
implementation changes, whoever ends up running it.

**Part one** put that distinction in a child's bedroom. A girl tells an AI
companion her dog's name and what happened with her friends. She is not
generating data; she is confiding. Then somebody turns memory off. Part one
asked nine questions about what that switch actually establishes — whether
the summaries went when the conversation did, whether the metadata still
shapes the replies, whether the system could reconstruct the conversation
from what it kept. Its short version: *a toggle is not a fact.* A switch set
to off proves a switch was flipped. And the property worth naming is that
**Monday should not be allowed to write Thursday**.

**Part two** pushed on the obvious rejoinder. If you want to prove a
boundary held, you need evidence — and the cheapest way to get evidence is to
keep everything, which is the surveillance architecture the whole argument
exists to refuse. It ended on a promise rather than an answer: show that
information did not cross a boundary, *without* building a system to watch
the boundary. We need evidence about the lock, not a warehouse of children's
secrets.

**This part is the attempt to pay that off.** It is about what happened when
we stopped writing the argument and built a machine to test it, what that
machine got badly wrong, and why a rulebook currently being simplified in
Brussels turns out to be the same problem three sizes up.

There is no children's software in what follows, apart from one test case.
The argument is about records, boundaries and who has to prove what.

---

Start where we left her.

Monday has been deleted. Thursday arrives. The parent does not want a copy of
the conversation kept forever merely so that somebody can prove, later, that
the deletion worked.

That is the whole difficulty, and it sounds close to a contradiction:

**How do you preserve evidence that a boundary operated without preserving
the thing the boundary was there to protect?**

We could have kept writing about it. Instead we tried to build it.

---

## A smaller machine

Not a child-safety system. Not an AI companion. Something much smaller, whose
only purpose was to answer a narrower question:

*What must a system record when authority crosses a boundary?*

We called the experiment ARAPAHOE.

In plain terms, it separates the part that proposes an action from the part
allowed to authorise it. A proposal enters through a narrow opening. A
component called the Sentinel checks it against a body of rules. If the
conditions hold, the transition is written to a record. Only once the system
has evidence that the record exists is the action released into the world.

The proposer has no authority to write the record, and none to release the
action. It can ask. That is all.

The sequence that matters:

> **propose → verify → record → receipt → release**

The ordering sounds bureaucratic until you reverse it.

Release first and record second, and a crash between the two leaves an action
nobody can prove happened. Record first and release second, and the worst
intermediate state is a record of an action that never occurred.

Those two failures are not equally bad. One leaves a false entry that can be
found, questioned and corrected. The other leaves a thing that happened in the
world with nothing pointing back to it.

A record with no action is a discrepancy. An action with no record is a hole.

---

## The machine refused ninety-nine times, and its record said zero

The first design refused invalid proposals without writing anything down.

This felt obviously correct. The record is the trusted part; bad proposals
should not enter it. Refuse, discard, move on.

Then we tested it, by handing two different actors identical traffic.

The first was refused ninety-nine times and accepted on its hundredth
attempt. The second was accepted at its first.

The original design produced the same history for both.

One acceptance. Nothing else. The ninety-nine refusals had not been hidden or
redacted — there was nothing to hide. They had never existed as anything a
later reader could see. An actor hammering at the boundary until something
gave, and an actor that walked up once and was let in, were the same actor as
far as the record was concerned.

The corrected version records all ninety-nine declines. Handed the same
traffic, it reports: *stubborn — 100 attempts, 99 refusals. Lucky — 1
attempt, 0 refusals.* Both eventually accepted, and now visibly different.

We had built a safeguard — refuse the bad transition — and in the same
motion destroyed the evidence that the safeguard had ever been exercised.

That is the moment the abstraction became concrete for us. And it is the
answer to the question part two left open.

**You do not need to keep the proposal.** You need enough evidence about the
boundary to establish that something arrived, that the boundary acted, and
that the action did or did not proceed. The content of the ninety-nine
rejected proposals is not required to show that ninety-nine proposals were
rejected.

Prove the property. Not the conversation.

A knock is a row. What was said through the door is not.

---

## What the record is not allowed to say

There is a second half to this, and it is the part that keeps "record the
boundary" from becoming the surveillance architecture we were trying to
avoid.

A record that can say anything will eventually be asked to.

So the vocabulary is closed. To test that at full size we built a second,
deliberately unglamorous thing: a small piece of software that observes a
person and then reports on them to somebody else. We made it a game for young
children because that is the least forgiving version of the problem — the
subject cannot read the report, cannot consent to it meaningfully, and the
reader is an adult with authority over them. If the architecture fails
anywhere, it fails there.

Its record can write exactly twelve kinds of thing. A word outside that list
cannot be written at all. There is no entry for a score, none for a mood,
none for how the subject seemed, and none for winning. The question *how was
she today* has no representation in the system — not a blank field, no
representation.

That constraint is what makes the record safe to keep. Not encryption, not a
retention limit, not an assurance. It is safe because of what it is
structurally unable to express.

There is a second discipline underneath it, easier to state than to hold: the
record must not be told what it does not need.

The clearest instance is almost trivial. The subject is accompanied by an
animal that has a name. The record does not know it exists. Not a redaction,
not a field left blank — the ledger is simply never told, so there is nothing
to withhold and nothing to leak.

And because the system genuinely does not know, a later rule falls out of it
for free rather than being enforced. Progress at one point requires three
others to attest on the subject's behalf. The companion cannot be one of
them. Not because a check excludes it; because a record that never learned of
it cannot count it as a voice.

That is what an invariant looks like when it is small enough to see whole.
Not a promise that the name is protected. An architecture with nowhere to put
it.

---

## What we got wrong, which is the more useful half

Two failures are worth more than the successes, because both are the kind
that survive into production looking healthy.

**The description drifted while the property held.**

The closed vocabulary was enforced and tested. The *claim about it* was not.
The screen a parent reads told them the system could record ten kinds of
thing, and that there was no eleventh, while the engine was recording twelve
— two of which appeared in the log directly above the claim. Underneath, the
function that supplied the screen kept its own separate list of ten. Three
hand-written copies of one list, all describing a property that was itself
sound, all wrong within a day of each other.

The invariant never moved. Every description of it did. And the descriptions
were the only thing a reader outside the system could see.

We had guarded the mechanism and never once guarded the prose about the
mechanism. Documentation is a surface, and unguarded surfaces drift.

**And the claim that was printed rather than measured was false.**

The same screen was to carry a line reading *nothing is retained on disk*.
Instead of printing it, we made it measure — walk every directory the
application may write to, and state what it finds. The first run returned
85,983 bytes in nine files. Compiled graphics, no child in them, and not
zero. The sentence had been false since the first build that drew a picture,
and nothing would ever have said so.

Then the screen listed the nine file names. All UUIDs. Truthful, complete,
and they pushed the actual report off the bottom of the screen, so a parent
opening it saw nine meaningless hashes and nothing about their child's
afternoon.

Disclosure by volume is not disclosure. It is the transfer of interpretive
work to whoever is least able to do it, performed while looking maximally
transparent.

---

## And then Europe handed us the same problem at another scale

Thirteen Member States have circulated a joint position asking Brussels to
deep-clean the accumulated rulebook: consolidate obligations, remove
duplicated reporting, improve interoperability, and examine what already
exists before adding another layer on top of it.

That is coordinated political action. It is not yet a change in law. No
instrument has been repealed and no obligation suspended, and the difference
between political momentum and legal effect should stay visible in this
debate.

The underlying pain is real. A system of rules can become dense enough that
compliance depends on interpretation rather than execution, at which point
the density of the safeguards starts working against the thing the
safeguards were for.

On its face this has nothing to do with a child deleting a conversation, or a
small engine refusing a proposal ninety-nine times.

Architecturally it is the same question.

**What can be removed without removing the evidence that the protected
boundary still exists?**

Three scales, one problem:

- **The child.** Did Monday cross into Thursday, and what would show it?
- **The machine.** Did the refused proposal leave anything a later reader
  can find?
- **The rulebook.** When obligations are consolidated, can the affected
  person still establish what authority was exercised over them, and contest
  it?

The parallel debate about AI and personal data is the stress test rather than
a separate subject. Privacy advocates have raised concerns about circulating
draft proposals that would broaden the basis on which existing personal data
may be processed for AI, and weaken the mechanisms around information,
correction, deletion and objection. Those are drafts and positions, not
adopted law, and that distinction matters as much here as it does with the
simplification paper.

But the architecture question is available now, and it is exactly ours: if
processing becomes easier on the operator's side, does the individual retain
enough visibility and evidence to determine what happened, object, correct,
and obtain redress?

---

## Volume is the wrong axis

The public argument about all of this runs along a single line: more
regulation or less. Directives or regulations. Brussels or the capitals.
Competitiveness or rights.

The experiment suggests that line is close to orthogonal to the property.

Consider what actually fixed our engine. The original refused invalid
proposals and wrote nothing. The corrected version refuses invalid proposals
and writes a row. We did not add a rule, remove a rule, relax a check or
tighten one. The Sentinel's authority is identical. What may cross the
boundary is identical. Every proposal that was refused before is refused now,
on the same grounds.

**One more row. Nothing else.** And the difference between the two versions
is the difference between a system that can demonstrate its boundary
operating and one that cannot be distinguished from a system with no boundary
at all.

That is not a question of how much regulation there is. It is a question of
what shape it has.

Which is why the usual scoreboard for simplification is measuring the wrong
thing. Fewer instruments. Fewer reporting obligations. Fewer compliance
hours. Fewer overlapping definitions. Every one of those is a real number,
and every one of them is taken from the institution's side of the boundary.
They describe how the system feels to operate. None of them describes what a
person on the other side can still establish.

You can subtract a great deal and lose nothing that matters — duplicated
returns, three portals where one would do, a definition restated in four
places. You can also subtract a very small amount and lose the property
entirely, if what you happened to remove was the part that left a trace. The
volume of the change tells you almost nothing about which of those two you
just did.

So the question to put to any consolidation is not *how much came out*. It is
*what can still be established afterwards, by whom, and against whose
account*.

A rulebook can get shorter and stronger. It can also get shorter and become
undemonstrable. Counting pages cannot tell those apart, and counting pages is
what we are currently set up to do.

## A refusal nobody can see

Here is the line the small machine gave us, which turns out to generalise:

> **A refusal nobody can see is indistinguishable from no refusal at all.**

Carefully extended:

- A deletion nobody can verify may be indistinguishable from retention.
- A right whose exercise leaves no independently examinable trace may be
  indistinguishable from a promise.
- A boundary whose crossing cannot later be reconstructed may be
  indistinguishable from no boundary.

The word doing the work in each is *indistinguishable*. Not *equivalent*. The
claim is not that the deletion did not happen. It is that the system has
placed itself in a state where the honest case and the dishonest case look
identical from outside — and that this is a design outcome, not a misfortune.

---

## Who carries the burden when the evidence is missing

When a system leaves no evidence, the question does not go away. Somebody
still has to establish what happened. It is almost never the party that holds
the records.

The parent has to establish that Monday survived.

The applicant has to establish that the gate treated them wrongly.

The citizen has to establish that their data was repurposed.

The business has to reconstruct which of several overlapping rules governed a
transaction, and under which national implementation.

Complexity does not disappear when the record disappears. **The burden of
reconstructing it changes hands** — from the party with the pipeline, the
definitions and the interfaces, to the party with a question.

That is the failure mode to watch for in any simplification. Not *how much was
removed*, but *who now has to prove what*. A reform can reduce administrative
burden measurably on one side of a boundary while making the other side
unnavigable, and every number reported about it will look like progress.

---

## The invariant

Only now is it worth stating the property, because it has to be read with
both halves held at once.

> **A governed transition should leave enough durable evidence for an
> independent party to determine what happened, under whose authority,
> against which rule, and with what remedy available — without preserving
> more of the protected subject than that proof requires.**

The first clause is the answer to *a refusal nobody can see*.

The final clause is the answer to *record everything*, which would prove the
lock by filming everyone who approached the door.

Two cautions from the experiment, both of which we had to be told.

*Independent* is stronger than *several*. We once claimed five independent
confirmations of a result and were corrected by our own co-author: they
shared an actor, a record and a process, so they were one voice five times.
Distinctness is not independence — and a simplification programme can produce
four confirmations from one pipeline and call it corroboration.

And evidence must be able to say what was actually measured. For a while our
own test harness did not rebuild the engine it was testing, so a green result
certified a file on disk rather than the source it claimed to be about.
Nothing in the output could have told you.

---

## Monday and Thursday

We started with a child, a memory switch, and one apparently simple question:
did Thursday remember Monday?

The small machine gave us a second: if the boundary worked — or failed — what
would remain that another party could inspect?

Europe is now asking a third, whether it knows it or not: as the rulebook is
simplified, what evidence of the boundary survives?

The answer cannot be to keep every conversation, every document, every
intermediate state, every piece of personal data, forever. That proves the
lock by filming everyone who approaches the door, and it is the architecture
part two refused.

But neither can the answer be a cleaner settings page, a shorter rulebook, or
an operator's assurance that the boundary held.

A safeguard says the door should stay closed.

An invariant says what must remain true.

Architecture leaves enough evidence to prove it.

Monday can stay on Monday's side of the week. And Thursday does not need to
keep the diary to prove it.

---

*The experiment described here — the engine, the guards, and the observed-
subject test case — is open source, along with its own record of what it got
wrong. Nobody outside its two authors has attacked it. Until somebody does,
everything above is a method that survived its own makers, which is the
weakest form of survival there is.*

---

### The rest of the series

**Part one — *Safeguards Are Not Invariants: Nine Questions*.** What a memory
switch does and does not establish, asked as nine concrete tests you can put
to any system that claims to have forgotten something. Start here if you want
the questions rather than the architecture.

**Part two — *Prove the Property, Not the Conversation*.** Why the obvious
way to prove a boundary held is to keep everything, why that is the wrong
answer, and the promise this part was written to pay off.

**This part.** What happened when we built the thing instead of arguing about
it, and why a rulebook being simplified in Brussels is the same problem at a
different size.
