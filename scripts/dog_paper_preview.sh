#!/bin/bash
set -euo pipefail

# dog_paper_preview.sh - Preview a paper trade (NO EXECUTION)
# Usage: ./dog_paper_preview.sh <buy|sell> <volume>
# Output: JSON preview structuré

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KRAKEN_BIN="${KRAKEN_CLI_BIN:-${SCRIPT_DIR}/../kraken-cli-aarch64-apple-darwin/kraken}"
# Fallback: `kraken` on PATH (official installer puts it there)
if [ ! -x "$KRAKEN_BIN" ]; then KRAKEN_BIN="$(command -v kraken || true)"; fi

SIDE="${1:-}"
VOLUME="${2:-}"

if [[ -z "$SIDE" ]] || [[ -z "$VOLUME" ]]; then
    echo '{"error":"Usage: dog_paper_preview.sh <buy|sell> <volume>"}' >&2
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

if [[ ! -x "$KRAKEN_BIN" ]]; then
    echo '{"error":"Kraken CLI not found"}' >&2
    exit 1
fi

# Fetch ticker and paper status
TICKER_JSON=$("$KRAKEN_BIN" ticker DOGUSD -o json 2>/dev/null)
PAPER_JSON=$("$KRAKEN_BIN" paper status -o json 2>/dev/null || echo '{"balances":{"USD":{"balance":"10000.00"}}}')

node -e "
const side = process.argv[1];
const volume = parseFloat(process.argv[2]);
const ticker = JSON.parse(process.argv[3]);
const paper = JSON.parse(process.argv[4]);

const d = ticker.DOGUSD;
const ask = parseFloat(d.a[0]);
const bid = parseFloat(d.b[0]);
const price = side === 'buy' ? ask : bid;

const cost = volume * price;
const fee = cost * 0.0026; // Kraken taker fee
const total = cost + fee;

const usdBalance = parseFloat(paper.balances?.USD?.balance || '10000');
const percentOfBalance = (total / usdBalance) * 100;

// Risk check: max 5% per trade
let riskVerdict = 'OK';
if (percentOfBalance > 5.0) {
    riskVerdict = 'OVERSIZE: exceeds 5% of paper balance';
}

const preview = {
    side: side.toUpperCase(),
    pair: 'DOGUSD',
    volume: volume.toFixed(8),
    price: price.toFixed(8),
    estimatedCost: cost.toFixed(4),
    estimatedFee: fee.toFixed(4),
    totalNotional: total.toFixed(4),
    percentOfBalance: percentOfBalance.toFixed(2),
    paperBalance: usdBalance.toFixed(2),
    riskVerdict,
    note: 'PREVIEW ONLY - No order executed',
    requiresConfirmation: true,
    timestamp: new Date().toISOString()
};

console.log(JSON.stringify(preview, null, 2));
" "$SIDE" "$VOLUME" "$TICKER_JSON" "$PAPER_JSON"
