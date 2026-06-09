#!/bin/bash
set -euo pipefail

# agent_dog_demo.sh — Agent DOG Kraken CLI Agent Demo
# Four roles. One pack. Zero risk.
# READ-ONLY / PREVIEW ONLY — No orders executed

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KRAKEN_BIN="${KRAKEN_CLI_BIN:-${SCRIPT_DIR}/../kraken-cli-aarch64-apple-darwin/kraken}"
# Fallback: `kraken` on PATH (official installer puts it there)
if [ ! -x "$KRAKEN_BIN" ]; then KRAKEN_BIN="$(command -v kraken || true)"; fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  AGENT DOG — KRAKEN CLI AGENT DEMO                            ║"
echo "║  Four roles. One pack. Zero risk.                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check Kraken CLI
if [[ ! -x "$KRAKEN_BIN" ]]; then
    echo "❌ Kraken CLI not found"
    exit 1
fi

echo "▶ Kraken CLI: $($KRAKEN_BIN --version)"
echo "▶ Mode: PAPER ONLY / NO LIVE TRADING"
echo "▶ Pair: DOGUSD (Bitcoin Runes, not Dogecoin)"
echo ""
sleep 1

# ═════════════════════════════════════════════════════════════════
# [BEACON] — Market Intelligence
# ═════════════════════════════════════════════════════════════════
echo ""
echo "┌─────────────────────────────────────────────────────────────────┐"
echo "│ [BEACON] 🐕  MARKET INTELLIGENCE                                 │"
echo "│ First into the field. Reports what it sees.                     │"
echo "└─────────────────────────────────────────────────────────────────┘"
echo ""

echo "▶ Fetching DOGUSD ticker..."
TICKER_JSON=$("$KRAKEN_BIN" ticker DOGUSD -o json 2>/dev/null)
if [[ -n "$TICKER_JSON" ]]; then
    echo "$TICKER_JSON" | head -c 500
    echo "..."
else
    echo "⚠️  Could not fetch ticker"
fi
echo ""

echo "▶ Fetching DOGUSD orderbook (top 5)..."
"$KRAKEN_BIN" orderbook DOGUSD --count 5 -o json 2>/dev/null | head -c 400
echo "..."
echo ""

sleep 1

# ═════════════════════════════════════════════════════════════════
# [COMPASS] — Decision Engine
# ═════════════════════════════════════════════════════════════════
echo ""
echo "┌─────────────────────────────────────────────────────────────────┐"
echo "│ [COMPASS] 🐕  DECISION ENGINE                                   │"
echo "│ Reads the beacon's report. Decides.                              │"
echo "└─────────────────────────────────────────────────────────────────┘"
echo ""

echo "▶ Computing deterministic decision..."
bash "${SCRIPT_DIR}/dog_decision.sh"
echo ""

sleep 1

# ═════════════════════════════════════════════════════════════════
# [ANCHOR] — Paper Safety Preview
# ═════════════════════════════════════════════════════════════════
echo ""
echo "┌─────────────────────────────────────────────────────────────────┐"
echo "│ [ANCHOR] 🐕  PAPER SAFETY PREVIEW                             │"
echo "│ Never trades without the pack leader (you).                     │"
echo "└─────────────────────────────────────────────────────────────────┘"
echo ""

echo "▶ Previewing paper trade: BUY 100 DOG..."
bash "${SCRIPT_DIR}/dog_paper_preview.sh" buy 100
echo ""

sleep 1

# ═════════════════════════════════════════════════════════════════
# [PACK] — Summary
# ═════════════════════════════════════════════════════════════════
echo ""
echo "┌─────────────────────────────────────────────────────────────────┐"
echo "│ [PACK] 🐕  MISSION SUMMARY                                      │"
echo "│ Four roles coordinated. Awaiting pack leader.                   │"
echo "└─────────────────────────────────────────────────────────────────┘"
echo ""

cat << 'EOF'
┌────────────────────────────────────────┐
│  SAFETY CONTRACT                       │
├────────────────────────────────────────┤
│  paperOnly=true                        │
│  requiresConfirmation=true             │
│  liveTrading=false                     │
│  pair=DOGUSD                           │
│  maxPositionSize=5%                    │
│  apiKeyRequired=false                  │
├────────────────────────────────────────┤
│  nextAction=human_confirmation_required│
│  executeWith=npm run agent:anchor    │
│  or=Telegram /confirm                  │
└────────────────────────────────────────┘

EOF

echo ""
echo "✅ Demo complete. No orders executed."
echo "🐕 Woof to the moon."
echo ""
