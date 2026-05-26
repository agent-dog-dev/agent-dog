# Agent DOG — Agent Demo

> Agent-first workflow for the DOG Army.
> No Telegram required. No GUI required.
> Just Kraken CLI + terminal + the pack.

## What Agent DOG Does

Agent DOG turns your terminal into a Bitcoin-native trading companion for $DOG (DOGUSD Runes on Bitcoin L1).

Four agent skills work together:
- **Beacon** reads the market
- **Compass** decides what to do
- **Anchor** enforces safety and waits for your confirmation
- **Helm** coordinates and logs everything

## How Kraken CLI Is Used

Agent DOG is built on [Kraken CLI](https://github.com/krakenfx/kraken-cli):

```bash
# Beacon reads market data
kraken ticker DOGUSD -o json
kraken orderbook DOGUSD --count 10 -o json

# Anchor uses paper trading
kraken paper status -o json
kraken paper buy DOGUSD 100 -o json  # only with --confirm
```

No API key. No live trading. Paper mode only.

## What Each Role Does

| Role | Command | Responsibility |
|------|---------|----------------|
| Beacon | `npm run agent:beacon` | Reads ticker, orderbook, OHLC |
| Compass | `npm run agent:compass` | Computes deterministic decision |
| Anchor | `npm run agent:anchor -- preview buy 100` | Previews trade, awaits confirmation |
| Pack | `npm run agent:pack` | Full workflow demo |

## Why No Telegram Is Required

Telegram is **optional**. It's a demo interface, not the product.

The core product is:
- 4 reusable agent skills
- CLI scripts
- Deterministic decision engine
- Human-in-the-loop safety

You can use Agent DOG entirely from the terminal:

```bash
cd ~/agent-zero-kraken

# Install skills
for skill in skills/*/; do
  ln -sf "$(pwd)/$skill" ~/.openclaw/skills/
done

# Run the pack
npm run agent:demo
```

## How an AI Agent Can Call Agent DOG

### Natural language

- "Beacon, what's DOGUSD doing?"
- "Compass, should we trade?"
- "Anchor, preview a 100 DOG paper buy"
- "Run the pack demo"

### Programmatic

```bash
# Individual roles
npm run agent:beacon      # Market data
npm run agent:compass    # Decision engine
npm run agent:anchor   # Preview/confirmation

# Full demo
npm run agent:demo
```

## Dashboard

The dashboard is a **read-only cockpit** — a visual window into the pack.

```bash
npm run dashboard
open http://127.0.0.1:3100
```

It shows:
- Live DOGUSD price
- Pack status
- Decision engine output
- Paper portfolio
- Activity log

No buttons. No orders. Just visibility.

## Telegram (Optional)

If you want a conversational interface:

```bash
cp .env.example .env
# Add TELEGRAM_BOT_TOKEN from @BotFather
npm run telegram
```

Commands:
- `/dog` — Beacon report
- `/decide` — Compass output
- `/preview 100` — Anchor preview
- `/confirm` — Execute paper trade

But remember: **Telegram is optional.** The pack works without it.

## Safety First

| Rule | Enforcement |
|------|-------------|
| Paper only | `LIVE_TRADING=false` hard-coded |
| Confirmation required | Anchor waits for explicit confirmation |
| Max 5% per trade | Position size capped |
| DOGUSD only | Bitcoin Runes, not Dogecoin |
| No API key | Works with Kraken CLI paper mode |

## License

MIT — Copyright (c) 2026 DOG Agent Contributors

The pack belongs to everyone.

Woof to the moon. 🌙
