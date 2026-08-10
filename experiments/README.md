# experiments/

The lab bench.

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
