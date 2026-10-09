# Part V — The architecture as a product

Part IV concluded that the buyer is the operator, not the parent. This part
is what is actually sold to that buyer, what exists today, and the single
structural constraint that determines whether it can be a product at all.

## 31. The sentence

> Your retention schedule is a document somebody wrote. This makes it a
> measurement the build produces.

That is the whole pitch. Everything below is the consequence of taking it
seriously.

## 32. The correction a buyer forces on you

The instinct is to sell a library. It is the wrong instinct.

An operator facing the amended COPPA Rule does not need a library. They need
**an artefact they can put in front of a regulator, an acquirer, or a Safe
Harbor assessor** — and they need it to still be true in nine months, when
the person who wrote the original policy has left.

So the product is not a component. It is an **evidence pipeline**: the build
emits a data inventory, a retention schedule and a conformance report, all
generated from the running system rather than typed alongside it.

The library is how the artefact is produced. The artefact is what is bought.

This distinction matters commercially. A library is evaluated by engineers
on merit and adopted slowly. An artefact that closes a compliance obligation
is evaluated by someone with a deadline.

## 33. The constraint that shapes everything

**Most of this architecture cannot be retrofitted.**

A closed vocabulary, derived-never-stored, an append-only core with one
writer — these are decisions made at the beginning. You cannot bolt them
onto a shipped product with a cloud backend and forty SDKs. Anybody claiming
otherwise is selling a rewrite and calling it an integration.

That would cap the addressable buyer at *new builds only*, which is a very
small business.

But one layer **is** adoptable without touching the architecture:

| layer | retrofit? | what it needs |
|---|---|---|
| **measurement** — what does this app actually keep, and what does it talk to? | **yes** | a test harness and a device |
| **generated documents** — schedule and inventory emitted from the system | partly | a build step |
| **the record** — closed vocabulary, one writer, derived-never-stored | **no** | a new build |

So the product has a wedge and an expansion, and they are different things
sold to different moments:

- **Sell measurement to anybody**, today, without asking them to change a
  line of their app.
- **Sell the record to new builds**, where the cost of adopting it is
  approximately zero because they were going to write *something*.

Getting this the wrong way round — leading with the architecture — is the
most likely way this fails as a business while remaining a good idea.

## 34. Three tiers

### Tier 1 — Measure

A harness that runs the operator's own app and reports, from observation
rather than from their documentation:

- **every byte it leaves on the device**, walked from all writable
  locations, with each file named;
- **every host it contacts**, with any egress a finding;
- **every third-party module in the shipping build**, inventoried.

Output is a dated report. The operator did not change their code.

This exists today for one app — it is the measurement behind the parent
screen — and generalising it is ordinary work, not research.

**Why it sells:** it is the only tier that can be bought on a Tuesday. And
the amended COPPA Rule makes it directly relevant: liability attaches
through **third-party plug-ins and ad networks**, so an SDK inventory plus
an egress log is not a nice-to-have, it is the evidence that the retention
and sharing obligations were met.

### Tier 2 — Record

The portable ledger core: closed vocabulary, append-only, one writer,
every figure derived on the call and nothing stored as a total.

For new builds and rebuilds. The value is that certain claims stop being
maintained and start being **structural** — an operator with this cannot
accidentally retain a field, because there is nowhere to put it.

### Tier 3 — Conform

The part that keeps Tiers 1 and 2 from rotting:

- the **retention schedule and data inventory generated** from the engine,
  so the published document cannot drift from the system it describes;
- a **staleness test that fails the build** when it does;
- an **annual re-measurement** producing a dated artefact.

Tier 3 is where a recurring price lives, because drift is recurring. The
most instructive failure in this entire project was not a bug in the
machinery — it was that every hand-written description of the machinery
drifted from it, three times, in the same week, while the machinery stayed
correct. **That failure mode is universal, it is invisible, and it is
exactly what a regulator reads.**

## 35. What the conformance suite asserts

Concretely, so it is not marketing:

1. **The vocabulary is closed and its published list matches the engine.**
   Test fails the build if the document and the code disagree.
2. **No figure is stored.** Every published number is a pure function of the
   rows.
3. **Retention is measured, not asserted.** The stated schedule is compared
   against a walk of the device.
4. **Declared exceptions are named, enumerable, and shown beside the
   measurement** rather than inside it.
5. **Erasure leaves evidence.** Clearing an audit log writes the line
   recording that it was cleared.
6. **Egress is zero, or enumerated.**

Points 1, 2, 4 and 5 are implemented and running today. Point 3 is
implemented for one app. Point 6 is not built.

## 36. Honest inventory

**Exists and works:** the Rust core with C ABI; the closed vocabulary with
its enforcement and test; derived-never-stored throughout; the generated
governance document with a staleness test that has fired in anger twice; the
device measurement; the declared-keeps pattern; the two-account audit with
recorded erasure.

**Exists as one instance, needs generalising:** the measurement harness
(walks one app's locations), the parent-facing evidence screen.

**Does not exist:** egress testing; an SDK inventory tool; any of it
packaged for somebody else to run; documentation; a conformance suite a
third party can execute without the authors; pricing; a single external
user.

The gap between column one and column three is the product, and it is
smaller than it usually is at this stage — which is the one genuine
advantage here.

## 37. Competition, without flattery

**Safe Harbor certification** (kidSAFE, PRIVO, iKeepSafe) is the incumbent.
Periodic, human, assessment-based, and it produces **a seal** — a claim
about a claim. As of March 2026 only eight products worldwide hold active
kidSAFE certification, while PRIVO has certified hundreds. That is a small
market, and it is worth asking whether it is small because nobody wants it.

**Consent platforms** (OneTrust, Usercentrics, Didomi) manage consent. They
are not competitors; they solve a different obligation and could be
partners.

**Consultancies** are the real competitor, and they win by producing a
document faster and cheaper than a mechanism.

**Doing nothing** is the actual market leader. Most child-directed products
write a policy and move on, and until they are looked at, that works.

The honest differentiator is narrow and defensible: **everyone else
certifies a snapshot; this produces evidence continuously, as a build
artefact, from the running system.** The honest weakness is that the market
has not yet demonstrated it will pay more for that.

## 38. Pricing

**Unknown, and the unknown is resolvable cheaply.** Neither kidSAFE nor
PRIVO publish fees; both direct enquiries to sales. That is a one-email
research task — request a quote as a prospective certifier — and it
establishes the anchor the whole model hangs on.

Shape, pending that anchor:

- **Tier 1 — Measure:** fixed-fee engagement per app per report. Priced
  against what a Safe Harbor assessment costs, because that is the budget
  line it comes out of.
- **Tier 2 — Record:** source licence, or open source with paid support.
  There is a strong argument for **making the core open** — the entire
  proposition is verifiability, and a closed component that asks to be
  trusted is a contradiction the buyer will notice.
- **Tier 3 — Conform:** annual subscription. This is where the business is,
  if there is one.

## 39. The sales motion, and the buyer who wants bad news

Tier 1 has an awkward property: **its output may be bad news for whoever
commissioned it.** "We ran your app and it keeps 40MB and contacts eleven
hosts" is not something a product owner wants on record.

So the first buyers are the ones who *want* the bad news found:

1. **Acquirers doing diligence** on a children's app. They have money, a
   deadline, and a direct interest in discovering what the target actually
   does. This is the strongest wedge in the whole plan and it was not
   obvious until the incentive was traced.
2. **Incoming leadership** — a new CTO or DPO who wants to know what they
   have inherited before they own it.
3. **Operators already in trouble**, post-enforcement or post-inquiry.
4. **New builds**, where the architecture is free to adopt and Tier 2
   applies.

Notably, the routine product owner shipping a healthy app is *last*, not
first. Leading with them is the other likely way this fails.

## 40. Why this fails

1. **Paperwork is sufficient.** If enforcement stays sparse, a policy
   document satisfies the obligation and a mechanism is over-engineering.
   The eight-certified-products figure can be read either as an enormous gap
   or as revealed preference, and **it cannot yet be told which.**
2. **It is a services business wearing a product's clothes.** Tier 1 is
   consulting. Consulting does not compound, and it consumes exactly the
   people who would otherwise build Tiers 2 and 3.
3. **The architecture asks for a rewrite** and most buyers will not do one,
   so the expansion revenue may never arrive and the wedge may be the whole
   business.
4. **Two people.** Every mechanism described here is currently maintained by
   authors who can hold the entire system in their heads, and the drift
   failures were caught **by reading**. That does not survive a team.
5. **No external user has ever run any of it.**

## 41. The first ninety days

Ordered by what kills the most uncertainty per day spent, and all of it
cheap:

1. **Get the pricing anchor.** Request Safe Harbor quotes. One email.
2. **Five conversations** with operators shipping child-directed products.
   Show the measured-retention screen. Ask one question: *what would it take
   for you to be required to have this?* Do not pitch.
3. **Two diligence conversations** with anyone who buys children's app
   companies, testing §39's wedge, which is the highest-leverage untested
   claim in this plan.
4. **Generalise the measurement harness** to run against an app the authors
   did not write. This is the smallest artefact that is independently
   valuable and it converts the whole proposition from description to
   demonstration.
5. **Run it against three real apps** — with permission — and see what it
   finds. If it finds nothing interesting, that is the most important
   negative result available and it arrives in week six.
6. **Pay someone to attack the core.** Shared with Part IV's sequence,
   because it is the same week of work and both businesses need it.

Nothing on this list requires funding, a hire, or a line of the game to
change. Every item produces information that could stop the plan, which is
the property a first ninety days should have.
