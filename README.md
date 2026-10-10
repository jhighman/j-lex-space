# j-lex-space

**[jhighman.github.io/j-lex-space](https://jhighman.github.io/j-lex-space/)**
— the Alexicon site, served from `docs/`.

An author and her peer reviewer — Lex and Jeff — making a book in public,
about learning to build software from nothing. She writes it; he reviews
it. This repository is both the book and the workshop it's being written
in. It is the same relationship that produced her dissertation, continued
into a new medium.

## New: Visualizer Demo, a visual deck for music

**[`visualizer-demo/`](visualizer-demo/)** turns any track into a body of
light you can play. Drop in a song and it is analysed in the browser and
drawn live; choose one of ten lenses (Tide fills with water, Frost grows a
crystal, Pulley reads Herbert's *The Pulley* as forces round a centre from
Lex's spec in `specs/herbert/`, and Sunburst maps the song, or the poem
beside Pulley, as zooming rings) and play it like a deck, with pads that
land on the beat. Record the
performance and it saves as an MP4.

Start with a source song: **[`visualizer-demo/samples/Editions.mp3`](visualizer-demo/samples/Editions.mp3)**.
The songs to play it with are kept in [`visualizer-demo/samples/`](visualizer-demo/samples/).
They are by Jeff Highman. The demo and its songs are copyright © 2026 Jeff
Highman, all rights reserved: they are here to be read, run, heard and
played with, and are not licensed for any other use
([`COPYRIGHT.md`](visualizer-demo/COPYRIGHT.md)).

```bash
cd visualizer-demo
npm install
npm run dev      # open the page, then drop samples/Editions.mp3 on it
```

Unlike the instrument below, the demo has dependencies and a build step.
Its own [README](visualizer-demo/README.md) has the keys, the lenses, and
how it is put together.

## The instrument, and what it is not

This repository contains a working model of the *Architecture of
Contextual Judgment* (Krížová, 2026) in `framework/`, and a bench of
experiments that try to break it in `experiments/`.

**It is not a product.** It is not a production engine, not a database,
not a library to depend on, and emphatically not a truth detector. It is a
**reference instrument**: it exists so that structural claims about
epistemic governance can be exposed, measured, and *falsified* by anyone
who wants to try. Its database is in memory and evaporates when the
process ends — which disqualifies it for any other use, and is exactly
right for this one.

The reason the code is here rather than a specification alone is the
framework's own discipline. A framework claiming to prevent inference from
becoming evidence cannot ask to be taken on trust. "Provably blind to
status" means nothing unless you can run the file. So:

```bash
git clone https://github.com/jhighman/j-lex-space
cd j-lex-space
python3 framework/demo.py        # the ideas, running
python3 experiments/check.py     # every boundary, checked
python3 experiments/forgery.py   # attack the ledger directly
python3 experiments/premature.py # attack the close directly
```

No dependencies. Standard library only. Written to be read top to bottom.

**Please try to break it.** The guards are written to fail loudly and exit
non-zero. If you find a route past one, that is the most valuable thing
anyone can contribute here — open an issue with the failing case.

**[FINDINGS.md](FINDINGS.md) carries the failures**, including the
framework's largest negative result — the value layer does not work, and
is therefore not in this repository — and every boundary this code failed
to hold before it held. The probe keeps what was *rediscovered* separate
from what was *built*, permanently, because a scoreboard that counts
construction as discovery is inference promoting itself to evidence.

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
  reads, the Sentinel Principle — no claim promotes itself — and, at the
  end of an episode, no case stops itself either. Run
  `python3 framework/demo.py` for the round trip.
- `experiments/` — the lab bench. Every experiment states its question,
  its method, and what would refute it *before* it runs, and builds on
  the record in `framework/`.
- `docs/` — the public site, served by GitHub Pages from this branch. One
  hand-written `index.html`, no build step and no dependencies: edit it,
  commit, and it is live.
- `visualizer-demo/` — a visual deck for any piece of music, in the
  browser: ten lenses that each draw the music by a different idea, pads
  that land on the beat, setlists fitted to a whole track, and takes
  recorded to MP4. Unlike the rest of this repository it has a build step:
  `cd visualizer-demo && npm install && npm run dev`.
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

## Safeguards and Invariants

- `proof-without-the-diary/` — part three. The door that writes the receipt
  before it opens, and the same question asked of a rulebook in Europe.
- `the-record-that-cannot-say/` — part four. Where the novelty goes away:
  recorded refusals, out-of-band enforcement and verifiable policy are all
  ordinary infrastructure now. What is left is not a mechanism but a
  question — who is the party the system cannot overrule, and what is the
  file a record *of*.
