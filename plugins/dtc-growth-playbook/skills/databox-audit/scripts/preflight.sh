#!/usr/bin/env bash
# preflight.sh — Databox Audit v4 renderer dependency check.
#
# Verifies that the four runtime deps required by Step 1.8 are present:
#   1. node (CLI)
#   2. pptxgenjs (Node module — bundled via `npm install` in scripts/)
#   3. LibreOffice headless binary (system install)
#   4. matplotlib (Python module — for chart generation)
#
# Exit codes:
#   0  all deps present
#   1  one or more deps missing (caller should STOP and surface to user)
#   2  invocation error (bad flag, etc.)
#
# Flags:
#   --fix      attempt to auto-install missing deps (calls install_deps.sh).
#              LibreOffice is system-level and won't be auto-installed —
#              the script prints the manual install path.
#   --quiet    suppress per-check lines; only print the final summary
#   --json     machine-readable output (for the skill to parse). Implies --quiet.
#
# Usage:
#   bash scripts/preflight.sh
#   bash scripts/preflight.sh --fix
#   bash scripts/preflight.sh --json

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

QUIET=0
JSON=0
FIX=0

for arg in "$@"; do
  case "$arg" in
    --fix)   FIX=1 ;;
    --quiet) QUIET=1 ;;
    --json)  JSON=1; QUIET=1 ;;
    -h|--help)
      cat <<'EOF'
preflight.sh — Databox Audit renderer dependency check.

Usage:
  bash scripts/preflight.sh           # check + print report
  bash scripts/preflight.sh --fix     # check + auto-install missing deps
  bash scripts/preflight.sh --json    # machine-readable output

Exit codes: 0 ok, 1 missing deps, 2 invocation error.
EOF
      exit 0
      ;;
    *)
      echo "unknown arg: $arg" >&2
      exit 2
      ;;
  esac
done

# ---------------------------------------------------------------------------
# Per-check results. Each check sets STATUS_<name> to PASS or FAIL,
# DETAIL_<name> to a one-line human-readable detail (version or error),
# and FIX_<name> to the exact remediation command.
# ---------------------------------------------------------------------------

check_node() {
  if command -v node >/dev/null 2>&1; then
    STATUS_node="PASS"
    DETAIL_node="$(node --version 2>/dev/null || echo present)"
  else
    STATUS_node="FAIL"
    DETAIL_node="node not found on PATH"
    FIX_node="install Node.js from https://nodejs.org (or 'brew install node' on macOS)"
  fi
}

check_pptxgenjs() {
  # Three accepted locations, in order of preference:
  #   1. scripts/node_modules/pptxgenjs       (preferred — local install)
  #   2. ../node_modules/pptxgenjs            (sibling of scripts/)
  #   3. globally-installed via npm           (fallback)
  if [[ -d "$SCRIPT_DIR/node_modules/pptxgenjs" ]]; then
    STATUS_pptx="PASS"
    DETAIL_pptx="local install (scripts/node_modules)"
  elif [[ -d "$SCRIPT_DIR/../node_modules/pptxgenjs" ]]; then
    STATUS_pptx="PASS"
    DETAIL_pptx="parent install"
  elif command -v node >/dev/null 2>&1 && node -e 'require("pptxgenjs")' >/dev/null 2>&1; then
    STATUS_pptx="PASS"
    DETAIL_pptx="global install"
  else
    STATUS_pptx="FAIL"
    DETAIL_pptx="pptxgenjs Node module not installed"
    FIX_pptx="cd \"$SCRIPT_DIR\" && npm install"
  fi
}

check_libreoffice() {
  # Resolution order matches render_pdf.sh:
  #   1. soffice on PATH (Linux + most installs)
  #   2. macOS bundle path
  #   3. libreoffice on PATH (some Linux distros)
  if command -v soffice >/dev/null 2>&1; then
    STATUS_lo="PASS"
    DETAIL_lo="$(command -v soffice)"
  elif [[ -x "/Applications/LibreOffice.app/Contents/MacOS/soffice" ]]; then
    STATUS_lo="PASS"
    DETAIL_lo="/Applications/LibreOffice.app/Contents/MacOS/soffice"
  elif command -v libreoffice >/dev/null 2>&1; then
    STATUS_lo="PASS"
    DETAIL_lo="$(command -v libreoffice)"
  else
    STATUS_lo="FAIL"
    DETAIL_lo="LibreOffice headless binary not found"
    # macOS gets the brew cask hint; everything else gets a generic pointer.
    if [[ "$(uname -s 2>/dev/null)" == "Darwin" ]]; then
      FIX_lo="brew install --cask libreoffice  (or download from libreoffice.org)"
    else
      FIX_lo="install LibreOffice (e.g. 'apt-get install libreoffice' on Debian/Ubuntu) or download from libreoffice.org"
    fi
  fi
}

check_matplotlib() {
  # Try python3 first, fall back to python. Both are accepted because
  # generate_charts.py uses whichever is on PATH.
  local py=""
  if command -v python3 >/dev/null 2>&1; then
    py="python3"
  elif command -v python >/dev/null 2>&1; then
    py="python"
  fi

  if [[ -z "$py" ]]; then
    STATUS_mpl="FAIL"
    DETAIL_mpl="no python interpreter found"
    FIX_mpl="install Python 3, then: pip install matplotlib --break-system-packages"
    return
  fi

  if "$py" -c 'import matplotlib' >/dev/null 2>&1; then
    local ver
    ver="$("$py" -c 'import matplotlib; print(matplotlib.__version__)' 2>/dev/null || echo present)"
    STATUS_mpl="PASS"
    DETAIL_mpl="$py / matplotlib $ver"
  else
    STATUS_mpl="FAIL"
    DETAIL_mpl="matplotlib not importable from $py"
    FIX_mpl="$py -m pip install matplotlib --break-system-packages"
  fi
}

# ---------------------------------------------------------------------------
# Run all four checks.
# ---------------------------------------------------------------------------
STATUS_node=""; DETAIL_node=""; FIX_node=""
STATUS_pptx=""; DETAIL_pptx=""; FIX_pptx=""
STATUS_lo="";   DETAIL_lo="";   FIX_lo=""
STATUS_mpl="";  DETAIL_mpl="";  FIX_mpl=""

check_node
check_pptxgenjs
check_libreoffice
check_matplotlib

# ---------------------------------------------------------------------------
# Optional --fix pass: try to install the things we can install ourselves.
# LibreOffice is system-level and intentionally NOT auto-installed.
# ---------------------------------------------------------------------------
if [[ $FIX -eq 1 ]]; then
  if [[ "$STATUS_pptx" == "FAIL" || "$STATUS_mpl" == "FAIL" ]]; then
    if [[ -x "$SCRIPT_DIR/install_deps.sh" ]]; then
      [[ $QUIET -eq 0 ]] && echo "running install_deps.sh ..."
      bash "$SCRIPT_DIR/install_deps.sh" || true
      # Re-run the two installable checks.
      check_pptxgenjs
      check_matplotlib
    else
      [[ $QUIET -eq 0 ]] && echo "install_deps.sh not found at $SCRIPT_DIR/install_deps.sh — skipping --fix"
    fi
  fi
fi

# ---------------------------------------------------------------------------
# Render report.
# ---------------------------------------------------------------------------
overall=0
for s in "$STATUS_node" "$STATUS_pptx" "$STATUS_lo" "$STATUS_mpl"; do
  [[ "$s" == "FAIL" ]] && overall=1
done

if [[ $JSON -eq 1 ]]; then
  # Compact one-line JSON, no jq dependency.
  printf '{"node":{"status":"%s","detail":"%s","fix":"%s"},' \
    "$STATUS_node" "$DETAIL_node" "${FIX_node//\"/\\\"}"
  printf '"pptxgenjs":{"status":"%s","detail":"%s","fix":"%s"},' \
    "$STATUS_pptx" "$DETAIL_pptx" "${FIX_pptx//\"/\\\"}"
  printf '"libreoffice":{"status":"%s","detail":"%s","fix":"%s"},' \
    "$STATUS_lo" "$DETAIL_lo" "${FIX_lo//\"/\\\"}"
  printf '"matplotlib":{"status":"%s","detail":"%s","fix":"%s"},' \
    "$STATUS_mpl" "$DETAIL_mpl" "${FIX_mpl//\"/\\\"}"
  printf '"overall":"%s"}\n' "$([[ $overall -eq 0 ]] && echo PASS || echo FAIL)"
  exit $overall
fi

if [[ $QUIET -eq 0 ]]; then
  printf '%-20s %-6s %s\n' "node"        "$STATUS_node" "$DETAIL_node"
  printf '%-20s %-6s %s\n' "pptxgenjs"   "$STATUS_pptx" "$DETAIL_pptx"
  printf '%-20s %-6s %s\n' "LibreOffice" "$STATUS_lo"   "$DETAIL_lo"
  printf '%-20s %-6s %s\n' "matplotlib"  "$STATUS_mpl"  "$DETAIL_mpl"
  echo
fi

if [[ $overall -eq 0 ]]; then
  [[ $QUIET -eq 0 ]] && echo "preflight: ALL DEPENDENCIES PRESENT — renderer can run."
  exit 0
fi

# Print remediation block. This is the section the model surfaces to the user.
echo "preflight: MISSING DEPENDENCIES — the PDF renderer cannot run."
echo
echo "Run these commands to fix:"
[[ "$STATUS_node" == "FAIL" ]] && echo "  - node:        $FIX_node"
[[ "$STATUS_pptx" == "FAIL" ]] && echo "  - pptxgenjs:   $FIX_pptx"
[[ "$STATUS_lo"   == "FAIL" ]] && echo "  - LibreOffice: $FIX_lo"
[[ "$STATUS_mpl"  == "FAIL" ]] && echo "  - matplotlib:  $FIX_mpl"
echo
echo "Or run:  bash $SCRIPT_DIR/preflight.sh --fix"
echo "(will install pptxgenjs + matplotlib automatically; LibreOffice is system-level and must be installed manually)"

exit 1
