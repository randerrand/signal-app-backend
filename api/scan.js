import { analyzeStock } from '../lib/signals.js';

const SP500 = [
  "A","AAL","AAP","AAPL","ABBV","ABC","ABMD","ABT","ACGL","ACGLP","ACGLW","ACN","ADBE","ADI","ADM","ADP","ADSK","AEE","AEP","AES","AFL","AFLPQ","AFLRW","AFLX","AIG","AIZ","AJG","AKAM","ALB","ALGN","ALK","ALL","ALLE","AMAT","AMCR","AMD","AME","AMGN","AMP","AMT","AMZN","ANET","ANSS","AON","AOS","APA","APD","APH","ARE","ATO","ATVI","AVB","AVGO","AVY","AWK","AXP","AZO","BA","BAC","BALL","BAX","BBWI","BBY","BC","BDX","BEN","BF-B","BG","BIIB","BIO","BK","BKNG","BKR","BLK","BLL","BMY","BR","BRK-B","BRO","BSX","BXP","C","CAG","CAH","CARR","CAT","CB","CBOE","CBRE","CCI","CCL","CDAY","CDNS","CDW","CE","CEG","CF","CFG","CHD","CHRW","CHTR","CI","CINF","CL","CLX","CMA","CMCSA","CME","CMG","CMI","CMS","CNC","CNP","COF","COO","COP","COST","CPB","CPRT","CPT","CRL","CRM","CSCO","CSGP","CSX","CTAS","CTLT","CTRA","CTSH","CTVA","CTXS","CVE","CVS","CVX","D","DAL","DD","DE","DELL","DFS","DG","DGX","DHI","DHR","DIS","DISCA","DISCK","DISH","DLR","DLTR","DOV","DOW","DPZ","DRE","DRI","DTE","DUK","DVA","DVN","DXC","DXCM","ECL","ED","EFX","EIX","EL","ELV","EMN","EMR","ENPH","EOG","EPAM","EQIX","EQR","ES","ESS","ETN","ETR","ETSY","EVRG","EW","EXC","EXPD","EXPE","EXR","F","FANG","FAST","FBHS","FCX","FDS","FDX","FE","FFIV","FIS","FISV","FITB","FLT","FMC","FOX","FOXA","FRC","FRT","FTNT","FTV","GD","GE","GEHC","GILD","GIS","GL","GLW","GM","GNRC","GOOG","GOOGL","GPC","GPN","GS","GWW","HAL","HAS","HCA","HD","HES","HIG","HII","HLT","HOLX","HON","HPE","HPQ","HRL","HSIC","HST","HSY","HUM","HWM","IBM","ICE","IDXX","IEX","IFF","ILMN","INCY","INTC","INTU","IP","IPG","IQV","IR","IRM","ISRG","IT","ITW","IVZ","J","JBHT","JCI","JKHY","JNJ","JNPR","JPM","K","KDP","KEY","KEYS","KHC","KIM","KLAC","KMB","KMI","KMX","KO","KR","KRNG","KRNT","KRYS","KSU","L","LDOS","LEG","LEN","LH","LHX","LIN","LKQ","LMT","LNC","LNT","LOW","LRCX","LUV","LW","LYB","LYV","MA","MAA","MAR","MAS","MCD","MCHP","MCK","MCO","MDLZ","MDT","MET","META","MGM","MHK","MKC","MKTX","MLM","MMC","MMM","MNST","MO","MOS","MPWR","MRK","MRO","MS","MSCI","MSFT","MSI","MTB","MTCH","MTD","MU","NCLH","NDAQ","NEE","NEM","NFLX","NI","NKE","NLOK","NOC","NOW","NRG","NSC","NTAP","NTRS","NUE","NVDA","NVR","NXPI","O","ODFL","OGN","OKE","OMC","ON","ORCL","ORLY","OTIS","OXY","PARA","PAYC","PAYX","PBCT","PCAR","PEAK","PEG","PENN","PEP","PFE","PFG","PG","PGR","PH","PHM","PKG","PKI","PLD","PM","PNC","PNR","PNW","POOL","PPG","PPL","PRGO","PRU","PSA","PSX","PTC","PVH","PWR","PXD","PYPL","QCOM","QRVO","RCL","RE","REG","REGN","RF","RHI","RJF","RL","RMD","ROK","ROL","ROP","ROST","RSG","RTX","SBAC","SBNY","SCHW","SEDG","SEE","SHW","SIVB","SJM","SLB","SNA","SNPS","SO","SPG","SPGI","SRE","STE","STLD","STT","STX","STZ","SWK","SWKS","SYF","SYK","SYY","T","TAP","TECH","TEL","TER","TFC","TFX","TGT","TJX","TMO","TMUS","TPR","TRGP","TRMB","TROW","TRV","TSCO","TSLA","TSN","TT","TTWO","TXN","TXT","TYL","UAL","UDR","UHS","ULTA","UNH","UNP","UPS","URI","USB","V","VFC","VICI","VLO","VMC","VRSK","VRSN","VRTX","VTR","VTRS","VZ","WAB","WAT","WBA","WBD","WDC","WEC","WELL","WFC","WHR","WM","WMB","WMT","WRB","WRK","WST","WTW","WY","WYNN","XEL","XOM","XRAY","XYL","YUM","ZBH","ZBRA","ZION","ZTS",
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
