#!/bin/bash
set -euo pipefail

# dog_ohlc.sh - Get DOGUSD OHLC from Kraken CLI
# Usage: ./dog_ohlc.sh [interval]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KRAKEN_BIN="${KRAKEN_CLI_BIN:-${SCRIPT_DIR}/../kraken-cli-aarch64-apple-darwin/kraken}"
# Fallback: `kraken` on PATH (official installer puts it there)
if [ ! -x "$KRAKEN_BIN" ]; then KRAKEN_BIN="$(command -v kraken || true)"; fi
INTERVAL="${1:-60}"

if [[ ! -x "$KRAKEN_BIN" ]]; then
    echo '{"error":"Kraken CLI not found"}' >&2
    exit 1
fi

"$KRAKEN_BIN" ohlc DOGUSD --interval "$INTERVAL" -o json 2>/dev/null
