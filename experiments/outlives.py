"""What does a released action leave live when the releaser dies?

QUESTION:   ARAPAHOE fixes an ordering — append the accepted transition,
            take the receipt, and only then release privileged execution
            — and that ordering is the right way round, because a death
            mid-transaction then leaves a record with no action rather
            than an action with no record. But a released action is state
            the process wrote outside itself, and the blueprint carries
            no term on it and no reconciler that does not share its fate.
            So: what stays live in the world when the releaser stops, and
            what can the record afterwards say about it?
METHOD:     a world beside the ledger — live effects the ledger cannot
            reach and which do not vanish when the releaser does — and a
            deterministic clock, because a term measured in wall time is
            a term nobody can replay. Releases carry a lease or carry
            none. Then the releaser dies mid-flight, and two reconcilers
            are asked to clean up: one that shares its fate and one that
            does not.
REFUTED BY: an effect the record cannot afterwards name, a lease the
            holder can extend from inside, a reconciler that needs the
            dead releaser to tell it what was live, or a reclamation that
            leaves the record unable to say what was taken back.

The sixth of the readings in ARAPAHOE-READING.md, and the one that did
not come from this bench. It comes from the signal-boundary papers next
door, whose third round measured nine ways of dying and found that six of
them run teardown, that the three which do not strand nothing held in
memory — the operating system reclaims it, which is a stronger guarantee
than any teardown — and that what strands is what the process wrote
outside itself. A privileged execution is exactly that, which is why the
question arrives here rather than staying there.

The payoff is a defence of ARAPAHOE's own ordering. Appending before
releasing is what makes reconciliation possible at all: an effect whose
release was never recorded is an orphan no reconciler can name, and the
last check below is that residue rather than a success.
"""

import sqlite3
import sys

SENTINEL = "sentinel"


def ledger():
    db = sqlite3.connect(":memory:")
    db.execute("PRAGMA foreign_keys = ON")
    db.execute("""
        CREATE TABLE ledger (
            id     INTEGER PRIMARY KEY,
            author TEXT NOT NULL,
            act    TEXT NOT NULL,   -- accept | release | lease | reclaim
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


class World:
    """Not the ledger, and not reclaimed when the releaser stops. A valve
    that was opened stays open; nothing about a process ending closes it."""

    def __init__(self):
        self.live = {}          # effect -> the release row that opened it

    def actuate(self, effect, release_row):
        self.live[effect] = release_row

    def reclaim(self, effect):
        self.live.pop(effect, None)


class Releaser:
    """Holds the handle and the world. Dies as a whole."""

    def __init__(self, db, world, clock):
        self.db, self.world, self.clock = db, world, clock

    def release(self, effect, lease=None):
        acceptance = write(self.db, SENTINEL, "accept", effect)
        # Appended before the world is touched. This ordering is the
        # whole of what a later reconciler has to work with.
        row = write(self.db, SENTINEL, "release", effect, about=acceptance)
        if lease is not None:
            write(self.db, SENTINEL, "lease", str(self.clock[0] + lease),
                  about=row)
        self.world.actuate(effect, row)
        return row

    def reconcile(self, now):
        """A reconciler that shares fate with the releaser. It is a method
        on the thing that may die, which is the defect."""
        return reclaim_expired(self.db, self.world, now)


def expiry(db, release_row):
    """The first lease written against a release, and only the first.
    A term the holder can extend from inside is not a term."""
    got = db.execute("""
        SELECT body FROM ledger WHERE act='lease' AND about=?
        ORDER BY id LIMIT 1""", (release_row,)).fetchone()
    return int(got[0]) if got else None


def named(db, world):
    """Live effects the record can identify, by the release that opened
    them."""
    return {e for e, row in world.live.items()
            if db.execute("SELECT 1 FROM ledger WHERE id=? AND act='release'",
                          (row,)).fetchone()}


def orphaned(db, world):
    """Live effects the record cannot name. Nothing can reclaim these on
    purpose, because nothing knows they are there."""
    return set(world.live) - named(db, world)


def stranded(db, world, now):
    """Derived: live effects past their term, and live effects that never
    had one. The second kind is the worse kind — an intention nobody can
    see expiring."""
    expired, unbounded = set(), set()
    for effect, row in world.live.items():
        until = expiry(db, row)
        if until is None:
            unbounded.add(effect)
        elif until <= now:
            expired.add(effect)
    return expired, unbounded


def reclaim_expired(db, world, now):
    """A free function over the record and the world. It shares fate with
    neither, which is the only property that matters about it."""
    expired, _ = stranded(db, world, now)
    for effect in sorted(expired):
        world.reclaim(effect)
        write(db, "reconciler", "reclaim", effect)
    return sorted(expired)


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
world = World()
clock = [0]
releaser = Releaser(db, world, clock)

leased = releaser.release("valve-A", lease=5)
forever = releaser.release("valve-B")
check("a release is recorded before the world is touched",
      db.execute("SELECT id FROM ledger WHERE id=?", (leased,)).fetchone()
      is not None and "valve-A" in world.live)
check("both effects are live, and both are named by the record",
      named(db, world) == {"valve-A", "valve-B"})

# The releaser dies mid-flight. The world does not.
releaser = None
check("the world does not close when the releaser stops",
      world.live.keys() == {"valve-A", "valve-B"},
      "no teardown ran; nothing about a death shuts a valve")

# The record can still say what is live and what is past its term.
clock[0] = 6
expired, unbounded = stranded(db, world, clock[0])
check("the record names what is past its term",
      expired == {"valve-A"}, f"expired: {sorted(expired)}")
check("and what never had one",
      unbounded == {"valve-B"}, f"unbounded: {sorted(unbounded)}")

# A reconciler that does not share fate can act on that.
taken = reclaim_expired(db, world, clock[0])
check("a reconciler that shares no fate reclaims the expired",
      taken == ["valve-A"] and "valve-A" not in world.live)
check("and the reclamation is a row, not an absence",
      db.execute("SELECT COUNT(*) FROM ledger WHERE act='reclaim'").fetchone()[0] == 1)
check("what never had a term is still live",
      "valve-B" in world.live,
      "a lapsed permission is a permission withdrawn; this had none to lapse")

# A lease cannot be extended from inside. The clock stands at 6, so a
# term of 2 falls due at 8 — a lease is a moment, not a duration, once
# it is written.
again = Releaser(db, world, clock)
later = again.release("valve-C", lease=2)
write(db, SENTINEL, "lease", "9999", about=later)
check("only the first lease against a release counts",
      expiry(db, later) == 8,
      f"a second lease row asked for 9999; expiry reads {expiry(db, later)}")
clock[0] = 9
check("so the extension does not keep the effect alive",
      "valve-C" in reclaim_expired(db, world, clock[0]))

# A reconciler that shares fate reclaims nothing, because it is gone.
mortal = Releaser(db, world, clock)
mortal.release("valve-D", lease=1)
mortal = None
clock[0] = 11
check("a reconciler that shared the releaser's fate cannot be called",
      mortal is None,
      "the method died with the object; only the free function survives")
check("the free function still reclaims what the dead releaser opened",
      "valve-D" in reclaim_expired(db, world, clock[0]))

# The residue: an effect released without being recorded.
world.actuate("valve-E", 99999)
check("an effect whose release was never appended cannot be named",
      orphaned(db, world) == {"valve-E"},
      "append-before-release is what makes the rest of this possible")
expired, unbounded = stranded(db, world, clock[0])
check("and it is not reclaimed, because nothing knows it is there",
      "valve-E" in world.live)

print()
if FAILED:
    print(f"{len(FAILED)} boundary check(s) failed:")
    for name in FAILED:
        print(f"  {name}")
    sys.exit(1)

print("What outlives the releaser is named by the record, and reclaimed from")
print("outside it.")
print()
print("Two things this does not settle. A term is a policy and this file")
print("takes it as given, the way reach is taken as given next door — who")
print("sets it, and whether a term may be set by the thing it binds, is the")
print("same question a third time. And the reconciler is trusted here: it")
print("writes reclaim rows in its own name, and nothing checks that what it")
print("took back was past its term. A reconciler is a role, not an enrolled")
print("identity, which is where the door still stands.")
