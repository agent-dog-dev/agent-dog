// Paper Track Record — realized P&L from Kraken paper trade history (READ-ONLY).
// Average-cost method, fees included in the cost basis. No live trading involved.

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KRAKEN_BIN = path.join(__dirname, '..', 'kraken-cli-aarch64-apple-darwin', 'kraken');

const CACHE_TTL = 5000; // 5s
let cache = null;
let cacheTime = 0;

function getPaperPnl() {
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_TTL) return cache;

  let trades = [];
  try {
    const out = execSync(`"${KRAKEN_BIN}" paper history -o json 2>/dev/null`, { encoding: 'utf8', timeout: 10000 });
    const data = JSON.parse(out);
    trades = Array.isArray(data.trades) ? data.trades.filter(t => t.status === 'filled') : [];
  } catch {
    trades = [];
  }

  // Oldest -> newest
  trades.sort((a, b) => new Date(a.time) - new Date(b.time));

  let pos = 0, basis = 0, realized = 0, fees = 0, closes = 0, wins = 0;
  const series = [];
  for (const t of trades) {
    const vol = Number(t.volume) || 0;
    const price = Number(t.price) || 0;
    const fee = Number(t.fee) || 0;
    fees += fee;
    if (t.side === 'buy') {
      basis = (pos + vol) > 0 ? (basis * pos + price * vol + fee) / (pos + vol) : price;
      pos += vol;
    } else { // sell
      const matched = Math.min(vol, pos);
      const pnl = (price - basis) * matched - fee;
      realized += pnl;
      closes++;
      if (pnl > 0) wins++;
      pos = Math.max(0, pos - matched);
    }
    series.push({ time: t.time, side: t.side, price, volume: vol, realized: Math.round(realized * 100) / 100 });
  }

  const result = {
    realized: Math.round(realized * 100) / 100,
    totalFees: Math.round(fees * 1000) / 1000,
    openPosition: Math.round(pos),
    trades: trades.length,
    closes,
    winRate: closes ? Math.round((wins / closes) * 100) : null,
    series,
    source: 'kraken-cli',
    timestamp: new Date().toISOString()
  };
  cache = result;
  cacheTime = now;
  return result;
}

export { getPaperPnl };
