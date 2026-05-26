/**
 * DOG Paper Coach - Decision Engine
 * PAPER ONLY / NO LIVE TRADING
 * Deterministic educational decision engine for DOGUSD
 */

// ============================================
// Decision Types
// ============================================
export const DECISIONS = {
  HOLD: 'HOLD',
  WATCH_BUY: 'WATCH_BUY',
  NO_TRADE: 'NO_TRADE',
  RISK_OFF: 'RISK_OFF'
};

// ============================================
// Risk Flags
// ============================================
export const RISK_FLAGS = {
  HIGH_SPREAD: 'HIGH_SPREAD',
  HIGH_VOLATILITY: 'HIGH_VOLATILITY',
  NEAR_HIGH: 'NEAR_HIGH',
  NEAR_LOW: 'NEAR_LOW',
  BELOW_VWAP: 'BELOW_VWAP',
  LOW_VOLUME: 'LOW_VOLUME'
};

// ============================================
// Thresholds (deterministic)
// ============================================
const THRESHOLDS = {
  MAX_SPREAD_PCT: 1.0,        // >1% spread = RISK_OFF
  MAX_VOLATILITY_PCT: 15.0,   // >15% volatility = RISK_OFF
  MIN_VOLUME: 50000000,       // <50M volume = LOW_VOLUME flag
  VWAP_BUY_ZONE: 0.5,         // last > vwap * 1.005 = above vwap
  RANGE_BUY_MIN: 0.35,        // min range position for WATCH_BUY
  RANGE_BUY_MAX: 0.80,        // max range position for WATCH_BUY
  NEAR_HIGH_THRESHOLD: 0.90,  // >90% of range = near high
  NEAR_LOW_THRESHOLD: 0.15    // <15% of range = near low
};

// ============================================
// Calculate metrics from ticker
// ============================================
export function calculateMetrics(ticker) {
  const spread = ticker.ask - ticker.bid;
  const spreadPct = (spread / ticker.last) * 100;
  
  const range = ticker.high - ticker.low;
  const rangePosition = range > 0 ? (ticker.last - ticker.low) / range : 0.5;
  
  const vwapDistance = ticker.last - ticker.vwap;
  const vwapDistancePct = (vwapDistance / ticker.vwap) * 100;
  
  const volatilityPct = range > 0 ? (range / ticker.last) * 100 : 0;
  
  return {
    spread,
    spreadPct,
    range,
    rangePosition,
    vwapDistance,
    vwapDistancePct,
    volatilityPct,
    volume: ticker.volume
  };
}

// ============================================
// Generate risk flags
// ============================================
export function generateRiskFlags(metrics) {
  const flags = [];
  const reasons = [];
  
  if (metrics.spreadPct > THRESHOLDS.MAX_SPREAD_PCT) {
    flags.push(RISK_FLAGS.HIGH_SPREAD);
    reasons.push(`Spread élevé: ${metrics.spreadPct.toFixed(2)}% (max ${THRESHOLDS.MAX_SPREAD_PCT}%)`);
  }
  
  if (metrics.volatilityPct > THRESHOLDS.MAX_VOLATILITY_PCT) {
    flags.push(RISK_FLAGS.HIGH_VOLATILITY);
    reasons.push(`Volatilité élevée: ${metrics.volatilityPct.toFixed(2)}% (max ${THRESHOLDS.MAX_VOLATILITY_PCT}%)`);
  }
  
  if (metrics.rangePosition > THRESHOLDS.NEAR_HIGH_THRESHOLD) {
    flags.push(RISK_FLAGS.NEAR_HIGH);
    reasons.push(`Prix proche du high 24h: ${(metrics.rangePosition * 100).toFixed(1)}%`);
  }
  
  if (metrics.rangePosition < THRESHOLDS.NEAR_LOW_THRESHOLD) {
    flags.push(RISK_FLAGS.NEAR_LOW);
    reasons.push(`Prix proche du low 24h: ${(metrics.rangePosition * 100).toFixed(1)}%`);
  }
  
  if (metrics.vwapDistancePct < 0) {
    flags.push(RISK_FLAGS.BELOW_VWAP);
    reasons.push(`Prix sous VWAP: ${metrics.vwapDistancePct.toFixed(2)}%`);
  }
  
  if (metrics.volume < THRESHOLDS.MIN_VOLUME) {
    flags.push(RISK_FLAGS.LOW_VOLUME);
    reasons.push(`Volume faible: ${(metrics.volume / 1000000).toFixed(1)}M (min ${THRESHOLDS.MIN_VOLUME / 1000000}M)`);
  }
  
  return { flags, reasons };
}

// ============================================
// Make decision
// ============================================
export function makeDecision(ticker) {
  const metrics = calculateMetrics(ticker);
  const { flags, reasons } = generateRiskFlags(metrics);
  
  // Default decision
  let decision = DECISIONS.HOLD;
  let confidence = 0.5;
  let decisionReasons = ['Aucun signal fort détecté'];
  
  // RISK_OFF: Critical conditions
  if (flags.includes(RISK_FLAGS.HIGH_SPREAD) || flags.includes(RISK_FLAGS.HIGH_VOLATILITY)) {
    decision = DECISIONS.RISK_OFF;
    confidence = 0.9;
    decisionReasons = [
      'Conditions de marché défavorables',
      ...reasons
    ];
  }
  // NO_TRADE: Near high or other blocking conditions
  else if (flags.includes(RISK_FLAGS.NEAR_HIGH)) {
    decision = DECISIONS.NO_TRADE;
    confidence = 0.7;
    decisionReasons = [
      'Prix proche du sommet 24h',
      'Attendre un retournement ou consolidation',
      ...reasons
    ];
  }
  // WATCH_BUY: Favorable conditions
  else if (
    metrics.vwapDistancePct > 0 &&
    metrics.rangePosition >= THRESHOLDS.RANGE_BUY_MIN &&
    metrics.rangePosition <= THRESHOLDS.RANGE_BUY_MAX &&
    !flags.includes(RISK_FLAGS.HIGH_SPREAD)
  ) {
    decision = DECISIONS.WATCH_BUY;
    confidence = 0.6 + (metrics.vwapDistancePct / 100);
    if (confidence > 0.85) confidence = 0.85;
    
    decisionReasons = [
      `Prix au-dessus du VWAP: +${metrics.vwapDistancePct.toFixed(2)}%`,
      `Position dans le range: ${(metrics.rangePosition * 100).toFixed(1)}% (zone favorable)`,
      `Spread acceptable: ${metrics.spreadPct.toFixed(2)}%`
    ];
  }
  // HOLD: Other conditions
  else {
    if (flags.includes(RISK_FLAGS.BELOW_VWAP)) {
      decisionReasons.push('Prix sous VWAP - tendance baissière');
    }
    if (flags.includes(RISK_FLAGS.NEAR_LOW)) {
      decisionReasons.push('Prix proche du low - possible survente');
    }
    if (flags.includes(RISK_FLAGS.LOW_VOLUME)) {
      decisionReasons.push('Volume faible - manque de conviction');
    }
  }
  
  return {
    decision,
    confidence: Math.round(confidence * 100),
    reasons: decisionReasons,
    riskFlags: flags,
    riskReasons: reasons,
    metrics,
    timestamp: new Date().toISOString()
  };
}

// ============================================
// Format decision for display
// ============================================
export function formatDecision(decision) {
  const emojiMap = {
    [DECISIONS.HOLD]: '⏸️',
    [DECISIONS.WATCH_BUY]: '👀',
    [DECISIONS.NO_TRADE]: '🚫',
    [DECISIONS.RISK_OFF]: '⚠️'
  };
  
  const labelMap = {
    [DECISIONS.HOLD]: 'HOLD - Attendre',
    [DECISIONS.WATCH_BUY]: 'WATCH_BUY - Surveillance',
    [DECISIONS.NO_TRADE]: 'NO_TRADE - Pas de trade',
    [DECISIONS.RISK_OFF]: 'RISK_OFF - Risque élevé'
  };
  
  return {
    emoji: emojiMap[decision.decision] || '❓',
    label: labelMap[decision.decision] || decision.decision,
    confidence: decision.confidence,
    reasons: decision.reasons,
    riskFlags: decision.riskFlags
  };
}

export default {
  DECISIONS,
  RISK_FLAGS,
  makeDecision,
  formatDecision,
  calculateMetrics,
  generateRiskFlags
};
