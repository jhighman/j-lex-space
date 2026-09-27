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
