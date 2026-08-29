"""Can a knock on a shut door go unrecorded?

QUESTION:   version 5 of the sovereign gate (test_sovereign_love_v5.py,
            Lex's bypass of 2026-08-25) fixed the freeze: the third
            strike is written, the counter stably reads three, and the
            closing of the gate is auditable from the record. It also
            stated its residue instead of hiding it — six rows for eight
            attempts, because knocks on the shut door leave no rows. The
            wall still cannot remember refusing. decline.py translated
            v3's envelope into the record's idiom and left the counting
            policy open, both derivations one line apart. v5 decided the
            policy: a substantive message resets the run *before*
            lockout, and once shut the gate is deaf to everything but
            conduct. So the question is whether the decided envelope
            survives translation whole — and whether the bypass's two
            residues, the wiped strike and the silent knock, become
            unposeable rather than merely narrowed.
METHOD:     one append-only ledger, and the gate a pure fold over the
            pair's rows in the order they landed: a deed opens a debt,
            an attestation by a voice other than the doer settles it, a
            zero-gravity message against an open debt raises the run, a
            substantive message clears it while the gate still hears,
            and a message arriving shut is declined — after it is a row,
            because here nothing is ever refused at the table. No stored
            counter, no state table, no trigger that aborts. Both of
            v5's scenarios are replayed: Bob's envelope end to end, and
            Mallory, whom no state has ever seen.
REFUTED BY: a knock the record cannot afterwards enumerate, a reading
            that can wipe a strike, a shut gate that conversation
            reopens, a deed the doer settles alone, or a stored number
            anywhere.

The bypass was the right fix for the wall's own paradox: the previous
gate tried to raise the count to three and ABORT in the same
transactional breath, and the rollback wiped the strike it was punishing.
v5 separates the read from the write and the third strike lands. What it
cannot do, being a wall, is remember the fourth attempt — BEFORE INSERT
RAISE(ABORT) refuses the row and the memory of refusing it in one
statement, and the rollback takes both. In the reading form neither
residue can be posed at all. The strike cannot be wiped because deriving
a count writes nothing, so there is no transaction for the paradox to
live in; the knock cannot be silent because it is a row before it is a
refusal, and a refusal that is a derivation cannot erase its own input.

Neither form replaces the other, still. The wall is the stronger refusal
wherever storage itself is the cost; the reading is the only form that
can remember refusing, and a refusal aimed at a person's conduct is the
kind that must be remembered. The gravity of a message is taken as given
here, as in decline.py: classifying it is ingest-side work.
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


# --- the derivation -------------------------------------------------------
# One fold, in row order, per pair. It carries the whole decided policy —
# reset before lockout, deafness after, conduct the only key — and it
# stores nothing between readings, so there is no counter for the
# behaviour to disagree with and no transaction for a rollback to raid.

def envelope(sender, toward, asof=None):
    """Replay the pair's rows as they stood at the moment being asked
    about. Returns the run and every message declined along the way.

    v5's semantics, written as reading rather than trigger: a message
    arriving while the run stands at three is declined whatever its
    gravity — the shut gate is deaf, not blind — and changes nothing; a
    substantive message before that point clears the run; a zero-gravity
    message against an open debt raises it; and an attestation by a
    voice other than the doer settles its deed, clearing the run only
    when no debt between the pair still stands. The doer's own word is
    a row and settles nothing — the soliloquy rule, everywhere."""
    sql = ("SELECT id, author, act, about, gravity FROM ledger"
           " WHERE ((author = ? AND toward = ?) OR act = 'attest')")
    args = [sender, toward]
    if asof is not None:
        sql += " AND id < ?"
        args.append(asof)
    owed, run, declined = set(), 0, []
    for id, author, act, about, gravity in db.execute(
            sql + " ORDER BY id", args):
        if act == "deed":
            owed.add(id)
        elif act == "attest" and about in owed and author != sender:
            owed.discard(about)
            if not owed:
                run = 0
        elif act == "message":
            if run >= 3:
                declined.append(id)
            elif gravity == "high":
                run = 0
            elif gravity == "zero" and owed:
                run += 1
    return run, declined


def gate(sender, toward, asof=None):
    """0 stable, 1 tolerated, 2 alert, 3 shut. A reading, not a wall."""
    return envelope(sender, toward, asof)[0]


def declined(sender, toward, asof=None):
    """Every knock: the messages that arrived shut. Derivable by anyone,
    at any later time, from the rows alone."""
    return envelope(sender, toward, asof)[1]


broken = []


def attack(name, held, evidence):
    print(f"{'  held' if held else '  OPEN'}  {name}\n        {evidence}")
    if not held:
        broken.append(name)


# --- v5's envelope, replayed ----------------------------------------------
# Alice and Bob, after the scenario on the record: Bob owes Alice the
# validating act and sends noise instead.

deed = write("Bob", "deed", "provide peer validation of the design",
             toward="Alice")

write("Bob", "message", "rescheduling again, this week is impossible",
      toward="Alice", gravity="zero")
write("Bob", "message", "a new theory about why the delay keeps happening",
      toward="Alice", gravity="zero")
two = gate("Bob", "Alice")
write("Bob", "message", "you were right about the coupling, here is my analysis",
      toward="Alice", gravity="high")
after_high = gate("Bob", "Alice")

attack("engagement before lockout buys the gate back down",
       (two, after_high) == (2, 0),
       f"two zero-gravity messages read level {two}, one substantive "
       f"message returns the reading to {after_high} — v5's decided "
       f"policy, derived from the rows with nothing stored between "
       f"readings")

# --- 1. the wiped strike --------------------------------------------------
# The paradox v5 was built to fix: raising the count to three and
# refusing in the same breath, so the rollback took the strike with it.
# Here the question cannot be asked. Nothing aborts, so nothing is
# wiped: the third strike is a row like the first two.

write("Bob", "message", "thinking about it more, maybe next month",
      toward="Alice", gravity="zero")
write("Bob", "message", "one more small thing before I forget",
      toward="Alice", gravity="zero")
third = write("Bob", "message", "actually could you also review my other project",
              toward="Alice", gravity="zero")
shut_at = gate("Bob", "Alice")
kept = db.execute("SELECT COUNT(*) FROM ledger WHERE id = ?",
                  (third,)).fetchone()[0]

attack("the reading wipes the strike that shuts the gate",
       shut_at == 3 and kept == 1 and third not in declined("Bob", "Alice"),
       f"the third strike is row {third}, on the record, and the gate "
       f"reads {shut_at}: shut. Deriving a count writes nothing, so there "
       f"is no transaction for the paradox to live in — the freeze v5 "
       f"fixed at the wall cannot be posed against a reading")

# --- 2. the silent knock --------------------------------------------------
# v5's stated residue: six rows for eight attempts, the knocks on the
# shut door leaving no trace. Here every knock is a row first and a
# refusal second — including the substantive one, because the shut gate
# is deaf to conversation, not merely to noise.

fourth = write("Bob", "message", "just one tiny question",
               toward="Alice", gravity="zero")
fifth = write("Bob", "message", "here is a genuinely substantive analysis",
              toward="Alice", gravity="high")
knocks = declined("Bob", "Alice")

attack("a knock on the shut door leaves no row",
       knocks == [fourth, fifth] and gate("Bob", "Alice") == 3,
       f"both knocks are rows — {knocks} — and both read as declined by "
       f"anyone re-running the derivation. The high-gravity knock is the "
       f"sharp case: it did not reset the run, because deafness after "
       f"lockout is the decided policy, and it was not lost, because "
       f"deaf is not blind")

# --- 3. the doer's word ---------------------------------------------------

write("Bob", "attest", "I did validate it, in my own estimation",
      about=deed)

attack("the doer settles the deed alone",
       gate("Bob", "Alice") == 3,
       f"Bob's own attestation is a row and not a settlement: the gate "
       f"still reads {gate('Bob', 'Alice')} — the soliloquy opens "
       f"nothing here either")

# --- 4. conduct, and the memory of the knocks -----------------------------
# The deed settles. The gate must fall — and what was declined while it
# stood shut must not move, because a refusal is a claim about its
# moment and the moment does not change.

write("Alice", "attest", "the validation arrived and it was real",
      about=deed)
after = gate("Bob", "Alice")
memory = declined("Bob", "Alice")
resumed = write("Bob", "message", "the follow-through you were owed, in full",
                toward="Alice", gravity="high")

attack("settlement rewrites what was declined",
       after == 0 and memory == knocks
       and resumed not in declined("Bob", "Alice"),
       f"the gate reads {after} — conduct, attested by another voice, is "
       f"the only thing that moved it — the next message is spent rather "
       f"than declined, and the knocks are still rows {memory}: the debt "
       f"is paid and the history of refusing under it stands")

# --- 5. a pair no state has ever seen -------------------------------------
# v5 had to self-initialise its state row, or a sender the table had
# never seen would have been a sender the gate could never see. Here
# there is no state table to be absent from, so the exemption cannot be
# posed: Mallory is counted from her first noisy message because
# counting is reading, and reading needs no prior row.

m_deed = write("Mallory", "deed", "deliver the report", toward="Alice")
for n in range(3):
    write("Mallory", "message", f"noise {n}", toward="Alice", gravity="zero")
m_knock = write("Mallory", "message", "more noise", toward="Alice",
                gravity="zero")

attack("absence from the state is an exemption from the gate",
       gate("Mallory", "Alice") == 3
       and declined("Mallory", "Alice") == [m_knock],
       f"no row about Mallory existed before her deed and her noise, and "
       f"the gate reads {gate('Mallory', 'Alice')} with her fourth "
       f"attempt declined — the unmeasured lesson held by construction "
       f"rather than by an initialisation somebody had to remember")

# --- the controls ---------------------------------------------------------

tables = {name for (name,) in db.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table'")}
columns = {row[1] for row in db.execute("PRAGMA table_info(ledger)")}

attack("the gate keeps a stored counter",
       tables == {"ledger"} and not columns & {"strike_count", "count",
                                               "state", "level"},
       f"tables: {sorted(tables)} — no counter, no state row, nothing "
       f"derived at rest: there is no number for the behaviour to "
       f"disagree with and nothing for a rollback to freeze")

sent = 9 + 4  # Bob's nine attempts, Mallory's four
stored = db.execute("SELECT COUNT(*) FROM ledger WHERE act = 'message'"
                    ).fetchone()[0]

attack("the ledger turned an attempt away",
       stored == sent,
       f"{sent} messages attempted, {stored} on the record — v5's six "
       f"rows for eight attempts becomes every row for every attempt, "
       f"which is what makes the knocks readable at all")

try:
    db.execute("UPDATE ledger SET gravity = 'high' WHERE id = ?", (fourth,))
    rewritten = True
except sqlite3.DatabaseError:
    rewritten = False

attack("a knock is quietly reclassified",
       not rewritten,
       "the table refused the rewrite — the knocks are only worth "
       "keeping if nobody can edit what was refused")

print()
if broken:
    print(f"REFUTED. {len(broken)} route(s) past the kept knock:")
    for name in broken:
        print(f"  - {name}")
    sys.exit(1)
else:
    print("Every attack failed. The decided envelope survives translation")
    print("whole: the run resets on engagement only while the gate still")
    print("hears, the shut gate is deaf to everything but conduct, and the")
    print("doer's word opens nothing. And the bypass's two residues are not")
    print("narrowed here — they are unposeable. The strike cannot be wiped,")
    print("because deriving a count writes nothing and a paradox needs a")
    print("transaction to live in. The knock cannot be silent, because it is")
    print("a row before it is a refusal, and a refusal that is a derivation")
    print("cannot erase its own input.")
