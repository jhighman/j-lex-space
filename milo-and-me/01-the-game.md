---
title: "Milo & Me"
subtitle: "A wordless game for four-year-olds, the architecture underneath it, what it would cost to build on Unreal, and whether it is a business"
author: "J Highman · Alexandra Křížová"
date: "2026-09-27"
---

# Summary

**Milo & Me** is a wordless game for a child of about four. She walks into a
warren of burrows with her three-legged dog, meets eight animals, and
learns one thing: *an animal comes to you when you stop reaching for it.*
There is no score, no losing, no text, and no voice.

Every system in it was built to say one sentence: **the world does not get
better because you did well.** That is a position about how games are made,
and it is the opposite of the prevailing one. The contemporary craft is
additive — a layer enters on success, the score swells, the interval between
rewards is tuned until the thing is hard to put down. This uses the same
craft pointed the other way, and the cost is itemised rather than claimed.

What that took: **eight handed-down authorities on sound**, most of which
conclude against the technique they are about; a **measurement tool applied
to the author's own music** so that taste cannot quietly overrule the rule;
a soundtrack that may move with trust and may not improve with it
(*distance, not prettiness*); **nine creatures built as nine worlds** rather
than one room recoloured; and a reading of the developmental literature that
inverts the obvious one — the game's job is not to test whether a child can
wait, but to be the adult who keeps the promise, so that waiting is
reasonable.

Underneath that is an argument about children's software, and it is the same
refusal applied to the record. Everything the game records about the child is
written in a **closed vocabulary of thirteen words**, held in memory,
discarded at the end of the afternoon, and shown to a parent in full. The
claims the parent screen makes are not promises — they are measurements taken
when the screen opens, and the parts that could drift are generated from the
engine so that they cannot.

Nine parts, of which the first and the last two are about the game and the
middle is about the record and the business it might be:

- **Part I — the game.** What a child does, and why each mechanic exists.
- **Part II — the architecture.** How the record works, what is enforced by
  construction rather than by policy, and what remains unproven.
- **Part III — Unreal.** What would port, what would break, and the one
  problem that gets qualitatively harder.
- **Part IV — the business.** Positions, models, risks, and an explicit
  list of the things that would have to be true.
- **Part V — the architecture as a product**, and the correction a buyer
  forces on it.
- **Part VI — research**, and the findings that break Part IV and Part V.
- **Part VII — somebody else built the door**, and what that costs the claim.
- **Part VIII — what playing it changed.** Written after the first build
  anybody could actually play, and the changes are less interesting than the
  fact that none of them were visible from the code.
- **Part IX — nothing improves, and that is the design.** The craft
  argument: audio, soundtrack, picture, and the psychographics. **If one part
  of this document is the contribution, it is this one.**

A note on the fourth part before it starts: **it contains no researched
market figures.** None were available to the author at the time of writing,
and inventing them would be worse than leaving them out. Where a number is
needed it is marked as an assumption to be tested, not a finding.

---

# Part I — The game

## 1. The situation

A child wakes in a dark yard. A dog is asleep in a kennel. Light comes up, the
dog wakes, stretches, shakes himself off. Nothing is carried out of the
kennel, because there is nothing in it.

That is the first thing the game says, and it says it by showing rather than
claiming: **nothing was kept from last time.**

She comes out. There are four things she can do with the dog — offer
food, offer a ball, hold out a hand, or sit still — and on this one animal
all four simply work. Milo is hers already. There is no trust to win and no
wrong answer, and none of it is written down.

Only after she has played does a hole open at the end of the yard.

**The crossing is a choice, not a corridor.** The way down appears and then
waits. A child who does something else is not corrected; the dog goes to the
hole, looks at it, and waits — and asks more quietly the more she declines.
Nothing is recorded when she does not go, because not going is not an act.

## 2. The warren

Below is a map: seven burrows in a loose ring with a crossing, so there is
more than one way round and no dead end that feels like a mistake. Some hold
an animal. One is the way further down. The entrance is the way home.

The child walks between them. That is the whole of the navigation — no
joystick, no camera, no menu.

## 3. The encounter, which is the game

> **Superseded for the current build — see Part VIII §49.** What follows
> describes the shipped iOS game and was true when written. The encounter has
> since been replaced by sequential trust: a place numbered one to four
> inside each creature's universe, walked to or jumped to. The lesson is
> unchanged and arrived at from the other side.


In a burrow there is an animal, a lamp, and the dog.

The animal holds up a picture of what it wants: food, play, a hand, or —
most importantly — nothing at all. Four buttons sit along the bottom, always
all four, always available.

Reading it right moves the animal one step closer. Reading it wrong moves it
one step back. **It never goes below nothing**, so there is no losing, only
ground to make up.

And the meter is not a meter. There are no pips, no bar, no number. **Trust
is the animal's posture and its distance from you**: at nothing it is curled
and trembling in the dark half of the room, and as it comes to trust the
child it uncurls, stands, and walks into the lamp's pool of light. *Walking
into the light is the meter.* A child who cannot read can see how it is
going by looking at the animal, which is where she is looking anyway.

### The lesson the game is built around

One of the four signals is **frightened**. The right answer is the stillness
button: do nothing, and wait.

Every other children's game rewards pressing more. This one has exactly one
place where the correct action is to stop acting, and it is the moment the
whole design exists for. The parent screen counts it — and counts it from
*the animal settling*, never from the button being pressed, because the
claim is about what happened, not about what was tapped.

### Leaning in

> **Superseded for the current build — see Part VIII §49.** Under sequential
> trust the lean is not a move inside the encounter. It is the door into the
> room, it costs nothing, and it is not written down at all. What follows
> describes the shipped iOS build.

Holding a finger on the animal brings the child close enough to see it
looking back. In profile a frightened animal is frightened; face on, it is
frightened **of you**. Letting go sits her back up.

Leaning at something already frightened is the same mistake as reaching for
it, learned through a second door: the animal backs off, the ground she made
slips, and nothing is taken from her.

### Hurry

While an animal is reacting, a child who taps and taps used to get nothing
back at all — not a refusal, not a sound. Those touches are counted now, and
an animal that startles easily notices the commotion. It is the one moment
the game was silent about the thing it is for.

## 4. Eight animals, eight moments

> **The cast is nine, not eight — see Part VIII §50.** It has been nine since
> the bear cub was dropped and the mole and the moth added. The count here
> dates from before that and nothing in the repository counts the cast, so
> the sentence had no generator to keep it true.


Each animal asks for a different amount of patience and wants different
things, drawn from a temperament — a deer really is skittish, a badger
really is hungry, without either being scripted.

When one decides about the child, it does the thing only that animal does.
The rabbit's ears go flat and then straight up. The hedgehog's spines lie
down **and stay down**. The deer lowers its head below her eyeline. The owl
turns its head further than a head should.

This is deliberately **not** a cut scene. If she is leaning in when it
happens, she stays leaning — her finger is still down, letting go still
works, and the animal still owns what happens. Every moment of closeness in
this game is something the animal grants; a cut scene would be closeness the
game grants regardless, arriving at exactly the moment she has finished
learning that patience is what earns it.

## 5. The one who will not come out for anybody

At the bottom of the warren is the Moon Hare. She will not appear for one
person. Three animals the child has already befriended have to walk in and
speak for her first.

Milo cannot be one of them. He is hers already — which is exactly why he
cannot vouch — and the rule is kept not by a check but by the record never
being told he exists. There is no line of code that excludes the dog. There
is nowhere to put him.

## 6. Rests the game insists on

After three friends or ten minutes, the game stops and puts the child on a
bench with the dog. It is not a nag screen and not a timer she can dismiss:
a stretch ends, the rest is written down where a grown-up can see it, and
the only way to start a new stretch is to have taken one.

## 7. Friends, and that they are not permanent

Once befriended, an animal **lives somewhere**. Its burrow wears its face
instead of a generic paw, is ringed in heart-pink, and starts revealed — she
knows where her friends live. The map becomes a picture of her afternoon
rather than the same blank maze.

Walking in calls on them. There is no meter and there are no offers; they
decided about her a while ago and nothing is at stake. What is left is being
close to them, which is the lesson said once more with nothing riding on it.

**They can be out.** A friend who is always available is the first creature
in this game a child cannot be refused by, and that would undo the rule every
other room spends its time teaching.

And a friendship **cools when it is not tended** — how fast is the one thing
a parent chooses. A friend not visited for a while is out more often and her
burrow's ring fades. It never rewrites the past: a friendship that cooled
still happened, and going back warms it again.

## 8. Something lying in the room

Sometimes there is an object on the floor. It can be picked up and given to
any animal, and it is **always accepted** — no signal to match, no wrong
answer.

It is never required, and that is the design. The four offers can never
become scarce, because a child who ran out could not answer an animal at all
and the game would have its first dead end. So scarcity is not difficulty
here. Every offer is free and endlessly repeatable, so generosity has never
cost anything; a thing that can be given **once, to one animal,** makes her
choose who gets it.

Rarity is not a colour — saturated colour is reserved for things she can
touch, and that is how a pre-literate child finds the four offers at all.
Rarity is **light**: a common thing has none of its own and must be looked
for; a rare one is what the dark half of the room cannot hide.

And a treasure lies inert until the animal it belongs to is the one in the
room, and then it stirs. She learns whose it is by watching what moves near
whom, with nothing written and nobody told.

## 9. Going home

The entrance is the way home, and it opens as soon as there is anybody to
walk out with. Same arrow as the way down, turned over.

Back in the yard, later in the day, everybody who was befriended walks out of
the hole behind her and stands in the grass. That is the only score this game
will ever show: not a number, but who is standing next to you at the end.

And then, one at a time, they go home too. Each walks back to the hole,
stops, **looks at her**, and goes.

Friendships here last exactly one afternoon. That has always been true, and
before this the child never saw it — the friends were simply not there next
time, deleted off-screen between sessions, which is a fact about a database
rather than a thing that happened to her.

## 10. What the game is teaching

In order of how much of the design is spent on it:

1. **An animal comes to you when you stop reaching for it.** Restraint as
   the winning move, in the one medium that never says so.
2. **Closeness is granted, not taken.** Every intimate moment in the game is
   something a creature permits and can refuse.
3. **A friendship is something you keep doing**, not something you own.
4. **Generosity costs something**, exactly once, and you choose who.
5. **Endings happen, and you can watch them.**

None of this is narrated. There are **zero written words** in the game.
