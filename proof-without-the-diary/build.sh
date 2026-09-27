#!/usr/bin/env bash
# Build part three. One section, so this is mostly pandoc with the series'
# metadata attached.
#
#   ./build.sh                    # docx and pdf of part three
#   ./build.sh docx
#   ./build.sh variant alexandra   # a variant from variants/, docx and pdf
set -euo pipefail
cd "$(dirname "$0")"

OUT="${OUT_DIR:-dist}"
DOCX="${OUT}/Proof-without-the-diary.docx"
PDF="${OUT}/Proof-without-the-diary.pdf"
SECTIONS=("01-proof-without-the-diary.md")
SUBTITLE="Safeguards and invariants, part three"
AUTHOR="Alexandra Křížová · J Highman"
TITLE="Proof Without the Diary"

# A variant is one file in variants/ standing in for the whole piece. Its own
# title line is inside the file, so the metadata title is dropped rather than
# printed twice.
if [[ "${1:-}" == "variant" ]]; then
  V="${2:?usage: ./build.sh variant <name>   (see variants/)}"
  [[ -f "variants/${V}.md" ]] || { echo "ERROR: no variants/${V}.md" >&2; exit 1; }
  SECTIONS=("variants/${V}.md")
  TITLE="$(sed -n 's/^# //p' "variants/${V}.md" | head -1)"
  TITLE="${TITLE:-${V}}"
  SUBTITLE="${SUBTITLE} — ${V} variant"
  DOCX="${OUT}/Part-three-${V}.docx"
  PDF="${OUT}/Part-three-${V}.pdf"
  set -- all
fi
for s in "${SECTIONS[@]}"; do
  [[ -f "$s" ]] || { echo "ERROR: missing ${s}" >&2; exit 1; }
done

PANDOC="$(command -v pandoc || echo /opt/homebrew/bin/pandoc)"
args=(
  --from=markdown+pipe_tables+grid_tables+smart
  --resource-path=.
  --metadata=title:"${TITLE}"
  --metadata=subtitle:"${SUBTITLE}"
  --metadata=author:"${AUTHOR}"
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
