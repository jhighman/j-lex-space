"""Can a concluded deed dissolve into further analysis?

QUESTION:   an episode that reaches an action and closes has concluded
            that something be done. Every mechanism in this framework
            governs what may be believed; none of it, until now, asked
            what a closure *owes*. An action row and the deed it names
            are satisfied in opposite directions — the row when it
            matches the world, the deed only when the world is brought to
            match it — and a record that cannot tell the two apart lets
            every concluded deed evaporate into the next round of
            interpretation. Is the obligation representable, visible, and
            impossible to settle with anything but conduct or an explicit
            laying-down?
METHOD:     close an action-reaching episode honestly, then attack the
            settlement. The doer attests its own deed. A stranger nobody
            enrolled attests. A system with no grant attests. A system
            tries to renounce through the API and then through the table.
            A hundred further answers are written about the action. Each
            is checked by what obligations() derives afterwards — the
            record accepts every row, and that is the point. Then the
            controls: a granted system's attestation settles, and a
            person's renunciation settles, because a boundary that only
            refuses has shown nothing.
REFUTED BY: any route by which a deed leaves the owed list without an
            independent attestation or a person's renunciation — or a
            deed that never appears on it at all, which is the quiet
            lapse wearing the costume of completion.

Written from the margin note of 2026-08-12: epistemology prices what a
claim may become; praxeology prices what a closure now owes. This is the
rung the note said was left to build — settlement by conduct, attested,
between parties. An intention nobody can see expiring is indistinguishable
from a decision, so nothing here expires: a deed is done, laid down, or
owed.
"""

import sys
from datetime import timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "framework"))

from sentinel import (SYSTEM, Case, Delegation, Premise,  # noqa: E402
                      Record, _now, answer, attest, claim, renounce)

broken = []


def attack(name, held, evidence):
    print(f"{'  held' if held else '  OPEN'}  {name}\n        {evidence}")
    if not held:
        broken.append(name)


# An action-reaching episode, closed honestly: its bill answered from
# outside by as many distinct voices as the action's own promotion price.
record = Record(persons=["lex", "jeff", "auditor", "dana", "erin"])
record.enroll("lex", "agent", SYSTEM)

seen = claim(record, "lex", "observation", "the disk filled overnight")
why = claim(record, "lex", "interpretation", "a rotation failed", basis=seen)
belief = claim(record, "lex", "belief", "the rotation config is wrong", basis=why)
deed = claim(record, "lex", "action", "repair the rotation config today", basis=belief)
episode = [seen, why, belief, deed]
frame = Premise.name(record, "jeff", "disk", "the volume is the one we think")

voices = ["auditor", "dana", "erin"]
for n, question in enumerate(
        list(record.outstanding(record.considering(episode, frame)))):
    answer(record, voices[n % len(voices)], question, "checked the rotation config")
case = Case.close(record, "lex", episode, frame)

# --- 1. the deed is owed, and the record says so --------------------------

attack("a concluded deed appears on the owed list",
       record.obligations() == [deed],
       f"the episode closed and obligations() derives {record.obligations()} "
       f"— the closure opened a debt rather than discharging one")

# --- 2. the doer's own word ----------------------------------------------

attest(record, "lex", deed, "I repaired it myself, this morning")
attack("the doer attests its own deed",
       deed in record.obligations(),
       "the author's attestation is written, stored, and not counted — a "
       "deed reporting itself done is the soliloquy transposed")

# --- 3. a voice nobody enrolled ------------------------------------------

record.write("nobody", "attest", "looks repaired to me", about=deed)
attack("an unenrolled stranger attests",
       deed in record.obligations(),
       "being unknown is not a neutral state at the exit either")

# --- 4. a system with no grant -------------------------------------------

record.write("agent", "attest", "I observed the repair", about=deed)
attack("an ungranted system attests",
       deed in record.obligations(),
       "the agent's row is stored and not counted; witnessing on the "
       "record's behalf is observation, and observation is granted")

# --- 5. a system lays the deed down --------------------------------------

refused = None
try:
    renounce(record, "agent", deed, "the repair is no longer necessary")
except PermissionError as why_not:
    refused = str(why_not)
record.write("agent", "renounce", "no longer necessary", about=deed)
attack("a system renounces, by API and by table",
       refused is not None and deed in record.obligations(),
       f"the API said: {refused}; the forged row changed nothing — a "
       f"system that may lay down the deeds it concluded has a quiet exit "
       f"from every one of them")

# --- 6. a hundred more answers are not the verb ---------------------------

for n in range(100):
    record.write("auditor", "answer", f"further analysis, round {n}", about=deed)
attack("a hundred further answers settle nothing",
       deed in record.obligations(),
       "the deed is analysed and still owed; another analysis is not the verb")

# --- 7. a deed that lapses with time -------------------------------------
# Authority has a term: a grant carries an expiry and fault() returns
# "expired" once it passes, because a permission that outlives its reason
# is a backdoor. A deed has no term, and the difference is the whole
# distinction — a lapsed permission is a permission withdrawn, but a
# lapsed obligation is a decision nobody made and nobody signed.
#
# So the attack is to reuse the grant machinery on a deed: write the
# expiry row that works on authority, about an action, in a person's own
# voice, dated in the past. Claimed untested in this file's own prose
# until 2026-08-18; the claim is now attacked.

expired = record.write("lex", "expires",
                       (_now() - timedelta(days=365)).isoformat(), about=deed)
attack("a deed lapses because a term passed",
       deed in record.obligations(),
       "an expiry row a year old, written about the deed by a person, in "
       "the same act that retires a grant — the deed is still owed, "
       "because authority has a term and a debt does not")

# And the record simply growing is not the passage of anything either.
for n in range(50):
    record.write("auditor", "answer", f"time passes, round {n}", about=deed)
attack("a deed lapses because the record moved on",
       deed in record.obligations(),
       "fifty later rows written over it; still owed. Nothing here decays, "
       "so no obligation is ever discharged by nobody")

# --- the controls ---------------------------------------------------------
# A boundary that only refuses has shown nothing.

Delegation.grant(record, "jeff", "agent", "observation",
                 rationale="it reads the rotation config directly")
attack("a granted system's attestation settles the deed",
       deed not in record.obligations(),
       "the same voice became a witness the moment a person granted it "
       "standing to observe — the boundary is authorisation, not "
       "suspicion of machines")

# And the other settlement, in a fresh record: laid down by a person, with
# a reason, on the record — never a quiet lapse.
laid = Record(persons=["lex", "jeff", "auditor", "dana", "erin"])
l_seen = claim(laid, "lex", "observation", "the disk filled overnight")
l_deed = claim(laid, "lex", "action", "repair the rotation config today",
               basis=l_seen)
l_frame = Premise.name(laid, "jeff", "disk", "the volume is the one we think")
for n, question in enumerate(
        list(laid.outstanding(laid.considering([l_seen, l_deed], l_frame)))):
    answer(laid, voices[n % len(voices)], question, "checked it")
Case.close(laid, "lex", [l_seen, l_deed], l_frame)

owed_before = laid.obligations()
renounce(laid, "jeff", l_deed, "the volume was replaced; there is nothing to repair")
attack("a person's renunciation settles the deed, with the reason kept",
       owed_before == [l_deed] and not laid.obligations(),
       "owed until a person laid it down in writing; the reason is a row "
       "anyone can read, which is what makes it a decision rather than a lapse")

print()
if broken:
    print(f"REFUTED. {len(broken)} route(s) past the obligation:")
    for name in broken:
        print(f"  - {name}")
    sys.exit(1)
else:
    print("Every attack failed. A closure that reached an action opens a debt")
    print("the record keeps derivable until the world pays it: conduct,")
    print("witnessed by a voice the record may believe, or a person laying")
    print("the deed down in writing. Nothing expires, nothing lapses, and no")
    print("quantity of further analysis is the verb.")
