# Loop Gain

One ping stream, three grammars. The piece for the Phase Transition final
(issue #10), from the week's research on issues #5 and #6, by Jeff
Highman; Alexandra Krížová — critical reviewer and development reviewer.
Built by Claude, working with Jeff, 2026-10-28; the usual caveat, that the
process that built it is not the one to judge it.

Three minutes, recorded from the browser. The declared direction was *the
same sound signal generating different visual spaces when read through
different explicit reading grammars*. The signal is a feed's pings. The
grammars are three readings of what a return is.

## The three movements

**I · The line (0:00–1:00).** The Unframeable Now's model, run headless
(`../the-unframeable-now/lab/model.js`, Kate on a normal day, seed 1007)
and replayed with its sound: a two-tone ping for what asks, a soft fall
for what she would rather, a click for her move and a pop when it comes
back 2.2 seconds later as one item. The line draws the stream by ranking,
her moves above it with an arc to each return, and beneath it the band:
the share of the stream that is her own echo. An echo does not act, so
this loop's reproduction number is zero: the band rises while she moves
and ages out when she stops. The sweep of this model found a slope and no
threshold (`../the-unframeable-now/lab/README.md`).

**II · The loop (1:00–2:30).** The same pings, fed into a delay of 0.45 s
with a gain `g` that rises from 0.80 to 1.25 over about a minute. What
comes back is excluded again and returns louder: `g` is the loop's
reproduction number, as on the #5 bench (`../the-return-of-the-excluded/`).
Below one the echoes thin and die. Past one every return begets more than
itself and the loop blooms into a howl, which is the Larsen effect,
feedback finding its own frequency. The chart is the loop's measured
level, in dB, from an analyser on the loop itself, against the gain ramp,
with the mean-field `R0 = 1` marked where `g` crosses one. Two things are
placed by hand and said on screen: a resonance at 870 Hz (a peaking
filter, +6 dB, Q 9), as a room has one, and a soft clip in the loop where
a speaker's ceiling would be, so the howl saturates instead of clipping
the recording.

**III · The plate (2:30–3:00).** The analyser's peak frequency at the end
of movement II is the howl's settled tone. It drives the plate from
`../what-does-sound-look-like/`, ported as `plate.js` with the same model
and constants: a square plate as two crossed standing waves, twenty-two
thousand grains thrown off where the plate moves and coming to rest where
it is still. 870 Hz is figure (2, 5). The loop's gain is cut under one so
the howl decays into a ring, a sine at the plate's tone takes over, and
the sand gathers. The runaway grounds into form. The pitches are chosen
for listening and not measured from a real plate; the page says so and
so does this one.

## Lex's perceptual readings

On issue #9 Lex named Atlas, Guard and Bridson as the lenses that stayed
legible to a viewer without the caption, and recommended choosing the
source-faithful reading first and using legibility as the edit filter.
Two of the three are in this repository and are in the piece, ported from
`../visualizer-demo/src/lenses/` into `lenses.js` with the same
algorithms and constants, driven by the piece's events instead of a
song's beats:

- **Bridson is the exterior.** In movement II the disc beside the chart
  fills by Poisson-disc growth, one round each time the level the loop
  carries accumulates to a unit: nothing at −48 dB, a round a second at
  −24, two a second at the ceiling. When the gain crosses one, a patch
  clears where the crossing sits on the timeline and regrows in the
  supercritical colour, which is Bridson's own rule for a key change. The
  disc is the bench's exterior mass drawn as a field rather than a line.
  It stays, small, through movement III: nothing is gone.
- **Atlas is the piece's own map.** The ring in the top-right corner is
  the piece's timeline, its three movements as the ring of parts, the
  needle at the playhead, and growth planted at the needle on each event
  in the movement's colour, with a tick where each movement began. By the
  end it is the piece as heard inside the piece as planned.
- **Guard** lives in Studio B, inside Milo & Me, whose repository is
  private, and is not here. If a Guard reading is wanted it crosses over
  as a take, the way the Lo Se Munje takes did.

## Run it

No build step. From the repository root:

    python3 -m http.server 8000

then open `http://localhost:8000/loop-gain/`. Click **Start**. Sound
begins on the click, because the browser requires a gesture before audio.

The piece is also served live, for the judges' link, at
<https://jhighman.github.io/j-lex-space/loop-gain/>. GitHub Pages builds
from `docs/` on `main`, so the copy there is refreshed by `./publish.sh`
from the repository root after any change here, and the `docs/` files are
committed with it. The copy in `docs/` is not edited by hand.

## Record a take

Open `http://localhost:8000/loop-gain/?record=1`, or press **Record a
take** before Start. The canvas and the sound are recorded together with
`MediaRecorder`, MP4 where the browser can write it (Chrome, Safari) and
WebM otherwise, and the file saves itself when the piece ends. Nothing
leaves the machine. The deck and the status line are page, not picture;
only the canvas is recorded. Takes are kept out of the repository; the
one that is submitted is named in the thesis.

The recorder was taken from `../visualizer-demo/src/record/take.ts` and
the ping synth from `../the-unframeable-now/index.html`, both as written.

## What is honest about it, and what is not

- The line replays a real run of the feed's model, not a person.
- The loop's level is measured, not modelled: the chart is an analyser on
  the audio graph. Its gain, delay and resonance are choices and are
  written on screen.
- The plate's tone is read from the loop's spectrum, not typed in. If the
  loop had settled somewhere else, the plate would have drawn that.
- The movements are cut by time, not by the sound: movement III begins at
  2:30 whatever the loop is doing. A version that waited for the howl to
  settle would be truer and less recordable; this one was chosen for the
  Sunday deadline and the README says so.
- Thesis, process note and disclosure are in `thesis.md` and
  `process-note.md`. `paper.md` is the long-form account for an audio
  overview and a video.

## The film

`video/film.html` is the video itself, silent, for the narration to be
recorded over: forty shots on one canvas to the script's timeline, eleven
and a half minutes, recorded from the browser's own encoder like the
piece. Every shot is text from the repository (`video/film-data.json`,
generated by node from the READMEs, the proofs and the bench scripts),
one of the sweep figures, or the piece's models running live: the line
from the feed's model, the loop with Bridson's growth, the plate. The
piece's drawing code is reproduced in `video/film.js` rather than
refactored, so `index.html` stays as it is. One honest difference: the
film has no audio graph, so the loop's level is modelled from the gain
rather than measured, and the shot says so.

    python3 -m http.server 8000        # from the repository root
    open http://localhost:8000/loop-gain/video/film.html?record=1

Click Start; `loop-gain-film.mp4` saves when it ends. `?auto=1` starts
without a click, `?speed=20` runs it fast for a look, `?at=330` renders
the still at that second.

Recording in real time from a browser drops frames when the machine is
slow; the headless run on this laptop managed five a second. The film
that was staged on 2026-10-28 was made instead by `video/render.js`: it
drives the film's clock one thirtieth of a second at a time, encodes each
frame with the browser's WebCodecs H.264 encoder, and muxes the result to
MP4 in the page, so the output is exactly 30 frames a second whatever the
machine's speed. It needs Node with `puppeteer-core` and `mp4-muxer`
installed beside it (not in this repository) and Chrome on the machine:

    node render.js loop-gain-film.mp4        # about six minutes for the whole film `video/cue-sheet.md` lists every shot's in and
out time and what is on screen, for the narrator. The MP4 is not
tracked.

## The video

`video/script.md` is a single-narrator script of about ten minutes for a
YouTube video aimed at people early in research, built on the week's
method rather than its finding: write the rules down, seed everything,
predict first, keep the failure, prove what you can, find the quantity,
work with someone who reads against you. `video/youtube-cut.md` is the
earlier plan for cutting the Notebook's audio overview, kept for the
shot list. `audio-overview/` holds that overview's transcript, a
line-by-line review of it against the record, and a corrections source.

`video/timing.json` re-times the film to the recorded narration. The
eleven scene recordings, one WAV per scene of the script, are laid on the
timeline by `video/voiceover/lay-scenes.py`, which writes the timing file
and a levelled narration track; `film.js` reads the timing file and
stretches each scene's shots, and their local clocks, to the recording's
length, so the picture follows the voice. Two infographic cards bookend it: five seconds of the three grammars on
a gain axis before the black, and twelve seconds of what the week found,
the number, the threshold, whether against how fast, six figures, before
the credits. The film runs 13:54. `?timing=0` plays the script's own clock,
with the cards.

`video/reading-script.md` is the same narration with the film's clock: a
timecode before each paragraph, the words each scene holds against the
seconds it has, and which two lines to trim where it runs over.
