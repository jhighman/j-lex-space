"""Does the codebase keep the two meanings of "delegation" apart?

QUESTION:   the framework reserves one word for one act — Delegation is
            the sovereign record of a person granting a system authority
            to judge with nobody present, and work is *assigned*, never
            delegated. Vocabulary drifts silently. Is the reservation
            actually held, or only intended?
METHOD:     parse the framework, find every definition whose code mentions
            delegation, and compare that set against the definitions
            permitted to. Then scan for task-shaped uses of the word.
REFUTED BY: the word appearing in any definition outside the reserved set,
            or in any construct about handing out work.

This check exists because a semantic bug cannot be caught by testing
behaviour. A system that "delegates a task" behaves correctly and reads
correctly, and the error is only visible later, in the argument somebody
makes on the strength of the word: *the task was delegated to the agent,
therefore the agent holds a delegation.* By then the confusion is load
bearing. So the guard is placed on the vocabulary itself, where the
mistake would first be made.

Rule set by Alexandra Krížová for this build, 2026-08-10.
"""

import ast
import sys
from pathlib import Path

FRAMEWORK = Path(__file__).resolve().parent.parent / "framework" / "sentinel.py"

# The only definitions permitted to speak of delegation, and why each is.
# Note who is absent: assign() and assigned(). The path that hands out work
# does not utter the word at all, which is a stronger discipline than using
# it carefully — there is no sentence there for anyone to quote later.
RESERVED = {
    "Record.delegated": "reads standing grants back against the roster",
    "Record.standing": "asks whether an actor may judge — authorisation, "
                       "never reputation",
    "Record.fault": "the one place that decides whether a grant stands",
    "Record.covering": "enumerates what confers authority, so that revoking "
                       "one grant is not mistaken for revoking the authority",
    "Record.void_grants": "shows the rows that look like grants and are not",
    "Record.governed": "says when the invariant cannot be enforced at all",
    "Delegation.__init__": "refuses construction; a grant is not a constructor",
    "Delegation.grant": "the sovereign act itself",
    "accept": "enforces that a system judges only where granted",
}

# Shapes that would mean the confusion has already happened.
FORBIDDEN = ("delegate_task", "delegated_task", "delegate_to", "task.delegat",
             "delegate_work", "delegating work", "delegated the task")

source = FRAMEWORK.read_text()
tree = ast.parse(source)


def definitions(module):
    """Every function and method, by qualified name."""
    for node in module.body:
        if isinstance(node, ast.ClassDef):
            for sub in node.body:
                if isinstance(sub, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    yield f"{node.name}.{sub.name}", sub
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            yield node.name, node


speaks_of = {name for name, node in definitions(tree)
             if "delegat" in ast.unparse(node).lower()}

unreserved = sorted(speaks_of - set(RESERVED))
silent = sorted(set(RESERVED) - speaks_of)
misused = [pattern for pattern in FORBIDDEN if pattern in source.lower()]

print("definitions permitted to speak of delegation:")
for name, why in sorted(RESERVED.items()):
    held = "  " if name in speaks_of else "? "
    print(f"{held}{name:<22} {why}")

print(f"\ndefinitions that speak of it without reservation : {unreserved or 'none'}")
print(f"reserved definitions that no longer mention it   : {silent or 'none'}")
print(f"task-shaped uses of the word                     : {misused or 'none'}")

# The vocabulary for work must exist, or the reservation is only an absence.
has_assignment = all(word in source for word in ("def assign", "executor"))
print(f"a separate vocabulary for handing out work       : {has_assignment}")

print()
if unreserved or misused or not has_assignment:
    print("REFUTED. The word has drifted:")
    for name in unreserved:
        print(f"  - {name} speaks of delegation without being permitted to")
    for pattern in misused:
        print(f"  - {pattern!r} appears in the source")
    if not has_assignment:
        print("  - no distinct vocabulary exists for assigning work")
    sys.exit(1)
else:
    print("The reservation holds. One word, one act: work is assigned and")
    print("authority is delegated, and nothing in the source blurs them.")
    if silent:
        print(f"(Note: {silent} no longer mention it — check the allowlist "
              "still describes the code.)")
