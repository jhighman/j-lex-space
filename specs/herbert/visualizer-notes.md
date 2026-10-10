# Notes for Lex: the Pulley lens, and what two songs showed

Your spec, `semantic_forces.md`, is now running as a lens in the
Visualizer Demo (`visualizer-demo/` at the root of this repository). These
notes say how to play it, what the analysis found in the two source songs,
and where building it raised questions that belong to your hypothesis
rather than to the code.

*Written by Claude, working with Jeff. Everything measured below was
measured by the same process that built the lens; see the last section.*

## Playing it

```bash
cd visualizer-demo
npm install
npm run dev        # then open http://localhost:5173
```

Drop a song from `visualizer-demo/samples/` onto the page. It starts
playing, and within a few seconds the whole track has been analysed.

| key | what it does |
|---|---|
| `space` | play / pause |
| `9` | **Pulley**: the poem as forces round a centre |
| `U` | **Sunburst**: the song as rings, or the poem when Pulley is on the other deck |
| `1`–`8`, `0` | the other lenses, and none |
| Shift + a lens key | put it on the other deck without switching to it |
| `C` | cut between the two decks; or drag the crossfader to blend them |
| `I` | what the analyser hears: key, tempo, and what each lens is doing |
| `L` | setlists, and the song's parts |
| `V` | record a take from the top; it saves as an MP4 when the song ends |

**To see the poem both ways at once:** press `9` for Pulley, then Shift+`U`
to put Sunburst on the other deck, and drag the crossfader slowly. Pulley's
moving body turns into a map of the poem it is reading: stanzas, lines and
words, with each verb in the colour of its force.

## How the spec became the lens

- **The centre is Rest, the fulcrum.** A rope runs from it to a small pulley
  wheel above. The rim carries the poem's twenty lines, the one being read
  lit, and the line itself is set under the body.
- **The poem is read in order, one line every eight beats**, and each verb
  acts from its line until the next verb takes over. On the two songs that
  is about four to five seconds a line, so the poem is read two to four
  times in a song.
- **Each force is a behaviour:** pour, dispersed, flowed and bestow expand
  the body; contract and lead draw it in; stay freezes everything for its
  line; keep stores energy the body holds without moving (it trembles);
  adore pulls the whole body off its centre toward a point on the world
  side; rest sets up one false centre that half the motes settle round.
- **Toss is your invariant.** It throws every mote about and, in the same
  beat, draws the body back toward the true centre, lets the world and the
  false centre go, and releases the kept energy.
- **Joy and sorrow come from the music, not the poem.** A major key is joy:
  symmetric, radiating, never past the rim. A minor key is sorrow: drawn in,
  with tension cords from the centre. This mapping is mine, not the spec's,
  and is the most contestable choice here.

The verbs are found by reading the poem's text, not listed by line, so the
lines they act on are a reading: pour 3, dispersed 4, contract 5, flowed 7,
stay 8, bestow 12, adore 13, rest 14, keep 16 and 17, lead 19, toss 20.

## The two songs

Both songs are Jeff's, copyright © 2026 Jeff Highman, and are in
`visualizer-demo/samples/` to be heard and played with here; on GitHub,
open one and choose **View raw**.

The analysis splits a whole track into parts where loudness, brightness or
harmony change, and gives each part a key. Separately, a live analyser
hears the key moment by moment; Pulley's joy and sorrow follow the live one.

**Editions** (5:25, 17 parts). In C major, moving to F major at 1:12.8 and
back to C for the last eight seconds. Major throughout, so Pulley stays in
joy for the whole song. Loud and level: every part sits between 0.56 and
0.95 in energy, so the shapes it offers a setlist are small.

**Again it's Christmas time** (3:40, 13 parts). A♭ major, then C major at
0:20, F minor at 0:31, C minor from 1:21.8 to 2:32, and A♭ again from 2:40.5.
This is the song that shows sorrow.

What happened with it is worth knowing. The live key does not hear keys so
much as chords, and through its middle the song alternates A♭ major and C
minor chords, which share two of their three notes. Pulley's first version
switched between joy and sorrow nineteen times in three and a half minutes.
Its arc is now a mood: it follows how minor the music has been over about
four lines, turns to sorrow above 65% and back to joy below 35%, changes
only at the end of a line, and holds for at least two. On the same song it
now changes six times against twenty-four changes of the live key: joy for
the opening, sorrow from about a minute in, a lift around 1:20, and sorrow
again through the minor middle until the song closes in A♭ major.

## Questions that belong to the hypothesis

These came up while building it. The code makes a choice for each, and each
choice can change.

1. **"Rest" is two words.** "Rest in the bottom lay" (line 10) is the noun,
   the gift God keeps back; "rest in Nature" (line 14) is the verb. And in
   "Yet let him keep the rest" (line 16) it is a third thing, the
   remainder, with the poem's pun on repose inside it. The lens counts only
   line 14. The spec has no way yet for one word to carry two forces at
   once, and the pun may be exactly the case it needs, beside the invariant
   that one verb can act differently at two scales.
2. **"If goodness lead him not."** Line 19 negates lead. The table makes lead
   centripetal, and the lens draws the body in on that line. A negated pull
   might be a failed attraction instead, which would change what the last
   two lines do: toss would then be the only thing that brings him home.
3. **The emotional arcs stop at joy and sorrow.** The last stanza's states
   are restlessness ("repining restlessness") and weariness ("rich and
   weary"), and weariness is the instrument of the toss. If weariness had
   its own geometry, the ending could be drawn from it rather than from the
   key of the song.
4. **Who supplies the emotion.** The lens gives the poem the forces and the
   music the mood. The spec could be read the other way, with the emotional
   arc in the text too. That is a decision about the hypothesis, not the
   software.
5. **What the invariant means in numbers.** The tests read "locally
   disruptive, globally restorative" as: after a toss, motes move at least
   three times further between moments than they did under keep, while the
   body as a whole sits nearer the true centre. That is one way to measure
   your sentence, and it may not be the one you meant.

## How far to trust any of this

This repository's rule is that nothing is evaluated by the process that
produced it. Everything above was produced by one process: the lens was
built, its tests written, the songs analysed and the screenshots read by
the same assistant. The 33 tests for Pulley and Sunburst show that the code
does what it was written to do. They do not show that it does what you
meant. The arc's thresholds and memory were tuned against the same song
they are reported on.

An independent check would be you playing the two songs with your own
reading of the poem beside you, and saying where the picture is wrong.

## Where things are

- `visualizer-demo/src/lenses/pulley.ts`: the poem, the forces, the arc
- `visualizer-demo/src/lenses/sunburst.ts`: the rings
- `visualizer-demo/tests/pulley.test.ts`: one test per claim in the spec
- `visualizer-demo/samples/`: the two songs
- `visualizer-demo/README.md`: every lens, and how the demo is put together
