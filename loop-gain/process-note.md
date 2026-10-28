# Loop Gain — process note

*Optional, under 1,000 words. Draft, 2026-10-28, by Claude working with
Jeff. The figures it refers to are in the repository and can be attached
as sketches.*

The piece came out of a week in which the question the programme asked,
what sound looks like, was put to two systems that are not about sound at
all, and the answer turned out to be the same shape the sand makes.

**The feed.** The Unframeable Now is a model of a ranked feed and a reader
using it. Every gesture she makes returns to the stream 2.2 seconds later
as one item. We asked whether its end state slides or drops as the feed is
turned up, sweeping four of its constants through a range, twenty-four
points, twenty seeds a point. Every curve was flat or slid. The one knee,
near 3.5 seconds between arrivals, turned out to be a recovery threshold
meeting an arrival rate: attention recovers only after three seconds of
quiet, gaps are the interval times a uniform factor, so the share of gaps
long enough to recover in is a continuous function of the interval, and
the attention curves track it at r = 0.90 to 0.997. No transition. The
figure is `the-unframeable-now/lab/sweep-paceMs.svg`.

**The exclusion loop.** The Return of the Excluded is a brief about
pollution as the return of what was excluded. We wrote it as a bench: a
field, a viewer who excludes or holds, an exterior that returns what was
excluded louder than it left. The brief had never named the quantity that
decides it. Each exclusion begets `R0 = π g σ / (σ + δ)` exclusions in the
next generation, a branching process, with a critical point at one. We
pre-registered where it would be, 0.8, and the sweep could not see it: a
quantity that diverges grows smoothly through its critical value in a
three-minute session, and the rule we had written for the feed read
"slides". A post-hoc duration test, labelled as one, found it at 0.8
exactly. Below, a twelve-minute session ends where a three-minute one does;
above, the ratio is in the hundreds. The figure is
`the-return-of-the-excluded/lab/sweep-propensity.svg`.

**What was proved.** Over the rules of both models, in Lean, no library:
the feed's band cannot be kept flat by acting; the allostatic floor never
comes down; the moment's calm deficit persists as structure; agency does
not come back when echoes age out. For the loop: supercritical mass is
unbounded, subcritical mass is bounded, the exterior never decreases under
the viewer's acts, and permanent exclusion lowers the reproduction number
without removing the threshold. Eleven and ten theorems, checked, resting
on Lean's own axioms only.

**The fourth frame.** Wegner's ironic process theory says load leaves the
monitor running while the operator tires: in the loop's terms, load raises
the return rate rather than lowering the propensity to exclude. We
predicted the critical point would move a little and the frame would be
small. The critical point moved exactly as far as predicted. The frame was
not small: the exterior ended eight times higher than the brief's. The
reproduction number counts returns per generation and is silent about how
long a generation takes; doubling the return rate barely moves it and
halves the generation. R0 says whether; σ says how fast.

**Why a feedback loop.** Every frame re-entering as signal is a loop. A
loop with gain under one is a decaying echo; past one it is a howl, and the
howl settles on whatever frequency the room resonates at. That is the
reproduction number crossing one, in a form that can be heard in ten
seconds, and the settling on a resonance is the plate's threshold in a
different medium. The piece puts the three readings on one ping stream in
order: slope, threshold, form.

**What is placed by hand.** The loop's delay (0.45 s), its gain ramp (0.80
to 1.25), its resonance (870 Hz, +6 dB, Q 9, chosen because the square
plate has a figure there) and a soft clip where a speaker's ceiling would
be. All are written on screen. The level chart is measured from the audio
graph, not modelled. The plate's tone is read from the loop's spectrum.

**The perceptual layer.** Lex's reading on the inventory was that Atlas,
Guard and Bridson stayed legible without a caption, and that the
source-faithful reading should come first with legibility as the edit
filter. Two of the three are in the piece in roles that carry the
research: Bridson as the exterior, filling by what the loop carries and
recolouring where the gain crosses one; Atlas as the piece's own
timeline. Guard is in a private repository and is not.

**What was left out.** The body. The bench carries Lex's allostatic load in
four frames, fatigue, reactivity, none and ironic, and the piece carries
none of them; three minutes cannot hold a fifth variable and say what it
did. And the movements are cut by the clock, which the README names as
the compromise it is.

**Division of labour.** The models, bench, proofs, sweeps and the piece
were built by Claude working with Jeff Highman, who chose the constants
and the questions. Alexandra Krížová wrote the briefs for both systems,
extended the exclusion brief with the allostatic reading that became the
load, reviewed each result against the translation test she set, and is
credited as critical reviewer and development reviewer at her request.
Nothing here was evaluated by the process that produced it; the
pre-registrations, the failed H1 and the mis-sized H6a are left in the
record so a reader can see the instrument being corrected.
