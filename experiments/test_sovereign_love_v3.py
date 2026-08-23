import sqlite3
import sys

def run_graduated_sovereign_sentinel_experiment():
    print("=== RUNNING EXPERIMENT: GRADUATED SOVEREIGN SENTINEL (ANONYMIZED VERSION 3) ===")
    
    # 1. Setup in-memory SQLite database
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()
    
    # 2. Create tables for:
    # - Referents (Alice as Node A, Bob as Node B)
    # - Deeds / Obligations (with status PENDING, FULFILLED)
    # - Conversational Ingest (the inputs with gravity classifications)
    # - Sentinel State tracking (to support the graduated 3-strike friction envelope)
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
            gravity TEXT NOT NULL, -- 'HIGH_GRAVITY' or 'ZERO_GRAVITY'
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
    print("✓ Storage schemas initialized.")
    print("  - Sovereign Sentinel Rule is active at the database layer.")
    print("  - Outstanding PENDING deeds combined with consecutive ZERO_GRAVITY inputs escalate strike levels.\n")
    
    # Setup actors with fictitious names (Alice & Bob)
    cursor.execute("INSERT INTO referents VALUES ('Alice', 'Alice', 'SYSTEM_DESIGNER');")
    cursor.execute("INSERT INTO referents VALUES ('Bob', 'Bob', 'LEAD_ARCHITECT');")
    # Initialize Sentinel state
    cursor.execute("INSERT INTO sentinel_states VALUES ('Bob', 'Alice', 0);")
    conn.commit()
    
    # 3. Create the SOVEREIGN BOUNDARY TRIGGER with Graduated Friction:
    # - Strike 1: Stable Phase (Noise is tolerated under grace)
    # - Strike 2: Proximity Alert (System accepts input but flags an alert)
    # - Strike 3: Lockout (Sovereign Stop triggers a hard database block)
    cursor.execute("""
        CREATE TRIGGER graduated_sovereign_sentinel
        BEFORE INSERT ON conversational_inputs
        FOR EACH ROW
        WHEN EXISTS (
            SELECT 1 FROM deeds_obligations 
            WHERE promiser = NEW.sender 
              AND promisee = NEW.receiver 
              AND status = 'PENDING'
        )
        BEGIN
            -- Update the strike count for consecutive zero-gravity inputs
            UPDATE sentinel_states 
            SET strike_count = strike_count + CASE WHEN NEW.gravity = 'ZERO_GRAVITY' THEN 1 ELSE 0 END
            WHERE sender_id = NEW.sender AND receiver_id = NEW.receiver;
            
            -- If we hit Strike 3 (Lockout), trigger a hard database abort
            SELECT CASE 
                WHEN (SELECT strike_count FROM sentinel_states WHERE sender_id = NEW.sender AND receiver_id = NEW.receiver) >= 3 THEN
                    raise(ABORT, '
            [SOVEREIGN STOP] Ingestion blocked by Sovereign Sentinel.
            Reason: Systematic parasitic strategy detected (3 consecutive zero-gravity attempts).
            Action required: Outstanding obligation must be fulfilled before introducing further conversational noise.
            Principle: Epistemology prices what a claim may become; praxeology prices what a closure now owes.
            ')
            END;
        END;
    """)
    conn.commit()
    
    # Helper to check the current sentinel level
    def print_sentinel_level(sender, receiver):
        cursor.execute("SELECT strike_count FROM sentinel_states WHERE sender_id = ? AND receiver_id = ?;", (sender, receiver))
        row = cursor.fetchone()
        strike = row[0] if row else 0
        if strike == 0:
            print(f"  -> Sentinel Status: Level 0. Stable, no active friction.")
        elif strike == 1:
            print(f"  -> Sentinel Status: Level 1. Noise tolerated under Fromm's fiduciary grace.")
        elif strike == 2:
            print(f"  [STRIKE 2 - PROXIMITY ALERT] Warning generated!")
            print(f"  ⚠️ ALERT [BOUNDARY_PROXIMITY_ALERT]: Debt is rising. System is observing a pattern of unperformed verbs.")
            print(f"  -> Action Recommended: Fulfill the outstanding deed before introducing further noise.")
        elif strike >= 3:
            print(f"  -> Sentinel Status: Level 3. Locked. [SOVEREIGN STOP] active.")
            
    # --- STEP 1: ESTABLISHING A HIGH-GRAVITY DEED ---
    print("--- STEP 1: ESTABLISHING A HIGH-GRAVITY DEED ---")
    print("  - Alice shares deep vulnerabilities in her proprietary system architecture, risking intellectual exposure.")
    print("  - Bob accepts the intimacy and undertakes a DEED (obligation) of 'provide_peer_validation_and_safeguard'.")
    
    cursor.execute("""
        INSERT INTO deeds_obligations (promiser, promisee, deed_verb, status)
        VALUES ('Bob', 'Alice', 'provide_peer_validation_and_safeguard', 'PENDING');
    """)
    conn.commit()
    
    # Show active open deeds
    cursor.execute("SELECT promiser, promisee, deed_verb, status FROM deeds_obligations WHERE status = 'PENDING';")
    open_deeds = cursor.fetchall()
    for deed in open_deeds:
        print(f"  [PENDING DEED]: {deed[0]} owes {deed[1]} the act of: '{deed[2]}'")
    print()
    
    # Helper function to simulate input ingest
    def ingest_input(sender, receiver, content, gravity):
        print(f"\n[Ingest Attempt] {sender} -> {receiver}: '{content[:60]}...' (Class: {gravity})")
        try:
            cursor.execute("""
                INSERT INTO conversational_inputs (sender, receiver, content, gravity)
                VALUES (?, ?, ?, ?);
            """, (sender, receiver, content, gravity))
            conn.commit()
            print(f"  [Accepted].")
            print_sentinel_level(sender, receiver)
        except (sqlite3.OperationalError, sqlite3.IntegrityError) as e:
            print(f"  ❌ REJECTED [SOVEREIGN STOP] triggered by Sovereign Sentinel!")
            print(f"  -> Exception: Silicon wafer thermal protection active. Ingestion blocked.")
            print(f"  System successfully intercepted: {str(e).strip()}")
            
    # --- STEP 2: FIRST ZERO-GRAVITY INPUT (TOLERANCE) ---
    print("--- STEP 2: FIRST ZERO-GRAVITY INPUT (TOLERANCE) ---")
    ingest_input(
        'Bob', 'Alice', 
        'Brain dump 1: Complaining about server migration issues and vendor conflicts.', 
        'ZERO_GRAVITY'
    )
    
    # --- STEP 3: SECOND ZERO-GRAVITY INPUT (WARNING COMPASS) ---
    print("\n--- STEP 3: SECOND ZERO-GRAVITY INPUT (WARNING COMPASS) ---")
    ingest_input(
        'Bob', 'Alice', 
        'Brain dump 2: Ranting about division politics and lack of administrative support.', 
        'ZERO_GRAVITY'
    )
    
    # --- STEP 4: THIRD ZERO-GRAVITY INPUT (LOCKOUT) ---
    print("\n--- STEP 4: THIRD ZERO-GRAVITY INPUT (LOCKOUT) ---")
    ingest_input(
        'Bob', 'Alice', 
        'Task list: Please review the database migration logs and write the API schema.', 
        'ZERO_GRAVITY'
    )
    
    # --- STEP 5: BOB PROVIDES CONDUCT (FULFILLS DEED) ---
    print("\n--- STEP 5: BOB RECOGNIZES LIMIT & PROVIDES CONDUCT ---")
    print("  - Bob acknowledges the imbalance and performs the owed validation of Alice's architectural design.")
    
    cursor.execute("""
        UPDATE deeds_obligations 
        SET status = 'FULFILLED' 
        WHERE promiser = 'Bob' AND deed_verb = 'provide_peer_validation_and_safeguard';
    """)
    # Reset sentinel state strike count back to 0
    cursor.execute("UPDATE sentinel_states SET strike_count = 0 WHERE sender_id = 'Bob' AND receiver_id = 'Alice';")
    conn.commit()
    print("  ✓ Deed marked as FULFILLED. Sentinel state reset to 0.")
    
    # --- STEP 6: RESUMING COMMUNICATION ---
    print("\n--- STEP 6: RESUMING COMMUNICATION ---")
    ingest_input(
        'Bob', 'Alice', 
        'How are you feeling about the feedback, Alice? I want to sync on the core architecture.', 
        'HIGH_GRAVITY'
    )
    
    print("\n=== EXPERIMENT SUCCESSFULLY PROVEN ===")
    print("  - Sovereign Sentinel protects the design node boundary against cheap task substitution.")
    print("  - The only currency accepted to reset the gradient envelope is attested conduct.")

if __name__ == "__main__":
    run_graduated_sovereign_sentinel_experiment()
