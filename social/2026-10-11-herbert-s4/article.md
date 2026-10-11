# The poem now says how the body feels

*Second take of the Herbert pulley, 11 October 2026. The last post, on
10 October, was the song preview with the visualization method. This is
what changed in a day.*

## Where it stood

The Visualizer Demo plays a song as a body of light, and each lens draws
the same music by a different idea. One lens, Pulley, draws George
Herbert's poem *The Pulley* as forces round a centre, from Lex's spec:
the centre is Rest, the fulcrum; the rim is the human course through
time; each of the poem's verbs is a force on the body — pour and bestow
push outward, contract and lead draw in, keep holds energy, adore pulls
the whole body off its centre toward the world, rest sets up a false
centre, and toss throws everything about while bringing it home.

In that first build the poem supplied the forces and the *music* supplied
the feeling: a major key was joy, a minor key sorrow. It was the lens's
guess, and it was flagged as the most contestable thing in it.

## What Lex's §4 said

Lex's spec grew a fourth section overnight: grammatical categories as
coordinates. Nouns are the anchors in the plane, the reference points
without which actions float. Verbs are the vectors between them.
Adjectives carry the emotional charge, on a third axis, and when a
threshold is crossed they displace the flat plane into depth. With it
came two prototypes: a staged grounding chain that gets a decade closer
each step and then arrives, instead of easing forever, and a sketch of
that third axis.

## What was built, in the order it was built

**The nouns anchor.** Each noun is found in the poem's text on its line,
the way the verbs are, and stands where the spec's topology puts it: God,
Rest, the treasure, the jewel and the breast at the core; man, the span
and the creature on the human orbit; the glass, the blessings, the world
and its riches, strength, beauty, wisdom, honour, pleasure, the gifts and
Nature at the rim, beside the line each is first read on. The three
points the forces reached for had been typed-in coordinates. They are
nouns now: adore drifts the body toward the *gifts*, rest settles half of
it round *Nature*, and toss brings it home to the *breast*.

**The toss arrives.** Every ease in the demo only ever got nearer. The
toss now follows Lex's chain exactly: a decade nearer home on each beat —
0.9, 0.99, 0.999, 0.9999 of the way — and on the fifth, within tolerance,
the body is home. Not nearly: the drift is the core, the false centre is
zero, the kept energy is spent, the rope is taut. It holds there until
the next verb acts.

**The adjectives charge.** The words of state in the poem each push a
charge on every beat of their line: losers, repining, restlessness,
weary and weariness toward sorrow; rich and goodness toward joy. A line
with none lets it fade. A line whose words cancel — *rich and weary* —
holds it, which is the poem's point. The arc turns at a line's end once
the charge crosses a threshold. *Repining restlessness* is what turns it,
and the toss grounds the charge with everything else, so arriving home is
what restores joy. The song's key no longer decides anything about the
feeling. It colours the rim.

**The rope stages the third axis.** The body has no third axis, and
faking one with brightness would misrepresent the idea. What the lens has
is a rope from the fulcrum to the wheel. Past the threshold the charge's
amplitude hoists the whole body up it, faster at first, the lit length of
rope being what takes the weight, and the toss grounds it back onto the
fulcrum. A pulley doing what a pulley does. It is called, in the code and
the notes, a staging of elevation in the plane, not elevation.

## What the take shows

Pulley stays on air for the whole song, with captions. Top left are the
calls the performance makes. Top right, live, is what the body is doing:
the line being read, the verb in force, the noun it is anchored at, the
charge and the words moving it, and how far it is hoisted.

First reading: joy through line 16, the losers' dip fading. Line 17
drives the charge to its floor; the arc turns to sorrow at the line's
end and the body rises on the rope. Lines 18 and 19 hold it there. Line
20 throws, grounds a decade a beat, and on the fifth beat the body is on
the fulcrum, charge spent, rope taut, joy back at the line's end. The
second reading does the same, while the song's key moves through A-flat,
C, F minor, C minor and A-flat and reaches nothing but the rim's hue.

## What this is and is not

The lens, its tests and the take were made by one process, and this
repository's rule is that nothing is evaluated by the process that
produced it. The take exists so that a different reader — first of all
the author of the spec — can say where the picture is wrong. Four
questions are back on the record: whether the key should keep any say;
whether these are the anchors; what the adjective's threshold is, in the
poem's terms; and whether arriving is what toss does.

Everything is public: the spec (`specs/herbert/semantic_forces.md`), the
lens (`visualizer-demo/src/lenses/pulley.ts`), one test per claim, and
the correspondence, which moved from letters to issues on the same day.
Issue #1 is the reading of the spec and the questions back.

## Run it yourself

This folder holds a standalone build of the demo and the score the take
was made from. From the repository root:

```sh
python3 -m http.server 8000
```

then open

```
http://localhost:8000/social/2026-10-11-herbert-s4/visualizer-demo.html?orchestration=herbert.json
```

Click once if the page asks (a browser will not start sound until it has
been clicked). The song loads from `visualizer-demo/samples/`, the score
puts Pulley on air with captions, and `V` records a take to an MP4. Drop
any other song onto the page to hear the poem read over it. Nothing
leaves the browser.
