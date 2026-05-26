# Agent DOG — Multi-Agent Compatibility

> Agent DOG works with any AI agent that can call Kraken CLI
> or Kraken MCP. Built for the DOG Army, agnostic by design.

## Supported Agent Clients

| Client | How to use Agent DOG |
|--------|----------------------|
| 🦙 Claude Code | Install skills/ then talk to the pack naturally |
| 🖱️ Cursor | Configure Kraken MCP, prompt with skill names |
| 💻 Codex | Same as Cursor, MCP-based |
| 🐧 OpenClaw | Symlink skills/ into ~/.openclaw/skills/ |
| 🖥️ Terminal | Use npm run agent:* scripts directly |

## Architecture

```
 User / AI Agent (Claude, Cursor, Codex, OpenClaw, …)
 ↓
 Kraken MCP / Kraken CLI
 ↓
 ┌─────────────────────────────────┐
 │ Agent DOG agent layer          │
 │ ┌───────┐ ┌────────┐ ┌────────┐ │
 │ │Beacon  │ │Compass │ │Anchor│ │
 │ └───┬───┘ └───┬────┘ └───┬────┘ │
 │     └─────────┼──────────┘       │
 │           Helm               │
 │                                  │
 │ → Pack Index (proprietary)       │
 │ → Deterministic decision         │
 │ → Paper preview                  │
 │ → Human confirmation             │
 └─────────────────────────────────┘
 ↓
 Paper portfolio + logs
```

## Kraken MCP Setup

For agents using MCP (Claude Code, Cursor, Codex):

```json
{
  "mcpServers": {
    "kraken": {
      "command": "kraken",
      "args": ["mcp", "-s", "market,paper"]
    }
  }
}
```

**Important:**
- We expose only market and paper services.
- Live trading is NOT enabled by default.
- No --allow-dangerous flag.
- User must explicitly configure live separately if desired.

## Talking to the Pack (Natural Language)

Once installed, talk to the pack naturally in any compatible agent:

- "Hey beacon, what's DOGUSD doing right now?"
- "Compass, compute the Pack Index for $DOG"
- "Anchor, preview a 100 DOG paper buy"
- "Run the full pack and explain the decision"
- "Helm, show me the last 10 decisions"

## What Each Skill Does

| Skill | Role | Input | Output |
|-------|------|-------|--------|
| beacon-skill | reads market | nothing | DOGUSD ticker + orderbook + OHLC |
| compass-skill | decides | beacon output | Pack Index + decision JSON |
| anchor-skill | previews & confirms | compass output | Paper preview / order with --confirm |
| pack-recipe | coordinates | nothing | End-to-end workflow |

## Safety Contract (Multi-Agent)

These rules apply regardless of which agent client is used:

- LIVE_TRADING = false enforced in scripts
- DOGUSD only (hard-coded)
- Max 5% of paper balance per trade
- Human confirmation required via --confirm
- Confirmations expire after 60 seconds
- No API key required for Agent DOG itself
- LLM (if any) is explain-only, never decides or executes

## Future: Optional LLM Explain Mode

Coming in a future release:
- Bring your own API key (Claude, OpenAI, OpenRouter, Ollama)
- LLM explains Pack Index and decisions in natural language
- LLM never decides or executes trades
- Compass remains deterministic source of decision

See docs/LLM_EXPLAIN_MODE.md (coming soon).

## License

MIT — Copyright (c) 2026 DOG Agent Contributors

The pack belongs to everyone. Woof to the moon. 🌙
