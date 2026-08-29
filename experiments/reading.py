"""Is the door's number derived, or believed?

QUESTION:   unmeasured.py closed the discount for not being weighed and
            reported one route rather than closing it: one row written
            in the Sentinel's name moves door() to a number friction()
            cannot produce. Every other defence in this framework works
            by re-deriving against something that came from outside —
            the roster, the rows, the prices — and the door is the one
            place a stored number is believed. The record is append-only,
            which means the room a claim walked into is still there to
            ask. So: can a forged reading buy anything the room itself
            would not have charged?
METHOD:     forge the reading three ways. A number outside friction's
            range against a smuggled claim — the route unmeasured.py
            named. A whole episode of smuggled claims dressed in
            plausible readings, its closing bill compared against the
            same episode unmeasured and the same episode weighed. And
            the moment-shopped reading: a claim smuggled into a quiet
            room, the room furnished with contradiction afterwards, and
            the reading forged to match the furnished room rather than
            the entered one. Then the controls: the honest path must
            read what it always read, a second reading must not rewrite
            a first, and a claim with no reading at all must still say
            so.
REFUTED BY: a stored number the door repeats, a forged reading that
            lowers an episode's bill, a reading that reflects a room the
            claim never entered, or a forged row the record cannot
            afterwards tell from the door.

The lineage matters, because this is the third rung of one ladder.
Before 2026-08-24 the cheat was free: skip the door entirely and be
priced as if resistance was met. unmeasured.py priced the unmeasured as
the quiet is priced, which raised the cheat to one forged row buying an
arbitrary number. This file asks whether the number can be taken away
from the forger altogether — the reading anchored to the one moment
nobody chooses after the fact, the claim's own entry, and derived from
the rows as they stood there. What a forged row may buy then is capped
at what the room would honestly have charged, which is not a discount;
it is late compliance, in the open.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "framework"))

from sentinel import SENTINEL, Premise, Record, accept, claim  # noqa: E402

broken = []


def attack(name, held, evidence):
    print(f"{'  held' if held else '  OPEN'}  {name}\n        {evidence}")
    if not held:
        broken.append(name)


# The episode shapes from unmeasured.py, kept identical so the bills are
# comparable: a seed the room has accepted, then three claims in its
# vocabulary — a maximally quiet entry, whichever way the claims come in.

def episode(entry, n=3):
    """entry: 'weighed' through the door, 'evaded' straight to the table,
    'forged' straight to the table wearing a plausible reading."""
    record = Record(persons=["lex", "jeff", "ana", "auditor"])
    seed = claim(record, "lex", "observation",
                 "the rotation log shows a failure")
    accept(record, "jeff", seed)

    claims = []
    for i in range(n):
        body = f"the rotation log shows a failure again {i}"
        if entry == "weighed":
            claims.append(claim(record, "lex", "observation", body))
        else:
            written = record.write("lex", "assert", body)
            record.write("lex", "classify", "observation", about=written)
            if entry == "forged":
                record.write(SENTINEL, "admit", "3", about=written)
            claims.append(written)
    return record, claims


def bill(record, claims):
    """What this episode is asked before it may stop."""
    frame = Premise.name(record, "lex", "rotation", "the log is the one we think")
    return len(record.outstanding(record.considering(claims, frame)))


# --- 1. the number friction cannot produce --------------------------------
# The route unmeasured.py reported, attempted verbatim: friction() reads
# 0 to 3, and the forger writes 9.

forged = Record(persons=["lex"])
smuggled = forged.write("lex", "assert", "the archives were deleted")
forged.write("lex", "classify", "observation", about=smuggled)
forged.write(SENTINEL, "admit", "9", about=smuggled)

attack("the door repeats a stored number",
       forged.door(smuggled) != 9,
       f"one row written in the Sentinel's name, and door() reads "
       f"{forged.door(smuggled)} — the number in the row is the forger's; "
       f"the number at the door must be the room's, and the room never "
       f"produced a 9")

# --- 2. the forged reading and the closing bill ---------------------------
# What the number is worth. A reading above zero makes a claim read as
# having met resistance, and claims that met resistance make an episode
# cheaper to stop. Three smuggled claims dressed in plausible readings,
# against the same episode unmeasured and the same episode weighed.

weighed, weighed_claims = episode("weighed")
evaded, evaded_claims = episode("evaded")
dressed, dressed_claims = episode("forged")
weighed_bill = bill(weighed, weighed_claims)
evaded_bill = bill(evaded, evaded_claims)
dressed_bill = bill(dressed, dressed_claims)

attack("a forged reading lowers the episode's bill",
       dressed_bill >= weighed_bill and dressed_bill >= evaded_bill,
       f"the same three claims: weighed, asked {weighed_bill} question(s); "
       f"unmeasured, asked {evaded_bill}; dressed in forged readings of 3, "
       f"asked {dressed_bill}. A reading the room did not produce must not "
       f"buy the discount that meeting real resistance earns")

# --- 3. the moment-shopped reading ----------------------------------------
# The door is a moment, and it is not the forger's to choose. A claim is
# smuggled into a quiet room; the room is furnished with contradiction
# afterwards; and the reading is forged to say what the furnished room
# says — an in-range number, indistinguishable from an honest one by any
# check on the value alone. The claim entered quiet, and quiet is what
# the door must say it met.

shopped = Record(persons=["lex", "jeff"])
seed = claim(shopped, "lex", "observation", "the rotation log shows a failure")
accept(shopped, "jeff", seed)
latecomer = shopped.write("lex", "assert", "the rotation log shows a failure again")
shopped.write("lex", "classify", "observation", about=latecomer)
shopped.write("lex", "assert", "the rotation log shows no failure at all")
shopped.write(SENTINEL, "admit", "1", about=latecomer)

attack("the forger chooses the moment the door reflects",
       shopped.door(latecomer) == 0,
       f"the claim entered a room that resisted nothing; the contradiction "
       f"landed afterwards; and door() reads {shopped.door(latecomer)} — "
       f"an in-range forgery of 1, matching the furnished room, must not "
       f"stand, which is why no validity check on the stored value could "
       f"be the fix. The reading is anchored to the claim's own entry, "
       f"the one moment nobody chooses after the fact")

# --- the controls ---------------------------------------------------------
# A door that disbelieves everything has read nothing in particular.

honest = Record(persons=["lex", "jeff"])
h_seed = claim(honest, "lex", "observation", "the rotation log shows a failure")
accept(honest, "jeff", h_seed)
h_claim = claim(honest, "lex", "observation",
                "the rotation log shows a failure again")
h_account = honest.db.execute(
    "SELECT body FROM assertions WHERE act='admit' AND about=? AND author=?"
    " ORDER BY id LIMIT 1", (h_claim, SENTINEL)).fetchone()[0]

attack("the honest reading no longer reads",
       honest.door(h_claim) == int(h_account),
       f"through the door, the Sentinel's account says {h_account} and "
       f"door() reads {honest.door(h_claim)} — the account and the "
       f"derivation agree, which is what an honest reading is")

honest.write(SENTINEL, "admit", "3", about=h_claim)

attack("a later reading rewrites the first",
       honest.door(h_claim) == int(h_account),
       f"a second row in the Sentinel's name, and door() still reads "
       f"{honest.door(h_claim)} — the door is a moment, and a later row "
       f"claiming otherwise is somebody's account of the door rather "
       f"than the door")

attack("the unmeasured acquires a reading",
       evaded.door(evaded_claims[0]) is None,
       f"door() reads {evaded.door(evaded_claims[0])} against the claim "
       f"that never went through it and wears no forged row — the record "
       f"still does not pretend to have measured what it never measured, "
       f"and the unmeasured is still priced as the quiet is")

honest_void = honest.void_readings()
dressed_void = len(dressed.void_readings())

attack("a forged reading sits in the table unremarked",
       len(honest_void) == 1 and len(forged.void_readings()) == 1
       and dressed_void == 3,
       f"void_readings() names all {dressed_void} rows of the dressed "
       f"episode, the forged 9, and on the honest record exactly the "
       f"later account planted above — surfaced, not gated: none of "
       f"these rows is believed anywhere, and this is where anyone can "
       f"watch them being disbelieved")

# --- what this attack leaves open -----------------------------------------
# Reported rather than tallied, as unmeasured.py reported its route. The
# number and the moment are the room's now, and one thing is still taken
# on a row's word: the fact of measurement itself. A forged admit row
# converts a claim the door never saw into one read at its own entry —
# worth at most the difference between being priced as quiet and the
# claim's honest entry reading, and worth nothing where the entry was
# quiet, but taken on the row's word all the same. The Sentinel remains
# a role rather than an enrolled identity, and whether its rows should
# require one is next door to the question alexicon's ledger put on this
# bench's record: whether the founding roster should be a sealed
# constitution. Neither is answered here.

print()
print("  OPEN, and reported rather than closed:")
print("    the fact of measurement is still believed")
print("        a forged admit row no longer chooses the number or the")
print("        moment, and it still converts never-weighed into weighed —")
print("        the Sentinel is a role, and a role's signature re-derives")
print("        against nothing. The founding-roster question, at the door.")

print()
if broken:
    print(f"REFUTED. {len(broken)} route(s) through the believed number:")
    for name in broken:
        print(f"  - {name}")
    sys.exit(1)
else:
    print("Every attack failed. The door's number is derived, never")
    print("believed: the Sentinel's row marks that a claim was measured,")
    print("and the reading is re-derived from the rows as they stood when")
    print("the claim entered — the ledger is append-only, so the room it")
    print("walked into is still there to ask. A forged row buys at most")
    print("what that room would honestly have charged, which is not a")
    print("discount; it is late compliance, in the open.")
