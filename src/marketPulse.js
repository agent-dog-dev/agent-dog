// Market Pulse — RSI/EMA/VWAP from OHLC
// Read-only, cache 10s, no secrets

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CACHE_TTL = 10000; // 10s
let cache = null;
let cacheTime = 0;

const KRAKEN_BIN = path.join(__dirname, '..', 'kraken-cli-aarch64-apple-darwin', 'kraken');

function execKraken(args) {
  try {
    const cmd = `"${KRAKEN_BIN}" ${args} 2>/dev/null`;
    const out = execSync(cmd, { encoding: 'utf8', timeout: 10000 });
    return JSON.parse(out);
  } catch {
    return null;
  }
}

// Parse OHLC: [time, open, high, low, close, vwap, volume, count]
function parseOHLC(data) {
  if (!data || !data.DOGUSD || !Array.isArray(data.DOGUSD)) return [];
  return data.DOGUSD.map(c => ({
    time: c[0] * 1000,
    open: parseFloat(c[1]),
    high: parseFloat(c[2]),
    low: parseFloat(c[3]),
    close: parseFloat(c[4]),
    vwap: parseFloat(c[5]),
    volume: parseFloat(c[6]),
    count: c[7]
  })).filter(c => c.close > 0);
}

function calculateEMA(closes, period) {
  if (closes.length < period) return null;
  const k = 2 / (period + 1);
  let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
  }
  return ema;
}

function calculateRSI(closes, period = 14) {
  if (closes.length < period + 1) return null;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const change = closes[closes.length - i] - closes[closes.length - i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - (100 / (1 + rs));
}

function calculateVWAP(candles) {
  if (candles.length === 0) return null;
  let totalVol = 0, totalPV = 0;
  for (const c of candles) {
    const typical = (c.high + c.low + c.close) / 3;
    totalPV += typical * c.volume;
    totalVol += c.volume;
  }
  return totalVol > 0 ? totalPV / totalVol : null;
}

function volumeImpulse(candles) {
  if (candles.length < 6) return null;
  const recent = candles.slice(-3).reduce((a, c) => a + c.volume, 0) / 3;
  const prev = candles.slice(-6, -3).reduce((a, c) => a + c.volume, 0) / 3;
  return prev > 0 ? (recent / prev - 1) * 100 : null;
}

async function getMarketPulse() {
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_TTL) {
    return cache;
  }

  const raw = execKraken('ohlc DOGUSD --interval 5 -o json');
  const candles = parseOHLC(raw);

  if (candles.length < 30) {
    return {
      error: 'Insufficient data',
      candlesCount: candles.length,
      source: 'kraken-cli',
      timestamp: new Date().toISOString()
    };
  }

  const closes = candles.map(c => c.close);
  const rsi = calculateRSI(closes, 14);
  const ema9 = calculateEMA(closes, 9);
  const ema21 = calculateEMA(closes, 21);
  const vwap = calculateVWAP(candles);
  const volImpulse = volumeImpulse(candles);

  // Signal context based on RSI + EMA trend
  let signalContext = 'neutral';
  if (rsi !== null && ema9 !== null && ema21 !== null) {
    const emaBullish = ema9 > ema21;
    const rsiStrong = rsi > 60;
    const rsiWeak = rsi < 40;
    if (emaBullish && rsiStrong) signalContext = 'bullish';
    else if (!emaBullish && rsiWeak) signalContext = 'bearish';
    else if (rsi > 70) signalContext = 'overbought';
    else if (rsi < 30) signalContext = 'oversold';
  }

  const result = {
    rsi: rsi !== null ? Math.round(rsi * 10) / 10 : null,
    ema9: ema9 !== null ? Math.round(ema9 * 1e8) / 1e8 : null,
    ema21: ema21 !== null ? Math.round(ema21 * 1e8) / 1e8 : null,
    vwap: vwap !== null ? Math.round(vwap * 1e8) / 1e8 : null,
    volumeImpulse: volImpulse !== null ? Math.round(volImpulse * 10) / 10 : null,
    signalContext,
    candlesCount: candles.length,
    source: 'kraken-cli',
    cached: false,
    timestamp: new Date().toISOString()
  };

  cache = { ...result, cached: true };
  cacheTime = now;
  return result;
}

export { getMarketPulse };
