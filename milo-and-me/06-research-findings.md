# Part VI — Research, and what it breaks

Part V is left standing as written. This part records what the research
found and what it changes, because a plan edited to look correct afterwards
teaches nobody anything.

**The headline: Part V's wedge does not exist.**

## 42. Tier 1 is an occupied category

Part V proposed leading with measurement — "sell measurement to anybody,
today" — on the reasoning that it retrofits without touching the operator's
architecture. That reasoning holds. The market conclusion does not.

There is an established commercial category doing this:

| | what it does |
|---|---|
| **[Privado AI](https://www.privado.ai/solutions/mobile-app-privacy)** | scans apps before each update, SDK governance that blocks non-compliant SDKs pre-release, automates the App Store / Play privacy reports |
| **[NowSecure](https://www.nowsecure.com/)** | analyses compiled binaries on real devices; surfaces SDKs, data flows, hidden AI |
| **[Vault](https://vaultjs.com/platform/enterprise-global/mobile/)** | captures and analyses all network traffic; identifies what data is collected and where it goes |
| **[Exodus Privacy](https://exodus-privacy.eu.org/)** | free, open tracker and SDK inventory |
| **[AppCensus](https://blog.appcensus.io/2018/05/08/our-childrens-apps-arent-directed-at-children/)** | research-grade dynamic analysis built specifically for COPPA; its team's study found a majority of children's Android apps appeared to be violating the Rule |

So the proposed wedge is not an opening. It is a category with funded
incumbents, a free open-source option at the bottom, and an academically
credentialed specialist *in exactly the children's-privacy niche* — and this
project would enter it last, with nothing built, no distribution, and no
reference customer.

**Part V's §39 sales motion should be considered withdrawn.** The reasoning
that produced it was sound and the market check that should have preceded it
was not done.

## 43. What survives that finding, and it is thin

The incumbents are **network-centric**. They answer *what does this app send,
and to whom.*

The amended COPPA Rule's newly effective obligations include something
different: **retention limits and a published retention schedule barring
indefinite storage.** That is an at-rest question — what does this app
*keep*, on the device, and does the published schedule match — and it does
not appear to be what the scanning category measures.

That sliver is real. It is also, honestly, **a feature and not a company.**
Any of the five above could add a device-walk in a quarter, and they have the
distribution to make it matter and this project does not.

## 44. The construction position is unoccupied, and that may be the problem

Nobody commercial appears to sell what Parts II and V actually describe:
properties enforced by construction, with the compliance documents
*generated from the running system* and a test that fails the build when
they drift.

Before treating that as a gap, note what surrounds it:

- **Privacy by design has been endorsed since 1995** (Cavoukian), is written
  into the GDPR, and is universally agreed to be correct
  ([overview](https://en.wikipedia.org/wiki/Privacy_by_design)).
- **Formal tools to verify data minimisation in an architecture already
  exist** — DataProVe, CAPVerDE and related work verify conformance between
  a stated policy and a system architecture automatically
  ([survey](https://arxiv.org/pdf/1903.11092)).
- Neither has produced a product market in thirty years.

**Thirty years of endorsement without adoption is evidence about incentives,
not an unexploited gap.** The charitable reading is that enforcement has only
just arrived and the economics have changed. The uncharitable reading — that
operators will always prefer the cheapest artefact that satisfies an
assessor, and construction is never the cheapest — has three decades of
support.

This is now the central uncertainty of the whole business, ahead of anything
in Part V's §40.

## 45. The diligence wedge: real, but not what was claimed

Part V called acquirer diligence "the strongest wedge in the whole plan."
The research qualifies that in both directions.

**It is real.** Privacy diligence is established practice in technology M&A,
treated as deal-defining rather than a checkbox, and children's data is
explicitly flagged as carrying added risk and value impact
([VeraSafe](https://verasafe.com/blog/the-critical-role-of-privacy-due-diligence-in-ma-success/);
[Loeb &
Loeb](https://www.loeb.com/en/insights/publications/2022/02/data-privacy-and-security-considerations-in-ma-transactions)).

**But it is documentary.** The described practice is *requesting* data flows,
retention policies and sub-processor lists from the target. It is run by law
firms and privacy consultancies, and it asks the target for paperwork rather
than measuring the software.

Which means the gap is genuine — **nobody runs the app** — but the route to
it is not direct sales. It is a partnership with firms that already own the
relationship and the budget line, selling a technical annex into their
process. That is a slower, smaller and less independent business than §39
implied, and it is episodic: deal-driven, not recurring.

## 46. Still unknown, after looking

**Pricing.** Neither kidSAFE nor PRIVO publish fees; both route enquiries to
sales. A [2022 kidSAFE programme overview with pricing
charts](https://www.scribd.com/document/748772716/kidSAFE-Seal-Program-Overview-starting-May-2022-5-19-22C-with-pricing-charts)
exists but was not retrievable. This remains a one-email question and it is
still item one.

**Whether eight certified products means gap or preference.** Unresolved,
and §44 now makes the pessimistic reading more plausible than it looked.

## 47. What this changes

1. **Do not build a scanner.** The category is occupied by better-resourced
   specialists and the only unserved sliver is a feature they can absorb.
2. **The asset is the reference implementation, not a tool.** What this
   project uniquely has is a *working* system where the claims are
   structural and the documents cannot drift — and a public record of the
   failures that produced it, which is worth more than the code.
3. **The most defensible form is probably a standard, openly published**,
   with the conformance suite as the artefact. That is a credibility and
   influence asset. It may be a consulting business. It is not obviously a
   software business.
4. **The strongest commercial thesis left is Part IV's Path A** — ship a
   good game — with the architecture as the reason it can be trusted rather
   than the thing being sold. That is a reversal of Part IV's own
   conclusion, arrived at by checking it.
5. **The ninety days should be reordered.** Items 4 and 5 — generalise the
   harness, run it against three apps — were the largest investment on the
   list and are now the least justified. The conversations, which cost
   days, are the whole of what should happen first.

## 48. The honest position after research

Part IV concluded the customer was the operator rather than the parent. That
still holds on the evidence about parents.

What Part V then assumed — that reaching the operator was open ground — was
not checked, and is wrong. The measurement route is crowded, the construction
route is thirty years old and unadopted, and the diligence route runs through
somebody else's relationship.

**None of that makes the architecture less good.** It makes it less
obviously a company. The most likely honest outcome is that this work's value
is as a published reference and a credential — and that the thing to sell,
if anything is sold, is the game.
