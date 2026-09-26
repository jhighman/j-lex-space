# arapahoe-milestone

*ARAPAHOE, Realized* — the milestone document, in its sources. It records
what happened when the blueprint met this bench, what was built from the
reading, what the co-author ruled on 2026-09-26, and what none of it closes.

It lives here for the reason the signal-boundary papers do: a document that
exists only as a file somebody mailed is a document the record cannot
rebuild. Nothing here is a sign-off.

## Building it

```sh
./build.sh            # DOCX into dist/, and PDF where a LaTeX engine exists
./build.sh docx       # DOCX only
OUT_DIR=~/Desktop ./build.sh
```

Needs pandoc. The PDF additionally needs a LaTeX engine — tectonic is
easiest, because it fetches what it needs instead of requiring a full TeX
install. The built `.docx` and `.pdf` are deliberately absent from the tree:
this repository holds that manuscripts are not source, and where a document
appears is a publication decision.

## The diagrams

Six, written as `diagrams/*.mmd` and committed beside their rendered
`*.png`. The PNGs are checked in on purpose, so that `build.sh` works with
pandoc alone and nobody needs a JavaScript toolchain to read the milestone.

To re-render after editing a `.mmd`, point the build at a directory holding
`@mermaid-js/mermaid-cli`:

```sh
npm install @mermaid-js/mermaid-cli          # in some scratch directory
MMDC_PREFIX=/that/directory ./build.sh
```

It drives headless Chrome. `CHROME=/path/to/Chrome` overrides the default
location; the config it needs is generated for the run and removed
afterwards, so no local path is kept in the tree.

## What the sections are

| File | |
|---|---|
| `01-front-matter` | what the document is; the summary |
| `02-where-this-started` | CQD to SOS, and the two corrections that followed |
| `03-the-bench` | this repository, for a reader arriving cold |
| `04-arapahoe` | the blueprint, and what it gets right |
| `05-the-reading` | four of this bench's rules, put to it |
| `06-what-was-built` | the five guards, and the number worth carrying |
| `07-what-the-record-says` | the lopsided columns, per `axiom_zero.py` |
| `08-what-remains` | the substrate, the residue, and what is still owed |
| `08b-rulings` | the co-author's rulings, and the claim they withdrew |
| `09-appendix-the-tree` | how to run everything, and what not to take from it |

The withdrawn claim is worth knowing about before reading section 7: an
earlier issue called five arrivals at the founding-roster question
*independent*, when they share an actor, a record and a process. Section 7
says so in place rather than having been quietly edited, and 08b carries the
correction. It is this bench's own rule — distinctness is not independence —
arriving against a document that states the rule two sections earlier.
