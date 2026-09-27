# The Ninety-Nine Refusals That Weren't There

### A small machine, a children's game, and the question Europe is about to get wrong

---

The number was zero, and it should not have been zero.

The software had done everything it was supposed to do. An actor had shown up
at a boundary a hundred times with a proposal it wasn't entitled to make.
Ninety-nine times, the component guarding that boundary had looked at the
proposal, checked it against the rules, and said no. On the hundredth, the
proposal was finally valid, and it went through.

Textbook behavior. The guard guarded.

Then they looked at what the system had written down about all this, and
found a single line. One acceptance. Nothing else.

Not a redacted entry. Not a summary. Nothing. As far as the historical record
was concerned, the actor had walked up once and been let in.

Run the same system with a well-behaved actor — one proposal, immediately
accepted — and you get an identical record. Two profoundly different stories,
one of them a sustained attempt to get past a control, and the log cannot
tell you which one happened.

This is the kind of bug that doesn't crash anything. It shipped clean. It
passed its tests. And it is, I'd argue, the most interesting thing anyone has
found about AI governance this year, for reasons that will take a few
thousand words and a detour through a game for four-year-olds to explain.

---

## A toggle is not a fact

Start somewhere less abstract: a kid's bedroom.

A girl is talking to an AI companion. She tells it her dog's name. She tells
it what happened at school, who she's not friends with anymore, the kind of
thing you tell something that seems to be listening. She isn't producing
data. She's confiding.

Her parents, being reasonable people, find the memory setting and switch it
off.

Now — what exactly have they accomplished?

That question is the spine of a series of essays by Alexandra Křížová, and
her answer is unsentimental: they have established that a switch was flipped.
That's it. That's the whole of what the switch proves.

"A toggle is not a fact," she writes, and then spends nine questions taking
the idea apart. When the conversation was deleted, did the summaries go with
it? The embeddings? If the transcript is gone but the metadata isn't — the
timestamps, the session lengths, the safety flags — is the system still being
shaped by Monday when Thursday comes around? Could someone reconstruct the
conversation from what remains?

She has a phrase for the property she wants: *Monday should not be allowed to
write Thursday.*

And she draws a distinction that I've come to think is the most portable idea
in the whole discussion. A **safeguard** is what a company arranged — a
control, a policy, a switch, a promise. An **invariant** is something the
system is not permitted to violate, no matter what the company decides later,
who buys it, or which version ships next quarter.

Safeguards are what you get told about. Invariants are what survive the
telling.

Here's the trap, though, and the second essay walks straight into it on
purpose: if you want to *prove* a boundary held, you need evidence. And the
cheapest possible evidence is to keep everything. Log it all. Retain it all.
Which is, of course, precisely the surveillance apparatus the entire argument
exists to object to.

That essay ends on a promise rather than a solution. Show that information
didn't cross a boundary — without building a machine to watch the boundary.
Evidence about the lock, not a warehouse of children's secrets.

So: how?

---

## They built the problem instead of arguing about it

The answer, or the beginning of one, is that small machine with the
ninety-nine missing refusals.

It's called ARAPAHOE, and it is not a child safety product. It's an
experiment, built by Křížová and her collaborator J Highman, and it's
deliberately tiny — a few hundred lines of Rust, plus a workbench of
adversarial tests in Python whose entire job is to break it.

What it does is separate two things most software cheerfully combines: the
part that wants to do something, and the part allowed to authorize it.

A proposal comes in through a narrow opening. A component they call the
Sentinel checks it against a body of rules. If the conditions hold, the
transition gets written to a record. And only once the system has a receipt
proving that record exists does the action get released into the world.

The proposer can't write the record. It can't release the action. It can ask.
That's the extent of its powers.

    propose → verify → record → receipt → release

That ordering looks like bureaucratic throat-clearing until you try it the
other way around. Release first, record second, and a crash in the gap leaves
you with something that happened in the world and nothing pointing back at
it. Record first, release second, and your worst case is a record of
something that never occurred.

Those failures are not symmetric. One is a discrepancy — findable,
questionable, correctable. The other is a hole.

And then there were the ninety-nine refusals, which is where the experiment
stopped confirming what they already believed and started telling them
something.

---

## The safeguard ate its own evidence

The original design refused bad proposals and wrote nothing down. This is not
a careless choice. It's the obvious one. The record is the trusted artifact;
why would you pollute it with garbage that never made it through?

Because — and this only becomes visible when you actually run the thing — a
refusal that leaves no trace is indistinguishable from a refusal that never
had to happen.

They fixed it by recording the declines. Same rules, same authority, same
proposals refused on the same grounds. Handed identical traffic, the
corrected version now reports: *stubborn — 100 attempts, 99 refusals. Lucky —
1 attempt, 0 refusals.* Both eventually accepted. Visibly different.

What changed was not the strictness of the system. Nothing was tightened.
Nothing was loosened. The boundary sits exactly where it sat.

**One more row.**

And that single row is the difference between a system that can demonstrate
its boundary working and a system indistinguishable from one that has no
boundary at all.

Which gives you the sentence the whole experiment was arguably built to
produce:

> **A refusal nobody can see is indistinguishable from no refusal at all.**

It generalizes uncomfortably well. A deletion nobody can verify may be
indistinguishable from retention. A right whose exercise leaves no
independently checkable trace may be indistinguishable from a promise that
one was available.

Note the word doing the work: *indistinguishable*. Not equivalent. Nobody is
alleging the deletion didn't happen. The claim is that the system has put
itself in a state where the honest version and the dishonest version look
identical from outside — and that this is an architectural outcome, not bad
luck.

It also answers the promise the second essay left hanging. You do not need to
keep the ninety-nine proposals to establish that ninety-nine proposals were
refused. Prove the property, not the conversation.

A knock is a row. What was said through the door is not.

---

## The part where it becomes a game about a dog

Now for the turn I did not see coming.

To test all this at full size, they needed a system that observes a person
and then reports on them to somebody else. There are a lot of those. They
picked the least forgiving one available: a piece of software watching a
small child and reporting to their parent.

So they built a game.

It's for four- and five-year-olds and there is not a single word in it. A
child and a three-legged dog walk through a warren of burrows. In each burrow
there's an animal that wants something — food, a ball, a gentle hand — and
the child offers one of four things. The fourth option is to sit still and do
nothing.

That fourth option is the whole design. When an animal is frightened, every
other offer makes it worse. Reaching for something that's scared of you is
the intuitive move and the wrong one. The only way through is to wait until
the creature decides, on its own schedule, that you're all right.

There's no score. No timer. Nothing to lose.

Underneath it is the same architecture as the transaction engine, and this is
where the design gets genuinely hard-nosed.

The record can write exactly twelve kinds of thing. Not twelve by convention
— twelve by construction. A word outside that list cannot be written at all.
There is no entry for a score, none for a mood, none for how the child
seemed. The question *how was she today* has no representation in the system.
Not a blank field. No field.

That constraint is what makes the record safe to hand to an adult. Not
encryption. Not a retention policy. The record is safe because of what it is
structurally incapable of saying.

Then there's the dog.

The dog has a name. The record does not know the dog exists. Not redacted,
not nulled — the ledger is simply never told, so there is nothing to withhold
and nothing to leak.

And because the system genuinely doesn't know, something falls out of it for
free. At the bottom of the warren there's an animal too timid to come out for
anyone alone; it emerges only when three friends vouch for the child. The dog
cannot be one of them. Not because a rule excludes him. Because a record that
never learned his name has no way to count him as a voice.

That's an invariant you can see the whole of. Not a promise that the name is
protected. An architecture with nowhere to put it.

---

## What was done versus what became true

Here is the distinction that took me longest to appreciate, and it's the one
that makes the rest cohere.

**An action is what somebody did. An outcome is what became true.**

Systems are extremely good at recording actions, for the obvious reason:
actions are the things the system itself performed, and they're right there
at the moment of performance. Outcomes have to be observed afterward, by
somebody who goes and looks.

*A toggle is not a fact* turns out to be the same sentence as *an action is
not an outcome*. Flipping the memory switch is an action — real, logged,
honestly reported. Whether the system forgot is an outcome. All nine of those
questions are attempts to reach an outcome in a system that only exposes
actions.

Safeguards are actions: we deleted, we refused, we notified. Invariants are
outcomes: it's gone, it didn't cross, it can't be rebuilt.

The children's game holds the line in the one place it matters. The single
number it reports to a parent is how often their child sat still while an
animal was frightened. It would have been trivial to count the button
presses. It counts the animal calming down — because a button press
establishes that a button was pressed and nothing else.

They didn't get this right the first time, and the failure is instructive. A
row reading *sat still and waited* was being written on the branch where the
child had done the opposite and grabbed at the animal. The word was in the
vocabulary. Spelled correctly. Written by the only function permitted to
write it. Every check they had passed it.

An action asserted where the outcome hadn't happened — in a system
specifically built to make that impossible.

---

## The three lists that all disagreed

Any credible account of this project has to include the week its authors
spent being wrong in public, because it produced the most transferable
finding in the whole thing.

The twelve-word vocabulary is a genuine invariant. Enforced in code. Covered
by a test that fails if it moves.

The *descriptions* of it were not.

The screen a parent reads informed them the system could record ten kinds of
thing, and that there was no eleventh — while the engine was recording
twelve, two of which appeared in the log directly above the claim.
Underneath, the function feeding that screen kept its own separate hardcoded
list of ten. And a draft report split one act into three that don't exist
while dropping two that do.

Three hand-written copies of one list. All describing a property that was
perfectly sound. All wrong within a day of each other.

The invariant never moved. Every description of it drifted — and the
descriptions were the only thing anyone outside the system could read.

They'd guarded the mechanism and never once guarded the prose about the
mechanism. The fix was to stop maintaining a second copy: the parser now
walks the same array the documentation prints, the document is generated by
the engine, and a test fails when the file on disk stops matching what the
engine would produce. A stale description became a red build.

There's a companion failure worth the retelling. The same parent screen was
going to carry a line reading *nothing is retained on disk*. Instead of
printing it, they made it measure — walk every directory the app can write
to, and report what's actually there.

First run: 85,983 bytes across nine files. Compiled graphics. No child in
them. Also not zero.

The sentence had been false since the first build that drew a picture, and
nothing would ever have contradicted it.

Then the screen dutifully listed all nine file names. UUIDs, every one of
them. Complete, truthful, and they shoved the actual report off the bottom of
the display, so a parent opening it saw nine meaningless hashes and nothing
whatsoever about their kid's afternoon.

Which is a very small, very literal demonstration of what happens next.

---

## Meanwhile, in Brussels

Thirteen EU member states have circulated a joint position asking the
Commission to deep-clean European legislation. Consolidate obligations.
Kill duplicated reporting. Improve interoperability. Look hard at what
already exists before stacking another layer on top.

This is a political document, not a legal one. Nothing has been repealed. No
obligation has been suspended. The distinction between momentum and effect
should stay visible.

And the underlying complaint is legitimate. Rules accumulate. National
implementations diverge. Amendments pile onto instruments whose original
problems were never resolved. You can reach a point where compliance depends
on interpretation rather than execution — where the sheer density of the
safeguards starts working against the thing they were for.

On its face this has nothing to do with a girl's dog or a small engine
refusing a hundred proposals.

Architecturally it's the identical question: **what can you remove without
removing the evidence that the protected boundary still exists?**

Three scales, one problem. Did Monday cross into Thursday, and what would
show it? Did the refused proposal leave anything a later reader can find?
When obligations get consolidated, can the affected person still establish
what authority was exercised over them — and contest it?

Here's what makes the experiment worth more than an opinion. What fixed the
engine was not a rule added or a rule removed. The authority was identical.
What could cross was identical. Every proposal refused before was still
refused, on the same grounds.

One row.

Which means the argument everyone is actually having — more regulation or
less, directives or regulations, Brussels or the capitals — is close to
orthogonal to the property. A rulebook can get shorter and stronger. It can
also get shorter and become undemonstrable. And the metrics currently in use
cannot tell those apart, because *fewer instruments*, *fewer reporting
obligations*, *fewer compliance hours* are all measured from the
institution's side of the boundary.

They describe how the system feels to operate. None of them describes what a
person on the other side can still establish.

---

## Burden displacement

This is the concept I expect to outlive everything else here, so let me give
it the space.

When a system leaves no evidence, the question doesn't evaporate. Somebody
still has to establish what happened. It's essentially never the party
holding the records.

The parent has to establish that Monday survived. The applicant has to
establish the gate treated them wrongly. The citizen has to establish their
data was repurposed. The business has to reconstruct which of four
overlapping rules governed a transaction, under which national
implementation.

The work didn't stop existing when the record did. It moved.

> **Burden displacement:** a system looks simpler because complexity has left
> the operator's side of the boundary. It hasn't been eliminated. It's been
> transferred to the person trying to understand or contest what the system
> did.

The company has the records. The institution has the definitions. The model
developer understands the pipeline. The regulator understands the procedure.

The individual has a question.

And when the arrangement requires that individual to establish whether the
rule applies, whether the data qualified, whether an exception was properly
invoked — the strongest actor has reduced its administrative burden by
increasing the evidentiary burden on the weakest one. Call that **complexity
inversion**: not less complexity, just a reversal of who carries it, pointed
at whoever can carry it least.

What makes it so hard to catch is that it's invisible to the instruments used
to evaluate it. From the institution's vantage point, everything improved.
Fewer steps. Fewer forms. Cleaner diagram. Every number in the report is
true. The person on the other side of the boundary appears in none of them,
because all the metrics were defined on the institution's side.

A reform can pass every test it set for itself while the property it was
meant to preserve has quietly relocated.

The related debate about AI and personal data is the stress test rather than
a separate story. The privacy organization noyb says proposals circulating in
connection with the EU's Digital Omnibus discussions would, on its reading,
broaden the basis for processing existing personal data for AI and reduce the
force of the mechanisms around information, correction, deletion and
objection. That's their characterization of draft material, not adopted law,
and I haven't checked it against the texts. Borrow the question, not the
alarm: if processing gets easier on the operator's side, does the individual
retain enough evidence to know what happened, object, correct, and obtain
redress?

---

## The property, finally

Only now is it safe to state the thing, because both halves have to be held
at once:

> **A governed transition should leave enough durable evidence for an
> independent party to determine what was done, what consequently became
> true, under whose authority, against which rule, and with what remedy
> available — without preserving more of the protected subject than that
> proof requires.**

The first half answers the ninety-nine invisible refusals. The last clause
answers *record everything*, which proves the lock by filming everyone who
approaches the door.

Two cautions, both of which this project had to learn by being corrected.

*Independent* is a stronger word than *several*. An earlier draft of their
own writeup claimed five independent confirmations of a result. Their
co-author rejected it: the five shared an actor, a record and a process, so
they were one voice five times. Distinctness is not independence — and a
simplification program can produce four confirmations out of a single
pipeline and call it corroboration.

And evidence has to be able to say what was actually measured. For a stretch,
their own test harness wasn't rebuilding the engine it was testing, so a
green result certified a file sitting on disk rather than the source code it
claimed to be about. Nothing in the output could have told you.

---

## Monday, Thursday, and the dog

It started with a child, a memory switch, and a question that sounds simple
until you try to answer it: did Thursday remember Monday?

The small machine produced a second question. If the boundary held — or
didn't — what would remain that somebody else could inspect?

Europe is now asking a third, whether it has framed it this way or not. As
the rulebook is simplified, what evidence of the boundary survives?

The answer can't be to keep every conversation, every document, every
intermediate state, every piece of personal data, forever. That's the
warehouse, and the warehouse is the thing we're trying not to build.

But it also can't be a cleaner settings page, a shorter rulebook, or an
operator's word that the boundary held.

A safeguard says the door should stay closed.

An invariant says what must remain true.

Architecture leaves enough evidence to prove it.

Monday can stay on Monday's side of the week. And Thursday doesn't need to
keep the diary to prove it.

---

*The engine, the guards, and the wordless game are public, along with the
project's own log of what it got wrong — which, as these things go, is the
more useful half. Worth noting: nobody outside its two authors has attacked
any of it, and no child has played the game. Until both of those change,
what's described above is a method that survived its own makers. Which is the
weakest form of survival there is.*
