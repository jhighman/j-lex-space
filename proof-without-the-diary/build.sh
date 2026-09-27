#!/usr/bin/env bash
# Build part three. One section, so this is mostly pandoc with the series'
# metadata attached.
#
#   ./build.sh            # docx and pdf
#   ./build.sh docx
set -euo pipefail
cd "$(dirname "$0")"

OUT="${OUT_DIR:-dist}"
DOCX="${OUT}/Proof-without-the-diary.docx"
PDF="${OUT}/Proof-without-the-diary.pdf"
SECTIONS=("01-proof-without-the-diary.md")
for s in "${SECTIONS[@]}"; do
  [[ -f "$s" ]] || { echo "ERROR: missing ${s}" >&2; exit 1; }
done

PANDOC="$(command -v pandoc || echo /opt/homebrew/bin/pandoc)"
args=(
  --from=markdown+pipe_tables+grid_tables+smart
  --resource-path=.
  --metadata=title:"Proof Without the Diary"
  --metadata=subtitle:"Safeguards and invariants, part three"
  --metadata=author:"Alexandra Křížová · J Highman"
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
