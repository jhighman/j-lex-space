#!/usr/bin/env bash
# Build the ARAPAHOE milestone document. Renders the mermaid sources to PNG,
# then assembles the DOCX (and a PDF where a LaTeX engine is available).
#
#   ./build.sh            # both
#   ./build.sh docx       # docx only
set -euo pipefail
cd "$(dirname "$0")"

OUT="${OUT_DIR:-dist}"
DOCX="${OUT}/Arapahoe-realized.docx"
PDF="${OUT}/Arapahoe-realized.pdf"

SECTIONS=(
  "01-front-matter.md" "02-where-this-started.md" "03-the-bench.md"
  "04-arapahoe.md" "05-the-reading.md" "06-what-was-built.md"
  "07-what-the-record-says.md" "08-what-remains.md"
  "08b-rulings.md"
  "08c-the-warren.md"
  "09-appendix-the-tree.md"
)
for s in "${SECTIONS[@]}"; do
  [[ -f "$s" ]] || { echo "ERROR: missing ${s}" >&2; exit 1; }
done

# Diagrams. The rendered PNGs are committed so this builds with pandoc
# alone; set MMDC_PREFIX to a directory holding @mermaid-js/mermaid-cli to
# re-render them from the .mmd sources beside them.
if [[ -n "${MMDC_PREFIX:-}" ]]; then
  CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
  cat > diagrams/puppeteer.json <<JSON
{ "executablePath": "${CHROME}", "args": ["--no-sandbox"] }
JSON
  for m in diagrams/*.mmd; do
    npx --prefix "${MMDC_PREFIX}" mmdc -i "$m" -o "${m%.mmd}.png" \
        -p diagrams/puppeteer.json -b white -s 3 >/dev/null 2>&1
  done
  rm -f diagrams/puppeteer.json
fi
for m in diagrams/*.mmd; do
  [[ -f "${m%.mmd}.png" ]] || { echo "ERROR: ${m%.mmd}.png not rendered" >&2; exit 1; }
done

PANDOC="$(command -v pandoc || echo /opt/homebrew/bin/pandoc)"
TITLE="ARAPAHOE, Realized"
SUBTITLE="A governed transaction lifecycle, read against a bench and then built"
AUTHOR="J Highman · Lex"
DATE="2026-09-26 · Milestone"

args=(
  --from=markdown+pipe_tables+grid_tables+smart
  --toc --toc-depth=2 --resource-path=.
  --metadata=title:"${TITLE}" --metadata=subtitle:"${SUBTITLE}"
  --metadata=author:"${AUTHOR}" --metadata=date:"${DATE}"
)

mkdir -p "${OUT}"
case "${1:-all}" in
  docx|all)
    "${PANDOC}" "${args[@]}" --to=docx --output="${DOCX}" "${SECTIONS[@]}"
    echo "✔ ${DOCX} ($(($(wc -c < "${DOCX}") / 1024)) KB)" ;;
esac
if [[ "${1:-all}" == "all" || "${1:-all}" == "pdf" ]]; then
  for e in tectonic xelatex pdflatex; do command -v "$e" >/dev/null && ENGINE="$e" && break; done
  if [[ -n "${ENGINE:-}" ]]; then
    "${PANDOC}" "${args[@]}" --to=pdf --pdf-engine="${ENGINE}" \
      -V papersize=a4 -V fontsize=11pt -V geometry:margin=1in \
      -V colorlinks=true -V linkcolor=blue --output="${PDF}" "${SECTIONS[@]}"
    echo "✔ ${PDF} ($(($(wc -c < "${PDF}") / 1024)) KB)"
  else
    echo "⚠ no LaTeX engine; skipped PDF" >&2
  fi
fi
