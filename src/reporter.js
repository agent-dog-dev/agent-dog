/**
 * Agent DOG - Reporter
 * PAPER ONLY / NO LIVE TRADING
 * Real Kraken CLI data with mock fallback
 */

import { paperState } from './state.js';
import { getDogTicker, getPaperStatus, getCliStatus } from './kraken.js';
import { makeDecision, formatDecision, calculateMetrics, generateRiskFlags } from './strategy.js';

// ============================================
// Mock Data (Fallback only)
// ============================================
const MOCK_DOG_ANALYSIS = {
  symbol: 'DOG',
  sentiment: 'NEUTRAL',
  confidence: 0.65,
  signals: [
    { name: 'RSI', value: 52, signal: 'neutral' },
    { name: 'MACD', value: 0.12, signal: 'bullish' },
    { name: 'Volume', value: '1.2M', signal: 'normal' }
  ],
  recommendation: 'HOLD',
  reasoning: 'Marché latéral détecté. Attendre une cassure.'
};

const MOCK_RISK_METRICS = {
  portfolioHeat: 12.5,
  maxDrawdown: 8.2,
  sharpeRatio: 1.45,
  volatility: 15.3,
  riskLevel: 'MODERATE',
  suggestions: [
    'Réduire l\'exposition si le heat dépasse 20%',
    'Conserver un cash buffer de 30% minimum'
  ]
};

// ============================================
// Helper Functions
// ============================================

function formatPrice(price) {
  if (price < 0.001) {
    return price.toFixed(8);
  }
  return price.toFixed(6);
}

function formatVolume(vol) {
  if (vol >= 1000000) {
    return (vol / 1000000).toFixed(2) + 'M';
  }
  if (vol >= 1000) {
    return (vol / 1000).toFixed(2) + 'K';
  }
  return vol.toFixed(2);
}

function calculateChange(open, last) {
  const change = ((last - open) / open) * 100;
  return change;
}

// ============================================
// Report Generators with Real Data
// ============================================

export async function generateDogBrief() {
  const now = new Date().toLocaleString('fr-FR');
  const ticker = await getDogTicker();
  
  if (!ticker.success) {
    // Fallback to mock
    const analysis = MOCK_DOG_ANALYSIS;
    return `
🐕 <b>DOG Analysis</b> [PAPER ONLY]
⏰ ${now}

⚠️ <b>Kraken CLI unavailable — fallback mock</b>

📊 <b>Sentiment:</b> ${analysis.sentiment} (${Math.round(analysis.confidence * 100)}%)
🎯 <b>Recommandation:</b> ${analysis.recommendation}

📈 <b>Signaux:</b>
${analysis.signals.map(s => `  • ${s.name}: ${s.value} (${s.signal})`).join('\n')}

💡 <b>Raisonnement:</b>
${analysis.reasoning}

<i>Aucune action réelle - Simulation uniquement</i>
`;
  }
  
  const change = calculateChange(ticker.vwap, ticker.last);
  const changeEmoji = change >= 0 ? '🟢' : '🔴';
  
  // Get decision from strategy engine
  const decision = makeDecision(ticker);
  const formatted = formatDecision(decision);
  
  return `
🐕 <b>DOG Analysis</b> [PAPER ONLY]
⏰ ${now}

💰 <b>Prix DOGUSD (Kraken):</b>
  • Last: $${formatPrice(ticker.last)}
  • Bid: $${formatPrice(ticker.bid)}
  • Ask: $${formatPrice(ticker.ask)}
  • 24h High: $${formatPrice(ticker.high)}
  • 24h Low: $${formatPrice(ticker.low)}
  • VWAP: $${formatPrice(ticker.vwap)}
  • Volume: ${formatVolume(ticker.volume)}
  • Change: ${changeEmoji} ${change >= 0 ? '+' : ''}${change.toFixed(2)}%

🎯 <b>Decision Engine:</b>
  ${formatted.emoji} <b>${formatted.label}</b>
  • Confiance: ${formatted.confidence}%
  • Raisons:
${formatted.reasons.map(r => `    - ${r}`).join('\n')}

📊 <b>Source:</b> Kraken CLI + Decision Engine
<i>Paper trading uniquement - Aucun ordre réel</i>
`;
}

export async function generateDailyBrief() {
  const now = new Date().toLocaleString('fr-FR');
  const [ticker, paper] = await Promise.all([
    getDogTicker(),
    getPaperStatus()
  ]);
  
  let dogPrice = 'N/A';
  if (ticker.success) {
    dogPrice = '$' + formatPrice(ticker.last);
  }
  
  let paperSection = '';
  if (paper.success) {
    const pnlEmoji = paper.unrealizedPnl >= 0 ? '🟢' : '🔴';
    paperSection = `
💰 <b>Portfolio Paper:</b>
  • Balance initiale: $${paper.startingBalance.toFixed(2)}
  • Valeur actuelle: $${paper.currentValue.toFixed(2)}
  • Trades: ${paper.totalTrades}
  • PnL: ${pnlEmoji} ${paper.unrealizedPnl >= 0 ? '+' : ''}$${paper.unrealizedPnl.toFixed(4)}
  • Frais: ${(paper.feeRate * 100).toFixed(2)}%`;
  } else {
    const portfolio = paperState.getPortfolio();
    paperSection = `
💰 <b>Portfolio Paper (mock):</b>
  • Balance: $${portfolio.balanceUsd.toFixed(2)}
  • Total: $${portfolio.totalValue.toFixed(2)}
  • PnL: ${portfolio.pnlUsd >= 0 ? '+' : ''}$${portfolio.pnlUsd.toFixed(2)}`;
  }
  
  const sourceLine = paper.success && ticker.success
    ? '📊 <b>Source:</b> Kraken CLI'
    : '⚠️ <b>Source:</b> fallback mock';
  
  return `
📋 <b>Brief Quotidien</b> [PAPER ONLY]
⏰ ${now}

🐕 <b>DOG:</b> ${dogPrice}
${paperSection}

${sourceLine}
<i>Paper trading uniquement - Aucun ordre réel</i>
`;
}

export async function generateRiskReport() {
  const ticker = await getDogTicker();
  const now = new Date().toLocaleString('fr-FR');
  
  // Calculate simple risk metrics from real data if available
  let riskSection = '';
  let flagsSection = '';
  
  if (ticker.success) {
    const metrics = calculateMetrics(ticker);
    const { flags, reasons } = generateRiskFlags(ticker);
    
    const range = ticker.high - ticker.low;
    const rangePct = (range / ticker.vwap) * 100;
    const volatility = rangePct.toFixed(2);
    
    let riskLevel = 'LOW';
    if (rangePct > 10) riskLevel = 'HIGH';
    else if (rangePct > 5) riskLevel = 'MODERATE';
    
    riskSection = `
📊 <b>Métriques DOG (24h):</b>
  • Range: $${formatPrice(range)} (${rangePct.toFixed(2)}%)
  • Volatilité estimée: ${volatility}%
  • Niveau de risque: ${riskLevel}
  • Spread: ${metrics.spreadPct.toFixed(2)}%
  • Distance VWAP: ${metrics.vwapDistancePct >= 0 ? '+' : ''}${metrics.vwapDistancePct.toFixed(2)}%
  • Volume: ${formatVolume(ticker.volume)}`;
    
    if (flags.length > 0) {
      flagsSection = `
🚩 <b>Risk Flags:</b>
${reasons.map(r => `  ⚠️ ${r}`).join('\n')}`;
    } else {
      flagsSection = `
✅ <b>Risk Flags:</b> Aucun flag détecté`;
    }
  } else {
    // Fallback to mock
    const metrics = MOCK_RISK_METRICS;
    riskSection = `
📊 <b>Métriques (mock):</b>
  • Portfolio Heat: ${metrics.portfolioHeat}%
  • Max Drawdown: ${metrics.maxDrawdown}%
  • Sharpe Ratio: ${metrics.sharpeRatio}
  • Volatilité: ${metrics.volatility}%
  • Niveau de risque: ${metrics.riskLevel}

💡 <b>Suggestions:</b>
${metrics.suggestions.map(s => `  • ${s}`).join('\n')}

⚠️ <b>Kraken CLI unavailable — fallback mock</b>`;
  }
  
  const sourceLine = ticker.success 
    ? '📊 <b>Source:</b> Kraken CLI + Decision Engine' 
    : '⚠️ <b>Source:</b> fallback mock';
  
  return `
⚠️ <b>Risk Report</b> [PAPER ONLY]
⏰ ${now}
${riskSection}
${flagsSection}

${sourceLine}
<i>Paper trading uniquement - Aucun ordre réel</i>
`;
}

export async function generatePaperStatus() {
  const paper = await getPaperStatus();
  const cli = await getCliStatus();
  const now = new Date().toLocaleString('fr-FR');
  
  if (!paper.success) {
    // Fallback to mock state
    const portfolio = paperState.getPortfolio();
    return `
📊 <b>Paper Status</b> [PAPER ONLY]
⏰ ${now}

⚠️ <b>Kraken CLI unavailable — fallback mock</b>

💰 <b>Balance:</b> $${portfolio.balanceUsd.toFixed(2)}
📈 <b>Valeur positions:</b> $${portfolio.positionsValue.toFixed(2)}
💵 <b>Total:</b> $${portfolio.totalValue.toFixed(2)}
📉 <b>PnL:</b> ${portfolio.pnlUsd >= 0 ? '🟢' : '🔴'} ${portfolio.pnlUsd >= 0 ? '+' : ''}$${portfolio.pnlUsd.toFixed(2)} (${portfolio.pnlPct >= 0 ? '+' : ''}${portfolio.pnlPct.toFixed(2)}%)

📋 <b>Positions:</b> ${portfolio.positionCount}
🔄 <b>Trades:</b> ${portfolio.tradeCount}

<i>Trading simulé - Aucun argent réel engagé</i>
`;
  }
  
  const pnlEmoji = paper.unrealizedPnl >= 0 ? '🟢' : '🔴';
  
  return `
📊 <b>Paper Status</b> [PAPER ONLY]
⏰ ${now}

✅ <b>Kraken CLI:</b> ${cli.available ? cli.version : 'N/A'}
🔒 <b>Mode:</b> ${paper.mode.toUpperCase()}

💰 <b>Balance initiale:</b> $${paper.startingBalance.toFixed(2)}
💵 <b>Valeur actuelle:</b> $${paper.currentValue.toFixed(2)}
📉 <b>PnL non réalisé:</b> ${pnlEmoji} ${paper.unrealizedPnl >= 0 ? '+' : ''}$${paper.unrealizedPnl.toFixed(4)} (${paper.unrealizedPnlPct >= 0 ? '+' : ''}${(paper.unrealizedPnlPct * 100).toFixed(4)}%)

🔄 <b>Trades exécutés:</b> ${paper.totalTrades}
📋 <b>Ordres ouverts:</b> ${paper.openOrders}

💸 <b>Frais:</b> ${(paper.feeRate * 100).toFixed(2)}%
📊 <b>Slippage:</b> ${(paper.slippageRate * 100).toFixed(2)}%

<i>Paper trading via Kraken CLI - Aucun argent réel</i>
`;
}

export function generateLastDecisions() {
  const decisions = paperState.getLastDecisions(5);
  const now = new Date().toLocaleString('fr-FR');
  
  if (decisions.length === 0) {
    return `
📜 <b>Dernières Décisions</b> [PAPER ONLY]
⏰ ${now}

Aucune décision enregistrée.

Utilisez /dog pour voir l'analyse actuelle.
`;
  }
  
  return `
📜 <b>Dernières Décisions</b> [PAPER ONLY]
⏰ ${now}

${decisions.map((d, i) => `
${i + 1}. <b>${d.type || 'ANALYSIS'}</b> - ${new Date(d.timestamp).toLocaleTimeString('fr-FR')}
   ${d.summary || 'Analyse technique'}
`).join('\n')}

<i>Historique des décisions</i>
`;
}

export async function generateStartMessage() {
  const cli = await getCliStatus();
  
  let cliStatus = '❌ Kraken CLI unavailable';
  if (cli.available) {
    cliStatus = `✅ ${cli.version}`;
  }
  
  return `
🐕 <b>Welcome to Agent DOG!</b>

⚡ <b>Mode:</b> PAPER ONLY / NO LIVE TRADING
🎯 <b>Objectif:</b> Coaching éducatif pour le trading
🔌 <b>Kraken CLI:</b> ${cliStatus}

📋 <b>Commandes disponibles:</b>
  /dog - Analyse DOG (prix Kraken)
  /brief - Brief quotidien
  /risk - Métriques de risque
  /paper_status - Statut portfolio
  /last_decisions - Historique décisions

⚠️ <b>Important:</b>
Toutes les réponses utilisent Kraken CLI si disponible.
Fallback mock si CLI indisponible.
Aucune transaction réelle n'est effectuée.

<i>Bot v0.1.0 - Session: ${new Date().toLocaleDateString('fr-FR')}</i>
`;
}

export default {
  generateDogBrief,
  generateDailyBrief,
  generateRiskReport,
  generatePaperStatus,
  generateLastDecisions,
  generateStartMessage
};