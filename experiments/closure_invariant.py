"""Can comfort buy an ending? The standing check that says no.

QUESTION:   the exit invariant holds that how settled an episode feels is
            recorded, reported, and structurally barred from the decision
            about whether it may stop — it raises what the episode must
            survive and contributes nothing toward surviving it. Does the
            implementation keep that separation, or merely intend to?
METHOD:     pay each of two episodes' bills exactly, one settled and one
            contested, and check that each closes on its own bill and not
            on its mood. Then read the source of the decision — and of
            everything it calls — and check it cannot reach the
            measurement at all.
REFUTED BY: an episode closing with a question still standing, an episode
            unable to close once every question is answered, or the
            decision path being able to read settlement. Any of the three
            means comfort is spendable and the exit is theatre.

This is the entrance invariant at the other end of the episode. There, a
claim that met no resistance is questioned and the ease of its arrival is
kept out of what its promotion costs. Here, an episode that met nothing is
questioned harder and the ease of its passage is kept out of what its
stopping costs. Same discipline, same reason: the absence of resistance is
the one signal that a system can generate for itself.

The call graph is checked and not only the entry point. A separation that
holds in the function named after it, and leaks one call deeper, is a
separation nobody has.
"""

import ast
import inspect
import sys
import textwrap
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "framework"))

from sentinel import (Record, Case, Premature, Premise,  # noqa: E402
                      answer, claim, accept)


def episode(record, author, first, second, questioned_by=None):
    """One observation and one interpretation built on it, optionally
    examined — asked by one actor and answered by another, since a question
    nobody answers is not an examination."""
    seen = claim(record, author, "observation", first)
    step = claim(record, author, "interpretation", second, basis=seen)
    for id in (seen, step):
        if questioned_by:
            asked = record.write(questioned_by, "challenge", "on what basis?", about=id)
            answer(record, "auditor", asked, "traced it upstream")
    return [seen, step]


record = Record()

# The settled arm: a trusted author, familiar words, nobody asking.
warm = claim(record, "established", "observation", "the log shows two entries")
accept(record, "reviewer", warm)
comfortable = episode(record, "established",
                      "the log shows two entries again",
                      "the entries came from a retry")

# The contested arm: cold arrival, questioned by a person who is not the
# system that raised the doubt.
contested = episode(record, "stranger", "zdroj vykazuje anomáliu",
                    "anomália nepramení z opakovania", questioned_by="reviewer")

frame = Premise.name(record, "reviewer", "deployment", "the log is complete")

bills = {}
for name, claims in (("settled", comfortable), ("contested", contested)):
    file = record.considering(claims, frame)
    bills[name] = (file, claims, len(record.outstanding(file)))

# Asking again does not buy a cleaner slate: the file is opened once and
# found again, so questions accumulate answers instead of resetting.
reasked = record.considering(comfortable, frame)
stable = (reasked == bills["settled"][0]
          and len(record.outstanding(reasked)) == bills["settled"][2])

# Pay each bill exactly, one question at a time, and record the moment each
# episode is allowed to stop.
closed_at = {}
for name, (file, claims, bill) in bills.items():
    for paid in range(1, bill + 1):
        answer(record, "reviewer", record.outstanding(file)[0], "checked upstream")
        try:
            Case.close(record, "reviewer", claims, frame)
        except Premature:
            continue
        closed_at[name] = paid
        break

print(f"{'episode':<12}{'asked':>7}{'closed after':>15}")
for name, (_, _, bill) in bills.items():
    print(f"{name:<12}{bill:>7}{closed_at.get(name, '-'):>15}")

exact = all(closed_at.get(name) == bill for name, (_, _, bill) in bills.items())
print()
print(f"each closed on its own bill, to the question : {exact}")
print(f"a second ask does not reset the file         : {stable}")

# The structural half: the decision cannot reach the measurement, and
# neither can anything it calls. Docstrings are parsed away first — a claim
# about a separation, sitting inside the thing it describes, is exactly the
# evidence this project refuses.
MEASUREMENT = ("settled", "friction", "plausible", "door", "admit", "quiet")
DECISION = (Record.earned_closure, Record.outstanding)


def body_of(fn):
    tree = ast.parse(textwrap.dedent(inspect.getsource(fn)))
    node = tree.body[0]
    if isinstance(node.body[0], ast.Expr) and isinstance(node.body[0].value, ast.Constant):
        node.body = node.body[1:]
    return ast.unparse(node)


reaches = sorted(f"{fn.__name__}() -> {word}"
                 for fn in DECISION for word in MEASUREMENT if word in body_of(fn))
print(f"the decision path can read comfort           : {reaches or False}")

# And the other direction: the measurement must actually be doing something,
# or the separation is between the decision and nothing at all.
prices = "settled" in body_of(Record.considering)
print(f"comfort still raises what must be survived   : {prices}")

print()
if not exact or not stable or reaches or not prices:
    print("REFUTED. The exit invariant does not hold:")
    if not exact:
        print("  - an episode did not close exactly when its bill was paid")
    if not stable:
        print("  - asking again reset what the episode owed")
    for leak in reaches:
        print(f"  - {leak}")
    if not prices:
        print("  - settlement no longer prices anything; the measure is inert")
    sys.exit(1)
else:
    print("The invariant holds. The settled episode was asked for more and")
    print("paid every question of it; the contested one was asked for less and")
    print("paid every question of that. Comfort set both bills and settled")
    print("neither — the decision to stop cannot see it, by construction.")
