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
- **A check that has not failed is only a check that has not failed.**
  None of the guards here have fired since being written. That is a
  result, not a proof, and it is worth exactly what it is worth.
