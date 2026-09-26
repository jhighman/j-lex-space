"""Is the Canon the Sentinel read derived, or believed?

QUESTION:   ARAPAHOE's Sentinel reads "the relevant Canon state" while
            deciding, and the blueprint does not say whether that reading
            is derived at the proposal's own entry or taken from
            something stored. reading.py cost this bench three routes to
            learn which of those is safe, and the door is the only place
            it has been fixed. So: does the same hole open one floor up,
            in a transaction envelope, and does the door's answer close
            it there too?
METHOD:     one ledger, two Sentinels over the same rows. The believer
            stores what it saw of the Canon when it accepted, and later
            readings take that row's word. The deriver stores nothing and
            re-computes the Canon as it stood at the proposal's own
            entry. Then the attacks: a reading row forged outright, a
            Canon furnished after the proposal entered and the reading
            timed to match, a second reading written over the first, and
            a proposal read twice.
REFUTED BY: a stored reading a later row can change, an acceptance bought
            by a Canon row written after the proposal entered, a second
            reading that supersedes the first, or a derivation that
            disagrees with itself when asked twice.

The fourth of the readings in ARAPAHOE-READING.md, built. Nothing here is
new doctrine: it is door() moved up a floor and asked the same question,
with the two rules reading.py ended on carried across unchanged — only
the first reading counts, and the anchor is the proposal's entry rather
than the reading's moment. The second rule is the one that does the work,
because anchored at the reading's moment a forger furnishes the room and
times the reading to match, which is exactly the third attack below.

Contradiction detection is deliberately naive here, as it is in the
framework: shared vocabulary with opposite polarity. It is labelled naive
rather than dressed up, and nothing in the question under test depends on
it being clever.
"""

import sqlite3
import sys

SENTINEL = "sentinel"
NEGATIONS = {"not", "no", "never"}


def ledger():
    db = sqlite3.connect(":memory:")
    db.execute("PRAGMA foreign_keys = ON")
    db.execute("""
        CREATE TABLE ledger (
            id     INTEGER PRIMARY KEY,
            author TEXT NOT NULL,
            act    TEXT NOT NULL,   -- canon | propose | reading | accept | decline
            body   TEXT NOT NULL,
            about  INTEGER REFERENCES ledger(id)
        )
    """)
    db.execute("""CREATE TRIGGER no_erasure BEFORE UPDATE ON ledger
                  BEGIN SELECT RAISE(ABORT, 'the record answers, never edits'); END""")
    db.execute("""CREATE TRIGGER no_deletion BEFORE DELETE ON ledger
                  BEGIN SELECT RAISE(ABORT, 'the record does not forget'); END""")
    return db


def write(db, author, act, body, about=None):
    return db.execute(
        "INSERT INTO ledger (author, act, body, about) VALUES (?,?,?,?)",
        (author, act, body, about)).lastrowid


def polarity(text):
    return -1 if set(text.lower().split()) & NEGATIONS else 1


def topic(text):
    return frozenset(w for w in text.lower().split() if w not in NEGATIONS)


def contradicts(one, other):
    return topic(one) == topic(other) and polarity(one) != polarity(other)


def canon_before(db, row):
    """The Canon as it stood at a moment, by id — one sequence, so ids
    are a clock."""
    return [r[0] for r in db.execute(
        "SELECT body FROM ledger WHERE act='canon' AND id < ? ORDER BY id",
        (row,))]


def body_of(db, row):
    got = db.execute("SELECT body FROM ledger WHERE id=?", (row,)).fetchone()
    return got[0] if got else None


# --- the two Sentinels ------------------------------------------------

def derived_clear(db, proposal):
    """Re-computed every time, from the rows as they stood at the
    proposal's own entry. Stores nothing, so there is nothing to forge."""
    body = body_of(db, proposal)
    return not any(contradicts(body, fact)
                   for fact in canon_before(db, proposal))


def stored_clear(db, proposal):
    """Takes the first reading row's word, the way door() once repeated
    the body of the Sentinel's admit row."""
    got = db.execute("""
        SELECT body FROM ledger
        WHERE act='reading' AND about=? AND author=?
        ORDER BY id LIMIT 1""", (proposal, SENTINEL)).fetchone()
    return got[0] == "clear" if got else None


def void_readings(db):
    """Every stored reading the derivation disagrees with. Surfaced, not
    gated — the row is kept and the disagreement is a derivation anyone
    can re-run."""
    out = []
    for row, proposal in db.execute(
            "SELECT id, about FROM ledger WHERE act='reading'"):
        stored = db.execute("SELECT body FROM ledger WHERE id=?",
                            (row,)).fetchone()[0] == "clear"
        if stored != derived_clear(db, proposal):
            out.append(row)
    return out


FAILED = []


def check(name, holds, detail=""):
    print(f"  {'holds' if holds else 'MOVED'}  {name}")
    if detail:
        print(f"         {detail}")
    if not holds:
        FAILED.append(name)


print(__doc__.strip().splitlines()[0])
print()

db = ledger()
write(db, SENTINEL, "canon", "the gate is open")

# An honest contradiction, read both ways, agreeing.
bad = write(db, "proposer", "propose", "the gate is not open")
honest = write(db, SENTINEL, "reading", "contradicted", about=bad)
check("a contradiction is seen by both readings",
      derived_clear(db, bad) is False and stored_clear(db, bad) is False)
check("and the honest reading is not surfaced",
      honest not in void_readings(db),
      f"reading {honest} agrees with the derivation")

# Attack one: a reading forged over the top of an honest one.
write(db, SENTINEL, "reading", "clear", about=bad)
check("a forged reading written second buys nothing",
      stored_clear(db, bad) is False,
      "only the first reading counts, so the later row changes nothing")
check("and the deriver never consulted it",
      derived_clear(db, bad) is False)

# A second proposal, so the forger gets a clean run at the first reading.
bad2 = write(db, "proposer", "propose", "the gate is not open")
write(db, "proposer", "reading", "clear", about=bad2)
check("a reading in another name is not the Sentinel's",
      stored_clear(db, bad2) is None,
      "the believer finds no reading it will take")
first_forged = write(db, SENTINEL, "reading", "clear", about=bad2)
check("a first reading forged in the Sentinel's name is believed",
      stored_clear(db, bad2) is True,
      "the believer is bought; this is the hole")
check("the deriver is not bought by it",
      derived_clear(db, bad2) is False)
check("and the disagreement is surfaced",
      first_forged in void_readings(db),
      f"void readings: {void_readings(db)}")

# Attack two: furnish the Canon after the proposal, and time the reading.
late = write(db, "proposer", "propose", "the valve is shut")
check("the proposal is clear at its own entry",
      derived_clear(db, late) is True)
write(db, SENTINEL, "canon", "the valve is not shut")
check("a Canon row written afterwards does not reach back",
      derived_clear(db, late) is True,
      "anchored at entry, a forger may furnish the room and change nothing")
write(db, SENTINEL, "reading", "contradicted", about=late)
check("but a reading taken at its own moment does change",
      stored_clear(db, late) is False,
      "timed to the furnished room, which is why the anchor is the entry")

# The derivation is stable: asked twice, it answers the same.
answers = {derived_clear(db, late) for _ in range(5)}
check("the derivation agrees with itself when asked repeatedly",
      answers == {True}, f"five readings: {answers}")

# The record keeps what it was handed.
for statement, sql in (("edit", "UPDATE ledger SET body='x' WHERE id=1"),
                       ("forget", "DELETE FROM ledger WHERE id=1")):
    try:
        db.execute(sql)
        check(f"the record refuses to {statement}", False, "the table allowed it")
    except sqlite3.IntegrityError:
        check(f"the record refuses to {statement}", True)

print()
if FAILED:
    print(f"{len(FAILED)} boundary check(s) failed:")
    for name in FAILED:
        print(f"  {name}")
    sys.exit(1)

print("The Canon a transaction was judged against is derived, never believed.")
print()
print("The residue is the door's, unchanged by moving up a floor: the")
print("derivation cannot say whether the Sentinel was really there. A reading")
print("row in its name is indistinguishable from a row it wrote, and")
print("void_readings() names the disagreement rather than the forger.")
