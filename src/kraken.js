/**
 * Agent DOG - Kraken CLI Wrapper
 * PAPER ONLY / NO LIVE TRADING
 * Safe wrapper around kraken CLI binary
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import { existsSync } from 'fs';
import './config.js'; // loads .env before env/binary resolution

const execFileAsync = promisify(execFile);

// Path to kraken CLI binary:
// 1. KRAKEN_CLI_BIN env var (explicit override)
// 2. repo-local extracted release folder
// 3. `kraken` on PATH (official installer puts it there)
const LOCAL_BIN = resolve(process.cwd(), 'kraken-cli-aarch64-apple-darwin', 'kraken');
const KRAKEN_BIN = process.env.KRAKEN_CLI_BIN || (existsSync(LOCAL_BIN) ? LOCAL_BIN : 'kraken');
const DEFAULT_TIMEOUT = 10000; // 10s timeout

/**
 * Execute kraken CLI command safely
 * @param {string[]} args - CLI arguments
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<Object>} Parsed JSON response
 */
async function krakenExec(args, timeout = DEFAULT_TIMEOUT) {
  try {
    const { stdout, stderr } = await execFileAsync(KRAKEN_BIN, args, {
      timeout,
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 // 1MB buffer
    });
    
    if (stderr && stderr.trim()) {
      console.warn('[Kraken CLI stderr]:', stderr.trim());
    }
    
    // Parse JSON output
    return JSON.parse(stdout);
  } catch (error) {
    if (error.code === 'ETIMEDOUT') {
      throw new Error('Kraken CLI timeout');
    }
    if (error.stderr) {
      throw new Error(`Kraken CLI error: ${error.stderr}`);
    }
    throw new Error(`Kraken CLI failed: ${error.message}`);
  }
}

/**
 * Check if Kraken CLI is available
 * @returns {Promise<{available: boolean, version: string|null, error: string|null}>}
 */
export async function getCliStatus() {
  try {
    // --version outputs plain text, handle separately
    const { stdout } = await execFileAsync(KRAKEN_BIN, ['--version'], {
      timeout: 5000,
      encoding: 'utf-8'
    });
    return {
      available: true,
      version: stdout.toString().trim(),
      error: null
    };
  } catch (error) {
    return {
      available: false,
      version: null,
      error: error.message
    };
  }
}

/**
 * Get DOGUSD ticker from Kraken
 * @returns {Promise<Object>} Ticker data or fallback
 */
export async function getDogTicker() {
  try {
    const data = await krakenExec(['ticker', 'DOGUSD', '-o', 'json']);
    
    if (!data.DOGUSD) {
      throw new Error('DOGUSD not in response');
    }
    
    const t = data.DOGUSD;
    return {
      success: true,
      pair: 'DOGUSD',
      bid: parseFloat(t.b[0]),
      ask: parseFloat(t.a[0]),
      last: parseFloat(t.c[0]),
      high: parseFloat(t.h[1]),
      low: parseFloat(t.l[1]),
      volume: parseFloat(t.v[1]),
      vwap: parseFloat(t.p[1]),
      trades: t.t[1],
      source: 'kraken-cli',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[getDogTicker] Failed:', error.message);
    return {
      success: false,
      error: error.message,
      fallback: true
    };
  }
}

/**
 * Get paper trading status
 * @returns {Promise<Object>} Paper status or fallback
 */
export async function getPaperStatus() {
  try {
    const data = await krakenExec(['paper', 'status', '-o', 'json']);
    
    return {
      success: true,
      mode: data.mode,
      startingBalance: data.starting_balance,
      currentValue: data.current_value,
      totalTrades: data.total_trades,
      openOrders: data.open_orders,
      unrealizedPnl: data.unrealized_pnl,
      unrealizedPnlPct: data.unrealized_pnl_pct,
      feeRate: data.fee_rate,
      slippageRate: data.slippage_rate,
      source: 'kraken-cli',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[getPaperStatus] Failed:', error.message);
    return {
      success: false,
      error: error.message,
      fallback: true
    };
  }
}

/**
 * Initialize paper trading if not already done
 * @param {number} balance - Starting balance in USD
 * @returns {Promise<Object>} Init result
 */
export async function initPaperTrading(balance = 10000) {
  try {
    const data = await krakenExec(['paper', 'init', '--balance', balance.toString(), '-o', 'json']);
    return {
      success: true,
      action: data.action,
      mode: data.mode,
      startingBalance: data.starting_balance,
      feeRate: data.fee_rate
    };
  } catch (error) {
    // May fail if already initialized, that's OK
    if (error.message.includes('already initialized') || error.message.includes('already exists')) {
      return {
        success: true,
        alreadyInitialized: true
      };
    }
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Preview paper buy order (estimated, no execution)
 * @param {number} volume - Volume in DOG
 * @returns {Promise<Object>} Preview result
 */
export async function previewPaperBuy(volume) {
  try {
    // Get current ticker for price estimation
    const ticker = await getDogTicker();
    if (!ticker.success) {
      throw new Error('Cannot get ticker for preview');
    }
    
    // Get paper status for fee rate
    const paperStatus = await getPaperStatus();
    const feeRate = paperStatus.success ? paperStatus.feeRate : 0.0026;
    
    const price = ticker.ask; // Buy at ask
    const cost = volume * price;
    const fee = cost * feeRate;
    
    return {
      success: true,
      preview: true,
      side: 'buy',
      pair: 'DOGUSD',
      volume: parseFloat(volume),
      price: price,
      cost: cost,
      fee: fee,
      feeRate: feeRate,
      mode: 'paper'
    };
  } catch (error) {
    console.error('[previewPaperBuy] Failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Preview paper sell order (estimated, no execution)
 * @param {number} volume - Volume in DOG
 * @returns {Promise<Object>} Preview result
 */
export async function previewPaperSell(volume) {
  try {
    // Get current ticker for price estimation
    const ticker = await getDogTicker();
    if (!ticker.success) {
      throw new Error('Cannot get ticker for preview');
    }
    
    // Get paper status for fee rate
    const paperStatus = await getPaperStatus();
    const feeRate = paperStatus.success ? paperStatus.feeRate : 0.0026;
    
    const price = ticker.bid; // Sell at bid
    const cost = volume * price;
    const fee = cost * feeRate;
    
    return {
      success: true,
      preview: true,
      side: 'sell',
      pair: 'DOGUSD',
      volume: parseFloat(volume),
      price: price,
      cost: cost,
      fee: fee,
      feeRate: feeRate,
      mode: 'paper'
    };
  } catch (error) {
    console.error('[previewPaperSell] Failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Execute paper buy order
 * @param {number} volume - Volume in DOG
 * @returns {Promise<Object>} Order result
 */
export async function paperBuy(volume) {
  try {
    const data = await krakenExec(['paper', 'buy', 'DOGUSD', volume.toString(), '-o', 'json']);
    return {
      success: true,
      action: data.action,
      orderId: data.order_id,
      tradeId: data.trade_id,
      side: 'buy',
      pair: data.pair,
      volume: parseFloat(data.volume),
      price: parseFloat(data.price),
      cost: parseFloat(data.cost),
      fee: parseFloat(data.fee),
      feeRate: parseFloat(data.fee_rate),
      mode: data.mode
    };
  } catch (error) {
    console.error('[paperBuy] Failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Execute paper sell order
 * @param {number} volume - Volume in DOG
 * @returns {Promise<Object>} Order result
 */
export async function paperSell(volume) {
  try {
    const data = await krakenExec(['paper', 'sell', 'DOGUSD', volume.toString(), '-o', 'json']);
    return {
      success: true,
      action: data.action,
      orderId: data.order_id,
      tradeId: data.trade_id,
      side: 'sell',
      pair: data.pair,
      volume: parseFloat(data.volume),
      price: parseFloat(data.price),
      cost: parseFloat(data.cost),
      fee: parseFloat(data.fee),
      feeRate: parseFloat(data.fee_rate),
      mode: data.mode
    };
  } catch (error) {
    console.error('[paperSell] Failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validate the DOGUSD pair + metadata via `kraken pairs` (READ-ONLY, public).
 * Confirms $DOG on Bitcoin Runes — base asset is DOG, never Dogecoin (XDG).
 * @returns {Promise<Object>}
 */
export async function getPairInfo() {
  try {
    const data = await krakenExec(['pairs', '--pair', 'DOGUSD', '-o', 'json']);
    const p = data && data.DOGUSD;
    if (!p) throw new Error('DOGUSD not returned by kraken pairs');
    const takerFee = Array.isArray(p.fees) && p.fees[0] ? p.fees[0][1] : null;
    const makerFee = Array.isArray(p.fees_maker) && p.fees_maker[0] ? p.fees_maker[0][1] : null;
    return {
      success: true,
      pair: 'DOGUSD',
      base: p.base,              // "DOG" → Bitcoin Runes, not Dogecoin
      quote: p.quote,            // "ZUSD"
      wsname: p.wsname,          // "DOG/USD"
      status: p.status,          // "online"
      verified: p.base === 'DOG' && p.altname === 'DOGUSD',
      isDogecoin: p.base === 'XDG' || p.base === 'XXDG',
      ordermin: p.ordermin,
      costmin: p.costmin,
      tickSize: p.tick_size,
      pairDecimals: p.pair_decimals,
      lotDecimals: p.lot_decimals,
      takerFeePct: takerFee,
      makerFeePct: makerFee,
      source: 'kraken-cli',
      command: 'kraken pairs --pair DOGUSD',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[getPairInfo] Failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Recent DOGUSD bid/ask spreads via `kraken spreads` (READ-ONLY microstructure).
 * Returns current + average/min/max spread % over the recent window.
 * @returns {Promise<Object>}
 */
export async function getSpreads() {
  const round2 = (x) => Math.round(x * 100) / 100;
  try {
    const data = await krakenExec(['spreads', 'DOGUSD', '-o', 'json']);
    const arr = (data && data.DOGUSD) || [];
    if (!Array.isArray(arr) || arr.length === 0) throw new Error('No DOGUSD spreads');
    const pts = arr.map((e) => {
      const bid = parseFloat(e[1]);
      const ask = parseFloat(e[2]);
      const mid = (bid + ask) / 2;
      return { time: parseInt(e[0]), bid, ask, spreadPct: mid > 0 ? ((ask - bid) / mid) * 100 : 0 };
    }).filter((p) => isFinite(p.spreadPct));
    if (!pts.length) throw new Error('No valid spread points');
    const recent = pts.slice(-60);
    const pcts = recent.map((p) => p.spreadPct);
    const avg = pcts.reduce((s, x) => s + x, 0) / pcts.length;
    const last = pts[pts.length - 1];
    return {
      success: true,
      pair: 'DOGUSD',
      current: { bid: last.bid, ask: last.ask, spreadPct: round2(last.spreadPct) },
      avgPct: round2(avg),
      minPct: round2(Math.min.apply(null, pcts)),
      maxPct: round2(Math.max.apply(null, pcts)),
      samples: pts.length,
      source: 'kraken-cli',
      command: 'kraken spreads DOGUSD',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[getSpreads] Failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Read-only Kraken account snapshot via `kraken balance` (READ-ONLY, authenticated).
 * Reads KRAKEN_API_KEY + KRAKEN_API_SECRET from env (the CLI consumes them automatically).
 * NEVER places an order or withdraws — it only READS balances.
 * Returns { connected:false, configured:false } when no key is set (paper-only).
 * @returns {Promise<Object>}
 */
export async function getKrakenAccount() {
  if (!process.env.KRAKEN_API_KEY || !process.env.KRAKEN_API_SECRET) {
    return { connected: false, configured: false };
  }
  try {
    const data = await krakenExec(['balance', '-o', 'json']);
    if (data && data.error) {
      return { connected: false, configured: true, error: String(data.message || data.error) };
    }
    const balances = {};
    let usd = 0;
    let dog = 0;
    for (const [asset, amt] of Object.entries(data || {})) {
      const n = parseFloat(amt);
      if (!isFinite(n) || n === 0) continue;
      balances[asset] = n;
      if (asset === 'ZUSD' || asset === 'USD') usd += n;
      if (asset === 'DOG') dog += n;
    }
    return {
      connected: true,
      configured: true,
      usd,
      dog,
      balances,
      source: 'kraken-cli',
      command: 'kraken balance',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[getKrakenAccount] Failed:', error.message);
    return { connected: false, configured: true, error: error.message };
  }
}

/**
 * Paper trade history — the bot's executed paper trades via `kraken paper history` (READ-ONLY, simulated).
 * @returns {Promise<Object>}
 */
export async function getPaperTrades() {
  try {
    const data = await krakenExec(['paper', 'history', '-o', 'json']);
    const filled = Array.isArray(data.trades) ? data.trades.filter((t) => t.status === 'filled') : [];
    filled.sort((a, b) => new Date(b.time) - new Date(a.time));
    return {
      success: true,
      count: filled.length,
      trades: filled.map((t) => ({
        id: t.id,
        time: t.time,
        side: t.side,
        pair: t.pair,
        price: parseFloat(t.price),
        volume: parseFloat(t.volume),
        cost: parseFloat(t.cost),
        fee: parseFloat(t.fee)
      })),
      source: 'kraken-cli',
      command: 'kraken paper history',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[getPaperTrades] Failed:', error.message);
    return { success: false, error: error.message, trades: [] };
  }
}

export default {
  getCliStatus,
  getDogTicker,
  getPaperStatus,
  initPaperTrading,
  previewPaperBuy,
  previewPaperSell,
  paperBuy,
  paperSell,
  getPairInfo,
  getSpreads,
  getKrakenAccount,
  getPaperTrades
};