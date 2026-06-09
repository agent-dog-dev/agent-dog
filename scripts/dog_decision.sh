#!/bin/bash
set -euo pipefail

# dog_decision.sh - Compute deterministic decision for DOGUSD
# Usage: ./dog_decision.sh
# Output: JSON {decision, confidence, reasons, flags}
# NO ORDERS EXECUTED - Read only decision engine

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KRAKEN_BIN="${KRAKEN_CLI_BIN:-${SCRIPT_DIR}/../kraken-cli-aarch64-apple-darwin/kraken}"
# Fallback: `kraken` on PATH (official installer puts it there)
if [ ! -x "$KRAKEN_BIN" ]; then KRAKEN_BIN="$(command -v kraken || true)"; fi

if [[ ! -x "$KRAKEN_BIN" ]]; then
    echo '{"error":"Kraken CLI not found"}' >&2
    exit 1
fi

# Fetch ticker data
TICKER_JSON=$("$KRAKEN_BIN" ticker DOGUSD -o json 2>/dev/null)

if [[ -z "$TICKER_JSON" ]] || [[ "$TICKER_JSON" == "{}" ]]; then
    echo '{"error":"Failed to fetch ticker data"}' >&2
    exit 1
fi

# Parse values using node (more reliable than jq)
node -e "
const ticker = JSON.parse(process.argv[1]);
const d = ticker.DOGUSD;

const last = parseFloat(d.c[0]);
const bid = parseFloat(d.b[0]);
const ask = parseFloat(d.a[0]);
const vwap = parseFloat(d.p[0]);
const high = parseFloat(d.h[1]);
const low = parseFloat(d.l[1]);
const volume = parseFloat(d.v[1]);

const spread = ((ask - bid) / last) * 100;
const volatility = ((high - low) / last) * 100;
const rangePosition = ((last - low) / (high - low)) * 100;
const vwapRatio = last / vwap;

let decision = 'HOLD';
let confidence = 50;
const reasons = [];
const flags = [];

// Risk checks
if (spread > 1.0) {
    decision = 'RISK_OFF';
    confidence = 10;
    reasons.push('Spread too wide: ' + spread.toFixed(2) + '%');
    flags.push('HIGH_SPREAD');
}

if (volatility > 15.0) {
    decision = 'RISK_OFF';
    confidence = 10;
    reasons.push('Volatility too high: ' + volatility.toFixed(2) + '%');
    flags.push('HIGH_VOLATILITY');
}

if (rangePosition > 90) {
    decision = 'NO_TRADE';
    confidence = 20;
    reasons.push('Price near range top: ' + rangePosition.toFixed(1) + '%');
    flags.push('NEAR_RANGE_TOP');
}

if (volume < 50000000) {
    flags.push('LOW_VOLUME');
}

if (rangePosition < 15) {
    flags.push('NEAR_LOW');
}

// Buy signal
if (decision === 'HOLD' && vwapRatio > 1.005 && rangePosition >= 35 && rangePosition <= 80) {
    decision = 'WATCH_BUY';
    confidence = Math.min(70 + (vwapRatio - 1) * 1000, 90);
    reasons.push('Price above VWAP with good range position');
}

const result = {
    decision,
    confidence: Math.round(confidence),
    reasons,
    flags,
    metrics: {
        last: last.toFixed(8),
        spread: spread.toFixed(4),
        volatility: volatility.toFixed(4),
        rangePosition: rangePosition.toFixed(2),
        vwapRatio: vwapRatio.toFixed(6),
        volume24h: volume.toFixed(2)
    },
    timestamp: new Date().toISOString()
};

console.log(JSON.stringify(result, null, 2));
" "$TICKER_JSON"
