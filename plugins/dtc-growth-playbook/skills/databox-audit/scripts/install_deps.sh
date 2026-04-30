#!/usr/bin/env bash
# install_deps.sh — One-shot installer for Databox Audit v4 renderer deps.
#
# Installs the two things we can install programmatically:
#   1. pptxgenjs (via `npm install` in this scripts/ folder)
#   2. matplotlib (via pip)
#
# LibreOffice is system-level and is NOT installed by this script. If it's
# missing, this script prints the manual install instructions and continues.
#
# Called by preflight.sh --fix. Can also be run standalone:
#   bash scripts/install_deps.sh

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== databox-audit renderer install ==="
echo "scripts dir: $SCRIPT_DIR"
echo

# ---------------------------------------------------------------------------
# 1. pptxgenjs via npm
# ---------------------------------------------------------------------------
echo "[1/2] Installing pptxgenjs (Node)..."
if command -v npm >/dev/null 2>&1; then
  if (cd "$SCRIPT_DIR" && npm install --silent --no-audit --no-fund); then
    echo "      ok — pptxgenjs installed in $SCRIPT_DIR/node_modules"
  else
    echo "      WARN: npm install failed. Try manually:"
    echo "        cd \"$SCRIPT_DIR\" && npm install"
  fi
else
  echo "      SKIP: npm not on PATH. Install Node.js first:"
  echo "        macOS:  brew install node"
  echo "        Linux:  see https://nodejs.org or your distro's package manager"
fi
echo

# ---------------------------------------------------------------------------
# 2. matplotlib via pip
# ---------------------------------------------------------------------------
echo "[2/2] Installing matplotlib (Python)..."
PY=""
if command -v python3 >/dev/null 2>&1; then
  PY="python3"
elif command -v python >/dev/null 2>&1; then
  PY="python"
fi

if [[ -n "$PY" ]]; then
  # `--break-system-packages` is required on macOS Homebrew Python and on
  # newer Ubuntu/Debian. It's a no-op on systems without PEP-668 enforcement.
  if "$PY" -m pip install --quiet matplotlib --break-system-packages 2>/dev/null; then
    echo "      ok — matplotlib installed via $PY"
  elif "$PY" -m pip install --quiet matplotlib 2>/dev/null; then
    echo "      ok — matplotlib installed via $PY (no --break-system-packages needed)"
  else
    echo "      WARN: pip install failed. Try manually:"
    echo "        $PY -m pip install matplotlib --break-system-packages"
  fi
else
  echo "      SKIP: no python interpreter found. Install Python 3 first."
fi
echo

# ---------------------------------------------------------------------------
# 3. LibreOffice — presence check only, no install attempted.
# ---------------------------------------------------------------------------
echo "[info] Checking LibreOffice..."
if command -v soffice >/dev/null 2>&1 \
   || [[ -x "/Applications/LibreOffice.app/Contents/MacOS/soffice" ]] \
   || command -v libreoffice >/dev/null 2>&1; then
  echo "      ok — LibreOffice present"
else
  echo "      MISSING: LibreOffice headless binary not found."
  if [[ "$(uname -s 2>/dev/null)" == "Darwin" ]]; then
    echo "      Install:"
    echo "        brew install --cask libreoffice"
    echo "        (or download from https://www.libreoffice.org/download/)"
  else
    echo "      Install:"
    echo "        Debian/Ubuntu:  sudo apt-get install libreoffice"
    echo "        Fedora/RHEL:    sudo dnf install libreoffice"
    echo "        Or download from https://www.libreoffice.org/download/"
  fi
fi
echo

echo "=== done ==="
echo "Run 'bash $SCRIPT_DIR/preflight.sh' to verify all deps are now present."
