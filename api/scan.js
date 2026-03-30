import { analyzeStock } from '../lib/signals.js';

const SP500 = [
  'AAPL','MSFT','NVDA','AMZN','META','GOOGL','GOOG','BRK.B','AVGO','TSLA',
  'JPM','LLY','UNH','V','XOM','MA','COST','HD','PG','WMT','JNJ','NFLX',
  'ABBV','BAC','CRM','MRK','ORCL','CVX','KO','CSCO','PEP','TMO','ACN',
  'MCD','ABT','LIN','TXN','ADBE','PM','IBM','GE','CAT','INTU','GS','AMGN',
  'ISRG','SPGI','HON','BKNG','AXP','VRTX','RTX','REGN','PLD','MS','BLK',
  'MDLZ','SYK','ADI','GILD','MMC','CI','TJX','CME','DE','ETN','ZTS','PGR',
  'AON','LRCX','MU','KLAC','PANW','SNPS','CDNS','AMAT','MRVL','FTNT','CRWD',
  'NOW','WDAY','TEAM','DDOG','ZS','OKTA','ABNB','UBER','DASH','RBLX','COIN',
  'PLTR','APP','HOOD','RIVN','LCID','NKE','SBUX','DIS','PYPL','INTC','AMD',
  'QCOM','TGT','LOW','UPS','FDX','BA','GD','LMT','NOC','RTX','HAL','SLB',
];

const NASDAQ100 = [
  'AAPL','MSFT','NVDA','AMZN','META','TSLA','GOOGL','GOOG','AVGO','COST',
  'NFLX','AMD','ADBE','QCOM','PEP','CSCO','INTC','AMGN','TXN','HON',
  'INTU','AMAT','SBUX','LRCX','MDLZ','ADI','REGN','GILD','PANW','SNPS',
  'KLAC','CDNS','MRVL','ASML','ADP','ISRG','MU','ABNB','CRWD','FTNT',
  'ORLY','MNST','PCAR','MELI','KDP','ODFL','CTAS','ROST','FAST','PAYX',
  'DXCM','VRSK','TEAM','IDXX','GEHC','EXC','CEG','XEL','BIIB','DLTR',
  'ON','ZS','ANSS','TTWO','ENPH','DDOG','OKTA','ALGN','ILMN','MRNA',
  'ZM','DOCU','PTON','RIVN','LCID','MTCH','APP','PLTR','ARM','MSTR',
  'COIN','HOOD','RBLX','UBER','LYFT','SNAP','PINS','DASH','TTD','ROKU',
  'SPOT','WDAY','NOW','CRM','SNOW','PYPL','WBD','GFS','FANG','ODFL',
];

const ALL_TICKERS = [...new Set([...SP500, ...NASDAQ100])];

async function fetchTicker(ticker, apiKey) {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - 2);
  const fmt = d => d.toISOString().split('T')[0];
  const url = `https://api.tiingo.com/tiingo/daily/${ticker}/prices?startDate=${fmt(start)}&endDate=${fmt(end)}&token=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const TIINGO_KEY = process.env.TIINGO_API_KEY;
  if (!TIINGO_KEY) return res.status(500).json({ error: 'TIINGO_API_KEY not configured.' });

  const { tickers: tickerParam, minScore } = req.query;
  const tickers = tickerParam
    ? tickerParam.split(',').map(t => t.trim().toUpperCase())
    : ALL_TICKERS;

  const minScoreFilter = parseInt(minScore || '1');

  try {
    const results = await Promise.all(
      tickers.map(async ticker => {
        try {
          const data = await fetchTicker(ticker, TIINGO_KEY);
          return analyzeStock(ticker, data);
        } catch { return null; }
      })
    );

    const signals = results
      .filter(r => r !== null && r.totalScore >= minScoreFilter)
      .sort((a, b) => b.totalScore - a.totalScore || b.change - a.change);

    return res.status(200).json({
      scannedAt: new Date().toISOString(),
      totalScanned: tickers.length,
      totalSignals: signals.length,
      signals,
    });
  } catch (err) {
    return res.status(502).json({ error: 'Scan failed.', detail: err.message });
  }
}
