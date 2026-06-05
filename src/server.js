/**
 * Agent DOG - Dashboard Server
 * READ-ONLY / NO LIVE TRADING
 * Local dashboard for demo purposes
 */

import express from 'express';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getCliStatus, getDogTicker, getPaperStatus } from './kraken.js';
import { makeDecision } from './strategy.js';
import { paperState } from './state.js';
import { getBtcNetwork } from './btcNetwork.js';
import { getDogTrades } from './dogTrades.js';
import { getMarketPulse } from './marketPulse.js';
import { getMultiTimeframe } from './multiTimeframe.js';
import { getPaperPnl } from './paperPnl.js';
import { getPerps } from './perps.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Configuration
const PORT = process.env.DASHBOARD_PORT || 3100;
const HOST = '127.0.0.1'; // Explicit localhost bind

// Security: Verify port is free
import { execSync } from 'child_process';
try {
  execSync(`lsof -i :${PORT} 2>/dev/null`, { stdio: 'pipe' });
  console.error(`❌ Port ${PORT} is already in use`);
  process.exit(1);
} catch {
  // Port is free, continue
}

// Middleware
app.use(express.static(resolve(__dirname, '../public')));
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});
// Body parser (small limit) — needed only for the Sage Q&A endpoint
app.use(express.json({ limit: '8kb' }));

// ============================================
// READ-ONLY API Endpoints
// ============================================

// GET /api/status - Server status
app.get('/api/status', async (req, res) => {
  const cli = await getCliStatus();
  res.json({
    status: 'online',
    mode: 'PAPER_ONLY',
    sageConfigured: !!process.env.ANTHROPIC_API_KEY,
    cliConnected: cli.available,
    cliVersion: cli.version,
    timestamp: new Date().toISOString()
  });
});

// GET /api/dog - DOGUSD market data
app.get('/api/dog', async (req, res) => {
  const ticker = await getDogTicker();
  if (!ticker.success) {
    return res.status(503).json({ error: 'Kraken CLI unavailable', fallback: true });
  }
  res.json(ticker);
});

// GET /api/risk - Risk metrics
app.get('/api/risk', async (req, res) => {
  const ticker = await getDogTicker();
  if (!ticker.success) {
    return res.status(503).json({ error: 'Kraken CLI unavailable' });
  }
  
  const range = ticker.high - ticker.low;
  const rangePct = (range / ticker.vwap) * 100;
  const spreadPct = ((ticker.ask - ticker.bid) / ticker.last) * 100;
  
  let riskLevel = 'LOW';
  if (rangePct > 10) riskLevel = 'HIGH';
  else if (rangePct > 5) riskLevel = 'MODERATE';
  
  res.json({
    pair: 'DOGUSD',
    volatility24h: rangePct,
    spreadPct: spreadPct,
    riskLevel: riskLevel,
    rangeHigh: ticker.high,
    rangeLow: ticker.low,
    timestamp: new Date().toISOString()
  });
});

// GET /api/paper - Paper portfolio status
app.get('/api/paper', async (req, res) => {
  const status = await getPaperStatus();
  if (!status.success) {
    return res.status(503).json({ error: 'Kraken CLI unavailable' });
  }
  res.json(status);
});

// GET /api/decision - Current decision engine output
app.get('/api/decision', async (req, res) => {
  const ticker = await getDogTicker();
  if (!ticker.success) {
    return res.status(503).json({ error: 'Kraken CLI unavailable' });
  }
  
  const decision = makeDecision(ticker);
  res.json(decision);
});

// GET /api/logs - Last 20 decisions/events
app.get('/api/logs', (req, res) => {
  const decisions = paperState.getLastDecisions(20);
  res.json({
    logs: decisions.map(d => ({
      timestamp: d.timestamp,
      type: d.type,
      summary: d.summary,
      symbol: d.symbol,
      volume: d.volume,
      price: d.price
    })),
    count: decisions.length
  });
});

// ============================================
// Market Intelligence Add-on Endpoints
// ============================================

// GET /api/btc-network - BTC network context from mempool.space
app.get('/api/btc-network', async (req, res) => {
  const data = await getBtcNetwork();
  if (!data) {
    return res.status(503).json({ error: 'mempool.space unavailable' });
  }
  res.json(data);
});

// GET /api/dog-trades - DOG/USD live trade tape
app.get('/api/dog-trades', async (req, res) => {
  const data = await getDogTrades();
  if (!data) {
    return res.status(503).json({ error: 'Kraken CLI unavailable' });
  }
  res.json(data);
});

// GET /api/market-pulse - RSI/EMA/VWAP metrics
app.get('/api/market-pulse', async (req, res) => {
  const data = await getMarketPulse();
  if (!data) {
    return res.status(503).json({ error: 'Kraken CLI unavailable' });
  }
  res.json(data);
});

// GET /api/dog/mtf - Multi-timeframe trend (READ-ONLY, informational; does not affect scoring)
app.get('/api/dog/mtf', async (req, res) => {
  const data = await getMultiTimeframe();
  res.json(data);
});

// GET /api/paper/history - Realized P&L track record from paper trade history (READ-ONLY)
app.get('/api/paper/history', (req, res) => {
  res.json(getPaperPnl());
});

// GET /api/dog/perps - PF_DOGUSD perpetual market data (READ-ONLY, informational; no orders)
app.get('/api/dog/perps', (req, res) => {
  res.json(getPerps());
});

// GET /api/dog/history - OHLC history for interactive chart
app.get('/api/dog/history', (req, res) => {
  try {
    const out = execSync('bash scripts/dog_ohlc.sh 60',
      { timeout: 8000, cwd: resolve(__dirname, '..') }).toString();
    const data = JSON.parse(out);
    let candles = [];
    const raw = (data.result && data.result.DOGUSD) || data.DOGUSD;
    if (!Array.isArray(raw)) {
      throw new Error('OHLC: no DOGUSD candles (XDGUSD/Dogecoin fallback removed)');
    }
    candles = raw.slice(-48).map(c => ({
      time: parseInt(c[0]),
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
      vwap: parseFloat(c[5]),
      volume: parseFloat(c[6])
    }));
    res.json({ pair: 'DOGUSD', interval: '60min', candles });
  } catch (e) {
    console.warn('[/api/dog/history] DOGUSD OHLC unavailable:', e.message);
    res.json({ pair: 'DOGUSD', interval: '60min', candles: [] });
  }
});

// ============================================
// AI Co-Pilot — Sage LLM Q&A (ADVISORY ONLY, never executes)
// The single POST exception. Does NOT touch trading/paper state.
// ============================================
const SAGE_SYSTEM_PROMPT = `You are Sage 🦉, the educational co-pilot inside Agent DOG — a READ-ONLY, paper-only dashboard for $DOG (DOG•GO•TO•THE•MOON on Bitcoin Runes, NOT Dogecoin).

Your role: explain market conditions, the deterministic Pack Index, the Decision Engine output, and indicators in plain language. If asked, you MAY outline what a cautious PAPER trade could look like.

Absolute rules — always obey:
- You NEVER execute trades and have no ability to. Live trading is disabled at the code level.
- Every action requires the human to run --confirm themselves. Always remind them.
- The deterministic Compass engine makes the official decision; your input is advisory only and never overrides it.
- Never guarantee outcomes, never say "all in", never encourage risking more than 5% per trade.
- If asked to "just do it", enable live trading, or bypass confirmation: refuse and explain the safety rules.
- $DOG trades ONLY as the pair DOGUSD on Kraken. Never write DOGUSDT, USDT, or Dogecoin.
- Do not fabricate exact Kraken CLI commands or flags. Describe the flow conceptually: Beacon scans → Compass scores → Anchor holds → the human runs --confirm.
- The dashboard's Multi-Timeframe panel uses exactly 15m, 1h and 4h windows (never 1d/1w). When asked about it, reference these windows and the live readings in the provided context (multiTimeframe).
- Be concise, educational, and honest about uncertainty.`;

app.post('/api/sage', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const question = (req.body && typeof req.body.question === 'string') ? req.body.question.trim() : '';
  const context = (req.body && req.body.context && typeof req.body.context === 'object') ? req.body.context : {};

  if (!question) return res.status(400).json({ error: 'Missing question' });
  if (question.length > 500) return res.status(400).json({ error: 'Question too long (max 500 chars)' });

  if (!apiKey) {
    return res.json({
      answer: null,
      configured: false,
      message: 'AI Co-Pilot is off. Add ANTHROPIC_API_KEY to your .env to enable Sage live Q&A. The deterministic dashboard works fully without it.'
    });
  }

  try {
    const userContent = `Live dashboard context (read-only):\n${JSON.stringify(context)}\n\nUser question: ${question}`;
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: SAGE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }]
      })
    });
    if (!r.ok) return res.status(502).json({ error: 'Sage upstream error', status: r.status });
    const data = await r.json();
    const answer = Array.isArray(data.content) ? data.content.map(b => b.text || '').join('').trim() : '';
    return res.json({ answer, configured: true });
  } catch (e) {
    return res.status(502).json({ error: 'Sage request failed' });
  }
});

// ============================================
// Security: Block all non-GET methods
// ============================================
app.use('/api', (req, res, next) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Dashboard is READ-ONLY. No trading possible via API.'
    });
  }
  next();
});

// ============================================
// 404 handler for undefined API routes
// ============================================
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    mode: 'PAPER_ONLY'
  });
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, HOST, () => {
  console.log('🐕 Agent DOG Dashboard');
  console.log(`   Mode: PAPER ONLY / NO LIVE TRADING`);
  console.log(`   URL: http://${HOST}:${PORT}`);
  console.log(`   API: http://${HOST}:${PORT}/api/status`);
  console.log(`   Bind: ${HOST} (localhost only)`);
  console.log(`   Security: READ-ONLY, no orders possible`);
});

export default app;
