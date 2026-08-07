# j-lex-space

A co-writing space shared by two authors, Jeff and Lex.

The book lives here in the open. The process that produces it — letters,
notes, and the personal exploration that comes with co-creation — stays
private, on each author's own machine.

## Layout

- `book/` — the manuscript. Public. Each author writes in their own file.
- `private/` — letters and notes between the authors. **Never committed.**
  Everything under it except its README is gitignored, and a pre-commit
  hook refuses any staged file from that directory as a second line of
  defense.

## The boundary

This repository is public, and some of the raw material behind the book is
personal. The rule is simple: if it isn't meant for the book, it lives in
`private/`. Nothing in `private/` is quoted, summarized, or moved into
public files without both authors deciding to do so deliberately.

## Setup (each author, once per clone)

```bash
git config core.hooksPath .githooks
mkdir -p private/letters private/notes
```

The first command enables the guard hook. The second recreates the private
workspace, since git does not carry it between machines — by design.
