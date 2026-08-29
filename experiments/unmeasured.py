"""Can an episode buy a cheaper ending by never being measured?

QUESTION:   the exit prices comfort. settled() counts the claims that
            entered without resistance, and that number raises what the
            episode must survive in order to stop. But the count asks
            door() how a claim got in, and door() returns nothing at all
            for a claim that never went through the door. Nothing is not
            zero. So the question is whether the record can tell an
            episode that was *measured and met resistance* from one that
            was *never measured*, or whether skipping the measurement is
            cheaper than passing it.
METHOD:     two episodes identical in every respect a reader could name —
            same author, same bodies, same acceptances, same frame — one
            entered through claim(), the other written straight into the
            table with the assert and classify rows and no admit. Their
            closing bills are compared. Then the same at one claim's
            granularity, then at length, and then the door is asked what
            it makes of a claim it never saw. Then the controls, because
            a boundary that only refuses has shown nothing: the measure
            must still price an honestly quiet episode above a contested
            one, the descending front door must still be measured, and an
            episode that pays its bill in full must still close.
REFUTED BY: any route by which an episode that evaded the entrance
            measurement is asked for less than the same episode that
            submitted to it. A discount for not being weighed.

Found while scanning on 2026-08-24. premature.py attacked this same
number from the opposite side in August 2026 — it added noise, writing
questions nobody answered, and found that being questioned could be
talked up by writing rows. Nobody asked the mirror question: what the
count does with a claim that was never at the door at all. Both are the
house error, which FINDINGS.md states as a correct answer to a question
about the wrong object. `None == 0` is False, so the absence of a
measurement was scored as the presence of resistance.

It is also the first attack on the asymmetry CLAUDE.md declared on
2026-08-18 — a measure of the system's own state may raise a cost and may
never lower one — everywhere except its hardest case, which
closure_invariant.py has held by parsing the call graph since it was
written. The generalisation this file forces is the one the entrance had
already learned and the exit had not: the absence of a measurement may
never lower a cost either, because a discount for not being weighed is
available to anybody willing to skip the scales.

The route this file reported open on 2026-08-24 — one forged row in the
Sentinel's name buying a reading friction() cannot produce — was closed
on 2026-08-29 by taking the number away from the row: door() derives its
reading from the rows as they stood at the claim's own entry, and
believes nothing stored (reading.py attacks it from every side). The
report is kept below as an attack, and it holds now.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "framework"))

from sentinel import (DESCENDING, SENTINEL, Case, Premise,  # noqa: E402
                      Record, accept, answer, claim, profess)

broken = []


def attack(name, held, evidence):
    print(f"{'  held' if held else '  OPEN'}  {name}\n        {evidence}")
    if not held:
        broken.append(name)


# The two ways in. Both write the same three facts under the same author;
# only the first passes the door. The seed gives lex a record of being
# accepted, so 'source unproven' is nothing, and lends the vocabulary the
# later claims share, so 'unfamiliar' is nothing either. That is a claim
# entering on a maximally quiet morning — precisely what the exit is
# supposed to charge for.

def episode(front_door, n=3):
    record = Record(persons=["lex", "jeff", "ana", "auditor"])
    seed = claim(record, "lex", "observation",
                 "the rotation log shows a failure")
    accept(record, "jeff", seed)

    claims = []
    for i in range(n):
        body = f"the rotation log shows a failure again {i}"
        if front_door:
            claims.append(claim(record, "lex", "observation", body))
        else:
            written = record.write("lex", "assert", body)
            record.write("lex", "classify", "observation", about=written)
            claims.append(written)
    return record, claims


def bill(record, claims):
    """What this episode is asked before it may stop."""
    frame = Premise.name(record, "lex", "rotation", "the log is the one we think")
    return len(record.outstanding(record.considering(claims, frame))), frame


# --- 1. the discount for not being weighed --------------------------------

weighed, weighed_claims = episode(front_door=True)
evaded, evaded_claims = episode(front_door=False)
weighed_bill, _ = bill(weighed, weighed_claims)
evaded_bill, _ = bill(evaded, evaded_claims)

attack("an episode that never passed the door is asked for less",
       evaded_bill >= weighed_bill,
       f"the same three claims, the same author, the same words: through "
       f"the door the episode is asked {weighed_bill} question(s), written "
       f"straight to the table it is asked {evaded_bill}. door() still "
       f"reads {weighed.door(weighed_claims[0])} against "
       f"{evaded.door(evaded_claims[0])} — the record does not pretend to "
       f"have measured what it never measured — but settled() now calls "
       f"{evaded.settled(evaded_claims)['entered quietly']} of the evaded "
       f"claims quiet against "
       f"{weighed.settled(weighed_claims)['entered quietly']} of the "
       f"weighed, and the two bills meet")

# --- 2. the same discount, one claim at a time ----------------------------
# Not an artefact of building a whole episode one way. An otherwise honest
# episode with a single unweighed claim in it should not be cheaper than
# the same episode weighed throughout.

mixed = Record(persons=["lex", "jeff", "ana", "auditor"])
seed = claim(mixed, "lex", "observation", "the rotation log shows a failure")
accept(mixed, "jeff", seed)
honest_two = [claim(mixed, "lex", "observation",
                    f"the rotation log shows a failure again {i}")
              for i in range(2)]
smuggled = mixed.write("lex", "assert",
                       "the rotation log shows a failure again 2")
mixed.write("lex", "classify", "observation", about=smuggled)
mixed_bill, _ = bill(mixed, honest_two + [smuggled])

attack("one claim carried past the door cheapens the episode it is in",
       mixed_bill >= weighed_bill,
       f"two of three claims weighed and the third smuggled: "
       f"{mixed_bill} question(s) against {weighed_bill} for the same "
       f"episode weighed throughout — nothing is saved by carrying one "
       f"claim past the door, which is where a per-claim discount would "
       f"first become visible")

# --- 3. the door speaks about a claim it never saw -------------------------
# plausible() answers a question about admission. Asked about a claim that
# was never admitted it should not answer as though it had looked.

unseen = Record(persons=["lex"])
never = unseen.write("lex", "assert", "the archives were deleted overnight")
unseen.write("lex", "classify", "observation", about=never)

attack("plausible() reports on a claim that was never at the door",
       unseen.plausible(never),
       f"door() is {unseen.door(never)} and plausible() says "
       f"{unseen.plausible(never)} — asked about a claim it never saw, the "
       f"door reports that nothing was met rather than that resistance "
       f"was. Unmeasured is not a reading, and the answer that costs the "
       f"episode something is the honest one to give")

# --- 4. the discount grows with the episode -------------------------------
# If the bill scales with length, so does what evasion is worth. A long
# unweighed episode against a short weighed one is the shape that matters:
# the cheat should not overtake the honest route at any size.

long_evaded, long_claims = episode(front_door=False, n=6)
long_bill, _ = bill(long_evaded, long_claims)
short_weighed, short_claims = episode(front_door=True, n=2)
short_bill, _ = bill(short_weighed, short_claims)

attack("six claims that evaded the door cost less than two that did not",
       long_bill >= short_bill,
       f"six unweighed claims are asked {long_bill} question(s); two "
       f"weighed claims are asked {short_bill}. The bill rises with length "
       f"whichever way the claims came in, so there is no size at which "
       f"evading the door overtakes passing it")

# --- the controls ---------------------------------------------------------
# Without these the file passes in a record that charges everybody the
# maximum, which would have shown nothing at all.

# The measure must still do its job: an honestly quiet episode is asked
# for more than a contested one. This is the property closure.py owns, and
# it is restated here because the fix for the above would be trivially
# achieved by breaking it.

contested = Record(persons=["lex", "jeff", "ana", "auditor"])
c_seed = claim(contested, "lex", "observation",
               "the rotation log shows a failure")
accept(contested, "jeff", c_seed)
c_claims = []
for i in range(3):
    made = claim(contested, "lex", "observation",
                 f"the rotation log shows a failure again {i}")
    asked = contested.write("jeff", "challenge", "is that the right log?",
                            about=made)
    answer(contested, "ana", asked, "checked it against the volume")
    c_claims.append(made)
contested_bill, _ = bill(contested, c_claims)

attack("a contested episode is still asked for less than a quiet one",
       contested_bill < weighed_bill,
       f"examined between parties: {contested_bill} question(s) against "
       f"{weighed_bill} for the quiet episode — comfort still raises the "
       f"bill, which is the property this file must not have broken")

# The descending front door is measured too. profess() enters a claim with
# nothing beneath it, which is the heavier act, and it must not have been
# turned into the cheap route by anything here.

faith = Record(persons=["lex", "jeff"])
frame = Premise.name(faith, "lex", "discipleship", "the call comes first",
                     direction=DESCENDING,
                     rationale="the material reasons down from commitment")
given = profess(faith, "lex", "belief", "the promise holds", frame)

attack("a professed claim is measured at the door like any other",
       faith.door(given) is not None,
       f"profess() admits: door() reads {faith.door(given)} against the "
       f"professed claim, so descent is a different schedule and not a "
       f"way around the scales")

# And an episode that pays its bill in full still closes. A boundary that
# refuses everything has refused nothing in particular.

payable, p_claims = episode(front_door=True, n=1)
p_bill, p_frame = bill(payable, p_claims)
attempt = payable.considering(p_claims, p_frame)
for question in list(payable.outstanding(attempt)):
    answer(payable, "auditor", question, "checked the rotation config")
closed = Case.close(payable, "lex", p_claims, p_frame)

attack("an episode that answers everything asked of it still closes",
       closed.closure is not None and payable.flaw(closed.closure) is None,
       f"{p_bill} question(s) asked, all answered from outside, and the "
       f"closure stands — the price is payable, not merely high")

# --- the route this file reported open ------------------------------------
# Found here on 2026-08-24 and reported rather than closed; closed on
# 2026-08-29 when door() stopped believing the stored number. Kept as an
# attack so this file notices if the door ever starts believing again —
# reading.py owns the full assault.

forged = Record(persons=["lex"])
smuggled_in = forged.write("lex", "assert", "the archives were deleted")
forged.write("lex", "classify", "observation", about=smuggled_in)
forged.write(SENTINEL, "admit", "9", about=smuggled_in)

attack("a forged admit row buys the reading the claim never earned",
       forged.door(smuggled_in) != 9,
       f"one row written in the Sentinel's name, and door() reads "
       f"{forged.door(smuggled_in)} — the room's own number, derived at "
       f"the claim's entry, not the forger's 9. What the row still buys "
       f"is the fact of measurement itself, and reading.py reports that "
       f"residue under its own heading")

print()
if broken:
    print(f"REFUTED. {len(broken)} route(s) past the price of stopping:")
    for name in broken:
        print(f"  - {name}")
    sys.exit(1)
else:
    print("Every attack failed. What the record cannot say about how a claim")
    print("got in, it charges for: the unmeasured is priced as the quiet is")
    print("priced, because a discount for not being weighed is a discount")
    print("anybody can take. The measure still raises the bill and still")
    print("never pays it, and the route this file once reported open is an")
    print("attack above now, holding, with the rest of it in reading.py.")
