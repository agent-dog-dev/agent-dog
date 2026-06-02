// PF_DOGUSD Perpetual — READ-ONLY market data from Kraken Futures.
// Informational only. No orders are ever placed (futures trading requires auth we never use).

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KRAKEN_BIN = path.join(__dirname, '..', 'kraken-cli-aarch64-apple-darwin', 'kraken');

const CACHE_TTL = 30000; // 30s
let cache = null;
let cacheTime = 0;

function getPerps() {
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_TTL) return cache;

  let result = { available: false, readOnly: true };
  try {
    const out = execSync(`"${KRAKEN_BIN}" futures ticker PF_DOGUSD -o json 2>/dev/null`, {
      encoding: 'utf8',
      timeout: 10000
    });
    const data = JSON.parse(out);
    const t = data.ticker;
    if (t) {
      const idx = Number(t.indexPrice) || 0;
      const fr = Number(t.fundingRate) || 0;
      result = {
        available: true,
        readOnly: true,
        symbol: t.symbol || 'PF_DOGUSD',
        markPrice: Number(t.markPrice) || 0,
        indexPrice: idx,
        last: Number(t.last) || 0,
        change24h: Number(t.change24h) || 0,
        // relative funding rate (%) = fundingRate / indexPrice
        fundingRatePct: idx > 0 ? Math.round((fr / idx) * 100 * 1e6) / 1e6 : 0,
        openInterest: Number(t.openInterest) || 0,
        vol24h: Number(t.vol24h) || 0,
        suspended: !!t.suspended
      };
    }
  } catch {
    result = { available: false, readOnly: true };
  }
  result.timestamp = new Date().toISOString();
  cache = result;
  cacheTime = now;
  return result;
}

export { getPerps };
