# Agent DOG Skills Index

> 4 agent skills for safe DOGUSD paper trading on Kraken CLI.

## Core Skills

| Skill | Role | Description |
|-------|------|-------------|
| [beacon-skill](beacon-skill/SKILL.md) | 🐕 The Beacon | Read DOGUSD market state via Kraken CLI |
| [compass-skill](compass-skill/SKILL.md) | 🐕 The Compass | Deterministic Pack Index + decision |
| [anchor-skill](anchor-skill/SKILL.md) | 🐕 The Anchor | Paper preview + human confirmation |

## Recipes

| Recipe | Description |
|--------|-------------|
| [pack-recipe](pack-recipe/SKILL.md) | End-to-end : beacon → compass → anchor → helm |

## Installation

For OpenClaw:

```bash
cd ~/agent-dog
for skill in skills/*/; do
  ln -sf "$(pwd)/$skill" ~/.openclaw/skills/
done
```

For Claude Code:

```bash
for skill in skills/*/; do
  ln -sf "$(pwd)/$skill" ~/.claude/skills/
done
```

For Cursor / Codex / Gemini CLI: use the Kraken MCP server.

## Asset

All skills work on DOGUSD ($DOG Runes on Bitcoin layer-1).
Hard-coded throughout. NOT Dogecoin (XDGUSD).

## Safety

All skills are paper-only by default. Live trading is NOT enabled.
See [SAFETY.md](../docs/SAFETY.md).
