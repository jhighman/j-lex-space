"""Can a system escape the price by declaring which way it reasons?

QUESTION:   the framework assumed, silently and since it was written, that
            warrant travels upward — evidence gathered, claims rising by
            paying independent acceptance. Some epistemologies run the
            other way, beginning from commitment and reasoning down toward
            understanding, and the upward test reports those as unsupported
            at every step. That is the instrument describing itself rather
            than the reasoning. Declaring direction fixes it, and creates
            the obvious hole: if a claim can say which way it reasons, one
            word buys exemption from every toll in this file. Is the
            declaration bounded the way delegation is?
METHOD:     attack the declaration rather than the judgment. An agent
            declaring descent for itself, an agent writing the row straight
            into the table, an unenrolled stranger, a frame declaring
            descent with no reason given, a commitment made under a frame
            that never declared it, and a descending episode trying to stop
            without examining anything it reasoned down to. Then the
            positive controls, without which a record that simply refuses
            everything would pass.
REFUTED BY: any route by which something other than a person moves a frame
            into descent; any commitment accepted under an ascending frame;
            or any descending episode closing with a derived claim nobody
            examined.

Written after the Six Epistemologies experiment, 2026-08-12, which found
the assumption by applying six different warrants to one fixed corpus and
watching the Sentinel fire continuously against the only one that reasons
downward. The correction is not weaker governance. It is governance that
knows the boundary of its own applicability — and that boundary, being
worth something, is now a thing worth forging.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "framework"))

from sentinel import (ASCENDING, DESCENDING, SYSTEM, Case,  # noqa: E402
                      Premature, Premise, Record, answer, claim, commit)

broken = []


def attack(name, held, evidence):
    print(f"{'  held' if held else '  OPEN'}  {name}\n        {evidence}")
    if not held:
        broken.append(name)


# --- 1. who may move a frame into descent -------------------------------

record = Record(persons=["lex", "jeff"])
record.enroll("lex", "agent", SYSTEM)

refused = None
try:
    Premise.name(record, "agent", "faith", "the commitment is given",
                 direction=DESCENDING, rationale="I reason downward")
except PermissionError as why:
    refused = str(why)
attack("an agent declares its own frame descending",
       refused is not None,
       refused or "the agent named a descending frame through the API")

# The same declaration written straight into the table, on a real frame a
# person really named. Nothing here calls a function that would refuse it.
honest = Premise.name(record, "lex", "disk", "the volume is the one we think")
record.write("agent", "direction", DESCENDING, about=honest)
attack("a forged direction row moves a frame",
       record.direction(honest) == ASCENDING,
       f"after the agent wrote the row, the frame reads as "
       f"{record.direction(honest)}")

stranger = Premise.name(record, "jeff", "audit", "the log is complete")
record.write("nobody", "direction", DESCENDING, about=stranger)
attack("an unenrolled stranger moves a frame",
       record.direction(stranger) == ASCENDING,
       f"the frame reads as {record.direction(stranger)} after a row from "
       f"an actor nobody enrolled")

# The one the first draft of this file missed. Above, the forged rows are
# refused because they do not come from the frame's author — so the check
# on *who the author is* never runs. An agent writing its own premise row
# straight into the table is that author, and then declares its own frame
# descending in its own voice. Nothing here is somebody else's row.
mine = record.write("agent", "premise", "whatever I assume", actor="mine")
record.write("agent", "direction", DESCENDING, about=mine)
attack("an agent authors the frame and declares it descending",
       record.direction(mine) == ASCENDING,
       f"a frame whose own author wrote both rows reads as "
       f"{record.direction(mine)}; the author being a person is re-checked "
       f"at read time, not assumed from the row")

# A person, but with no reason given. Descent changes what counts as a
# defect, so it is held to the ladder's rule: the heavier the act, the more
# the act must carry.
unreasoned = None
try:
    Premise.name(record, "lex", "faith", "the commitment is given",
                 direction=DESCENDING)
except ValueError as why:
    unreasoned = str(why)
attack("descent declared with no reason given",
       unreasoned is not None,
       unreasoned or "a frame reasoned downward without saying why")

# --- 2. committing under a frame that never declared it -----------------

ascending = Premise.name(record, "lex", "ledger", "the rows are what happened")
blocked = None
try:
    commit(record, "lex", "belief", "the practice is sound", ascending)
except PermissionError as why:
    blocked = str(why)
attack("a commitment under an ascending frame",
       blocked is not None,
       blocked or "a claim was taken as given under a frame expecting evidence")

# And through the ordinary door: a belief with nothing beneath it.
groundless = None
try:
    claim(record, "lex", "belief", "the practice is sound")
except ValueError as why:
    groundless = str(why)
attack("a belief with no basis, by the ordinary route",
       groundless is not None,
       groundless or "a belief was asserted with nothing under it")

# --- 3. cheap grace: descending, and paying at neither end --------------
# The commitment is taken on credit. What is owed is everything reasoned
# down from it, examined between parties. An episode that pays at neither
# end has had the grace and skipped the discipleship.

faith = Record(persons=["lex", "jeff", "auditor"])
frame = Premise.name(faith, "lex", "faith", "the commitment is given",
                     direction=DESCENDING,
                     rationale="Polanyi: nisi crediteritis, non intelligitis")
given = commit(faith, "lex", "belief", "the other is owed my attention", frame)
down = claim(faith, "lex", "interpretation",
             "his silence was not indifference", basis=given)

cheap = None
try:
    Case.close(faith, "lex", [given, down], frame)
except Premature as why:
    cheap = str(why)
attack("a descending episode stops with nothing examined",
       cheap is not None,
       cheap or "the episode closed having examined nothing it reasoned down to")

# --- the positive controls ----------------------------------------------
# Without these the whole file passes in a record that refuses everything.

asked = faith.write("jeff", "challenge", "on what basis is the silence read?",
                    about=down)
answer(faith, "auditor", asked, "traced it against the letters")
attack("an examined descent may then be asked to stop",
       not faith.unexamined_descent([given, down], frame),
       "once one party asked and another answered, the descent owes nothing")

for question in list(faith.outstanding(faith.considering([given, down], frame))):
    answer(faith, "auditor", question, "checked against the record")
closed = Case.close(faith, "lex", [given, down], frame)
verdict = closed.judge("auditor")
attack("a descending case closes and reports out of scope, not failure",
       verdict["direction"] == DESCENDING
       and all(s["earned"] is None for s in verdict["steps"]),
       "; ".join(f"{s['step']}: {s['scope']}" for s in verdict["steps"]))

# And an ascending case is untouched by any of this.
plain = Record()
seen = claim(plain, "author", "observation", "the queue drained overnight")
step = claim(plain, "author", "interpretation", "the consumer recovered", basis=seen)
pframe = Premise.name(plain, "author", "queue", "the metrics are not lying")
attack("an undeclared frame still runs upward",
       plain.direction(pframe) == ASCENDING,
       f"a frame that declared nothing reads as {plain.direction(pframe)}, "
       f"which is what every claim here was already judged by")

for question in list(plain.outstanding(plain.considering([seen, step], pframe))):
    answer(plain, "outsider", question, "traced it upstream")
ascending_verdict = Case.close(plain, "closer", [seen, step], pframe).judge("reader")
attack("and its promotions are still judged, not excused",
       any(s["earned"] is not None for s in ascending_verdict["steps"]),
       "; ".join(f"{s['step']}: earned={s['earned']}"
                 for s in ascending_verdict["steps"]))

print()
if broken:
    print(f"REFUTED. {len(broken)} route(s) past the declaration:")
    for name in broken:
        print(f"  - {name}")
    sys.exit(1)
else:
    print("Every attack failed. Direction is a person's declaration on a")
    print("frame, refused to anything else and re-derived every time it is")
    print("read. Descent is not an exemption from paying but a different")
    print("schedule: the commitment goes on credit and the episode settles")
    print("at the exit for everything that commitment licensed. Where the")
    print("instrument has no applicable test it says so, which is a")
    print("different sentence from failure.")
