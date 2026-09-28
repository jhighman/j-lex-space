# Part IX — Nothing improves, and that is the design

Eight parts of this paper argue about a record: what it may contain, who it
is for, whether the architecture is a product, and whether anybody else has
built the door. That argument is real and it is not the reason the game
exists.

The game exists because of a sentence that every system in it was built to
say, and the sentence is **the world does not get better because you did
well.**

That is a position about modern games, and it is the opposite of how they are
made. The contemporary craft is additive: a layer enters when you succeed, the
score swells, the particles bloom, the numbers go up, the interval between
rewards is tuned until it is hard to put down. None of that is incompetent —
it is extremely good engineering aimed at a goal. This game takes the same
craft and points it the other way, and the parts below are what that cost and
what it needed.

---

## 55. Eight authorities, and most of them say no

The sound design is governed by eight handed-down documents, in order:
`DESIGN.md`, `SOUND.md`, `SPACE.md`, `BINAURAL.md`, `BRIR.md`, `ROOMS.md`,
`RAYS.md`, `WAVEGUIDE.md`. They run to about 1,400 lines, for a game with a
lamp, some earth, a dog and nine animals.

What is unusual is not the depth. It is that **most of them conclude against
the technique they are about.**

- `RAYS.md` examines hybrid ray tracing and rejects it for this geometry:
  image sources write sharp early hits, rays write a later energy envelope,
  and the two are glued at a seam. *"In a hall the seam is buried in a long
  tail. In a burrow the seam is the file."*
- `WAVEGUIDE.md` looks at Wayverb's rectilinear digital waveguide mesh and
  finds exactly one reason to want it, which is not reverb quality: below a
  few hundred hertz in a small hole, interference *is* the room. **Modes. A
  note the clay holds.** Any other justification is refused.
- `BINAURAL.md` admits binaural on a leash: a headphone path that deepens one
  sentence — *in the dark, at the edge, in the light, too close* — and never
  a second game, because **the burrow must work on one speaker.**
- `ROOMS.md` permits pyroomacoustics as a sketchbook for early-reflection
  timing and forbids it as a stand-in for a real capture, and then labels its
  own contents as *not from a run*.
- `BRIR.md` is a field protocol — a day with a speaker and a dummy head —
  and spends its length narrowing what to capture. **The listener faces the
  lamp and does not turn**, so a 360° grid of an adult head is the wrong
  measurement, taken well.

A literature that mostly says *no* is not a literature anybody needed to
write. It exists because the alternative is a designer reaching for a
technique on the grounds that it is available and impressive, which is the
default condition of game audio and the reason so much of it sounds like a
demo of itself.

## 56. Measurement, where the industry uses taste

The three tests `SOUND.md` sets for a piece of music are: *can you hum it,
can you tap your foot to it, does it get prettier when she does the right
thing.* Two of the three are computable, so they were computed.
`tools/hear-music.py` is kept in the repository precisely so that every later
candidate faces the same gate as the first one.

The first cue was measured rather than discussed: **G major, root on G2, 93%
of energy in seven pitch classes, 0.83 notes per second over 27 semitones.**
It has a tune, so it is barred from the burrow by the author's own rule. Three
further readings agreed from the mix rather than the ethics — **+18 dB below
120 Hz** put it exactly on the earth bed, **26 dB of dynamic span** made it a
piece where a bed wants under eight, and a **head/tail spectral match of
0.53** meant it would not loop.

Three later measurements are worth keeping because each overturned something
that had been believed on the ear alone:

- **The hiss in the rooms was the animal.** Reported as room tone; measured,
  all four beds were tonal and the shared animal voice was **white noise at
  spectral flatness 0.982** — the loudest bed in the burrow. Worse, the
  trust-driven filter opened onto it, so a child who earned an animal's
  confidence was paid in static. **The hiss was the trust meter.**
- **The door was a filter worth 0.0 dB.** The threshold had been built as a
  low-pass swept down to each mouth's frequency. Rendered and measured against
  a plain fade, the difference was nothing: the material is −11 dB at 1.2–4
  kHz and has no top to take away. What reads as going indoors is a level
  change, which the document had said in words before anybody built it wrong.
- **"Play it looser" was the wrong instruction.** A theme that read as having
  a clock was re-recorded rubato and still read as having one. The
  discriminator is not timing regularity but **how hard the notes start** —
  attack rise of 9.4 dB against 2.8–4.4 for pieces that read as free.
  Percussion, not tempo.

None of these were audible as *problems*. They were audible as a room that
felt slightly wrong, which is the condition under which most sound design
decisions are actually made.

## 57. Distance, not prettiness

The soundtrack is the place the argument is sharpest, because it is where the
temptation is strongest and the industry answer is unambiguous.

Music in this game may **move** with trust. It may not **improve** with it.
That is the only absolute left in a document that was rewritten from top to
bottom.

| | curled | in the pool |
| --- | --- | --- |
| low-pass | 700 Hz | 14 kHz |
| reverb, wet | 62% | 6% |
| level | 0.30 | 0.50 |

Through earth and a room away, becoming close and open and present. **Nothing
is added, nothing unlocks, and no instrument enters on success.** A score that
adds a layer when she does well teaches her that she performed; the same sound
arriving is the gesture the animal is already making, in sound.

A creature's theme belongs to the **approach** and stops at the threshold —
which means, given the walk timings, that **the cue is the first second and a
half** and the rest of the piece never plays. Eight seconds are kept as
headroom. Whatever the theme does at 0:40 is for the composer's benefit.

And the settle — the moment a game would normally score — is specified as the
absence of one: *the hedgehog's spines lying down is a change that stops
making sound.* **That stop is the music.**

## 58. The picture had to take over, and the bill came due

When the songs came into the rooms, something was given up, and it is written
down rather than glossed. The old design named two silences so that
implementation could not collapse them — *Empty*, which is a bug, and
*Still*, which was lamp and earth and breath and was supposed to hold a child
for eight to twenty seconds of interesting quiet. **Music fills that. The
burrow no longer teaches quiet by being quiet.**

It teaches it by what the animal does, which is a narrower channel and puts
the weight on the picture. So the picture had to carry more, and the rule that
followed is the visual twin of *distance, not prettiness*: **each creature is
a world, not a room recoloured.** A screenshot of deer-3 and mole-3 must not
be the same composition in a different coat.

- The hedgehog's four places are degrees of curl — a ball with no inside, a
  seam, an eye, a coat with room for two.
- The mole has no lamp at all, because there is no sky in his world and the
  cut *is* the world.
- **The moth's run backwards:** counting *dims* her star, because walking a
  moth toward a brighter centre and calling it trust is the opposite of the
  story being told.
- The Moon Hare's chamber is a tide, and the climax resolves as light on
  water rather than as a cutscene — one light per friendship *walked*, none
  for one jumped to, and **Milo casting none at all.**

The same discipline governs the modelling: *clay that has been handled* —
uneven silhouettes, matte surfaces, a little weight, the child and Milo
modelled from the same lump as the rabbit. Not a shader showcase. A real light
on the Moon Hare and volume everywhere else, which is a brief that gets harder
rather than easier if the engine improves.

## 59. The psychographics, and the finding that survived

The obvious frame for a game about waiting is the marshmallow test, and it was
checked rather than assumed. **The game does not contain one**, and the code
is what says so:

- `Trust.gain()` is `value + 1` for every right answer, so **stillness is
  worth exactly what a berry is worth.** The architecture refuses to pay a
  premium for patience.
- `Treasure.lying(in:near:)` rolls `Double.random`. Rarity is chance, never
  something earned by waiting. The source carries the guard in a comment: tie
  the roll to how long she waited and the game becomes an instrument that
  measures patience and pays for it.

The disanalogy is deeper than the absent timer. In the marshmallow paradigm
waiting is *instrumentally boring* — the reward is elsewhere and later. Here
stillness is the **correct answer to a signal**: a frightened animal wants to
be left alone, and the payoff is immediate and is the stillness itself.
Nothing is deferred, so there is nothing to defer for.

And the part of that literature usually cited is the part that did not
survive. Mischel's predictive claim largely dissolved under conceptual
replication — Watts, Duncan & Quan (*Psychological Science*, 2018) found
effects roughly half the size on a larger, more diverse sample, mostly
attenuated once family background and early cognitive ability were controlled.

**What survived is Kidd, Palmeri & Aslin** (*Cognition*, 2013): children who
had just met an adult who broke a promise waited about a quarter as long.
Waiting is a bet on the environment being reliable.

That reading turns the design inside out. It means **dependability is not
atmosphere around the stillness lesson — it is the precondition for it.**
Nothing is timed. Nothing chases her. Going back is always allowed. An
aperture is derived from the burrow id so that it survives a rotation,
*because a hole that changed shape when the phone turned would be a different
hole*. The game's job is not to test whether she can wait. It is to be the
adult who keeps the promise, so that waiting is a reasonable thing for her to
do.

## 60. Wordlessness is the constraint that forces the rest

There is no text in the game and no voice. That is usually described as an
accessibility decision or a localisation saving, and here it is neither. It is
the constraint that makes every other refusal enforceable.

A game with words can explain a reward, and having explained it, can keep it.
It can say *well done* and leave the systems untouched. Without words, every
claim the design wants to make has to be made **by what the world does** — so
a lesson that cannot survive being shown is a lesson the game cannot teach,
and a reward that only reads as a reward because a voice announced it simply
does not exist.

This is why the wordless rule is a rule about the picture and not about
information. The drawn name appears only on rooms she can step into, because
four floors of labelled chambers read as four menus; the **spoken** name is
always in the accessibility tree, because a name withheld to keep the picture
quiet must not also be withheld from somebody who cannot see the picture.

## 61. What this is an argument for

Put the parts together and the method is legible, and it is not a method
about children's software.

**Choose the sentence first.** Then build every system to say it, and take the
cost of the ones that resist. The record refuses to describe her. The music
moves closer and never gets prettier. The trust meter refuses to pay extra for
patience. The treasure is chance. The climax cannot be pressed toward from
inside its own room. The dog casts no light. Each of those is a place the
easier build was available and was declined for the same reason.

**Then measure, so that taste cannot quietly overrule the sentence.** The gate
that barred the first cue was the author's own rule, applied by a tool, to the
author's own music. That is the only arrangement under which a rule survives
contact with a thing somebody has fallen in love with.

Two honest limits. This is **one game, unplayed by a child**, and a method
whose output has never met its audience is a method on paper. And the
discipline has a cost that is easy to state and hard to accept: a game built
this way is less compelling in the short term than one built the other way,
because everything that makes a game hard to put down is on the list of things
it refused.

What it has instead is that nothing in it is trying to keep her there. For a
four-year-old that is not a feature to be marketed. It is the whole of the
product, and it is the same claim as Part II's, made in sound and picture
instead of in a ledger: **a thing built for her does not get to want anything
from her.**
