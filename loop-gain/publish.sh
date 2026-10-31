#!/bin/sh
# Copy the piece into docs/ so GitHub Pages serves it at
# https://jhighman.github.io/j-lex-space/loop-gain/ . Pages builds from
# docs/ on main. Paths are kept so index.html needs no edits. Run from the
# repository root after any change to the piece, then commit docs/.
set -e
mkdir -p docs/loop-gain docs/the-unframeable-now/lab
cp loop-gain/index.html loop-gain/plate.js loop-gain/lenses.js loop-gain/README.md docs/loop-gain/
cp the-unframeable-now/lab/model.js docs/the-unframeable-now/lab/
# the paper and the thesis as PDFs, for links from the video
for f in paper thesis; do
  pandoc "loop-gain/$f.md" -o "docs/loop-gain/$f.pdf" --pdf-engine=xelatex -V mainfont="Helvetica Neue" -V monofont="Menlo" -V geometry:margin=2.4cm -V fontsize=11pt 2>/dev/null || echo "pandoc failed on $f"
done
echo "staged: $(ls docs/loop-gain | tr '\n' ' ')+ model.js"
