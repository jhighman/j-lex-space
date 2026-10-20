# What does sound look like?

A starting point, not a finding: a vibrating plate with sand on it, in the
browser. Pick a tone and the sand is thrown off the parts of the plate
that move and comes to rest on the lines that stay still, so each tone
draws its own figure. The figure is a map of the stillness inside the
sound.

Brought into the workbench on 2026-10-20 from a page Jeff built as a
sketch for Lex. It sits beside `visualizer-demo/`, which draws a piece of
music by fourteen ideas, and `the-unframeable-now/`, whose sound follows a
modelled pulse and whose soundtrack panel lets an operator try what a day
sounds like with different material. This piece asks the question from
the other side: not what sound does to a person, but what sound itself
looks like, with the person taken out.

## Run it

No build step, no dependencies beyond two Google Fonts. From the
repository root:

    python3 -m http.server 8000

and open `/what-does-sound-look-like/`. It also opens straight from the
file.

## What is on the page

- **Two plates.** Round, like the ones Hans Jenny filmed; square, like
  Chladni's. Each has its own set of resonant tones, a chip per tone, and
  tick marks on the frequency slider where they sit.
- **A frequency slider** from 100 to 2700 Hz. On a resonance the sand
  gathers; between resonances the plate barely responds and the sand
  stays where it is. Slide slowly and one figure holds, dissolves, and the
  next gathers. The readout says the tone, the figure's number, and on the
  round plate how many lines cross it and how many rings sit inside it.
- **Sound**, off by default: a sine at the slider's pitch. **Sweep** runs
  through all the tones, slowing at each resonance. **Scatter** throws
  the sand again. **Show where the plate moves** glows the moving
  regions so the still lines read against them.
- Arrow keys step between tones.

## The model, and what it is not

The round plate uses Bessel functions, the mathematics of a drumhead
with a free edge: a figure is the product of a radial Bessel mode and a
cosine around the rim, and the resonant tones are the free-edge zeros
of the Bessel derivative. The square plate uses two crossed standing
waves with the sign chosen per figure. Twenty-two thousand grains take
a random step scaled by how much the plate moves under them, plus a
small drift down the slope of the squared displacement, which is what
carries them to the nodal lines. A resonance is a Lorentzian 22 Hz
wide. Both plates give the right kind of figure. The pitches are chosen
for listening and are not measured from a real plate, and the page says
so in its last line.

The usual caveat applies in a smaller way than elsewhere here: nobody
has set this beside a real plate. If it earns a place in either of the
neighbouring pieces, that is the first thing to do.

## Where it might go

Three directions were named when it came in, and none is taken yet:

1. **Beside the visualizer**, as a fifteenth lens: the plate drawn by
   whatever is playing, which would need a way from a track to a tone,
   or to the nearest figure.
2. **In Milo**, where Part VIII of the paper records that the burrow no
   longer teaches quiet by being quiet and puts more weight on the
   picture. A plate that draws a figure for a bark or a hum puts sound
   in the picture channel without a word.
3. **In The Unframeable Now**, where the soundtrack panel now lets an
   operator upload a track per pace. A plate could draw the figure of
   the pulse the day runs at, or of the track under it.

Which, and whether, is Lex's and Jeff's to decide in the issue thread.
