# Agent DOG — Product Brain Spec

> Product specification for Dashboard V4 and beyond.
> No code. Just clarity.

---

## A. Product Promise

**Agent DOG turns Kraken CLI into a safe DOG Army trading companion.**

Kraken CLI gives you raw market data.  
Agent DOG gives you context, decision, risk assessment, memory, and a safety workflow.

**One-liner:**  
> "Four agent skills that turn your terminal into a Bitcoin-native trading brain for $DOG."

---

## B. Target Users

| User | Need | How Agent DOG Helps |
|------|------|---------------------|
| **DOG Army holder** | Track $DOG price, learn trading | Real-time DOGUSD + paper practice |
| **Kraken user** | Better CLI experience | Natural language skills, not raw commands |
| **AI agent builder** | Reusable trading components | 4 modular skills to integrate |
| **Paper trading learner** | Risk-free practice | Deterministic decisions + human confirmation |

**Primary:** DOG Army community members  
**Secondary:** Kraken CLI power users  
**Tertiary:** AI agent developers

---

## C. Core Value

**Kraken CLI → Agent DOG transformation:**

| Raw CLI | Agent DOG Value |
|---------|------------------|
| `kraken ticker DOGUSD` | Beacon interprets + context |
| JSON output | Compass scores + decides |
| Manual calculation | Anchor previews + enforces limits |
| Ephemeral data | Helm logs + remembers |

**Value add:**
- Context over data
- Decisions over numbers
- Safety over speed
- Memory over moments

---

## D. Pack Roles (The Four)

### 🐕 Beacon — Market Intelligence
**Input:** Kraken CLI ticker, orderbook, OHLC  
**Output:** Structured market context  
**Value:** "What's $DOG doing right now?"

### 🐕 Compass — Decision Engine  
**Input:** Beacon's market report  
**Output:** Decision + confidence + reasons  
**Value:** "Should we do something?"

### 🐕 Anchor — Safety & Confirmation
**Input:** Compass's decision  
**Output:** Preview + risk check + confirmation gate  
**Value:** "Is this safe? Do you confirm?"

### 🐕 Helm — Memory & Coordination
**Input:** All pack activity  
**Output:** Logs, history, pack index  
**Value:** "What happened? What's the trend?"

---

## E. PACK INDEX (0-100)

A unified score representing overall market conditions and pack readiness.

### Component Scores (0-100 each)

| Score | Source | Calculation |
|-------|--------|-------------|
| **Liquidity Score** | Beacon | Based on spread %, volume vs 24h avg, orderbook depth |
| **Momentum Score** | Beacon + Compass | Based on VWAP distance, range position, trend direction |
| **Risk Score** | Compass | Inverse of risk flags (lower is riskier) |
| **Execution Readiness** | Anchor | Based on paper balance, confirmation status, safety checks |

### PACK INDEX Formula

```
PACK_INDEX = (Liquidity × 0.25) + (Momentum × 0.25) + (Risk × 0.25) + (Readiness × 0.25)
```

### Interpretation

| Range | Meaning | Color |
|-------|---------|-------|
| 80-100 | Optimal conditions | Green |
| 60-79 | Favorable | Yellow-Green |
| 40-59 | Neutral | Yellow |
| 20-39 | Caution | Orange |
| 0-19 | High risk | Red |

---

## F. Indicators (Data Sources)

### Available from Kraken CLI

| Indicator | Source | Used By |
|-----------|--------|---------|
| Last price | ticker | Beacon, Compass |
| Bid/Ask spread | ticker | Beacon, Liquidity Score |
| 24h volume | ticker | Beacon, Liquidity Score |
| VWAP | ticker | Beacon, Compass, Momentum |
| 24h high/low | ticker | Beacon, Compass, range calc |
| Orderbook depth | orderbook | Beacon (optional) |
| Recent trades | ticker | Beacon (trade count) |

### Internal State

| Indicator | Source | Used By |
|-----------|--------|---------|
| Paper balance | paper status | Anchor, Readiness |
| Paper trades history | paper status | Helm, memory |
| Recent decisions | events log | Helm, trend |
| Confirmation status | state | Anchor, Readiness |

---

## G. Dashboard V4 Blocks

### Required Blocks (Above Fold)

| Block | Priority | Content |
|-------|----------|---------|
| **Hero** | P0 | Agent DOG logo, tagline, badges |
| **Live DOGUSD** | P0 | Price, change %, 24h range — < 3s visibility |
| **Pack Index** | P0 | 0-100 score with component breakdown |
| **Beacon Market Feed** | P0 | Ticker data, spread, volume |

### Secondary Blocks (Scroll)

| Block | Priority | Content |
|-------|----------|---------|
| **Compass Decision** | P1 | Decision, confidence %, reasons |
| **Anchor Safety** | P1 | Paper balance, limits, confirmation status |
| **Helm Memory** | P1 | Recent activity, trend chart |
| **Paper Portfolio** | P1 | Balance, trades, PnL |
| **Activity Timeline** | P2 | Timestamped log entries |

### Optional Block

| Block | Priority | Content |
|-------|----------|---------|
| **AI Brief** | P3 | Natural language summary (Claude explain mode) |

---

## H. Claude Explain Mode

### Philosophy

**Claude can explain. Claude cannot decide. Claude cannot trade.**

### Configuration

```
LLM_MODE=explain_only
LLM_CAN_TRADE=false
LLM_IN_DECISION_LOOP=false
```

### What Claude Does

- ✅ Explain the Pack Index
- ✅ Explain Compass's decision
- ✅ Explain risk factors
- ✅ Explain Anchor's safety checks
- ✅ Answer "why" questions
- ✅ Summarize market context

### What Claude Does NOT Do

- ❌ Make trading decisions
- ❌ Override Compass
- ❌ Execute trades
- ❌ Skip Anchor confirmation
- ❌ Access live trading

### Explain Mode Example

```
User: "Why is the Pack Index at 45?"

Claude: "The Pack Index is neutral-caution (45/100) because:
- Liquidity is good (78) — tight spread, decent volume
- Momentum is weak (42) — price below VWAP, ranging
- Risk is elevated (35) — volatility above 12%
- Readiness is okay (65) — paper balance healthy, awaiting confirmation

The Compass suggests HOLD because momentum is uncertain."
```

---

## I. Non-Goals (What We Don't Do)

| Non-Goal | Why |
|----------|-----|
| **Live trading** | Paper-only by design. Safety first. |
| **Profitability claims** | Educational, not financial advice. |
| **Telegram-first** | CLI/agent-first. Telegram is optional demo. |
| **Fake DOG logo** | Use official assets only, with attribution. |
| **Unverified assets** | All assets must have clear source. |
| **LLM trading** | Deterministic decisions only. LLM explains only. |
| **Complex strategies** | Simple, understandable rules. |
| **Multi-pair trading** | DOGUSD only. Focus. |

---

## J. Success Metrics

### For Users
- [ ] Understand DOGUSD market in 3 seconds
- [ ] See Pack Index and know what it means
- [ ] Understand why Compass decided HOLD/WATCH_BUY/RISK_OFF
- [ ] Feel confident in Anchor's safety
- [ ] Trust the paper-only promise

### For Kraken Agent Zero
- [ ] Clear use of Kraken CLI
- [ ] Innovative agent skill architecture
- [ ] Professional presentation
- [ ] Bitcoin/DOG Army culture alignment
- [ ] Safety-first design

---

## K. Dashboard V4 Recommendation

### Priority Order

1. **Pack Index** — The hero metric. Must be prominent.
2. **Live DOGUSD** — Proof of real data. Must be instant.
3. **Component Breakdown** — Show how index is calculated.
4. **Compass Decision** — The "so what?"
5. **Anchor Safety** — Trust layer.
6. **Helm Timeline** — Memory/context.

### Visual Hierarchy

```
┌─────────────────────────────────────────┐
│  HERO: Agent DOG + Badges              │
├─────────────────────────────────────────┤
│  PACK INDEX (big, central)              │
│  [Liquidity] [Momentum] [Risk] [Ready]  │
├─────────────────────────────────────────┤
│  LIVE DOGUSD + Beacon Feed               │
├─────────────────────────────────────────┤
│  COMPASS DECISION + ANCHOR SAFETY     │
├─────────────────────────────────────────┤
│  HELM TIMELINE                      │
└─────────────────────────────────────────┘
```

---

## L. Claude Explain Mode Recommendation

### Implementation

- Add "Explain" button to each section
- Claude provides context, not commands
- Always reference deterministic data
- Never suggest overriding safety

### Example Integration

```html
<div class="pack-index">
  <h2>Pack Index: 67</h2>
  <button onclick="explain('pack-index')">🐕 Explain</button>
</div>
```

Claude response: Natural language breakdown of the 4 components.

## M. Multi-Agent Compatibility

Multi-agent compatibility is a core product requirement.
Agent DOG must work with Claude, Cursor, Codex, OpenClaw
and terminal. Any future LLM integration (explain mode)
must remain explain-only and agent-agnostic.

See docs/MCP_AGENT_COMPATIBILITY.md for implementation details.

---

**Document Version:** 1.1  
**Status:** Ready for Dashboard V4 implementation  
**Next Step:** Design mockups → Code → Test
