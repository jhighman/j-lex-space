# Part IV — The business

## 23. A warning about this section

**No market figures in this document were researched.** The author did not
have access to current data on children's premium app revenue, early-years
software procurement, or comparable titles, and inventing plausible numbers
would be the exact failure the rest of this document argues against.

Where a quantity is needed it appears as **an assumption to be tested**,
named as such, with a note on how to test it cheaply. A plan whose
arithmetic is invented is not more useful than a plan that says which
arithmetic is missing.

## 24. What is actually being sold

There are two assets here and they are not the same business.

**The game** is a small, unusual, wordless title for four-year-olds with no
ads, no purchases, no accounts and no data collection.

**The method** is a demonstrated way of making claims about children's
software that a third party can check: a closed vocabulary enforced in one
place, derivations that cannot drift from their evidence, documents
generated from the system they describe, and claims that are measured when a
screen opens rather than written into it.

The method is the durable asset. The game is its proof, and proof is not a
side project — nothing about the method would be credible without something
shipping that embodies it.

## 25. Position

The children's app market's defining feature is that **parents cannot verify
anything.** Privacy policies are unreadable, permissions are coarse,
"educational" is unregulated, and the gap between what an app says and what
it does is invisible from the outside.

The usual response is a trust mark: a badge, a certification, an audit
someone paid for. A badge is a claim about a claim.

The position here is different and narrower: **the app shows its own
evidence.** The parent screen is not a policy summary, it is the record
itself — short enough to read in full — plus measurements taken in front of
you. There is no version of this that requires believing the authors.

Whether parents *want* that is the central open question of this business
and is addressed in §29.

## 26. Three paths

### Path A — the game as a premium product

One-time purchase. No IAP, no ads, no subscription, no accounts. The ethic
and the revenue model have to agree or the whole thing is theatre.

- **For:** cleanest expression of the argument; nothing to explain.
- **Against:** premium children's apps are a famously hard market. Discovery
  is dominated by storefront editorial and word of mouth. A single small
  title from unknown authors is a lottery ticket.
- **Assumption to test:** that a meaningful number of parents will pay a
  premium price for a wordless game with no progression system. *Cheapest
  test:* a landing page with a real price and a waitlist, driven by a
  handful of parenting communities, before any further engineering.

### Path B — the method as a product

An auditable-record toolkit: the Rust core, the generated-governance
pattern, the measured-claims parent screen, and the conformance tests, sold
or licensed to people shipping children's or otherwise regulated software.

- **For:** the regulatory direction of travel is unambiguous. Age-appropriate
  design codes, the AI Act, the DSA and their equivalents all push toward
  *demonstrable* properties rather than asserted ones. Our own paper series
  argues that the interesting question in any simplification programme is
  what evidence survives it — and a company that has to answer that question
  needs machinery, not a policy.
- **Against:** it is a developer-tools business, which is a different company
  with different people and a much longer sales cycle. And the buyer is
  usually a compliance function that has historically preferred a document
  to a mechanism.
- **Assumption to test:** that anyone will pay for *demonstrable* compliance
  rather than *documented* compliance. *Cheapest test:* five structured
  conversations with people who ship children's software, showing the parent
  screen and asking what it would take to be required to have one.

### Path C — institutional

Licensed into early-years settings, paediatric and therapeutic contexts,
where the mechanic — restraint, reading an animal's state, tolerating a
refusal — has an obvious face-validity fit, and where the privacy
architecture is not a nice-to-have but a procurement gate.

- **For:** buyers who genuinely cannot accept data collection; a shorter
  path to revenue per unit; a setting where the game's actual effects could
  be *studied* rather than assumed.
- **Against:** long procurement, evidence requirements the project cannot
  currently meet, and a real risk of over-claiming therapeutic benefit. The
  game has no efficacy evidence whatsoever and must not be sold as if it
  does.
- **Assumption to test:** that a setting will run a pilot. *Cheapest test:*
  one. Find a single early-years setting willing to put it in front of
  children and observe.

## 27. Recommended sequence

**Not a choice between the three — an order.**

1. **Put it in front of children.** Nothing below is decidable until this
   happens, and it costs almost nothing. Ten children, watched, in a setting
   that does not require ethics approval to observe informally.
2. **Have someone else attack it.** One person who did not write it, paid
   for a week, trying to make the record say something untrue.
3. **Then Path C's single pilot**, because it produces both revenue evidence
   and effect evidence at once, and because the buyer's requirements are the
   sharpest available test of whether the architecture is worth anything.
4. **Path A alongside**, as the thing that makes the method credible and
   the thing that might, on its own, work.
5. **Path B last**, once there is a shipped title and a pilot to point at.
   Nobody buys a method from someone who has not used it in anger.

## 28. What it costs

Cost is the one side of this that can be reasoned about honestly.

**To finish what exists** — child testing, an adversarial review, the
numbers given a defensible basis, the two rendering spikes either finished
or removed, a Swift test target, and the unexercised assertions exercised:
this is a small amount of work by two people and is measured in weeks, not
quarters. It is the highest-return work available and none of it is
speculative.

**To take it to Unreal** — see §22. Stages 0–2 are small. Stage 3 (supply
chain) is the one people under-budget, and stages 4 onward are an ordinary
art and production budget that scales with ambition rather than with the
argument.

**The standing cost of the ethic.** No ads, no analytics, no accounts means
no funnel, no cohort analysis, no A/B testing, and no retention telemetry.
Everything the industry uses to make a product better is unavailable by
construction. That cost is permanent and should be stated to any investor on
the first page rather than the tenth: **this product cannot be optimised the
way software is normally optimised, and the team has to be good enough not
to need to be.**

## 29. Risks, in order of how likely they are to kill it

1. **Parents may not pay for verifiability.** The most likely failure. The
   people who care most about children's data are a small, vocal minority;
   the median purchase decision is made on the storefront in thirty seconds
   on the strength of a screenshot. *Mitigation: none available inside the
   product.* The test in §26A has to be run early because a negative result
   should change the whole plan.
2. **The game may not be fun.** It has never been played by its audience. A
   game built entirely on restraint may simply be boring to a four-year-old,
   and no amount of architecture rescues that.
3. **The ethic may not survive scale.** Every mechanism described in Part II
   is currently maintained by two people who can hold the whole system in
   their heads. The drift failures already found were found by reading. A
   team of twenty would need tooling that does not exist.
4. **Unreal weakens the central claim** (§20) unless the supply-chain work
   is done properly, and that work is invisible, unglamorous and the first
   thing cut under pressure.
5. **Regulatory tailwind may not convert.** The direction of travel is
   clear; the willingness to pay for machinery rather than paperwork is not
   demonstrated.

## 30. What would have to be true

For this to be a business rather than a good argument:

- A four-year-old plays it for twenty minutes without being told to, more
  than once.
- Somebody outside the two authors fails to make the record lie, having
  seriously tried.
- At least one buyer — a parent at a real price, or a setting at a real
  price — says yes without being persuaded by the authors' own enthusiasm.
- The supply-chain claim survives being written down and checked by
  somebody who does not want it to be true.

None of the four has been established. The first two are cheap and should be
done next. The whole of this plan is conditional on them, and the honest
summary of the business today is: **an unusually well-built demonstration of
an argument, with no evidence yet that anyone wants it.**
