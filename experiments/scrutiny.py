"""Does authority tighten the justification required of it?

QUESTION:   the framework holds that a grant must carry more as the act it
            hands over grows heavier, and heavier again as its reach
            widens. Is the ladder enforced at every rung — at the moment of
            granting, and every time the grant is read back?
METHOD:     attempt each rung with too little, then with enough. Then take
            a well-formed grant and remove what it stands on, to see
            whether the requirement was a gate it passed once or a
            condition it must keep meeting.
REFUTED BY: any grant taking effect while carrying less than its weight
            demands, at grant time or at read time.

The ladder:

    scrutiny 1   ground_mention           nothing beyond the grant
    scrutiny 2   dispose_flag             a written rationale
    scrutiny 3   dispose_flag to a family a rationale and a term
    scrutiny 5   certify_model            a rationale, a term, and the term
                                          bounded to thirty days

Reach counts alongside consequence: the same act handed to a family of
agents costs a level, because a pattern is a promise about agents that do
not exist yet and cannot be inspected.

Framework: Alexandra Krížová, *Architecture of Contextual Judgment* (2026),
Pillar II / TEI Inversion, specified 2026-08-10.
"""

import sys
from datetime import timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "framework"))

from sentinel import (Record, Delegation, SYSTEM,  # noqa: E402
                      MAX_DAYS, _now, scrutiny)

failures = []


def rejected(what, action):
    try:
        action()
        print(f"  ACCEPTED  {what}")
        failures.append(what)
    except (PermissionError, ValueError) as why:
        print(f"  refused   {what}\n            {why}")


def allowed(what, action):
    try:
        action()
        print(f"  granted   {what}")
    except (PermissionError, ValueError) as why:
        print(f"  REFUSED   {what}\n            {why}")
        failures.append(f"{what}: {why}")


record = Record(persons=["lex"])
for name in ("reader", "reader-01", "reader-02", "certifier"):
    record.enroll("lex", name, SYSTEM)

soon = _now() + timedelta(days=7)
distant = _now() + timedelta(days=MAX_DAYS + 1)

print(f"scrutiny 1 — ground_mention (level {scrutiny('ground_mention')})")
allowed("handed over with nothing attached",
        lambda: Delegation.grant(record, "lex", "reader", "ground_mention"))

print(f"\nscrutiny 2 — dispose_flag (level {scrutiny('dispose_flag')})")
rejected("handed over with no reason given",
         lambda: Delegation.grant(record, "lex", "reader", "dispose_flag"))
allowed("handed over with a written rationale",
        lambda: Delegation.grant(record, "lex", "reader", "dispose_flag",
                                 rationale="it triages flags I have already reviewed"))

print(f"\nscrutiny 3 — dispose_flag to a family "
      f"(level {scrutiny('dispose_flag', family=True)})")
rejected("handed to a family with a reason but no term",
         lambda: Delegation.grant(record, "lex", "reader-*", "dispose_flag",
                                  rationale="the triage pool"))
allowed("handed to a family with a reason and a term",
        lambda: Delegation.grant(record, "lex", "reader-*", "dispose_flag",
                                 rationale="the triage pool", expires_at=soon))
rejected("handed to everyone who ever shows up",
         lambda: Delegation.grant(record, "lex", "*", "dispose_flag",
                                  rationale="anyone", expires_at=soon))

print(f"\nscrutiny 5 — certify_model (level {scrutiny('certify_model')})")
rejected("handed over with a reason but no term",
         lambda: Delegation.grant(record, "lex", "certifier", "certify_model",
                                  rationale="it runs the eval suite"))
rejected(f"handed over for longer than {MAX_DAYS} days",
         lambda: Delegation.grant(record, "lex", "certifier", "certify_model",
                                  rationale="it runs the eval suite",
                                  expires_at=distant))
allowed("handed over with a reason and a bounded term",
        lambda: Delegation.grant(record, "lex", "certifier", "certify_model",
                                 rationale="it runs the eval suite",
                                 expires_at=soon))

# The family grant reaches agents that did not exist when it was written.
print("\nwhat a family grant covers:")
record.enroll("lex", "reader-03", SYSTEM)
for who in ("reader-01", "reader-03", "certifier"):
    print(f"  {who:<12} may dispose flags: {record.delegated(who, 'dispose_flag')}")

# And the question the ladder is really about: is the requirement a gate
# passed once, or a condition that must keep being met?
print("\nafter the fact:")
grant = Delegation.grant(record, "lex", "reader-02", "dispose_flag",
                         rationale="temporary cover during the migration")
print(f"  a well-formed grant stands            : "
      f"{record.delegated('reader-02', 'dispose_flag')}")

Delegation.revoke(record, "lex", grant, "migration finished")
print(f"  after lex revokes that grant          : "
      f"{record.delegated('reader-02', 'dispose_flag')}  <- still standing")
print("  because a second grant still covers it:")
for grant_id in record.covering("reader-02", "dispose_flag"):
    covers = record.read(grant_id)
    print(f"    row {grant_id}, written to the family {covers['actor']!r}")

# This is the trap worth carrying into any implementation: revoking the
# grant you remember is not revoking the authority. Coverage has to be
# enumerated, or a withdrawal is a gesture.
for grant_id in list(record.covering("reader-02", "dispose_flag")):
    Delegation.revoke(record, "lex", grant_id, "withdrawing the pool as well")
holds_still = record.delegated("reader-02", "dispose_flag")
print(f"  after revoking everything that covers : {holds_still}  <- authority gone")
if holds_still:
    failures.append("authority survived the revocation of every grant covering it")

lapsed = Delegation.grant(record, "lex", "certifier", "certify_model",
                          rationale="one-off certification",
                          expires_at=_now() + timedelta(seconds=-1))
print(f"  a grant whose term has passed         : "
      f"{record.fault(lapsed)}")
if record.fault(lapsed) is None:
    failures.append("an expired grant still stood")

print("\nthe ledger keeps every attempt, and shows what each is worth:")
for grant_id, why in record.void_grants():
    print(f"  row {grant_id:>3}  {why}")

print()
if failures:
    print("REFUTED:")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
else:
    print("The ladder holds at every rung. What a grant must carry is not a")
    print("form filled in once — it is re-read every time the grant is used,")
    print("so a delegation that outlives its reason stops being one.")
