import { analyzeStock, calcSMA, calcEMA, calcBollingerBands } from '../lib/signals.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { ticker } = req.query;
  const TIINGO_KEY = process.env.TIINGO_API_KEY;

  if (!TIINGO_KEY) return res.status(500).json({ error: 'TIINGO_API_KEY not configured.' });
  if (!ticker) return res.status(400).json({ error: 'Missing ticker.' });

  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 2);
  const fmt = d => d.toISOString().split('T')[0];

  try {
    const url = `https://api.tiingo.com/tiingo/daily/${ticker}/prices?startDate=${fmt(start)}&endDate=${fmt(end)}&token=${TIINGO_KEY}`;
    const upstream = await fetch(url);
    if (!upstream.ok) return res.status(upstream.status).json({ error: `Tiingo error ${upstream.status}` });
    const data = await upstream.json();
    if (!data || data.length === 0) return res.status(404).json({ error: 'No data for ticker.' });

    const closes  = data.map(d => d.adjClose ?? d.close);
    const volumes = data.map(d => d.adjVolume ?? d.volume);
    const n = closes.length;

    // Last 90 days chart data
    const chartData = data.slice(-90).map(d => ({
      date: d.date?.split('T')[0],
      close: +(d.adjClose ?? d.close).toFixed(2),
      volume: d.adjVolume ?? d.volume,
    }));

    // Indicators for chart overlay (last 90 days)
    const ema20  = calcEMA(closes, 20).slice(-90).map(v => v ? +v.toFixed(2) : null);
    const ema50  = calcEMA(closes, 50).slice(-90).map(v => v ? +v.toFixed(2) : null);
    const sma200 = calcSMA(closes, 200).slice(-90).map(v => v ? +v.toFixed(2) : null);
    const bb     = calcBollingerBands(closes, 20).slice(-90).map(v => v ? {
      upper: +v.upper.toFixed(2),
      lower: +v.lower.toFixed(2),
    } : null);

    const analysis = analyzeStock(ticker.toUpperCase(), data);

    return res.status(200).json({
      ticker: ticker.toUpperCase(),
      price: +(closes[n-1]).toFixed(2),
      change: +(((closes[n-1] - closes[n-2]) / closes[n-2]) * 100).toFixed(2),
      chartData,
      indicators: { ema20, ema50, sma200, bb },
      analysis,
    });
  } catch (err) {
    return res.status(502).json({ error: 'Failed to fetch.', detail: err.message });
  }
}
