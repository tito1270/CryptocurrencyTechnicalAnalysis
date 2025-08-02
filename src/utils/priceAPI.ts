import axios from 'axios';
import { PriceData } from '../types';

// Enhanced cache with better management for live streaming
const priceCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10000; // 10 seconds - much shorter cache for live data
const REQUEST_TIMEOUT = 3000; // 3 seconds - faster timeout for real-time
const MAX_RETRIES = 2; // Quick fallback with one retry

// Live API endpoint for Binance
const BINANCE_API = 'https://api.binance.com/api/v3';

// Enhanced request function with CORS handling
const makeExchangeRequest = async (url: string, retryCount = 0): Promise<any> => {
  try {
    console.log(`🔄 Binance API Request (attempt ${retryCount + 1}): ${url}`);
    
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
      console.log(`✅ Binance API Success: ${url}`);
      return response.data;
    }
    
    throw new Error(`Invalid response: ${response.status}`);
    
  } catch (error: any) {
    console.warn(`⚠️ Binance API failed (attempt ${retryCount + 1}): ${error.message}`);
    
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
    const url = `${BINANCE_API}/ticker/24hr`;
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

// Parse Binance ticker data
const parseBinanceData = (data: any[]): PriceData[] => {
  try {
    return data
      .filter(ticker => ticker.symbol && ticker.lastPrice && parseFloat(ticker.lastPrice) > 0)
      .map(ticker => {
        // Convert Binance symbol format to standard pair format
        const symbol = ticker.symbol;
        let pair = '';
        
        // Handle common quote currencies
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
          pair = symbol; // Fallback to original symbol
        }

        return {
          symbol: pair,
          price: parseFloat(ticker.lastPrice),
          change24h: parseFloat(ticker.priceChangePercent) || 0,
          volume24h: parseFloat(ticker.volume) || 0,
          high24h: parseFloat(ticker.highPrice) || 0,
          low24h: parseFloat(ticker.lowPrice) || 0,
          broker: 'binance',
          timestamp: Date.now(),
          source: 'LIVE_API' as const
        };
      })
      .filter(price => price.symbol.includes('/')) // Only keep properly formatted pairs
      .sort((a, b) => b.volume24h - a.volume24h); // Sort by volume descending
  } catch (error) {
    console.error('❌ Error parsing Binance data:', error);
    return [];
  }
};

// Main function to fetch all live prices (now only Binance)
export const fetchRealTimePrices = async (selectedBrokers?: string[]): Promise<PriceData[]> => {
  console.log('🚀 LIVE API: Fetching real-time prices from Binance...');
  
  try {
    const prices = await fetchBinanceLivePrices();
    console.log(`✅ BINANCE: ${prices.length} live prices`);
    return prices;
  } catch (error) {
    console.error(`❌ Binance failed:`, error);
    
    // Generate fallback prices for Binance
    console.log(`🔄 Generating fallback prices for Binance`);
    return generateFallbackForExchange('binance');
  }
};

// Enhanced pair-specific price fetching with live APIs
export const getPairPrice = async (broker: string, pair: string): Promise<PriceData | null> => {
  console.log(`🔍 Fetching live price for ${pair} from ${broker.toUpperCase()}...`);
  
  if (broker !== 'binance') {
    throw new Error(`Broker ${broker} is not supported. Only Binance is available.`);
  }

  try {
    // Convert pair format for Binance API (e.g., BTC/USDT -> BTCUSDT)
    const binanceSymbol = pair.replace('/', '').toUpperCase();
    
    console.log(`🟡 Fetching ${binanceSymbol} from Binance...`);
    const url = `${BINANCE_API}/ticker/24hr?symbol=${binanceSymbol}`;
    const data = await makeExchangeRequest(url);
    
    if (data && data.symbol) {
      const priceData: PriceData = {
        symbol: pair,
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent) || 0,
        volume24h: parseFloat(data.volume) || 0,
        high24h: parseFloat(data.highPrice) || 0,
        low24h: parseFloat(data.lowPrice) || 0,
        broker: 'binance',
        timestamp: Date.now(),
        source: 'LIVE_API'
      };
      
      console.log(`✅ ${broker.toUpperCase()} ${pair}: $${priceData.price} (${priceData.change24h > 0 ? '+' : ''}${priceData.change24h.toFixed(2)}%)`);
      return priceData;
    }
    
    throw new Error(`No data received for ${pair} from ${broker}`);
    
  } catch (error: any) {
    console.error(`❌ ${broker.toUpperCase()} API failed for ${pair}:`, error.message);
    
    // For Binance, try fallback price
    if (broker === 'binance') {
      const fallbackPrices = generateFallbackForExchange('binance');
      const fallbackPrice = fallbackPrices.find(p => p.symbol === pair);
      if (fallbackPrice) {
        console.log(`🔄 Using fallback price for ${pair}: $${fallbackPrice.price}`);
        return fallbackPrice;
      }
    }
    
    return null;
  }
};

// Fallback price generation for when APIs fail
const generateFallbackForExchange = (exchangeName: string): PriceData[] => {
  const basePrice = Math.random() * 50000 + 20000; // BTC base price range
  const fallbackPairs = [
    'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT',
    'SOL/USDT', 'DOGE/USDT', 'DOT/USDT', 'MATIC/USDT', 'AVAX/USDT'
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
      broker: exchangeName,
      timestamp: Date.now(),
      source: 'FALLBACK' as const
    };
  });
};

// Legacy export aliases for backward compatibility
export const fetchBinancePrices = fetchBinanceLivePrices;

// For components that need to check supported brokers
export const getSupportedBrokers = (): string[] => {
  return ['binance'];
};

// For getting broker display names
export const getBrokerDisplayName = (brokerId: string): string => {
  const brokerNames: { [key: string]: string } = {
    'binance': 'Binance'
  };
  return brokerNames[brokerId] || brokerId;
};

// Market statistics aggregation (now only from Binance)
export const getMarketStats = async (): Promise<{
  totalMarketCap: number;
  totalVolume24h: number;
  activePairs: number;
  topGainers: PriceData[];
  topLosers: PriceData[];
}> => {
  try {
    const prices = await fetchBinanceLivePrices();
    
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
    console.error('❌ Failed to get market stats:', error);
    return {
      totalMarketCap: 0,
      totalVolume24h: 0,
      activePairs: 0,
      topGainers: [],
      topLosers: []
    };
  }
};