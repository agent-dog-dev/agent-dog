# AGENTS.md — Agent DOG

> Four agent skills for the DOG Army.
> Built on Kraken CLI. Paper-only. Bitcoin L1 native.

## Multi-Agent Compatibility

Agent DOG works with Claude Code, Cursor, Codex, OpenClaw,
or directly in terminal. See [docs/MCP_AGENT_COMPATIBILITY.md](docs/MCP_AGENT_COMPATIBILITY.md)
for setup details.

The same skills work everywhere. The pack is agent-agnostic.

## For AI Agents (Claude Code, Codex, OpenClaw, Cursor)

### Meet the Pack

| Skill | Role | When to call |
|-------|------|--------------|
| beacon-skill | reads market | "What is $DOG doing?" |
| compass-skill | decides | "Should we trade?" |
| anchor-skill | previews & confirms | "Preview a 100 DOG buy" |
| pack-recipe | coordinates | "Run the pack" |

### Install Skills

For OpenClaw:
```bash
cd ~/agent-zero-kraken
for skill in skills/*/; do
  ln -sf "$(pwd)/$skill" ~/.openclaw/skills/
done
```

For Claude Code / Codex / Cursor:
Copy the skills/ folder contents into your skills directory.

### Talk to the Pack (Natural Language)

- "Hey beacon, what's DOGUSD doing right now?"
- "Compass, run the decision engine"
- "Anchor, preview a 100 DOG paper buy and explain the risk"
- "Run the full pack on $DOG"
- "What does the compass say about $DOG right now?"

### Pack Code (Safety Contract)

The pack obeys these rules absolutely:

- LIVE_TRADING = false. The pack does not execute live orders.
- No Kraken API key required, ever.
- DOGUSD = $DOG Runes on Bitcoin L1. Never use XDGUSD (Dogecoin).
- The anchor requires explicit human confirmation for every paper trade.
- Maximum 5% of paper balance per trade.
- Confirmations expire after 60 seconds.

### Demo Interfaces

The project ships two optional demo interfaces (not required for skill usage):
- 💬 Telegram bot — src/telegram.js
- 🖥️ Terminal dashboard — src/server.js + public/index.html

These are bonus. The core value is the four reusable skills.

### License

MIT — Copyright (c) 2026 DOG Agent Contributors

The pack belongs to everyone.

Woof to the moon. 🌙
