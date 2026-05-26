# 🛡️ SAFETY.md - Security Rules

## 🔴 Absolute Red Lines

### 1. NO LIVE TRADING
- `TRADING_MODE=PAPER` is hardcoded in `src/config.js`
- `LIVE_TRADING_ENABLED=false` is hardcoded
- All orders execute via `kraken paper buy/sell` only
- No production API endpoints exist

### 2. NO API KEYS REQUIRED
- Kraken CLI uses public market data
- No authentication needed for ticker/spot data
- Paper trading uses CLI's internal paper mode
- No credentials stored in code or env

### 3. HUMAN CONFIRMATION MANDATORY
- `/paper_preview_buy` or `/paper_preview_sell` creates pending order
- `/confirm` required within 60 seconds to execute
- `/cancel` available to abort
- No automatic order execution

### 4. DASHBOARD IS READ-ONLY
- All API endpoints are `GET` only
- Middleware blocks POST/PUT/DELETE with 405 error
- No buttons for trading in dashboard
- Explicit message: "Orders handled only through Telegram confirmation"

### 5. ORDER SIZE LIMITS
- Max order cost: 5% of paper portfolio value
- Calculated from live preview before confirmation
- Rejected if exceeds limit

### 6. LOCAL-ONLY DASHBOARD
- Binds to `127.0.0.1` explicitly
- Port checked free before startup
- No external network exposure

## 🟡 Safety Thresholds

| Metric | Threshold | Action |
|--------|-----------|--------|
| Spread | >1% | RISK_OFF decision |
| Volatility | >15% | RISK_OFF decision |
| Order Size | >5% portfolio | Rejected |
| Confirmation | >60s | Expired |

## 🟢 Allowed Operations

- ✅ Mock data / deterministic responses
- ✅ Paper portfolio simulation
- ✅ Educational coaching
- ✅ Risk analysis and alerts
- ✅ Logging and reporting

## 📋 Pre-Commit Checklist

- [ ] No API keys in code
- [ ] `TRADING_MODE=PAPER` verified
- [ ] No dependency on external trading bot
- [ ] `npm run check` passes
- [ ] Dashboard has no active trade buttons

## 🚨 Emergency Stop

If any safety rule is violated:
1. Stop bot: `pkill -f "node src/telegram.js"`
2. Stop dashboard: `pkill -f "node src/server.js"`
3. Check paper status: `./kraken paper status`
4. Report incident immediately

---

**Last Updated**: 2026-05-23  
**Version**: 0.1.0  
**Project**: DOG Paper Coach - Kraken Agent Zero
