# Milo & Me — the paper

Four parts in one document:

1. **The game** — what a four-year-old does, and why each mechanic exists.
2. **The architecture** — the record, the four enforced properties, the
   parent surface, and a full list of what is unproven.
3. **Unreal** — what ports, what breaks, and the supply-chain problem that
   changes in kind rather than in size.
4. **The business** — three paths, a recommended order, costs, risks, and
   the four things that would have to be true.

## Two things stated up front, because they shape everything

**No child has played this game.** Every judgement about legibility,
frustration or delight is the authors' imagination.

**No market figures in Part IV were researched.** None were available, and
inventing plausible ones would be the exact failure the rest of the document
argues against. Quantities appear as named assumptions with a note on how to
test each cheaply.

## Building

    ./build.sh          # docx + pdf into dist/
    ./build.sh docx
