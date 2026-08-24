# experiments/

The lab bench.

## Checking the boundaries

```bash
python3 experiments/check.py
```

Runs every guard and exits non-zero the moment one has moved. Run it
after any change to `framework/`. A boundary does not announce that it
has gone: it stays in the prose, in the README, and in everyone's memory
of the design, and is simply no longer true of the code.

## What is on it

- **`axiom_zero.py`** — which structural invariants does a system hold
  that was never told them? A sentinel built from the exit axiom alone
  is probed for each pillar and both boundaries. It rediscovered the
  exit and never invented the entrance, which is the finding: the
  entrance boundary is prior, not derivable.
- **`vocabulary.py`** — does the codebase keep the two meanings of
  "delegation" apart? Parses the framework and checks that only the
  definitions permitted to speak of delegation do. A semantic bug cannot
  be caught by testing behaviour, so the guard sits on the vocabulary
  where the mistake would first be made. Exits non-zero on drift.
- **`delegation.py`** — can an agent widen its own authority? Every route
  a system might take to authority nobody granted it — granting to
  itself, enrolling an accomplice, judging undelegated, forging the
  delegation row straight into the ledger — attempted and refused. Rests
  on the distinction between *task execution* (computation, needing no
  clearance) and *epistemic delegation* (a person granting a system the
  authority to judge with nobody present).
- **`entrance_invariant.py`** — the standing check. Two claims identical
  in kind and acceptance, maximally different in plausibility: their
  verdicts must match, and `earned()` must be unable to reach the door
  even by mistake. Run it after any change to the framework; it is
  written to fail loudly.
- **`scrutiny.py`** — does authority tighten the justification required of
  it? Each rung of the ladder attempted with too little and then with
  enough: nothing at scrutiny 1, a written rationale from 2, a term from
  3, and from 5 a term bounded to thirty days. Reach counts alongside
  consequence — handing an act to a *family* of agents costs a level,
  because a pattern is a promise about agents that do not exist yet.
  Includes the trap worth carrying into any implementation: revoking the
  grant you remember is not revoking the authority.
- **`forgery.py`** — what can be bought by writing directly into the
  ledger? A hostile actor with full write access attempts to mint a
  person to authorise itself, accept past a price, reclassify an action
  as an observation, stuff the ballot, and rewrite what a claim met at
  the door. Every row is stored; no verdict moves. The ledger is
  append-only and therefore full of lies, and simply not credulous.
- **`closure.py`** — what does an episode have to survive before it may
  stop? Two episodes go quiet for opposite reasons: one settled because
  everything in it was answered, one settled because nothing in it was ever
  asked. Both look finished from inside, and nothing further changed is
  what both of them look like. The quiet one is asked for more, the floor
  holds however contested the episode was, and no case closes in a single
  motion — the first ask draws the questions and cannot answer them.
- **`closure_invariant.py`** — the exit's standing check, and the twin of
  `entrance_invariant.py`. Two episodes pay their bills exactly, and the
  call graph under `earned_closure()` is walked to the bottom: no
  satisfaction term may be reachable from the decision to stop, at any
  depth. Comfort sets the bill and may never pay it, which is a property of
  the code's shape rather than of anyone's intentions.
- **`premature.py`** — what can be bought by writing straight into the
  ledger, at the exit rather than at the door? Four holes found the day the
  close was built, by attacking the table rather than the API: a cheaper
  ending bought with questions nobody answered, a forged last word, a
  closure that ripened once somebody else answered its questions, and its
  mirror, a standing closure unmade by one late question. The last two are
  the door's own lesson arriving from the opposite direction — a closure is
  a claim about a moment, and a question about a moment cannot be answered
  from a room that has since changed.
- **`narrowing.py`** — can an episode be made to look smaller than it is?
  Three attacks on identity rather than on judgment: open the Sentinel's
  closing file over a one-claim episode and let a six-claim one inherit
  the price, have a small episode stand in front of a large one that ends
  on the same claim, and relabel an action with one granted voice speaking
  twice. All three were open while every other guard reported that it
  held, which is the finding worth carrying.
- **`direction.py`** — can a system escape the price by declaring which way
  it reasons? The framework assumed warrant travels upward and never said
  so, and fired continuously against the one epistemology that reasons
  down from commitment. Direction is declared on the frame by a person now,
  with a reason, re-derived at read time — and attacked here from every
  side, because a boundary worth something is a boundary worth forging.
  Descent is not an exemption but a different schedule: the commitment goes
  on credit and settles at the exit.
- **`conduct.py`** — can a concluded deed dissolve into further analysis?
  An episode that closes on an action opens an obligation the record keeps
  derivable until the world pays it: conduct witnessed by a voice other
  than the doer, or a person laying the deed down in writing. The doer's
  own word is stored and not counted, systems may witness only where
  granted and may lay down nothing, and a hundred further answers settle
  nothing — another analysis is not the verb.
- **`immutable.py`** — is the append-only record actually append-only?
  Pillar V was reported standing for eight days and had never been there:
  the whole guarantee was that no `UPDATE` and no `DELETE` appeared in our
  code, and the threat model is an attacker who does not call the
  functions. One `UPDATE` rewrote a claim from *a rotation failed* to *a
  rotation succeeded*; deleting the accept rows moved a verdict; deleting
  an enrolment turned a person into nobody. Triggers and foreign keys now
  refuse it at the table, because a constraint in the application layer is
  a policy and a constraint in the storage layer is an invariant.
- **`unmeasured.py`** — can an episode buy a cheaper ending by never
  being measured? The exit charges for comfort, and it asked the door how
  each claim got in. The door returns nothing for a claim that never went
  through it, and nothing is not zero: `None == 0` is False, so a claim
  written straight into the table was scored exactly like one that had met
  resistance. The same three claims, the same author, the same words —
  seven questions through the door, four around it. `premature.py`
  attacked this number from the opposite side and found that being
  questioned could be talked up by writing rows; nobody had asked what the
  count does with a claim that was never at the door at all. The
  unmeasured is priced as the quiet is priced now, because a discount for
  not being weighed is one anybody can take. One route is reported and not
  closed, and it is the finding worth carrying: a row written in the
  Sentinel's name moves the reading to a number `friction()` cannot
  produce. The Sentinel is a role rather than an enrolled identity, so
  there is nothing to re-derive it against — the door is the last place
  here where a stored number is believed.
- **`decline.py`** — can a gate decline to spend, and never decline
  invisibly? The graduated sovereign gate of `test_sovereign_love_v3.py`
  refuses at the wall: a trigger aborts the insert, which is the strongest
  place to refuse and the one place a refusal cannot record itself — the
  row and the memory of refusing it are one statement, and the rollback
  takes both. This file translates the same envelope into the record's
  idiom: the row enters, the *spending* is refused, and the gate is a
  derivation over the rows at the moment asked about. Tolerance, alert,
  and the shut gate survive translation whole; conduct attested by a voice
  other than the doer is still the only key; and the translation buys the
  refusal ledger for free, because a refusal that is a derivation cannot
  happen in the dark. Both counting policies — does substantive engagement
  buy the gate back down — derive side by side from the same rows, one
  visible line apart, because that is a decision and not an accident of
  arithmetic. Reports and demonstrates rather than guards the framework;
  run it directly.
- **`preregistration-taxonomy.md`** — a protocol, not a script, and not
  yet frozen. Can two independent readers apply the book's own taxonomy to
  the same claims, does attribution change the class they assign, and does
  judging a claim invalid change it? Written before any classification,
  because the classification step is the experiment and everything after it
  is arithmetic.
- **`corpus-v3.md`** — the sixty stimuli that protocol runs on, committed
  in full with their provenance, the rebuild of the well-earned arm, and
  the leak measurements taken before freezing. No labels: the key is held
  private and its hash is published here.
- **`template.py`** — the skeleton to copy for a new question.

## The discipline

An experiment here is held to the framework's own standard: it must say,
*before it runs*, what it asks and what would prove it wrong. Every
experiment file carries three headers:

- **QUESTION** — the one thing this probe asks.
- **METHOD** — the smallest honest way to ask it. Standard library only,
  in-memory sqlite, readable top to bottom. Experiments build on the
  record in `framework/sentinel.py` rather than inventing new machinery.
- **REFUTED BY** — the result that would kill the idea. Written first,
  because an experiment that cannot fail is an opinion with a run button.

Results are read before they are interpreted. The numbers a run prints go
in the record; what we think they mean goes in letters, and reaches the
book only if it earns its way there.

Start from `template.py`:

```bash
cp experiments/template.py experiments/my_question.py
python3 experiments/my_question.py
```
