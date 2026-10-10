# Visualizer Demo

A visual deck for any piece of music. Drop in a track and it plays as a
body of light: a spiral of motes inside a shell, with twelve spokes for the
notes. Pick a lens and the same music is drawn by a different idea. Play
it like a deck, on the beat, and record the take to MP4.

Nothing leaves the browser: the track is read from your disk and analysed
in the page.

`samples/` holds the source songs to play it with.

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
| `1`–`9`, `U` | switch lens on the next beat (`U` is Sunburst); `0` for none. Shift: cue it on the other deck without switching |
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

A major key is joy, radiating symmetrically and never past the rim; a minor
key is sorrow, drawn inward and tied to the centre by tension cords. The
arc is a mood, not a reaction: it follows how minor the music has been over
the last few lines, changes only at the end of a line, and holds for at
least two. The live key follows the chords, and without that memory a song
alternating A-flat major and C minor chords flipped between joy and sorrow
every few seconds.
`tests/pulley.test.ts` holds the lens to each of these, one test per
claim.

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
lenses/     the ten lenses, the mixer, and the View each one answers
law/        colour and light
hand/       pads, platter, crossfader
setlist/    setlists, fitting, examples
render/     the canvas
record/     MP4 takes
marks/      marks tied to the track they were placed on
ui/         panels and saving
```

A few rules the code keeps, each enforced by a type or a test rather than
by care:

- **One way in for the sound.** Only `audio/` touches Web Audio. Everything
  else gets a frozen frame, and a test fails if any other module refers to
  the audio API.
- **Silence is not zero.** A silent frame has no readings at all.
- **The lens chooses the colours; loudness only changes brightness.** Every
  lens is played loud and quiet in the tests, and the colours must match.
- **The hand moves shapes, never colours.**
- **No two lenses behave alike.** The tests play all ten the same music
  and require every pair to produce different results.
- **Times are tied to their track.** Marks and fitted plans carry the
  track's length and SHA-256, and marks from another track are refused.
