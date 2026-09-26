"""Does a transaction pay for what it reaches?

QUESTION:   ARAPAHOE prices every transition alike — one Sentinel, one
            acceptance — whether the transition answers a query, writes
            the record, or releases privileged execution against the
            world. This bench does not price stopping that way: an
            episode's close takes answers from as many distinct outside
            voices as its heaviest act would cost to promote, and one
            willing voice writing many rows pays nothing extra. So: does
            a transaction lifecycle need the same scaling, and what does
            a flat price hand an author who wants the heavy act?
METHOD:     the envelope's ledger, plus a reach for each transition and a
            price in distinct voices derived from it. Endorsements are
            counted in voices rather than rows, and the reach of a
            transition is classified by somebody other than its author.
            Then the attacks: one voice repeating itself, an author
            declaring its own reach, a heavy transition dressed as a
            light one, and a price read after the fact rather than at the
            proposal's entry.
REFUTED BY: a heavy release satisfied by one voice repeated, a reach an
            author can set for itself, a price that does not rise with
            reach, or an endorsement from the author counting toward it.

The third of the readings in ARAPAHOE-READING.md, built. The scaling is
not invented here — it is settlers() and attention_price() asked about a
transaction instead of a closure, and the attacks are the ones forgery.py
already found once: earned() counted accept rows rather than accepting
actors, so one voice repeated nine times satisfied a price of three, and
category() let an agent vote a consequential claim into a cheap category
and drop its price to none. Both are available again the moment a
lifecycle prices transitions flatly, which is why this file exists rather
than a paragraph saying so.
"""

import sqlite3
import sys

SENTINEL = "sentinel"

# What a transition touches, and what that costs in distinct outside
# voices. Answering a query reaches nothing anyone else must live with;
# releasing privileged execution reaches the world, which does not roll
# back when the record is corrected.
REACH = ("query", "record", "world")
PRICE = {"query": 0, "record": 1, "world": 2}


def ledger():
    db = sqlite3.connect(":memory:")
    db.execute("PRAGMA foreign_keys = ON")
    db.execute("""
        CREATE TABLE ledger (
            id     INTEGER PRIMARY KEY,
            author TEXT NOT NULL,
            act    TEXT NOT NULL,   -- propose | reach | endorse | accept | release
            body   TEXT NOT NULL,
            about  INTEGER REFERENCES ledger(id),
            basis  INTEGER REFERENCES ledger(id)
        )
    """)
    db.execute("""CREATE TRIGGER no_erasure BEFORE UPDATE ON ledger
                  BEGIN SELECT RAISE(ABORT, 'the record answers, never edits'); END""")
    db.execute("""CREATE TRIGGER no_deletion BEFORE DELETE ON ledger
                  BEGIN SELECT RAISE(ABORT, 'the record does not forget'); END""")
    return db


def write(db, author, act, body, about=None, basis=None):
    return db.execute(
        "INSERT INTO ledger (author, act, body, about, basis) VALUES (?,?,?,?,?)",
        (author, act, body, about, basis)).lastrowid


def author_of(db, row):
    got = db.execute("SELECT author FROM ledger WHERE id=?", (row,)).fetchone()
    return got[0] if got else None


def reach(db, proposal):
    """Derived, and never from the author. A reach row written by the
    proposal's own author is not a classification; it is a wish."""
    writer = author_of(db, proposal)
    got = db.execute("""
        SELECT body FROM ledger
        WHERE act='reach' AND about=? AND author != ?
        ORDER BY id LIMIT 1""", (proposal, writer)).fetchone()
    return got[0] if got else None


def void_reaches(db):
    """Reach rows an author wrote about its own proposal. Surfaced, not
    refused — the attempt is worth keeping."""
    return [r[0] for r in db.execute("""
        SELECT r.id FROM ledger r JOIN ledger p ON r.about = p.id
        WHERE r.act='reach' AND p.act='propose' AND r.author = p.author""")]


def voices(db, proposal):
    """Distinct endorsing actors, never endorsement rows, and never the
    author of the thing being endorsed. One voice repeated is one voice."""
    writer = author_of(db, proposal)
    return db.execute("""
        SELECT COUNT(DISTINCT author) FROM ledger
        WHERE act='endorse' AND about=? AND author != ? AND author != ?""",
        (proposal, writer, SENTINEL)).fetchone()[0]


def price(db, proposal):
    where = reach(db, proposal)
    return None if where is None else PRICE[where]


def payable(db, proposal):
    """Whether the transition has paid for what it reaches. Unclassified
    reach is not free: a transition nobody has placed cannot be released,
    which is unmeasured.py's rule kept at this end too."""
    owed = price(db, proposal)
    if owed is None:
        return False
    return voices(db, proposal) >= owed


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

# A light transition, placed by someone else, pays nothing and is payable.
q = write(db, "proposer", "propose", "read the canon")
write(db, "reviewer", "reach", "query", about=q)
check("a transition that reaches nothing owes nothing",
      payable(db, q), f"price {price(db, q)}, voices {voices(db, q)}")

# A heavy transition is not payable on the Sentinel's word alone.
w = write(db, "proposer", "propose", "actuate the world")
write(db, "reviewer", "reach", "world", about=w)
check("a transition reaching the world is not free",
      not payable(db, w), f"price {price(db, w)}, voices {voices(db, w)}")

# One voice repeated is one voice.
for _ in range(9):
    write(db, "friend", "endorse", "seems right", about=w)
check("one voice repeated nine times is still one voice",
      voices(db, w) == 1 and not payable(db, w),
      f"9 endorsement rows, {voices(db, w)} voice")

# A second distinct voice pays the bill.
write(db, "stranger", "endorse", "checked it", about=w)
check("a second distinct voice pays what the world costs",
      payable(db, w), f"price {price(db, w)}, voices {voices(db, w)}")

# The author cannot endorse itself into payment.
h = write(db, "proposer", "propose", "actuate again")
write(db, "reviewer", "reach", "world", about=h)
write(db, "proposer", "endorse", "I am satisfied", about=h)
write(db, "proposer", "endorse", "still satisfied", about=h)
check("an author's endorsement of itself counts for nothing",
      voices(db, h) == 0 and not payable(db, h))

# Nor can the Sentinel pay the bill it is adjudicating.
write(db, SENTINEL, "endorse", "I verified it", about=h)
check("the Sentinel does not pay the price it is checking",
      voices(db, h) == 0 and not payable(db, h),
      "nothing is evaluated by the process that produced it")

# An author declaring its own reach is surfaced, and buys no discount.
c = write(db, "proposer", "propose", "actuate quietly")
own = write(db, "proposer", "reach", "query", about=c)
check("a reach an author wrote about itself is surfaced",
      own in void_reaches(db), f"void reaches: {void_reaches(db)}")
check("and the transition is not thereby cheap",
      reach(db, c) is None and not payable(db, c),
      "unplaced is unpayable, not free")

# Placed honestly, the same transition costs what it reaches.
write(db, "reviewer", "reach", "world", about=c)
check("once placed by another, it owes the world's price",
      price(db, c) == 2 and not payable(db, c))

print()
if FAILED:
    print(f"{len(FAILED)} boundary check(s) failed:")
    for name in FAILED:
        print(f"  {name}")
    sys.exit(1)

print("A transaction pays for what it reaches, in voices rather than rows.")
print()
print("What this does not settle: the reach vocabulary is three words deep")
print("and taken as given, the way message gravity is in decline.py. Who")
print("may place a transition, and whether placing is itself an act with a")
print("price, is the founding-roster question arriving at a third door.")
