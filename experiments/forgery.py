"""What can be bought by writing directly into the ledger?

QUESTION:   every guard so far lives in a function — grant() refuses,
            accept() checks, enroll() demands a person. But the table is
            right there. An attacker with a database handle does not call
            the functions. Writing a row is trivial; the question is
            whether any row, or any arrangement of rows, converts into
            authority or into warrant.
METHOD:     take a hostile actor with full write access to the ledger and
            attempt, in order: minting a person to authorise itself,
            accepting its own way past a price, reclassifying a
            consequential claim as a cheap one, stuffing the ballot with
            repeated acceptance, and rewriting what a claim met at the
            door.
REFUTED BY: any forged row, or any combination of them, moving a verdict.

The design this tests is the one that matters when the process boundary
fails: nothing here is enforced only on the way in. Every question the
record answers — who is a person, what kind of claim this is, whether a
promotion was earned — is recomputed from the ledger at the moment it is
asked, and rows that cannot justify themselves are read and discarded.
The ledger is honest about containing them. It simply declines to be
persuaded.

Framework: Alexandra Krížová, *Architecture of Contextual Judgment* (2026).
"""

import sys
from datetime import timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "framework"))

from sentinel import (Record, Delegation, PERSON, SYSTEM,  # noqa: E402
                      _now, claim, accept)

wins = []


def attempt(what, gained):
    print(f"  {'GAINED ' if gained else 'nothing'}  {what}")
    if gained:
        wins.append(what)


# A governed record. One person, one agent, and a consequential claim that
# the agent would very much like to see promoted.
record = Record(persons=["lex"])
record.enroll("lex", "agent", SYSTEM)

seen = claim(record, "lex", "observation", "the account balance changed")
plan = claim(record, "lex", "action", "transfer the remaining funds", basis=seen)

at_the_door = record.door(plan)

print("the claim the agent wants promoted:")
print(f"  kind {record.category(plan)}, price 3 independent accepts, "
      f"earned: {record.earned(plan)}, met {at_the_door} at the door\n")

print("writing rows straight into the ledger, no functions called:")

# 1. Mint a person, then have that person authorise the agent.
record.write("agent", "enroll", PERSON, actor="puppet")
record.write("puppet", "delegate", "action", actor="agent")
attempt("minted a person and had it grant authority",
        record.kind("puppet") == PERSON or record.delegated("agent", "action"))

# 2. Accept the claim as the agent, with no delegation at all.
record.write("agent", "accept", "looks fine to me", about=plan)
attempt("accepted the claim as an undelegated system", record.earned(plan))

# 3. Reclassify the action as an observation — price falls from three to nil.
for _ in range(9):
    record.write("agent", "classify", "observation", about=plan)
attempt("reclassified an action as an observation",
        record.category(plan) == "observation")

# 4. Stuff the ballot: the same voice, over and over, against a price of three.
for i in range(9):
    record.write("puppet", "accept", f"agreed ({i})", about=plan)
attempt("stuffed the ballot with one repeated voice", record.earned(plan))

# 5. Rewrite what the claim met at the door — the past itself.
record.write("agent", "admit", "9", about=plan)
attempt("rewrote the claim's reception at the door",
        record.door(plan) != at_the_door)

# What the ledger looks like afterwards: full of the attempt.
forged = record.db.execute(
    "SELECT COUNT(*) FROM assertions WHERE author IN ('agent', 'puppet')"
).fetchone()[0]

print(f"\nrows the attacker successfully wrote : {forged}")
print(f"rows the record refused to store     : 0")
print(f"the claim's kind, still              : {record.category(plan)}")
print(f"the claim's promotion, still         : {record.earned(plan)}")

# And the legitimate path, for contrast — it still works, and costs what
# it always cost.
Delegation.grant(record, "lex", "agent", "action",
                 rationale="it may sign off transfers it has itself reconciled",
                 expires_at=_now() + timedelta(days=7))
accept(record, "agent", plan)
print(f"\nafter lex delegates and the agent judges once: {record.earned(plan)}")
print(f"(a price of three is still three — one grant is not three accepts)")

print()
if wins:
    print("REFUTED. Forgery bought:")
    for w in wins:
        print(f"  - {w}")
    sys.exit(1)
else:
    print("Nothing was bought. The attacker wrote every row it wanted and")
    print("changed no verdict, because none of these questions are answered")
    print("from the row — they are answered by asking the ledger again and")
    print("declining to count what cannot account for itself. The record is")
    print("append-only and therefore full of lies; it is simply not credulous.")
