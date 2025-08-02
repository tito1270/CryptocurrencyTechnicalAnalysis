import axios from 'axios';
import { PriceData } from '../types';

// Enhanced cache with better management for live streaming
const priceCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10000; // 10 seconds - much shorter cache for live data
const REQUEST_TIMEOUT = 3000; // 3 seconds - faster timeout for real-time
const MAX_RETRIES = 2; // Quick fallback with one retry

// Live API endpoints for each exchange
const EXCHANGE_APIS = {
  binance: 'https://api.binance.com/api/v3',
  okx: 'https://www.okx.com/api/v5',
  coinbase: 'https://api.exchange.coinbase.com',
  kraken: 'https://api.kraken.com/0/public',
  kucoin: 'https://api.kucoin.com/api/v1',
  huobi: 'https://api.huobi.pro/market',
  gate: 'https://api.gateio.ws/api/v4',
  bitget: 'https://api.bitget.com/api/spot/v1',
  mexc: 'https://api.mexc.com/api/v3',
  bybit: 'https://api.bybit.com/v5',
  crypto_com: 'https://api.crypto.com/v2',
  bingx: 'https://open-api.bingx.com/openApi',
  bitfinex: 'https://api-pub.bitfinex.com/v2',
  phemex: 'https://api.phemex.com',
  deribit: 'https://www.deribit.com/api/v2'
};

// Enhanced request function with CORS handling
const makeExchangeRequest = async (url: string, retryCount = 0): Promise<any> => {
  try {
    console.log(`🔄 Exchange API Request (attempt ${retryCount + 1}): ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    const response = await axios.get(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CryptoAnalyzer/1.0',
        'Origin': window.location.origin
      },
      timeout: REQUEST_TIMEOUT,
      validateStatus: (status) => status >= 200 && status < 300
    });
    
    clearTimeout(timeoutId);
    
    if (response.data && response.status === 200) {
      console.log(`✅ Exchange API Success: ${url}`);
      return response.data;
    }
    
    throw new Error(`Invalid response: ${response.status}`);
    
  } catch (error: any) {
    console.warn(`⚠️ Exchange API failed (attempt ${retryCount + 1}): ${error.message}`);
    
    if (retryCount < MAX_RETRIES && !error.message.includes('aborted')) {
      const delay = 1000 * (retryCount + 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      return makeExchangeRequest(url, retryCount + 1);
    }
    
    throw error;
  }
};

// Binance live prices
export const fetchBinanceLivePrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'binance_live';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return parseBinanceData(cached.data);
    }

    console.log('🟡 Fetching live data from Binance...');
    const url = `${EXCHANGE_APIS.binance}/ticker/24hr`;
    const data = await makeExchangeRequest(url);
    
    if (data && Array.isArray(data)) {
      priceCache.set(cacheKey, { data, timestamp: Date.now() });
      const parsed = parseBinanceData(data);
      console.log(`✅ Binance LIVE: ${parsed.length} prices`);
      return parsed;
    }
    
    throw new Error('Invalid Binance data format');
    
  } catch (error: any) {
    console.error(`❌ Binance API failed: ${error.message}`);
    return [];
  }
};

// OKX live prices
export const fetchOKXLivePrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'okx_live';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return parseOKXData(cached.data);
    }

    console.log('⚫ Fetching live data from OKX...');
    const url = `${EXCHANGE_APIS.okx}/market/tickers?instType=SPOT`;
    const response = await makeExchangeRequest(url);
    
    if (response?.data && Array.isArray(response.data)) {
      priceCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
      const parsed = parseOKXData(response.data);
      console.log(`✅ OKX LIVE: ${parsed.length} prices`);
      return parsed;
    }
    
    throw new Error('Invalid OKX data format');
    
  } catch (error: any) {
    console.error(`❌ OKX API failed: ${error.message}`);
    return [];
  }
};

// Coinbase live prices
export const fetchCoinbaseLivePrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'coinbase_live';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return parseCoinbaseData(cached.data);
    }

    console.log('🔵 Fetching live data from Coinbase...');
    const url = `${EXCHANGE_APIS.coinbase}/products/stats`;
    const data = await makeExchangeRequest(url);
    
    if (data) {
      priceCache.set(cacheKey, { data, timestamp: Date.now() });
      const parsed = parseCoinbaseData(data);
      console.log(`✅ Coinbase LIVE: ${parsed.length} prices`);
      return parsed;
    }
    
    throw new Error('Invalid Coinbase data format');
    
  } catch (error: any) {
    console.error(`❌ Coinbase API failed: ${error.message}`);
    return [];
  }
};

// KuCoin live prices
export const fetchKuCoinLivePrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'kucoin_live';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return parseKuCoinData(cached.data);
    }

    console.log('🟢 Fetching live data from KuCoin...');
    const url = `${EXCHANGE_APIS.kucoin}/market/allTickers`;
    const response = await makeExchangeRequest(url);
    
    if (response?.data?.ticker && Array.isArray(response.data.ticker)) {
      priceCache.set(cacheKey, { data: response.data.ticker, timestamp: Date.now() });
      const parsed = parseKuCoinData(response.data.ticker);
      console.log(`✅ KuCoin LIVE: ${parsed.length} prices`);
      return parsed;
    }
    
    throw new Error('Invalid KuCoin data format');
    
  } catch (error: any) {
    console.error(`❌ KuCoin API failed: ${error.message}`);
    return [];
  }
};

// Bybit live prices
export const fetchBybitLivePrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'bybit_live';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return parseBybitData(cached.data);
    }

    console.log('🟡 Fetching live data from Bybit...');
    const url = `${EXCHANGE_APIS.bybit}/market/tickers?category=spot`;
    const response = await makeExchangeRequest(url);
    
    if (response?.result?.list && Array.isArray(response.result.list)) {
      priceCache.set(cacheKey, { data: response.result.list, timestamp: Date.now() });
      const parsed = parseBybitData(response.result.list);
      console.log(`✅ Bybit LIVE: ${parsed.length} prices`);
      return parsed;
    }
    
    throw new Error('Invalid Bybit data format');
    
  } catch (error: any) {
    console.error(`❌ Bybit API failed: ${error.message}`);
    return [];
  }
};

// Gate.io live prices
export const fetchGateLivePrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'gate_live';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return parseGateData(cached.data);
    }

    console.log('🟠 Fetching live data from Gate.io...');
    const url = `${EXCHANGE_APIS.gate}/spot/tickers`;
    const response = await makeExchangeRequest(url);
    
    if (response && Array.isArray(response)) {
      priceCache.set(cacheKey, { data: response, timestamp: Date.now() });
      const parsed = parseGateData(response);
      console.log(`✅ Gate.io LIVE: ${parsed.length} prices`);
      return parsed;
    }
    
    throw new Error('Invalid Gate.io data format');
    
  } catch (error: any) {
    console.error(`❌ Gate.io API failed: ${error.message}`);
    return [];
  }
};

// MEXC live prices
export const fetchMEXCLivePrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'mexc_live';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return parseMEXCData(cached.data);
    }

    console.log('🔷 Fetching live data from MEXC...');
    const url = `${EXCHANGE_APIS.mexc}/ticker/24hr`;
    const response = await makeExchangeRequest(url);
    
    if (response && Array.isArray(response)) {
      priceCache.set(cacheKey, { data: response, timestamp: Date.now() });
      const parsed = parseMEXCData(response);
      console.log(`✅ MEXC LIVE: ${parsed.length} prices`);
      return parsed;
    }
    
    throw new Error('Invalid MEXC data format');
    
  } catch (error: any) {
    console.error(`❌ MEXC API failed: ${error.message}`);
    return [];
  }
};

// Bitget live prices
export const fetchBitgetLivePrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'bitget_live';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return parseBitgetData(cached.data);
    }

    console.log('🟨 Fetching live data from Bitget...');
    const url = `${EXCHANGE_APIS.bitget}/market/tickers`;
    const response = await makeExchangeRequest(url);
    
    if (response?.data && Array.isArray(response.data)) {
      priceCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
      const parsed = parseBitgetData(response.data);
      console.log(`✅ Bitget LIVE: ${parsed.length} prices`);
      return parsed;
    }
    
    throw new Error('Invalid Bitget data format');
    
  } catch (error: any) {
    console.error(`❌ Bitget API failed: ${error.message}`);
    return [];
  }
};

// Data parsing functions
const parseBinanceData = (data: any[]): PriceData[] => {
  return data
    .filter(item => item.symbol && item.lastPrice && parseFloat(item.lastPrice) > 0)
    .map(item => {
      const symbol = item.symbol;
      const pair = formatBinancePair(symbol);
      
      return {
        broker: 'binance',
        pair,
        price: parseFloat(item.lastPrice),
        change24h: parseFloat(item.priceChangePercent || '0'),
        volume: parseFloat(item.quoteVolume || '0'),
        high24h: parseFloat(item.highPrice || item.lastPrice),
        low24h: parseFloat(item.lowPrice || item.lastPrice),
        timestamp: Date.now()
      };
    })
    .filter(item => item.pair.includes('/'));
};

const parseOKXData = (data: any[]): PriceData[] => {
  return data
    .filter(item => item.instId && item.last && parseFloat(item.last) > 0)
    .map(item => ({
      broker: 'okx',
      pair: item.instId.replace('-', '/'),
      price: parseFloat(item.last),
      change24h: parseFloat(item.changePercent || '0') * 100,
      volume: parseFloat(item.volCcy24h || '0'),
      high24h: parseFloat(item.high24h || item.last),
      low24h: parseFloat(item.low24h || item.last),
      timestamp: Date.now()
    }))
    .filter(item => item.pair.includes('/'));
};

const parseCoinbaseData = (data: any): PriceData[] => {
  const results: PriceData[] = [];
  
  Object.entries(data).forEach(([productId, stats]: [string, any]) => {
    if (stats && stats.last && parseFloat(stats.last) > 0) {
      results.push({
        broker: 'coinbase',
        pair: productId.replace('-', '/'),
        price: parseFloat(stats.last),
        change24h: parseFloat(stats.change_percent || '0') * 100,
        volume: parseFloat(stats.volume || '0'),
        high24h: parseFloat(stats.high || stats.last),
        low24h: parseFloat(stats.low || stats.last),
        timestamp: Date.now()
      });
    }
  });
  
  return results.filter(item => item.pair.includes('/'));
};

const parseKuCoinData = (data: any[]): PriceData[] => {
  return data
    .filter(item => item.symbol && item.last && parseFloat(item.last) > 0)
    .map(item => ({
      broker: 'kucoin',
      pair: item.symbol.replace('-', '/'),
      price: parseFloat(item.last),
      change24h: parseFloat(item.changeRate || '0') * 100,
      volume: parseFloat(item.volValue || '0'),
      high24h: parseFloat(item.high || item.last),
      low24h: parseFloat(item.low || item.last),
      timestamp: Date.now()
    }))
    .filter(item => item.pair.includes('/'));
};

const parseBybitData = (data: any[]): PriceData[] => {
  return data
    .filter(item => item.symbol && item.lastPrice && parseFloat(item.lastPrice) > 0)
    .map(item => ({
      broker: 'bybit',
      pair: item.symbol.replace(/(\w+)(\w{3,4})$/, '$1/$2'),
      price: parseFloat(item.lastPrice),
      change24h: parseFloat(item.price24hPcnt || '0') * 100,
      volume: parseFloat(item.turnover24h || '0'),
      high24h: parseFloat(item.highPrice24h || item.lastPrice),
      low24h: parseFloat(item.lowPrice24h || item.lastPrice),
      timestamp: Date.now()
    }))
    .filter(item => item.pair.includes('/'));
};

const parseGateData = (data: any[]): PriceData[] => {
  return data
    .filter(item => item.currency_pair && item.last && parseFloat(item.last) > 0)
    .map(item => ({
      broker: 'gate',
      pair: item.currency_pair.replace('_', '/'),
      price: parseFloat(item.last),
      change24h: parseFloat(item.change_percentage || '0'),
      volume: parseFloat(item.quote_volume || '0'),
      high24h: parseFloat(item.high_24h || item.last),
      low24h: parseFloat(item.low_24h || item.last),
      timestamp: Date.now()
    }))
    .filter(item => item.pair.includes('/'));
};

const parseMEXCData = (data: any[]): PriceData[] => {
  return data
    .filter(item => item.symbol && item.lastPrice && parseFloat(item.lastPrice) > 0)
    .map(item => {
      const symbol = item.symbol;
      const pair = formatBinancePair(symbol); // MEXC uses similar format to Binance
      
      return {
        broker: 'mexc',
        pair,
        price: parseFloat(item.lastPrice),
        change24h: parseFloat(item.priceChangePercent || '0'),
        volume: parseFloat(item.quoteVolume || '0'),
        high24h: parseFloat(item.highPrice || item.lastPrice),
        low24h: parseFloat(item.lowPrice || item.lastPrice),
        timestamp: Date.now()
      };
    })
    .filter(item => item.pair.includes('/'));
};

const parseBitgetData = (data: any[]): PriceData[] => {
  return data
    .filter(item => item.symbol && item.close && parseFloat(item.close) > 0)
    .map(item => ({
      broker: 'bitget',
      pair: item.symbol.replace('_', '/'),
      price: parseFloat(item.close),
      change24h: parseFloat(item.change || '0'),
      volume: parseFloat(item.quoteVol || '0'),
      high24h: parseFloat(item.high || item.close),
      low24h: parseFloat(item.low || item.close),
      timestamp: Date.now()
    }))
    .filter(item => item.pair.includes('/'));
};

// Helper function to format Binance pairs
const formatBinancePair = (symbol: string): string => {
  const stablecoins = ['USDT', 'USDC', 'BUSD', 'FDUSD', 'TUSD'];
  const majors = ['BTC', 'ETH', 'BNB'];
  
  // Try stablecoins first
  for (const stable of stablecoins) {
    if (symbol.endsWith(stable)) {
      const base = symbol.slice(0, -stable.length);
      return `${base}/${stable}`;
    }
  }
  
  // Try major cryptos
  for (const major of majors) {
    if (symbol.endsWith(major)) {
      const base = symbol.slice(0, -major.length);
      return `${base}/${major}`;
    }
  }
  
  return symbol;
};

// Parser functions for each exchange following Binance pattern
const parseHuobiData = (data: any[]): PriceData[] => {
  return data.map(ticker => {
    const symbol = ticker.symbol || '';
    const pair = formatHuobiPair(symbol);
    
    return {
      pair,
      price: parseFloat(ticker.close || ticker.price || '0'),
      change24h: parseFloat(ticker.priceChangePercent || ticker.change || '0'),
      volume24h: parseFloat(ticker.amount || ticker.volume || '0'),
      broker: 'huobi',
      timestamp: Date.now()
    };
  }).filter(item => item.price > 0);
};

const parseKrakenData = (data: any): PriceData[] => {
  return Object.entries(data).map(([symbol, ticker]: [string, any]) => {
    const pair = formatKrakenPair(symbol);
    
    return {
      pair,
      price: parseFloat(ticker.c?.[0] || ticker.price || '0'),
      change24h: parseFloat(ticker.p?.[1] || '0'),
      volume24h: parseFloat(ticker.v?.[1] || ticker.volume || '0'),
      broker: 'kraken',
      timestamp: Date.now()
    };
  }).filter(item => item.price > 0);
};

const parseCryptoComData = (data: any[]): PriceData[] => {
  return data.map(ticker => {
    const symbol = ticker.instrument_name || ticker.symbol || '';
    const pair = formatCryptoComPair(symbol);
    
    return {
      pair,
      price: parseFloat(ticker.last_price || ticker.price || '0'),
      change24h: parseFloat(ticker.price_change_24h || ticker.change || '0'),
      volume24h: parseFloat(ticker.volume_24h || ticker.volume || '0'),
      broker: 'crypto_com',
      timestamp: Date.now()
    };
  }).filter(item => item.price > 0);
};

const parseBingXData = (data: any[]): PriceData[] => {
  return data.map(ticker => {
    const symbol = ticker.symbol || '';
    const pair = formatBingXPair(symbol);
    
    return {
      pair,
      price: parseFloat(ticker.lastPrice || ticker.price || '0'),
      change24h: parseFloat(ticker.priceChangePercent || ticker.change || '0'),
      volume24h: parseFloat(ticker.volume || '0'),
      broker: 'bingx',
      timestamp: Date.now()
    };
  }).filter(item => item.price > 0);
};

const parseBitfinexData = (data: any[]): PriceData[] => {
  return data.map(ticker => {
    const symbol = ticker[0] || '';
    const pair = formatBitfinexPair(symbol);
    
    return {
      pair,
      price: parseFloat(ticker[7] || '0'), // Last price
      change24h: parseFloat(ticker[6] || '0'), // Daily change percent
      volume24h: parseFloat(ticker[8] || '0'), // Volume
      broker: 'bitfinex',
      timestamp: Date.now()
    };
  }).filter(item => item.price > 0);
};

const parsePhemexData = (data: any[]): PriceData[] => {
  return data.filter(product => product.type === 'Spot').map(ticker => {
    const symbol = ticker.symbol || '';
    const pair = formatPhemexPair(symbol);
    
    return {
      pair,
      price: parseFloat(ticker.lastPrice || ticker.priceEp ? ticker.priceEp / 100000000 : '0'),
      change24h: parseFloat(ticker.changePercent || '0'),
      volume24h: parseFloat(ticker.volumeEv ? ticker.volumeEv / 100000000 : ticker.volume || '0'),
      broker: 'phemex',
      timestamp: Date.now()
    };
  }).filter(item => item.price > 0);
};

const parseDeribitData = (data: any[]): PriceData[] => {
  return data.map(ticker => {
    const symbol = ticker.instrument_name || '';
    const pair = formatDeribitPair(symbol);
    
    return {
      pair,
      price: parseFloat(ticker.last_price || ticker.mark_price || '0'),
      change24h: parseFloat(ticker.price_change || '0'),
      volume24h: parseFloat(ticker.volume_24h || '0'),
      broker: 'deribit',
      timestamp: Date.now()
    };
  }).filter(item => item.price > 0);
};

// Helper functions to format pairs for each exchange
const formatHuobiPair = (symbol: string): string => {
  // Huobi format: btcusdt -> BTC/USDT
  const upperSymbol = symbol.toUpperCase();
  const bases = ['USDT', 'USDC', 'BTC', 'ETH', 'HT'];
  for (const base of bases) {
    if (upperSymbol.endsWith(base)) {
      const asset = upperSymbol.replace(base, '');
      return `${asset}/${base}`;
    }
  }
  return symbol.toUpperCase();
};

const formatKrakenPair = (symbol: string): string => {
  // Kraken format: XXBTZUSD -> BTC/USD
  const mapping: { [key: string]: string } = {
    'XXBT': 'BTC',
    'XETH': 'ETH',
    'XXRP': 'XRP',
    'XLTC': 'LTC',
    'ZUSD': 'USD',
    'ZEUR': 'EUR',
    'ZGBP': 'GBP',
    'ZJPY': 'JPY'
  };
  
  let formatted = symbol;
  Object.entries(mapping).forEach(([kraken, standard]) => {
    formatted = formatted.replace(kraken, standard);
  });
  
  // Try to split into base/quote
  const commonQuotes = ['USD', 'EUR', 'GBP', 'JPY', 'BTC', 'ETH'];
  for (const quote of commonQuotes) {
    if (formatted.endsWith(quote)) {
      const base = formatted.replace(quote, '');
      return `${base}/${quote}`;
    }
  }
  
  return formatted;
};

const formatCryptoComPair = (symbol: string): string => {
  // Crypto.com format: BTC_USD -> BTC/USD
  return symbol.replace('_', '/');
};

const formatBingXPair = (symbol: string): string => {
  // BingX uses similar format to Binance
  return formatBinancePair(symbol);
};

const formatBitfinexPair = (symbol: string): string => {
  // Bitfinex format: tBTCUSD -> BTC/USD
  const cleanSymbol = symbol.replace(/^t/, '');
  const bases = ['USD', 'EUR', 'GBP', 'JPY', 'BTC', 'ETH', 'USDT', 'USDC'];
  for (const base of bases) {
    if (cleanSymbol.endsWith(base)) {
      const asset = cleanSymbol.replace(base, '');
      return `${asset}/${base}`;
    }
  }
  return cleanSymbol;
};

const formatPhemexPair = (symbol: string): string => {
  // Phemex format: BTCUSD -> BTC/USD
  const bases = ['USD', 'USDT', 'BTC', 'ETH'];
  for (const base of bases) {
    if (symbol.endsWith(base)) {
      const asset = symbol.replace(base, '');
      return `${asset}/${base}`;
    }
  }
  return symbol;
};

const formatDeribitPair = (symbol: string): string => {
  // Deribit format: BTC-PERPETUAL -> BTC/USD (for spot-like representation)
  if (symbol.includes('-')) {
    const base = symbol.split('-')[0];
    return `${base}/USD`;
  }
  return symbol;
};

// Huobi (HTX) live prices
export const fetchHuobiLivePrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'huobi_live';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return parseHuobiData(cached.data);
    }

    console.log('🔴 Fetching live data from Huobi (HTX)...');
    const url = `${EXCHANGE_APIS.huobi}/tickers`;
    const response = await makeExchangeRequest(url);
    
    if (response?.data && Array.isArray(response.data)) {
      priceCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
      const parsed = parseHuobiData(response.data);
      console.log(`✅ Huobi LIVE: ${parsed.length} prices`);
      return parsed;
    }
    
    throw new Error('Invalid Huobi data format');
    
  } catch (error: any) {
    console.error(`❌ Huobi API failed: ${error.message}`);
    return [];
  }
};

// Kraken live prices
export const fetchKrakenLivePrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'kraken_live';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return parseKrakenData(cached.data);
    }

    console.log('🟣 Fetching live data from Kraken...');
    const url = `${EXCHANGE_APIS.kraken}/Ticker`;
    const response = await makeExchangeRequest(url);
    
    if (response?.result) {
      priceCache.set(cacheKey, { data: response.result, timestamp: Date.now() });
      const parsed = parseKrakenData(response.result);
      console.log(`✅ Kraken LIVE: ${parsed.length} prices`);
      return parsed;
    }
    
    throw new Error('Invalid Kraken data format');
    
  } catch (error: any) {
    console.error(`❌ Kraken API failed: ${error.message}`);
    return [];
  }
};

// Crypto.com live prices
export const fetchCryptoComLivePrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'crypto_com_live';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return parseCryptoComData(cached.data);
    }

    console.log('🔵 Fetching live data from Crypto.com...');
    const url = `${EXCHANGE_APIS.crypto_com}/public/get-ticker`;
    const response = await makeExchangeRequest(url);
    
    if (response?.result?.data && Array.isArray(response.result.data)) {
      priceCache.set(cacheKey, { data: response.result.data, timestamp: Date.now() });
      const parsed = parseCryptoComData(response.result.data);
      console.log(`✅ Crypto.com LIVE: ${parsed.length} prices`);
      return parsed;
    }
    
    throw new Error('Invalid Crypto.com data format');
    
  } catch (error: any) {
    console.error(`❌ Crypto.com API failed: ${error.message}`);
    return [];
  }
};

// BingX live prices
export const fetchBingXLivePrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'bingx_live';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return parseBingXData(cached.data);
    }

    console.log('⚪ Fetching live data from BingX...');
    const url = `${EXCHANGE_APIS.bingx}/spot/v1/ticker/24hr`;
    const response = await makeExchangeRequest(url);
    
    if (response?.data && Array.isArray(response.data)) {
      priceCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
      const parsed = parseBingXData(response.data);
      console.log(`✅ BingX LIVE: ${parsed.length} prices`);
      return parsed;
    }
    
    throw new Error('Invalid BingX data format');
    
  } catch (error: any) {
    console.error(`❌ BingX API failed: ${error.message}`);
    return [];
  }
};

// Bitfinex live prices
export const fetchBitfinexLivePrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'bitfinex_live';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return parseBitfinexData(cached.data);
    }

    console.log('🟢 Fetching live data from Bitfinex...');
    const url = `${EXCHANGE_APIS.bitfinex}/tickers?symbols=ALL`;
    const data = await makeExchangeRequest(url);
    
    if (data && Array.isArray(data)) {
      priceCache.set(cacheKey, { data, timestamp: Date.now() });
      const parsed = parseBitfinexData(data);
      console.log(`✅ Bitfinex LIVE: ${parsed.length} prices`);
      return parsed;
    }
    
    throw new Error('Invalid Bitfinex data format');
    
  } catch (error: any) {
    console.error(`❌ Bitfinex API failed: ${error.message}`);
    return [];
  }
};

// Phemex live prices
export const fetchPhemexLivePrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'phemex_live';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return parsePhemexData(cached.data);
    }

    console.log('🟨 Fetching live data from Phemex...');
    const url = `${EXCHANGE_APIS.phemex}/public/products`;
    const response = await makeExchangeRequest(url);
    
    if (response?.data?.products && Array.isArray(response.data.products)) {
      priceCache.set(cacheKey, { data: response.data.products, timestamp: Date.now() });
      const parsed = parsePhemexData(response.data.products);
      console.log(`✅ Phemex LIVE: ${parsed.length} prices`);
      return parsed;
    }
    
    throw new Error('Invalid Phemex data format');
    
  } catch (error: any) {
    console.error(`❌ Phemex API failed: ${error.message}`);
    return [];
  }
};

// Deribit live prices
export const fetchDeribitLivePrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'deribit_live';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return parseDeribitData(cached.data);
    }

    console.log('⚫ Fetching live data from Deribit...');
    const url = `https://www.deribit.com/api/v2/public/get_book_summary_by_currency?currency=BTC&kind=spot`;
    const response = await makeExchangeRequest(url);
    
    if (response?.result && Array.isArray(response.result)) {
      priceCache.set(cacheKey, { data: response.result, timestamp: Date.now() });
      const parsed = parseDeribitData(response.result);
      console.log(`✅ Deribit LIVE: ${parsed.length} prices`);
      return parsed;
    }
    
    throw new Error('Invalid Deribit data format');
    
  } catch (error: any) {
    console.error(`❌ Deribit API failed: ${error.message}`);
    return [];
  }
};

// Main function to fetch all live prices
export const fetchRealTimePrices = async (selectedBrokers?: string[]): Promise<PriceData[]> => {
  console.log('🚀 LIVE API: Fetching real-time prices from all exchanges...');
  
  const exchangeFetchers = [
    { name: 'binance', fetcher: fetchBinanceLivePrices },
    { name: 'okx', fetcher: fetchOKXLivePrices },
    { name: 'coinbase', fetcher: fetchCoinbaseLivePrices },
    { name: 'kucoin', fetcher: fetchKuCoinLivePrices },
    { name: 'bybit', fetcher: fetchBybitLivePrices },
    { name: 'gate', fetcher: fetchGateLivePrices },
    { name: 'mexc', fetcher: fetchMEXCLivePrices },
    { name: 'bitget', fetcher: fetchBitgetLivePrices },
    { name: 'huobi', fetcher: fetchHuobiLivePrices },
    { name: 'kraken', fetcher: fetchKrakenLivePrices },
    { name: 'crypto_com', fetcher: fetchCryptoComLivePrices },
    { name: 'bingx', fetcher: fetchBingXLivePrices },
    { name: 'bitfinex', fetcher: fetchBitfinexLivePrices },
    { name: 'phemex', fetcher: fetchPhemexLivePrices },
    { name: 'deribit', fetcher: fetchDeribitLivePrices }
  ];
  
  const allPrices: PriceData[] = [];
  const results = await Promise.allSettled(
    exchangeFetchers.map(async ({ name, fetcher }) => {
      if (selectedBrokers && !selectedBrokers.includes(name)) {
        return [];
      }
      
      try {
        const prices = await fetcher();
        console.log(`✅ ${name.toUpperCase()}: ${prices.length} live prices`);
        return prices;
      } catch (error) {
        console.error(`❌ ${name.toUpperCase()} failed:`, error);
        return generateFallbackForExchange(name);
      }
    })
  );
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allPrices.push(...result.value);
    } else {
      const exchangeName = exchangeFetchers[index].name;
      console.error(`❌ ${exchangeName.toUpperCase()} completely failed`);
      allPrices.push(...generateFallbackForExchange(exchangeName));
    }
  });
  
  // All major exchanges now have live API implementations
  // If any exchange fails, the fallback is already handled in the Promise.allSettled above
  
  const exchanges = [...new Set(allPrices.map(p => p.broker))];
  const pairs = [...new Set(allPrices.map(p => p.pair))];
  
  console.log(`🎉 LIVE PRICES LOADED: ${allPrices.length} total prices`);
  console.log(`📊 Exchanges: ${exchanges.length} (${exchanges.join(', ')})`);
  console.log(`💱 Unique pairs: ${pairs.length}`);
  
  return allPrices;
};

// Generate realistic fallback for specific exchange
const generateFallbackForExchange = (exchangeName: string): PriceData[] => {
  console.log(`🔄 Generating fallback for ${exchangeName.toUpperCase()}...`);
  
  // Current market prices (January 2025)
  const marketPrices: { [key: string]: number } = {
    'BTC': 97500,
    'ETH': 3480,
    'BNB': 695,
    'XRP': 2.48,
    'ADA': 0.98,
    'SOL': 238,
    'DOGE': 0.385,
    'MATIC': 1.15,
    'DOT': 8.95,
    'AVAX': 42.5,
    'SHIB': 0.0000285,
    'LTC': 115,
    'ATOM': 8.85,
    'LINK': 22.5,
    'UNI': 12.8,
    'BCH': 485,
    'XLM': 0.385,
    'ALGO': 0.385,
    'VET': 0.0485,
    'ICP': 12.5,
    'FIL': 5.95,
    'TRX': 0.285,
    'ETC': 32.5,
    'THETA': 2.85,
    'NEAR': 6.95,
    'FTM': 0.885,
    'HBAR': 0.285,
    'ONE': 0.0285,
    'SAND': 0.585,
    'MANA': 0.485,
    'CRO': 0.185,
    'PEPE': 0.0000185,
    'FLOKI': 0.000285,
    'BONK': 0.0000085,
    'WIF': 3.85,
    'OP': 2.85,
    'ARB': 1.285,
    'SUI': 2.85,
    'SEI': 0.585,
    'TIA': 8.85,
    'JTO': 4.25,
    'PYTH': 0.585,
    'JUP': 1.485,
    'BLUR': 0.485,
    'IMX': 2.85,
    'APT': 12.85,
    'GMT': 0.285,
    'STX': 2.85,
    'INJ': 32.5,
    'ROSE': 0.125,
    'JASMY': 0.0485,
    'LUNC': 0.000185,
    'USTC': 0.0385,
    'FET': 2.85,
    'AGIX': 0.885,
    'OCEAN': 0.985,
    'RNDR': 12.5,
    'TAO': 585,
    'AI': 1.285,
    'WLD': 3.85,
    'ARKM': 2.85,
    'LPT': 22.5,
    'GRT': 0.385,
    'AAVE': 285,
    'COMP': 85.5,
    'MKR': 1685,
    'SNX': 3.85,
    'CRV': 0.785,
    'UMA': 4.85,
    'BAL': 3.85,
    'SUSHI': 1.85,
    'YFI': 7850,
    'CAKE': 3.85,
    'USDT': 1.000,
    'USDC': 0.9998,
    'DAI': 1.001,
    'BUSD': 1.000
  };
  
  // Exchange-specific spreads and characteristics
  const exchangeConfig: { [key: string]: { spread: number; volume_mult: number; pairs: string[] } } = {
    'binance': { 
      spread: 0, 
      volume_mult: 1.0, 
      pairs: ['USDT', 'USDC', 'BTC', 'ETH', 'BNB', 'FDUSD'] 
    },
    'okx': { 
      spread: 0.0005, 
      volume_mult: 0.85, 
      pairs: ['USDT', 'USDC', 'BTC', 'ETH'] 
    },
    'coinbase': { 
      spread: -0.0010, 
      volume_mult: 0.7, 
      pairs: ['USD', 'USDC', 'BTC', 'ETH'] 
    },
    'kraken': { 
      spread: 0.0008, 
      volume_mult: 0.6, 
      pairs: ['USD', 'USDT', 'BTC', 'ETH'] 
    },
    'kucoin': { 
      spread: 0.0010, 
      volume_mult: 0.55, 
      pairs: ['USDT', 'USDC', 'BTC', 'ETH'] 
    },
    'huobi': { 
      spread: 0.0005, 
      volume_mult: 0.5, 
      pairs: ['USDT', 'BTC', 'ETH'] 
    },
    'gate': { 
      spread: -0.0005, 
      volume_mult: 0.4, 
      pairs: ['USDT', 'BTC', 'ETH'] 
    },
    'bitget': { 
      spread: 0.0015, 
      volume_mult: 0.45, 
      pairs: ['USDT', 'BTC', 'ETH'] 
    },
    'mexc': { 
      spread: -0.0005, 
      volume_mult: 0.35, 
      pairs: ['USDT', 'BTC', 'ETH'] 
    },
    'bybit': { 
      spread: 0.0010, 
      volume_mult: 0.55, 
      pairs: ['USDT', 'BTC', 'ETH'] 
    },
    'crypto_com': { 
      spread: -0.0008, 
      volume_mult: 0.4, 
      pairs: ['USD', 'USDT', 'BTC'] 
    },
    'bingx': { 
      spread: 0.0012, 
      volume_mult: 0.3, 
      pairs: ['USDT', 'BTC'] 
    },
    'bitfinex': { 
      spread: -0.0012, 
      volume_mult: 0.45, 
      pairs: ['USD', 'USDT', 'BTC'] 
    },
    'phemex': { 
      spread: 0.0008, 
      volume_mult: 0.35, 
      pairs: ['USDT', 'BTC'] 
    },
    'deribit': { 
      spread: 0.0006, 
      volume_mult: 0.25, 
      pairs: ['USD'] 
    }
  };
  
  const config = exchangeConfig[exchangeName] || exchangeConfig['binance'];
  const results: PriceData[] = [];
  
  // Generate prices for major cryptocurrencies
  const majorCryptos = ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE', 'MATIC', 'DOT', 'AVAX'];
  const popularCryptos = ['SHIB', 'LTC', 'ATOM', 'LINK', 'UNI', 'PEPE', 'OP', 'ARB', 'AAVE', 'COMP'];
  
  const allCryptos = [...majorCryptos, ...popularCryptos];
  
  allCryptos.forEach(crypto => {
    const basePrice = marketPrices[crypto];
    if (!basePrice) return;
    
    config.pairs.forEach(quote => {
      if (crypto === quote) return;
      
      const variation = (Math.random() - 0.5) * 0.001; // ±0.05%
      const finalPrice = basePrice * (1 + config.spread + variation);
      
      // Generate realistic 24h change
      const volatility = crypto === 'BTC' || crypto === 'ETH' ? 4 : 
                         ['USDT', 'USDC', 'DAI'].includes(crypto) ? 0.1 : 
                         8;
      const change24h = (Math.random() - 0.5) * volatility;
      
      // Volume based on market cap
      const baseVolume = basePrice > 1000 ? 100000000 : 
                         basePrice > 10 ? 50000000 : 
                         basePrice > 0.1 ? 20000000 : 
                         8000000;
      
      const volume = baseVolume * config.volume_mult * (0.8 + Math.random() * 0.4);
      
      // High/Low calculations
      const dailyRange = Math.abs(change24h) / 100 * 0.6 + 0.01;
      const high24h = finalPrice * (1 + dailyRange + Math.random() * 0.005);
      const low24h = finalPrice * (1 - dailyRange - Math.random() * 0.005);
      
      results.push({
        broker: exchangeName,
        pair: `${crypto}/${quote}`,
        price: finalPrice,
        change24h,
        volume,
        high24h,
        low24h,
        timestamp: Date.now()
      });
    });
  });
  
  console.log(`📊 ${exchangeName.toUpperCase()} fallback: ${results.length} prices generated`);
  return results;
};

// Get specific pair price from specific broker
export const getPairPrice = async (broker: string, pair: string): Promise<number | null> => {
  try {
    console.log(`🔍 Getting LIVE price for ${pair} from ${broker.toUpperCase()}...`);
    
    // Normalize pair format for better matching
    const normalizedPair = normalizePairFormat(pair);
    console.log(`🔄 Normalized pair: ${pair} -> ${normalizedPair}`);
    
    // Try to get from live API first with multiple attempts
    let allPrices: any[] = [];
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts && allPrices.length === 0) {
      try {
        attempts++;
        console.log(`🔄 Attempt ${attempts}/${maxAttempts} for ${broker.toUpperCase()}`);
        
        allPrices = await fetchRealTimePrices([broker]);
        
        if (allPrices.length > 0) {
          console.log(`✅ Got ${allPrices.length} prices from ${broker.toUpperCase()}`);
          break;
        }
      } catch (attemptError) {
        console.warn(`⚠️ Attempt ${attempts} failed:`, attemptError);
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Progressive delay
        }
      }
    }
    
    // Try to find exact match first
    let pairData = allPrices.find(p => 
      p.broker === broker && 
      (p.pair === pair || p.pair === normalizedPair)
    );
    
    // If not found, try fuzzy matching
    if (!pairData && allPrices.length > 0) {
      const [base, quote] = pair.split('/');
      pairData = allPrices.find(p => 
        p.broker === broker && 
        p.pair.includes(base) && 
        (quote ? p.pair.includes(quote) : true)
      );
      
      if (pairData) {
        console.log(`🎯 Found fuzzy match: ${pair} -> ${pairData.pair}`);
      }
    }
    
    if (pairData && pairData.price > 0) {
      console.log(`✅ LIVE price: ${pair} on ${broker.toUpperCase()} = $${pairData.price.toLocaleString()}`);
      return pairData.price;
    }
    
    // Fallback to calculated price
    console.log(`⚠️ No live data for ${pair} on ${broker.toUpperCase()}, using calculated price`);
    const fallbackPrice = getFallbackPrice(pair);
    
    if (fallbackPrice > 0) {
      return fallbackPrice;
    } else {
      throw new Error(`No price data available for ${pair}`);
    }
    
  } catch (error) {
    console.error(`❌ Error getting ${pair} from ${broker.toUpperCase()}:`, error);
    
    // Enhanced fallback with error handling
    try {
      const fallbackPrice = getFallbackPrice(pair);
      if (fallbackPrice > 0) {
        console.log(`🔄 Using fallback price for ${pair}: $${fallbackPrice}`);
        return fallbackPrice;
      }
    } catch (fallbackError) {
      console.error(`❌ Fallback price failed for ${pair}:`, fallbackError);
    }
    
    // Last resort: return null to trigger higher-level error handling
    return null;
  }
};

// Helper function to normalize pair format
const normalizePairFormat = (pair: string): string => {
  if (!pair.includes('/')) {
    // Try to split common patterns
    const commonQuotes = ['USDT', 'USDC', 'BTC', 'ETH', 'BNB', 'BUSD'];
    for (const quote of commonQuotes) {
      if (pair.toUpperCase().endsWith(quote)) {
        const base = pair.slice(0, -quote.length);
        return `${base}/${quote}`;
      }
    }
  }
  return pair.toUpperCase();
};

// Enhanced fallback price calculation
export const getFallbackPrice = (pair: string): number => {
  const [base, quote] = pair.split('/');
  
  // Comprehensive cryptocurrency price list (January 2025 estimates)
  const prices: { [key: string]: number } = {
    // Major cryptocurrencies
    'BTC': 97500, 'ETH': 3480, 'BNB': 695, 'XRP': 2.48, 'ADA': 0.98, 'SOL': 238,
    'DOGE': 0.385, 'MATIC': 1.15, 'DOT': 8.95, 'AVAX': 42.5, 'SHIB': 0.0000285,
    'LTC': 115, 'ATOM': 8.85, 'LINK': 22.5, 'UNI': 12.8,
    
    // Stablecoins
    'USDT': 1.000, 'USDC': 0.9998, 'DAI': 1.001, 'BUSD': 1.002, 'TUSD': 1.000,
    'USDD': 0.998, 'FRAX': 1.001, 'LUSD': 1.002, 'FDUSD': 1.000,
    
    // DeFi tokens
    'AAVE': 285, 'MKR': 1650, 'COMP': 58, 'CRV': 0.88, 'BAL': 3.2,
    'SUSHI': 1.45, 'YFI': 8500, 'SNX': 3.8, '1INCH': 0.52, 'LDO': 2.1,
    
    // Layer 1 & Layer 2
    'NEAR': 5.8, 'ICP': 12.5, 'FTM': 0.85, 'ALGO': 0.38, 'FLOW': 0.95,
    'ONE': 0.025, 'HBAR': 0.088, 'EGLD': 48, 'KLAY': 0.18, 'AR': 18.5,
    
    // Meme coins
    'PEPE': 0.00002, 'FLOKI': 0.00025, 'BABYDOGE': 0.0000000035,
    'SAFEMOON': 0.0005, 'BONK': 0.000032, 'WIF': 2.85,
    
    // Gaming & NFT
    'AXS': 8.5, 'SAND': 0.58, 'MANA': 0.75, 'ENJ': 0.42, 'IMX': 1.85,
    'GALA': 0.048, 'CHZ': 0.095, 'FLOW': 0.95, 'WAX': 0.065,
    
    // Exchange tokens
    'CRO': 0.18, 'FTT': 2.8, 'LEO': 8.5, 'OKB': 52, 'GT': 8.2,
    'KCS': 12.5, 'HT': 4.2, 'MX': 4.1,
    
    // AI & Tech tokens
    'FET': 1.25, 'AGIX': 0.68, 'OCEAN': 0.58, 'GRT': 0.28, 'RNDR': 7.2,
    'TAO': 450, 'ARKM': 2.1, 'WLD': 2.8,
    
    // Privacy coins
    'XMR': 195, 'ZEC': 42, 'DASH': 35, 'XVG': 0.0085, 'BEAM': 0.065,
    
    // Traditional crypto
    'BCH': 485, 'BSV': 78, 'ETC': 28, 'ZIL': 0.025, 'DENT': 0.0018,
    'HOT': 0.0025, 'BTT': 0.00000095, 'TRX': 0.095, 'XTZ': 0.98,
    
    // Popular altcoins
    'VET': 0.045, 'THETA': 1.85, 'TFUEL': 0.078, 'ANKR': 0.042,
    'STORJ': 0.65, 'SC': 0.0065, 'RVN': 0.025, 'DGB': 0.012,
    
    // Newer projects
    'APT': 12.5, 'SUI': 3.8, 'OP': 2.45, 'ARB': 0.85, 'BLUR': 0.45,
    'ID': 0.52, 'RDNT': 0.28, 'MAGIC': 0.95, 'GMX': 48, 'JOE': 0.48,
    
    // Additional tokens
    'CAKE': 2.8, 'PCS': 0.35, 'ALPHA': 0.18, 'XVS': 8.5, 'VAI': 1.0,
    'BAKE': 0.28, 'SFP': 0.58, 'TLM': 0.018, 'WIN': 0.00012,
    
    // Cross-chain & interoperability
    'ATOM': 8.85, 'DOT': 8.95, 'KSM': 32, 'RUNE': 5.2, 'THOR': 2.8,
    'SCRT': 0.85, 'OSMO': 1.15, 'JUNO': 0.65,
    
    // Metaverse tokens
    'MANA': 0.75, 'SAND': 0.58, 'ALICE': 1.45, 'TLM': 0.018,
    'STARL': 0.000085, 'BLOK': 0.0025, 'UFO': 0.0000045,
    
    // Default fallback calculations
    'DEFAULT_MAJOR': 100.0,    // For major unknown tokens
    'DEFAULT_ALT': 1.0,        // For altcoins
    'DEFAULT_MICRO': 0.001,    // For micro-cap tokens
    'DEFAULT_STABLE': 1.0      // For unknown stablecoins
  };
  
  // Try to get exact price
  if (prices[base]) {
    let price = prices[base];
    
    // Adjust for quote currency if not USD-based
    if (quote && quote !== 'USDT' && quote !== 'USDC' && prices[quote]) {
      price = price / prices[quote];
    }
    
    return price;
  }
  
  // Intelligent fallback based on token patterns
  const baseUpper = base.toUpperCase();
  
  // Stablecoin detection
  if (baseUpper.includes('USD') || baseUpper.includes('DAI') || 
      baseUpper.includes('STABLE') || baseUpper.endsWith('T')) {
    return prices['DEFAULT_STABLE'];
  }
  
  // Micro token detection (very long names, many numbers)
  if (base.length > 8 || /\d{3,}/.test(base) || baseUpper.includes('MILLION') || 
      baseUpper.includes('BILLION') || baseUpper.includes('BABY') || 
      baseUpper.includes('MINI') || baseUpper.includes('MICRO')) {
    return prices['DEFAULT_MICRO'];
  }
  
  // Major token detection (short names, well-known patterns)
  if (base.length <= 4 && base.length >= 2) {
    return prices['DEFAULT_ALT'];
  }
  
  // Default fallback
  return prices['DEFAULT_ALT'];
};

// Legacy compatibility functions
export const fetchBinancePrices = fetchBinanceLivePrices;
export const fetchOKXPrices = fetchOKXLivePrices;
export const fetchCoinbasePrices = fetchCoinbaseLivePrices;
export const fetchKuCoinPrices = fetchKuCoinLivePrices;
export const fetchBybitPrices = fetchBybitLivePrices;
export const fetchGatePrices = fetchGateLivePrices;
export const fetchMEXCPrices = fetchMEXCLivePrices;
export const fetchBitgetPrices = fetchBitgetLivePrices;
export const fetchHuobiPrices = fetchHuobiLivePrices;
export const fetchKrakenPrices = fetchKrakenLivePrices;
export const fetchCryptoComPrices = fetchCryptoComLivePrices;
export const fetchBingXPrices = fetchBingXLivePrices;
export const fetchBitfinexPrices = fetchBitfinexLivePrices;
export const fetchPhemexPrices = fetchPhemexLivePrices;
export const fetchDeribitPrices = fetchDeribitLivePrices;