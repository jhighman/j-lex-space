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
- **A claim is professed, never "committed."** Under a frame that has
  declared descending warrant, a person may take a claim as given —
  `profess()` — and the identifier `commit` is refused in `framework/`
  outright, because this workshop says "commit" fifty times a day about
  the repository and a reserved word that collides with the commonest
  verb in the room is a reservation nobody can keep. Prose may speak of
  commitment (the philosophy needs the noun); no function, act string, or
  row wears the word. `experiments/vocabulary.py` enforces both sides.
- **An episode is closed, never "final".** The second word is refused
  outright rather than reserved: "closed" says an episode stopped, at a
  moment, under named premises, having survived what was asked of it —
  which stays true afterwards, including after the conclusion is
  overturned. The other word says the conclusion holds from here on. It
  is the sentence an agent would want, because it turns a stopping point
  into a truth, and there is no careful way to use it. It does not appear
  anywhere in `framework/`, and a sentence that was never written cannot
  be quoted back.
- **A deed is attested, and may be renounced.** Two acts at the
  praxeological rung, kept apart from their neighbours: a claim is
  *accepted* (judgment about warrant), a deed is *attested* (witnessed
  conduct, never counted from the doer); a grant is *revoked*, a deed is
  *renounced* (laid down by a person, in writing, with a reason — never
  by a system, never by lapse).
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

## Episode identity and direction (built 2026-08-11/12)

An episode is a *set* of claims, named canonically by all of them
(`episode()` in `framework/sentinel.py`) — never by its last claim. Three
holes opened under a green suite because the record identified an episode
by less than it priced it on; a thing must be identified by everything it
is charged for. Do not key any lookup, supersession, or price on a single
claim of an episode.

Direction of warrant is declared **on the frame, by a person, with a
written reason** (`Premise.name(direction=DESCENDING, rationale=...)`) and
re-derived at read time. It is never a property a claim asserts about
itself — that would be a one-word exemption from every price in the file.
Descent is a different payment schedule, not an exemption: professions go
on credit and the episode settles at the exit, where everything reasoned
down from them (at any depth) must have been examined between parties.
Where the instrument has no applicable test it reports OUT OF SCOPE, which
is a different sentence from FAIL.

Stopping is also priced in voices, not only in answers: an episode's close
takes answers from as many distinct outside voices as its heaviest act
would cost to promote (`settlers()`, `attention_price()`). One willing
voice writing many rows pays nothing extra.

## The obligation (built 2026-08-14)

A closure that reached an action opens an obligation, derived at read time
from the standing closures (`obligations()` in `framework/sentinel.py`).
It settles two ways only: conduct, attested by a voice other than the doer
with standing to observe (`attest()` writes, `attested()` counts), or a
person laying the deed down in writing (`renounce()`). Nothing expires —
an intention nobody can see expiring is indistinguishable from a decision
— and no quantity of further analysis settles a deed. Do not add a third
settlement path, a decay, or any route by which the Sentinel or a system
lays down a deed; `conduct.py` attacks all of these.

## The ledger refuses (built 2026-08-17)

Immutability is enforced by the table, not by our abstaining from writing
the method — the `no_erasure` and `no_deletion` triggers abort any UPDATE
or DELETE on `assertions`, and `about`/`basis` are foreign keys, which
needs `PRAGMA foreign_keys = ON` (off by default, per connection). Never
add an update or delete path: correction here is a new row that a
derivation prefers, and `immutable.py` attacks every route.

The vocabulary of acts is **surfaced, not gated**. `Record.ACTS` lists
them and `void_acts()` reports rows outside it, beside `void_grants()` and
`void_closures()`. Do not add a `CHECK` on `act` — refusing the row would
keep less than the attempt, and this ledger's character is to keep what it
was handed and decline to be persuaded. Add new acts to `ACTS` when you
add them to the framework, or they go unreported.

## Affect may gate work; affect may never price warrant (2026-08-18)

Proposed by Lex as the governing asymmetry for the affective layer, and it
is the generalisation of two mechanisms already here: comfort raises the
closing bill and never pays it, and plausibility is measured at the door
and kept structurally out of `earned()`.

A measure of the system's own state — curiosity, vigilance, relief,
satisfaction, or any successor — **may** raise a cost, allocate attention,
open a loop, or refuse to begin. It **may never** lower a cost, supply a
warrant, shorten a bill, or trigger a seal. `closure_invariant.py` already
enforces the hardest case by parsing the call graph: no satisfaction term
may be reachable from the closure decision at any depth.

Two consequences worth stating before anyone writes an affective layer:

- **A deed has no term; authority does.** A grant carries an expiry and
  `fault()` returns `expired` once it passes, because a permission that
  outlives its reason is a backdoor. An obligation carries none, ever — a
  lapsed permission is a permission withdrawn, but a lapsed obligation is
  a decision nobody made. Any reconsideration policy attaches to the
  grant, never to the debt. `conduct.py` attacks both directions.
- **The system may decline to spend, and may never decline invisibly.**
  An affective gate that skips a branch records the skip. This is the
  `void_grants()` / `void_closures()` / `void_acts()` rule, applied at the
  entrance: a refusal nobody can see is indistinguishable from an
  oversight.

Reserve the vocabulary before it drifts, settled with Lex on 2026-08-18.
`obligations()` means deeds owed after a closure that reached an action.
An act named in a text that no case has closed over is a **latent verb** —
latent rather than prospective, because the force is already present in the
words and is waiting for structural closure to reveal it, not projected
forward. Latent verbs are measured at ingest (`SemanticMass` in alexicon,
which holds the pipeline); obligations exist only after a closure. One word,
one act applies to measures as much as to verbs, and these two must never
merge: the first is a reading of text, the second is a debt with a case
behind it.

## Two standing rules from the failure record

- **Nothing is evaluated by the process that produced it.** Four times in
  six days the generator and the judge were the same process (see
  FINDINGS.md), and it is what killed the value layer. If an artifact is
  to be measured, classified, or verified, the measuring may not be done
  by whoever or whatever generated it — including the assistant that
  drafted it.
- **Never open `private/notes/corpus-v3-key.md`** (or any withheld answer
  key) while a classification under a pre-registration is pending, and
  never quote its contents anywhere. The key is released only after all
  readers have submitted.

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
