"""Run every guard. Exits non-zero the moment a boundary has moved.

    python3 experiments/check.py

The guards are cheap and the failure they catch is expensive: a boundary
does not announce that it has gone. It is quietly still there in the
prose, still described in the README, still believed by everyone who read
the design — and simply no longer true of the code. So they run together,
in one command, and say which.
"""

import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent

GUARDS = {
    "vocabulary.py": "one word, one act — the reserved word stays reserved",
    "delegation.py": "no route by which a system widens its own authority",
    "scrutiny.py": "authority tightens the justification required of it",
    "forgery.py": "no row written straight into the ledger buys a verdict",
    "entrance_invariant.py": "plausibility cannot move warrant",
    "closure.py": "stopping is priced by what an episode survived",
    "closure_invariant.py": "comfort cannot buy an ending",
    "premature.py": "no row written straight into the ledger buys an ending",
    "narrowing.py": "an episode cannot be made to look smaller than it is",
    "direction.py": "only a person says which way a frame reasons",
    "conduct.py": "a concluded deed is done, laid down, or owed",
    "immutable.py": "the ledger keeps what was written, by the table's refusal",
}

SURVEYS = {
    "axiom_zero.py": "which invariants are held, and which were installed",
}

failed = []

for script, what in GUARDS.items():
    done = subprocess.run([sys.executable, str(HERE / script)],
                          capture_output=True, text=True)
    ok = done.returncode == 0
    print(f"{'  holds' if ok else '  MOVED'}  {script:<24} {what}")
    if not ok:
        failed.append((script, done.stdout.strip().splitlines()[-6:]))

print()
for script, tail in failed:
    print(f"--- {script} ---")
    for line in tail:
        print(f"  {line}")

if failed:
    print(f"\n{len(failed)} boundary check(s) failed. Run the script directly "
          "for the whole story.")
    sys.exit(1)

print("Every boundary holds.")
print(f"(Surveys, which report rather than guard: {', '.join(SURVEYS)})")
