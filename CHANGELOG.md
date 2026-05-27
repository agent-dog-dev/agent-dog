# Changelog

All notable changes to Agent DOG will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-26

### Added

#### Agent Skills
- 4 reusable Kraken CLI agent skills following Anthropic's skill format
- **Beacon** — scans the market via Kraken CLI (ticker, ohlc, trades)
- **Compass** — computes deterministic Pack Index score (0-100)
- **Anchor** — enforces human confirmation, blocks autonomous execution
- **Helm** — logs decisions to events/decisions.jsonl
- Pack recipe combining all four skills

#### Dashboard
- Read-only cockpit on http://127.0.0.1:3100
- Live DOGUSD price feed via Kraken CLI
- Pack Index visualization (4 sub-scores)
- Decision Engine display (HOLD / WATCH_BUY / NO_TRADE / RISK_OFF)
- Paper Portfolio tracker
- DOG/USD Live Trades tape (last 20)
- Market Pulse (RSI 14, EMA 9/21, VWAP, Volume Impulse)
- BTC Network context (mempool, fees, recent blocks)
- Risk Analysis panel
- Agent Timeline

#### Safety Contract (Hard-coded)
- Live trading disabled by default
- DOGUSD pair restriction enforced
- 5% maximum position size per trade
- Human --confirm flag required for paper execution
- 60-second confirmation timeout
- Dashboard API blocks all non-GET methods

#### Multi-Agent Compatibility
- Compatible with Claude, Cursor, Codex, OpenClaw, Gemini CLI, Goose
- Skills follow standard format readable by any modern AI client
- No vendor lock-in

#### Documentation
- Complete README with safety contract, installation, multi-agent guide
- Visual Preview section with live dashboard screenshots
- 11 documentation files in docs/
- MIT License with proper attribution

### Submission

- Submitted to Kraken Agent Zero promotion (May 13 - June 10, 2026)
- Public tweet announcement with 1:25 demo video
- Endorsed by @LeonidasNFT — creator of $DOG (Bitcoin Runes)

### Technical Stack

- Node.js (ESM) backend
- Express for dashboard server
- Kraken CLI for market data and paper trading
- Vanilla HTML/CSS/JS frontend (no framework dependencies)

### Notes

- This is the initial public release
- Paper-only mode is enforced at the code level
- The repository is provided as a reusable skill pack for AI agents
- Not affiliated with Kraken or the official $DOG team
