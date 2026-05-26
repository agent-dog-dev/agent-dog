/**
 * DOG Paper Coach - State Management
 * PAPER ONLY / NO LIVE TRADING
 */

import { config } from './config.js';

// ============================================
// Paper Trading State
// ============================================
class PaperState {
  constructor() {
    this.balanceUsd = config.paperBalanceUsd;
    this.positions = new Map(); // symbol -> position
    this.trades = []; // history
    this.decisions = []; // last decisions
    this.startedAt = new Date().toISOString();
    
    // Pending confirmation for manual orders
    this.pendingConfirmation = null;
  }
  
  /**
   * Create a pending confirmation for paper order
   * @param {string} type - 'BUY' or 'SELL'
   * @param {number} volume - Volume in DOG
   * @param {Object} preview - Preview data from Kraken CLI
   * @returns {Object} Confirmation object
   */
  createPendingConfirmation(type, volume, preview) {
    this.pendingConfirmation = {
      type: type.toUpperCase(),
      volume: parseFloat(volume),
      preview: preview,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60000 // 60 seconds expiration
    };
    return this.pendingConfirmation;
  }
  
  /**
   * Get pending confirmation if valid
   * @returns {Object|null} Valid confirmation or null
   */
  getPendingConfirmation() {
    if (!this.pendingConfirmation) return null;
    
    if (Date.now() > this.pendingConfirmation.expiresAt) {
      this.pendingConfirmation = null;
      return null;
    }
    
    return this.pendingConfirmation;
  }
  
  /**
   * Clear pending confirmation
   */
  clearPendingConfirmation() {
    this.pendingConfirmation = null;
  }
  
  /**
   * Check if there's a valid pending confirmation
   * @returns {boolean}
   */
  hasPendingConfirmation() {
    return this.getPendingConfirmation() !== null;
  }

  getPortfolio() {
    const positionsValue = Array.from(this.positions.values())
      .reduce((sum, pos) => sum + (pos.valueUsd || 0), 0);
    
    return {
      balanceUsd: this.balanceUsd,
      positionsValue,
      totalValue: this.balanceUsd + positionsValue,
      pnlUsd: (this.balanceUsd + positionsValue) - config.paperBalanceUsd,
      pnlPct: ((this.balanceUsd + positionsValue) / config.paperBalanceUsd - 1) * 100,
      positionCount: this.positions.size,
      tradeCount: this.trades.length
    };
  }

  addDecision(decision) {
    this.decisions.unshift({
      ...decision,
      timestamp: new Date().toISOString(),
      id: `dec_${Date.now()}`
    });
    // Keep only last 20
    if (this.decisions.length > 20) {
      this.decisions = this.decisions.slice(0, 20);
    }
  }

  getLastDecisions(limit = 5) {
    return this.decisions.slice(0, limit);
  }

  // Mock: Simulate a paper trade (no real execution)
  simulateTrade(symbol, side, amountUsd, price) {
    const trade = {
      id: `trade_${Date.now()}`,
      symbol,
      side,
      amountUsd,
      price,
      timestamp: new Date().toISOString(),
      mode: 'PAPER'
    };
    this.trades.push(trade);
    
    // Update balance (simplified)
    if (side === 'BUY') {
      this.balanceUsd -= amountUsd;
    } else {
      this.balanceUsd += amountUsd;
    }
    
    return trade;
  }
}

// Singleton instance
export const paperState = new PaperState();

export default paperState;