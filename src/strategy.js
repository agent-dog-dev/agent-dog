/**
 * DOG Paper Coach - Decision Engine (Multi-Agent Vote)
 * PAPER ONLY / NO LIVE TRADING
 * Deterministic decision engine for DOGUSD.
 *
 * The decision emerges from a WEIGHTED VOTE of 4 deterministic agents:
 *   🧭 Trend 30% · ⚡ Momentum 25% · 💧 Liquidity 20% · 🛡️ Risk 25%
 * The 🛡️ Risk agent has a VETO: if volatility > 15% OR spread > 1%
 * → RISK_OFF is forced (safety cutoffs identical to the previous engine).
 * 100% deterministic: same inputs → same outputs (timestamp aside).
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
// Thresholds (deterministic) — UNCHANGED
// ============================================
const THRESHOLDS = {
  MAX_SPREAD_PCT: 1.0,        // >1% spread = RISK_OFF (veto)
  MAX_VOLATILITY_PCT: 15.0,   // >15% volatility = RISK_OFF (veto)
  MIN_VOLUME: 50000000,       // <50M volume = LOW_VOLUME flag
  VWAP_BUY_ZONE: 0.5,         // last > vwap * 1.005 = above vwap
  RANGE_BUY_MIN: 0.35,        // min range position for WATCH_BUY
  RANGE_BUY_MAX: 0.80,        // max range position for WATCH_BUY
  NEAR_HIGH_THRESHOLD: 0.90,  // >90% of range = near high
  NEAR_LOW_THRESHOLD: 0.15    // <15% of range = near low
};

// ============================================
// Agent weights (sum = 1.00) — fixed & deterministic
// ============================================
const AGENT_WEIGHTS = {
  trend: 0.30,      // 🧭 Trend — price vs VWAP
  momentum: 0.25,   // ⚡ Momentum — position in the 24h range
  liquidity: 0.20,  // 💧 Liquidity — volume + spread
  risk: 0.25        // 🛡️ Risk — volatility + spread + flags (+ VETO)
};

// Vote thresholds → directional stance on the score [-1, +1]
const VOTE_THRESHOLD = 0.20;   // |aggregate score| ≥ 0.20 → directional decision
const STANCE_THRESHOLD = 0.15; // |agent score| > 0.15 → BUY / AVOID, else HOLD

function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

function round3(x) {
  return Math.round(x * 1000) / 1000;
}

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
    reasons.push(`High spread: ${metrics.spreadPct.toFixed(2)}% (max ${THRESHOLDS.MAX_SPREAD_PCT}%)`);
  }

  if (metrics.volatilityPct > THRESHOLDS.MAX_VOLATILITY_PCT) {
    flags.push(RISK_FLAGS.HIGH_VOLATILITY);
    reasons.push(`High volatility: ${metrics.volatilityPct.toFixed(2)}% (max ${THRESHOLDS.MAX_VOLATILITY_PCT}%)`);
  }

  if (metrics.rangePosition > THRESHOLDS.NEAR_HIGH_THRESHOLD) {
    flags.push(RISK_FLAGS.NEAR_HIGH);
    reasons.push(`Near 24h high: ${(metrics.rangePosition * 100).toFixed(1)}%`);
  }

  if (metrics.rangePosition < THRESHOLDS.NEAR_LOW_THRESHOLD) {
    flags.push(RISK_FLAGS.NEAR_LOW);
    reasons.push(`Near 24h low: ${(metrics.rangePosition * 100).toFixed(1)}%`);
  }

  if (metrics.vwapDistancePct < 0) {
    flags.push(RISK_FLAGS.BELOW_VWAP);
    reasons.push(`Below VWAP: ${metrics.vwapDistancePct.toFixed(2)}%`);
  }

  if (metrics.volume < THRESHOLDS.MIN_VOLUME) {
    flags.push(RISK_FLAGS.LOW_VOLUME);
    reasons.push(`Low volume: ${(metrics.volume / 1000000).toFixed(1)}M (min ${THRESHOLDS.MIN_VOLUME / 1000000}M)`);
  }

  return { flags, reasons };
}

// ============================================
// The 4 agents (deterministic)
// Each agent returns a signed score [-1, +1]:
//   + = favorable to buy · − = caution/unfavorable
// stance derived from the score: BUY / HOLD / AVOID
// ============================================
function stanceFromScore(score) {
  if (score > STANCE_THRESHOLD) return 'BUY';
  if (score < -STANCE_THRESHOLD) return 'AVOID';
  return 'HOLD';
}

// 🧭 Trend — price vs VWAP (above = bullish)
function agentTrend(m) {
  const score = clamp(m.vwapDistancePct / 2.0, -1, 1); // ±2% vs VWAP = saturation
  const reason = m.vwapDistancePct >= 0
    ? `Price above VWAP (+${m.vwapDistancePct.toFixed(2)}%)`
    : `Price below VWAP (${m.vwapDistancePct.toFixed(2)}%)`;
  return {
    key: 'trend', name: 'Trend', emoji: '🧭', metric: 'Price vs VWAP',
    weight: AGENT_WEIGHTS.trend, score, stance: stanceFromScore(score), reason
  };
}

// ⚡ Momentum — position in the 24h range (healthy mid, exhausted at the top)
function agentMomentum(m) {
  const rp = m.rangePosition;
  let score;
  if (rp > THRESHOLDS.NEAR_HIGH_THRESHOLD) score = -0.9;       // near the top = exhausted
  else if (rp > THRESHOLDS.RANGE_BUY_MAX) score = -0.3;        // extended (0.80–0.90)
  else if (rp >= THRESHOLDS.RANGE_BUY_MIN) score = 0.7;        // healthy zone (0.35–0.80)
  else if (rp >= THRESHOLDS.NEAR_LOW_THRESHOLD) score = 0.1;   // building (0.15–0.35)
  else score = -0.4;                                          // near the low (<0.15) = weak
  return {
    key: 'momentum', name: 'Momentum', emoji: '⚡', metric: '24h range position',
    weight: AGENT_WEIGHTS.momentum, score, stance: stanceFromScore(score),
    reason: `Position in 24h range: ${(rp * 100).toFixed(1)}%`
  };
}

// 💧 Liquidity — volume + spread (tradability: good liquidity = green light)
function agentLiquidity(m) {
  const volScore = m.volume >= THRESHOLDS.MIN_VOLUME ? 0.5 : -0.5;
  let spreadScore;
  if (m.spreadPct < 0.5) spreadScore = 0.5;
  else if (m.spreadPct < THRESHOLDS.MAX_SPREAD_PCT) spreadScore = 0.0;
  else spreadScore = -0.5;
  const score = clamp(volScore + spreadScore, -1, 1);
  return {
    key: 'liquidity', name: 'Liquidity', emoji: '💧', metric: 'Volume + spread',
    weight: AGENT_WEIGHTS.liquidity, score, stance: stanceFromScore(score),
    reason: `Volume ${(m.volume / 1e6).toFixed(0)}M · spread ${m.spreadPct.toFixed(2)}%`
  };
}

// 🛡️ Risk — volatility + spread + flags (+ safety VETO)
function agentRisk(m, flags) {
  const veto = m.volatilityPct > THRESHOLDS.MAX_VOLATILITY_PCT
    || m.spreadPct > THRESHOLDS.MAX_SPREAD_PCT;
  let score;
  if (veto) {
    score = -1;
  } else {
    const penaltyVol = m.volatilityPct / THRESHOLDS.MAX_VOLATILITY_PCT;   // 0..1
    const penaltySpread = m.spreadPct / THRESHOLDS.MAX_SPREAD_PCT;        // 0..1
    const penaltyFlags = 0.1 * flags.length;
    score = clamp(1 - penaltyVol - penaltySpread - penaltyFlags, -1, 1);
  }
  const reason = veto
    ? `Safety VETO: volatility ${m.volatilityPct.toFixed(1)}% / spread ${m.spreadPct.toFixed(2)}%`
    : `Volatility ${m.volatilityPct.toFixed(1)}% · spread ${m.spreadPct.toFixed(2)}% · ${flags.length} flag(s)`;
  return {
    key: 'risk', name: 'Risk', emoji: '🛡️', metric: 'Volatility + spread + flags',
    weight: AGENT_WEIGHTS.risk, score, stance: stanceFromScore(score), reason, veto
  };
}

// ============================================
// Run the 4 agents and compute each weighted contribution
// ============================================
export function runAgents(metrics, flags) {
  return [
    agentTrend(metrics),
    agentMomentum(metrics),
    agentLiquidity(metrics),
    agentRisk(metrics, flags)
  ].map(a => ({ ...a, score: round3(a.score), contribution: round3(a.weight * a.score) }));
}

// ============================================
// Make decision — WEIGHTED VOTE of the 4 agents
// ============================================
export function makeDecision(ticker) {
  const metrics = calculateMetrics(ticker);
  const { flags, reasons } = generateRiskFlags(metrics);

  // --- Vote of the 4 agents ---
  const agents = runAgents(metrics, flags);
  const riskAgent = agents.find(a => a.key === 'risk');

  // Aggregate score S ∈ [-1, +1] = sum of weighted contributions
  const S = round3(agents.reduce((sum, a) => sum + a.contribution, 0));

  // Agreement weight per stance (= % agreement between agents)
  const weightBuy = round3(agents.filter(a => a.stance === 'BUY').reduce((s, a) => s + a.weight, 0));
  const weightHold = round3(agents.filter(a => a.stance === 'HOLD').reduce((s, a) => s + a.weight, 0));
  const weightAvoid = round3(agents.filter(a => a.stance === 'AVOID').reduce((s, a) => s + a.weight, 0));

  let decision, confidence, agreement, decisionReasons;

  if (riskAgent.veto) {
    // --- Safety VETO: cutoffs identical to the previous engine ---
    decision = DECISIONS.RISK_OFF;
    agreement = weightAvoid;
    confidence = 0.9;
    decisionReasons = ['Unfavorable market conditions (🛡️ Risk veto)', ...reasons];
  } else if (S >= VOTE_THRESHOLD) {
    decision = DECISIONS.WATCH_BUY;
    agreement = weightBuy;
    confidence = weightBuy;
    decisionReasons = [
      `Weighted vote favorable: ${Math.round(S * 100)}/100`,
      ...agents.filter(a => a.stance === 'BUY').map(a => `${a.emoji} ${a.name}: ${a.reason}`)
    ];
  } else if (S <= -VOTE_THRESHOLD) {
    decision = DECISIONS.NO_TRADE;
    agreement = weightAvoid;
    confidence = weightAvoid;
    decisionReasons = [
      `Weighted vote unfavorable: ${Math.round(S * 100)}/100`,
      ...agents.filter(a => a.stance === 'AVOID').map(a => `${a.emoji} ${a.name}: ${a.reason}`)
    ];
  } else {
    decision = DECISIONS.HOLD;
    agreement = weightHold;
    confidence = Math.max(weightHold, 0.5); // neutral: 50% floor (like the old HOLD)
    decisionReasons = [
      `No strong consensus (vote ${Math.round(S * 100)}/100)`,
      ...agents.map(a => `${a.emoji} ${a.name}: ${a.stance}`)
    ];
  }

  // --- Safety-first guard: never buy at the 24h high ---
  // (preserves the old near-high NO_TRADE; removable if a pure vote is wanted)
  if (decision === DECISIONS.WATCH_BUY && flags.includes(RISK_FLAGS.NEAR_HIGH)) {
    decision = DECISIONS.NO_TRADE;
    agreement = weightAvoid;
    confidence = Math.max(weightAvoid, 0.7);
    decisionReasons = [
      'Near 24h high — not chasing the top (safety guard)',
      ...reasons
    ];
  }

  return {
    decision,
    confidence: Math.round(confidence * 100),
    reasons: decisionReasons,
    riskFlags: flags,
    riskReasons: reasons,
    metrics,
    agents,
    vote: {
      score: S,
      agreement: Math.round(agreement * 100),
      weightBuy: Math.round(weightBuy * 100),
      weightHold: Math.round(weightHold * 100),
      weightAvoid: Math.round(weightAvoid * 100)
    },
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
    [DECISIONS.HOLD]: 'HOLD - Wait',
    [DECISIONS.WATCH_BUY]: 'WATCH_BUY - Watching',
    [DECISIONS.NO_TRADE]: 'NO_TRADE - No trade',
    [DECISIONS.RISK_OFF]: 'RISK_OFF - High risk'
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
  generateRiskFlags,
  runAgents
};
