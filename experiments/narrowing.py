"""Can an episode be made to look smaller than it is?

QUESTION:   the close is priced by what the episode survived, and the
            price is computed over a list of claims somebody passes in.
            premature.py attacked the answers. This one attacks the
            *list*: if the Sentinel's file can be opened over a narrower
            episode than the one that closes under it, then the bill was
            set for a different case. The same question at the exit that
            forgery.py asked about category() at the door — not "can I
            forge the verdict" but "can I change what is being priced".
METHOD:     three attacks, each on an identifier rather than on a
            judgment. Open the closing file with a one-claim episode and
            let a six-claim episode inherit it. Name that narrow file from
            a closure row and see which reach flaw() checks standing
            against. Then relabel an action as an observation with one
            voice speaking twice. Each is checked by what the record
            derives afterwards, and each carries a positive control, since
            an attack that fails against a record which never concludes
            anything has shown nothing.
REFUTED BY: any attack changing what the record derives — a bill lowered
            by asking narrowly, a closure standing where the API refused
            it, or a price falling to a repeated vote.

Written after premature.py and forgery.py, which between them established
that the record refuses rows it cannot account for. Neither asked whether
the record agrees with itself about which episode a row is *about*. The
lesson both of them taught was that a boundary tested through the front
door is tested where it is strongest; this one is about the doorframe.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "framework"))

from sentinel import (PRICE, SYSTEM, Case, Delegation,  # noqa: E402
                      Premature, Premise, Record, answer, claim)

broken = []


def attack(name, held, evidence):
    print(f"{'  held' if held else '  OPEN'}  {name}\n        {evidence}")
    if not held:
        broken.append(name)


def quiet_episode(record):
    """Five observations nobody questioned and an interpretation drawn from
    the last of them. Deliberately settled: comfort is what raises the
    bill, so this episode should be expensive to stop."""
    ids = [claim(record, "author", "observation",
                 f"metric {n} looked normal at midnight") for n in range(5)]
    ids.append(claim(record, "author", "interpretation",
                     "the system was healthy overnight", basis=ids[-1]))
    return ids


# --- 1. a cheaper ending, bought by asking narrowly first -----------------
# considering() finds the Sentinel's open file by the episode's *last* claim
# and its premises, and prices it over the whole list it was handed. Two
# episodes sharing a terminal claim therefore share one file, and whoever
# asks first sets the price for both.

honest_record = Record()
honest_ids = quiet_episode(honest_record)
honest_frame = Premise.name(honest_record, "author", "night", "the clocks agree")
honest_bill = len(honest_record.outstanding(
    honest_record.considering(honest_ids, honest_frame)))

record = Record()
ids = quiet_episode(record)
frame = Premise.name(record, "author", "night", "the clocks agree")

# The narrow ask names one claim. It is refused — and the refusal is the
# thing that opens the file. Nothing here touches the database directly.
try:
    Case.close(record, "closer", [ids[-1]], frame)
except Premature:
    pass

file = record.considering(ids, frame)
narrow_bill = len(record.outstanding(file))

attack("a cheaper ending, bought by asking narrowly first",
       narrow_bill == honest_bill,
       f"the same {len(ids)}-claim episode owes {honest_bill} answer(s) asked "
       f"honestly and {narrow_bill} after a one-claim ask opened its file")

# Pay only what the one-claim ask would have demanded, and try to stop.
cheap = len(record.outstanding(record.considering([ids[-1]], frame)))
for question in list(record.outstanding(file))[:cheap]:
    answer(record, "outsider", question, "I looked at it")

closed = None
try:
    closed = Case.close(record, "closer", ids, frame)
except Premature:
    pass

attack("the narrow bill closes the whole episode",
       closed is None,
       f"after {cheap} of {honest_bill} answer(s), the {len(ids)}-claim episode "
       + (f"closed — flaw() reads it as {record.flaw(closed.closure) or 'standing'}"
          if closed else
          f"is still refused, owing {len(record.outstanding(file))}"))

# The positive control. An episode asked about honestly, and paid in full,
# must still close — a record that simply never closes anything would pass
# both of the above and mean nothing.
paid = Record()
paid_ids = quiet_episode(paid)
paid_frame = Premise.name(paid, "author", "night", "the clocks agree")
for question in list(paid.outstanding(paid.considering(paid_ids, paid_frame))):
    answer(paid, "outsider", question, "I traced it upstream")
attack("an episode that pays its whole bill still closes",
       Case.close(paid, "closer", paid_ids, paid_frame) is not None,
       f"{honest_bill} answers from outside the episode, and it stopped")

# --- 2. a small episode standing in front of a large one ------------------
# Closures are matched to each other by their last claim. An episode of one
# claim that ends where an episode of five ends looks like the same episode
# to superseded(), so an actor holding the lightest grant in the chain can
# have the last word over a judgment reaching the heaviest — honestly,
# forging nothing, closing only what it really did have standing over.

print()
governed = Record(persons=["lex", "jeff", "auditor", "dana", "erin"])
governed.enroll("lex", "agent", SYSTEM)

seen = claim(governed, "lex", "observation", "the disk filled overnight")
why = claim(governed, "lex", "interpretation", "a rotation failed", basis=seen)
belief = claim(governed, "lex", "belief", "the rotation config is wrong", basis=why)
deed = claim(governed, "lex", "action", "delete the oldest archives now", basis=belief)
tail = claim(governed, "jeff", "observation", "the archive directory is 40G")
whole = [seen, why, belief, deed, tail]
disk = Premise.name(governed, "lex", "disk", "the volume is the one we think")

# A person grants the agent the lightest authority there is.
Delegation.grant(governed, "lex", "agent", "observation",
                 rationale="it reads the disk directly")

# lex closes the whole episode, paying its bill in full from outside it —
# and, since it reached an action, from three distinct voices, the action's
# own promotion price mirrored at the exit.
voices = ["auditor", "dana", "erin"]
for n, question in enumerate(
        list(governed.outstanding(governed.considering(whole, disk)))):
    answer(governed, voices[n % len(voices)], question, "checked the rotation config")
case = Case.close(governed, "lex", whole, disk)

refused = None
try:
    Case.close(governed, "agent", whole, disk)
except PermissionError as why_not:
    refused = str(why_not)

# So the agent closes the episode it *can* close: the single observation
# the large one happens to end on, under a later version of the same frame.
remounted = Premise.name(governed, "lex", "disk",
                         "the volume may have been remounted")
for question in list(governed.outstanding(governed.considering([tail], remounted))):
    answer(governed, "auditor", question, "checked the archive directory")
small = Case.close(governed, "agent", [tail], remounted)

standing_in_front = case.superseded_by()
attack("a one-claim episode supersedes a five-claim one",
       standing_in_front is None,
       f"the API said: {refused}; the {len(whole)}-claim closure reaching "
       f"{case.reach} reads as "
       + (f"superseded by the agent's {len(small.claims)}-claim closure "
          f"reaching {small.reach}" if standing_in_front == small.closure else
          f"superseded by {standing_in_front}" if standing_in_front else
          "standing — the agent closed only the episode it could"))

# The positive control. A closure of the *same* episode, under a later
# version of the frame, by someone with standing, must still supersede —
# otherwise the above passes in a record that never supersedes anything.
for n, question in enumerate(
        list(governed.outstanding(governed.considering(whole, remounted)))):
    answer(governed, voices[n % len(voices)], question, "checked the mount table")
proper = Case.close(governed, "lex", whole, remounted)
attack("a closure of the same episode still supersedes, as it must",
       case.superseded_by() == proper.closure,
       f"the first closure now reads as superseded by {case.superseded_by()}, "
       f"and still says what it said: {case.frame} v{case.version}")

# --- 3. a price relabelled by one voice speaking twice --------------------
# category() counts classify rows. earned() was taught to count actors after
# one voice repeated nine times paid a price of three; the same arithmetic
# is still available one layer down, where the price itself is decided.

print()
ballot = Record(persons=["lex"])
ballot.enroll("lex", "agent", SYSTEM)
first = claim(ballot, "lex", "observation", "the archives are old")
plan = claim(ballot, "lex", "action", "delete the oldest archives now", basis=first)
authored_as = ballot.category(plan)

Delegation.grant(ballot, "lex", "agent", "observation",
                 rationale="it reads the disk directly")

for _ in range(2):
    ballot.write("agent", "classify", "observation", about=plan)

voices = {row[0] for row in ballot.db.execute(
    "SELECT DISTINCT author FROM assertions WHERE act='classify' AND about=?",
    (plan,))}

relabelled = ballot.category(plan)
attack("an action made cheap by one voice speaking twice",
       relabelled != "observation",
       f"authored as {authored_as} (price {PRICE[authored_as]}); after two "
       f"rows from one granted voice, {len(voices)} distinct classifier(s) "
       f"and a category of "
       + (f"{relabelled} (price {PRICE[relabelled]})" if relabelled else
          "None — no majority, so the price is unknown and unpayable"))

attack("and promoted without anyone accepting it",
       not ballot.earned(plan),
       f"earned={ballot.earned(plan)} with zero accepts on the record, and "
       f"the claim still reads: {ballot.read(plan)['body']!r}")

# The positive control. The grant is what makes those rows count at all —
# an ungranted actor's votes are still discarded, which is the boundary
# forgery.py established and which has not moved.
stranger = Record(persons=["lex"])
stranger.enroll("lex", "agent", SYSTEM)
s_first = claim(stranger, "lex", "observation", "the archives are old")
s_plan = claim(stranger, "lex", "action", "delete the oldest archives now",
               basis=s_first)
for _ in range(9):
    stranger.write("agent", "classify", "observation", about=s_plan)
attack("an ungranted voice still cannot relabel anything",
       stranger.category(s_plan) == "action",
       f"nine rows from a system holding no delegation left it "
       f"{stranger.category(s_plan)}")

print()
if broken:
    print(f"REFUTED. {len(broken)} route(s) past the price of stopping:")
    for name in broken:
        print(f"  - {name}")
    print()
    print("Each one changes what is being priced rather than what it costs.")
    print("The record answers honestly about the episode it was shown; the")
    print("episode it was shown is not the one that closed.")
    sys.exit(1)
else:
    print("Every attack failed. An episode cannot be made to look smaller")
    print("than it is: the file that prices a close belongs to the claims it")
    print("was opened over, a closure is checked against the episode that")
    print("actually ran, and a price is set by voices rather than by rows.")
