#!/bin/bash
set -euo pipefail

# dog_ticker.sh - Get DOGUSD ticker from Kraken CLI
# Usage: ./dog_ticker.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KRAKEN_BIN="${SCRIPT_DIR}/../kraken-cli-aarch64-apple-darwin/kraken"

if [[ ! -x "$KRAKEN_BIN" ]]; then
    echo '{"error":"Kraken CLI not found"}' >&2
    exit 1
fi

"$KRAKEN_BIN" ticker DOGUSD -o json 2>/dev/null
