---
name: pack-recipe
version: 1.0.0
description: The Pack — end-to-end recipe coordinating beacon, compass, anchor, and helm.
metadata:
  openclaw:
  requires:
    - skills:
      - beacon-skill
      - compass-skill
      - anchor-skill
  category: finance
  type: recipe
  asset: DOGUSD
---

# 🐕 THE PACK — four roles, one mission. Watch $DOG. Decide. Confirm. Execute.

Complete workflow: market read → decision → preview → confirm → execute → log.

## The Four Roles

| Role | Skill | Responsibility |
|------|-------|----------------|
| 🐕 Beacon | beacon-skill | Reads market data |
| 🐕 Compass | compass-skill | Makes decisions |
| 🐕 Anchor | anchor-skill | Enforces safety + confirmation |
| 🐕 Helm | pack-recipe | Logs everything |

## Steps

1. Pull market snapshot (beacon-skill).
2. Compute decision (compass-skill).
3. If WATCH_BUY:
   - Generate paper preview (cost, fee, % balance).
   - Display risk verdict to human.
   - Wait for /confirm or /cancel.
4. On /confirm:
   - Execute `kraken paper buy DOGUSD <volume>`.
   - Log to events/decisions.jsonl.
   - Notify outcome.
5. On /cancel or 60s timeout:
   - Clear pending state.
   - Log cancellation.

## Demo Interfaces (optional)

This recipe is exposed through two optional interfaces:
- Telegram bot: /dog /risk /paper_preview_buy /confirm /paper_status
- Visual dashboard: read-only at http://127.0.0.1:3100

## Safety Invariants

- LIVE_TRADING = false (enforced).
- No API key.
- Human-in-the-loop on every order.
- Max 5% paper portfolio per trade.
- Pair = DOGUSD only.
