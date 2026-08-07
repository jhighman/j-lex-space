"""Template for an experiment on the bench.

QUESTION:   (the one thing this probe asks — fill in before writing code)
METHOD:     (the smallest honest way to ask it)
REFUTED BY: (the result that would kill the idea — write this one first)

Copy this file, fill in the three headers, then make the code below ask
your question. Keep it small enough to read top to bottom.
"""

import sys
from pathlib import Path

# The bench builds on the framework's record rather than new machinery.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "framework"))

from sentinel import Record, Case, claim, accept  # noqa: E402

record = Record()

# --- the probe ---------------------------------------------------------
# Replace this block with your method. The example just proves the wiring:
# one observation, one interpretation built on it, one independent accept.

seen = claim(record, "author_a", "observation", "the bench is wired")
idea = claim(record, "author_a", "interpretation",
             "experiments can build on the record", basis=seen)
accept(record, "author_b", idea)

# --- the reading -------------------------------------------------------
# Print what was measured, nothing else. Interpretation goes in letters.

print("claims on the record:", 2)
print("category of idea:    ", record.category(idea))
print("promotion earned:    ", record.earned(idea))
verdict = Case.close(record, [seen, idea]).judge("reader")
print("case verdict:        ", verdict["verdict"],
      "-", verdict["steps"][0]["step"])
