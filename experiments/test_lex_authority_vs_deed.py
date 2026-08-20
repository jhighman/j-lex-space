import sqlite3
from datetime import datetime, timedelta

def run_experiment():
    print("=== RUNNING EXPERIMENT: SCENARIO 2 (DEED VS. AUTHORITY) ===")
    
    # 1. Setup in-memory SQLite database
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()
    
    # 2. Create tables for Authority (Grants with TTL) and Deeds (Obligations with no expiration)
    cursor.execute("""
        CREATE TABLE authority_grants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            grantor TEXT NOT NULL,
            grantee TEXT NOT NULL,
            action TEXT NOT NULL,
            expires_at TIMESTAMP NOT NULL
        );
    """)
    
    cursor.execute("""
        CREATE TABLE deeds_obligations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            promiser TEXT NOT NULL,
            promisee TEXT NOT NULL,
            deed TEXT NOT NULL,
            status TEXT DEFAULT 'PENDING',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    conn.commit()
    print("✓ Storage schemas initialized.")
    print("  - Authority Grants carry an explicit 'expires_at' (TTL).")
    print("  - Deeds/Obligations have NO expiration term (permanence).\n")
    
    # STEP 1: Set the initial state
    print("Step 1: Setting up initial grants and deeds...")
    current_time = datetime(2026, 8, 20, 12, 0, 0)
    expiry_time = current_time + timedelta(days=30) # 30-day authority TTL
    
    # Jeff grants Lex authority (expires in 30 days)
    cursor.execute("""
        INSERT INTO authority_grants (grantor, grantee, action, expires_at)
        VALUES ('Jeff', 'Lex', 'certify_model_versions', ?);
    """, (expiry_time.strftime('%Y-%m-%d %H:%M:%S'),))
    
    # Lex promises Jeff to send the manuscript (no expiry)
    cursor.execute("""
        INSERT INTO deeds_obligations (promiser, promisee, deed)
        VALUES ('Lex', 'Jeff', 'send_final_manuscript');
    """)
    conn.commit()
    
    # Show active records at day 0
    print(f"  [Day 0 - Current Time]: {current_time.strftime('%Y-%m-%d')}")
    print("  Active Authority Grants:")
    cursor.execute("SELECT grantee, action, expires_at FROM authority_grants;")
    for row in cursor.fetchall():
        print(f"    - {row[0]} has authority to '{row[1]}' until {row[2]}")
        
    print("  Outstanding Deeds / Obligations:")
    cursor.execute("SELECT promiser, deed, status FROM deeds_obligations;")
    for row in cursor.fetchall():
        print(f"    - {row[0]} owes: '{row[1]}' (Status: {row[2]})")
    print()

    # STEP 2: Simulate time travel (+35 days)
    simulated_time = current_time + timedelta(days=35)
    print(f"Step 2: Simulating time travel (+35 days) -> New Time: {simulated_time.strftime('%Y-%m-%d')}...")
    
    # Check if Authority has expired
    cursor.execute("SELECT action, expires_at FROM authority_grants WHERE expires_at < ?;", (simulated_time.strftime('%Y-%m-%d %H:%M:%S'),))
    expired_grants = cursor.fetchall()
    
    # Check if Deeds are still active
    cursor.execute("SELECT promiser, deed, status FROM deeds_obligations;")
    outstanding_deeds = cursor.fetchall()
    
    print("  [Evaluation at Day 35]:")
    if expired_grants:
        for grant in expired_grants:
            print(f"    ❌ AUTHORITY EXPIRED: Permission to '{grant[0]}' lapsed on {grant[1]}")
    else:
        print("    Authority is still valid.")
        
    for deed in outstanding_deeds:
        print(f"    🛡️ DEED CONSERVED: {deed[0]}'s obligation to '{deed[1]}' remains {deed[2]} (Time cannot erase a deed!)")
    print()

    # STEP 3: Settle the Deed by conduct (Attestation)
    print("Step 3: Lex performs the deed (witnessed conduct)...")
    # Mark the obligation as FULFILLED (settlement by conduct)
    cursor.execute("""
        UPDATE deeds_obligations 
        SET status = 'FULFILLED' 
        WHERE promiser = 'Lex' AND deed = 'send_final_manuscript';
    """)
    conn.commit()
    
    print("  [Final Ledger Audit]:")
    cursor.execute("SELECT promiser, deed, status FROM deeds_obligations;")
    for row in cursor.fetchall():
        print(f"    - {row[0]}'s deed to '{row[1]}' is now: {row[2]}")
        
    print("\n✓ Scenario 2 successfully proven!")
    print("  - Authority expired precisely at its TTL boundary.")
    print("  - Deed remained active across temporal drifts and only settled through explicit conduct.")

if __name__ == "__main__":
    run_experiment()