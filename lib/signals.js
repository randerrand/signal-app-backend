// ─── Moving Average Helpers ───────────────────────────────────────────────────

export function calcSMA(closes, period) {
  return closes.map((_, i) => {
    if (i < period - 1) return null;
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += closes[j];
    return sum / period;
  });
}

export function calcEMA(closes, period) {
  const k = 2 / (period + 1);
  const result = new Array(closes.length).fill(null);
  // Find first valid index
  let start = period - 1;
  let sum = 0;
  for (let i = 0; i < period; i++) sum += closes[i];
  result[start] = sum / period;
  for (let i = start + 1; i < closes.length; i++) {
    result[i] = closes[i] * k + result[i - 1] * (1 - k);
  }
  return result;
}

export function calcBollingerBands(closes, period = 20, multiplier = 2) {
  const sma = calcSMA(closes, period);
  return closes.map((_, i) => {
    if (sma[i] === null) return null;
    const slice = closes.slice(i - period + 1, i + 1);
    const mean = sma[i];
    const std = Math.sqrt(slice.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / period);
    return {
      upper: mean + multiplier * std,
      middle: mean,
      lower: mean - multiplier * std,
      bandwidth: (2 * multiplier * std) / mean, // normalized bandwidth
    };
  });
}

// ─── Signal Detectors ─────────────────────────────────────────────────────────

export function breakoutSignal(closes, volumes) {
  const n = closes.length;
  if (n < 55) return null;

  const sma50  = calcSMA(closes, 50);
  const sma200 = calcSMA(closes, 200);
  const avgVol20 = volumes.slice(-21, -1).reduce((a, b) => a + b, 0) / 20;

  const lastClose = closes[n - 1];
  const lastVol   = volumes[n - 1];

  const high20 = Math.max(...closes.slice(-21, -1));
  const high50 = Math.max(...closes.slice(-51, -1));

  const above20 = lastClose > high20 * 1.002;
  const above50 = lastClose > high50 * 1.002;
  const highVolume = lastVol > avgVol20 * 1.5;
  const aboveMA50  = sma50[n - 1]  !== null && lastClose > sma50[n - 1];
  const aboveMA200 = sma200[n - 1] !== null && lastClose > sma200[n - 1];

  if (!above20 && !above50) return null;

  let score = 0;
  const conditions = [];

  if (above20) { score++; conditions.push('Broke 20-day high'); }
  if (above50) { score++; conditions.push('Broke 50-day high'); }
  if (highVolume) { score++; conditions.push(`Volume ${(lastVol / avgVol20).toFixed(1)}x avg`); }
  if (aboveMA50)  conditions.push('Above MA50');
  if (aboveMA200) conditions.push('Above MA200');

  return {
    type: 'BREAKOUT',
    score,
    conditions,
    data: {
      high20: +high20.toFixed(2),
      high50: +high50.toFixed(2),
      volumeRatio: +(lastVol / avgVol20).toFixed(2),
      aboveMA50,
      aboveMA200,
    },
  };
}

export function trendSignal(closes) {
  const n = closes.length;
  if (n < 210) return null;

  const ema20 = calcEMA(closes, 20);
  const ema50 = calcEMA(closes, 50);
  const sma200 = calcSMA(closes, 200);

  // Check last 5 days for EMA crossover
  let crossover = null;
  let crossDaysAgo = null;
  for (let i = n - 1; i >= Math.max(n - 5, 1); i--) {
    if (ema20[i] === null || ema50[i] === null) continue;
    if (ema20[i - 1] <= ema50[i - 1] && ema20[i] > ema50[i]) {
      crossover = 'BULLISH';
      crossDaysAgo = n - 1 - i;
      break;
    }
    if (ema20[i - 1] >= ema50[i - 1] && ema20[i] < ema50[i]) {
      crossover = 'BEARISH';
      crossDaysAgo = n - 1 - i;
      break;
    }
  }

  if (!crossover) return null;
  if (crossover === 'BEARISH') return null; // MVP: bullish only

  const aboveMA200 = sma200[n - 1] !== null && closes[n - 1] > sma200[n - 1];

  let score = 1; // base score for crossover
  const conditions = [
    `EMA20 crossed above EMA50 ${crossDaysAgo === 0 ? 'today' : crossDaysAgo + 'd ago'}`,
  ];

  if (aboveMA200) {
    score++;
    conditions.push('Price above MA200 — strong trend');
  }

  return {
    type: 'TREND',
    score,
    conditions,
    data: {
      ema20: +ema20[n - 1].toFixed(2),
      ema50: +ema50[n - 1].toFixed(2),
      sma200: sma200[n - 1] ? +sma200[n - 1].toFixed(2) : null,
      crossover,
      crossDaysAgo,
      aboveMA200,
    },
  };
}

export function squeezeSignal(closes, volumes) {
  const n = closes.length;
  if (n < 25) return null;

  const bb = calcBollingerBands(closes, 20, 2);

  // Find squeeze: last 10 days bandwidth was narrowing
  const recentBW = bb.slice(-11).filter(Boolean).map(b => b.bandwidth);
  if (recentBW.length < 5) return null;

  const minBW = Math.min(...recentBW.slice(0, -1));
  const avgBW = recentBW.slice(0, -1).reduce((a, b) => a + b, 0) / (recentBW.length - 1);
  const isSqueeze = minBW < avgBW * 0.7; // bandwidth compressed 30%+ below recent avg

  if (!isSqueeze) return null;

  const lastBB = bb[n - 1];
  const lastClose = closes[n - 1];
  if (!lastBB) return null;

  const breakUpper = lastClose > lastBB.upper;
  const breakLower = lastClose < lastBB.lower;

  if (!breakUpper && !breakLower) return null;
  if (breakLower) return null; // MVP: bullish only

  const avgVol20 = volumes.slice(-21, -1).reduce((a, b) => a + b, 0) / 20;
  const volSpike = volumes[n - 1] > avgVol20 * 1.3;

  let score = 1;
  const conditions = ['Bollinger squeeze breakout (upper band)'];
  if (volSpike) { score++; conditions.push(`Volume spike ${(volumes[n-1]/avgVol20).toFixed(1)}x avg`); }

  return {
    type: 'SQUEEZE',
    score,
    conditions,
    data: {
      upper: +lastBB.upper.toFixed(2),
      lower: +lastBB.lower.toFixed(2),
      bandwidth: +lastBB.bandwidth.toFixed(4),
      volSpike,
      volumeRatio: +(volumes[n-1] / avgVol20).toFixed(2),
    },
  };
}

// ─── Combine All Signals ──────────────────────────────────────────────────────

export function analyzeStock(ticker, data) {
  if (!data || data.length < 55) return null;

  const closes  = data.map(d => d.adjClose ?? d.close);
  const volumes = data.map(d => d.adjVolume ?? d.volume);
  const n = closes.length;

  const bo  = breakoutSignal(closes, volumes);
  const tr  = trendSignal(closes);
  const sq  = squeezeSignal(closes, volumes);

  const signals = [bo, tr, sq].filter(Boolean);
  if (signals.length === 0) return null;

  const totalScore = signals.reduce((s, sig) => s + sig.score, 0);
  const lastClose  = closes[n - 1];
  const prevClose  = closes[n - 2];
  const change     = ((lastClose - prevClose) / prevClose) * 100;

  return {
    ticker,
    price: +lastClose.toFixed(2),
    change: +change.toFixed(2),
    totalScore: Math.min(totalScore, 3), // cap at 3
    signals,
    signalTypes: signals.map(s => s.type),
    latestDate: data[n - 1].date?.split('T')[0],
  };
}
