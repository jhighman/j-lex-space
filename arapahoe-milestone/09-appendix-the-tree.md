# Appendix — the tree, and how to run it

Everything below is in `github.com/jhighman/j-lex-space` and runs with no
install of any kind: Python 3, Ruby 2.6 or later, and Node for one file.

| Path | What it is |
|---|---|
| `framework/sentinel.py` | the instrument — ledger, roster, warrant, closure |
| `experiments/` | 18 guards and 3 surveys, one command |
| `FINDINGS.md` | failures first, at the same length as the successes |
| `ARAPAHOE-READING.md` | the reading, with a *Since built* note at each observation |
| `signal-boundary/spec/` | the Ruby the two papers cite |
| `signal-boundary/ts/` | the guard round zero is about |
| `signal-boundary/whitepaper*/` | both papers, Markdown plus `build.sh` |

```sh
python3 experiments/check.py            # 18 guards; non-zero if one has moved
ruby signal-boundary/spec/boundary_test.rb
ruby signal-boundary/spec/sealed_carrier_test.rb
ruby signal-boundary/spec/death_modes_test.rb
node signal-boundary/ts/check.ts
```

The five guards added for this work:

| Guard | Question | Checks |
|---|---|---|
| `envelope.py` | does a gate keep the refusals it hands out? | 13 |
| `weight.py` | does a transaction pay for what it reaches? | 9 |
| `canon.py` | is the Canon it was judged against derived, or believed? | 14 |
| `outlives.py` | what does a released action leave live when the releaser dies? | 14 |
| `vocabulary.py` | does the reservation reach the transaction surfaces? | extended |

Seven commits carried this work, against a repository that stood at
fifty-nine. Forty-three files changed, four thousand two hundred and
sixty-seven lines added, one removed.

The papers are not built into the tree. This repository holds that manuscripts
are not source and that where a document appears is a publication decision;
`build.sh` in each paper folder regenerates them with pandoc, and a LaTeX
engine for the PDF.

## What a reader should not take from this document

Every result here was measured on one runtime — Ruby 2.6.10 and Python 3 on
arm64-darwin — and against translations written for the occasion. Two
termination modes in the signal-boundary work are reasoned rather than
measured. The transfer of those arguments to other languages is asserted and
untested. Sections 4 and 8 describe an architecture nobody has built yet.

The one number worth carrying out of here is the one the reading could not
produce: **ninety-nine refusals, zero rows.** Everything else is a shape.
