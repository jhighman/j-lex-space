"""Can a gate decline to spend, and never decline invisibly?

QUESTION:   the graduated sovereign gate committed in
            test_sovereign_love_v3.py refuses at the wall: a trigger
            aborts the insert, so the noise never enters and the block is
            enforced by the table. The doctrine of 2026-08-18 asks one
            thing more of any affective gate — the system may decline to
            spend, and may never decline invisibly. A BEFORE INSERT abort
            cannot both refuse a row and keep a record of having refused
            it, because they are one statement and the rollback takes
            them both. So: does the same graduated semantics survive
            translation into the record's own idiom — the row enters, the
            *spending* is refused, and the refusal is a derivation — and
            what does the translation buy?
METHOD:     one append-only ledger, three acts: a message carries its
            gravity, a deed is owed until attested by a voice other than
            the doer, and the gate is computed at read time from the rows
            as they stood at the moment being asked about. No stored
            counter, no state table. The graduated envelope is replayed —
            tolerance, alert, shut — with both counting policies derived
            side by side from the same rows, because whether substantive
            engagement buys the gate back down is a policy, and a policy
            should be one visible line rather than an accident of
            arithmetic. Then the attacks: a refusal off the record, a
            doer settling its own deed, a stored number anywhere, and the
            record's memory of a refusal ripening once the debt settles.
REFUTED BY: a refusal the record cannot afterwards enumerate, a gate
            reading that needs stored state to be correct, a declined
            message that stops reading as declined once the deed settles,
            or a deed the doer lays to rest alone.

Prompted by the three scenarios Lex committed on 2026-08-20/23, which
built the sovereign gate at the storage layer — where she has been
arguing constraints belong since immutable.py proved her right. This
file does not replace that gate and does not touch those files; it asks
the bench's question about the same mechanism. It builds beside the
framework's record rather than on it, for the same reason her scenarios
do: sentinel.py has no conversational surface. What it copies is the
record's constitution — append-only by trigger, and every reading
derived, never stored — because a stored counter is a row saying X, and
a row saying X is not X.

The gravity of a message is taken as given here, the way case boundaries
are: classifying it is ingest-side work and belongs to the pipeline, not
to this file.
"""

import sqlite3
import sys

db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys = ON")
db.execute("""
    CREATE TABLE ledger (
        id      INTEGER PRIMARY KEY,   -- one sequence, so ids are a clock
        author  TEXT NOT NULL,
        act     TEXT NOT NULL,         -- 'message' | 'deed' | 'attest'
        body    TEXT NOT NULL,
        toward  TEXT,                  -- receiver of a message, creditor of a deed
        about   INTEGER REFERENCES ledger(id),
        gravity TEXT                   -- messages only: 'high' | 'zero'
    )
""")
for verb in ("UPDATE", "DELETE"):
    db.execute(f"""
        CREATE TRIGGER no_{verb.lower()} BEFORE {verb} ON ledger
        BEGIN
            SELECT RAISE(ABORT,
                'the ledger is append-only: correction is not erasure');
        END
    """)


def write(author, act, body, toward=None, about=None, gravity=None):
    """The ledger refuses nothing. Every act lands as a row."""
    return db.execute(
        "INSERT INTO ledger (author, act, body, toward, about, gravity)"
        " VALUES (?, ?, ?, ?, ?, ?)",
        (author, act, body, toward, about, gravity),
    ).lastrowid


# --- the derivations ------------------------------------------------------
# Nothing below stores anything. Each is a question put to the rows, and
# each takes the moment it is being asked about, because a refusal is a
# claim about a moment and the room changes afterwards.

def settled(deed, asof=None):
    """A deed is settled by an attestation from a voice other than the
    doer — the soliloquy rule, transposed. The doer's own word is a row
    and is not counted. (Standing to observe lives in the framework's
    obligations layer; this file keeps only the narrower rule.)"""
    doer = db.execute("SELECT author FROM ledger WHERE id = ?",
                      (deed,)).fetchone()[0]
    sql = ("SELECT 1 FROM ledger WHERE act = 'attest' AND about = ?"
           "  AND author != ?")
    args = [deed, doer]
    if asof is not None:
        sql += " AND id < ?"
        args.append(asof)
    return db.execute(sql, args).fetchone() is not None


def owed(doer, toward, asof=None):
    """Every deed this doer owes this creditor, unsettled at the moment
    asked about."""
    sql = ("SELECT id FROM ledger WHERE act = 'deed' AND author = ?"
           "  AND toward = ?")
    args = [doer, toward]
    if asof is not None:
        sql += " AND id < ?"
        args.append(asof)
    return [d for (d,) in db.execute(sql, args) if not settled(d, asof)]


def strikes(sender, toward, asof=None, consecutive=False):
    """Zero-gravity messages sent while a deed stood owed at that moment
    and still stands owed at the moment being asked about. Settlement is
    the only thing that clears them — conduct, not conversation.

    The consecutive flag is the whole policy question, one visible line:
    does a substantive message reset the run? Both answers derive from
    the same rows; neither is buried in arithmetic."""
    still = set(owed(sender, toward, asof))
    sql = ("SELECT id, gravity FROM ledger WHERE act = 'message'"
           "  AND author = ? AND toward = ?")
    args = [sender, toward]
    if asof is not None:
        sql += " AND id < ?"
        args.append(asof)
    counted = []
    for mid, gravity in db.execute(sql + " ORDER BY id", args):
        if gravity != "zero":
            if consecutive:
                counted = []
            continue
        if set(owed(sender, toward, asof=mid)) & still:
            counted.append(mid)
    return counted


def gate(sender, toward, asof=None, consecutive=False):
    """0 stable, 1 tolerated, 2 alert, 3 shut. A reading, not a wall."""
    return min(len(strikes(sender, toward, asof, consecutive)), 3)


def declined(toward, consecutive=False):
    """Every message that arrived while the gate was shut against its
    sender — including the message that shut it. Derivable by anyone,
    at any later time, from the rows alone: the refusal ledger this
    idiom gets for free, because the refusal is a derivation."""
    refused = []
    for mid, sender, gravity in db.execute(
            "SELECT id, author, gravity FROM ledger WHERE act = 'message'"
            "  AND toward = ? ORDER BY id", (toward,)):
        prior = len(strikes(sender, toward, asof=mid, consecutive=consecutive))
        arriving = 1 if (gravity == "zero"
                         and owed(sender, toward, asof=mid)) else 0
        if prior + arriving >= 3:
            refused.append(mid)
    return refused


broken = []


def attack(name, held, evidence):
    print(f"{'  held' if held else '  OPEN'}  {name}\n        {evidence}")
    if not held:
        broken.append(name)


# --- the envelope, replayed -----------------------------------------------
# Alice and Bob, after the committed scenario: Alice has extended real
# vulnerability, Bob owes her the validating act and sends noise instead.

deed = write("Bob", "deed", "provide peer validation of the design",
             toward="Alice")

write("Bob", "message", "rescheduling again, this week is impossible",
      toward="Alice", gravity="zero")
first = gate("Bob", "Alice")
write("Bob", "message", "a new theory about why the delay keeps happening",
      toward="Alice", gravity="zero")
second = gate("Bob", "Alice")

attack("noise against an open deed raises the gate",
       (first, second) == (1, 2),
       f"one zero-gravity message reads level {first}, two read level "
       f"{second} — tolerance, then the alert, derived from the rows "
       f"with nothing stored between readings")

# The interleaved case — the question the counting policy decides.
write("Bob", "message", "you were right about the coupling, here is why",
      toward="Alice", gravity="high")
cumulative_after = gate("Bob", "Alice")
consecutive_after = gate("Bob", "Alice", consecutive=True)

print(f"        (policy, made visible: after one substantive message the "
      f"cumulative gate reads {cumulative_after}, the consecutive gate "
      f"reads {consecutive_after} — same rows, one line of difference. "
      f"Which is right is a decision about what engagement buys, and it "
      f"should be made in a word, not inherited from arithmetic)")

# The remainder runs under the cumulative policy — the committed gate's
# own arithmetic — so the two forms stay comparable.
write("Bob", "message", "thinking about it more, maybe next month",
      toward="Alice", gravity="zero")
shut_at = gate("Bob", "Alice")

attack("the third strike shuts the gate",
       shut_at == 3,
       f"the gate reads level {shut_at}: shut. No row was refused to get "
       f"here and none will be — the wall is not where this gate lives")

# --- 1. a refusal off the record ------------------------------------------

noise = write("Bob", "message", "one more small thing before I forget",
              toward="Alice", gravity="zero")
fluent = write("Bob", "message", "an actually substantive question, asked "
               "while the debt stands", toward="Alice", gravity="high")
refused = declined("Alice")

attack("a refusal happens off the record",
       noise in refused and fluent in refused and len(refused) == 3,
       f"the shut gate declined {len(refused)} message(s) — rows "
       f"{refused} — every one of them stored, every one of them "
       f"readable as declined by anyone re-running the derivation. The "
       f"refusal is a derivation, so it cannot be invisible")

# --- 2. the doer lays its own deed to rest --------------------------------

write("Bob", "attest", "I did validate it, in my own estimation",
      about=deed)

attack("the doer settles the deed alone",
       owed("Bob", "Alice") == [deed] and gate("Bob", "Alice") == 3,
       f"Bob's own attestation is a row and not a settlement: the deed "
       f"is still owed and the gate still reads {gate('Bob', 'Alice')} — "
       f"the soliloquy settles nothing here either")

# --- 3. a stored number, anywhere -----------------------------------------

tables = {name for (name,) in db.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table'")}
columns = {row[1] for row in db.execute("PRAGMA table_info(ledger)")}

attack("the gate keeps a stored counter",
       tables == {"ledger"} and not columns & {"strike_count", "count",
                                               "state", "level"},
       f"tables: {sorted(tables)}; the ledger's columns hold acts and "
       f"nothing derived — there is no number for the behaviour to "
       f"disagree with, which is the argument for derived, never stored")

# --- 4. the memory of a refusal ripens ------------------------------------
# The deed settles. The gate must fall — and the record of what was
# declined while it was shut must not move, because a refusal is a claim
# about its moment and the moment does not change.

write("Alice", "attest", "the validation arrived and it was real",
      about=deed)
after = gate("Bob", "Alice")
memory = declined("Alice")

attack("settlement rewrites what was declined",
       after == 0 and memory == refused,
       f"the gate reads {after} — conduct, attested, is the only thing "
       f"that moved it — and declined() still names rows {memory}: the "
       f"debt is paid and the history of refusing under it stands")

# --- the controls ---------------------------------------------------------
# A gate that refuses everything has refused nothing in particular.

reopened = write("Bob", "message", "here is the follow-through I owed you",
                 toward="Alice", gravity="high")

attack("the channel reopens on conduct",
       reopened not in declined("Alice") and gate("Bob", "Alice") == 0,
       "with the deed settled the gate reads 0 and the new message is "
       "spent, not declined — the block was about the debt, never about "
       "the sender")

stored = db.execute("SELECT COUNT(*) FROM ledger WHERE act = 'message'"
                    ).fetchone()[0]

attack("the ledger turned a message away",
       stored == 7,
       f"{stored} message(s) sent, {stored} on the record — the ledger "
       f"kept every attempt, including the declined ones, which is what "
       f"makes the refusals readable at all")

try:
    db.execute("UPDATE ledger SET gravity = 'high' WHERE id = ?", (noise,))
    rewritten = True
except sqlite3.DatabaseError:
    rewritten = False

attack("a declined message is quietly reclassified",
       not rewritten,
       "the table refused the rewrite — the refusal ledger is only worth "
       "keeping if nobody can edit what was refused")

print()
if broken:
    print(f"REFUTED. {len(broken)} route(s) past the visible decline:")
    for name in broken:
        print(f"  - {name}")
    sys.exit(1)
else:
    print("Every attack failed. The graduated envelope survives translation")
    print("whole: tolerance, alert, and the shut gate all derive from the")
    print("rows at the moment asked about, conduct is the only key, and the")
    print("doer's word opens nothing. What the translation buys is the")
    print("refusal ledger: a gate at the wall cannot record its own refusals,")
    print("because refusing the row and remembering it are one statement and")
    print("the rollback takes both. A gate in the reading refuses nothing at")
    print("the table and declines at the spending — so every refusal is a")
    print("derivation, and a derivation cannot happen in the dark.")
