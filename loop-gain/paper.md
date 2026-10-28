---
title: "Loop Gain: what a feed, a symptom and a plate of sand have in common"
subtitle: "A week of doing our own research, with the failures left in"
author: "Jeff Highman, with Claude · Alexandra Krížová, critical reviewer and development reviewer"
date: "28 October 2026"
---

# Why this document exists

This is a long-form account of one week of research in a small public
repository, written to be read aloud and listened to. It is for people
who are early in research, or outside institutions, and who have heard
the phrase "do your own research" used as a sneer. We want to show what
the phrase can mean when it is taken seriously: a question, a model you
can run on a laptop, a prediction written down before the run, a
collaborator who reads your work against you, a theorem prover that will
not accept a claim you cannot prove, and a record that keeps the failures
at the same length as the successes.

The week produced a three-minute audiovisual piece called *Loop Gain*,
built for a programme called Phase Transition. It also produced two
simulation benches, twenty-one machine-checked theorems, several
pre-registered hypotheses of which two failed in instructive ways, and
one idea that we did not have on Monday: that two things we had been
treating as separate were one mechanism at two settings. This document
walks through all of it in order. Nothing in it requires mathematics
beyond ratios, and every number quoted is in the repository with the code
that produced it.

A word on how it was made. One of us, Jeff, works with an AI assistant,
Claude, which wrote most of the code and most of the first drafts,
including this one. The other, Alexandra, who goes by Lex, works with a
different assistant on purpose, so that the two of us do not share one
set of blind spots. The repository has a standing rule that nothing is
evaluated by the process that produced it. We have tried to honour that
rule and we say where we could not.

# Part one: the premise

## Two briefs that looked unrelated

The repository holds a series of concept briefs for interactive pieces.
Two of them matter here.

The first is called *The Unframeable Now*. It is about how events reach
us already framed: as cards in a feed, with timestamps, source labels,
a sentiment colour, a "related" link. The brief proposed suspending that
framing with operators borrowed from the twentieth-century avant-garde,
cut, expose the apparatus, collide scales, refuse duration, and watching
what remained. Its central claim was a single sentence: *every frame
applied re-enters as signal.* Whatever you do to the feed, your doing it
becomes one more thing in the feed.

The second is called *The Return of the Excluded*. It is about pollution,
read not as inert waste but as communication. In the same way a symptom
carries information about a one-sided attitude, the brief argued,
environmental or systemic pollution carries information about patterns of
awareness that have been split off. Its central claim was also one
sentence: *excluding the signal repeats the act that produced it.*
Pushing the symptom out of awareness is the same gesture that caused the
dissonance, and it supplies fresh material for the next return.

Lex extended the second brief with a reading from predictive processing
and the neuroscience of allostasis: exclusion is not free. Each act of
suppression spends something from the body's budget, and the exterior
where the excluded material accumulates is also somatic memory. She
proposed tracking an allostatic load alongside the exclusions.

These briefs were written as art. We built one of them as a working piece
first, the feed, and it turned into a research instrument almost by
accident, because every change in it had to be traced to a cause and
every cause had to be stated as a rule. Once the rules were written down,
they could be run, swept, and proved against.

## The question we put to both

A programme called Phase Transition asked teams to translate a research
finding into an art form, under the rule *carry the structure, not just
the essence.* Our prompt was: what does sound look like, and how can it be
organised in an image? That prompt leads, historically, to a plate of
sand. In 1787 Ernst Chladni bowed a metal plate strewn with sand and
watched the grains leave the places that vibrated and gather on the lines
that stayed still. Each tone drew its own figure. Between tones nothing
happened. At a tone, a new figure.

The structure under that observation is the one this whole week turned
on: a continuous drive meets a threshold, and the pattern reorganises
rather than slides. Physicists call the general case a phase transition.
Water does not get gradually more solid as it cools; at zero degrees it
becomes ice. A programme named for that idea had, in effect, asked us
whether our two briefs had a threshold in them.

So we asked. As the feed is turned up, does the reader's end state slide
or drop? As the exclusion loop is turned up, does the pollution slide or
drop? And if the answers differed, why?

# Part two: methods

## Benches, not demos

Both pieces were re-stated as headless models: code that runs the same
rules as the interactive page but without a screen or a clock, so that it
can run a three-minute session in a few milliseconds and run thousands of
them. We call these benches. A bench is a place to run the model as a
simulator across personas, settings and random seeds, and to compare the
results, without touching the piece itself.

The feed's bench carries a conformance test: it runs a scripted session on
the real page, headless, on the real clock, and in the bench on the
simulated one, and compares the end states. If the bench and the page
disagree, the page is right and the bench is wrong. That sentence is in
the bench's README and it is the rule that keeps a bench honest.

## Seeds

Every run is seeded. A seed is a number that fixes the random choices, so
that the same seed gives the same session every time, on any machine.
This matters for two reasons. First, a result can be reproduced exactly.
Second, when a run looks strange, you can run that one again and look at
it, rather than hoping it recurs. When we say "twenty seeds a point" we
mean twenty different sessions at each setting, each one repeatable.

## Sweeps and a verdict rule

A sweep pushes one constant of the model through a range and records the
end state at each point. We used twenty-four points, spaced evenly on a
log scale where the quantity was a rate and linearly where it was a
probability, and ten or twenty seeds a point. The end state we read was
the median over seeds.

Before the first sweep we wrote a rule for reading the curve, so that we
would not be deciding afterwards what counted as a drop. A curve that
moved less than a stated amount was *flat*. One where a single step
between neighbouring points carried a third or more of the whole fall was
a *cliff*, because that is the shape a discontinuity has at our grid
spacing. One with no such step but a fall concentrated in a narrow band
was *steep*. Everything else *slid*. The rule is in the sweep script, and
the README records that it was wrong twice, in both directions, and why
it was kept.

## Pre-registration

For the second bench we wrote the hypotheses to disk before any run. Each
said what we expected, with a number, and what would falsify it. The
section of the README holding them was marked so that nothing above the
line would change after the runs, and nothing did. When a hypothesis
failed, the failure stayed, with its analysis, at the same length as a
success would have had.

This is the single most useful discipline we can recommend to anyone doing
their own research. It costs ten minutes. It makes the difference between
a result and a story.

## Proofs

Where a claim followed from the rules alone, with no numbers needed, we
proved it. We used Lean 4, a proof assistant, in its core form with no
mathematical library, so that the proofs could be checked with one small
toolchain and read without a library behind them. A proof assistant does
not accept a claim because it is plausible; it accepts a claim when every
step is justified from the definitions. The rules of each model were
transcribed by hand into Lean, levels as whole numbers in thousandths,
time in milliseconds, and the theorems were stated in the form "if the
model is as written, then this follows." None of them is a claim about a
person.

The transcription is the weak point, and we say so. If the model changes,
the transcription has to be checked, the way the conformance test checks
the bench against the page.

## Reading the literature

Where the models touched claims about people, we went to the published
literature, from abstracts, and flagged every number as something to
check before citing. We did not read the full texts of most papers, and
we say so where we quote them.

## The rule we could not fully keep

The repository's standing rule is that nothing is evaluated by the
process that produced it. In this week, one process, Claude working with
Jeff, wrote the briefs into rules, chose the constants, wrote the
hypotheses, ran them, and drafted the write-ups. The pre-registration is
what stood between the hypotheses and the results. Lex read each result
against the translation test she had set. The proof assistant checked the
theorems. Those are three outside checks, and they are not the same as
an independent replication. We would welcome one.

# Part three: the simulations

## The feed

The feed's model is small enough to describe in full. A stream of items
arrives from seven channels, four that ask something of the reader
(social, news, work, family) and three she would rather be looking at
(garden, art, music). The asks arrive about three times as often, and the
ranking favours them, by stated weights. Every gesture she makes, a
scroll, a tap, a like, a hide, a mute, a refresh, returns to the stream
2.2 seconds later as one more item. A band shows the share of the stream
that is her own echo.

Four dimensions wear down under what the session records: attention,
which falls with arrivals and taps and recovers only after three seconds
of quiet; calm, which follows a pulse the feed sets; agency, which falls
with the share of the stream that is her echo and recovers only when a
like on something she wanted actually worked, or when she uses the one
permanent act, the Empty Bin; and the minutes she meant for something
else, which drain with the clock. Lex's modules added a moment on a bad
day that strikes when her hands are still, an allostatic floor that rises
with each moment and never recovers, slow asymmetric recovery of the
pulse, and a fourteen-second refractory window.

Eight personas use the feed in eight ways: Kate, who does her seven things
and then scrolls now and then; Kate who stops; a doomscroller who never
stops; a tidier who hides and mutes everything that asks; a gardener who
likes only what she wanted; an abstainer who opens it and does nothing;
and two who use the Bin, one decisively and one who cannot choose.

### What the sweep found

We swept four constants: the interval between arrivals, from twelve
seconds down to a third of a second; the asks' weight against the wants',
from an eighth to sixteen times; the time a move takes to return; and the
time an item lasts. We ran the arrival interval on a normal day and on a
bad day with the moment.

No cliff anywhere. Every curve was flat or slid. What there was instead
was a knee: on the arrival interval, every persona held flat from twelve
seconds down to about three and a half seconds between arrivals, which is
the page's normal day, and then slid over roughly a factor of ten. The
tidier fell furthest, from 0.64 to 0.07 on a wholeness scale from zero to
one. The bad day shifted every curve down without changing its shape.

### Where the knee came from

We read the knee off the rules by hand. Attention recovers only on a tick
when nothing has arrived for three seconds. The gap between arrivals is
the interval times a random factor between 0.6 and 1.5. So the share of
gaps long enough for a recovery is a simple function of the interval: it
is one when the interval is above five seconds, zero when it is below two,
and a smooth curve between. That function is continuous. Across the
twenty-four points of the sweep, each persona's attention at the end
correlated with it at between 0.90 and 0.997. The knee was a threshold in
the rules meeting a rate, not a reorganisation of the state. A slope, with
a reason.

### What was proved about the feed

Four claims turned out to be theorems of the rules, not findings of the
sample. The band cannot be kept flat by acting: the Bin severs at most one
branch per session and using it costs two moves, so any session with two
or more moves has a live echo at some moment. No rule lowers the allostatic
floor, and none takes the pulse under it. A moment lowers the ceiling calm
relaxes toward by exactly its step, and the ceiling never rises again in
the session. Without a like that worked or an emptying, agency never
rises; echoes ageing out is not among the rules that move it, so being
buried is not agency. All four check in Lean with no gaps.

One of those proofs corrected us. The draft of the floor theorem was false
as first written: if the floor were ever above its cap, the moment's
capping rule would pull it back down. The theorem needed the hypothesis
that the floor starts under the cap, which the page's invariant
guarantees and the draft had overlooked. The compiler found it. That is
what a proof assistant is for.

## The exclusion loop

The second bench was built from Lex's extended brief. A field of
awareness. Signals appear in it at a steady rate: the system's own
information. The viewer can exclude a signal, which cleans the field and
deposits the signal's mass in a shared exterior, or hold it, in which case
it dissolves after six seconds of attention. Above a threshold of
accumulated mass, the exterior returns signals to the field, and a
returned signal carries a gain: it is louder than what left. Each
exclusion raises an allostatic load that recovers slowly. The load's
effect was kept as a frame, because the brief did not decide it: in the
*fatigue* frame the load lowers the capacity to exclude; in the
*reactivity* frame it raises it; in the *none* frame it does nothing. A
fourth frame came later.

### The quantity the brief did not name

Before running anything, we wrote down what the loop is. Each exclusion
deposits a unit of mass. A unit of exterior mass either returns, at some
rate, or dissipates, at another, so it returns with a probability equal to
the return rate over the sum of both rates. A returned signal is excluded
with some propensity and, if it is, deposits the gain times a unit. So one
exclusion begets, on average,

> propensity × gain × return rate ÷ (return rate + dissipation rate)

exclusions in the next generation. Epidemiologists call this number R0,
pronounced "R nought": the number of new cases one case causes. A
branching process with R0 below one dies out. At one it is critical. Above
one it multiplies. The brief's claim that ignoring the signal supplies
fresh material for the next return is the claim that the gain is above
one, and with gain above one there is a propensity to exclude above which
the viewer cannot keep up with what she causes.

With the bench's constants, the return share came to 0.83 and the gain to
1.5, so R0 equalled 1.25 times the propensity, and the critical propensity
was 0.8. We wrote that down as the prediction.

### Five hypotheses, written first

We pre-registered five. The loop has a critical point near 0.8 and the
sweep will read it as a cliff or steep. Without gain there is no critical
point. Fatigue bounds the pollution and the body pays to its cap;
reactivity accelerates and moves the critical point left. Destroying the
excluded content and returning only the act moves the threshold without
removing it. And a viewer who never excludes ends with an empty exterior.

### What happened

The first hypothesis failed under its own test. The exterior at the end
rose smoothly from zero to 128 across the range of propensity, and the
verdict rule said "slides." The sharpest step was at the top of the range,
not at 0.8. We had written a rule for a bounded quantity that steps; a
quantity that diverges at a critical point does not step, it grows, and in
a three-minute session it grows smoothly through the critical value. The
pre-registered instrument was the wrong one for the prediction it was
testing. We recorded that as the failure it is.

Then we wrote a different test, labelled post-hoc so no one could mistake
it for the pre-registered one. For a critical point, the right question is
whether the end state depends on how long the session ran. Below the
critical point it should settle: a twelve-minute session ends about where
a three-minute one did. Above it should keep growing. At a propensity of
0.6, the twelve-minute exterior was 1.1 times the three-minute one. At
0.8, 3.9 times. At 0.9, 62 times. At 1.0, 183 times. The turn was at the
predicted 0.8. The mean-field number described the simulator.

The second hypothesis held: with gain of one, nothing diverged at any
propensity. The third held in half: fatigue bounded the exterior under six
at every setting, but the body did not pay to its cap; it settled near
half, because a body that excludes less also loads less. Reactivity moved
the critical point from 0.8 to about 0.4. The fourth was consistent by
magnitude and became a theorem. The fifth held trivially.

### The fourth frame

Daniel Wegner's ironic process theory, from 1994, explains why trying not
to think of something makes you think of it. Two processes run at once: an
operating process that does the suppressing, effortful and conscious, and
a monitoring process that scans for the suppressed thought, cheap and
unconscious, and in scanning keeps the thought accessible. Under load,
stress, fatigue, time pressure, the operator weakens and the monitor keeps
running, so the suppressed content becomes more accessible, not less. The
rebound is real and small; a 2001 meta-analysis by Abramowitz, Tolin and
Street put it at a small-to-moderate effect.

Wegner's claim differed from both of Lex's frames. Load does not change
how readily you exclude; it raises the rate at which the excluded returns.
We added that as a fourth frame, *ironic*, in which the return rate scales
with the load, and we wrote the prediction first: the critical point would
move only a little, from 0.80 to no lower than 0.73, because the return
share was already 0.83 and doubling the return rate could only buy the
remaining dissipation share; and the frame would be a fraction of
reactivity in size.

Half right. The critical point moved exactly as far as predicted and no
further. The size claim was wrong by an order of magnitude. At full
propensity the exterior ended at 1107 against 128 for the brief as
written, with 3148 exclusions against 385. The mean field had missed it
because R0 counts exclusions per generation and says nothing about how
long a generation takes. Doubling the return rate barely moves R0 and
halves the time a generation takes, so above the threshold the
exponential growth rate roughly doubles.

This is the sentence we did not have on Monday: **R0 says whether the
loop runs away; the return rate says how fast.** Wegner's monitor does not
change whether suppression fails. It changes how quickly the failure
compounds.

### What was proved about the loop

Ten theorems, checked. With R0 at or above one, the excluded mass after n
generations is at least the starting mass plus n times the new material:
unbounded while the system keeps speaking. With R0 below one, there is a
bound the mass never passes once under it. With exclusion the only act
and no dissipation, the exterior never decreases. The load never falls
under the viewer's acts alone. Destroying content and returning only the
act does not raise R0. A higher return rate never lowers R0. And R0 never
exceeds propensity times gain, whatever the return rate does, which is
exactly the correct half of the fourth frame's prediction and is silent
about the speed. That division, between what a theorem about a ratio can
say and what needs a simulator with a clock, is itself a finding.

# Part four: the findings, together

## One loop at two gains

The feed's loop and the exclusion loop are the same mechanism at two
settings. In the feed, a gesture returns once, as itself, and the echo
does not act. Its reproduction number is zero. The echo share accumulates
linearly and ages out. The sweep found a slope, and the slope had a
reason. In the exclusion loop, a return invites the act that produced it
and comes back louder. Its reproduction number is positive, and a positive
reproduction number has a critical point. The sweep found a cliff, where
the number said it would be.

*Every frame applied re-enters as signal* and *excluding the signal
repeats the act* are the same sentence at R0 equals zero and R0 greater
than zero. The difference between two briefs that had seemed to belong to
different disciplines, media theory and depth psychology, is one rule: does
what returns invite an act?

## Whether and how fast

The reproduction number decides whether a loop runs away. The return rate
decides how fast. These are different quantities, and the mathematics of
one is silent about the other. We proved the first and could only simulate
the second. Anyone building a model of a feedback process, in any field,
should expect both and should not read either as the other.

## The small gain in the literature

The human rebound effect is small: around d = 0.3 by the secondary sources
we reached. In the bench's terms that is a gain a little above one. With a
return share of 0.83, a gain under 1.2 has no critical point at any
propensity; a gain of 1.5 has one at 0.8. Whether a person's loop has a
gain, and what it is, is not a question a bench can answer. It is a
question for a person and a measurement, and we say so everywhere the
numbers appear.

## What the sand already knew

Chladni's plate is the same structure in its oldest form. Sweep the tone
continuously and the sand does nothing between resonances, then snaps into
a new figure at each one. A continuous drive, a threshold, a
reorganisation. Our piece puts the three readings on one signal, in order:
the feed's slope, the loop's threshold, the plate's form.

# Part five: the piece

*Loop Gain* is three minutes, recorded from a browser, built in one day
from the week's parts.

In the first movement, the feed's model runs headless and is replayed with
its sound: a two-tone ping for what asks, a soft fall for what she would
rather, a click for her move and a pop when it comes back. The line draws
the stream by ranking, her moves above it with an arc to each return, and
the band beneath. Loop gain zero.

In the second movement, the same pings are fed into a delay of less than
half a second with a gain that rises from 0.8 to 1.25 over about a minute.
Below one, the echoes thin and die. Past one, every return begets more than
itself and the loop blooms into a howl: the Larsen effect, which is what
happens when a microphone hears its own speaker. The chart on screen is the
loop's measured level, from an analyser on the audio itself, against the
gain ramp, with R0 equals one marked where the gain crosses one. Two things
are placed by hand and said on screen: a resonance at 870 hertz, as a room
has one, and a soft clip where a speaker's ceiling would be.

In the third movement, the howl's settled frequency, read from the loop's
spectrum, drives the plate. The sand gathers into the figure that tone
draws. The runaway grounds into form.

Two of Lex's three perceptual favourites from the review are in the
piece, in roles that carry the research rather than decorate it. Bridson's
Poisson-disc growth draws the exterior as a disc that fills by what the
loop carries and regrows in a new colour where the gain crosses one.
Atlas keeps the piece's own map in the corner: the three movements as a
ring, the needle at the playhead, growth planted where each event was
heard.

What is honest about it: the line replays a real run of the model; the
level is measured, not modelled; the plate's tone is read, not typed. What
is not: the movements are cut by the clock, not by the sound, and the
body, Lex's load, is left out, because three minutes cannot hold a fifth
variable and say what it did.

# Part six: doing your own research

If you are early in this, here is what the week suggests, in the order it
mattered.

**Write the rules down.** A piece, a claim, a hunch becomes research the
moment its rules are stated plainly enough to run. Most of our findings
came from noticing something in a rule we had already written.

**Seed everything.** A result you cannot reproduce exactly is a story.

**Predict before you run.** Write the number down. Write what would
falsify it. Mark the section and do not touch it after. Our two most
useful results this week were a hypothesis that failed because its test
was wrong, and a hypothesis that was half wrong by an order of magnitude.
Neither would have taught us anything if we had written them afterwards.

**Keep the failures at full length.** The verdict rule that was wrong
twice is still in the repository, unchanged, with a note each time. A
reader can see the instrument being corrected. That is worth more than a
clean record.

**Prove what can be proved.** A proof assistant is free, runs on a
laptop, and will find the hypothesis you forgot. Ours found one. It also
tells you, by what it cannot prove, where the simulator's work begins.

**Find the quantity.** Most feedback systems have a number that decides
them. The brief about pollution had been written, read and extended by
two people before anyone wrote down its reproduction number. Once it was
written down, the week organised itself around it.

**Work with someone who reads against you.** Lex set the translation
test, read every result, chose a different assistant so we would not share
blind spots, and asked to be credited as a reviewer rather than an author
because that is what she did. Both choices made the work better and the
record truer.

**Say what the numbers are not.** Every constant here is a choice. Every
theorem is about the model. No sentence in this document is a claim about
what a feed, or suppression, or pollution does to a person. The literature
that bears on that is cited, from abstracts, flagged to check. The
opportunity of doing your own research is real; so is the obligation to
say what you did and did not do.

# What is left

A replication by someone who did not build any of this. A person, not a
persona, playing a bad day with a heart-rate reading, which is the only
way the feed's model becomes evidence about a body. The reverse arrow, a
soundtrack that lags the pulse and leads it down, which the literature
review found no one has run. And the exclusion loop's gain, measured
rather than chosen.

# References

Pointers, not a bibliography. Each was reached through abstracts or
secondary sources this week and should be checked against the original
before being cited.

- Chladni, E. F. F. *Entdeckungen über die Theorie des Klanges.* Leipzig,
  1787.
- Jenny, H. *Kymatik.* 1967.
- Wegner, D. M. "Ironic processes of mental control." *Psychological
  Review*, 1994. And Wegner et al., "Paradoxical effects of thought
  suppression," *Journal of Personality and Social Psychology*, 1987.
- Abramowitz, J. S., Tolin, D. F., and Street, G. P. "Paradoxical effects
  of thought suppression: a meta-analysis of controlled studies." *Clinical
  Psychology Review*, 2001.
- Akbari, M. et al. "Experiential avoidance in depression, anxiety,
  obsessive-compulsive related, and posttraumatic stress disorders: a
  comprehensive systematic review and meta-analysis." *Journal of
  Contextual Behavioral Science*, 2022.
- Bateson, G. *Naven.* 1936, for schismogenesis; *Steps to an Ecology of
  Mind*, 1972.
- Barrett, L. F., Quigley, K. S., and Hamilton, P. "An active inference
  theory of allostasis and interoception in depression." *Philosophical
  Transactions of the Royal Society B*, 2016.
- Kleckner, I. R. et al. "Evidence for a large-scale brain system
  supporting allostasis and interoception in humans." *Nature Human
  Behaviour*, 2017.
- On branching processes and the threshold at R0 = 1: any introductory
  treatment of the Galton–Watson process; the statement that a process
  with mean offspring at most one dies out almost surely is standard.
- The repository: github.com/jhighman/j-lex-space, folders
  `the-unframeable-now`, `the-return-of-the-excluded`, `loop-gain`, and
  issues 5, 6, 9 and 10.
