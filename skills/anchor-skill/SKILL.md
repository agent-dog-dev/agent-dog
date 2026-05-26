---
name: anchor-skill
version: 1.0.0
description: The Anchor — paper trading workflow with human confirmation.
metadata:
  openclaw:
  requires:
    - bins:
      - kraken
    - skills:
      - beacon-skill
      - compass-skill
  category: finance
  asset: DOGUSD
  safety: paper-only
---

# 🐕 THE ANCHOR — never trades without the pack leader (you). Enforces safety.

Use this skill to answer questions like:
- "Coach me through a DOGUSD paper trade safely."
- "Preview a paper buy of 100 DOG."
- "Show my paper portfolio."

## Workflow

1. Initialize paper account if not present:
   ```bash
   kraken paper init --balance 10000 -o json 2>/dev/null
   ```

2. Check status:
   ```bash
   kraken paper status -o json 2>/dev/null
   ```

3. Read market with beacon-skill.
4. Compute decision with compass-skill.
5. If user wants to trade, generate a preview:
   - Volume × ask price = estimated cost
   - Estimated fee: cost × 0.0026 (Kraken taker)
   - Total notional
   - % of paper balance
   - Risk verdict
6. REQUIRE HUMAN CONFIRMATION before execution.
7. On confirm:
   ```bash
   kraken paper buy DOGUSD <volume> -o json 2>/dev/null
   ```
   or:
   ```bash
   kraken paper sell DOGUSD <volume> -o json 2>/dev/null
   ```

## Safety Rules

- Paper only. LIVE_TRADING must be false.
- Max paper position size: 5% of paper balance.
- Human confirmation required for every order.
- Confirmation expires after 60 seconds.
- Pair: DOGUSD ($DOG Runes), not XDGUSD (Dogecoin).
- No API key required for paper trading.
