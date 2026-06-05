/**
 * Agent DOG - Telegram Bot
 * PAPER ONLY / NO LIVE TRADING
 */

import TelegramBot from 'node-telegram-bot-api';
import { config, validateConfig } from './config.js';
import { paperState } from './state.js';
import { initPaperTrading, previewPaperBuy, previewPaperSell, paperBuy, paperSell, getPaperStatus } from './kraken.js';
import {
  generateStartMessage,
  generateDogBrief,
  generateDailyBrief,
  generateRiskReport,
  generatePaperStatus,
  generateLastDecisions
} from './reporter.js';

// ============================================
// Safety Check
// ============================================
validateConfig();

if (!config.telegramBotToken) {
  console.error('❌ TELEGRAM_BOT_TOKEN manquant dans .env');
  console.error('   Copiez .env.example vers .env et ajoutez votre token');
  process.exit(1);
}

// ============================================
// Bot Initialization
// ============================================
const bot = new TelegramBot(config.telegramBotToken, { polling: true });

console.log('🐕 Agent DOG started');
console.log(`   Mode: ${config.tradingMode}`);
console.log(`   LLM: ${config.llmProvider}`);
console.log('   ⚠️  PAPER ONLY - NO LIVE TRADING');

// Initialize paper trading on startup
initPaperTrading(10000).then(result => {
  if (result.success) {
    console.log('   ✅ Paper trading initialized');
  } else {
    console.log('   ⚠️  Paper trading init:', result.error || 'already initialized');
  }
}).catch(err => {
  console.log('   ⚠️  Paper trading init failed:', err.message);
});

// ============================================
// Helper Functions
// ============================================

function formatPreview(pending, remainingSeconds) {
  const typeEmoji = pending.type === 'BUY' ? '🟢' : '🔴';
  const preview = pending.preview;
  
  return `
${typeEmoji} <b>Paper ${pending.type} Preview</b> [PAPER ONLY]

📊 <b>Ordre:</b>
  • Type: ${pending.type}
  • Paire: ${preview.pair}
  • Volume: ${preview.volume.toFixed(2)} DOG
  
💰 <b>Estimation:</b>
  • Prix: $${preview.price.toFixed(8)}
  • Coût: $${preview.cost.toFixed(6)}
  • Frais: $${preview.fee.toFixed(6)} (${(preview.feeRate * 100).toFixed(2)}%)
  • Total: $${(preview.cost + preview.fee).toFixed(6)}

⏱️ <b>Expiration:</b> ${remainingSeconds}s

✅ Tapez /confirm pour exécuter
❌ Tapez /cancel pour annuler

<i>Paper trading uniquement - Aucun argent réel</i>
`;
}

function formatOrderResult(result) {
  const typeEmoji = result.side === 'buy' ? '🟢' : '🔴';
  
  return `
${typeEmoji} <b>Paper Order Executed</b> [PAPER ONLY]

✅ <b>Ordre exécuté:</b>
  • ID: ${result.orderId}
  • Trade ID: ${result.tradeId}
  • Type: ${result.side.toUpperCase()}
  • Paire: ${result.pair}
  • Volume: ${result.volume.toFixed(2)} DOG
  • Prix: $${result.price.toFixed(8)}
  • Coût: $${result.cost.toFixed(6)}
  • Frais: $${result.fee.toFixed(6)}

🔒 <b>Mode:</b> ${result.mode.toUpperCase()}

<i>Paper trading via Kraken CLI - Aucun argent réel</i>
`;
}

function validateVolume(volumeStr) {
  const volume = parseFloat(volumeStr);
  
  if (isNaN(volume) || volume <= 0) {
    return { valid: false, error: 'Volume invalide. Doit être > 0.' };
  }
  
  return { valid: true, volume };
}

// ============================================
// Simple Text Router
// ============================================
bot.on('message', async (msg) => {
  // Only process text messages
  if (!msg.text) return;
  
  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const parts = text.split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);
  
  console.log(`[ROUTER] Command: ${command}, Args: ${args}`);
  
  try {
    // /start
    if (command === '/start') {
      const message = await generateStartMessage();
      bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      return;
    }
    
    // /dog
    if (command === '/dog') {
      paperState.addDecision({
        type: 'DOG_ANALYSIS',
        summary: 'Analyse DOG demandée',
        symbol: 'DOG'
      });
      const message = await generateDogBrief();
      bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      return;
    }
    
    // /brief
    if (command === '/brief') {
      const message = await generateDailyBrief();
      bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      return;
    }
    
    // /risk
    if (command === '/risk') {
      const message = await generateRiskReport();
      bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      return;
    }
    
    // /paper_status
    if (command === '/paper_status') {
      const message = await generatePaperStatus();
      bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      return;
    }
    
    // /last_decisions
    if (command === '/last_decisions') {
      bot.sendMessage(chatId, generateLastDecisions(), { parse_mode: 'HTML' });
      return;
    }
    
    // /paper_preview_buy <volume>
    if (command === '/paper_preview_buy') {
      console.log('[ROUTER] Handling /paper_preview_buy');
      
      if (args.length === 0) {
        bot.sendMessage(chatId, '❌ Usage: /paper_preview_buy <volume>\nExemple: /paper_preview_buy 100', { parse_mode: 'HTML' });
        return;
      }
      
      const volumeStr = args[0];
      const validation = validateVolume(volumeStr);
      
      if (!validation.valid) {
        bot.sendMessage(chatId, `❌ ${validation.error}`, { parse_mode: 'HTML' });
        return;
      }
      
      const volume = validation.volume;
      console.log(`[ROUTER] Volume: ${volume}`);
      
      if (paperState.hasPendingConfirmation()) {
        bot.sendMessage(chatId, '⚠️ Une confirmation est déjà en attente. Tapez /cancel d\'abord.', { parse_mode: 'HTML' });
        return;
      }
      
      bot.sendMessage(chatId, '🔄 Calcul du preview...', { parse_mode: 'HTML' });
      
      const preview = await previewPaperBuy(volume);
      console.log(`[ROUTER] Preview result: ${JSON.stringify(preview)}`);
      
      if (!preview.success) {
        bot.sendMessage(chatId, `❌ Preview failed: ${preview.error}`, { parse_mode: 'HTML' });
        return;
      }
      
      // Check max cost (5% of portfolio)
      const paperStatus = await getPaperStatus();
      if (paperStatus.success) {
        const maxCost = paperStatus.currentValue * 0.05;
        const totalCost = preview.cost + preview.fee;
        
        if (totalCost > maxCost) {
          bot.sendMessage(chatId, `❌ Coût trop élevé ($${totalCost.toFixed(4)}) > 5% du portfolio ($${maxCost.toFixed(2)}). Réduisez le volume.`, { parse_mode: 'HTML' });
          return;
        }
      }
      
      const pending = paperState.createPendingConfirmation('BUY', volume, preview);
      const remainingSeconds = Math.floor((pending.expiresAt - Date.now()) / 1000);
      
      bot.sendMessage(chatId, formatPreview(pending, remainingSeconds), { parse_mode: 'HTML' });
      return;
    }
    
    // /paper_preview_sell <volume>
    if (command === '/paper_preview_sell') {
      console.log('[ROUTER] Handling /paper_preview_sell');
      
      if (args.length === 0) {
        bot.sendMessage(chatId, '❌ Usage: /paper_preview_sell <volume>\nExemple: /paper_preview_sell 100', { parse_mode: 'HTML' });
        return;
      }
      
      const volumeStr = args[0];
      const validation = validateVolume(volumeStr);
      
      if (!validation.valid) {
        bot.sendMessage(chatId, `❌ ${validation.error}`, { parse_mode: 'HTML' });
        return;
      }
      
      const volume = validation.volume;
      console.log(`[ROUTER] Volume: ${volume}`);
      
      if (paperState.hasPendingConfirmation()) {
        bot.sendMessage(chatId, '⚠️ Une confirmation est déjà en attente. Tapez /cancel d\'abord.', { parse_mode: 'HTML' });
        return;
      }
      
      bot.sendMessage(chatId, '🔄 Calcul du preview...', { parse_mode: 'HTML' });
      
      const preview = await previewPaperSell(volume);
      console.log(`[ROUTER] Preview result: ${JSON.stringify(preview)}`);
      
      if (!preview.success) {
        bot.sendMessage(chatId, `❌ Preview failed: ${preview.error}`, { parse_mode: 'HTML' });
        return;
      }
      
      const pending = paperState.createPendingConfirmation('SELL', volume, preview);
      const remainingSeconds = Math.floor((pending.expiresAt - Date.now()) / 1000);
      
      bot.sendMessage(chatId, formatPreview(pending, remainingSeconds), { parse_mode: 'HTML' });
      return;
    }
    
    // /confirm
    if (command === '/confirm') {
      console.log('[ROUTER] Handling /confirm');
      
      const pending = paperState.getPendingConfirmation();
      
      if (!pending) {
        bot.sendMessage(chatId, '❌ Aucune confirmation en attente. Utilisez /paper_preview_buy ou /paper_preview_sell d\'abord.', { parse_mode: 'HTML' });
        return;
      }
      
      bot.sendMessage(chatId, '🔄 Exécution de l\'ordre...', { parse_mode: 'HTML' });
      
      let result;
      if (pending.type === 'BUY') {
        result = await paperBuy(pending.volume);
      } else {
        result = await paperSell(pending.volume);
      }
      
      paperState.clearPendingConfirmation();
      
      if (!result.success) {
        bot.sendMessage(chatId, `❌ Erreur exécution: ${result.error}`, { parse_mode: 'HTML' });
        return;
      }
      
      paperState.addDecision({
        type: `PAPER_${pending.type}`,
        summary: `${pending.type} ${pending.volume} DOG @ $${result.price}`,
        symbol: 'DOG',
        volume: pending.volume,
        price: result.price,
        cost: result.cost,
        fee: result.fee
      });
      
      bot.sendMessage(chatId, formatOrderResult(result), { parse_mode: 'HTML' });
      return;
    }
    
    // /cancel
    if (command === '/cancel') {
      console.log('[ROUTER] Handling /cancel');
      
      if (!paperState.hasPendingConfirmation()) {
        bot.sendMessage(chatId, '❌ Aucune confirmation en attente.', { parse_mode: 'HTML' });
        return;
      }
      
      paperState.clearPendingConfirmation();
      bot.sendMessage(chatId, '✅ Confirmation annulée.', { parse_mode: 'HTML' });
      return;
    }
    
  } catch (err) {
    console.error('[ROUTER] Error:', err);
    bot.sendMessage(chatId, `❌ Error: ${err.message}`, { parse_mode: 'HTML' });
  }
});

// ============================================
// Error Handling
// ============================================
bot.on('error', (err) => {
  console.error('❌ Bot error:', err.message);
});

bot.on('polling_error', (err) => {
  console.error('❌ Polling error:', err.message);
});

// ============================================
// Graceful Shutdown
// ============================================
process.on('SIGINT', () => {
  console.log('\n👋 Arrêt du bot...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Arrêt du bot...');
  bot.stopPolling();
  process.exit(0);
});
