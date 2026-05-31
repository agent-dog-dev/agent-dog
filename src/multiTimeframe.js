// Multi-Timeframe Trend — READ-ONLY, informational.
// IMPORTANT: This does NOT affect the deterministic Pack Index / Compass decision.
// It only displays the recent price direction on 15m / 1h / 4h candles.

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KRAKEN_BIN = path.join(__dirname, '..', 'kraken-cli-aarch64-apple-darwin', 'kraken');

const CACHE_TTL = 30000; // 30s
let cache = null;
let cacheTime = 0;

function ohlcCloses(interval) {
  try {
    const out = execSync(`"${KRAKEN_BIN}" ohlc DOGUSD --interval ${interval} -o json 2>/dev/null`, {
      encoding: 'utf8',
      timeout: 10000
    });
    const data = JSON.parse(out);
    const arr = data.DOGUSD || data.XDGUSD || Object.values(data)[0] || [];
    return arr.map(c => parseFloat(c[4])).filter(x => x > 0); // close prices
  } catch {
    return [];
  }
}

function trendFor(interval) {
  const closes = ohlcCloses(interval);
  if (closes.length < 5) return { trend: 'n/a', changePct: 0 };
  const n = Math.min(12, closes.length - 1);
  const last = closes[closes.length - 1];
  const prev = closes[closes.length - 1 - n];
  const changePct = prev > 0 ? ((last - prev) / prev) * 100 : 0;
  const trend = changePct > 0.3 ? 'up' : changePct < -0.3 ? 'down' : 'flat';
  return { trend, changePct: Math.round(changePct * 100) / 100 };
}

async function getMultiTimeframe() {
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_TTL) return cache;

  const result = {
    pair: 'DOGUSD',
    note: 'Informational only — does not affect the deterministic Compass decision.',
    timeframes: [
      { tf: '15m', ...trendFor(15) },
      { tf: '1h', ...trendFor(60) },
      { tf: '4h', ...trendFor(240) }
    ],
    source: 'kraken-cli',
    timestamp: new Date().toISOString()
  };

  cache = result;
  cacheTime = now;
  return result;
}

export { getMultiTimeframe };
