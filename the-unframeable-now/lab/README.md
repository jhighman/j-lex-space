# Decay Lab

A place to explore renderings and morphology of the decay data, and to
run the model as a simulator for samples and comparisons, without
touching the piece. Nothing in this folder is loaded by
`../index.html`, and nothing in `../index.html` is changed by anything
here.

## The rule that keeps the premise whole

`model.js` is the piece's model re-stated so it can run without a
browser clock: the stream with its clumps, the feed that learns from
likes, hides and mutes, the cortisol the music follows and the floor it
keeps, the moment on a bad day with its two triggers and its aftershock,
the Empty Bin, and the decay from whole with the same constants under
the same names. **If this file and the page disagree,
the page is right and this file is wrong.** `conformance.js` measures
the gap: it runs the same scripted session on the page, headless, on
the real clock, and in the lab on the simulated one, and compares the
end state per dimension against a tolerance of two standard deviations.
Run it after any change to the model on either side. A rendering here is
an exploration of the numbers; the report on the piece is the report.

## The paper

`paper.html` is a summary machine: it takes a sample, analyses it,
chooses figures for each section by rule, writes the prose from the
numbers in a chosen register, and lays the result out for A4.
`paper.js` renders it headless to a PDF with running heads and page
numbers, the way the rounds were recorded.

The **narrative frame** is a small JSON in `frames/`: the premise, the
claim, what applicability means for this audience, the voice (she, the
user, the participant), which figures to prefer and which to avoid, and
the tone. Three to start: `general` for an intelligent general reader,
`product` for people who design and rank feeds, `wellbeing` for
researchers in attention and wellbeing, and `issue6`, the original
premise of Lex's brief in its own register, for readers of media theory
and the history of the avant-garde. A frame may also contribute
paragraphs to the discussion and references of its own, which is how a
theoretical premise carries its lineage into the paper.

A frame may state **hypotheses** and specify its **sample**. `scare` does
both: it asks what the bad day's moment does, draws every bad day twice,
with the moment and without it, matched by persona and seed, and tests
four hypotheses by stated rules against the counterfactual pairs: does
the calm deficit persist past thirty seconds, does the moment cost more
calm than the pace does in the following minute, does it change where
the session ends, does it populate the tail. The paper reports the
verdicts as the rules decide them, with a figure that aligns calm and
attention on each pair's own moment with and without it, since the
moment's second is now an output of the session (the eighth when her
hands were still, the sixteenth otherwise) and the paper reports the
split. The model takes
`moment: false` for the counterfactual; the sample takes
`moments: [true, false]`. Swap the frame and the same
sample becomes a different paper: a different title, a different
opening figure, different vocabulary, different applicability, the same
numbers. Add a frame to try a different premise or point of view.

What the machine does, and does not do:

- **Analysis.** Per persona × pace: median and tenth to ninetieth
  percentile of every dimension; the pace effect across personas; the
  persona ranking by wholeness; the echo share at its peak and end,
  reconstructed from the event record; what filled the space after a
  mute, as shares; the calm the bad day's moment takes; what happens
  when Kate stops; the extremes.
- **Figure selection.** Each section has candidates with a stated
  reason. The frame's preference order ranks them, its avoid list
  removes them, and a kind already used in the paper is penalised so a
  figure does not reappear. The appendix lists every choice and why.
- **Prose.** Templates filled from the numbers in the frame's voice.
  It says when the model has saturated. It does not reason about the
  data beyond the rules it states, and the limitations section says so.
- **Layout.** A4, print CSS, figures that do not break across pages,
  captions that carry the figure's claim, a running head and page
  numbers from the renderer.

```sh
NODE_PATH=…/node_modules node paper.js --frame product --seeds 10 --round 180 --out paper-product.pdf
```

The drawings the paper uses are the lab's, from `views.js`, so a figure
in the paper is the figure on the lab page.

## Files

- `model.js` — the model, headless. `simulate({persona, pace, roundSec,
  seed})` runs one session in a few milliseconds and returns its
  snapshots, moves and an end-state summary. `sample(spec)` runs
  personas × paces × seeds. `stats`, `band`, `extremes`, `quantile` are
  the numbers across a group. `PERSONAS` is where a way of using the
  feed is written down. Works in Node and the browser, no dependencies.
- `sample.js` — a CLI that draws a sample and prints the table:
  `node sample.js --personas kate,doomscroller --paces busy --seeds 50
  --round 180 --out samples.json`.
- `views.js` — the drawings as functions that return SVG, shared by the
  lab page and the paper: the disc, the morph, the brain, the petals,
  the bands, the strips, the lineage.
- `index.html` — the lab page. Draw a sample in the browser, or load a
  `samples.json`, and see it ten ways.
- `paper.html`, `paper.js`, `frames/` — the summary machine, its
  headless renderer, and the narrative frames; see *The paper* above.
- `tests/` — Lex's three test files from `specs/unframeable-lab/`, run
  against this model: `node tests/model.empty-bin.test.js`, and the
  same for `model.moment` and `model.allostasis`. Two lines were
  adapted: the vulnerability case runs twelve seconds instead of five,
  because the page's earliest second is eight; and the bin case also
  asserts that opening the bin comes back as an item.
- `sweep.js` — push one of the page's constants through a range and
  watch where the end state goes, per persona: `node sweep.js --knob
  paceMs|askWeight|reentryMs|lifeMs [--pace busy] [--seeds 20]`. Writes
  `sweep-<knob>.svg` (kept) and `sweep-<knob>.json` (every run; not
  tracked). The model takes the knob through `simulate({ override })`,
  each value defaulting to the page's, so a run without one is the
  page's model. See *What the sweep said* below.
- `conformance.js` — the bench. Needs Playwright on `NODE_PATH` and the
  repository root served: `NODE_PATH=…/node_modules node conformance.js
  --url http://localhost:8000 --pace busy --round 40 --n 5`.

## Personas

How a session is used is the sample's independent variable. Six to
start, in `model.js`; add one there and it is everywhere.

| persona | does |
|---|---|
| `kate` | her seven things in the first twenty seconds, then a scroll or a tap every nine |
| `kateStops` | the seven things, then hands off after forty seconds |
| `doomscroller` | a scroll every three seconds, a tap every seven, a refresh every twenty, never stops |
| `tidier` | hides and mutes everything that asks, and nothing else |
| `gardener` | likes only what she wanted, never touches an ask |
| `abstainer` | opens it and does nothing |
| `emptier` | Kate's seven things, then at half a minute opens the bin and empties the newest ask |
| `dawdler` | Kate's seven things, then opens the bin and cannot choose |

Seeds make a run repeatable; the stream is random in its clumps, its
gaps, its channels and its rankings, so twenty seeds give a spread and
the extremes are real sessions that can be re-run.

## Renderings

All of the same numbers. The report's disc is the reference; the rest
are ways of looking.

- **Discs** — the report's shape as small multiples, one per persona ×
  pace, at the median end state.
- **Bands** — each dimension over time, the median per persona with its
  p10–p90 band. Where bands do not overlap, personas differ.
- **Strips** — every session's end state as a dot, per persona per
  dimension, with the median marked and the extremes ringed. The spread
  is the sample, not a curve.
- **Morph** — a superformula blob whose shape is the four dimensions:
  round when whole, spiked and shrunken as they fall, jittered by
  disorder. A scrubber runs it through time.
- **Brain** — the four dimensions mapped onto a top-down brain, by
  concept and not by anatomy, and the view says so in its last line:
  agency on the frontal region, attention on the parietal, calm on the
  temporal, the minutes on the occipital, where what she meant to look
  at would have been. A region's fill fades and fills with speckle as
  its dimension falls; disorder speckles the whole surface and widens
  the fissure. The left hemisphere is the session, the right is the
  abstainer on the same pace, so a glance shows what the session cost
  against doing nothing. One figure per persona × pace at the median
  run, with a scrubber through time. A figure, not a finding; nothing
  is measured from a brain.
- **Petals** — every session as a four-petal glyph on a grid, sorted by
  attention, paler with disorder. Morphology across the whole sample at
  a glance; hover for the numbers.
- **3D · paths** — each session as a path through attention × calm ×
  agency, brighter as time passes, coloured by persona; the white dot is
  whole. Babylon.js.
- **3D · surface** — wholeness, the mean of the four, as a height field:
  persona × pace across, time along. The bad day is a trench.
- **Lineage** — one session as a tangled tree, after nitaku's *Tangled
  Tree Visualization II* (Observable), with the layout re-derived here.
  Time runs down in windows; each window has three sub-levels: what
  happened (moves, the moment, arrivals), what it caused within the
  window (the window's echoes as one node with every move they came
  from as a parent; arrivals whose cause is in the same window), and
  the state at the window's end, descended from the state before and
  everything in the window. A later arrival descends from the like that
  raised its channel and the mute that made room, so a mute's red lanes
  fan out to every window after it. Pick a persona, pace and seed; the
  model records every event with its causes for this.
- **Table** — median and p10–p90 per group, and the extremes.

## What the first sample said

180 sessions of two minutes, six personas, three paces, ten seeds, in
126 ms. The doomscroller ends at zero on every pace. The abstainer keeps
agency at 100 and still loses attention on a bad day, because the feed
takes it without her help. The gardener, who likes something she
wanted every six seconds on a quiet evening, ends as uncalm as anyone
on a bad day, because on a quiet evening her hands are the pulse. The
tidier keeps attention and calm and loses agency, because every hide
and mute comes back. Whether those are findings about feeds or
artefacts of the constants is exactly what the lab is for, and the
constants are in one file.

## What the sample said after Lex's modules (2026-10-14)

240 sessions, eight personas, three paces, ten seeds, the bad days drawn
twice. The moment came on vulnerability in 20 of 80 pairs (the
gardener and the abstainer, at the eighth second) and on impatience in
60 (everyone whose hands were moving, at the sixteenth). All four
hypotheses of the `scare` frame are now supported: the calm deficit is
38 points at one second, 30 at ten, 13 at thirty and 12 at sixty,
which is the floor the moment left and does not close; the moment
takes 39 points at once where the pace takes 6 in the following
minute; the pairs end 12 points of calm apart; eight of the ten
lowest-calm sessions had the moment. Attention still saturates on a
three-minute bad day, so the attention verdict is decided at the floor.
The `emptier` ends a bad day with agency at 0.34 against Kate's 0.17,
the bin's 35 points less the two moves it cost; the `dawdler` at 0.14.
What she empties is the one thing that stays gone, and the emptying
comes back.

## What the sweep said (2026-10-28)

Issue #4 frames capability as a phase transition: a landscape that
reorganises past a critical value. The same question can be put to the
feed with no new instrument, since the constants are in one file. Does a
persona's end state slide as the feed is turned up, or drop at a
critical value? A slide is a slope; a drop is a phase transition.

`sweep.js` pushed four constants through a range, twenty-four points,
log-spaced, ten or twenty seeds a point, two-minute sessions, and read
the end state as the mean of attention, calm and agency (the minutes
drain with the clock whatever happens, and are left out). The verdict is
by rule, stated in the script: *flat* if the curve moves less than 0.15
across the range; *cliff* if one step carries a third of the fall or
more, which is the shape a discontinuity would have at this grid;
*steep* if no step does but the 90→10% crossing fits inside half a
decade; *slides* otherwise.

| knob | range | pace | verdicts |
|---|---|---|---|
| ms between arrivals | 12 s → 0.3 s | normal day | five slide, the doomscroller steep |
| ms between arrivals | 12 s → 0.3 s | bad day, with the moment | five slide, the doomscroller steep |
| the asks' weight against the wants' | ×⅛ → ×16 | normal day | five flat, the gardener slides |
| ms until a move returns | 0.2 s → 30 s | normal day | all flat |
| ms an item lasts | 4 s → 120 s | normal day | all flat |

No cliff. What there is instead is a knee. On the arrival interval every
persona holds flat from twelve seconds down to about 3.5 seconds between
arrivals, which is the page's normal day, and then slides over roughly a
decade: the abstainer from 0.97 to 0.33, the tidier furthest, 0.64 to
0.07, Kate 0.62 to 0.21. The doomscroller is at the floor by four
seconds between arrivals and has nowhere further to fall, which is what
makes his one fall steep. The asks' weight moves the end state by a
tenth at most; the re-entry delay and the item's life barely move it.
The bad day shifts every curve down and does not change its shape: the
moment adds a floor, not a transition.

So in this model the trap is a slope, not a threshold. That is a negative
result, and it goes in the record at the same length as a positive one
would. Two cautions. The grid is 0.07 decades apart, so a transition
narrower than that would read as a steep slide; and the verdict rule was
written for this sweep, after the first run showed that a ratio to the
typical step flags every flat curve. The figures are `sweep-*.svg`; each
title names the knob, the pace and the seed count, which is all
`sweep.js` needs to draw it again.

The conformance bench against the page was not re-run for the `override`
hook; the sample table without an override is identical to the byte, and
the three tests in `tests/` pass.

