# Variants

Alternative treatments of part three. Same findings, same numbers, different
register — for choosing a voice, not for publishing in parallel.

- `levy.md` — long-form technology-magazine reportage. Leads on the
  ninety-nine missing refusals as a scene, uses the children's game as the
  pivot rather than as an appendix, and carries the argument through concrete
  artefacts instead of definitions.

## A note on what is not in here

This register normally runs on interviews: quoted dialogue, described rooms,
the writer in the story. None of that has been invented. Everything
attributed to Alexandra Křížová is from her published essays; everything
attributed to the software is from its source, its tests or its output. There
are no reconstructed scenes and no quotes that were not written down by the
person they belong to.

If the piece is ever placed somewhere that expects reporting, the interviews
have to actually happen first.

## Building

    pandoc -f markdown+smart -t docx levy.md -o ../dist/Levy-ninety-nine-refusals.docx
