"""A round trip through the framework. Run it:

    python3 framework/demo.py

Watch for three things: the author's own accept is recorded but never
counted; the derived category comes from the record, not from a stored
field; and judgment is only possible on a case that has closed.
"""

from sentinel import (Record, Case, Delegation, SYSTEM,
                      assign, assigned, claim, accept)

record = Record()

# Lex observes something, then builds an interpretation on it.
seen = claim(record, "lex", "observation",
             "the same commit message appears twice in the log")
theory = claim(record, "lex", "interpretation",
               "someone force-pushed and rewrote history", basis=seen)

# Lex tries to promote her own interpretation. The record takes the
# assertion — the record refuses nothing — but the verdict won't count it.
accept(record, "lex", theory, note="I'm sure about this")
print("earned after self-accept:  ", record.earned(theory))   # False

# Jeff, independent, reviews and accepts. Now it is earned.
accept(record, "jeff", theory, note="checked the reflog, it holds")
print("earned after jeff's accept:", record.earned(theory))   # True

# The claim's category is derived from the record at read time.
print("category of the theory:    ", record.category(theory))

# What a claim licenses sets the price of its promotion. A belief costs
# more independent acceptance than an interpretation, because more follows
# from it. One accept is no longer enough.
hunch = claim(record, "lex", "belief",
              "the history was rewritten deliberately", basis=theory)
accept(record, "jeff", hunch, note="plausible")
print("belief on one accept:      ", record.earned(hunch))    # False
accept(record, "reader", hunch, note="the reflog agrees")
print("belief on two accepts:     ", record.earned(hunch))    # True

# The other boundary: the entrance. Lex now has accepted claims behind
# her, so her next familiar-sounding assertion meets no resistance at all
# — which is exactly the condition worth worrying about.
easy = claim(record, "lex", "interpretation",
             "the commit message appears twice in the log", basis=seen)
door = record.friction(easy)
print("resistance at the door:    ", door["resistance"], "- nothing pushed back")
print("examined anyway:           ", door["examined"], "- the Sentinel asked itself")
print("the question it asked:     ", record.read(record.db.execute(
    "SELECT id FROM assertions WHERE act='challenge' AND about=?",
    (easy,)).fetchone()[0])["body"])

# And the invariant: how easily it entered changes nothing about what it
# must pay to be promoted.
accept(record, "jeff", easy)
print("earned, regardless:        ", record.earned(easy))

# Who may judge with nobody present. In a record that knows who anyone is,
# a system may compute all it likes — but judging is not computing, and it
# may only judge where a person has handed it that judgment.
governed = Record(persons=["lex"])
governed.enroll("lex", "assistant", SYSTEM)
watched = claim(governed, "lex", "observation", "the disk filled overnight")
why = claim(governed, "lex", "interpretation", "a log rotation failed", basis=watched)
try:
    accept(governed, "assistant", watched)
except PermissionError as refusal:
    print("the agent, judging alone:  ", refusal)
Delegation.grant(governed, "lex", "assistant", "observation")
accept(governed, "assistant", watched)
print("after lex delegates:        the assistant may judge observations")

# Work is assigned; authority is delegated. They are different words here
# because they are different acts, and no pile of the first becomes the
# second.
for job in ("scan the logs", "summarise the diff", "measure the friction"):
    assign(governed, "lex", "assistant", job)
try:
    accept(governed, "assistant", why)
except PermissionError as refusal:
    print(f"after {len(assigned(governed, 'assistant'))} tasks assigned:  ", refusal)

# Judgment needs a case, and an unclosed case does not exist.
try:
    Case(record, [seen, theory])
except TypeError as refusal:
    print("asking early:              ", refusal)

# Close the episode; now — and only now — is there something to judge.
case = Case.close(record, [seen, theory])

# Lex authored claims in this case, so she cannot be its judge.
print("lex as judge:              ", Case.judge(case, "lex")["reason"])

# An independent judge sees the whole case, once.
verdict = case.judge("reader")
for step in verdict["steps"]:
    print(f"step {step['step']}: earned={step['earned']}  ({step['claim']})")
