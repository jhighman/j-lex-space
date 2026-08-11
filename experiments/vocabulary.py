"""Does the codebase keep the two meanings of "delegation" apart?

QUESTION:   the framework reserves one word for one act — Delegation is
            the sovereign record of a person granting a system authority
            to judge with nobody present, and work is *assigned*, never
            delegated. A second word is refused outright: an episode is
            closed, at a moment, under premises, and never called final.
            Vocabulary drifts silently. Are the reservations actually
            held, or only intended?
METHOD:     parse the framework, find every definition whose code mentions
            delegation, and compare that set against the definitions
            permitted to. Then scan for task-shaped uses of the word, and
            for the refused word anywhere at all.
REFUTED BY: the reserved word appearing in any definition outside the
            reserved set, or in any construct about handing out work; or
            the refused word appearing anywhere in the framework.

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
import re
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

# The refused word. Not reserved for one act — refused for all of them.
#
# "Closed" says an episode stopped, at a moment, under premises it names,
# having survived what was asked of it. That is a claim about a moment, and
# it stays true afterwards, including after the conclusion is overturned.
# The refused word says something else entirely — that the conclusion holds
# from here on — and it is the sentence an agent would want, because it
# converts a survived question into a settled one and a stopping point into
# a truth. There is no careful way to use it, so the framework does not
# offer it at all. The absence is the guarantee: a sentence that was never
# written cannot be quoted back out of context.
#
# 'finally' is the language's, not ours, and is left alone.
REFUSED = re.compile(r"\bfinal(?!ly\b)\w*", re.IGNORECASE)

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
refused = sorted(set(REFUSED.findall(source)))

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

# And the refused word, which no definition may use carefully either.
has_closure = all(word in source for word in ("def close", "premise"))
print(f"the refused word, anywhere in the framework      : {refused or 'none'}")
print(f"a vocabulary for stopping that does not need it  : {has_closure}")

print()
if unreserved or misused or refused or not has_assignment or not has_closure:
    print("REFUTED. The word has drifted:")
    for name in unreserved:
        print(f"  - {name} speaks of delegation without being permitted to")
    for pattern in misused:
        print(f"  - {pattern!r} appears in the source")
    for word in refused:
        print(f"  - {word!r} appears in the source; an episode is closed, not that")
    if not has_assignment:
        print("  - no distinct vocabulary exists for assigning work")
    if not has_closure:
        print("  - no vocabulary exists for stopping under named premises")
    sys.exit(1)
else:
    print("The reservations hold. One word, one act: work is assigned and")
    print("authority is delegated, and nothing in the source blurs them. An")
    print("episode is closed, at a moment, under premises — and the word that")
    print("would make a stopping point into a truth is nowhere to be quoted.")
    if silent:
        print(f"(Note: {silent} no longer mention it — check the allowlist "
              "still describes the code.)")
