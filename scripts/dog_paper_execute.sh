#!/bin/bash
set -euo pipefail

# dog_paper_execute.sh - Execute paper trade with mandatory confirmation
# Usage: ./dog_paper_execute.sh <buy|sell> <volume> --confirm
# SAFETY: REQUIRES --confirm flag, max 5% balance, DOGUSD only

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KRAKEN_BIN="${KRAKEN_CLI_BIN:-${SCRIPT_DIR}/../kraken-cli-aarch64-apple-darwin/kraken}"
# Fallback: `kraken` on PATH (official installer puts it there)
if [ ! -x "$KRAKEN_BIN" ]; then KRAKEN_BIN="$(command -v kraken || true)"; fi

SIDE="${1:-}"
VOLUME="${2:-}"
CONFIRM_FLAG="${3:-}"

# Validate inputs
if [[ -z "$SIDE" ]] || [[ -z "$VOLUME" ]]; then
    echo '{"error":"Usage: dog_paper_execute.sh <buy|sell> <volume> --confirm"}' >&2
    exit 1
fi

if [[ "$SIDE" != "buy" && "$SIDE" != "sell" ]]; then
    echo '{"error":"Side must be buy or sell"}' >&2
    exit 1
fi

if ! [[ "$VOLUME" =~ ^[0-9]+(\.[0-9]+)?$ ]]; then
    echo '{"error":"Volume must be a positive number"}' >&2
    exit 1
fi

# MANDATORY confirmation check
if [[ "$CONFIRM_FLAG" != "--confirm" ]]; then
    echo '{"error":"Confirmation required. Add --confirm to execute.","status":"REJECTED"}' >&2
    exit 1
fi

if [[ ! -x "$KRAKEN_BIN" ]]; then
    echo '{"error":"Kraken CLI not found"}' >&2
    exit 1
fi

# Safety: Check position size against paper balance
PAPER_JSON=$("$KRAKEN_BIN" paper status -o json 2>/dev/null || echo '{"balances":{"USD":{"balance":"10000.00"}}}')
TICKER_JSON=$("$KRAKEN_BIN" ticker DOGUSD -o json 2>/dev/null)

# Check 5% limit
EXCEEDS_LIMIT=$(node -e "
const volume = parseFloat(process.argv[1]);
const ticker = JSON.parse(process.argv[2]);
const paper = JSON.parse(process.argv[3]);

const d = ticker.DOGUSD;
const price = parseFloat(d.a[0]); // ask price for buy cost estimate
const cost = volume * price * 1.0026; // include fee
const balance = parseFloat(paper.balances?.USD?.balance || '10000');
const pct = (cost / balance) * 100;

if (pct > 5.0) {
    console.log('EXCEEDS:' + pct.toFixed(2));
} else {
    console.log('OK:' + pct.toFixed(2));
}
" "$VOLUME" "$TICKER_JSON" "$PAPER_JSON")

if [[ "$EXCEEDS_LIMIT" == EXCEEDS:* ]]; then
    PCT="${EXCEEDS_LIMIT#EXCEEDS:}"
    echo "{\"error\":\"Position exceeds 5% limit: ${PCT}% of paper balance\",\"status\":\"REJECTED\"}" >&2
    exit 1
fi

# Execute paper trade
if [[ "$SIDE" == "buy" ]]; then
    "$KRAKEN_BIN" paper buy DOGUSD "$VOLUME" -o json 2>/dev/null
else
    "$KRAKEN_BIN" paper sell DOGUSD "$VOLUME" -o json 2>/dev/null
fi
