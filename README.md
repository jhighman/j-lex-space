# j-lex-space

An author and her peer reviewer — Lex and Jeff — making a book in public,
about learning to build software from nothing. She writes it; he reviews
it. This repository is both the book and the workshop it's being written
in. It is the same relationship that produced her dissertation, continued
into a new medium.

## The intent

This is a private-public partnership. The book is written in the open; the
process behind it — letters between the authors, working notes, the
personal exploration that co-creation stirs up — stays private, on each
author's own machine. We publish the work, not the workings. Both matter;
only one belongs to the world.

We're here to grow, not just to ship. One of us is learning the craft from
the ground up — git, Python, the round trip from an idea to running code
in someone else's hands. The other is learning how to teach it without
mystifying it. The book records what that exchange produces.

This is a personal project, maintained as one. Nothing here represents
professional work or any employer. It exists for three reasons:
cross-discipline ideation, shared understanding, and giving something
back to humanity.

## How we work

- **Straight on `main`.** No branches, no pull requests, no ceremony. If
  we collide, we sort it out.
- **Roll forward.** We don't rewind history. Mistakes get fixed in the
  next commit, in the open. A messy history that tells the truth beats a
  clean one that doesn't.
- **Start small.** First programs use in-memory databases — real tables,
  real queries, nothing to install, nothing to break. Persistence and
  bigger machinery arrive only when the work demands them.
- **Different thinking partners, on purpose.** Each of us pairs with a
  different LLM. Two people with two different assistants disagree in
  useful ways, and the disagreements show us things neither pairing would
  find alone.
- **The book determines the workflow.** No methodology is assumed up
  front. Orientations like TDD, BDD, or spec-driven development may be
  tried on later, like coats — we keep only what the work proves it needs.

## Layout

- `book/` — the manuscript. Public. `book/lex.md` is the book — Lex's.
  `book/jeff.md` is the margin: the reviewer's notes, forewords, and
  epilogues that travel alongside it.
- `private/` — letters and notes between the authors. **Never committed.**
  Everything under it except its README is gitignored, and a pre-commit
  hook refuses any staged file from that directory as a second line of
  defense. Letters move through `drafts/`, `sent/`, and `received/` —
  they travel by email, never by git.
- `framework/` — a small working model of the *Architecture of Contextual
  Judgment* (Krížová, 2026): an immutable record, derived-not-stored
  reads, and the Sentinel Principle — no claim promotes itself. Run
  `python3 framework/demo.py` for the round trip.
- `tools/` — small, dependency-free helpers. `letterpress.py` turns a
  markdown letter into email-ready HTML: book-like type with every style
  inlined, so it survives pasting into mail clients and blog editors.
  Letters are written person to person, and they should look it.

## The boundary

The rule is simple: if it isn't meant for the book, it lives in `private/`.
Nothing there is quoted, summarized, or moved into public files unless both
authors decide to do so deliberately. Commit messages and issues are public
too, and are held to the same rule.

## Setup (each author, once per clone)

```bash
git config core.hooksPath .githooks
mkdir -p private/letters/drafts private/letters/sent private/letters/received private/notes
```

The first command arms the guard hook. The second recreates the private
workspace — git does not carry it between machines, by design.
