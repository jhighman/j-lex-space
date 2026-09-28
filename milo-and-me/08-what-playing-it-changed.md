# Part VIII — What playing it changed

Everything before this part was written about a game nobody had played.

Not in the sense that it was untested — the record has tests, the governance
document cannot drift from the engine, the room provenance is gated before a
room exists. In the sense that the only way to *see* it was an iOS simulator
producing screenshots too dark to read, and every design argument was settled
by two people reading source and imagining the result.

So a second build was made: the same loop and the same map, in a browser,
with the numbers on a rail beside the picture. It took an afternoon. What it
found in that afternoon changed the game more than the preceding months of
argument, and this part is the account of that, because **the changes are
less interesting than the fact that none of them were visible from the
code.** The code was correct in every case.

---

## 49. The four offers stopped being the encounter

Part I §3 says the encounter is the game: four buttons, always all four, and
the fourth is stillness. That was true when it was written and it is still
true of the shipped iOS build.

It is not what the game does now.

Played rather than read, the encounter turned out to be thinner than the
argument around it. Four buttons and a posture is a legible loop and a
shallow one, and the thing it could not express is the thing the whole
design is about: **the difference between arriving somewhere and being taken
there.**

What replaced it inverts the meter. Trust stops being a quantity the child
accumulates and becomes **a place, numbered one to four, inside that
creature's own universe.** Pressing the next number in order *walks* her one
step deeper. Pressing any other number *jumps* — and the place is genuinely
true when she arrives, because there is no lying to a child about where she
is. Neither is punished. There is still no way to lose.

The distinction the old model could not make is now the whole mechanic. A
count eases over three quarters of a second; a jump snaps. **Counting to
four makes a friend. Jumping to four does not** — the room is at four, and
nobody walks out of the mouth with her, because the walk did not happen.

**And the ending had to follow it.** The Moon Hare came out when three
friends vouched for you, which was a set piece: they walk over while she
waits. Sequential trust has nobody to walk and no meter to fill, so the scene
became a division — **the tide is hers, the light on the water is theirs.**
Her four places move the water like any creature's numbers move their world.
One light lands on the water for each friendship that was *walked* to four,
in that animal's coat colour; a friendship jumped to four leaves none. At
three lights and full tide she turns round.

No slot is ever drawn empty, which would make the warren a checklist. No
number in her room can be pressed toward it: the only thing that turns her is
a walk taken somewhere else, earlier, with somebody else. And **Milo casts no
light** — he is on the bank beside her, nearer than any of them, and the
water is blank underneath him. That the one companion who was there the whole
way cannot speak for her had been a sentence in three documents. It is now a
picture, and it is the only part of the design that needs no explaining.

This is the same lesson Part I §10 claimed, arrived at from the other side.
The offer model taught *wait for the frightened one*. Sequential trust
teaches that the route is the thing, and it teaches it without ever paying
more for patience — the architecture's standing refusal, which §12 records
and which survives the change unaltered.

## 50. Nine universes, not one room nine times

Part I §4 is headed *Eight animals, eight moments*. Two corrections.

**The cast is nine.** It has been nine since the bear cub was dropped and the
mole and the moth added; the prose counted eight for months because nothing
in the repository counts the cast for you, and a number in a sentence has no
generator to keep it true. It was found by a tool asking how many music files
to ask for.

**And they were one room nine times.** One lit chamber, one lamp, one radius,
with the coat colour swapped per animal — which the interior specification
now forbids outright: a screenshot of deer-3 and mole-3 must not be the same
composition recoloured.

So each creature is a world instead. The hedgehog's four places are degrees
of curl — a ball with no inside, a seam, an eye, a coat with room for two.
The mole has no lamp at all, because there is no sky in his world and the cut
*is* the world. **The moth's run backwards:** counting *dims* her star,
because walking a moth toward a brighter centre and calling that trust is the
opposite of the story being told.

The warren became nine places rather than one place nine times, and the
descent acquired the variety Part I had been claiming for it.

## 51. The sound authority was overturned by its own author

`SOUND.md` ruled that music almost should not be in the burrow, and built the
encounter around what a small clay room sounds like when nobody is playing
anything: a wick, packed earth, a dog, one material sound per animal. Part II
treats that as settled.

It was built. Then it was heard, and the verdict was that three loops and a
filter do not carry a room.

Three requests followed, and between them they reversed the document's three
tests in order — a tune, then a pulse, then music that responds to trust.
`SOUND.md` was rewritten. The version it replaced is kept whole, because a
superseded authority that quietly disappears is worse than one that was
wrong: the next reader cannot tell which rules were argued with and which
were never noticed.

**One rule survived, narrowed, and it is now the only absolute.** The music
may *move* with trust and may not *improve* with it. Curled, the theme is a
room away and through earth — 700 Hz, 62% wet. In the pool it is close and
open — 14 kHz, 6%. Nothing is added, nothing unlocks, no instrument enters on
success. **Distance, not prettiness.** A score adds a layer when she does
well and teaches her that she performed; the same sound arriving is the
gesture the animal is already making.

What it gave up is written down rather than glossed. The old document named
two silences and music fills the second, so **the burrow no longer teaches
quiet by being quiet.** It teaches it by what the animal does, which is a
narrower channel and puts more weight on the picture.

## 52. Measurements that were wrong in our favour

Three, recorded because the shape recurs.

**The hiss in the rooms was the animal.** Reported as a problem with the
room tone; measured, all four beds were tonal and the shared animal voice was
**white noise at spectral flatness 0.982**, the loudest bed in the burrow.
Worse, the trust-driven filter opened onto it: a child who earned an animal's
confidence was paid in static. **The hiss was the trust meter.** Its envelope
was never wrong — 233 bursts, 42% duty, shaped attacks — so the fix reshaped
the spectrum and left every sample's timing alone.

**The door was a filter that did nothing.** The threshold was built as a
low-pass swept down to each mouth's own frequency, because a door closing is
a lid closing. Rendered and measured it was worth **0.0 dB** against a plain
fade: the material is −11 dB at 1.2–4 kHz and has no top to take away. What
makes it read as going indoors is that the earth bed is 15 dB quieter than
the tune — a level change, which is what the document had said in words
before anybody tried to build it as a filter.

**A gate was applied at a length it could not measure.** Beat strength over a
1.5-second window reads about a third of its true value, because the
autocorrelation searches lags of 18–150 envelope frames inside a window
holding 145. A line drawn from three files was then used to judge clips too
short to test it.

## 53. The map was an installation

The warren was drawn in 3-D alongside the burrow, and it looked like
something. A reader who had not seen the code named what was wrong with it in
four sentences: chambers that do not read as rooms, tunnels that do not read
as routes, no *you are here*, and glow used for three different things at
once.

*A map has to answer four questions at a glance: where am I, what is this
room, what connects to it, and where can I go next.* It answered none of
them.

What fixed it was giving up on one renderer. **The room is a place and wants
to be lit; the map is a diagram and wants to be flat.** The map is SVG now,
with depth running down the page and alternate levels reversed so the descent
snakes rather than teleports. Chambers carry names — but only the ones she
can step into, because four floors of the same seven-chamber ring, all
labelled, read as four menus of seven destinations when at most three are
ever a next step.

And the way down moved *into the bowl*, as an arrow. As a dotted line
spanning two floors it was a route she could see and could not take: from the
hedgehog nest a player taps the floor below and nothing happens.

## 54. What a bench cannot do

This is the part worth keeping if the rest goes stale.

Part II is about a system that cannot drift: a governance document generated
from the engine, a test that fails when prose and code disagree, a
provenance gate written before the first impulse response existed. All of it
works, and all of it verifies the same thing — **that the code matches what
was written down.**

None of it can report that what was written down is wrong.

Every change in this part came from somebody looking at the thing or trying
to walk down a level, and in every case the code was doing exactly what its
authors specified. The hiss was correctly wired to trust. The map's glow was
correctly assigned. The door's filter was correctly swept. The four offers
were correctly implemented.

A test suite is an argument with the past. It catches the moment a system
stops doing what it used to do. It is structurally unable to catch a system
that has always done the wrong thing, and this project spent months building
increasingly rigorous guarantees of exactly that kind before spending an
afternoon on the one that could say *no*.

The afternoon won.

---

Nothing in this part means a child has played it. That remains the thing that
has never happened, and the gap between *somebody played it* and *a
four-year-old played it* is wider than the gap this part is about. What
changed is that the game can now be wrong in front of a person, which it
could not be before, and everything above is what fell out of the first time
it was.
