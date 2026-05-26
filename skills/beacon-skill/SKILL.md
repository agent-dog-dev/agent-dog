---
name: beacon-skill
version: 1.0.0
description: The Beacon — reads DOGUSD market state (ticker, orderbook, OHLC). First role in the pack.
metadata:
  openclaw:
  requires:
    - bins:
      - kraken
  category: finance
  asset: DOGUSD
  safety: read-only
---

# 🐕 THE BEACON — first into the field. Reports what it sees.

Use this skill to answer questions like:
- "What is the current DOGUSD price?"
- "Is the DOG spread widening?"
- "What is the short-term DOG trend?"

DOGUSD is the Kraken pair for $DOG Runes (Bitcoin layer-1 token).
This is NOT Dogecoin (XDGUSD).

## Snapshot Pattern

```bash
kraken ticker DOGUSD -o json 2>/dev/null
kraken orderbook DOGUSD --count 10 -o json 2>/dev/null
kraken ohlc DOGUSD --interval 60 -o json 2>/dev/null
```

## Context Efficiency

- Use --count and --depth flags to limit payload size.
- Prefer one timeframe at a time.
- Read-only operations, no auth required.

## Typical Output Use

- Ticker: last, bid, ask, vwap, 24h volume, 24h high/low
- Orderbook: near-book depth and bid/ask imbalance
- OHLC: trend direction, volatility, recent ranges

## Safety

- No API key required.
- No paper or live orders from this skill.
- Pair confirmed: DOGUSD ($DOG Runes), not XDGUSD (Dogecoin).
