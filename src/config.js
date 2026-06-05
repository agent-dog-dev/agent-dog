/**
 * Agent DOG - Configuration
 * PAPER ONLY / NO LIVE TRADING
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env if present (optional for check, required for telegram)
const envPath = resolve(process.cwd(), '.env');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  });
} catch {
  // .env optional - will use defaults
}

// ============================================
// SAFETY CONSTANTS (NEVER MODIFY)
// ============================================
export const TRADING_MODE = 'PAPER';
export const LIVE_TRADING_ENABLED = false;

// ============================================
// Configuration
// ============================================
export const config = {
  // Safety
  tradingMode: TRADING_MODE,
  liveTradingEnabled: LIVE_TRADING_ENABLED,
  
  // Telegram
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || null,
  
  // LLM
  llmProvider: process.env.LLM_PROVIDER || 'none',
  
  // Paper trading
  paperBalanceUsd: parseFloat(process.env.PAPER_BALANCE_USD || '10000'),
  
  // Bot info
  botName: 'Agent DOG',
  version: '0.1.0'
};

// ============================================
// Validation
// ============================================
export function validateConfig() {
  if (config.tradingMode !== 'PAPER') {
    throw new Error('FATAL: TRADING_MODE must be PAPER');
  }
  if (config.liveTradingEnabled !== false) {
    throw new Error('FATAL: LIVE_TRADING_ENABLED must be false');
  }
  return true;
}

// Auto-validate on import
validateConfig();

export default config;