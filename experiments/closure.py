"""What gives a judgment the right to stop?

QUESTION:   an episode that has gone quiet — nothing resisting, nobody
            asking — looks finished. Two states produce that quiet and are
            identical from inside: an episode that has been worked
            through, and one whose system has run out of things to say. If
            settlement were the closure criterion, the second would earn
            the right to conclude sooner than the first, because a poorer
            repertoire empties faster. Does this record price closure by
            what an episode survived, or by how finished it feels?
METHOD:     two episodes of the same shape and the same length, differing
            only in what they met. One arrives from an author the record
            already trusts, in familiar words, and nobody ever questions
            it. The other arrives cold and is questioned by a reviewer.
            Ask each to close and compare the bill.
REFUTED BY: the quiet episode being asked for no more than the contested
            one. If comfort does not raise the price of stopping, then the
            measurement is decorative, closure is a fixed threshold, and a
            system that knows where the threshold sits will aim at it
            instead of at the question.

The inversion this probe exists to check: settlement is not a discount on
closure, it is the bill. There is no threshold to run at, and reporting
oneself finished is what makes stopping expensive.

Direction set by Alexandra Krížová, 2026-08-11: the terminal state cannot
be a rule that fires, because a system that can see the rule will bypass
the curiosity on the way to it.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "framework"))

from sentinel import (Record, Case, Premature, Premise,  # noqa: E402
                      answer, claim, accept)

record = Record()

# An author the record has learned to trust, saying familiar things. Every
# component of friction is absent, so the door reads zero, and nobody but
# the Sentinel ever asks anything about the episode.
groundwork = claim(record, "established", "observation",
                   "the deployment log shows two identical entries")
accept(record, "reviewer", groundwork)
quiet_seen = claim(record, "established", "observation",
                   "the deployment log shows two identical entries again")
quiet_step = claim(record, "established", "interpretation",
                   "the deployment log entries came from a retry",
                   basis=quiet_seen)

# The same shape, arriving cold — and genuinely examined: questioned by
# somebody who is not the system congratulating itself for the doubt it
# manufactured, and answered by a third party. An examination is a thing
# that happened between people; a question nobody answers is not one.
cold_seen = claim(record, "stranger", "observation", "zdroj vykazuje anomáliu")
cold_step = claim(record, "stranger", "interpretation",
                  "anomália nepramení z opakovania", basis=cold_seen)
for id in (cold_seen, cold_step):
    asked = record.write("reviewer", "challenge", "on what basis?", about=id)
    answer(record, "auditor", asked, "traced it to the upstream feed")

frame = Premise.name(record, "reviewer", "deployment",
                     "the log is complete and the clock is not lying")

quiet = record.settled([quiet_seen, quiet_step])
loud = record.settled([cold_seen, cold_step])

quiet_file = record.considering([quiet_seen, quiet_step], frame)
loud_file = record.considering([cold_seen, cold_step], frame)
quiet_bill = len(record.outstanding(quiet_file))
loud_bill = len(record.outstanding(loud_file))

print("the settled episode")
print(f"  entered quietly       : {quiet['entered quietly']}")
print(f"  questioned by nobody  : {quiet['questioned by nobody']}")
print(f"  asked of it to close  : {quiet_bill}")
print("the contested episode")
print(f"  entered quietly       : {loud['entered quietly']}")
print(f"  questioned by nobody  : {loud['questioned by nobody']}")
print(f"  asked of it to close  : {loud_bill}")

# No episode stops unasked, however hard a time it had.
floor_held = loud_bill >= 1

# The first ask cannot close: it is what draws the questions.
try:
    Case.close(record, "reviewer", [cold_seen, cold_step], frame)
    one_motion = True
except Premature:
    one_motion = False

# The case cannot answer its own questions, and neither can the system that
# asked them. Both attempts are written down and neither is counted.
for question in record.outstanding(loud_file):
    answer(record, "stranger", question, "I have considered it and I am content")
    answer(record, "sentinel", question, "on reflection the episode is coherent")
self_settled = not record.outstanding(loud_file)

# Somebody outside the episode answers, and it may stop.
for question in record.outstanding(loud_file):
    answer(record, "reviewer", question, "checked against the upstream log")
closed = Case.close(record, "reviewer", [cold_seen, cold_step], frame)

print()
print(f"bill rises with settlement    : {quiet_bill > loud_bill}")
print(f"no episode stops unasked      : {floor_held}")
print(f"closure possible in one motion: {one_motion}")
print(f"a case can settle itself      : {self_settled}")
print(f"the contested case closed as  : {closed.frame} v{closed.version}")

print()
if quiet_bill <= loud_bill or not floor_held or one_motion or self_settled:
    print("REFUTED. Stopping is not priced by what the episode survived.")
    if quiet_bill <= loud_bill:
        print("  - the settled episode was asked for no more than the contested one")
    if not floor_held:
        print("  - an episode was allowed to stop unasked")
    if one_motion:
        print("  - a case closed by the same act that proposed closing it")
    if self_settled:
        print("  - the episode answered its own questions and they stopped standing")
    sys.exit(1)
else:
    print("Closure is earned, not reached. The episode that met nothing was")
    print(f"asked {quiet_bill} questions to stop; the one that met resistance was asked")
    print(f"{loud_bill}. Comfort is the bill and not the discount, so there is no")
    print("threshold for a system to aim at — and the answers had to come from")
    print("outside the episode, because a case that can settle itself has")
    print("built a mirror and called it a witness.")
