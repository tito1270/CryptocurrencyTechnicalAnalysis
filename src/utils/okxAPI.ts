import axios from 'axios';
import { PriceData } from '../types';

// OKX API configuration
const OKX_API_BASE = 'https://www.okx.com/api/v5';
const OKX_WS_URL = 'wss://ws.okx.com:8443/ws/v5/public';

// Enhanced cache with better management for live streaming
const okxPriceCache = new Map<string, { data: any; timestamp: number }>();
const OKX_CACHE_DURATION = 10000; // 10 seconds cache
const OKX_REQUEST_TIMEOUT = 3000; // 3 seconds timeout
const OKX_MAX_RETRIES = 2; // Quick fallback with one retry

// Enhanced request function with error handling
const makeOKXRequest = async (url: string, retryCount = 0): Promise<any> => {
  try {
    console.log(`🔄 OKX API Request (attempt ${retryCount + 1}): ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OKX_REQUEST_TIMEOUT);
    
    const response = await axios.get(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CryptoAnalyzer/1.0',
      },
      timeout: OKX_REQUEST_TIMEOUT,
      validateStatus: (status) => status >= 200 && status < 300
    });
    
    clearTimeout(timeoutId);
    
    if (response.data && response.status === 200) {
      console.log(`✅ OKX API Success: ${url}`);
      return response.data;
    }
    
    throw new Error(`Invalid response: ${response.status}`);
    
  } catch (error: any) {
    console.warn(`⚠️ OKX API failed (attempt ${retryCount + 1}): ${error.message}`);
    
    if (retryCount < OKX_MAX_RETRIES && !error.message.includes('aborted')) {
      const delay = 1000 * (retryCount + 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      return makeOKXRequest(url, retryCount + 1);
    }
    
    throw error;
  }
};

// OKX live prices from tickers endpoint
export const fetchOKXLivePrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'okx_live_tickers';
    const cached = okxPriceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < OKX_CACHE_DURATION) {
      return parseOKXTickerData(cached.data);
    }

    console.log('🟡 Fetching live data from OKX...');
    const url = `${OKX_API_BASE}/market/tickers?instType=SPOT`;
    const response = await makeOKXRequest(url);
    
    if (response && response.code === '0' && Array.isArray(response.data)) {
      okxPriceCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
      const parsed = parseOKXTickerData(response.data);
      console.log(`✅ OKX LIVE: ${parsed.length} prices`);
      return parsed;
    }
    
    throw new Error('Invalid OKX data format');
    
  } catch (error: any) {
    console.error(`❌ OKX API failed: ${error.message}`);
    return [];
  }
};

// Parse OKX ticker data to our standard format
const parseOKXTickerData = (data: any[]): PriceData[] => {
  try {
    return data
      .filter(ticker => 
        ticker.instId && 
        ticker.last && 
        parseFloat(ticker.last) > 0 &&
        ticker.instId.includes('-') // Only spot pairs with dash separator
      )
      .map(ticker => {
        // Convert OKX instId format (BTC-USDT) to our standard format (BTC/USDT)
        const symbol = ticker.instId.replace('-', '/');
        
        return {
          symbol: symbol,
          price: parseFloat(ticker.last),
          change24h: parseFloat(ticker.sodUtc8) || 0, // 24h change in %
          volume24h: parseFloat(ticker.vol24h) || 0,
          high24h: parseFloat(ticker.high24h) || 0,
          low24h: parseFloat(ticker.low24h) || 0,
          broker: 'okx',
          timestamp: parseInt(ticker.ts) || Date.now(),
          source: 'LIVE_API' as const
        };
      })
      .filter(price => price.symbol.includes('/')) // Only keep properly formatted pairs
      .sort((a, b) => b.volume24h - a.volume24h); // Sort by volume descending
  } catch (error) {
    console.error('❌ Error parsing OKX data:', error);
    return [];
  }
};

// Get specific pair price from OKX
export const getOKXPairPrice = async (pair: string): Promise<PriceData | null> => {
  console.log(`🔍 Fetching live price for ${pair} from OKX...`);
  
  try {
    // Convert pair format for OKX API (e.g., BTC/USDT -> BTC-USDT)
    const okxInstId = pair.replace('/', '-').toUpperCase();
    
    console.log(`🟡 Fetching ${okxInstId} from OKX...`);
    const url = `${OKX_API_BASE}/market/ticker?instId=${okxInstId}`;
    const response = await makeOKXRequest(url);
    
    if (response && response.code === '0' && response.data && response.data.length > 0) {
      const ticker = response.data[0];
      
      const priceData: PriceData = {
        symbol: pair,
        price: parseFloat(ticker.last),
        change24h: parseFloat(ticker.sodUtc8) || 0,
        volume24h: parseFloat(ticker.vol24h) || 0,
        high24h: parseFloat(ticker.high24h) || 0,
        low24h: parseFloat(ticker.low24h) || 0,
        broker: 'okx',
        timestamp: parseInt(ticker.ts) || Date.now(),
        source: 'LIVE_API'
      };
      
      console.log(`✅ OKX ${pair}: $${priceData.price} (${priceData.change24h > 0 ? '+' : ''}${priceData.change24h.toFixed(2)}%)`);
      return priceData;
    }
    
    throw new Error(`No data received for ${pair} from OKX`);
    
  } catch (error: any) {
    console.error(`❌ OKX API failed for ${pair}:`, error.message);
    return null;
  }
};

// Get OKX market statistics
export const getOKXMarketStats = async (): Promise<{
  totalMarketCap: number;
  totalVolume24h: number;
  activePairs: number;
  topGainers: PriceData[];
  topLosers: PriceData[];
}> => {
  try {
    const prices = await fetchOKXLivePrices();
    
    const totalVolume24h = prices.reduce((sum, price) => sum + price.volume24h, 0);
    const activePairs = prices.length;
    
    const sortedByChange = [...prices].sort((a, b) => b.change24h - a.change24h);
    const topGainers = sortedByChange.slice(0, 10);
    const topLosers = sortedByChange.slice(-10).reverse();
    
    return {
      totalMarketCap: 0, // Not available from single exchange
      totalVolume24h,
      activePairs,
      topGainers,
      topLosers
    };
  } catch (error) {
    console.error('❌ Failed to get OKX market stats:', error);
    return {
      totalMarketCap: 0,
      totalVolume24h: 0,
      activePairs: 0,
      topGainers: [],
      topLosers: []
    };
  }
};

// Fallback price generation for OKX when API fails
export const generateOKXFallbackPrices = (): PriceData[] => {
  const basePrice = Math.random() * 50000 + 20000; // BTC base price range
  const fallbackPairs = [
    'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'ADA/USDT',
    'AVAX/USDT', 'DOT/USDT', 'MATIC/USDT', 'LINK/USDT', 'LTC/USDT'
  ];
  
  return fallbackPairs.map((pair, index) => {
    const multiplier = pair.startsWith('BTC') ? 1 : Math.random() * 0.1 + 0.001;
    const price = basePrice * multiplier;
    const change = (Math.random() - 0.5) * 20; // -10% to +10%
    
    return {
      symbol: pair,
      price: parseFloat(price.toFixed(6)),
      change24h: parseFloat(change.toFixed(2)),
      volume24h: Math.random() * 1000000,
      high24h: price * (1 + Math.random() * 0.1),
      low24h: price * (1 - Math.random() * 0.1),
      broker: 'okx',
      timestamp: Date.now(),
      source: 'FALLBACK' as const
    };
  });
};

// Get fallback price for a specific pair
export const getOKXFallbackPrice = (pair: string): PriceData | null => {
  const fallbackPrices = generateOKXFallbackPrices();
  return fallbackPrices.find(p => p.symbol === pair) || null;
};

// Export OKX WebSocket URL for external use
export const OKX_WEBSOCKET_URL = OKX_WS_URL;