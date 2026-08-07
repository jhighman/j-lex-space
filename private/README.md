# private/

This directory is the private side of the partnership: letters between the
authors and working notes. Everything in it except this README is ignored
by git and never leaves the machine it was written on.

## Layout

- `letters/drafts/` — letters being written.
- `letters/sent/` — letters that have gone out.
- `letters/received/` — letters that arrived, saved as markdown.
- `notes/` — each author's own working notes and context.

## How a letter travels

Letters move by email (or wherever people write to people), never by git.

1. **Draft** in `letters/drafts/` as plain markdown.
2. **Press** it into email-ready HTML:
   `python3 tools/letterpress.py private/letters/drafts/the-letter.md`
   — a browser page opens; Select All, Copy, paste into the email or post.
3. **Send** it, then move the `.md` from `drafts/` to `sent/`.
4. **Respond** — when a letter arrives, save its text as markdown in
   `received/`, and draft the reply in `drafts/`.

If a letter is meant for a blog or other public place, the same pressed
HTML pastes there too — but publishing one is a deliberate author
decision, made together, never a side effect.

If something written here earns a place in the book, it gets rewritten into
`book/` deliberately — it is never committed from here.
