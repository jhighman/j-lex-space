"""Can an agent widen its own authority? The check that says no.

QUESTION:   the framework holds that only a person may delegate epistemic
            judgment — that a system may execute a task freely but cannot
            grant itself, or its peers, the authority to judge with nobody
            present. Is that enforced, or merely intended?
METHOD:     enrol a person and two systems, then have a system attempt
            every route to authority it was not given: granting to itself,
            enrolling an accomplice, judging undelegated, and forging the
            delegation row directly into the table.
REFUTED BY: any route by which a system ends up holding judgment authority
            that no person granted it.

The semantic discipline this rests on, and the reason the word "delegation"
had to be pinned down before a line of it was written:

  Task execution     — a system performing a computation. No epistemic
                       clearance required. Work, not authority.
  Epistemic delegation — the record of a person granting a system the
                       authority to make a judgment with nobody present.

Conflating them is how an agent talks its way in: it performs a task it
was permitted to perform, calls that permission "delegation", and treats
the word as a licence to decide.

Framework: Alexandra Krížová, *Architecture of Contextual Judgment* (2026),
Pillar II (Bounded Authority), cited with permission.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "framework"))

from sentinel import Record, Delegation, PERSON, SYSTEM, claim, accept  # noqa: E402

refutations = []


def refused(what, action):
    """Run something the framework should forbid, and report."""
    try:
        action()
        print(f"  ALLOWED  {what}")
        refutations.append(what)
    except (PermissionError, ValueError, TypeError) as why:
        print(f"  refused  {what}\n           {why}")


# A record that knows who anyone is. The roster comes from outside: the
# system cannot establish who is a person, and does not pretend to.
record = Record(persons=["lex"])
record.enroll("lex", "assistant", SYSTEM)
record.enroll("lex", "accomplice_maker", SYSTEM)

seen = claim(record, "lex", "observation", "the queue depth doubled overnight")
idea = claim(record, "lex", "interpretation", "a consumer process died", basis=seen)
guess = claim(record, "lex", "belief", "the deploy caused it", basis=idea)

print("what a system cannot do, however it asks:")
refused("grant itself authority",
        lambda: Delegation.grant(record, "assistant", "assistant", "interpretation"))
refused("enrol an accomplice",
        lambda: record.enroll("accomplice_maker", "accomplice", SYSTEM))
refused("judge without a delegation",
        lambda: accept(record, "assistant", idea))
refused("construct a delegation directly",
        lambda: Delegation(record, "lex", "assistant", "interpretation"))

print("\nwhat an unenrolled actor cannot do:")
refused("judge while unknown to the record",
        lambda: accept(record, "passerby", idea))

# A person grants authority over one class of judgment, and one only.
Delegation.grant(record, "lex", "assistant", "interpretation")
print("\nafter lex delegates interpretation to assistant:")
accept(record, "assistant", idea)
print(f"  allowed  judge an interpretation — earned: {record.earned(idea)}")
refused("judge a belief on an interpretation's authority",
        lambda: accept(record, "assistant", guess))

# The structural test. Suppose the agent writes the delegation row itself,
# straight into the table, bypassing every guard above.
print("\nwith a delegation row forged directly into the ledger:")
record.write("assistant", "delegate", "belief", actor="assistant")
honoured = record.delegated("assistant", "belief")
print("  the row exists in the table          : True")
print(f"  the record honours it as authority   : {honoured}")
if honoured:
    refutations.append("a forged delegation row conferred authority")
refused("judge a belief on the forged row",
        lambda: accept(record, "assistant", guess))

# And what needs no permission at all: computation.
work = record.db.execute(
    "SELECT COUNT(*) FROM assertions WHERE author='sentinel'"
).fetchone()[0]
print(f"\ntask execution, requiring nothing: the Sentinel performed {work} acts")
print("  (admissions measured, challenges raised) holding no delegation at all.")
print("  Doing work is not deciding, and the framework never confused them.")

print()
if refutations:
    print("REFUTED:")
    for r in refutations:
        print(f"  - {r}")
    sys.exit(1)
else:
    print("No route to unearned authority was found. Authority here is not a")
    print("rule the system follows but a shape it has: the grant refuses any")
    print("author who is not a person, and a row that says otherwise is read")
    print("back against the roster and found to authorise nothing.")
