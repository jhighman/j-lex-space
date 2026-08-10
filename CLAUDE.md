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
  **system** the authority to make a judgment with nobody present.
- The assignment path does not use the reserved word at all, even to draw
  the contrast — an absent sentence cannot be quoted out of context later.
- `experiments/vocabulary.py` enforces this by parsing the source. If a
  new definition needs to speak of delegation, add it to that file's
  RESERVED map with a reason, or rewrite the code so it doesn't.

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
