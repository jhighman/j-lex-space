"""Can plausibility move warrant? The standing check that says no.

QUESTION:   the entrance invariant holds that how easily a claim entered
            is recorded, reported, and structurally barred from the
            decision about whether its promotion was earned. Does the
            implementation actually keep that separation, or merely
            intend to?
METHOD:     construct two claims identical in kind and in independent
            acceptance and maximally different in plausibility — one from
            an established author in familiar words, one from a stranger
            in unfamiliar ones — and compare verdicts. Then read the
            source of earned() and check it cannot reach the entrance at
            all.
REFUTED BY: any two claims, equal in kind and acceptance, whose verdicts
            differ. If plausibility can move warrant, the invariant is
            decorative and the entrance is theatre.

This is the check that makes status blindness demonstrable rather than
accidental: the system now knows exactly who is usually right — author
standing is a component of friction — and must be shown never to consult
it when deciding what was earned. Blindness you can prove is blindness
that had something to refuse.
"""

import ast
import inspect
import sys
import textwrap
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "framework"))

from sentinel import Record, claim, accept  # noqa: E402

record = Record()

# An author the record has learned to trust: prior claims, independently
# accepted. Everything they say from here on lands softly.
groundwork = claim(record, "established", "observation",
                   "the deployment log shows two identical entries")
accept(record, "reviewer", groundwork)
warm = claim(record, "established", "interpretation",
             "the deployment log entries came from a retry", basis=groundwork)

# A stranger, saying something the record has never heard, in words it does
# not recognise. Everything about this arrival is friction.
cold_seen = claim(record, "stranger", "observation", "zdroj vykazuje anomáliu")
cold = claim(record, "stranger", "interpretation",
             "anomália pramení z nesúladu", basis=cold_seen)

# What each met at the door is read back from the record, not recomputed:
# friction is relational, so a later reading would describe a different
# room. The past does not move.
warm_door, cold_door = record.door(warm), record.door(cold)

# Identical treatment at the exit: same kind, one independent accept each.
accept(record, "reviewer", warm)
accept(record, "reviewer", cold)

print("the comfortable claim")
print(f"  resistance at the door : {warm_door}")
print(f"  plausible on arrival   : {record.plausible(warm)}")
print(f"  earned                 : {record.earned(warm)}")
print("the unwelcome claim")
print(f"  resistance at the door : {cold_door}")
print(f"  plausible on arrival   : {record.plausible(cold)}")
print(f"  earned                 : {record.earned(cold)}")

differ = record.earned(warm) != record.earned(cold)
gap = warm_door != cold_door

print()
print(f"friction differs between them : {gap}")
print(f"verdict differs between them  : {differ}")

# The structural half: earned() cannot reach the entrance even by mistake.
# The docstring is parsed away first, so the check reads the code and not
# the prose about the code. A claim about a separation, sitting inside the
# thing it describes, is exactly the sort of evidence this project refuses.
tree = ast.parse(textwrap.dedent(inspect.getsource(Record.earned)))
fn = tree.body[0]
if isinstance(fn.body[0], ast.Expr) and isinstance(fn.body[0].value, ast.Constant):
    fn.body = fn.body[1:]
reaches = any(name in ast.unparse(fn)
              for name in ("friction", "plausible", "door", "admit"))
print(f"earned() can reach the door   : {reaches}")

print()
if differ or reaches:
    print("REFUTED. Plausibility moved warrant; the invariant does not hold.")
    sys.exit(1)
else:
    print("The invariant holds. The record measured a large difference in how")
    print("these two claims were received, reported it, and let none of it")
    print("touch what each had to pay. Status was known and not consulted.")
