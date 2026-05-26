// DOG/USD Live Trade Tape — Kraken CLI trades
// Read-only, cache 5s, no secrets

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CACHE_TTL = 5000; // 5s
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

function parseTrades(data) {
  if (!data || !data.DOGUSD || !Array.isArray(data.DOGUSD)) return [];
  // Kraken trades format: [price, volume, time, side, type, misc, id]
  return data.DOGUSD.slice(0, 20).map(t => ({
    price: parseFloat(t[0]),
    volume: parseFloat(t[1]),
    time: Math.floor(t[2] * 1000), // ms timestamp
    side: t[3] === 'b' ? 'buy' : t[3] === 's' ? 'sell' : 'unknown',
    type: t[4] === 'm' ? 'market' : t[4] === 'l' ? 'limit' : 'unknown'
  }));
}

async function getDogTrades() {
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_TTL) {
    return cache;
  }

  const raw = execKraken('trades DOGUSD -o json');
  const trades = parseTrades(raw);

  const result = {
    pair: 'DOGUSD',
    trades,
    count: trades.length,
    source: 'kraken-cli',
    cached: false,
    timestamp: new Date().toISOString()
  };

  cache = { ...result, cached: true };
  cacheTime = now;
  return result;
}

export { getDogTrades };
