---
name: compass-skill
version: 1.0.0
description: The Compass — deterministic decision engine for DOGUSD with risk guards.
metadata:
  openclaw:
  requires:
    - bins:
      - kraken
  category: finance
  asset: DOGUSD
  safety: paper-only
---

# 🐕 THE COMPASS — reads the beacon's report, decides watch_buy, hold, no_trade, or risk_off.

Use this skill to answer questions like:
- "Should I enter a DOGUSD position right now?"
- "What is the risk on DOGUSD?"
- "Why is the bot saying NO_TRADE?"

The engine is fully deterministic. No LLM in the decision loop.
LLM may be used only for human-readable explanations.

## Decisions

- HOLD
- WATCH_BUY
- NO_TRADE
- RISK_OFF

## Inputs Required

From beacon-skill:
- last, bid, ask
- 24h high, 24h low, vwap
- volume 24h

## Rules (Thresholds)

- spread > 1% → RISK_OFF
- volatility (high-low)/last > 15% → RISK_OFF
- range position > 90% → NO_TRADE (near top)
- WATCH_BUY if: last > vwap*1.005 AND range_position 35%-80% AND spread OK
- volume < 50M → LOW_VOLUME flag
- range position < 15% → NEAR_LOW flag

## Confidence

- 0-100, deterministic computation.
- Combines spread, volatility, range, volume signals.

## Safety

- Decision only. Does NOT execute any order.
- Paper orders handled by anchor-skill.
- Human confirmation required for any paper trade.
