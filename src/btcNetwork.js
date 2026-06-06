// BTC Network Context — mempool.space integration
// Read-only, cache 30s, no secrets

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KRAKEN_BIN = path.join(__dirname, '..', 'kraken-cli-aarch64-apple-darwin', 'kraken');

const CACHE_TTL = 30000; // 30s
let cache = null;
let cacheTime = 0;

async function getBtcPriceKraken() {
  try {
    const out = execSync(`"${KRAKEN_BIN}" ticker XBTUSD -o json 2>/dev/null`, { timeout: 4000 }).toString();
    const data = JSON.parse(out);
    // Kraken format: {"XXBTZUSD":{"c":["price","volume"]}}
    const pair = data?.XXBTZUSD || data?.XBTUSD;
    const last = pair?.c?.[0];
    return last ? parseFloat(last) : null;
  } catch (e) {
    return null;
  }
}

async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

async function getBtcNetwork() {
  const now = Date.now();
  if (cache && now - cacheTime < CACHE_TTL) {
    return cache;
  }

  const [fees, blocks, mempool] = await Promise.all([
    fetchWithTimeout('https://mempool.space/api/v1/fees/recommended'),
    fetchWithTimeout('https://mempool.space/api/blocks'),
    fetchWithTimeout('https://mempool.space/api/mempool')
  ]);

  if (!fees || !blocks || !mempool) {
    return null;
  }

  const latestBlocks = blocks.slice(0, 4).map(b => ({
    height: b.height,
    txs: b.tx_count,
    size: b.size,
    time: b.timestamp
  }));

  // Get BTC price from Kraken CLI (XBTUSD)
  const btcPrice = await getBtcPriceKraken();

  const result = {
    lowFee: fees.economyFee ?? fees.hourFee ?? null,
    mediumFee: fees.halfHourFee ?? null,
    fastFee: fees.fastestFee ?? null,
    mempoolTxs: mempool.count ?? null,
    vmbSize: mempool.vsize ? Math.round(mempool.vsize / 1e6 * 10) / 10 : null, // MB
    btcPrice,
    latestBlocks,
    source: 'mempool.space',
    cached: false,
    timestamp: new Date().toISOString()
  };

  cache = { ...result, cached: true };
  cacheTime = now;
  return result;
}

export { getBtcNetwork };
