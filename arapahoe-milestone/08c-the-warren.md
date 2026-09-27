# The warren, and the four properties

The rules in this document were written about ledgers. This section is what
happened when they were carried into a place that has no ledger in it: a game
for four- and five-year-olds, with no words, in which a child and a
three-legged dog walk a warren of burrows and meet an animal in each one.

It is here for three reasons. It is the fourth hand-carried copy of the
bench's rules and the first in a third language. It is the first build in
this collaboration with a person in front of it rather than a harness. And
the safety document it was built from turns out to be this document's
argument with a playground drawn on top — four properties, each stated once
as an engineering rule and once as something a child does with their hands.

## What the game is, in one paragraph

An animal shows what it wants. The child answers with one of four things:
food, a ball, a gentle hand, or sitting still. The fourth is the game. When
an animal is frightened, every other offer makes it worse, and the only way
forward is to wait until it changes its own mind. Reaching for something that
is afraid of you is the intuitive move and the wrong one. There is no score,
no timer and no losing; trust rises and falls and never goes below nothing.
At the bottom of the warren is an animal who will not come out for anybody
alone, and who comes out when enough friends speak for the child — and the
dog cannot, because he is hers already.

## The record, in a third language

The record is Rust, and it is the same shape as everything else in this
document: a closed vocabulary of twelve acts, rows appended and never
amended, every reading derived on the call rather than stored. It has no room
for a name, an age, a device identifier, a score, a streak, or anything that
survives the process.

It exists so that one number can be told to a grown-up — how often their
child sat still while an animal was frightened — and so that the number
cannot be arrived at any other way. It is counted from the animal settling,
not from the button being pressed, because a button press proves nothing.
That distinction is `weight.py`'s question in a nursery: what was actually
paid, as against what was claimed.

```
  test waiting_is_counted_by_the_animal_calming_not_by_the_button ... ok
  test the_stretch_cannot_be_reset_without_a_row ... ok
  test what_the_screen_shows_is_what_the_writer_accepts ... ok
  test every_figure_the_app_decodes_is_one_this_engine_declares ... ok
  test the_governance_document_is_not_stale ... ok
  test a_lean_is_its_own_act_and_says_only_that ... ok
  test a_rest_ends_the_stretch_it_follows ... ok
  test friends_are_distinct_creatures_not_rows ... ok
  test an_unknown_act_is_refused ... ok
  test retreats_are_kept ... ok
  test depth_starts_at_one_and_counts_descents ... ok
  test rest_is_in_the_vocabulary_and_nothing_else_crept_in ... ok
  test result: ok. 12 passed; 0 failed
```
The weakest evidence this bench recognises: the author's own tests of the
author's own code. They are reported as that.

## The meter became the animal

The game kept a trust meter — four or five pips filling in above each
encounter. It was the most gamified thing in a game otherwise careful never
to keep score, and it sat at the top of the screen throughout. The record
had refused the idea all along: `score`, `mood` and `fight` are not words
the warren can write, and a test says so. The display was the last place a
score survived.

It is gone. How far along a child is with an animal is now shown by the
animal. At nothing it is a ball — head tucked, legs folded, ears flat back —
on the dark side of the burrow. As it comes to trust the child it uncurls,
its ears come up, it stands to full height, and it walks out of the dark
into the pool of a hanging lamp. At the end it crosses and sits down beside
the dog, which is the last step of the meter and the reward for finishing it
in one movement.

The lamp is what makes this legible, and it had to be built for the purpose:
an animal coming out of the dark needs somewhere lit to come into, or it is
only sliding sideways across a wall. The light is a mask multiplied over the
whole room, so the earth, the roots, the animal and the dog are lit by one
source — stand near it and you are warm, stand across the burrow and the
grain of the dither falls over your coat. The sound follows the same figure:
a bed for the room, and a stem whose volume **is** the trust ratio, so the
creature is heard arriving before it can be seen clearly.

Nothing here is spent or earned. The animal is not paying the child and the
child is not buying the animal; it is deciding how close it wants to be,
which is the only thing trust ever is.

## The four properties

Three of the four were already true of the game by accident of how it had
been built. The fourth was absent altogether.

**Stateless sessions — Monday does not write Thursday.** Nothing is written
to disk: no defaults, no files, no network. Coming back after half an hour,
or on a different day however brief the gap, closes the record and opens an
empty one, because the grown-up's screen calls it *this afternoon* and should
not be lying.

**No hidden photocopies.** Throwing away the letter has to throw away the
copy under the bench. The party — who is walking with the child — had been
keeping its own list of friends beside the record's own rows. It now holds
nothing and reads the rows when asked. That is the difference between a sweep
that works and a sweep that misses: there is no second copy to miss. A
function names anything that survives a fresh start, and is checked rather
than trusted.

**Fail-closed invariants.** The prohibited states are made unrepresentable
rather than guarded by a flag somebody has to remember to check. Trust is a
type whose value is private and whose two ways in both land inside the fence,
so *below nothing* and *past the price* stop being states the program can
hold. This is the blueprint's own asymmetry at kindergarten scale: the thing that
decides is not the thing that asks.

**Dismantling infinite loops.** A warren is an infinite scroll with soil on
it — there is always another tunnel, and nothing in the loop ever suggests
stopping. After three friends or ten minutes the dog sits down on a bench
with a juice box, and the way on is a high-five rather than a way around.

Two things make that a stop rather than a speed bump. The high-five does not
appear until he has actually been sitting, so it cannot be tapped through on
reflex. And **the guard asks the record how long the stretch has been**,
rather than keeping a clock of its own that it could quietly reset — so the
only way to begin a new stretch is to leave evidence that the last one ended.
The grown-up's screen reports the rests, because a game that claims to stop
itself should have to show the rows where it did.

![The stretch is asked of the record rather than kept in a variable. The
dotted box is the thing that deliberately does not
exist.](diagrams/07-rest.png)

It is not a lock. Nobody is held there, nothing is taken away, and no
countdown is shown to be anxious about.

## What the retrofit found

**A closed vocabulary does not stop a true word being written about a false
event.**

The encounter wrote a `wait` row — *sat still and waited* — on the branch
where the child had done the opposite and reached for a frightened animal.
The word is in the closed list, correctly spelled, written by the one call
allowed to write it. Every guard in this document passes it. `vocabulary.py`
asks whether a surface wears a refused word, and this surface wore an
accepted one; the core's own `an_unknown_act_is_refused` asks whether an
unknown word is rejected, and this word was known.

The headline number survived by luck rather than design. It counts the rows
where an animal settled, and no such row was written on that branch, so the
figure a parent is shown was right. The transcript was not: it would have
told a parent their child sat still at the exact moment they grabbed. That is
worse than a wrong total, because it is a specific false claim about a
moment.

What it says about the shape of this bench is that the guards check a
record's *vocabulary* and its *derivations*, and nothing between them asks
whether a row is true of the event that caused it. That gap is not closable
by a closed list, because the list is doing its job. It needs either a second
party that observes the event and the row independently, or acts narrow
enough that only one event could have written them. The row was removed and
that branch now writes only the retreat.

## A second copy of a list will drift from the first

The finding above was about one row. This one is about the arrangement that
produces rows like it, and it arrived three times in a single day.

**The screen counted in prose.** The parent screen called itself the
complete vocabulary and said *ten kinds of thing, and there is no eleventh*,
while the engine was writing twelve. Two of the extra words were visible in
the transcript directly above the claim. The sentence had been true when it
was written.

**The export kept its own array.** Worse, and underneath it: the function
that hands the screen its vocabulary held a hardcoded list of ten acts,
separate from the match deciding what could be written. So a parent could
read *stopped for a rest* in the transcript and then find a complete
vocabulary that did not contain it. That is the screen's central claim, and
it was false.

**And a written description split one act into three.** A report drafted for
parents listed `food`, `ball` and `hand` as separate acts. There is one act,
`offer`, and it records the animal — never which of the four things was
offered. The description named three acts that do not exist while losing two
that do, and it erred in the direction that matters: it described a game
collecting more than this one does.

The first two were fixed by deleting the second copy. `parse` now finds an
act by walking the same array the export prints, so a word outside it cannot
be written and the two cannot disagree — there is no longer a second list to
disagree with. The same was then done to the figures: the reading's JSON was
a format string naming fifteen numbers, and every document describing those
numbers named them again somewhere else. One array now holds each figure's
key, the words a parent sees, a line on its derivation and the function that
computes it; the JSON is built by walking it and the document is printed
from it.

The third could not be fixed that way, because it lived in a document. So
the document is generated. `cargo run --bin governance` renders both tables
from those arrays, and a test fails when the file on disk is no longer what
the engine would print. A stale description is a red build rather than a
wrong sentence in front of a parent.

**The transferable part** is not that a list was stale. It is that this
repository's whole method — guards that fail when a boundary moves — had
been applied to what the record *may say* and to what the readings
*compute*, and not once to the prose that describes either. Every claim on
the parent screen was a guard's output except the ones about the screen
itself, and those were the three that were wrong. Documentation is a
surface, and an unguarded surface drifts.

## A camera that became an act

The game was later given a second view: hold a finger on an animal and you
lean in, and it turns to face you and fills the frame. Letting go sits you
back up. It is deliberately not a mode and not a setting — the safety
document is explicit that safety is a property of the world rather than of
fragile user settings, and a mode switch mid-encounter would be the most
interesting button on screen at the moment a child is meant to be reading an
animal. Leaning at a frightened animal is answered exactly as reaching for it
is.

The reason it belongs in this document is what had to follow. Sitting still
with an animal an arm's length away is a harder thing than watching it from
across the burrow, so if the record could not tell the two apart, the one
number this game exists to state would mean two different things on two
different days. **The view is therefore an act, with a row of its own** — and
a test pins what that word may not say: an animal backing off from a lean is
a retreat, and a lean is never a wait.

Redrawing the close view after a rotation must not write a second row,
because nothing new happened. That is the same discipline as the finding
above, arriving one week later in the same afternoon's work.

## A claim that was measured instead of printed

The parent report was to open with three lines of governance: the session is
in memory, zero bytes are retained, the counting is outcome-verified. Two
were already true and checkable. The third was a sentence.

So it was measured. The screen walks every directory the app may write to,
totals what is there, and prints the number when it opens. The first run
returned **85,983 bytes in nine files** — the graphics system's compiled
textures, no child anywhere in them, and bytes all the same. A printed *0
bytes retained* would have been wrong from the first build that drew a
texture, and nothing would ever have said so.

A fresh afternoon now clears the disk as well as the record, and the crumb
check looks there too: a sweep that only clears what it remembers about is
the photocopy problem wearing different clothes. What remains is that the
measurement can only see where the app is allowed to write. It cannot prove
nothing was sent anywhere, and that claim still rests on there being no
network call in the source — which is true, and checkable by reading, and
not the same thing as proved.

## One afternoon, played to the bottom

| | |
|---|---|
| Time in the warren | 3 min |
| Friends made | 8 |
| Burrows visited | 25 |
| How deep they went | 3 |
| **Waited when an animal was frightened** | **10** |
| Leaned in close | 8 |
| Times an animal backed away | 3 |
| Rests the game insisted on | 2 |
| Friends who vouched | 3 |

Eight leans and three retreats is a different afternoon from eight leans and
none, and both differ from an afternoon with no leaning in it, even where the
friends and the waiting come out the same. That is the whole argument for
recording the view, stated as arithmetic.

## What it does not have

It has never been attacked. The six questions drawn from the reading in
section 4 — the ones the engine's harness answers across a pipe — have never
been asked of it; there is no harness here and no declaration. Each of the
four properties above was written and then verified by the same party, and
the rest guard in particular has never been tried by a child who wanted to
keep playing.

The numbers are the turnstile ruling of section 8b arriving where it can be
felt. Eight prices — how much trust each animal asks for — are literals
chosen by the author, with nothing recording who set them or why. The
retrofit added four more: how long a press becomes a lean, how close is
close, how wide the reach around an animal is, and the rule that leaning at a
frightened animal costs exactly what a wrong offer costs. That last is a
judgement about what a child should be taught, made in a function, answerable
to nobody. Here the price is not a fee: it is what a child is asked to pay in
patience.

And the ending counts three friends as three voices. They share a child, a
session and a record, which by section 8b's own ruling makes them closer to
one voice three times. The game's best moment rests on the arithmetic that
ruling rejects.

*Do not put a living thing in the drum.* This is the repository with a
four-year-old in front of it, and it is the one that has been attacked least.
