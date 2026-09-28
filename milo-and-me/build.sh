#!/usr/bin/env bash
# Build the Milo & Me paper.
#
#   ./build.sh            # docx and pdf
#   ./build.sh docx
set -euo pipefail
cd "$(dirname "$0")"

OUT="${OUT_DIR:-dist}"
DOCX="${OUT}/Milo-and-Me.docx"
PDF="${OUT}/Milo-and-Me.pdf"
SECTIONS=("01-the-game.md" "02-the-architecture.md" "03-unreal.md" "04-business.md" "05-architecture-as-product.md" "06-research-findings.md" "07-somebody-else-built-it.md" "08-what-playing-it-changed.md")
for s in "${SECTIONS[@]}"; do
  [[ -f "$s" ]] || { echo "ERROR: missing ${s}" >&2; exit 1; }
done

PANDOC="$(command -v pandoc || echo /opt/homebrew/bin/pandoc)"
args=(
  --from=markdown+pipe_tables+grid_tables+smart
  --resource-path=.
  --toc --toc-depth=2
  --metadata=title:"Milo & Me"
  --metadata=subtitle:"A wordless game, its architecture, Unreal, and the business"
  --metadata=author:"J Highman · Alexandra Křížová"
  --metadata=date:"2026-09-27"
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
