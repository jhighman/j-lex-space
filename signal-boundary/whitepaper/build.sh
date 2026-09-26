#!/usr/bin/env bash
# Build the signal boundary white paper into DOCX and PDF from the markdown
# sources in this folder.
#
# Output:
#   dist/remove-the-seam.docx
#   dist/remove-the-seam.pdf
#
# Dependencies: pandoc 3.x (`brew install pandoc`). For PDF, a LaTeX engine —
# tectonic is preferred (`brew install tectonic`) because it fetches what it
# needs rather than requiring a full TeX install.
#
# Usage:
#   ./build.sh          # builds both
#   ./build.sh docx     # docx only
#   ./build.sh pdf      # pdf only

set -euo pipefail
cd "$(dirname "$0")"

OUT_DIR="dist"
DOCX_OUT="${OUT_DIR}/remove-the-seam.docx"
PDF_OUT="${OUT_DIR}/remove-the-seam.pdf"
mkdir -p "${OUT_DIR}"

SECTIONS=(
  "01-front-matter.md"
  "02-two-protocols.md"
  "03-what-atomicity-buys.md"
  "04-the-specification.md"
  "05-what-the-runtime-guarantees.md"
  "06-why-not-metaprogramming.md"
  "06b-the-hardened-specification.md"
  "07-where-the-boundary-lives.md"
  "08-implications-for-safety-harnesses.md"
  "09-what-must-be-true.md"
  "10-appendix-a-transcript.md"
  "11-appendix-b-glossary.md"
  "12-appendix-c-revision-history.md"
)

for section in "${SECTIONS[@]}"; do
  if [[ ! -f "${section}" ]]; then
    echo "ERROR: missing source file ${section}" >&2
    exit 1
  fi
done

PANDOC="$(command -v pandoc || true)"
if [[ -z "${PANDOC}" && -x /opt/homebrew/bin/pandoc ]]; then
  PANDOC=/opt/homebrew/bin/pandoc
fi
if [[ -z "${PANDOC}" ]]; then
  echo "ERROR: pandoc not found. Install with: brew install pandoc" >&2
  exit 1
fi

TITLE="Remove the Seam"
SUBTITLE="From CQD to SOS — why a safety boundary must be structural, and where it actually lives"
AUTHOR="J Highman"
DATE="2026-09-24 · Draft for review"

common_args=(
  --from=markdown+pipe_tables+grid_tables+smart
  --toc --toc-depth=2
  --metadata=title:"${TITLE}"
  --metadata=subtitle:"${SUBTITLE}"
  --metadata=author:"${AUTHOR}"
  --metadata=date:"${DATE}"
)

build_docx() {
  echo "Building ${DOCX_OUT}…"
  "${PANDOC}" "${common_args[@]}" --to=docx \
    --output="${DOCX_OUT}" "${SECTIONS[@]}"
  echo "✔ ${DOCX_OUT} ($(($(wc -c < "${DOCX_OUT}") / 1024)) KB)"
}

build_pdf() {
  local engine=""
  for candidate in tectonic xelatex pdflatex; do
    if command -v "${candidate}" >/dev/null 2>&1; then engine="${candidate}"; break; fi
  done
  if [[ -z "${engine}" ]]; then
    echo "⚠ No LaTeX engine found — skipping PDF. Install with: brew install tectonic" >&2
    return 0
  fi
  echo "Building ${PDF_OUT} with ${engine}…"
  "${PANDOC}" "${common_args[@]}" --to=pdf \
    --pdf-engine="${engine}" \
    -V documentclass=article -V papersize=a4 -V fontsize=11pt \
    -V geometry:margin=1in -V linkcolor=blue -V colorlinks=true \
    --output="${PDF_OUT}" "${SECTIONS[@]}"
  echo "✔ ${PDF_OUT} ($(($(wc -c < "${PDF_OUT}") / 1024)) KB)"
}

case "${1:-all}" in
  docx) build_docx ;;
  pdf)  build_pdf ;;
  all)  build_docx; build_pdf ;;
  *)    echo "Usage: ./build.sh [docx|pdf|all]" >&2; exit 1 ;;
esac
