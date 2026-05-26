# CONTEXT.md — Agent DOG

> Runtime context for AI agents using Agent DOG on top of Kraken CLI.

## What This Is

Agent DOG is a paper-first agent layer for DOGUSD ($DOG Runes on
Bitcoin layer-1), built on top of the official Kraken CLI.

It exposes 4 reusable agent skills:
- beacon-skill (market data)
- compass-skill (deterministic decision engine)
- anchor-skill (paper preview + human confirmation)
- pack-recipe (end-to-end coordinator)

## Invocation Pattern

Agent DOG skills wrap Kraken CLI commands with the same convention:

```
kraken <command> [args...] -o json 2>/dev/null
```

Our shell scripts call Kraken CLI directly and return clean JSON:

```
npm run agent:ticker -> kraken ticker DOGUSD
npm run agent:orderbook -> kraken orderbook DOGUSD
npm run agent:status -> kraken paper status
npm run agent:decision -> deterministic Compass engine
npm run agent:preview -> Anchor paper preview
```

## Output Contract

All scripts return valid JSON on stdout, or a JSON error envelope.

**Success example (dog_decision.sh):**
```json
{
  "decision": "WATCH_BUY",
  "confidence": 77,
  "reasons": [...],
  "flags": [],
  "metrics": {...}
}
```

**Error example:**
```json
{
  "error": "validation",
  "message": "Invalid volume parameter"
}
```

Exit code 0 = success. Non-zero = failure.

## Safety Contract

- LIVE_TRADING is false. Hard-enforced.
- DOGUSD only. Hard-coded (Bitcoin Runes, NOT Dogecoin XDGUSD).
- Max 5% of paper balance per trade.
- Human confirmation required via --confirm flag.
- Confirmations expire after 60 seconds.
- No Kraken API key required.
- No --allow-dangerous flag used.

## Agent Compatibility

Works with any AI agent that can call Kraken CLI or Kraken MCP:
- Claude Code
- Cursor
- Codex
- OpenClaw
- Gemini CLI
- Goose
- Terminal

## Files for Agents

- AGENTS.md — Full integration guide
- CLAUDE.md — Claude-specific guidance
- docs/MCP_AGENT_COMPATIBILITY.md — MCP setup
- skills/*/SKILL.md — Goal-oriented workflows
