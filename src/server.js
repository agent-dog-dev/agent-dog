/**
 * DOG Paper Coach - Dashboard Server
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

// ============================================
// READ-ONLY API Endpoints
// ============================================

// GET /api/status - Server status
app.get('/api/status', async (req, res) => {
  const cli = await getCliStatus();
  res.json({
    status: 'online',
    mode: 'PAPER_ONLY',
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

// GET /api/dog/history - OHLC history for interactive chart
app.get('/api/dog/history', (req, res) => {
  try {
    const out = execSync('bash scripts/dog_ohlc.sh 60',
      { timeout: 8000, cwd: resolve(__dirname, '..') }).toString();
    const data = JSON.parse(out);
    let candles = [];
    const raw = (data.result && (data.result.DOGUSD || data.result.XDGUSD)) || data.DOGUSD || data.XDGUSD || Object.values(data)[0];
    if (Array.isArray(raw)) {
      candles = raw.slice(-48).map(c => ({
        time: parseInt(c[0]),
        open: parseFloat(c[1]),
        high: parseFloat(c[2]),
        low: parseFloat(c[3]),
        close: parseFloat(c[4]),
        vwap: parseFloat(c[5]),
        volume: parseFloat(c[6])
      }));
    }
    res.json({ pair: 'DOGUSD', interval: '60min', candles });
  } catch (e) {
    res.json({ pair: 'DOGUSD', interval: '60min', candles: [] });
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
  console.log('🐕 DOG Paper Coach Dashboard');
  console.log(`   Mode: PAPER ONLY / NO LIVE TRADING`);
  console.log(`   URL: http://${HOST}:${PORT}`);
  console.log(`   API: http://${HOST}:${PORT}/api/status`);
  console.log(`   Bind: ${HOST} (localhost only)`);
  console.log(`   Security: READ-ONLY, no orders possible`);
});

export default app;
