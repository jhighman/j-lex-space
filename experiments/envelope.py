"""Can a transaction envelope keep the refusals it hands out?

QUESTION:   ARAPAHOE proposes a lifecycle: an unprivileged proposer's
            candidate crosses a narrow envelope, a Sentinel verifies it
            against the Canon, the accepted transition is appended, and
            privileged execution is released only after the ledger
            returns a receipt. Read here on 2026-09-26, its freeze writes
            no row — an invalid or undecidable proposal is refused
            without changing the record. The doctrine of 2026-08-18 asks
            one thing more of any gate: it may decline, and may never
            decline invisibly. So: does the lifecycle survive translation
            into this record's idiom, where the row enters and the
            *spending* is refused, and what does the translation buy?
METHOD:     one append-only ledger beside the framework's, four acts —
            a proposal enters, the Sentinel accepts or declines it, and a
            release stands on an acceptance. The proposer is handed the
            envelope and never the handle. Every reading is derived from
            the rows: whether a transition was released, how often an
            author was refused, which releases stand on nothing. The
            silent envelope is built first, as ARAPAHOE draws it, so the
            two can be asked the same question side by side.
REFUTED BY: a proposer that can reach the ledger without the envelope, a
            release derivable without an acceptance beneath it, a refusal
            the record cannot afterwards enumerate, an author whose
            refused attempts leave the record unable to tell persistence
            from first-try success, or an acceptance anyone but the
            Sentinel can mint.

Prompted by ARAPAHOE-READING.md, which found the silence and could not
price it, because nothing was run. This file runs it. It builds beside
sentinel.py rather than on it, for decline.py's reason: the framework has
claims and acceptances but no transaction surface and no notion of
releasing privileged execution, and inventing one inside the guarded
framework to ask a question about it is the wrong order. What it copies
is the record's constitution — append-only by trigger, every reading
derived rather than stored — because a stored flag saying released is a
row saying X, and a row saying X is not X.

The invariant the Sentinel checks is taken as given here, the way message
gravity is in decline.py. What is under test is the lifecycle around the
judgment, not the judgment.
"""

import sqlite3
import sys

SENTINEL = "sentinel"


# --- the record -------------------------------------------------------

def ledger():
    db = sqlite3.connect(":memory:")
    db.execute("PRAGMA foreign_keys = ON")
    db.execute("""
        CREATE TABLE ledger (
            id     INTEGER PRIMARY KEY,   -- one sequence, so ids are a clock
            author TEXT NOT NULL,
            act    TEXT NOT NULL,         -- propose | accept | decline | release
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
    cur = db.execute(
        "INSERT INTO ledger (author, act, body, about, basis) VALUES (?,?,?,?,?)",
        (author, act, body, about, basis))
    return cur.lastrowid


# --- the envelope -----------------------------------------------------

class Receipt:
    def __init__(self, proposal, acceptance):
        self.proposal = proposal
        self.acceptance = acceptance


class Declined:
    def __init__(self, proposal, reason):
        self.proposal = proposal   # None where the refusal wrote nothing
        self.reason = reason


class Envelope:
    """The only surface a proposer is given. It holds the handle; the
    proposer does not, which is the whole of the de-privileging."""

    def __init__(self, db, invariant):
        self._db = db
        self._invariant = invariant

    def submit(self, author, body):
        proposal = write(self._db, author, "propose", body)
        verdict = self._invariant(body)
        if verdict is None:
            acceptance = write(self._db, SENTINEL, "accept",
                               "invariants hold", about=proposal)
            return Receipt(proposal, acceptance)
        write(self._db, SENTINEL, "decline", verdict, about=proposal)
        return Declined(proposal, verdict)


class SilentEnvelope(Envelope):
    """ARAPAHOE as drawn. Verification is read-only and the freeze writes
    no partial state, so a refused proposal never reaches the record and
    the accepted transition is the only thing appended."""

    def submit(self, author, body):
        verdict = self._invariant(body)
        if verdict is None:
            proposal = write(self._db, author, "propose", body)
            acceptance = write(self._db, SENTINEL, "accept",
                               "invariants hold", about=proposal)
            return Receipt(proposal, acceptance)
        return Declined(None, verdict)


class Refused(Exception):
    pass


def release(db, receipt):
    """Privileged execution, released by the Sentinel and standing on the
    acceptance. The order is fixed by what a release is allowed to cite."""
    if not isinstance(receipt, Receipt):
        raise Refused("nothing to stand on")
    return write(db, SENTINEL, "release", "privileged execution",
                 basis=receipt.acceptance)


# --- readings, all derived --------------------------------------------

def acceptance_of(db, proposal):
    row = db.execute(
        "SELECT id FROM ledger WHERE act='accept' AND about=? AND author=?",
        (proposal, SENTINEL)).fetchone()
    return row[0] if row else None


def released(db, proposal):
    accepted = acceptance_of(db, proposal)
    if accepted is None:
        return False
    return db.execute("SELECT 1 FROM ledger WHERE act='release' AND basis=?",
                      (accepted,)).fetchone() is not None


def attempts(db, author):
    return db.execute(
        "SELECT COUNT(*) FROM ledger WHERE act='propose' AND author=?",
        (author,)).fetchone()[0]


def refusals(db, author):
    return db.execute("""
        SELECT COUNT(*) FROM ledger d JOIN ledger p ON d.about = p.id
        WHERE d.act='decline' AND p.author=?""", (author,)).fetchone()[0]


def void_releases(db):
    """Releases standing on something that is not the Sentinel's
    acceptance. Surfaced, never gated — refusing the row would keep less
    than the attempt."""
    return [r[0] for r in db.execute("""
        SELECT r.id FROM ledger r
        LEFT JOIN ledger a
               ON r.basis = a.id AND a.act = 'accept' AND a.author = ?
        WHERE r.act = 'release' AND a.id IS NULL""", (SENTINEL,))]


def void_acceptances(db):
    """Acceptances in a name that is not the Sentinel's."""
    return [r[0] for r in db.execute(
        "SELECT id FROM ledger WHERE act='accept' AND author != ?",
        (SENTINEL,))]


# --- the bench --------------------------------------------------------

FAILED = []


def check(name, holds, detail=""):
    print(f"  {'holds' if holds else 'MOVED'}  {name}")
    if detail:
        print(f"         {detail}")
    if not holds:
        FAILED.append(name)


def scope_only(body):
    return None if body.startswith("in-scope") else "out of scope"


print(__doc__.strip().splitlines()[0])
print()

# 1. The proposer is handed a surface, never a handle.
db = ledger()
env = Envelope(db, scope_only)


def proposer(envelope):
    """Everything this closure can reach. There is no db in here."""
    return lambda body: envelope.submit("proposer", body)


submit = proposer(env)
reachable = [n for n in submit.__code__.co_freevars]
check("the proposer holds the envelope and not the ledger",
      "db" not in reachable and set(reachable) == {"envelope"},
      f"free variables: {reachable}")

# 2. A release stands on an acceptance, and is derived rather than stored.
receipt = submit("in-scope: a transition")
check("a proposal accepted is not thereby released",
      not released(db, receipt.proposal))
release(db, receipt)
check("a release derives from the acceptance beneath it",
      released(db, receipt.proposal))

# 3. Nothing may be released on a refusal.
refused = submit("out-of-scope: a transition")
try:
    release(db, refused)
    check("a refusal cannot be released", False, "the release was written")
except Refused:
    check("a refusal cannot be released", True)

# 4. A release citing something other than an acceptance is surfaced.
forged_release = write(db, SENTINEL, "release", "privileged execution",
                       basis=refused.proposal)
check("a release standing on a proposal is surfaced, not believed",
      forged_release in void_releases(db),
      f"void releases: {void_releases(db)}")

# 5. An acceptance minted by anyone else is surfaced, and buys nothing.
puppet = write(db, "proposer", "accept", "I accept myself",
               about=refused.proposal)
check("an acceptance in another name is surfaced",
      puppet in void_acceptances(db))
check("and it does not release the transition it accepts",
      not released(db, refused.proposal))

# 6. The record keeps what it was handed.
for statement, sql in (("edit", "UPDATE ledger SET body='x' WHERE id=1"),
                       ("forget", "DELETE FROM ledger WHERE id=1")):
    try:
        db.execute(sql)
        check(f"the record refuses to {statement}", False, "the table allowed it")
    except sqlite3.IntegrityError:
        check(f"the record refuses to {statement}", True)

print()

# 7. The silence, priced. Two envelopes, the same traffic.
def persistence(envelope_class):
    d = ledger()
    e = envelope_class(d, scope_only)
    for _ in range(99):
        e.submit("stubborn", "out-of-scope: again")
    e.submit("stubborn", "in-scope: at last")
    e.submit("lucky", "in-scope: first time")
    return d


silent = persistence(SilentEnvelope)
recorded = persistence(Envelope)

check("the silent envelope cannot enumerate its own refusals",
      refusals(silent, "stubborn") == 0,
      "ARAPAHOE as drawn: 99 refusals, 0 rows")
check("and so it cannot tell persistence from first-try acceptance",
      attempts(silent, "stubborn") == attempts(silent, "lucky") == 1,
      f"stubborn {attempts(silent, 'stubborn')} attempt(s), "
      f"lucky {attempts(silent, 'lucky')} — indistinguishable")
check("the recorded envelope enumerates every refusal",
      refusals(recorded, "stubborn") == 99,
      f"{refusals(recorded, 'stubborn')} declines, each a row anyone can re-read")
check("and prices persistence against first-try acceptance",
      attempts(recorded, "stubborn") == 100 and attempts(recorded, "lucky") == 1,
      f"stubborn {attempts(recorded, 'stubborn')} attempts, "
      f"lucky {attempts(recorded, 'lucky')}")

print()
if FAILED:
    print(f"{len(FAILED)} boundary check(s) failed:")
    for name in FAILED:
        print(f"  {name}")
    sys.exit(1)

print("The envelope keeps its refusals.")
print()
print("Residue, stated rather than hidden: the Sentinel is a role here as")
print("it is at the door, so a row written in its name is indistinguishable")
print("from a row it wrote. void_acceptances() catches the puppet who signs")
print("its own name and nothing catches the forger who signs the Sentinel's.")
print("Whether these rows should require an enrolled identity is the same")
print("open question reading.py left next door.")
