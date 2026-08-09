"""A round trip through the framework. Run it:

    python3 framework/demo.py

Watch for three things: the author's own accept is recorded but never
counted; the derived category comes from the record, not from a stored
field; and judgment is only possible on a case that has closed.
"""

from sentinel import Record, Case, claim, accept

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
