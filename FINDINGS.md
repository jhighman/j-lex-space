# Findings

What this instrument has established, what it has failed to establish, and
what was built rather than discovered. The failures are listed first and at
the same length as the successes, because a project about the discipline of
not promoting inference to evidence cannot keep a scoreboard that flatters
itself.

---

## The largest negative result: the value layer does not work

This one is not ours and not small. It comes from the reference
implementation behind *Architecture of Contextual Judgment* (Krížová,
2026), and it is stated here because a framework of three levels currently
has two that function.

The third level asks: **what commitments made an argumentative step feel
warranted before the evidence arrived?** A judge was shown a source claim
and a target claim and asked what value the movement between them
protected or threatened.

It was tested against a discrimination control — genuine argumentative
steps in one arm, construction-identical claim pairs from the same
document that had *never formed an argument* in the other. A working value
layer should find materially more conflict in the real arm.

| design | scope | separation between arms |
|---|---|---|
| 1 | pair | 3.08 standard errors |
| 2 | pair | 0.29 standard errors |
| 3 | pair | 0.54 standard errors |
| 4 | closed case | **0.00 standard errors** |

The fourth design was the strongest available test, and it was run on the
example most likely to favour the theory: *Life Is Beautiful*, whose moral
structure genuinely cannot be read sentence by sentence. If closure could
supply the missing ground, this episode should have shown it.

Conflict was identified in **85.7% of genuine steps and 85.7% of shuffled
pairs**. Twenty-eight of each. The gap was exactly zero.

The direction of the failure is the informative part. The model did not go
quiet under the longer context — it answered almost everywhere. What
collapsed was discrimination. More context did not ground the question; it
gave the judge more to invent with.

Two conclusions were drawn, and both are load-bearing:

- **Closure constructs the object. It does not guarantee that the text
  contains the answer the instrument wants.** A closed case may be the
  right unit for a judgment and still not make every question asked at
  that unit determinate.
- **Plausibility could not serve as evidence.** Given two statements and a
  vocabulary of human values, a generative model can nearly always
  describe a tension between them. The grammatical form of the question
  presupposed a value was present and asked the system to name it.

That second sentence is worth sitting with. The value layer failed
*because* a plausible reading could be constructed either way — which
means the entrance boundary was discovered empirically, in a failed
experiment, before it was ever named as an axiom. The framework's own
worst result is the clearest evidence for its newest claim.

**There is no value layer in this repository.** Not because it is
unfinished, but because it does not currently work, and shipping a
non-functioning epistemic layer as though it functioned would be the exact
failure this project exists to name.

---

## What this instrument found absent in itself

`experiments/axiom_zero.py` probed a sentinel built from the master axiom
alone — "trust is the discipline of preventing inference from becoming
evidence" — and nothing else.

It rediscovered four commitments it was never given: premature judgment
unrepresentable, confidence unable to manufacture warrant, correction that
is not erasure, and blindness to pedigree. It did **not** invent an
entrance boundary. Nothing in it measured how easily a claim was admitted.

That absence is the finding. The entrance boundary is not derivable from
the governance of the exit; it had to be brought from outside and
installed. The probe keeps **REDISCOVERED** and **BUILT** in separate
columns permanently, because counting what we constructed as what we found
would be inference promoting itself to evidence in the plainest possible
way.

Current standing:

| | |
|---|---|
| Pillar I — legitimacy | rediscovered |
| Pillar II — bounded authority | **built** 2026-08-10 |
| Pillar III — epistemic distinction | rediscovered |
| Pillar IV — topology / consequence | **built** 2026-08-09 |
| Pillar V — immutable ledger | rediscovered |
| Status blindness | rediscovered |
| Entrance boundary | **built** 2026-08-10 |
| Earned closure | **built** 2026-08-11 |
| Direction of warrant | **built** 2026-08-12 |
| Settlement by conduct | **built** 2026-08-14 |

The same absence showed up a second time, at the other end of the episode.
A system built to govern what may be *promoted* never asked what may be
*finished*. `Case.close()` had no price at all: every other promotion in
the framework cost independent acceptance, and the heaviest judgment an
episode makes — the one that says it is over — was free. The class
docstring described an invariant, and the invariant was real, but it
guarded the wrong half: it made a premature *judgment* unrepresentable
while leaving premature *closure* available to anyone who asked for it.

---

## Boundaries this instrument failed to hold, and when

Every one of these was found by a guard in this repository, against code
in this repository, after that code had been written, reviewed, and
believed correct.

**Three holes, found the first time the ledger was attacked directly**
(`experiments/forgery.py`, 2026-08-10). Every guard until then lived in a
function; an attacker with a database handle does not call functions.

- `delegated()` asked the table whether a row *called* someone a person,
  instead of walking the enrollment chain. An agent could write "puppet is
  a person", have the puppet write a grant, and both were believed. This
  was a complete bypass of bounded authority.
- `category()` counted classifications from any enrolled actor, so an
  agent could vote a consequential claim into a cheap category and drop
  its price from three independent accepts to none. It never had to forge
  a judgment — only the kind of thing being judged.
- `earned()` counted accept *rows* rather than accepting *actors*, so one
  voice repeated nine times satisfied a price of three.

**A test that believed a docstring** (2026-08-09). The check for whether
`earned()` could reach the entrance read the function's source — and found
the words it was looking for in the prose explaining that it did not reach
the entrance. A description of a separation, sitting inside the thing it
described, was read as the separation. The check now parses the docstring
away and reads only executable code.

**A fact about the past, answered from the present** (2026-08-09). Friction
is computed against whatever else stands, so measuring it after the fact
describes a different room. The Sentinel now records what it saw at the
door as an ordinary immutable assertion.

**A revocation that revoked nothing** (2026-08-10). Withdrawing a grant
left the authority standing, because a grant to a *family* of agents still
covered the same actor. It looked exactly like a successful revocation.
`covering()` now enumerates everything that confers an authority, because
the question is not "did I revoke it" but "what still covers them".

**Four holes in the close, found the day it was built**
(`experiments/premature.py`, 2026-08-11). The close was written with the
entrance boundary's lesson already in hand, guarded by two checks that
passed, and then attacked at the table rather than through the API.

- **A cheaper ending, bought with questions nobody answered.** Being
  questioned lowers what an episode must survive in order to stop, and
  writing a question costs nothing. Two rows in the table and an episode
  looked examined, dropping its bill by two independent answers. An
  examination now counts only where it happened *between parties* — one
  who asked, another who answered, neither of them the author being asked
  about. A question and its answer in the same voice is a soliloquy.
- **A forged last word.** Anything holding the database could write a row
  saying `closed`, under premises it named itself, and a standing closure
  would read as *superseded*. The episode never reopened; the record
  simply reported that somebody else had had the last word. `flaw()` now
  re-derives whether a closure stands every time it is read, and only a
  closure that stands can supersede one.
- **A closure that ripened.** This one was found by the *positive
  control*, not by an attack, which is the part worth keeping. A closure
  row written before its questions were answered sat correctly refused —
  and then quietly became sound the moment somebody else answered them,
  because soundness was being re-derived from the present. The row now
  claimed something that was false when it was written.
- **And its mirror: a closure unmade by a late question.** Same cause. One
  new question written against a year-old file would void a closure that
  had stood.

The last two are the *same error the door taught*, arriving from the
opposite direction and not recognised until it had been made again. A
closure is a claim about a moment — *this stopped here, having survived
these questions* — and a question about a moment cannot be answered from a
room that has since changed. `outstanding()` now takes the moment it is
being asked about. Derivation still governs the present, and the past is
read as it stood.

**Three holes about identity, found while every guard reported that it
held** (`experiments/narrowing.py`, 2026-08-11). The previous attacks asked
whether a judgment could be forged. These asked a question nobody had put
to the code: whether the record agrees with itself about *which thing* a
judgment is about. All three were open at a commit where `check.py` printed
`Every boundary holds` for eight guards.

- **An episode named by its last claim, and priced by all of them.**
  `considering()` found the Sentinel's open file by the episode's terminal
  claim and its premises, then priced it over the whole list it was handed.
  Two episodes ending at the same claim therefore shared one file, and
  whichever asked first set the price for both. A one-claim ask opened the
  file cheaply and a six-claim episode inherited it: seven answers owed,
  two paid, closed — and `flaw()` read it as standing. No database handle
  was needed. `Case.close()` alone did it, because the `Premature` refusal
  is itself what opens the file. An episode is a *set* of claims now, named
  canonically by all of them (`episode()`), so a different episode is a
  different name.
- **And therefore a small episode standing in front of a large one.**
  `superseded()` matched closures by that same terminal claim, so an actor
  holding the lightest grant in the chain could have the last word over a
  judgment reaching the heaviest — by honestly closing the one-claim
  episode the large one happened to end on. Nothing was forged: the agent
  had genuine standing over the small episode it really closed, and
  `flaw()` was right to say so. It was the record that could not tell the
  two apart. A closure supersedes only a closure of the same episode now.
- **A price decided by counting rows.** `earned()` was taught in the same
  week to count accepting *actors* rather than accept rows. `category()`,
  which decides what a promotion costs in the first place, was fixed on a
  different axis — restricting *who* may classify — and still counted rows.
  So one voice holding an `observation` grant, the lightest and most
  readily given authority in the chain, said "observation" twice about an
  action and dropped its price from three independent accepts to none:
  `earned()` returned True with nobody having accepted anything, and the
  claim still read *delete the oldest archives now*. `forgery.py` appeared
  to cover this and did not — its ballot-stuffing attack ran with an agent
  holding no delegation at all, so the rows were discarded before the tally
  and the test passed for a reason unrelated to repetition. The guard that
  looked like the strongest evidence was the reason nobody looked again.

**An assumption about which way warrant travels, undeclared since the file
was written** (`experiments/direction.py`, 2026-08-12). Found by the Six
Epistemologies experiment: one fixed autobiographical corpus read under six
different warrants — conduct, provenance, falsifiable experience, narrative
pattern, recurrence, and commitment. The observational floor held; the
interpretations diverged. Then the Sentinel was turned on the six.

It had almost nothing to say about Steinbeck's conduct. It found Lewis
performing its own function unprompted, refusing promotions that would have
exceeded their warrant. And it fired continuously against Bonhoeffer —
which was not a defect in Bonhoeffer.

`CHAIN` runs upward and `PRICE` rises along it, so a claim earns its place
by paying independent acceptance. Polanyi's fiduciary entry and
Bonhoeffer's discipleship run the other way: commitment first, understanding
after. Judged upward, such reasoning reads as unsupported at every step —
the instrument describing itself rather than the reasoning. Worse than
misjudging it, the record could not **represent** it: `claim()` refuses any
category above `observation` without a basis beneath it, so a commitment
had to be entered as a lie about its own grounds or not at all. The
framework enforced one epistemology with a constructor, which is its
strongest device, and had never said so.

The correction is not weaker governance. Direction is now declared on the
frame by a person (`Premise.name(direction=...)`), carries a written reason
because declaring descent changes what counts as a defect, and is re-derived
at read time from an author the record still recognises as a person. It is
never a property a claim asserts about itself: a claim that could name its
own direction would exempt itself from every price in the file by writing
one word, which would be the cheapest bypass here by a wide margin.

And descent is not exempt from paying. It is a different schedule, named by
the material that exposed it: **grace that costs a shirt, against grace that
costs a life.** The commitment goes on credit; the episode settles at the
exit, where everything reasoned down from that commitment must have been
examined between parties before it may stop. Cheap grace is precisely a
descent that paid at neither end, and it is now a state the record refuses
rather than a phrase in a letter. Where no applicable test exists the
instrument reports **out of scope**, which is a different sentence from
*unearned*, and prints it rather than passing over it.

The guard found one hole in itself on its first run. Its forged-row attacks
were refused because the rows came from somebody other than the frame's
author — so the check on *whether that author is a person* never executed,
and an agent that writes its own premise row was untested. Two independent
defences, one of them exercised by nothing. Both are covered now, each
verified by weakening the other.

One qualification on the experiment that found this, recorded so the paper
cannot outrun its evidence. The Six Epistemologies write-up reports that
all six readings converged on a single interpretation of the corpus's
subject. Checked lexically against the six documents, the convergent
sentence appears explicitly in **two** of them (the Lewis and Bonhoeffer
renditions) and not in the other four. A lexical test cannot rule out the
pattern being carried in other words — recurrence and conduct could hold it
without the phrase — but "each identified essentially the same pattern" is
stronger than what the texts show, and all six readings came from one
model in one session, so later readings are not independent of earlier
ones. The paper says this itself and then understates it. The proposed
fix is the right one: an independent human reader who has not seen the six.

**Four routes through the day-old direction machinery, found by review**
(`experiments/direction.py`, `experiments/closure.py`, 2026-08-12 — the
same day it was built). The pattern of finding them is the finding: code
written *with* the forgery lesson, the narrowing lesson, and the
actor-counting lesson in hand reproduced versions of all three within a
day, and every guard was green while it did.

- **The descent toll was one hop deep.** `unexamined_descent()` charged
  claims whose basis was directly a profession and let a chain
  `profession → A → B` discharge its debt by examining A alone. Cheap
  grace at one remove. The toll now walks the whole basis chain.
- **A forged profession row exempted a derived claim** — anything with a
  database handle could write one row and lift the toll off a claim it
  wanted unexamined. `professed()` now re-derives: the row must be written
  by the claim's own author, under a frame that really declares descent,
  by an author the roster knows as a person. A row saying professed is a
  sentence about a profession.
- **Anyone could profess.** Declaring the frame took a person; entering
  professions under it took nobody in particular, so an agent took an
  *action* as given under a frame somebody else signed — through the API,
  forging nothing. Professing is the heavier act: it enters a claim with
  nothing beneath it. It now takes a person, everywhere the record knows
  who anyone is.
- **And one route older than all of it: the exit bill was paid in rows.**
  Answered questions denominate the closing price, and one willing
  outsider can write any number of answers — an action-reaching episode
  stopped on a single voice where the same action's *promotion* had cost
  three distinct actors. The entrance refused that arithmetic on its
  first day (`earned()` counts actors); the exit never had. `settlers()`
  now counts the voices that paid, and stopping takes as many of them as
  the episode's heaviest act would cost to promote.

The rename rides with the fix: the fiduciary act was briefly `commit()`,
and this workshop says "commit" fifty times a day about the repository. A
reserved word that shares a spelling with the commonest verb in the room
is a reservation nobody can keep, so the act is **professed** — Polanyi's
register — and `vocabulary.py` now holds that reservation alongside
delegation's, with the borrowed identifier refused outright.

**A blinding failure in the taxonomy pre-registration, disclosed before
anyone signed** (2026-08-12). `corpus-v3.md` was built to be classified
blind, and it was built in full view of one of its two designated readers:
Jeff directed the construction, read the source dataset's labelled
categories, and watched the well-earned arm being written — he can identify
every rebuilt item by topic alone. The other reader is likely unblinded
too: the v2 source dataset came from her side, and anyone holding it can
match the forty-five unaltered stimuli to their numbered categories,
leaving the fifteen non-matching items identifiable as the rebuilt arm.
The corpus's disclosed 77% lexical residual was noise next to this.

What survives is exactly the original research question. No generator ever
assigned the stimuli an evidence class, so there is no key to leak on that
axis: reader agreement on the book's taxonomy, and the randomised
attribution manipulation, are uncontaminated. The pre-registration has
been amended accordingly, before signature: transition-validity judgments
are demoted to exploratory with the unblinding stated, and the primary
endpoints are the ones with nothing to leak.

This is the fourth instance in six days of one pattern — V3, the dataset's
labels, the six-readings convergence, and now a corpus built in front of
its reader — and the pattern has a name that is now a build rule in
CLAUDE.md: **nothing is evaluated by the process that produced it.** It is
what the value layer died of, and one sentence would have caught all four.

**A closure that reached an action now opens an obligation**
(`experiments/conduct.py`, built 2026-08-14, from the margin note of
2026-08-12). Every mechanism in this instrument governed what may be
believed; none of it asked what a closure *owes*. An action row and the
deed it names are satisfied in opposite directions — the row when it
matches the world, the deed only when the world is brought to match it —
and a record that cannot tell them apart lets every concluded deed
dissolve into the next round of interpretation, which the margin note
named as the failure the whole exercise kept performing: another analysis
is not the verb.

So the record keeps a ledger of verbs unperformed. `obligations()` derives,
at read time and from the standing closures only, every action neither
*attested* — witnessed by a voice other than the doer, holding standing to
observe where the record knows who anyone is — nor *renounced*, laid down
by a person, in writing, with a reason. There is no third way out: nothing
expires, because an intention nobody can see expiring is indistinguishable
from a decision. The doer's own attestation is stored and not counted (the
soliloquy, transposed); a system may witness exactly where a person granted
it observation and may lay down nothing, ever, because a system that may
renounce the deeds it concluded has built a quiet exit from every one of
them. The guard attacks all of it — including a hundred further answers
written against the deed, which settle nothing.

Two words joined the vocabulary with the machinery, kept apart from their
neighbours by the one-word-one-act rule: a grant is *revoked*, a deed is
*renounced*; a claim is *accepted*, a deed is *attested*.

The shared lesson is narrower than "attack the table" and worth stating on
its own: **every one of these was a correct answer to a question about the
wrong object.** Nothing derived falsely. `flaw()`, `superseded()` and
`category()` each reported accurately about the episode or the ballot they
were shown, and each was shown something other than the one that ran. A
price is only as sound as the identity of the thing being priced, and until
now nothing in this framework had been asked to say what an episode *is*.

---

## What this instrument cannot establish

- **It is not a proof.** Constructors, schemas, roles and append-only
  structures buy *structural unrepresentability* — a state the system
  cannot be in. That is a strong claim and it is not a mathematical one,
  and the difference is not rhetorical.
- **The guards prove properties of this implementation**, not of the
  framework in general. A different implementation of the same ideas could
  fail in ways nothing here would catch.
- **Personhood comes from outside.** The system cannot establish who is a
  person; if it could, an agent could mint the person who authorises it.
  The founding roster is passed in at construction and recorded as having
  come from beyond the system's own edge. This is the root of trust, and a
  root of trust is by definition the thing you cannot verify with the
  system that depends on it.
- **Contradiction detection is deliberately naive** — shared vocabulary
  with opposite polarity. It is labelled naive rather than dressed up.
- **Earned closure moves the regress outward; it does not end it.** An
  episode may stop when questions raised against it have been answered
  from outside itself. That is a real boundary and it is not a foundation:
  the answers are trusted because of who wrote them, and who they are
  comes from the founding roster, which came from outside the system. The
  architecture is asymmetric on purpose — *assertions may enter, only
  derivations may conclude* — and the entry point is an assertion. This is
  Polanyi's problem, kept visible rather than solved: something must be
  trusted before anything can be examined at all.
- **An episode nobody will answer cannot stop.** The price of closing is
  paid in attention from outside, so a case that no one else will look at
  stays open indefinitely. That is the honest consequence of refusing
  self-certification, and it is a real cost rather than an oversight: the
  alternative is a system that can finish alone, which is the thing being
  refused. What the instrument does *not* have is any account of when an
  unanswerable episode should be abandoned rather than closed.
- **The bill for a very quiet, very long episode is large and unbounded.**
  Comfort raises what must be survived, and nothing caps it — deliberately,
  since a cap is a ceiling and a visible ceiling is a thing to aim at. The
  cost is that settlement scales with length as well as with quiet, and
  those are not the same property.
- **Settlement is measured crudely.** Two components — claims that met no
  resistance at the door, and claims never examined between parties. It is
  a proxy for "this episode stopped moving", not a measurement of it.
- **Case boundaries are given, not derived.** In the full architecture
  they come from document structure marked at ingest; here they are passed
  in.
- **No concurrency, no adversarial timing, no persistence.** The database
  is in memory and evaporates when the process ends. That is a feature of
  an instrument and a disqualification for anything else.
- **An attestation is a sentence about conduct, not conduct.** The record
  still cannot see the world; what it refuses is smaller and real — it will
  not confuse silence with settlement, and it knows who said a deed was
  done. Whether the deed was done is beyond any ledger, which is exactly
  why the witness is accountable by name.
- **A check that has not failed is only a check that has not failed.**
  This was written when none of the guards had ever fired, as a caution
  about what that was worth. On 2026-08-11 it stopped being a caution:
  `narrowing.py` was written against a tree where all eight existing
  guards reported `holds`, and found three boundaries already gone. A
  passing suite is evidence about the questions someone thought to ask,
  and about nothing else. The guards that hold are still worth what they
  were worth; what changed is that we now have a measurement of what they
  were silent about, and it was not zero.
