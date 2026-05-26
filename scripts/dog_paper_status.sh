#!/bin/bash
set -euo pipefail

# dog_paper_status.sh - Get paper trading portfolio status
# Usage: ./dog_paper_status.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KRAKEN_BIN="${SCRIPT_DIR}/../kraken-cli-aarch64-apple-darwin/kraken"

if [[ ! -x "$KRAKEN_BIN" ]]; then
    echo '{"error":"Kraken CLI not found"}' >&2
    exit 1
fi

"$KRAKEN_BIN" paper status -o json 2>/dev/null
