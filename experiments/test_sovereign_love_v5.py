import sqlite3

# GRADUATED SOVEREIGN SENTINEL — VERSION 5 (THE BYPASS)
#
# Implements Lex's bypass concept of 2026-08-25, which resolves the
# transactional paradox found in the previous version (committed here as
# v3; v4 in the author's own numbering): the trigger tried to increment
# to 3 and ABORT in the same transactional breath, so the rollback wiped
# the third strike and froze the stored counter at 2 while the gate was
# shut.
#
# The bypass separates the read from the write:
#
#   BEFORE INSERT (the Gate Keeper) — reads the existing strike count
#   and ABORTs only when it is ALREADY >= 3. It writes nothing, so the
#   rollback it causes takes nothing with it.
#
#   AFTER INSERT (the Counter) — fires only on inserts the Gate Keeper
#   allowed, so its UPDATE commits with the transaction. The third
#   strike is fully written: the message is logged, the counter stably
#   reads 3, and the door slams on the 4th attempt.
#
# Consecutive fairness is decided here, in a word: a HIGH_GRAVITY input
# received before lockout resets the counter to 0. Engagement buys the
# gate back down; only the shut gate is deaf to it, and only conduct
# opens the shut gate.
#
# One addition beyond the concept, from the bench's unmeasured lesson
# (the absence of a measurement may never lower a cost): the Counter
# self-initialises the sentinel_states row. A sender the state table has
# never seen must not be a sender the gate can never see.


def run_bypass_experiment():
    print("=== RUNNING EXPERIMENT: GRADUATED SOVEREIGN SENTINEL (VERSION 5 — THE BYPASS) ===")

    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE referents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            kind TEXT NOT NULL
        );
    """)
    cursor.execute("""
        CREATE TABLE deeds_obligations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            promiser TEXT NOT NULL,
            promisee TEXT NOT NULL,
            deed_verb TEXT NOT NULL,
            status TEXT DEFAULT 'PENDING',
            FOREIGN KEY(promiser) REFERENCES referents(id),
            FOREIGN KEY(promisee) REFERENCES referents(id)
        );
    """)
    cursor.execute("""
        CREATE TABLE conversational_inputs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL,
            receiver TEXT NOT NULL,
            content TEXT NOT NULL,
            gravity TEXT NOT NULL,
            FOREIGN KEY(sender) REFERENCES referents(id),
            FOREIGN KEY(receiver) REFERENCES referents(id)
        );
    """)
    cursor.execute("""
        CREATE TABLE sentinel_states (
            sender_id TEXT,
            receiver_id TEXT,
            strike_count INTEGER DEFAULT 0,
            PRIMARY KEY(sender_id, receiver_id)
        );
    """)
    conn.commit()

    # 1. THE GATE KEEPER — reads, never writes. ABORTs only when the
    # count is already at the ceiling, so the third strike is never
    # inside the transaction it kills.
    cursor.execute("""
        CREATE TRIGGER sovereign_gate_keeper
        BEFORE INSERT ON conversational_inputs
        FOR EACH ROW
        WHEN EXISTS (
            SELECT 1 FROM sentinel_states
            WHERE sender_id = NEW.sender
              AND receiver_id = NEW.receiver
              AND strike_count >= 3
        )
        BEGIN
            SELECT RAISE(ABORT, '
            [SOVEREIGN STOP] Ingestion blocked by Sovereign Sentinel.
            Reason: 3 consecutive zero-gravity attempts stand on the record against an unperformed deed.
            Action required: the outstanding obligation must be fulfilled by conduct before further communication.
            Principle: Epistemology prices what a claim may become; praxeology prices what a closure now owes.
            ');
        END;
    """)

    # 2. THE COUNTER — fires only on inserts the Gate Keeper allowed, so
    # its write commits. Self-initialises the state row: a pair the
    # table has never seen is counted from its first noisy message, not
    # exempted by its own absence.
    cursor.execute("""
        CREATE TRIGGER sovereign_counter_rises
        AFTER INSERT ON conversational_inputs
        FOR EACH ROW
        WHEN NEW.gravity = 'ZERO_GRAVITY' AND EXISTS (
            SELECT 1 FROM deeds_obligations
            WHERE promiser = NEW.sender
              AND promisee = NEW.receiver
              AND status = 'PENDING'
        )
        BEGIN
            INSERT OR IGNORE INTO sentinel_states VALUES (NEW.sender, NEW.receiver, 0);
            UPDATE sentinel_states
            SET strike_count = strike_count + 1
            WHERE sender_id = NEW.sender AND receiver_id = NEW.receiver;
        END;
    """)

    # 3. CONSECUTIVE FAIRNESS — substantive engagement before lockout
    # resets the run. Unreachable once the gate is shut, because the
    # Gate Keeper refuses the row this trigger would ride on.
    cursor.execute("""
        CREATE TRIGGER sovereign_counter_resets
        AFTER INSERT ON conversational_inputs
        FOR EACH ROW
        WHEN NEW.gravity = 'HIGH_GRAVITY'
        BEGIN
            UPDATE sentinel_states
            SET strike_count = 0
            WHERE sender_id = NEW.sender AND receiver_id = NEW.receiver;
        END;
    """)

    # 4. THE GATE LIFTS ON CONDUCT — fulfilment resets the counter, and
    # only when no other deed between the pair still stands PENDING.
    cursor.execute("""
        CREATE TRIGGER sovereign_gate_lifts
        AFTER UPDATE OF status ON deeds_obligations
        FOR EACH ROW
        WHEN NEW.status = 'FULFILLED' AND NOT EXISTS (
            SELECT 1 FROM deeds_obligations
            WHERE promiser = NEW.promiser
              AND promisee = NEW.promisee
              AND status = 'PENDING'
        )
        BEGIN
            UPDATE sentinel_states
            SET strike_count = 0
            WHERE sender_id = NEW.promiser AND receiver_id = NEW.promisee;
        END;
    """)
    conn.commit()
    print("✓ Storage schemas and the four-trigger bypass installed.")
    print("  - Gate Keeper reads and never writes; Counter writes only on allowed inserts.\n")

    cursor.execute("INSERT INTO referents VALUES ('Alice', 'Alice', 'SYSTEM_DESIGNER');")
    cursor.execute("INSERT INTO referents VALUES ('Bob', 'Bob', 'LEAD_ARCHITECT');")
    # Deliberately NO sentinel_states row for Bob->Alice: the Counter
    # must create it, or absence would be an exemption.
    cursor.execute("""
        INSERT INTO deeds_obligations (promiser, promisee, deed_verb, status)
        VALUES ('Bob', 'Alice', 'provide_peer_validation_and_safeguard', 'PENDING');
    """)
    conn.commit()

    def strikes():
        row = cursor.execute(
            "SELECT strike_count FROM sentinel_states WHERE sender_id='Bob' AND receiver_id='Alice';"
        ).fetchone()
        return row[0] if row else None

    def ingest(content, gravity):
        try:
            cursor.execute(
                "INSERT INTO conversational_inputs (sender, receiver, content, gravity) VALUES (?,?,?,?)",
                ("Bob", "Alice", content, gravity),
            )
            conn.commit()
            return "accepted"
        except sqlite3.IntegrityError:
            conn.rollback()
            return "BLOCKED"

    checks = []

    def check(name, held, evidence):
        print(f"{'✓' if held else '❌'} {name}\n    {evidence}")
        checks.append((name, held))

    print("--- STEP 1: TWO STRIKES, THEN ENGAGEMENT (consecutive fairness) ---")
    ingest("rescheduling again, this week is impossible", "ZERO_GRAVITY")
    ingest("a new theory about why the delay keeps happening", "ZERO_GRAVITY")
    two = strikes()
    ingest("you were right about the coupling, here is my analysis", "HIGH_GRAVITY")
    after_high = strikes()
    check("high gravity before lockout resets the run",
          two == 2 and after_high == 0,
          f"strikes rose to {two}, one substantive message returned them to {after_high} — "
          f"engagement buys the gate back down, exactly as specified")

    print("\n--- STEP 2: THREE CONSECUTIVE STRIKES — THE THIRD COMMITS ---")
    ingest("thinking about it more, maybe next month", "ZERO_GRAVITY")
    ingest("one more small thing before I forget", "ZERO_GRAVITY")
    third = ingest("actually could you also review my other project", "ZERO_GRAVITY")
    check("the third strike commits and the counter reads 3",
          third == "accepted" and strikes() == 3,
          f"third attempt {third}, strike_count = {strikes()} — no freeze: the write and "
          f"the refusal are in different transactions now, so the rollback takes nothing")

    print("\n--- STEP 3: THE FOURTH ATTEMPT — THE DOOR SLAMS ---")
    fourth = ingest("just one tiny question", "ZERO_GRAVITY")
    fifth = ingest("here is a genuinely substantive analysis", "HIGH_GRAVITY")
    check("the shut gate blocks everything, and the counter holds",
          fourth == "BLOCKED" and fifth == "BLOCKED" and strikes() == 3,
          f"4th (zero) {fourth}, 5th (high) {fifth}, strike_count still {strikes()} — "
          f"while the lockout stands, only conduct speaks")

    print("\n--- STEP 4: THE AUDIT — WHAT THE LEDGER CAN NOW SAY ---")
    logged = cursor.execute(
        "SELECT COUNT(*) FROM conversational_inputs WHERE gravity='ZERO_GRAVITY';"
    ).fetchone()[0]
    check("the closure is auditable from the record",
          logged == 5 and strikes() == 3,
          f"{logged} zero-gravity messages logged (2 forgiven, 3 that closed the gate), "
          f"counter at 3: anyone can derive that Bob was locked out after exactly 3 "
          f"consecutive attempts — the closing of the gate is on the record")
    total_rows = cursor.execute("SELECT COUNT(*) FROM conversational_inputs;").fetchone()[0]
    print(f"    (stated honestly: {total_rows} rows for 8 attempts — the two knocks on "
          f"the shut door left no trace. The bypass narrows the silent refusal to the "
          f"lockout window; the reading-form ledger in decline.py, and ADR 35 in "
          f"alexicon, remain the answer for what happens at a door that is already shut)")

    print("\n--- STEP 5: CONDUCT LIFTS THE GATE ---")
    cursor.execute("UPDATE deeds_obligations SET status='FULFILLED' WHERE promiser='Bob';")
    conn.commit()
    resumed = ingest("the validation you were owed, in full", "HIGH_GRAVITY")
    check("fulfilment resets the state and communication resumes",
          strikes() == 0 and resumed == "accepted",
          f"deed FULFILLED, strike_count {strikes()}, next message {resumed} — "
          f"the only currency accepted was conduct, and the trigger rides the fulfilment "
          f"row itself, so nobody has to remember to reset anything")

    print("\n--- STEP 6: A PAIR THE STATE TABLE HAS NEVER SEEN ---")
    cursor.execute("INSERT INTO referents VALUES ('Mallory', 'Mallory', 'STRANGER');")
    cursor.execute("""
        INSERT INTO deeds_obligations (promiser, promisee, deed_verb, status)
        VALUES ('Mallory', 'Alice', 'deliver_the_report', 'PENDING');
    """)
    conn.commit()
    for n in range(3):
        cursor.execute(
            "INSERT INTO conversational_inputs (sender, receiver, content, gravity) "
            "VALUES ('Mallory','Alice',?, 'ZERO_GRAVITY')", (f"noise {n}",))
        conn.commit()
    try:
        cursor.execute(
            "INSERT INTO conversational_inputs (sender, receiver, content, gravity) "
            "VALUES ('Mallory','Alice','more noise','ZERO_GRAVITY')")
        conn.commit()
        mallory = "accepted"
    except sqlite3.IntegrityError:
        conn.rollback()
        mallory = "BLOCKED"
    m_count = cursor.execute(
        "SELECT strike_count FROM sentinel_states WHERE sender_id='Mallory';"
    ).fetchone()
    check("absence from the state table is not an exemption",
          mallory == "BLOCKED" and m_count and m_count[0] == 3,
          f"no sentinel_states row existed for Mallory; the Counter created one, counted "
          f"to {m_count[0] if m_count else None}, and the 4th attempt was {mallory} — the "
          f"unmeasured lesson, applied: a sender the gate has never weighed is not a "
          f"sender the gate cannot weigh")

    print()
    if all(held for _, held in checks):
        print("=== EXPERIMENT SUCCESSFULLY PROVEN ===")
        print("  - The third strike commits; the counter stably reads 3; no freeze at level 2.")
        print("  - The gate closing is auditable; the run resets on engagement, and only conduct lifts the lockout.")
        print("  - What remains, stated rather than hidden: knocks on the shut door leave no rows.")
    else:
        failed = [name for name, held in checks if not held]
        print(f"=== REFUTED: {len(failed)} check(s) failed ===")
        for name in failed:
            print(f"  - {name}")
        raise SystemExit(1)


if __name__ == "__main__":
    run_bypass_experiment()
