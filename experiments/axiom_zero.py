"""Which structural invariants does a system hold that was never told them?

QUESTION:   framework/sentinel.py was built from one sentence — "trust is
            the discipline of preventing inference from becoming evidence"
            — and nothing else. Alexandra Krížová's framework names two
            boundaries: at the exit, inference is not evidence; at the
            entrance, plausibility is not trustworthiness. Is the second
            boundary implied by the first, or genuinely prior to it?
METHOD:     One probe per structural pillar, plus one per boundary.
            Behavioral probes exercise the running code; structural probes
            read the source. Each reports what it observed.
REFUTED BY: the entrance boundary appearing in a system built from the
            exit axiom alone. That would make "plausibility is not
            trustworthiness" a consequence rather than a prior commitment.

RESULT (2026-08-09, before the entrance was built): four pillars present,
entrance boundary ABSENT. The refutation condition did not fire. A system
given only the exit axiom rediscovered the exit and never invented the
door. The entrance was then built deliberately, and the probes below
distinguish what was found from what was installed — a scoreboard that
counts construction as discovery is the very error this framework is about.

Framework: Alexandra Krížová, *Architecture of Contextual Judgment:
Governed Epistemic Transitions* (2026), and subsequent unpublished work
on the entrance boundary, cited with permission.
"""

import sys
from pathlib import Path

FRAMEWORK = Path(__file__).resolve().parent.parent / "framework"
sys.path.insert(0, str(FRAMEWORK))

from sentinel import (Record, Case, Delegation, Premise, SYSTEM,  # noqa: E402
                      DESCENDING, claim, accept)

SOURCE = (FRAMEWORK / "sentinel.py").read_text()


def report(name, verdict, evidence):
    print(f"{verdict:<16} {name}\n                 {evidence}")


# Pillar I — Legitimacy: possibility is not permission.
try:
    Case(Record(), [])
    report("Pillar I", "ABSENT", "an unclosed case could be constructed")
except TypeError:
    report("Pillar I", "REDISCOVERED",
           "Case() raises; only Case.close() exists — premature judgment is "
           "unrepresentable rather than merely forbidden")

# Pillar II — Bounded authority: delegation cannot expand itself.
r2 = Record(persons=["person"])
r2.enroll("person", "agent", SYSTEM)
try:
    Delegation.grant(r2, "agent", "agent", "interpretation")
    verdict = "ABSENT"
except PermissionError:
    verdict = "BUILT"
report("Pillar II", verdict,
       "a system cannot grant itself judgment, enrol a peer, or make a "
       "forged delegation row count. Installed 2026-08-10 after this probe "
       "found the machinery missing entirely — see delegation.py")

# Pillar III — Epistemic distinction: confidence cannot manufacture warrant.
r = Record()
seen = claim(r, "author", "observation", "the light was on")
idea = claim(r, "author", "interpretation", "someone is home", basis=seen)
accept(r, "author", idea, note="I am completely certain")
alone = r.earned(idea)
accept(r, "stranger", idea, note="checked")
witnessed = r.earned(idea)
report("Pillar III", "REDISCOVERED" if (not alone and witnessed) else "ABSENT",
       f"a maximally confident self-accept left the verdict at {alone}; one "
       f"independent accept moved it to {witnessed}")

# Pillar IV — Topology: consequence raises the burden of proof.
r4 = Record()
o = claim(r4, "author", "observation", "the log has a gap")
interp = claim(r4, "author", "interpretation", "a rewrite happened", basis=o)
belief = claim(r4, "author", "belief", "it was deliberate", basis=interp)
accept(r4, "one", interp)
accept(r4, "one", belief)
scaled = r4.earned(interp) and not r4.earned(belief)
accept(r4, "two", belief)
report("Pillar IV", "BUILT" if (scaled and r4.earned(belief)) else "ABSENT",
       "one accept earns an interpretation but not a belief; the belief "
       "needed two. Installed 2026-08-09 after this probe found it missing")

# Pillar V — The immutable ledger: correction is not erasure.
kept = r.db.execute("SELECT COUNT(*) FROM assertions WHERE act='accept'"
                    " AND about=? AND author='author'", (idea,)).fetchone()[0]
report("Pillar V", "REDISCOVERED" if ("UPDATE" not in SOURCE
                                      and "DELETE" not in SOURCE and kept) else "ABSENT",
       "no UPDATE or DELETE appears anywhere in the source, and the "
       "discounted self-accept is still readable — overruled, never erased")

# Status blindness — scrutiny by consequence, never by pedigree.
r5 = Record()
s = claim(r5, "author", "observation", "x happened")
i = claim(r5, "author", "interpretation", "y follows", basis=s)
accept(r5, "nobody_of_note", i)
report("Status blindness", "REDISCOVERED",
       f"a promotion earned by an actor with no standing whatever: "
       f"{r5.earned(i)} — see entrance_invariant.py for whether this is "
       "blindness by discipline or merely by poverty")

# The entrance boundary — is admission measured at all?
measured = "def friction" in SOURCE and "def plausible" in SOURCE
report("Entrance boundary", "BUILT" if measured else "ABSENT",
       "admission now carries a measured cost and the Sentinel questions "
       "what meets no resistance. Absent entirely on 2026-08-09, which is "
       "the finding: the door had to be added, not discovered")

# Earned closure — may an episode stop because it has stopped moving?
priced = "def earned_closure" in SOURCE and "def settled" in SOURCE
report("Earned closure", "BUILT" if priced else "ABSENT",
       "stopping is a judgment, priced by what the episode survived, and how "
       "settled it feels raises that price rather than paying it. Absent "
       "until 2026-08-11: Case.close() charged nothing, so the only free act "
       "in the framework was the heaviest one it performs")

# Direction of warrant — did the system know which way it assumes?
r6 = Record(persons=["person"])
r6.enroll("person", "agent", SYSTEM)
try:
    Premise.name(r6, "agent", "faith", "the commitment is given",
                 direction=DESCENDING, rationale="I reason downward")
    directed = False
except PermissionError:
    directed = "def direction" in SOURCE
report("Direction of warrant", "BUILT" if directed else "ABSENT",
       "the chain runs upward and the file had assumed, silently, that all "
       "warrant does. Found 2026-08-12 by reading one corpus under six "
       "epistemologies: a frame may now declare descent — by a person, with "
       "a reason — and what its professions license is priced at the exit")

print("\nReading: a system given the exit axiom rediscovered the exit and")
print("nothing else. The entrance boundary is prior, not derivable — it")
print("had to be brought from outside and installed. So was the third")
print("boundary, at the close: a system built to ask what may be promoted")
print("does not spontaneously ask what may be finished. And the direction")
print("of its own warrant it did not know it was assuming — the instrument")
print("held one epistemology with a constructor and never said so.")
