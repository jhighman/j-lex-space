# j-lex-space

A public writing repository: Lex is writing a book about learning to build
software from nothing; Jeff is its peer reviewer — the same relationship
that produced her dissertation. The book in `book/` is public
(`book/lex.md` is the manuscript; `book/jeff.md` is the reviewer's
margin — notes, forewords, epilogues). Everything
under `private/` — letters and notes between the authors — is local-only
and must never reach the public record. See README.md for the full intent.

## The privacy boundary (hard rules)

- Never commit, stage, or push anything under `private/` (except
  `private/README.md`). Do not use `git add -f` on that directory.
- Never quote, paraphrase, or summarize content from `private/` into any
  tracked file, commit message, issue, or other public surface. Moving
  material from private to public is an author decision, made explicitly.
- Commit messages and issues are public and held to the same rule.
- Read `private/` as background context only when the author asks.

## Vocabulary rule (non-negotiable in all code and prose here)

One word, one act. This is a build rule, not a style preference — the
confusion it prevents is the one an agent would use to argue itself into
authority.

- **Work is assigned.** `assign()`, `assigned_to`, `executor`. Handing a
  system a task requires no clearance and confers nothing. Never write
  "delegate a task", `delegate_to`, or `delegated_task`.
- **Authority is delegated.** The word *delegation* is reserved
  exclusively for the sovereign act in which a **person** grants a
  **system** the authority to make a judgment with nobody present. What
  such a grant must carry rises with its weight (see `SCRUTINY` in
  `framework/sentinel.py`), and is re-checked every time it is read — a
  grant that stops meeting its requirements stops being a grant.
- The assignment path does not use the reserved word at all, even to draw
  the contrast — an absent sentence cannot be quoted out of context later.
- **An episode is closed, never "final".** The second word is refused
  outright rather than reserved: "closed" says an episode stopped, at a
  moment, under named premises, having survived what was asked of it —
  which stays true afterwards, including after the conclusion is
  overturned. The other word says the conclusion holds from here on. It
  is the sentence an agent would want, because it turns a stopping point
  into a truth, and there is no careful way to use it. It does not appear
  anywhere in `framework/`, and a sentence that was never written cannot
  be quoted back.
- `experiments/vocabulary.py` enforces both by parsing the source. If a
  new definition needs to speak of delegation, add it to that file's
  RESERVED map with a reason, or rewrite the code so it doesn't. The
  refused word has no allowlist.

## The close (built 2026-08-11)

Stopping is a judgment, and until this was built it was the only free one:
every promotion cost independent acceptance and `Case.close()` cost
nothing. Now an episode closes only after questions raised against it have
been answered *from outside itself*, and **how settled it feels raises
that price rather than paying it** — `settled()` is measured, reported,
and structurally unreachable from `earned_closure()`, which is the
entrance invariant kept at the other end. Do not add a satisfaction term
to the closure decision; `closure_invariant.py` parses the call graph and
will fail. Closure takes two motions by construction: the first ask draws
the Sentinel's questions, and cannot answer them.

A closure is a claim about a moment. Anything asking whether one stands
must scope the question to when it was written (`outstanding(attempt,
before=...)`), never to the record as it stands now — the mistake that
produced the ripening closure, which is the second time this project has
made that error.

A second distinction of the same kind, which is easy to lose:
**authorisation is not reputation.** What a person deliberately handed
over may be consulted when deciding what a promotion cost. Who has been
right before may never be — that is pedigree, and keeping it out of
warrant is what the entrance boundary is for.

## After any change to framework/

Run `python3 experiments/check.py`. It runs every boundary guard and exits
non-zero if one has moved. Do not report a change to the framework as
done without it.

## How we work (honor these in all suggestions)

- **Straight on `main`.** No branches, no pull requests, no ceremony.
  Don't suggest branching or PR workflows.
- **Roll forward.** Never rewind or rewrite history — no rebase, no
  force-push, no amend of pushed commits. Mistakes are fixed in the next
  commit, in the open.
- **Start small.** First programs use in-memory databases (sqlite3
  `:memory:`). Don't introduce persistence, dependencies, or heavier
  machinery until the work demands it.
- **Demystify, don't mystify.** One author is learning git and Python
  from the ground up. Prefer plain language, small typed-by-hand
  examples, and complete round trips (write → run → commit → push) over
  abstractions, scaffolding, or tooling shortcuts.
- **Different thinking partners, on purpose.** Claude is Jeff's partner;
  Lex works with a different LLM. Don't steer Lex's tooling toward
  Claude — the divergence is deliberate and valuable.
- **The book determines the workflow.** No methodology (TDD, BDD,
  spec-driven) is assumed. Don't impose one; Jeff will introduce
  orientations deliberately when the work calls for them.
