# Dashboard Product Standard

> Professional dashboard standards for Agent DOG — Kraken Agent Zero submission.

## Product Identity

**Name:** Agent DOG  
**Tagline:** Four roles. One pack. Zero risk.  
**Positioning:** Bitcoin-native AI agent skills for the DOG Army  
**Core Value:** Reusable Kraken CLI skills, not a Telegram bot

## Visual Standards

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | #050505 | Background |
| `--bg-secondary` | #0a0a0a | Panels |
| `--dog-gold` | #f4b942 | Primary accent, headers |
| `--bitcoin-orange` | #f7931a | Bitcoin L1 indicator |
| `--kraken-purple` | #7132f5 | Secondary accent |
| `--terminal-green` | #39ff88 | Online, success, paper mode |
| `--terminal-red` | #ff4d4d | Risk, offline, locked |
| `--text-primary` | #e5e5e5 | Main text |
| `--text-secondary` | #a3a3a3 | Labels, muted text |

### Typography

- **Primary:** SF Mono, Menlo, Monaco, Consolas (monospace)
- **Size:** 13px base, 11px labels, 24px hero
- **Style:** Terminal aesthetic, ASCII frames

### Layout Grid

- **Container:** max-width 1400px, centered
- **Grid:** CSS Grid, 2-column main layout
- **Padding:** 20px container, 15px panels
- **Responsive:** 1440px desktop, 768px tablet, 375px mobile

## Required Sections

### 1. Hero Section (Above fold, < 3s visibility)

**Must show immediately:**
- [ ] Agent DOG ASCII art logo
- [ ] Tagline: "Four roles. One pack. Zero risk."
- [ ] Badges: PAPER ONLY | KRAKEN CLI | DOGUSD | READ ONLY | NO API KEY

**Visual:**
- Centered, dark background
- Gold/orange accents
- Professional, not playful

### 2. Market Feed / [BEACON] (Above fold, < 3s visibility)

**Must show immediately:**
- [ ] DOGUSD live price
- [ ] 24h change %
- [ ] Bid/Ask spread
- [ ] 24h volume
- [ ] Source: Kraken CLI

**Visual:**
- Terminal panel style
- Monospace numbers
- Green/red change indicator

### 3. Pack Status (Above fold)

**Must show:**
- [ ] THE BEACON — MARKET ONLINE
- [ ] THE COMPASS — DECISION READY
- [ ] THE ANCHOR — CONFIRMATION REQUIRED
- [ ] THE HELM — LOGGING PAPER FLOW

**Visual:**
- 4 cards grid
- Role labels in gold
- Status indicators (green dot)

### 4. Decision Engine / [COMPASS] (Above fold, < 3s visibility)

**Must show immediately:**
- [ ] Current decision (HOLD / WATCH_BUY / RISK_OFF)
- [ ] Confidence % with visual bar
- [ ] Key metrics: spread, volatility, range position

**Visual:**
- Large decision text
- Color-coded (yellow/orange watch, gray hold, red risk)
- Confidence bar gradient

### 5. Anchor / Paper Safety (Above fold)

**Must show:**
- [ ] Paper balance
- [ ] Max trade size (5%)
- [ ] requiresConfirmation: true
- [ ] liveTrading: false
- [ ] pair: DOGUSD ONLY
- [ ] API key: NOT REQUIRED

**Visual:**
- Safety contract style
- Red/green indicators
- Locked icon for safety

### 6. Activity Log / [PACK]

**Must show:**
- [ ] Timestamped entries
- [ ] Role labels [BEACON], [COMPASS], [ANCHOR], [PACK]
- [ ] Recent actions
- [ ] Scrollable history

**Visual:**
- Terminal log style
- Monospace timestamps
- Color-coded roles

### 7. Footer

**Must show:**
- [ ] MIT License — DOG Agent Contributors
- [ ] Built for Kraken Agent Zero
- [ ] $DOG Runes on Bitcoin L1, not Dogecoin XDGUSD
- [ ] Woof to the moon. 🌙

## Safety Requirements

### Absolute Rules

- [ ] **NO live trading buttons**
- [ ] **NO buy/sell/confirm buttons**
- [ ] **NO API key input fields**
- [ ] **NO Telegram-first messaging**
- [ ] **PAPER ONLY badge visible**
- [ ] **READ ONLY indicator clear**

### Dashboard Behavior

- [ ] Read-only endpoints only (GET)
- [ ] No POST/PUT/DELETE
- [ ] Polling every 5 seconds max
- [ ] Graceful fallback if API down
- [ ] No secrets in frontend code

## Screenshot Ready Checklist

### Desktop (1440px)

- [ ] All sections visible without scroll
- [ ] DOGUSD price clearly readable
- [ ] Decision Engine prominent
- [ ] Safety layer obvious
- [ ] Professional, not cluttered
- [ ] Dark theme consistent

### Mobile (375px)

- [ ] Single column layout
- [ ] Key info visible without scroll
- [ ] Touch-friendly spacing
- [ ] Readable text size

## Content Standards

### Messaging

**DO:**
- "Bitcoin-native AI agent skills"
- "Four roles. One pack. Zero risk."
- "Built for the DOG Army"
- "Paper only. Human confirmation required."
- "Kraken CLI foundation"

**DON'T:**
- "Trading bot" (use "agent skills")
- "Automated trading" (use "human-in-the-loop")
- "Get rich quick" (use "practice risk-free")
- Telegram as primary (use "optional demo")

## Technical Standards

### Performance

- [ ] First paint < 1s
- [ ] API response < 500ms
- [ ] 60fps animations
- [ ] < 100KB total JS

### Accessibility

- [ ] Color contrast WCAG AA
- [ ] Keyboard navigation
- [ ] Screen reader labels
- [ ] Reduced motion support

## Version History

| Version | Date | Changes |
|---------|------|---------|
| V3 | 2026-05-24 | Terminal war room style |
| V4 | TBD | Official assets integration |

---

**Standard for:** Agent DOG Dashboard  
**Target:** Kraken Agent Zero submission  
**Status:** Ready for V4 implementation
