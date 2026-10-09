# Milo & Me — the paper

Four parts in one document:

1. **The game** — what a four-year-old does, and why each mechanic exists.
2. **The architecture** — the record, the four enforced properties, the
   parent surface, and a full list of what is unproven.
3. **Unreal** — what ports, what breaks, and the supply-chain problem that
   changes in kind rather than in size.
4. **The business** — the regulatory position, a benchmarked comparable,
   three re-weighted paths, costs, and risks in order of lethality.
5. **The architecture as a product** — Part IV's strongest path, taken
   apart: what is sold, which layer retrofits and which cannot, the
   competition without flattery, and a first ninety days in which every
   item can stop the plan.
6. **Research, and what it breaks** — the market check that should have
   preceded Part V. Its wedge does not exist. Parts IV and V are left
   standing as written and this part records what they got wrong, because
   a plan edited to look correct afterwards teaches nobody anything.
7. **Somebody else built the door** — NVIDIA's agent safety platform,
   arrived at independently, and a correction: a paragraph about a gap that
   was not there, caught by reading the system instead of the page about it.

## Two things stated up front

**No child has played this game.** Every judgement about legibility,
frustration or delight is the authors' imagination, and Part IV is
conditional on that changing.

**Part IV's central finding is negative.** The first draft assumed parents
would pay for verifiable non-extraction. Published research says privacy is
not a priority for parents choosing children's apps, and that they are
reluctant to pay for good apps at all. The section is rebuilt around the
consequence: the customer for demonstrable non-extraction is the operator
facing $53,088 per violation, not the parent.

Figures in Part IV are sourced and linked — COPPA's 2025 amendments and
April 2026 deadline, the ICO's £14.47m Reddit fine, DSA exposure, kidSAFE
certification counts, and Pok Pok's funding and revenue as the closest
working comparable.

## Building

    ./build.sh          # docx + pdf into dist/
    ./build.sh docx

## Part VIII

`08-what-playing-it-changed.md` is the account of the first afternoon
anybody played the thing. It supersedes two sections of Part I and overturns
one of the authorities in Part II, and it is kept as a new part rather than
folded back in, so a reader can see which claims were argued with and which
were never noticed.

The finding under all of it: the repository is full of checks that the code
matches what was written down, and **none of them can report that what was
written down is wrong.**
