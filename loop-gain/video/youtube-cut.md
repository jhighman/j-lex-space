# Loop Gain · the YouTube cut

*A proposed assembly of the Notebook's audio overview into a video for
young researchers on the opportunity of doing your own research. Drafted
2026-10-28 by Claude, working with Jeff, from the transcript in
`../audio/`. Timestamps are the audio's. Target length eleven to twelve
minutes. Every correction the audio needs is carried by an on-screen
caption, so the voices can stay as they are where they are right and be
cut where they are wrong.*

## Principle

Keep the hosts where they are accurate and vivid. Cut where they invent
or overclaim. Where a kept passage leans from the model toward a person,
put the correction on screen in the piece's own caption style: small,
plain, at the bottom, the way the piece names what is placed by hand.
Never let the picture show a person when the voice is talking about a
model; show the model.

## The cut

| # | audio | keep / cut | length | on screen |
|---|---|---|---|---|
| 1 | 00:00–00:25 | **keep** as the cold open: the screeching speaker | 0:25 | black, then the take's movement II at its loudest, sound ducked under the voices |
| 2 | 00:28–00:38 | keep up to "called Loop" | 0:10 | title card: *Loop Gain · one ping stream, three grammars* |
| 3 | 00:38–01:58 | **cut**: the invented community, the gigabytes | — | replace with a 15 s caption card: *Two people. A public repository. One week. The failures left in.* with the two names and the credit line |
| 4 | 02:21–03:43 | keep: the first brief | 1:22 | the feed's line from movement I; caption at 03:05: *"every frame applied re-enters as signal" is the brief's claim; the model tests it* |
| 5 | 03:44–04:54 | keep: the second brief, the acid bucket | 1:10 | the exclusion bench's pre-registration page, scrolling; caption at 04:48: *…when the gain is above one. That number is the whole question.* |
| 6 | 04:54–05:30 | **cut**: the misattributed prompt | — | caption card: *The programme asked: what does sound look like? We asked the models: slope or cliff?* |
| 7 | 05:37–06:46 | keep: headless models, seeds | 1:09 | `lab/model.js` scrolling; a terminal running `node sample.js` with the table appearing; caption at 06:10: *three minutes, not hours; a model, not a person* |
| 8 | 06:49–07:29 | keep: personas, trimmed to the list | 0:40 | the personas table from the lab README |
| 9 | 07:29–08:37 | **cut**: the invented agency definition | — | caption card with the real rule: *agency falls with the share of the stream that is her echo; it rises only when a like worked, or on the bin* |
| 10 | 08:37–10:30 | **keep whole**: the sceptic and the answer | 1:53 | `Unframeable.lean` on screen, then `lake build` succeeding, then `Check.lean`'s axiom list. This is the spine of the video. |
| 11 | 10:47–11:38 | keep: the feed slid | 0:51 | `sweep-paceMs.svg`, then the knee table from `knee.js`; caption at 11:15: *in the model. Nothing here is about human attention.* |
| 12 | 11:39–11:53 | keep the first sentence, then **cut** "a sheer cliff" | 0:08 | — |
| 13 | insert | **new**: a 25 s caption sequence on H1 | 0:25 | the README's hypotheses section with H1 highlighted, then the result: *slides. The rule was wrong for the question.* Then the duration table with 0.8 highlighted. *The failure stays in the record at full length.* |
| 14 | 11:53–13:20 | keep: R0 | 1:27 | `sweep-propensity.svg` with the R0 = 1 line; `Excluded.lean` supercritical theorem |
| 15 | 13:20–15:06 | keep: Wegner, whether and how fast | 1:46 | the fourth-frame prediction on screen first, then the four-frame figure on its log axis; caption at 13:24: *Wegner*; at 14:12: *the load was Lex's from the start; the fourth frame is what load does to the return rate* |
| 16 | 15:09–16:56 | keep: the aha, trimmed | 1:30 | split screen: the line and the Bridson disc; caption at 16:47: *in the models. Whether a person's loop has a gain is a question for a person and a measurement.* |
| 17 | 17:06–20:07 | keep: the three movements | 3:01 | the take, in full, synchronised: movement I under 17:13, II under 17:49, III under 18:45. The hosts describe what is on screen. Caption at 18:40: *870 Hz is placed by hand, as a room has a resonance* |
| 18 | 20:10–20:49 | keep, with one cut at 20:39 ("proved their philosophy") | 0:30 | the issue‑5 thread, Lex's comments visible; the credit line |
| 19 | 20:49–22:21 | **cut**: the reverse arrow as proven | — | caption card: *What is left: a person, not a persona, with a sensor. Nobody has run it. No proof reaches it.* |
| 20 | 22:23–22:39 | keep: the sign-off | 0:16 | the Atlas ring completing; repository URL |

Running time of the kept audio: about 15:00 before trimming within
segments; the target of eleven to twelve minutes comes from trimming 4, 5
and 16 by a third each and tightening 7 and 8.

## Assets, where they are

- the take: `loop-gain.mp4`, to be recorded, saved here
- figures: `../figures/*.png`
- code on screen: `../piece/`, `../proofs/*.lean.txt`
- the issue threads: `../issues/*.pdf`
- the pre-registration and results: `../benches/return-of-the-excluded-README.pdf`
- the knee table: run `node the-unframeable-now/lab/knee.js` in the repository and capture the terminal

## The description, draft

> Two people, one week, one public repository. We asked two simulations the
> same question, whether their end state slides or drops as the drive is
> turned up, and got one slope and one cliff. We wrote the predictions
> down before the runs, and two of them were wrong in ways that taught us
> more than the ones that held. We proved what could be proved, in Lean,
> and said plainly what could not. Then we turned it into three minutes of
> sound and sand. Every claim here is about a model. None is about you.
> Repository: github.com/jhighman/j-lex-space. Built with Claude working
> with Jeff Highman. Alexandra Krížová — critical reviewer and development
> reviewer.
