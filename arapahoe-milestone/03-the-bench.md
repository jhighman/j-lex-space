# The bench, for a reader arriving cold

`j-lex-space` is a public writing repository. Lex is writing a book about
learning to build software from nothing; Jeff is its peer reviewer. Alongside
the book sits an instrument: a small framework that tries to make one
discipline structural rather than aspirational.

**Trust is the discipline of preventing inference from becoming evidence.**
Everything below is that sentence, built.

## What is in it

`framework/sentinel.py` is seventeen hundred lines over an append-only SQLite
ledger. Claims enter; judgments about claims are themselves rows; nothing is
ever edited or deleted, because the table refuses — correction is a new row
that a derivation prefers. Actors are enrolled, authority is granted with an
expiry, and an episode may stop only when questions raised against it have
been answered from outside itself.

`experiments/` is where the instrument gets attacked. Eighteen guards and
three surveys run from one command, `python3 experiments/check.py`, which
exits non-zero the moment a boundary has moved. The guards are not tests of
features. Each one is a question someone tried to answer badly once.

`FINDINGS.md` is seven hundred lines and lists the failures first, at the same
length as the successes, because a project about not promoting inference to
evidence cannot keep a scoreboard that flatters itself.

## The rules that did the work here

Five of the bench's standing commitments turn up throughout this document. In
its own words:

**One word, one act.** Work is *assigned*; authority is *delegated*, and that
word is reserved for the sovereign act alone. A claim is *professed*, never
the other thing, because a reserved word that collides with the commonest verb
in a workshop is a reservation nobody can keep. An episode is *closed*, never
"final" — the refused word turns a stopping point into a truth. `vocabulary.py`
parses the source and fails when a word drifts.

**Nothing is evaluated by the process that produced it.** Four times in six
days the generator and the judge were the same process, and it is what killed
the value layer.

**A refusal nobody can see is indistinguishable from an oversight.** A gate may
decline and may never decline invisibly. A gate at the wall cannot keep its own
refusal ledger, because refusing the row and recording the refusal are one
statement and the rollback takes both.

**Derived, never believed.** A reading of the record is re-computed from the
rows as they stood at the entry of the thing being judged. A stored number is a
row saying X, and a row saying X is not X.

**The absence of a measurement may never lower a cost.** Where the record
cannot say how something got in, it charges as though it got in easily —
established by attack, after an episode written around the entrance was asked
four questions where the same episode through it was asked seven.

## What it has never done

The instrument has no outside. Its ledger is in memory, its acts are claims and
judgments about claims, and nothing it does survives the process that did it.
It has never released anything into a world.

That absence is load-bearing in section 7.
