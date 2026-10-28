# Loop Gain · reading script, timed to the film

*Narration only, from `script.md`, with the film's own clock. The timecode before each paragraph is the moment the matching shot appears in `loop-gain-film.mp4`; start the paragraph then. The cue sheet says what is on screen. The film is silent and runs 11:30; the credits from 11:15 carry no narration. Each scene heading gives the window and the words it holds; at a measured 150 words a minute the capacity is shown beside it. Where words exceed capacity, speak a little faster or trim the lines the script's notes mark as cuttable. Drafted 2026-10-28 by Claude, working with Jeff, for Jeff to rewrite in his voice.*

---

## 0 · Cold open · 0:00–0:30 · 95 words, room for 75 · **over by 20**

**[0:02]** Put a microphone in front of its own speaker and turn the gain up. Below a certain point you get an echo that dies away. Past that point you get a howl, and the howl settles on whatever note the room likes. Nobody chose the note. The room did.

**[0:20]** That point has a name. Loop gain equal to one. This is a video about a week we spent finding that point in two places it was not supposed to be, and about how we found it, because the how is the part you can use.

## 1 · Two briefs · 0:30–1:25 · 158 words, room for 138 · **over by 20**

**[0:30]** It started as art. Two concept briefs for interactive pieces, written by Lex, the reviewer on this project, in two different vocabularies.

**[0:45]** The first is about a feed. Everything that reaches you arrives framed: a card, a timestamp, a sentiment colour, a "because you liked". The brief's claim is one sentence: every frame applied re-enters as signal. Whatever you do to the feed becomes one more thing in the feed.

**[1:02]** The second is about pollution, read as a symptom. Push a signal out of awareness and it accumulates somewhere, and comes back. The brief's claim is also one sentence: excluding the signal repeats the act that produced it.

**[1:15]** An art programme called Phase Transition asked us to translate a finding into a form, under the rule *carry the structure, not just the essence*. The programme's name gave us a question to put to both briefs. As you turn the system up, does it slide, or does it drop?

## 2 · Make it runnable · 1:25–2:30 · 161 words, room for 162

**[1:25]** You cannot ask a brief that question. You can ask a model. So the first thing we did, for each brief, was write its rules down plainly enough to run.

**[1:45]** The feed became a stream from seven channels, four that ask something of the reader and three she would rather see, ranked by stated weights. Every gesture returns to the stream two point two seconds later as one more item. Four numbers wear down by stated rules: attention, calm, agency, and the minutes she meant for something else.

**[2:00]** Then seeds. A seed is a number that fixes every random choice, so the same seed gives the same session on any machine. When a run looks strange, you run that one again. We say "twenty seeds a point" and we mean twenty repeatable sessions at each setting.

**[2:20]** None of this is a claim about a person. It is a machine for finding out what the rules entail. That sentence will come back.

## 3 · Write the prediction first · 2:30–3:35 · 159 words, room for 162

**[2:30]** The second brief had been written, read and extended by two people before anyone wrote down the number that decides it. Here it is. Each exclusion deposits a unit in the exterior. A unit returns with some probability, and a returned signal is excluded again with some propensity, and comes back louder by a gain. So one exclusion begets, on average, propensity times gain times return share, exclusions in the next generation.

**[2:55]** Epidemiologists call that R‑nought. Below one, it dies out. Above one, it multiplies. The brief's claim that ignoring the signal supplies fresh material for the next return is the claim that the gain is above one.

**[3:15]** Before we ran anything we wrote five hypotheses to disk, with numbers, and what would falsify each. With our constants the critical propensity was zero point eight. We marked the section and did not touch it again.

**[3:30]** This costs ten minutes. It is the difference between a result and a story.

## 4 · The sweep that slid · 3:35–4:30 · 119 words, room for 138

**[3:35]** We swept the feed first. Four constants through a range, twenty-four points, ten or twenty seeds a point. Interval between arrivals from twelve seconds down to a third of a second.

**[4:00]** No cliff. Every curve flat or sliding. One knee, near three and a half seconds between arrivals, which happens to be the page's normal day.

**[4:10]** And the knee had a reason we could read off the rules by hand. Attention in the model recovers only after three seconds of quiet. The share of gaps that long is a continuous function of the interval, one above five seconds, zero below two. The attention curves track it at point nine to point nine nine seven. A slope, with an explanation.

## 5 · The failure · 4:30–6:00 · 208 words, room for 225

**[4:30]** Then the exclusion loop. We had predicted a critical point at zero point eight and said the sweep would read it as a cliff.

**[4:50]** It read "slides." Our first hypothesis failed under its own test.

**[5:00]** Here is why, and it is worth sitting with. The verdict rule was written for the feed, for a bounded quantity that steps. A quantity that diverges at a critical point does not step. It grows, and in a three-minute session it grows smoothly straight through the critical value. The instrument was wrong for the question. The pre-registration is what let us see that, instead of quietly moving the goalposts.

**[5:25]** So we wrote a second test and labelled it post-hoc, so nobody could mistake it for the first. For a critical point the right question is whether the end state depends on how long the session ran. Below the point, a twelve-minute session should end where a three-minute one did. Above it, it should keep growing.

**[5:45]** At zero point six the ratio was one point one. At zero point eight, three point nine. At zero point nine, sixty-two. The turn was at zero point eight, where the number said. And the failure stays in the record, at full length, next to the success.

## 6 · Prove what you can · 6:00–7:10 · 179 words, room for 175 · **over by 4**

**[6:00]** Some claims do not need a sample. They follow from the rules alone. For those we used Lean, a proof assistant, in its core form with no library, so that anyone can check them with one small download.

**[6:25]** The band cannot be kept flat by acting. The floor never comes down. The moment's calm deficit persists as structure. Agency never rises without a like that worked or an emptying. For the loop: supercritical mass is unbounded, subcritical mass is bounded, and a higher return rate never lowers R‑nought. Twenty-one theorems, resting on Lean's own axioms and nothing else.

**[6:40]** One of them corrected us. Our first version of the floor theorem was false as written. If the floor were ever above its cap, a rule would pull it back down. The compiler found the missing hypothesis. That is what a proof assistant is for.

**[6:55]** And every theorem is of the form: if the model is as written, then this follows. Not one is about a person. The proofs tell you, by what they cannot reach, where the simulator's work begins.

## 7 · The fourth frame · 7:10–8:30 · 196 words, room for 200

**[7:10]** Lex's extension of the second brief had put a body in the model: each exclusion costs something, an allostatic load that recovers slowly. We had three readings of what the load does. Then we read Wegner.

**[7:30]** Wegner's ironic process theory says why trying not to think of something makes you think of it. A monitor scans for the suppressed thought and, in scanning, keeps it close. Under load the monitor keeps running while the effort to suppress gets tired. In the model's terms, load raises the return rate.

**[7:50]** We wrote the prediction first. The critical point would barely move, because the return share was already point eight three and doubling the rate could only buy the rest. That held. We also wrote that the frame would be small. That was wrong by an order of magnitude.

**[8:10]** R‑nought counts returns per generation and says nothing about how long a generation takes. Double the return rate and you barely move whether the loop runs away. You halve the time a generation takes, so above the threshold it compounds twice as fast. R‑nought says whether. The return rate says how fast. We did not have that sentence on Monday.

## 8 · One loop at two gains · 8:30–9:15 · 106 words, room for 112

**[8:30]** Which is when the two briefs stopped being neighbours. In the feed, a gesture returns once, as itself, and the echo does not act. R‑nought is zero. The share accumulates and ages out. A slope.

**[8:40]** In the exclusion loop, a return invites the act that produced it and comes back louder. R‑nought is positive, and a positive R‑nought has a critical point. A cliff.

**[8:50]** Every frame re-enters as signal. Excluding the signal repeats the act. The same loop, at gain zero and gain above zero. The difference between media theory and depth psychology, in these two models, is one rule: does what returns invite an act?

## 9 · The piece · 9:15–10:05 · 121 words, room for 125

**[9:15]** So that is what we made. Three minutes. One stream of pings, read three ways.

**[9:20]** The line: a real run of the feed's model, with its sounds. A gesture, and its pop two seconds later. Loop gain zero.

**[9:30]** The loop: the same pings through a delay with gain, rising past one. The echoes stop dying. The howl. A resonance placed by hand at eight hundred and seventy hertz, as a room has one, and we say so on screen.

**[9:50]** The plate: the howl's settled note drives a plate of sand, and the sand leaves where the plate moves and gathers where it is still. Chladni, seventeen eighty-seven. A continuous drive, a threshold, a form. The oldest version of the same structure.

## 10 · What this is, and is not · 10:05–11:15 · 166 words, room for 175

**[10:05]** Two people did this. A public repository, a laptop, a week. One of us built with an AI assistant; the other reviewed, on purpose with a different one, so we would not share one set of blind spots. She asked to be credited as a reviewer rather than an author, because that is what she did.

**[10:25]** Here is what we would say to anyone who wants to do their own research and means it. Write the rules down. Seed everything. Predict first, with a number. Keep the failures at full length. Prove what can be proved and say what cannot. Find the quantity the question turns on. Work with someone who reads against you.

**[10:55]** And say what the numbers are not. Every claim in this video is about a model. Whether a feed does any of this to you, whether your own loop has a gain, is a question for a person and a measurement. That experiment is the one nobody has run. It is next.

---

Total narration: 1668 words over 11:15 of picture, which is 148 words a minute. The credits card from 11:15 to 11:30 is silent.

**Fit.** Nine scenes fit at a measured pace. Two run over. The cold open
holds 95 words in 28 seconds; either speak it briskly, which suits a cold
open, or drop "Nobody chose the note. The room did." and the clause "because
the how is the part you can use". Scene 1 holds 158 words in 55 seconds;
the script's own notes say it can lose the programme sentence, "An art
programme called Phase Transition asked us…", which brings it under. All
other scenes have slack of five to twenty words.
