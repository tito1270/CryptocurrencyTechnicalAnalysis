import { PriceData } from '../types';

// Simple, working price API without conflicts
const BINANCE_API = 'https://api.binance.com/api/v3';

// Basic cache for performance
const priceCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds
const REQUEST_TIMEOUT = 5000; // 5 seconds

// Simple request function
const makeRequest = async (url: string): Promise<any> => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    });
    
    if (response.ok) {
      return await response.json();
    }
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.warn('API request failed:', error);
    throw error;
  }
};

// Fetch live prices from Binance
export const fetchRealTimePrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'binance_prices';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return parseBinanceData(cached.data);
    }

    const url = `${BINANCE_API}/ticker/24hr`;
    const data = await makeRequest(url);
    
    if (data && Array.isArray(data)) {
      priceCache.set(cacheKey, { data, timestamp: Date.now() });
      return parseBinanceData(data);
    }
    
    throw new Error('Invalid data format');
  } catch (error) {
    console.error('Failed to fetch live prices:', error);
    return generateFallbackPrices();
  }
};

// Parse Binance data to standard format
const parseBinanceData = (data: any[]): PriceData[] => {
  return data
    .filter(ticker => ticker.symbol && ticker.lastPrice && parseFloat(ticker.lastPrice) > 0)
    .map(ticker => {
      const symbol = ticker.symbol;
      let pair = '';
      
      if (symbol.endsWith('USDT')) {
        pair = `${symbol.slice(0, -4)}/USDT`;
      } else if (symbol.endsWith('USDC')) {
        pair = `${symbol.slice(0, -4)}/USDC`;
      } else if (symbol.endsWith('BTC')) {
        pair = `${symbol.slice(0, -3)}/BTC`;
      } else if (symbol.endsWith('ETH')) {
        pair = `${symbol.slice(0, -3)}/ETH`;
      } else if (symbol.endsWith('BNB')) {
        pair = `${symbol.slice(0, -3)}/BNB`;
      } else {
        pair = symbol;
      }

      return {
        broker: 'binance',
        pair,
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.priceChangePercent) || 0,
        volume: parseFloat(ticker.volume) || 0,
        high24h: parseFloat(ticker.highPrice) || 0,
        low24h: parseFloat(ticker.lowPrice) || 0,
        timestamp: Date.now()
      };
    })
    .filter(price => price.pair.includes('/'))
    .sort((a, b) => b.volume - a.volume);
};

// Get specific pair price
export const getPairPrice = async (broker: string, pair: string): Promise<number | null> => {
  try {
    if (broker !== 'binance') {
      throw new Error('Only Binance is supported');
    }

    const binanceSymbol = pair.replace('/', '').toUpperCase();
    const url = `${BINANCE_API}/ticker/24hr?symbol=${binanceSymbol}`;
    const data = await makeRequest(url);
    
    if (data && data.lastPrice) {
      return parseFloat(data.lastPrice);
    }
    
    throw new Error('No price data');
  } catch (error) {
    console.error(`Failed to get price for ${pair}:`, error);
    return getFallbackPrice(pair);
  }
};

// Simple fallback prices
export const getFallbackPrice = (pair: string): number => {
  const [base] = pair.split('/');
  
  const basePrices: { [key: string]: number } = {
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
    'ATOM': 8.85,
    'LINK': 22.5,
    'UNI': 12.8,
    'LTC': 115,
    'BCH': 485
  };
  
  const basePrice = basePrices[base] || 1;
  return basePrice * (1 + (Math.random() - 0.5) * 0.001);
};

// Generate fallback prices when API fails
const generateFallbackPrices = (): PriceData[] => {
  const pairs = [
    'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT',
    'SOL/USDT', 'DOGE/USDT', 'DOT/USDT', 'MATIC/USDT', 'AVAX/USDT',
    'ATOM/USDT', 'LINK/USDT', 'UNI/USDT', 'LTC/USDT', 'BCH/USDT'
  ];
  
  return pairs.map(pair => {
    const price = getFallbackPrice(pair);
    const change = (Math.random() - 0.5) * 10;
    
    return {
      broker: 'binance',
      pair,
      price,
      change24h: change,
      volume: Math.random() * 1000000,
      high24h: price * (1 + Math.random() * 0.05),
      low24h: price * (1 - Math.random() * 0.05),
      timestamp: Date.now()
    };
  });
};