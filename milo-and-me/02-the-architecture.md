# Part II — The architecture

The game is the argument's demonstration, not its content. The content is
this: **a claim about software that nobody can check is indistinguishable
from no claim at all.** Everything below exists so that a parent is shown
measurements instead of promises.

## 11. The record

A Rust core holds an append-only ledger. Rows are only ever added; nothing
can be edited or removed, including by us.

A row has an act, a time in seconds since the afternoon began, and sometimes
which animal it was about. There is **no wall clock anywhere in it** — no
date on anything the child did.

### The closed vocabulary

The record can write thirteen kinds of thing and a fourteenth cannot be
written at all:

`wake` · `enter` · `meet` · `offer` · `wait` · `calm` · `retreat` ·
`befriend` · `vouch` · `deeper` · `rest` · `lean` · `gather`

There is no word for a score, none for a mood, none for winning, none for
how she seemed today. *How was she today* is not a question this system can
answer — not declined, not blank, **not answerable**. That is what makes the
record safe to hand to a grown-up: not a promise about who reads it, but
what it is unable to say.

`offer` records that something was offered and to which animal, never which
of the four it was — so the record cannot say a child kept reaching out,
only that she offered.

### Derived, never stored

Every number a parent sees is computed from the rows when the screen opens.
Nothing is kept as a total, so no total can drift from what happened.
"Friends made" is a count of distinct `befriend` rows. "How deep they went"
is a count of `deeper` rows plus one. "How long since she saw the fox" is
the last row about the fox subtracted from now.

The same discipline runs through the game: the party of friends holds
nothing, because a list kept there could drift from the rows and would still
be sitting there after the record was cleared.

## 12. Four properties, and how each is enforced

**Monday does not write Thursday.** A new day, or half an hour away, closes
the record and opens an empty one, then sweeps the disk. The sweep is then
*checked rather than trusted*: anything still holding a summary of the last
afternoon is an assertion failure.

**Nothing is kept.** Not asserted — measured. The parent screen walks
everywhere the app is allowed to write and reports what it finds. This
mattered: the screen was going to say *nothing is kept on this device*, and
when it was made to look instead it found **85,983 bytes in nine files** —
compiled graphics caches, nothing of the child's in any of them, and not
nothing. The sentence had been false since the first time the game drew
anything and nothing would ever have contradicted it.

**Trust cannot hold a wrong answer.** The value is private; the only ways in
clamp inside the fence. Below nothing and past the price are not rejected at
runtime, they are **unrepresentable**.

**The game stops itself.** The rest guard reads the record, not a clock kept
in memory, so a stretch cannot be quietly extended.

## 13. Documents that cannot drift

The most instructive failure in this project was not a bug in the machinery.
It was that **everything written about the machinery drifted from it.**

The vocabulary holds and has a test. But the parent screen once told a
parent the game could write ten kinds of thing while it was writing twelve —
with two of them visible in the transcript directly above the claim. The
function feeding that screen kept its own stale copy of ten. A draft report
split one act into three that do not exist.

Three hand-written copies of one list, all describing something perfectly
true, all wrong within a day of each other. **The property never moved.
Every description of it did — and the descriptions were the only part she
could read.**

So the vocabulary document is now generated from the engine, and a test
fails when it goes stale. When `gather` was added, both guards fired on the
same commit that added it. That is what they are for.

What still has no generator is prose *about mechanics*. Four stale sentences
were found by reading in a single morning, and reading is not a method that
scales.

## 14. The parent surface

Two rules shaped it.

**Outcomes above settings.** The screen leads with where each friendship
stands, in minutes, derived from the rows. The one choice sits underneath. A
setting on its own establishes nothing.

**It will not claim what the record does not know.** How often a friend was
out is not counted, because nobody did anything on those visits and nothing
was written. The screen refuses to tell a parent something the record cannot
support.

### The one thing kept

A choice that has to be remade every launch is not a choice, it is a prompt.
So exactly one file is kept between afternoons: one word, from a list of
three, saying nothing about the child. It is excluded **by name** from the
sweep and from the byte count — so "nothing of hers is kept" stays a
measured claim and this stays visible beside it rather than buried inside
it. The screen prints its contents in full and offers to delete it.

A secret exception would be worse than no exception.

### The second account

The warren's record is what the **child** did. A parent's choice has no
business in it — there is no act for *somebody changed the rules*, and
inventing one would let the record say a thing the child did not do.

But leaving it unrecorded is worse, by this work's own argument: *a refusal
nobody can see is indistinguishable from no refusal.* By the same reading, a
dimension nobody can audit is indistinguishable from no dimension.

So there are two accounts, kept apart on purpose:

| | the child's record | the operator's log |
|---|---|---|
| about | the child | the grown-up |
| words | thirteen acts | three decisions |
| time | seconds since the afternoon began | wall clock |
| survives a new afternoon | no | yes |

And **clearing it leaves the line that says so.** A log a parent cannot
clear is data they cannot get rid of; a log that clears silently is not
evidence of anything. So clearing replaces the file with exactly one line
recording that it was cleared. The gap is visible rather than invisible.

## 15. How it is built

- A **Rust core** with a C ABI holds the ledger and every derivation. It is
  the only copy of the vocabulary, and both the writer and the parent screen
  read that one list.
- **SpriteKit / UIKit / SwiftUI** for the game and the grown-up's screen.
- **Nothing is loaded.** Every creature, room, icon and light is drawn in
  code from a species description. There is no art pipeline and nothing that
  can go missing — which is also why the game runs in both orientations on
  every device without a second set of assets.
- The design space is **not a fixed rectangle**: the short axis is always
  768 and the long axis follows the device, so nothing letterboxes and a
  creature is the same size relative to the screen however the phone is
  held.
- A **reachability check** runs after every layout — which means after every
  rotation, which is when layouts break — and fails loudly if anything a
  child is meant to press has ended up off screen, under the notch, or
  beneath the home indicator. A control a child cannot reach is not
  cosmetic: *the animal decides* means nothing if the four ways of asking
  are unreachable.

## 16. What is unproven

This section is the reason the rest of the document can be trusted, and it is
not a formality.

- **No child has played it.** Not one. Every judgement about what a
  four-year-old finds legible, frustrating, or moving is the authors'
  imagination.
- **Nobody outside the two authors has attacked it.** The core's green tests
  are a claim about what the authors thought to test.
- **The numbers came from the air.** How much patience each animal asks for,
  how long a friendship takes to cool, how often a friend is out, how often
  a treasure is rare — all chosen by the author in a struct literal. These
  decide whether the game feels like tending a friendship or being punished
  for playing at the wrong speed, and nothing records who picked them.
- **The one mode.** The fifth button that appears while carrying something
  is the first thing the design asks a child to remember between rooms. The
  argument that it is affordable rests on nothing depending on it, and that
  argument has never met a four-year-old.
- **Two rendering spikes are unfinished.** A pixel-art treatment covers the
  burrows only; a 3D treatment covers one creature.
- **The first stored file has never met a fresh start.** The exclusion that
  keeps the sweep honest has been reasoned about, not exercised.

Everything in Part IV is conditional on the first two of these.
