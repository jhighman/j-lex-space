"""sentinel — a small working model of the Architecture of Contextual Judgment.

After Alexandra Krížová, "Architecture of Contextual Judgment: Governed
Epistemic Transitions" (first edition, 2026; peer reviewer Jeff Highman).
This is not the dissertation's reference implementation — it is the
smallest honest sketch of its load-bearing ideas, sized for this project:

  1. One record type. Everything the system knows is an assertion: an
     accountable claim by someone, about something — including about
     another assertion. Immutable once written.
  2. Derived, never stored. A claim's category and a promotion's verdict
     are computed at read time from the standing record, never cached.
  3. The Sentinel Principle. No claim promotes itself: the step from one
     epistemic state to the next must be accepted by someone independent.
     "Trust is the discipline of preventing inference from becoming
     evidence."
  4. Closure is the constructor, not a gate. A case that has not closed
     does not exist, so a premature judgment cannot even be requested.

The record is an in-memory sqlite database: real tables, real queries,
gone when the program ends.
"""

import sqlite3

# The epistemic chain. Each state may only be reached from the one before.
CHAIN = ["observation", "interpretation", "belief", "action"]


class Record:
    """The append-only record. There is no update and no delete —
    immutability here is not a rule we follow but a method we never wrote."""

    def __init__(self):
        self.db = sqlite3.connect(":memory:")
        self.db.execute(
            """CREATE TABLE assertions (
                   id      INTEGER PRIMARY KEY,
                   author  TEXT NOT NULL,   -- who is accountable for this
                   act     TEXT NOT NULL,   -- assert / classify / accept / ...
                   body    TEXT NOT NULL,   -- what is claimed
                   about   INTEGER,         -- another assertion, if any
                   basis   INTEGER          -- the claim this one is built on
               )"""
        )

    def write(self, author, act, body, about=None, basis=None):
        cur = self.db.execute(
            "INSERT INTO assertions (author, act, body, about, basis) VALUES (?,?,?,?,?)",
            (author, act, body, about, basis),
        )
        return cur.lastrowid

    def read(self, id):
        row = self.db.execute(
            "SELECT id, author, act, body, about, basis FROM assertions WHERE id=?",
            (id,),
        ).fetchone()
        return dict(zip(["id", "author", "act", "body", "about", "basis"], row))

    # -- everything below is derived at read time, never stored --

    def category(self, claim_id):
        """What kind of claim is this? Whatever a strict majority of the
        classify-acts about it said. No majority means: the system does
        not know — and says so, rather than guessing."""
        votes = self.db.execute(
            "SELECT body, COUNT(*) FROM assertions"
            " WHERE act='classify' AND about=? GROUP BY body",
            (claim_id,),
        ).fetchall()
        total = sum(n for _, n in votes)
        for body, n in votes:
            if n * 2 > total:
                return body
        return None

    def earned(self, claim_id):
        """Has this claim's promotion been earned? Only if someone other
        than its author accepted it. This is the Sentinel Principle as a
        query: the author's own accepts are simply not counted."""
        author = self.read(claim_id)["author"]
        n = self.db.execute(
            "SELECT COUNT(*) FROM assertions"
            " WHERE act='accept' AND about=? AND author != ?",
            (claim_id, author),
        ).fetchone()[0]
        return n > 0


def claim(record, author, category, body, basis=None):
    """State something on the record, at a declared point in the chain.
    A claim above the first state must name the claim it is built on."""
    if category not in CHAIN:
        raise ValueError(f"unknown epistemic state: {category}")
    if category != CHAIN[0] and basis is None:
        raise ValueError(f"{category} must be built on a prior claim (basis=)")
    id = record.write(author, "assert", body, basis=basis)
    record.write(author, "classify", category, about=id)
    return id


def accept(record, author, claim_id, note="reviewed"):
    """Accept a claim's promotion — as yourself, on the record. If you are
    its author, this is written down and then never counted: a mirror,
    not a gate. The record shows the attempt; the derived verdict ignores it."""
    return record.write(author, "accept", note, about=claim_id)


class Case:
    """A closed episode — an edge from its first claim to its last.

    There is no Case.open(). The only constructor closes; an unclosed case
    is not an object that exists, so nothing can be asked about it. That
    is the difference between a policy and an invariant: a policy is a
    rule the system follows, an invariant is a state it cannot be in."""

    def __init__(self, *args, **kwargs):
        raise TypeError("a case that has not closed does not exist — use Case.close()")

    @classmethod
    def close(cls, record, claim_ids):
        case = object.__new__(cls)
        case.record = record
        case.claims = list(claim_ids)
        return case

    def judge(self, judge_author):
        """One judgment, of the whole case, after closure. Walks every
        step in the episode and reports whether each promotion was earned.
        The judge must be independent of every claim in the case."""
        for id in self.claims:
            if self.record.read(id)["author"] == judge_author:
                return {"verdict": "refused",
                        "reason": f"{judge_author} authored claims in this case"}
        steps = []
        for id in self.claims:
            a = self.record.read(id)
            if a["basis"] is not None:
                steps.append({
                    "step": f"{self.record.category(a['basis'])} -> {self.record.category(id)}",
                    "claim": a["body"],
                    "earned": self.record.earned(id),
                })
        return {"verdict": "judged", "steps": steps}
