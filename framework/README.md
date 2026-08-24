# framework/

**A reference instrument, not a product.** Built to expose, measure and
falsify structural claims — not to be depended on. The database is in
memory and evaporates with the process. See
[FINDINGS.md](../FINDINGS.md) for what it has failed to establish.

A small working model of the *Architecture of Contextual Judgment*
(Alexandra Krížová, "Governed Epistemic Transitions," first edition 2026;
dissertation peer reviewer Jeff Highman). Not the dissertation's reference
implementation — the smallest honest sketch of its load-bearing ideas,
sized for this project's start-small agreement: standard library only,
in-memory sqlite, written to be read top to bottom.

- `sentinel.py` — the framework: one append-only record type whose
  immutability the storage layer enforces rather than our manners,
  derived-not-stored reads, and the Sentinel Principle (no claim promotes
  itself),
  held at three boundaries. At the entrance, how easily a claim got in is
  measured and kept out of what its promotion costs. At promotion,
  acceptance is counted in independent actors and priced by consequence.
  At the exit, closure is a constructor (an unclosed case is not an
  object that exists), an episode is a set of claims named by all of
  them, and stopping costs answers from outside — from as many distinct
  voices as the episode's heaviest act would cost to promote, with how
  settled it feels raising that bill and never paying it. A frame may
  declare, through a person and with a written reason, that its warrant
  descends: professions are then taken on credit and settled at the exit,
  and where the instrument has no applicable test it says OUT OF SCOPE
  rather than FAIL. What the record cannot say about how a claim got in it
  charges for, because a discount for not being weighed is one anybody can
  take. Past the exit there is one rung more: an episode that closes on an
  action opens an obligation the record keeps derivable until the world
  pays it — conduct attested by a voice other than the doer, or a person
  laying the deed down in writing. Nothing expires.
- `demo.py` — a round trip through the ideas. Run:
  `python3 framework/demo.py`

After any change here: `python3 experiments/check.py` — thirteen guards,
each of which has already caught this code out at least once.

The axiom, from the dissertation, held to throughout:

> Trust is the discipline of preventing inference from becoming evidence.
