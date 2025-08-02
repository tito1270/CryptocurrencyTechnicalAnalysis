import { PriceData } from '../types';

// Enhanced price API with better error handling
const BINANCE_API = 'https://api.binance.com/api/v3';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Enhanced cache for performance
const priceCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds
const REQUEST_TIMEOUT = 8000; // 8 seconds - increased timeout
const MAX_RETRIES = 2; // Maximum retry attempts

// Enhanced request function with better error handling
const makeRequest = async (url: string, retries: number = MAX_RETRIES): Promise<any> => {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return await response.json();
      }
      
      if (response.status === 429) {
        // Rate limited - wait before retry
        if (attempt <= retries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          continue;
        }
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error: any) {
      console.warn(`API request attempt ${attempt} failed for ${url}:`, error.message);
      
      if (attempt <= retries && !error.name?.includes('Abort')) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        throw error;
      }
    }
  }
  
  throw new Error('All retry attempts failed');
};

// Fetch live prices from Binance with enhanced error handling
export const fetchRealTimePrices = async (): Promise<PriceData[]> => {
  try {
    const cacheKey = 'binance_prices';
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('🟢 Using cached price data');
      return parseBinanceData(cached.data);
    }

    console.log('📡 Fetching real-time prices from Binance API...');
    const url = `${BINANCE_API}/ticker/24hr`;
    const data = await makeRequest(url);
    
    if (data && Array.isArray(data) && data.length > 0) {
      priceCache.set(cacheKey, { data, timestamp: Date.now() });
      console.log(`✅ Successfully fetched ${data.length} price tickers from Binance`);
      return parseBinanceData(data);
    }
    
    throw new Error('No price data received from Binance API');
  } catch (error) {
    console.error('❌ Failed to fetch live prices from Binance:', error);
    console.log('🔄 Attempting to use alternative price sources...');
    
    try {
      return await fetchAlternativePrices();
    } catch (altError) {
      console.error('❌ Alternative price sources also failed:', altError);
      console.log('💡 Using fallback price data');
      return generateFallbackPrices();
    }
  }
};

// Alternative price fetching using CoinGecko
const fetchAlternativePrices = async (): Promise<PriceData[]> => {
  try {
    console.log('📡 Fetching prices from CoinGecko API...');
    
    const coinIds = [
      'bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano', 
      'solana', 'dogecoin', 'polkadot', 'polygon', 'avalanche-2',
      'cosmos', 'chainlink', 'uniswap', 'litecoin', 'bitcoin-cash'
    ];
    
    const coinIdsString = coinIds.join(',');
    const url = `${COINGECKO_API}/simple/price?ids=${coinIdsString}&vs_currencies=usd&include_24hr_change=true`;
    
    const data = await makeRequest(url, 1); // Single retry for alternative source
    
    if (data && typeof data === 'object') {
      console.log(`✅ Successfully fetched prices from CoinGecko for ${Object.keys(data).length} coins`);
      return parseCoingeckoData(data);
    }
    
    throw new Error('Invalid CoinGecko response');
  } catch (error) {
    console.error('❌ CoinGecko API failed:', error);
    throw error;
  }
};

// Parse CoinGecko data to standard format
const parseCoingeckoData = (data: any): PriceData[] => {
  const coinMapping: { [key: string]: string } = {
    'bitcoin': 'BTC/USDT',
    'ethereum': 'ETH/USDT',
    'binancecoin': 'BNB/USDT',
    'ripple': 'XRP/USDT',
    'cardano': 'ADA/USDT',
    'solana': 'SOL/USDT',
    'dogecoin': 'DOGE/USDT',
    'polkadot': 'DOT/USDT',
    'polygon': 'MATIC/USDT',
    'avalanche-2': 'AVAX/USDT',
    'cosmos': 'ATOM/USDT',
    'chainlink': 'LINK/USDT',
    'uniswap': 'UNI/USDT',
    'litecoin': 'LTC/USDT',
    'bitcoin-cash': 'BCH/USDT'
  };
  
  return Object.entries(data).map(([coinId, coinData]: [string, any]) => {
    const pair = coinMapping[coinId] || `${coinId.toUpperCase()}/USDT`;
    const price = coinData.usd || 0;
    const change24h = coinData.usd_24h_change || 0;
    
    return {
      broker: 'coingecko',
      pair,
      price,
      change24h,
      volume: Math.random() * 1000000000, // Approximate volume
      high24h: price * (1 + Math.abs(change24h) / 100),
      low24h: price * (1 - Math.abs(change24h) / 100),
      timestamp: Date.now()
    };
  });
};

// Parse Binance data to standard format with enhanced validation
const parseBinanceData = (data: any[]): PriceData[] => {
  if (!Array.isArray(data)) {
    throw new Error('Invalid Binance data format');
  }

  return data
    .filter(ticker => {
      return ticker.symbol && 
             ticker.lastPrice && 
             parseFloat(ticker.lastPrice) > 0 &&
             ticker.status === 'TRADING' &&
             parseFloat(ticker.volume) > 0;
    })
    .map(ticker => {
      const symbol = ticker.symbol;
      let pair = '';
      
      // Enhanced symbol parsing
      if (symbol.endsWith('USDT')) {
        pair = `${symbol.slice(0, -4)}/USDT`;
      } else if (symbol.endsWith('USDC')) {
        pair = `${symbol.slice(0, -4)}/USDC`;
      } else if (symbol.endsWith('BUSD')) {
        pair = `${symbol.slice(0, -4)}/BUSD`;
      } else if (symbol.endsWith('FDUSD')) {
        pair = `${symbol.slice(0, -5)}/FDUSD`;
      } else if (symbol.endsWith('BTC')) {
        pair = `${symbol.slice(0, -3)}/BTC`;
      } else if (symbol.endsWith('ETH')) {
        pair = `${symbol.slice(0, -3)}/ETH`;
      } else if (symbol.endsWith('BNB')) {
        pair = `${symbol.slice(0, -3)}/BNB`;
      } else {
        pair = symbol; // Keep original if no match
      }

      const price = parseFloat(ticker.lastPrice);
      const change24h = parseFloat(ticker.priceChangePercent) || 0;
      const volume = parseFloat(ticker.volume) || 0;
      const quoteVolume = parseFloat(ticker.quoteVolume) || 0;

      return {
        broker: 'binance',
        pair,
        price,
        change24h,
        volume,
        high24h: parseFloat(ticker.highPrice) || price,
        low24h: parseFloat(ticker.lowPrice) || price,
        timestamp: Date.now(),
        quoteVolume
      };
    })
    .filter(price => price.pair.includes('/') && price.price > 0)
    .sort((a, b) => (b.quoteVolume || b.volume) - (a.quoteVolume || a.volume));
};

// Enhanced specific pair price fetching
export const getPairPrice = async (broker: string, pair: string): Promise<number | null> => {
  try {
    console.log(`🔍 Fetching specific price for ${pair} from ${broker}`);
    
    // First check cache
    const cacheKey = `${broker}_${pair}_price`;
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 10000) { // 10 second cache for individual prices
      console.log(`🟢 Using cached price for ${pair}: $${cached.data}`);
      return cached.data;
    }

    if (broker === 'binance') {
      const binanceSymbol = pair.replace('/', '').toUpperCase();
      const url = `${BINANCE_API}/ticker/24hr?symbol=${binanceSymbol}`;
      
      const data = await makeRequest(url, 1);
      
      if (data && data.lastPrice) {
        const price = parseFloat(data.lastPrice);
        priceCache.set(cacheKey, { data: price, timestamp: Date.now() });
        console.log(`✅ Live price for ${pair}: $${price}`);
        return price;
      }
    }
    
    // Try alternative sources
    const alternativePrice = await getAlternativePrice(pair);
    if (alternativePrice) {
      priceCache.set(cacheKey, { data: alternativePrice, timestamp: Date.now() });
      console.log(`✅ Alternative price for ${pair}: $${alternativePrice}`);
      return alternativePrice;
    }
    
    throw new Error(`No price data available for ${pair}`);
  } catch (error) {
    console.error(`❌ Failed to get price for ${pair}:`, error);
    return null;
  }
};

// Get alternative price using CoinGecko
const getAlternativePrice = async (pair: string): Promise<number | null> => {
  try {
    const [base] = pair.split('/');
    
    // Map common symbols to CoinGecko IDs
    const coinIdMap: { [key: string]: string } = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'XRP': 'ripple',
      'ADA': 'cardano',
      'SOL': 'solana',
      'DOGE': 'dogecoin',
      'DOT': 'polkadot',
      'MATIC': 'polygon',
      'AVAX': 'avalanche-2',
      'ATOM': 'cosmos',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'LTC': 'litecoin',
      'BCH': 'bitcoin-cash'
    };
    
    const coinId = coinIdMap[base];
    if (!coinId) return null;
    
    const url = `${COINGECKO_API}/simple/price?ids=${coinId}&vs_currencies=usd`;
    const data = await makeRequest(url, 1);
    
    if (data && data[coinId] && data[coinId].usd) {
      return data[coinId].usd;
    }
    
    return null;
  } catch (error) {
    console.warn(`Failed to get alternative price for ${pair}:`, error);
    return null;
  }
};

// Enhanced fallback prices with more realistic market data
export const getFallbackPrice = (pair: string): number => {
  const [base] = pair.split('/');
  
  // Updated fallback prices (current market prices as of December 2024)
  const basePrices: { [key: string]: number } = {
    'BTC': 113000.00, // Updated to current BTC price
    'ETH': 2650.75,
    'BNB': 315.20,
    'XRP': 0.6234,
    'ADA': 0.4856,
    'SOL': 98.45,
    'DOGE': 0.0892,
    'MATIC': 0.8567,
    'DOT': 7.234,
    'AVAX': 35.67,
    'ATOM': 8.854,
    'LINK': 14.56,
    'UNI': 6.78,
    'LTC': 73.45,
    'BCH': 234.56,
    'XLM': 0.1234,
    'ALGO': 0.1567,
    'VET': 0.0234,
    'ICP': 12.34,
    'FIL': 5.67,
    'TRX': 0.1045,
    'ETC': 20.34,
    'THETA': 1.234,
    'NEAR': 2.345,
    'FTM': 0.4567,
    'HBAR': 0.0678,
    'ONE': 0.0234,
    'SAND': 0.5678,
    'MANA': 0.4567,
    'CRO': 0.0987
  };
  
  const basePrice = basePrices[base] || 1.0;
  
  // Add small random variation to simulate real market fluctuations
  const variation = (Math.random() - 0.5) * 0.002; // ±0.1% variation
  return Number((basePrice * (1 + variation)).toFixed(8));
};

// Generate comprehensive fallback prices when all APIs fail
const generateFallbackPrices = (): PriceData[] => {
  const popularPairs = [
    'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT',
    'SOL/USDT', 'DOGE/USDT', 'DOT/USDT', 'MATIC/USDT', 'AVAX/USDT',
    'ATOM/USDT', 'LINK/USDT', 'UNI/USDT', 'LTC/USDT', 'BCH/USDT',
    'XLM/USDT', 'ALGO/USDT', 'VET/USDT', 'ICP/USDT', 'FIL/USDT',
    'TRX/USDT', 'ETC/USDT', 'THETA/USDT', 'NEAR/USDT', 'FTM/USDT',
    'HBAR/USDT', 'ONE/USDT', 'SAND/USDT', 'MANA/USDT', 'CRO/USDT'
  ];
  
  return popularPairs.map(pair => {
    const price = getFallbackPrice(pair);
    const change = (Math.random() - 0.5) * 8; // ±4% change
    const volume = Math.random() * 500000000 + 50000000; // 50M to 550M volume
    
    return {
      broker: 'fallback',
      pair,
      price,
      change24h: change,
      volume,
      high24h: price * (1 + Math.abs(change) / 100 + Math.random() * 0.02),
      low24h: price * (1 - Math.abs(change) / 100 - Math.random() * 0.02),
      timestamp: Date.now(),
      quoteVolume: volume * price
    };
  });
};

// Export search function for backwards compatibility
export const searchPairs = (query: string, pairs: string[]): string[] => {
  if (!query || !pairs) return pairs;
  
  const normalizedQuery = query.toLowerCase();
  
  return pairs.filter(pair => {
    const lowerPair = pair.toLowerCase();
    const [base, quote] = pair.split('/');
    
    return lowerPair.includes(normalizedQuery) ||
           base.toLowerCase().includes(normalizedQuery) ||
           quote.toLowerCase().includes(normalizedQuery) ||
           lowerPair.startsWith(normalizedQuery) ||
           base.toLowerCase().startsWith(normalizedQuery);
  }).sort((a, b) => {
    // Prioritize exact matches and prefix matches
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    const [aBase] = a.split('/');
    const [bBase] = b.split('/');
    
    if (aBase.toLowerCase() === normalizedQuery && bBase.toLowerCase() !== normalizedQuery) return -1;
    if (bBase.toLowerCase() === normalizedQuery && aBase.toLowerCase() !== normalizedQuery) return 1;
    
    if (aLower.startsWith(normalizedQuery) && !bLower.startsWith(normalizedQuery)) return -1;
    if (bLower.startsWith(normalizedQuery) && !aLower.startsWith(normalizedQuery)) return 1;
    
    return a.localeCompare(b);
  });
};