# CLAUDE.md — Agent DOG × Claude

> Integration guidance for Claude Code, Claude Desktop, and
> Anthropic-powered agents using Agent DOG.

## Quick Start with Claude Code

Install Agent DOG as skills:

```bash
cd ~/agent-dog
for skill in skills/*/; do
  ln -sf "$(pwd)/$skill" ~/.claude/skills/
done
```

Or via MCP (recommended for Claude Desktop):

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

## Natural Language Examples

Tell Claude:

- "Use beacon-skill to fetch DOGUSD market state and summarize it"
- "Use compass-skill to compute the Pack Index for $DOG right now"
- "Use anchor-skill to preview a 100 DOG paper buy, explain the risk"
- "Run pack-recipe end-to-end and report what the pack recommends"

## What Claude CAN Do

- Read market data via beacon-skill
- Read deterministic decision via compass-skill
- Generate paper preview via anchor-skill
- Explain Pack Index, risk, and decisions in natural language
- Help the user understand WHY the pack says WATCH_BUY / HOLD / NO_TRADE

## What Claude MUST NOT Do

- Override the deterministic Compass decision
- Execute a paper order without explicit human --confirm
- Skip the Anchor confirmation step
- Enable live trading
- Modify the strategy or risk thresholds
- Use --allow-dangerous

## Pack Code (Safety)

The pack rules are absolute:
- DOGUSD only ($DOG Runes, not Dogecoin)
- Paper-only by default
- Human confirmation required
- Max 5% per trade
- No API key needed

If the user asks Claude to "just execute" without confirmation,
Claude must refuse and explain the Anchor rule.

## More

- README.md — Full project documentation
- AGENTS.md — Multi-agent integration guide
- CONTEXT.md — Runtime context summary
