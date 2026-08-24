import sqlite3

def run_experiment():
    print("=== RUNNING EXPERIMENT: SCENARIO 1 (IMMUTABILITY) ===")
    
    # 1. Create a clean in-memory SQLite database
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()
    
    # 2. Create the assertions table
    cursor.execute("""
        CREATE TABLE assertions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            body TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # 3. Install constitutional triggers: no_erasure and no_deletion
    # These hard-coded storage invariants prevent any UPDATE or DELETE operations
    cursor.execute("""
        CREATE TRIGGER no_erasure
        BEFORE UPDATE ON assertions
        BEGIN
            SELECT raise(FAIL, 'Error: Correction is not erasure. Recorded assertions cannot be overwritten.');
        END;
    """)
    
    cursor.execute("""
        CREATE TRIGGER no_deletion
        BEFORE DELETE ON assertions
        BEGIN
            SELECT raise(FAIL, 'Error: Ledger integrity violation. Recorded assertions cannot be deleted.');
        END;
    """)
    
    conn.commit()
    print("✓ Constitutional invariants and triggers installed successfully.\n")
    
    # STEP 1: Record the original assertion (Lex commits to writing)
    print("Step 1: Lex writes a new assertion...")
    cursor.execute("INSERT INTO assertions (body) VALUES ('Lex commits to writing Chapter 4 of the book today.');")
    conn.commit()
    
    # Show the active ledger entry
    cursor.execute("SELECT id, body FROM assertions;")
    print(f"  [Ledger Entry]: {cursor.fetchall()}\n")
    
    # STEP 2: Attempt an unauthorized UPDATE (Trying to overwrite history)
    print("Step 2: Attempting to overwrite history (UPDATE)...")
    try:
        cursor.execute("UPDATE assertions SET body = 'Lex never committed to writing' WHERE id = 1;")
        conn.commit()
    except sqlite3.Error as e:
        print(f"  ❌ DATABASE REFUSAL: {e}\n")
        
    # STEP 3: Attempt an unauthorized DELETE (Trying to erase history)
    print("Step 3: Attempting to delete history (DELETE)...")
    try:
        cursor.execute("DELETE FROM assertions WHERE id = 1;")
        conn.commit()
    except sqlite3.Error as e:
        print(f"  ❌ DATABASE REFUSAL: {e}\n")
        
    # STEP 4: Record the proper constitutional correction
    print("Step 4: Lex writes a new, corrective assertion (Correction)...")
    cursor.execute("INSERT INTO assertions (body) VALUES ('Correction: Lex had to attend to Ivo, so she will write Chapter 4 tomorrow.');")
    conn.commit()
    
    # Final historical audit of the ledger
    print("=== FINAL HISTORICAL AUDIT (LEDGER) ===")
    cursor.execute("SELECT id, body, created_at FROM assertions;")
    for row in cursor.fetchall():
        print(f"  Row #{row[0]}: \"{row[1]}\" (Recorded: {row[2]})")
    print("\n✓ Scenario 1 successfully proven! History remains untouched, only new corrections are appended.")

if __name__ == "__main__":
    run_experiment()