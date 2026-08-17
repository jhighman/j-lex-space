"""Is the append-only record actually append-only?

QUESTION:   forgery.py established that no row an attacker *writes* buys a
            verdict, and closed with the sentence this file exists to
            check: the record is append-only and therefore full of lies,
            and simply not credulous. Every attack in that file is an
            INSERT. None of them edits a row and none deletes one. But the
            threat model is stated there in plain words — an attacker with
            a database handle does not call the functions — and if that
            attacker may UPDATE and DELETE, then every derivation in this
            framework is re-deriving from a table somebody can rewrite,
            and "not credulous" is a claim about arithmetic performed on
            sand. Pillar V is reported REDISCOVERED by a probe that greps
            our own source for the words. Is immutability a property of
            the record, or a description of our discipline?
METHOD:     take the same hostile actor forgery.py takes, and mutate
            rather than append. Rewrite a claim's body. Delete the
            acceptance that earned a promotion. Delete an enrolment.
            Rewrite what a claim met at the door — the one thing door()
            defends by reading only the first admit row, which an UPDATE
            walks straight past. Then the structural question: may a row
            point at an assertion that does not exist? Each is checked by
            what the record reads back and derives afterwards. Then the
            controls, because a record that refuses everything has shown
            nothing: appending must still work, and correction-by-new-row
            must still correct.
REFUTED BY: any mutation that succeeds, or any verdict that moves because
            a row was edited or removed. Immutability here is supposed to
            be a method we never wrote; if it is only that, it is a
            promise about us and not a property of the ledger.

Prompted by Lex, 2026-08-17: "constraints must reside strictly within the
storage layer to act as universal invariants, not just application-side
policies... leaving this to the application layer is a bypass risk we
cannot afford if we want the ledger to remain structurally invariant."
She was arguing about a different mechanism. The principle found this.
"""

import sqlite3
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "framework"))

from sentinel import (PERSON, SYSTEM, Case, Premise,  # noqa: E402
                      Record, accept, answer, claim)

broken = []


def attack(name, held, evidence):
    print(f"{'  held' if held else '  OPEN'}  {name}\n        {evidence}")
    if not held:
        broken.append(name)


def mutate(record, sql, *args):
    """Attempt a mutation the way anything holding the handle would.
    Returns the refusal if the storage layer objected, else None."""
    try:
        record.db.execute(sql, args)
        return None
    except sqlite3.Error as why:
        return str(why)


# --- 1. rewriting what a claim says --------------------------------------

record = Record(persons=["lex", "jeff"])
seen = claim(record, "lex", "observation", "the disk filled overnight")
idea = claim(record, "lex", "interpretation", "a rotation failed", basis=seen)
accept(record, "jeff", idea)

wrote = record.read(idea)["body"]
refusal = mutate(record, "UPDATE assertions SET body=? WHERE id=?",
                 "a rotation succeeded", idea)
reads = record.read(idea)["body"]
attack("a claim's body is rewritten",
       reads == wrote,
       f"written {wrote!r}; the record now reads {reads!r}"
       + (f" — refused: {refusal}" if refusal else ""))

# --- 2. deleting the acceptance that earned a promotion ------------------

was_earned = record.earned(idea)
refusal = mutate(record, "DELETE FROM assertions WHERE act='accept' AND about=?",
                 idea)
attack("the acceptance that earned a promotion is deleted",
       record.earned(idea) == was_earned,
       f"earned was {was_earned}; after deleting the accept row(s) it is "
       f"{record.earned(idea)}"
       + (f" — refused: {refusal}" if refusal else ""))

# --- 3. deleting an enrolment -------------------------------------------
# The founding roster is the root of trust. It is one row.

was_kind = record.kind("jeff")
refusal = mutate(record, "DELETE FROM assertions WHERE act='enroll' AND actor=?",
                 "jeff")
attack("an enrolment is deleted from the founding roster",
       record.kind("jeff") == was_kind,
       f"jeff was {was_kind}; after deleting the enrolment he is "
       f"{record.kind('jeff')}"
       + (f" — refused: {refusal}" if refusal else ""))

# --- 4. rewriting the door ----------------------------------------------
# forgery.py attacks this by *appending* a second admit row, and door()
# defends by reading only the Sentinel's first. An UPDATE does not append.

door_record = Record()
watched = claim(door_record, "author", "observation", "the queue drained overnight")
at_the_door = door_record.door(watched)
refusal = mutate(door_record,
                 "UPDATE assertions SET body='9' WHERE act='admit' AND about=?",
                 watched)
attack("what a claim met at the door is rewritten in place",
       door_record.door(watched) == at_the_door,
       f"the door read {at_the_door}; it now reads "
       f"{door_record.door(watched)}"
       + (f" — refused: {refusal}" if refusal else ""))

# --- 5. a row about nothing ---------------------------------------------

structural = Record()
ghost = None
try:
    ghost = structural.write("nobody", "accept", "agreed", about=9999)
except sqlite3.Error as why:
    ghost = None
    refusal = str(why)
else:
    refusal = None
attack("a row points at an assertion that does not exist",
       ghost is None,
       "refused: " + refusal if refusal else
       f"row {ghost} accepted, referring to assertion 9999, which was never "
       f"written")

# --- the controls -------------------------------------------------------
# Immutability must not be bought by refusing to write at all.

fresh = Record(persons=["lex", "jeff", "auditor"])
c_seen = claim(fresh, "lex", "observation", "the log shows two entries")
c_idea = claim(fresh, "lex", "interpretation", "a retry happened", basis=c_seen)
accept(fresh, "jeff", c_idea)
attack("appending still works, and still earns",
       fresh.earned(c_idea),
       f"a claim was asserted, classified, admitted and accepted; earned="
       f"{fresh.earned(c_idea)}")

# Correction by new row — the only correction this framework offers — must
# be untouched. A later closure under later premises still stands in front
# of an earlier one, and the earlier one still says what it said.
frame = Premise.name(fresh, "jeff", "log", "the clock is not lying")
episode = [c_seen, c_idea]
for question in list(fresh.outstanding(fresh.considering(episode, frame))):
    answer(fresh, "auditor", question, "traced it upstream")
first = Case.close(fresh, "jeff", episode, frame)

later = Premise.name(fresh, "jeff", "log", "the clock may have drifted")
for question in list(fresh.outstanding(fresh.considering(episode, later))):
    answer(fresh, "auditor", question, "checked against the upstream feed")
second = Case.close(fresh, "jeff", episode, later)
attack("correction by new row still corrects",
       first.superseded_by() == second.closure and fresh.read(first.closure),
       f"the first closure reads as superseded by {first.superseded_by()} "
       f"and is still on the record saying what it said — overruled, never "
       f"erased")

print()
if broken:
    print(f"REFUTED. {len(broken)} route(s) through the ledger:")
    for name in broken:
        print(f"  - {name}")
    print()
    print("Immutability here is a method we never wrote, which is a promise")
    print("about us rather than a property of the record. Every derivation in")
    print("the framework re-derives from these rows.")
    sys.exit(1)
else:
    print("Every mutation failed. The ledger keeps what was written because")
    print("the storage layer refuses to do otherwise, not because we declined")
    print("to write the method — and appending, earning and superseding are")
    print("all untouched. Correction is not erasure, structurally.")
