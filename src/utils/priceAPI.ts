import axios from 'axios';
import { PriceData } from '../types';

// API endpoints for different exchanges
const API_ENDPOINTS = {
  binance: 'https://api.binance.com/api/v3/ticker/24hr',
  okx: 'https://www.okx.com/api/v5/market/tickers?instType=SPOT',
  coinbase: 'https://api.exchange.coinbase.com/products',
  kraken: 'https://api.kraken.com/0/public/Ticker',
  kucoin: '/kucoin-api/api/v1/market/allTickers',
  huobi: 'https://api.huobi.pro/market/tickers',
  gate: 'https://api.gateio.ws/api/v4/spot/tickers',
  bitget: 'https://api.bitget.com/api/spot/v1/market/tickers',
  mexc: 'https://api.mexc.com/api/v3/ticker/24hr',
  bybit: 'https://api.bybit.com/v5/market/tickers?category=spot',
  crypto_com: 'https://api.crypto.com/v2/public/get-ticker',
  bitfinex: 'https://api-pub.bitfinex.com/v2/tickers?symbols=ALL'
};

// Cache for API responses to avoid too many requests
const priceCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

// Helper function to normalize pair format for different exchanges
const normalizePairForExchange = (pair: string, exchange: string): string => {
  const [base, quote] = pair.split('/');
  
  switch (exchange) {
    case 'binance':
    case 'mexc':
      return `${base}${quote}`;
    case 'okx':
      return `${base}-${quote}`;
    case 'coinbase':
      return `${base}-${quote}`;
    case 'kraken':
      // Kraken uses special naming for some pairs
      const krakenMap: { [key: string]: string } = {
        'BTC': 'XBT',
        'DOGE': 'XDG'
      };
      const krakenBase = krakenMap[base] || base;
      const krakenQuote = krakenMap[quote] || quote;
      return `${krakenBase}${krakenQuote}`;
    case 'kucoin':
      return `${base}-${quote}`;
    case 'huobi':
      return `${base.toLowerCase()}${quote.toLowerCase()}`;
    case 'gate':
      return `${base}_${quote}`;
    case 'bitget':
      return `${base}${quote}`;
    case 'bybit':
      return `${base}${quote}`;
    case 'crypto_com':
      return `${base}_${quote}`;
    case 'bitfinex':
      return `t${base}${quote}`;
    default:
      return `${base}${quote}`;
  }
};

// Fetch real-time prices from Binance (most reliable and comprehensive)
export const fetchBinancePrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'binance_prices';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return parseBinanceData(cached.data);
    }

    const response = await axios.get(API_ENDPOINTS.binance, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      }
    });

    priceCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    return parseBinanceData(response.data);
  } catch (error) {
    console.error('Error fetching Binance prices:', error);
    return [];
  }
};

// Parse Binance API response
const parseBinanceData = (data: any[]): PriceData[] => {
  return data.map(ticker => {
    const symbol = ticker.symbol;
    // Convert BTCUSDT to BTC/USDT format
    let pair = '';
    
    // Common quote currencies in order of preference
    const quoteCurrencies = ['USDT', 'BUSD', 'USDC', 'BTC', 'ETH', 'BNB', 'USD'];
    
    for (const quote of quoteCurrencies) {
      if (symbol.endsWith(quote)) {
        const base = symbol.slice(0, -quote.length);
        pair = `${base}/${quote}`;
        break;
      }
    }
    
    if (!pair) {
      // Fallback for unknown pairs
      pair = symbol;
    }

    return {
      broker: 'binance',
      pair,
      price: parseFloat(ticker.lastPrice),
      change24h: parseFloat(ticker.priceChangePercent),
      volume: parseFloat(ticker.volume),
      high24h: parseFloat(ticker.highPrice),
      low24h: parseFloat(ticker.lowPrice),
      timestamp: Date.now()
    };
  }).filter(item => item.pair.includes('/') && item.price > 0);
};

// Fetch prices from OKX
export const fetchOKXPrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'okx_prices';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return parseOKXData(cached.data);
    }

    const response = await axios.get(API_ENDPOINTS.okx, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      }
    });

    if (response.data.code === '0') {
      priceCache.set(cacheKey, { data: response.data.data, timestamp: Date.now() });
      return parseOKXData(response.data.data);
    }
    return [];
  } catch (error) {
    console.error('Error fetching OKX prices:', error);
    return [];
  }
};

// Parse OKX API response
const parseOKXData = (data: any[]): PriceData[] => {
  return data.map(ticker => ({
    broker: 'okx',
    pair: ticker.instId.replace('-', '/'),
    price: parseFloat(ticker.last),
    change24h: parseFloat(ticker.changePercent) * 100,
    volume: parseFloat(ticker.vol24h),
    high24h: parseFloat(ticker.high24h),
    low24h: parseFloat(ticker.low24h),
    timestamp: Date.now()
  })).filter(item => item.price > 0);
};

// Fetch prices from Coinbase
export const fetchCoinbasePrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'coinbase_prices';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return parseCoinbaseData(cached.data);
    }

    const response = await axios.get(`${API_ENDPOINTS.coinbase}/stats`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      }
    });

    priceCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
    return parseCoinbaseData(response.data);
  } catch (error) {
    console.error('Error fetching Coinbase prices:', error);
    return [];
  }
};

// Parse Coinbase API response
const parseCoinbaseData = (data: any): PriceData[] => {
  return Object.entries(data).map(([productId, stats]: [string, any]) => ({
    broker: 'coinbase',
    pair: productId.replace('-', '/'),
    price: parseFloat(stats.last),
    change24h: parseFloat(stats.change_percent_24h),
    volume: parseFloat(stats.volume),
    high24h: parseFloat(stats.high),
    low24h: parseFloat(stats.low),
    timestamp: Date.now()
  })).filter(item => item.price > 0);
};

// Fetch prices from KuCoin
export const fetchKuCoinPrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'kucoin_prices';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return parseKuCoinData(cached.data);
    }

    const response = await axios.get(API_ENDPOINTS.kucoin, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      }
    });

    if (response.data.code === '200000') {
      priceCache.set(cacheKey, { data: response.data.data.ticker, timestamp: Date.now() });
      return parseKuCoinData(response.data.data.ticker);
    }
    return [];
  } catch (error) {
    console.error('Error fetching KuCoin prices:', error);
    return [];
  }
};

// Parse KuCoin API response
const parseKuCoinData = (data: any[]): PriceData[] => {
  return data.map(ticker => ({
    broker: 'kucoin',
    pair: ticker.symbol.replace('-', '/'),
    price: parseFloat(ticker.last),
    change24h: parseFloat(ticker.changeRate) * 100,
    volume: parseFloat(ticker.vol),
    high24h: parseFloat(ticker.high),
    low24h: parseFloat(ticker.low),
    timestamp: Date.now()
  })).filter(item => item.price > 0);
};

// Main function to fetch prices from multiple exchanges
export const fetchRealTimePrices = async (selectedBrokers?: string[]): Promise<PriceData[]> => {
  const allPrices: PriceData[] = [];
  
  try {
    // Fetch from multiple exchanges in parallel
    const promises: Promise<PriceData[]>[] = [];
    
    if (!selectedBrokers || selectedBrokers.includes('binance')) {
      promises.push(fetchBinancePrices());
    }
    
    if (!selectedBrokers || selectedBrokers.includes('okx')) {
      promises.push(fetchOKXPrices());
    }
    
    if (!selectedBrokers || selectedBrokers.includes('coinbase')) {
      promises.push(fetchCoinbasePrices());
    }
    
    if (!selectedBrokers || selectedBrokers.includes('kucoin')) {
      promises.push(fetchKuCoinPrices());
    }

    const results = await Promise.allSettled(promises);
    
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allPrices.push(...result.value);
      }
    });

    return allPrices;
  } catch (error) {
    console.error('Error fetching real-time prices:', error);
    return [];
  }
};

// Get specific pair price from a broker
export const getPairPrice = async (broker: string, pair: string): Promise<number | null> => {
  try {
    const prices = await fetchRealTimePrices([broker]);
    const pairData = prices.find(p => p.broker === broker && p.pair === pair);
    return pairData ? pairData.price : null;
  } catch (error) {
    console.error(`Error fetching price for ${pair} from ${broker}:`, error);
    return null;
  }
};

// Fallback function for when APIs are unavailable
export const getFallbackPrice = (pair: string): number => {
  const [base] = pair.split('/');
  
  // Fallback prices based on approximate market values (January 2024)
  const fallbackPrices: { [key: string]: number } = {
    'BTC': 43250.00,
    'ETH': 2680.50,
    'BNB': 315.80,
    'XRP': 0.5234,
    'ADA': 0.4821,
    'SOL': 98.45,
    'DOGE': 0.08456,
    'DOT': 7.234,
    'MATIC': 0.8934,
    'SHIB': 0.00000952,
    'AVAX': 38.67,
    'ATOM': 9.823,
    'LINK': 14.256,
    'UNI': 6.789,
    'LTC': 72.45,
    'BCH': 245.67,
    'XLM': 0.1234,
    'ALGO': 0.1876,
    'VET': 0.02345,
    'ICP': 12.456,
    'FIL': 5.678,
    'TRX': 0.1045,
    'ETC': 20.34,
    'THETA': 1.234,
    'NEAR': 2.345,
    'FTM': 0.4567,
    'HBAR': 0.0678,
    'EGLD': 45.67,
    'ONE': 0.01234,
    'SAND': 0.4321,
    'MANA': 0.3456
  };

  return fallbackPrices[base] || Math.random() * 10;
};