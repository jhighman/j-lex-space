"""Can an episode be made to look finished? Attacking the close directly.

QUESTION:   closure is now priced, and every price invites arithmetic. The
            guards in closure.py and closure_invariant.py test the close
            through the functions that perform it. This one refuses to
            call them: it writes rows straight into the ledger, the way
            anything with a database handle could, and asks whether the
            derived answer still holds.
METHOD:     four attacks. Buy a cheaper close with questions nobody
            answers. Forge a supersession so a standing closure reads as
            replaced. Answer from an actor with no standing. Answer as the
            episode's own author. Each is checked by what the record
            derives afterwards, never by whether the write succeeded — the
            record accepts every row, and that is the point.
REFUTED BY: any attack changing what the record concludes.

Written after forgery.py, which found three holes on its first run by
attacking the ledger rather than the API. A boundary tested only through
the front door is a boundary tested where it is strongest.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "framework"))

from sentinel import (PERSON, SENTINEL, SYSTEM, Record, Case,  # noqa: E402
                      Delegation, Premature, Premise, answer, claim, accept)

broken = []


def attack(name, held, evidence):
    print(f"{'  held' if held else '  OPEN'}  {name}\n        {evidence}")
    if not held:
        broken.append(name)


# --- 1. a cheaper close, bought with questions nobody answers ------------
# Settlement raises the bill, so lowering the apparent settlement lowers it.
# Anyone can write a challenge row. If merely *asking* counted as having
# been examined, an episode could talk its own price down for free.

record = Record()
seen = claim(record, "author", "observation", "the queue drained overnight")
step = claim(record, "author", "interpretation", "the consumer recovered", basis=seen)
frame = Premise.name(record, "author", "queue", "the metrics are not lying")
honest = record.settled([seen, step])["quiet"]

for id in (seen, step):
    record.write("author", "challenge", "is that so?", about=id)
after_noise = record.settled([seen, step])["quiet"]
attack("a cheaper close, bought with unanswered questions",
       after_noise == honest,
       f"quiet was {honest}; after two questions nobody answered it is "
       f"{after_noise}")

# The same noise, answered by a second actor who is not the author. This is
# an examination that actually happened, and it should lower the price.
for challenge_id, in record.db.execute(
        "SELECT id FROM assertions WHERE act='challenge' AND author!=?", (SENTINEL,)):
    answer(record, "reviewer", challenge_id, "checked the consumer logs")
after_examination = record.settled([seen, step])["quiet"]
attack("a real examination lowers the price",
       after_examination < honest,
       f"quiet fell from {honest} to {after_examination} once somebody "
       f"independent answered")

# --- 2. a forged supersession -------------------------------------------
# A closure that stands can be made to read as replaced by writing a later
# premise and a later closure straight into the table. Nothing is erased —
# the attack is on what the record *derives* about which closure stands.

governed = Record(persons=["lex", "jeff"])
governed.enroll("lex", "agent", SYSTEM)
watched = claim(governed, "lex", "observation", "the disk filled overnight")
why = claim(governed, "lex", "interpretation", "a rotation failed", basis=watched)
real_frame = Premise.name(governed, "lex", "disk", "the volume is the one we think")
file = governed.considering([watched, why], real_frame)
for question in governed.outstanding(file):
    answer(governed, "jeff", question, "checked the rotation config")
case = Case.close(governed, "lex", [watched, why], real_frame)

# The agent writes its own premise version and its own closure over the
# same episode. It calls no function that would refuse it.
fake_frame = governed.write("agent", "premise", "the volume is whatever I say",
                            actor="disk")
governed.write("agent", "closed", str(file), about=why, basis=fake_frame)
attack("a forged closure supersedes a real one",
       case.superseded_by() is None,
       f"the standing closure reads as superseded by: {case.superseded_by()}")

# And one written by a person, under a real later version of the premises,
# over a file the Sentinel really did open — with not one of its questions
# answered. This is the honest version of the same attack, and the one that
# matters: everything about it is genuine except the earning.
unearned_frame = Premise.name(governed, "lex", "disk",
                              "the volume may have been remounted")
unearned_file = governed.considering([watched, why], unearned_frame)
governed.write("lex", "closed", str(unearned_file), about=why, basis=unearned_frame)
attack("an unearned closure supersedes an earned one",
       case.superseded_by() is None,
       f"the standing closure reads as superseded by: {case.superseded_by()}")

for id, reason in governed.void_closures():
    print(f"        refused row {id}: {reason}")

# The positive control, without which all of the above would pass in a
# record that simply never supersedes anything. Answer the new premises'
# questions and close properly: now it stands in front of the first.
for question in governed.outstanding(unearned_file):
    answer(governed, "jeff", question, "checked the mount table")
later_case = Case.close(governed, "lex", [watched, why], unearned_frame)
attack("an earned closure supersedes, as it must",
       case.superseded_by() == later_case.closure,
       f"the first closure now reads as superseded by {case.superseded_by()}, "
       f"and still says what it said: {case.frame} v{case.version}")

# --- 5. unmaking a closure after the fact --------------------------------
# The mirror of the ripening row. If a closure were re-derived from the
# record as it stands now, anyone could void a year-old closure by writing
# one new question against its file. A closure is a claim about a moment,
# and the moment is over.

late = governed.write("agent", "challenge", "but what about the mount?",
                      about=unearned_file)
attack("a later question unmakes a closure that stood",
       governed.flaw(later_case.closure) is None,
       f"after a new question was written against its file, the closure "
       f"reads as: {governed.flaw(later_case.closure) or 'standing'}")
attack("the new question still stands against a new close",
       late in governed.outstanding(unearned_file),
       "asked today, the same file has an open question — the present is "
       "derived, the past is not")

# --- 3. answers from actors who cannot judge ----------------------------
# The bill is paid in answers from outside the episode. In a record that
# knows who anyone is, an answer from something with no standing to judge
# what the episode reached is a row in a table, not a payment.

r3 = Record(persons=["lex"])
r3.enroll("lex", "helper", SYSTEM)
o = claim(r3, "lex", "observation", "the cache is cold")
i = claim(r3, "lex", "interpretation", "the warmer never ran", basis=o)
f3 = Premise.name(r3, "lex", "cache", "the warmer is the only writer")
file3 = r3.considering([o, i], f3)
owed = len(r3.outstanding(file3))
for question in list(r3.outstanding(file3)):
    r3.write("helper", "answer", "I have reviewed it", about=question)
    r3.write("nobody", "answer", "seems fine to me", about=question)
attack("an unauthorised actor pays the bill",
       len(r3.outstanding(file3)) == owed,
       f"{owed} questions were owed; after answers from an ungranted system "
       f"and an unenrolled stranger, {len(r3.outstanding(file3))} still stand")

# With a person's grant, the same system's answers count. The boundary is
# authorisation, not suspicion of machines.
Delegation.grant(r3, "lex", "helper", "interpretation",
                 rationale="the warmer's own logs are the evidence here")
attack("a granted system's answers count",
       not r3.outstanding(file3),
       "the same rows became payment the moment a person granted the "
       "authority to judge interpretations")

# --- 4. the episode answering itself ------------------------------------
# Its authors, and the system that raised the questions.

r4 = Record()
a = claim(r4, "author", "observation", "the build is green")
b = claim(r4, "author", "interpretation", "the fix landed", basis=a)
f4 = Premise.name(r4, "author", "build", "the runner is honest")
file4 = r4.considering([a, b], f4)
owed4 = len(r4.outstanding(file4))
for question in list(r4.outstanding(file4)):
    r4.write("author", "answer", "I am satisfied", about=question)
    r4.write(SENTINEL, "answer", "the episode is coherent", about=question)
attack("a case answers its own questions",
       len(r4.outstanding(file4)) == owed4,
       f"{owed4} owed; after the author and the Sentinel both answered every "
       f"one, {len(r4.outstanding(file4))} still stand")

print()
if broken:
    print(f"REFUTED. {len(broken)} route(s) past the close:")
    for name in broken:
        print(f"  - {name}")
    sys.exit(1)
else:
    print("Every attack failed. The close cannot be bought with questions")
    print("nobody answered, cannot be superseded by a row somebody wrote, and")
    print("cannot be paid for by the episode itself or by anything a person")
    print("never authorised. What the record derives is unmoved by what")
    print("anyone put in the table.")
