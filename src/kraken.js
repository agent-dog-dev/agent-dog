/**
 * DOG Paper Coach - Kraken CLI Wrapper
 * PAPER ONLY / NO LIVE TRADING
 * Safe wrapper around kraken CLI binary
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';

const execFileAsync = promisify(execFile);

// Path to kraken CLI binary
const KRAKEN_BIN = resolve(process.cwd(), 'kraken-cli-aarch64-apple-darwin', 'kraken');
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

export default {
  getCliStatus,
  getDogTicker,
  getPaperStatus,
  initPaperTrading,
  previewPaperBuy,
  previewPaperSell,
  paperBuy,
  paperSell
};