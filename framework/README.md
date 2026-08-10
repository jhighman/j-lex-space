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

- `sentinel.py` — the framework: one immutable record type, derived-not-
  stored reads, the Sentinel Principle (no claim promotes itself), and
  closure as constructor (an unclosed case is not an object that exists).
- `demo.py` — a round trip through all of it. Run:
  `python3 framework/demo.py`

The axiom, from the dissertation, held to throughout:

> Trust is the discipline of preventing inference from becoming evidence.
