# Part IV — The business

## 23. The finding that reorganises this section

The first draft of this plan assumed the customer was a parent who wanted
verifiable non-extraction. **The research does not support that**, and the
evidence against it is direct enough to restructure around.

Studies of parents choosing children's apps find a *value* paradox rather
than a privacy paradox: parents "underestimate the cost of good apps and are
reluctant to pay for any," and **privacy is not a priority for parents when
choosing apps for their children** ([Ofcom/academic survey work on
children's app privacy](https://arxiv.org/pdf/1809.10841); [developer-side
study](https://arxiv.org/pdf/2306.01152)). This sits inside the broader,
well-replicated privacy paradox: stated concern does not predict behaviour
([systematic
review](https://www.sciencedirect.com/science/article/pii/S0736585317302022)).

Meanwhile the people who face **$53,088 per violation** are not confused
about whether they care.

> **The customer for demonstrable non-extraction is not the parent. It is
> the operator who will be fined.**

Everything below follows from that.

## 24. The regulatory position, which is the actual market

The compliance environment changed materially in the eighteen months before
this was written, and it changed in the exact direction this architecture
was built for.

**United States.** The FTC approved sweeping COPPA Rule amendments 5–0 in
January 2025 — the first major update since 2013 — effective 23 June 2025
with a **full compliance deadline of 22 April 2026, now passed**
([Federal Register](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule);
[White & Case](https://www.whitecase.com/insight-alert/unpacking-ftcs-coppa-amendments-what-you-need-know)).
The new obligations include:

- a **business need** to retain a child's data at all;
- **mandatory retention limits** and a **published retention schedule that
  bars indefinite storage**;
- a **written security programme**;
- separate opt-in consent for sharing or targeted ads.

Read that list against Part II. A published retention schedule barring
indefinite storage is not a document this project would have to write — it
is a screen this project already has, and the screen *measures* rather than
asserts.

Penalties run to **$53,088 per violation**, and enforcement is active:
**Cognosphere, $20m (January 2025)**; **Disney, $10m (September 2025)**
([FTC](https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa);
[Davis Polk](https://www.davispolk.com/insights/client-update/ftc-prioritizes-coppa-enforcement-new-compliance-obligations-take-effect)).

Critically for Part III: the Rule applies to any operator that knowingly
collects children's data **including through third-party plug-ins or ad
networks**. The supply-chain problem is not a philosophical concern. It is
the liability.

**United Kingdom.** The Children's Code is one of the ICO's three stated
enforcement priorities for 2026, and the ICO is applying it "increasingly"
to mobile gaming. In **February 2026 the ICO fined Reddit £14.47m** for
unlawful use of children's data, holding that age self-declaration is
inadequate ([Osborne
Clarke](https://www.osborneclarke.com/insights/uk-ico-fines-online-platform-ps1447m-and-warns-age-self-declaration-not-enough-protect)).
Exposure runs to **£17.5m or 4% of global turnover**.

**European Union.** The Commission published guidelines on the protection of
minors under the DSA on 14 July 2025, requiring highest-protection defaults
and discouraging manipulative design
([EC](https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelines-protection-minors)).
Breach exposure is **6% of worldwide annual turnover**, and the EU KIDS Act
extends the direction of travel beyond social media
([Freshfields](https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/the-eu-kids-act-europe-moves-online-child-safety-beyond-social-media-bans-102o1ld)).

**And almost nobody is compliant in a demonstrable way.** As of March 2026,
**only eight products worldwide hold active kidSAFE certification**
([kidSAFE guide](https://spellingjoy.com/best-apps/kidsafe-certified-apps-complete-guide)).
PRIVO, the other major FTC-approved Safe Harbor, has certified hundreds
([PRIVO](https://www.privo.com/coppa-safe-harbor-program)). Against an
industry of hundreds of thousands of child-directed products, that is a
rounding error.

That gap is the market. It is also a warning: the existing answer to this
problem is **a seal**, and a seal is a claim about a claim. This project's
differentiator is that it produces *evidence* instead.

## 25. The benchmark: what a comparable actually did

The closest comparable is **Pok Pok** — premium, wordless, no ads, no IAP,
preschool, built by five developers who left Snowman (*Alto's Adventure*).
Its numbers are public and they are the most useful calibration available
([TechCrunch, June
2024](https://techcrunch.com/2024/06/18/now-a-series-a-startup-kids-app-and-digital-toy-pok-pok-is-coming-to-android);
[Engadget](https://www.engadget.com/pok-pok-ios-app-kids-snowman-subscription-indie-130025594.html)):

| | Pok Pok |
|---|---|
| launched | May 2021 |
| model | subscription — **$3.99/mo or $29.99/yr** |
| funding | **$3m seed (2022), $6m Series A (2024)** |
| downloads | **1m+** |
| revenue at Series A | **six-figure MRR** |
| growth | 9× subscribers year on year |
| content | 17 play experiences |
| credential | **Apple Design Award, 2021** |

Four things follow, and three of them are uncomfortable.

1. **The working model is subscription, not one-time purchase.** The first
   draft of this plan proposed a single premium price. The only comparable
   that works does not use one.
2. **It took roughly three years and $9m to reach six-figure MRR** — with a
   team carrying the reputation of a famous studio.
3. **Discovery was editorial.** The Apple Design Award is the visible
   mechanism. Premium children's apps are not found by search.
4. **Seventeen experiences.** The content surface is far larger than one
   warren with eight animals.

Milo & Me today has one loop, no art budget, no studio pedigree and no
award. On Pok Pok's own curve it is at roughly month three.

## 26. Three paths, re-weighted by the evidence

### Path A — the game as a consumer product

**Weakest as a business; necessary as a credential.**

The research says parents do not buy privacy, and the comparable says even an
excellent, well-connected, award-winning premium preschool app needs venture
funding and three years. Selling *this* game on *verifiability* is selling a
feature the buyer has been measured not to want.

But the game still has to ship and still has to be good, because everything
in Paths B and C is worthless without it. **Nobody buys a method from
someone who has not used it in anger.**

- **Model:** follow the comparable — subscription, priced in the
  $3–4/month, $25–30/year band, no ads, no IAP, no accounts.
- **Positioning:** *not* privacy. Position on the thing a parent will
  actually respond to — a beautiful, calm, wordless game that teaches a
  four-year-old to be gentle. Privacy is the reason to trust it, not the
  reason to buy it.
- **Assumption to test:** that it is good enough to earn editorial
  attention. *Cheapest test:* submit to the Apple Design Awards and to
  curation, and treat a lack of interest as information.

### Path B — the architecture as a product

**Strongest, and the one the evidence points to.**

Sell the machinery to operators who now have obligations they must be able
to *demonstrate*: the portable ledger core, the closed-vocabulary
enforcement, the generated-governance pattern, the measured-retention screen
and the conformance tests.

The pitch is one sentence: *your retention schedule is a document; this
makes it a measurement.*

- **Buyers:** children's game and app studios; edtech; any operator whose
  product is "likely to be accessed by" under-18s, which the Children's Code
  defines broadly enough to include a great deal of general software.
- **Why now:** the April 2026 COPPA deadline has passed, the ICO has named
  mobile gaming, and the certification market is eight products deep. The
  obligations exist and the tooling does not.
- **Against:** this is a developer-tools and assurance business, with a
  long sales cycle and a buyer (compliance) that has historically preferred
  paperwork to mechanism. Paperwork is cheaper and, until enforcement bites,
  it works.
- **Assumption to test:** that an operator will pay for evidence rather than
  a seal. *Cheapest test:* five structured conversations with studios
  shipping child-directed products, showing the parent screen and asking
  what it would take to be *required* to have one.

**Part V takes this path apart in full** — what is actually sold, the layer
that can be retrofitted and the layers that cannot, the buyer who wants bad
news, and the ninety days that would establish whether any of it is real.

### Path C — institutional

Early-years settings, paediatric and therapeutic contexts, where the
mechanic has face-validity and the privacy architecture is a procurement
gate rather than a preference.

- **For:** buyers who genuinely cannot accept data collection; the only
  setting where the game's effects could be *studied* rather than assumed.
- **Against:** long procurement, evidence requirements the project cannot
  meet, and a real risk of over-claiming. **The game has no efficacy
  evidence whatsoever and must never be sold as though it does.**
- **Assumption to test:** that a setting will run a pilot. *Cheapest test:*
  find one.

## 27. Revised sequence

1. **Put it in front of children.** Ten of them, watched. Nothing below is
   decidable first, and it costs almost nothing.
2. **Pay someone to attack it** — one person who did not write it, one week,
   trying to make the record say something untrue. This is also the first
   deliverable of Path B, because it is exactly what a buyer will ask
   whether anyone has done.
3. **Ship Path A as a subscription** and submit it for editorial attention.
   Treat it as the credential, and do not model the business on it.
4. **Run Path B's five conversations in parallel** — they cost days, not
   money, and a negative result should redirect everything.
5. **Path C's single pilot** once there is something shipped to pilot.

The change from the first draft is step 3's demotion. The game is no longer
the business; it is the evidence that the business is real.

## 28. What it costs

**Finishing what exists** — child testing, adversarial review, defensible
numbers, the two rendering spikes finished or removed, a Swift test target,
and the unexercised assertions exercised — is weeks of work for two people
and is the highest-return work available.

**Reaching Path A's benchmark** is, on the comparable's evidence, a
multi-year and multi-million-dollar undertaking dominated by content
production, not by architecture. Seventeen experiences versus one warren is
the honest measure of the gap.

**Path B** is cheap to start and expensive to sustain: the artefacts already
exist, but productising them means documentation, support and a conformance
suite somebody else can run.

**The standing cost of the ethic.** No ads, no analytics, no accounts means
no funnel, no cohort analysis, no A/B testing, no retention telemetry.
Everything the industry uses to make a product better is unavailable by
construction. That belongs on page one of any pitch: **this product cannot
be optimised the way software normally is, and the team has to be good
enough not to need to be.** Pok Pok's 9× subscriber growth was measured with
instruments this project has refused.

## 29. Risks, in order of lethality

1. **The game may not be fun.** Now the top risk, because the market
   research has already answered the question that used to sit here.
   Restraint as a core mechanic may simply be boring to a four-year-old, and
   no architecture rescues that. **Untested.**
2. **Discovery.** Premium children's apps are found through editorial
   curation. That is a lottery with one ticket per title, and the comparable
   won it.
3. **Path B's buyer may prefer paperwork.** Enforcement is real but sparse;
   a $53,088-per-violation exposure is only frightening if you expect to be
   looked at. Seals are cheaper than mechanisms and satisfy an auditor.
4. **The ethic may not survive scale.** Every mechanism in Part II is
   maintained by two people who can hold the system in their heads. The
   drift failures already found were found by *reading*.
5. **Unreal weakens the central claim** (§20) unless the supply-chain work
   is done — and COPPA's third-party-plugin language makes that a legal
   exposure, not an aesthetic one.

## 30. What would have to be true

- A four-year-old plays it for twenty minutes without being told to, more
  than once.
- Somebody outside the two authors seriously tries and fails to make the
  record lie.
- One operator says the parent screen is something they would need — without
  being persuaded by the authors' enthusiasm.
- The game is good enough to be *curated*, since that is the only discovery
  mechanism the comparable demonstrates.

The first two are cheap, unblocked, and should be done next. None of the
four has been established.

The honest summary is unchanged in shape but sharper in aim: **an unusually
well-built demonstration of an argument, in a market where the people who
say they want it have been measured not to buy it, and the people who will
pay for it are the ones facing fines.**
