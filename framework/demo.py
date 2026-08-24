"""A round trip through the framework. Run it:

    python3 framework/demo.py

Watch for five things: the author's own accept is recorded but never
counted; the derived category comes from the record, not from a stored
field; judgment is only possible on a case that has closed; closing is
itself judgment, priced by how little the episode met on its way here;
and a case that closes on an action does not finish — it opens a debt
that only conduct or a person's written renunciation settles.
"""

from sentinel import (Record, Case, Delegation, Premature, Premise, SYSTEM,
                      answer, assign, assigned, attest, claim, accept,
                      renounce)

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

# Stopping is a judgment too, and it closes under named premises: a
# conclusion that will not say what it assumed cannot be argued with later.
frame = Premise.name(record, "lex", "history-integrity",
                     "the reflog is trustworthy and the clock is not lying")

# How settled the episode is. Not a compliment — this is the measure of how
# little it met, and it is about to make stopping more expensive, not less.
quiet = record.settled([seen, theory])
print()
print("entered quietly:           ", quiet["entered quietly"])
print("questioned by nobody:      ", quiet["questioned by nobody"])

# The first ask never closes. It opens the Sentinel's file and draws its
# questions, and a question asked in this breath cannot already be answered.
try:
    Case.close(record, "lex", [seen, theory], frame)
except Premature as refusal:
    print("first ask:                 ", refusal)
    for question in refusal.questions:
        print("   the Sentinel asks:      ", question)

# Lex cannot answer them: an author of the case answering the case is the
# episode settling its own questions. The record keeps her attempt anyway.
attempt = record.considering([seen, theory], frame)
for question in record.outstanding(attempt):
    answer(record, "lex", question, "I've thought about it and I'm satisfied")
print("after lex answers her own: ", len(record.outstanding(attempt)), "still standing")

# Someone outside the episode answers. Now it may stop.
for question in record.outstanding(attempt):
    answer(record, "reader", question, "checked the reflog independently")
case = Case.close(record, "lex", [seen, theory], frame)
print("closed under premises:     ", f"{case.frame} v{case.version}")

# Lex authored claims in this case, so she cannot be its judge.
print("lex as judge:              ", Case.judge(case, "lex")["reason"])

# An independent judge sees the whole case, once.
verdict = case.judge("reader")
for step in verdict["steps"]:
    print(f"step {step['step']}: earned={step['earned']}  ({step['claim']})")

# The premises move. What was concluded under the old ones does not: the
# earlier closure is superseded, never edited, and still says what it said.
Premise.name(record, "lex", "history-integrity",
             "the reflog is trustworthy; the clock may have drifted")
print("this case still reads as:  ", f"{case.frame} v{case.version}",
      "- superseded, not corrected")


# --- what the closure owes ------------------------------------------------
# Everything above governs what may be *believed*. The last rung asks what
# a conclusion now *owes*. An episode that reaches an action and closes has
# concluded that something be done, and a record that cannot tell a claim
# about a deed from the deed itself lets every conclusion dissolve into the
# next round of interpretation. Another analysis is not the verb.

deed = claim(record, "lex", "action",
             "rewrite the release notes from the reflog", basis=theory)
accept(record, "jeff", deed, note="agreed, and it should be done today")
accept(record, "reader", deed, note="the notes are wrong as they stand")
accept(record, "auditor", deed, note="checked; the history was rewritten")

deed_frame = Premise.name(record, "lex", "release-notes",
                          "the notes are ours to correct")
owed = record.considering([seen, theory, deed], deed_frame)
for n, question in enumerate(list(record.outstanding(owed))):
    answer(record, ["reader", "auditor", "dana"][n % 3], question, "checked")
Case.close(record, "lex", [seen, theory, deed], deed_frame)

print()
print("closed on an action, and:  ", len(record.obligations()), "deed(s) owed")

# The doer's own word is stored and does not settle it. A deed reporting
# itself done is the soliloquy the entrance already refused, transposed.
attest(record, "lex", deed, "I rewrote them myself this morning")
print("after the doer says so:    ", len(record.obligations()), "still owed")

# A hundred further answers written against the deed settle nothing.
for n in range(100):
    record.write("reader", "answer", f"further analysis, round {n}", about=deed)
print("after 100 more answers:    ", len(record.obligations()), "still owed")

# It leaves the list two ways only. A voice other than the doer witnesses
# the conduct — or a person lays the deed down in writing, with a reason,
# which is a decision on the record rather than a lapse.
attest(record, "auditor", deed, "I saw the corrected notes published")
print("once somebody else saw it: ", len(record.obligations()), "owed")

undone = claim(record, "lex", "action", "email the contributors", basis=theory)
for who in ("jeff", "reader", "auditor"):
    accept(record, who, undone, note="they should hear it from us")
mail_frame = Premise.name(record, "lex", "contributors",
                          "the contributor list is current")
mail = record.considering([seen, theory, undone], mail_frame)
for n, question in enumerate(list(record.outstanding(mail))):
    answer(record, ["reader", "auditor", "dana"][n % 3], question, "checked")
Case.close(record, "lex", [seen, theory, undone], mail_frame)
print("a second deed, unperformed:", len(record.obligations()), "owed")

renounce(record, "jeff", undone,
         "the contributors were in the room; there is nobody left to tell")
print("laid down by a person:     ", len(record.obligations()), "owed")
