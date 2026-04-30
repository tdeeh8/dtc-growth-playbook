#!/usr/bin/env bash
# render_pdf.sh — convert a .pptx to .pdf using LibreOffice headless.
#
# Usage:
#   ./render_pdf.sh <input.pptx> <output.pdf>
#
# Detects:
#   - macOS: /Applications/LibreOffice.app/Contents/MacOS/soffice
#   - Linux / Cowork sandbox: soffice on PATH
#
# Exits 1 with a clear message if LibreOffice is not installed.

set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <input.pptx> <output.pdf>" >&2
  exit 2
fi

INPUT="$1"
OUTPUT="$2"

if [[ ! -f "$INPUT" ]]; then
  echo "ERROR: input file not found: $INPUT" >&2
  exit 2
fi

# ----- Locate soffice -----
SOFFICE=""
if [[ -x "/Applications/LibreOffice.app/Contents/MacOS/soffice" ]]; then
  SOFFICE="/Applications/LibreOffice.app/Contents/MacOS/soffice"
elif command -v soffice >/dev/null 2>&1; then
  SOFFICE="$(command -v soffice)"
elif command -v libreoffice >/dev/null 2>&1; then
  SOFFICE="$(command -v libreoffice)"
fi

if [[ -z "$SOFFICE" ]]; then
  cat >&2 <<EOF
ERROR: LibreOffice not found.

This renderer needs LibreOffice (headless) to convert the intermediate .pptx
to PDF. Install one of the following:

  macOS:  Download from https://www.libreoffice.org/download/download/
          (installs to /Applications/LibreOffice.app)
  macOS:  brew install --cask libreoffice
  Linux:  sudo apt-get install -y libreoffice    (Debian/Ubuntu)
          sudo dnf install -y libreoffice         (Fedora)
          sudo yum install -y libreoffice         (RHEL/CentOS)

Once installed, re-run build_audit_pdf.js.
EOF
  exit 1
fi

# ----- Convert to a temp dir, then move to target -----
# LibreOffice writes <basename>.pdf into --outdir; we need atomic placement.
TMPDIR="$(mktemp -d -t audit-pdf-render.XXXXXX)"
cleanup() { rm -rf "$TMPDIR"; }
trap cleanup EXIT

# --headless: no GUI. Suppress soffice's own stdout chatter.
"$SOFFICE" --headless --norestore --nolockcheck --nologo \
  --convert-to pdf --outdir "$TMPDIR" "$INPUT" >/dev/null

BASE="$(basename "$INPUT")"
BASE="${BASE%.*}"
PRODUCED="$TMPDIR/$BASE.pdf"

if [[ ! -f "$PRODUCED" ]]; then
  echo "ERROR: LibreOffice ran but did not produce $PRODUCED" >&2
  echo "       Try running soffice manually to diagnose:" >&2
  echo "         $SOFFICE --headless --convert-to pdf --outdir <dir> $INPUT" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT")"
mv -f "$PRODUCED" "$OUTPUT"

echo "Wrote PDF: $OUTPUT"
