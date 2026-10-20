# Visualizer Demo

A visual deck for any piece of music. Drop in a track and it plays as a
body of light: a spiral of motes inside a shell, with twelve spokes for the
notes. Pick a lens and the same music is drawn by a different idea. Play
it like a deck, on the beat, and record the take to MP4.

Nothing leaves the browser: the track is read from your disk and analysed
in the page.

`samples/` holds the source songs to play it with, by Jeff Highman.

Copyright © 2026 Jeff Highman. All rights reserved: the code, the tests and
the songs. See [`COPYRIGHT.md`](COPYRIGHT.md).

```sh
npm install
npm run dev        # http://localhost:5173
npm run check      # typecheck and the test suite
npm run artifact   # one self-contained HTML file in artifact/
```

## Playing it

| | |
|---|---|
| `space` | play / pause |
| `1`–`9`, `U`, `T`, `G`, `B`, `O` | switch lens on the next beat (`U` is Sunburst, `T` Stern–Brocot, `G` Globe, `B` Bridson, `O` Atlas); `0` for none. Shift: cue it on the other deck without switching |
| `C` | cut between the two decks |
| `A` `S` `D` `F` | pads: burst, reverse, fold, trails |
| drag the body | grab it and scratch it round; up and down to zoom; double-click to reset (`R`) |
| `Q` | pads on the beat, or at once |
| `V` | record a take from the top; saves an MP4 when the track ends |
| `L` | setlist |
| `I` | what the analyser hears |
| `M` | drop a mark |

Two decks each hold a lens, and the crossfader blends them. Each lens fades
in its own way, so the same fader position looks different for every
pair. Pads pressed between beats are armed and fire on the next beat; if
no beat comes within 0.6 s they fire anyway.

## Orchestrating it

Everything a performer does can be asked for from outside, so a
performance can be written down, replayed, and recorded without anyone at
the keys.

**By URL.** The address says what to play and how:

```
/?orchestration=orchestrations/christmas.json&record=1
/?song=samples/Editions.mp3&lens=pulley&signal=1
```

| parameter | |
|---|---|
| `song` | the song to load: any path or URL the page can fetch |
| `orchestration` | a score to perform; it brings its own song |
| `lens` | the lens on air at the start |
| `record=1` | record the whole song from the top, and save the MP4 when it ends |
| `signal=1` | open the signal panel |
| `quantise=0` | actions land at once instead of on the next beat |
| `captions=1` | draw the API calls (top left) and an explainer (top right) on the canvas, so a take carries them |
| `ground=field` | draw the ground from every key at once instead of from the lens (see *Colour*) |

A browser will not start sound until the page has been clicked, so opened
by hand the page asks for a click first; a test browser started with
autoplay allowed plays straight away.

**By orchestration.** A JSON score of cues, each a time and one action:

```json
{
  "title": "Again it's Christmas time",
  "song": "../samples/Again it's Christmas time.mp3",
  "cues": [
    { "at": "0:00", "lens": "tide" },
    { "at": "0:31", "lens": "pulley", "note": "F minor" },
    { "at": "0:43.3", "cue": "sunburst" },
    { "at": "0:44", "blend": "sunburst", "amount": 0.5, "over": 8 },
    { "at": "1:13.6", "pad": "fold" },
    { "at": "3:31", "blend": "none", "over": 8 }
  ]
}
```

Actions are `lens` (switch on the next beat), `cue` (put on the other
deck), `cut`, `pad` (burst, reverse, fold, trails), `blend` (toward a
lens's deck, `amount` 0–1 over `over` seconds), `reset` and `quantise`.
Times are seconds or `m:ss`, in order; an orchestration that names a lens
or pad that does not exist, or runs out of order, is refused with the
reasons. An optional `"ground": "field"` does what `ground=field` does, and
`"captions": true` what `captions=1` does: every call the performance
makes is written top left as the API call that would make it, and the lens
on air, what it does and the cue's `note` are written top right.
`orchestrations/showcase.json` is the one to watch first: every lens in
turn on the Christmas song, the pads, and Atlas between each, filling in
the song's timeline as it goes. `orchestrations/christmas.json` is a full one, written around the
song's analysed parts and key changes. `orchestrations/herbert.json` keeps
Pulley on air for the whole song and captions what Lex's §4 put into it:
the nouns anchoring, the charge turning the arc, the rope taking the
weight, and the toss arriving. With captions on, the explainer top right
also carries the lens's own label, live: for Pulley, the line, the verb,
the anchor, the charge and how far the body is hoisted. The beat clock
sets the poem's pace, so a cue timed to the song's clock lands a line or
two differently from one take to the next.

**By script.** `window.visualizer` has `load(url)`, `orchestrate(urlOrJson)`,
`play()`, `pause()`, `seek(seconds)`, `lens(id)`, `cue(id)`, `cut()`,
`pad(name)`, `blend(id, amount, over)`, `reset()`, `quantise(on)`, `record()` and
`state()`, which reports the time, what is on each deck, the fader,
whether a take is recording, the calm, and which ground is drawn.

Takes recorded locally can be kept in `takes/`, which git ignores. Takes
kept on purpose go in `examples/`: `examples/lo-se-munje/` holds eight
takes of one song, each by a different lens, with a note on where they
came from and which of their lenses this repository does not have.

## Lenses

Each lens keeps its own state and changes it when something happens in the
music. What separates them is what they *do* on a beat and on a key change.

| lens | on a beat | on a key change | colour |
|---|---|---|---|
| Lissajous | rolls the figure a quarter turn | swaps its axes | the two notes of the interval |
| Tide | raises the water; time drains it | a spring tide doubles each rise | depth, from the surface down |
| Ripple | drops a stone where the loudest note is | calms the water | each ring keeps its note's colour |
| Swarm | scatters the flock; it regathers | moves where it gathers | one flock colour, deeper when gathered |
| Frost | grows the crystal a ring; silence melts it | half-thaws it | ice, whatever the key |
| Kiln | adds heat; quiet cools it | a draft takes half | the glow of its temperature |
| Garden | grows the newest stem | plants another | each stem keeps the key it grew in |
| Prism | turns the spectrum a wedge | swaps fifths and chromatic order | each wedge is its note |
| Pulley | applies the force of the poem's current verb, and reads on | recolours the world at the rim | gold at the centre, the key at the rim, rose where it strays |
| Sunburst | lights the bar and part playing | zooms into the part where it happened | parts by key; beside Pulley, verbs by force |
| Stern–Brocot | walks one step down the tree toward the sounding interval | re-roots the walk at 1/1 | the note each fraction sounds above the key |
| Globe | turns the globe a twenty-fourth | moves the sun, sweeping the terminator across | the notes, painted round it in bands |
| Bridson | grows the points one round outward | clears a patch at the new key and regrows it | each growth keeps its key's colour |
| Atlas | seeds at the needle and grows one round, never past it | ticks the timeline where it was heard | each point the key heard at its place in the song; the parts by their analysed key |

### Pulley

Pulley draws George Herbert's poem *The Pulley* (1633) as forces round a
centre, from Lex's design in
[`specs/herbert/semantic_forces.md`](../specs/herbert/semantic_forces.md).
The centre is Rest, the fulcrum; the rim is the human course through time.
The poem is read in order, a line every eight beats, and set under the
body, and each of its verbs acts on the body from its line until the next:

- **pour, dispersed, flowed, bestow** push outward; **contract, lead** draw
  inward;
- **stay** stops everything for the length of its line;
- **keep** holds energy without moving, so the body trembles;
- **adore** pulls the whole body off its centre, toward the world;
- **rest** sets up a false centre that half the body settles round;
- **toss** throws every mote about while bringing everything home: nearer
  the true centre, the world and the false centre let go, the kept energy
  released. Locally disruptive, globally restorative.

The nouns are the anchors the verbs act between (the spec's §4), and each
is found in the text on its line the way the verbs are. Where a noun
stands is read from the spec's topology: God, Rest, the treasure, the
jewel and the breast are the core, at the centre; man, the span and the
creature are the human orbit, between; the glass, the blessings, the
world and its riches, strength, beauty, wisdom, honour, pleasure, the
gifts and Nature are the world, at the rim. Each stands beside the line
it is first read on, as a faint point, and the noun anchoring the line
being read is named where it stands. The three points the forces reach
for are nouns: adore drifts the body toward the gifts, rest settles half
of it round Nature, and toss brings it home to the breast. The reading
is one table in `pulley.ts`, kept in one place to be argued with;
restlessness, weariness and goodness are left for the affective reading.

Toss arrives. Each beat of the toss takes the body a decade nearer home,
after Lex's staged grounding in `specs/test_harmonic_grounding.py`: nine
tenths of the way on the first beat, then 0.99, 0.999, 0.9999, and on the
fifth, when what is left is within tolerance, it is home exactly: the
drift gone, the false centre let go, the kept energy spent, the rope drawn
taut. It holds there, through the lines that carry no verb, until the
next verb acts. Every other ease in the demo only ever gets nearer; this
is the one that arrives, and the lens says which it is doing in its
label: *grounding 0.99*, then *home*.

The emotion is the text's (the spec's §4: adjectives carry the charge).
The words of state in the poem each push a charge one way: losers,
repining, restlessness, weary and weariness toward sorrow, rich and
goodness toward joy, a little on every beat of their line, and a line
without one lets it fade. The arc turns at the end of a line once the
charge has crossed a threshold: joy radiates symmetrically and never
past the rim; sorrow is drawn inward and tied to the centre by tension
cords, lit by the charge's amplitude. "Repining restlessness" is what
turns it, "rich and weary" hold each other, and the toss grounds the
charge with everything else, so arriving home is what restores joy. The
key colours the rim and does not turn the arc; it used to, and whether
it should keep any say is a question put back to the spec. The label
says the charge and the words moving it.

The spec puts that charge on a third axis, out of the plane, and the
body has no third axis: a lens places a mote by radius, angle and light,
and the renderer draws in the plane. What Pulley has is a rope, from the
fulcrum up to the wheel. Past the threshold the charge's amplitude
hoists the whole body up it, faster at first, the rope showing the
length that takes the weight, and the toss grounds it back onto the
fulcrum. A pulley doing what a pulley does; a staging of elevation in
the plane, not elevation. The label says how far it is hoisted.
`tests/pulley.test.ts` holds the lens to each of these, one test per
claim. [`specs/herbert/visualizer-notes.md`](../specs/herbert/visualizer-notes.md)
says how to play it against the spec, what the two source songs showed, and
the questions building it raised.

### Sunburst

Sunburst draws a tree as rings, the way a partition sunburst does: the root
in the centre, each level a ring further out, each node an arc as wide as
its share. Two rings show at once, and the view zooms into a node, easing
over three quarters of a second. Which tree depends on what is around it:

- **The song**, once the whole track has been analysed: its parts, sized by
  length and coloured by key, with bars around them, the playing part and
  bar lit and a needle at the playhead. A key change zooms into the part
  where it happened and opens its beats; leaving the part zooms back out.
- **The poem**, when Pulley is on the other deck: stanzas, lines and words,
  each verb coloured by its force, following the reading into the current
  stanza. Crossfading between the two decks turns Pulley's body into the
  map of the poem it is reading.
- **The harmony**, before any analysis: the twelve notes as wide as they are
  loud, turning the key to the top on a key change.

The music drives the zoom; clicking the canvas grabs the body as it does
for every lens.

### Stern–Brocot

The Stern–Brocot tree holds every positive fraction once, in lowest terms:
each node is the mediant of its nearest ancestors, smaller fractions to the
left and larger to the right, and each fraction has one path of turns down
from 1/1. Musical intervals are fractions, and consonance roughly follows
depth: the octave is one turn down, the fifth two, the major third four,
the minor second fifteen. The lens draws the tree round the body, finds the
sounding interval in it (the loudest note other than the tonic, against the
tonic, so it reads unison only when nothing else sounds), and walks one step toward it on each beat, climbing
back to where the paths part when the interval changes. A deep walk does
not fit on screen, so the view follows it down. `tests/sternbrocot.test.ts`
checks the tree against what defines it, for every fraction up to 30/30.

### Globe

The body as a sphere in orthographic projection, lit like a planet. The
twelve notes are painted round it as bands of longitude in fifths order,
each as bright as its note is sounding; the beat turns it; and the sun sits
where the key is on the circle of fifths, so a key change moves the light
and the terminator sweeps across. The shading is brightness only, the
cosine of the angle to the sun with a faint night side, so the key decides
where the light falls and loudness changes nothing about colour.

### Bridson

Bridson's algorithm for Poisson-disc sampling, run one round per beat:
each active point tries thirty candidates in the ring between r and 2r and
keeps those far enough from every other, so the body fills with points
that are random but evenly spaced, the frontier spreading like lichen. A key
change clears a patch where the new key sits on the circle of fifths and
regrows it in the new key's colour, and once the disc is full the loudest
note clears and regrows smaller patches, so a song leaves a patchwork of
where its harmony has been. The randomness is seeded and kept in the state,
so the same music grows the same pattern. `tests/bridson.test.ts` holds the
sampling to its guarantees: no two points closer than r, none outside the
disc, and no gap wider than 2r when it finishes.

### Atlas

Two lenses in one body: Sunburst's map of the song is the scaffold, and
Bridson's growth fills it in. The circle is the song's timeline, clockwise
from the top. The analysed parts sit in a ring round the rim, as wide as
they are long and in their key's colour, and a needle marks the playhead.
Each beat plants a seed at the needle in the key being heard and runs one
round of Bridson's algorithm, held to the part of the circle the song has
reached. A point takes the key heard at its place on the timeline, so growth
that spreads on from an old key is recoloured as it crosses into the new
one. Nothing is cleared. Each key change the live analyser hears leaves a
tick just inside the ring, so by the end the circle is the song as heard,
inside the song as analysed, and you can see where the two disagree: on
*Again it's Christmas time* the live key, which follows the chords, changes
far more often than the thirteen analysed parts. The lens keeps growing on
the other deck while another lens is blended over it;
`orchestrations/christmas-iii.json` uses that. `tests/atlas.test.ts` holds
it to the needle, the spacing, the colours and the ticks.

## Colour

Hue is the lens's: almost every lens builds it from harmony, a key or a
note on the circle of fifths, so keys a fifth apart sit side by side and a
tritone is the opposite colour. The music may then change a colour in two
ways, each through one number the body applies to everything it draws:

- **Loudness changes value.** `luxOf` turns loudness and onsets into a
  light that lifts or dims every colour by at most a quarter.
- **Consonance changes saturation.** `calmOf` reads the interval sounding
  above the key (the loudest note other than the tonic) and gives how calm
  it is: unison, fourth, fifth and octave leave the colours whole, thirds
  and sixths nearly so, seconds and sevenths less, and the minor second,
  major seventh and tritone pull them furthest toward grey, never so far
  that the hue is lost. It eases over 0.4 s so a passing note does not
  flicker. Hue is untouched, and loudness has no say in it.

**The key field** (`ground=field`, or `"ground": "field"` in an
orchestration) is an experiment with the ground. Instead of one key, it
weighs every key by how well the music fits it, places each weight at its
tonic on the circle of fifths, and adds them as vectors: the direction is
the hue and the agreement is the saturation. A passage that sits between
A-flat major and C minor gets a ground between violet and red, greyer than
either, and a modulation sweeps the ground continuously, eased over 1.5 s,
instead of stepping. The lens still sets the ground's value. It is off by
default.

## Setlists

A setlist is a performance written before the track is chosen: scenes in
order, each asking for a moment or a shape of the music, never a time.

```json
{
  "title": "Growth",
  "rules": ["in order", "scenes at least 8 seconds"],
  "scenes": [
    { "name": "seed",   "asks": "the start", "lens": "garden" },
    { "name": "shoot",  "asks": "a jump",    "lens": "lissajous", "caption": "all at once" },
    { "name": "canopy", "asks": "a plateau", "lens": "prism" },
    { "name": "autumn", "asks": "a release", "lens": "garden" }
  ]
}
```

- **Moments:** the start, the peak, the lull, the brightest, the darkest,
  a new key, a boundary, next.
- **Shapes:** a build, a release, a jump, a drop, a dip, a plateau,
  getting brighter, getting darker. A setlist written in shapes fits tracks
  it has never heard.
- **Fitting** runs forward and keeps room for the scenes still to come.
  Each scene comes back *found*, *close* or *missing*, with a sentence on
  what it settled for. Rules are checked afterwards and can fail.
- With **Let the setlist choose the lens** on, each scene cuts to its lens
  and shows its caption as it starts.

## How it is put together

```
audio/      the analyser (live) and the whole-track analysis; the only code that touches Web Audio
lenses/     the fourteen lenses, the mixer, and the View each one answers
law/        colour and light
hand/       pads, platter, crossfader
setlist/    setlists, fitting, examples
render/     the canvas
record/     MP4 takes
marks/      marks tied to the track they were placed on
orchestra/  orchestrations: reading, checking, and which cues are due
ui/         panels and saving
```

A few rules the code keeps, each enforced by a type or a test rather than
by care:

- **One way in for the sound.** Only `audio/` touches Web Audio. Everything
  else gets a frozen frame, and a test fails if any other module refers to
  the audio API.
- **Silence is not zero.** A silent frame has no readings at all.
- **The lens chooses the colours; loudness only changes brightness, and
  consonance only saturation.** Every lens is played loud and quiet in the
  tests and the colours must match, and `shade` is tested to keep hue
  under both.
- **The hand moves shapes, never colours.**
- **No two lenses behave alike.** The tests play all fourteen the same music
  and require every pair to produce different results.
- **Times are tied to their track.** Marks and fitted plans carry the
  track's length and SHA-256, and marks from another track are refused.
