import { PriceData } from '../types';
import { brokers } from '../data/brokers';
import { fetchRealTimePrices, getPairPrice, getFallbackPrice } from './priceAPI';

// Simplified live price generation with better error handling
export const generateLivePrices = async (selectedPairs?: string[]): Promise<PriceData[]> => {
  console.log('🔄 PriceSimulator: Starting reliable price fetch...');

  try {
    // Try to fetch real prices with shorter timeout for better UX
    const timeoutPromise = new Promise<PriceData[]>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout after 5 seconds')), 5000)
    );

    const pricesPromise = fetchRealTimePrices();

    const realPrices = await Promise.race([pricesPromise, timeoutPromise]);

    if (realPrices && realPrices.length > 10) {
      console.log(`✅ PriceSimulator: Successfully got ${realPrices.length} real prices`);

      // Filter for specific pairs if requested
      if (selectedPairs && selectedPairs.length > 0) {
        const filtered = realPrices.filter(price =>
          selectedPairs.some(pair => price.pair === pair)
        );
        console.log(`📊 Filtered to ${filtered.length} prices for requested pairs`);
        return filtered.length > 0 ? filtered : realPrices.slice(0, 100);
      }

      return realPrices;
    } else {
      console.log('⚠️ API returned insufficient data, using reliable fallback');
      return generateLocalFallback(selectedPairs);
    }
  } catch (error) {
    console.log(`⚠️ PriceSimulator: API timeout/error (${error instanceof Error ? error.message : 'unknown'}), using fallback`);
    return generateLocalFallback(selectedPairs);
  }
};

// Local fallback that always works
const generateLocalFallback = (selectedPairs?: string[]): PriceData[] => {
  console.log('🔄 Generating local fallback prices...');
  
  const prices: PriceData[] = [];
  
  // Core price data that always works
  const corePrices: { [key: string]: number } = {
    'BTC': 98000,
    'ETH': 3500,
    'BNB': 700,
    'XRP': 2.50,
    'ADA': 1.00,
    'SOL': 239,
    'DOGE': 0.39,
    'MATIC': 0.50,
    'DOT': 8.00,
    'AVAX': 50,
    'SHIB': 0.000031,
    'LTC': 120,
    'ATOM': 8.00,
    'LINK': 27,
    'UNI': 15,
    'BCH': 640,
    'XLM': 0.44,
    'ALGO': 0.40,
    'VET': 0.05,
    'ICP': 14,
    'FIL': 6.00,
    'TRX': 0.26,
    'ETC': 37,
    'THETA': 2.50,
    'NEAR': 7.00,
    'FTM': 1.00,
    'HBAR': 0.30,
    'ONE': 0.026,
    'SAND': 0.70,
    'MANA': 0.60,
    'CRO': 0.18,
    'PEPE': 0.000024,
    'FLOKI': 0.00026,
    'BONK': 0.000005,
    'OP': 2.50,
    'ARB': 1.00,
    'AAVE': 360,
    'COMP': 90,
    'MKR': 1700,
    'SNX': 4.50,
    'CRV': 1.10,
    'SUSHI': 2.20,
    'YFI': 8400,
    'CAKE': 2.50,
    'AXS': 8.00,
    'SLP': 0.005,
    'ENJ': 0.39,
    'CHZ': 0.11,
    'GALA': 0.055,
    'USDT': 1.00,
    'USDC': 1.00,
    'DAI': 1.00
  };
  
  // Simplified broker spreads
  const brokerSpreads: { [key: string]: number } = {
    'binance': 0,
    'okx': 0.0005,
    'coinbase': -0.0010,
    'kraken': 0.0008,
    'kucoin': 0.0010,
    'huobi': 0.0005,
    'gate': -0.0005,
    'bitget': 0.0015,
    'mexc': -0.0005,
    'bybit': 0.0010,
    'crypto_com': -0.0008,
    'bingx': 0.0012,
    'bitfinex': -0.0012,
    'phemex': 0.0008,
    'deribit': 0.0006
  };
  
  // Generate prices for all available pairs
  if (selectedPairs && selectedPairs.length > 0) {
    // Generate for specific pairs
    brokers.forEach(broker => {
      const spread = brokerSpreads[broker.id] || 0;
      
      selectedPairs.forEach(pair => {
        if (broker.pairs.includes(pair)) {
          prices.push(generatePriceData(broker.id, pair, spread, corePrices));
        }
      });
    });
  } else {
    // Generate for popular pairs
    const popularPairs = [
      'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT', 'SOL/USDT',
      'DOGE/USDT', 'DOT/USDT', 'MATIC/USDT', 'AVAX/USDT', 'SHIB/USDT', 'LTC/USDT',
      'ATOM/USDT', 'LINK/USDT', 'UNI/USDT', 'BCH/USDT', 'NEAR/USDT', 'FTM/USDT',
      'PEPE/USDT', 'OP/USDT', 'ARB/USDT', 'AAVE/USDT', 'COMP/USDT', 'SUSHI/USDT'
    ];
    
    brokers.forEach(broker => {
      const spread = brokerSpreads[broker.id] || 0;
      
      popularPairs.forEach(pair => {
        if (broker.pairs.includes(pair)) {
          prices.push(generatePriceData(broker.id, pair, spread, corePrices));
        }
      });
    });
  }
  
  console.log(`📊 Local fallback generated ${prices.length} prices`);
  return prices;
};

// Generate individual price data
const generatePriceData = (
  broker: string, 
  pair: string, 
  spread: number, 
  corePrices: { [key: string]: number }
): PriceData => {
  const [base, quote] = pair.split('/');
  const basePrice = corePrices[base] || getFallbackPrice(pair);
  
  // Apply spread and small random variation
  const variation = (Math.random() - 0.5) * 0.0002; // ±0.01%
  const finalPrice = basePrice * (1 + spread + variation);
  
  // Generate realistic 24h change
  const volatility = base === 'BTC' || base === 'ETH' ? 4 : // Major: ±2%
                     ['USDT', 'USDC', 'DAI'].includes(base) ? 0.1 : // Stables: ±0.05%
                     base === 'PEPE' || base === 'FLOKI' || base === 'BONK' ? 12 : // Meme: ±6%
                     6; // Others: ±3%
  
  const change24h = (Math.random() - 0.5) * volatility;
  
  // Volume based on market cap
  const baseVolume = basePrice > 1000 ? 80000000 : // Major
                     basePrice > 10 ? 40000000 : // Mid-cap
                     basePrice > 0.1 ? 15000000 : // Small-cap
                     5000000; // Micro-cap
  
  const volume = baseVolume * (0.7 + Math.random() * 0.6);
  
  // High/Low calculations
  const dailyRange = Math.abs(change24h) / 100 * 0.7 + 0.01;
  const high24h = finalPrice * (1 + dailyRange + Math.random() * 0.005);
  const low24h = finalPrice * (1 - dailyRange - Math.random() * 0.005);
  
  return {
    broker,
    pair,
    price: finalPrice,
    change24h,
    volume,
    high24h,
    low24h,
    timestamp: Date.now()
  };
};

// Get real-time price for specific pair/broker
export const getRealTimePrice = async (broker: string, pair: string): Promise<number | null> => {
  try {
    console.log(`🔍 Getting price for ${pair} on ${broker}...`);
    
    // Try API first with short timeout
    const timeoutPromise = new Promise<number | null>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 3000)
    );
    
    const pricePromise = getPairPrice(broker, pair);
    
    try {
      const apiPrice = await Promise.race([pricePromise, timeoutPromise]);
      if (apiPrice && apiPrice > 0) {
        console.log(`✅ Got API price: ${pair} on ${broker} = $${apiPrice.toLocaleString()}`);
        return apiPrice;
      }
    } catch (timeoutError) {
      console.warn(`⚠️ API timeout for ${pair} on ${broker}, using fallback`);
    }
    
    // Fallback calculation
    const fallbackPrice = getFallbackPrice(pair);
    const brokerAdjustments: { [key: string]: number } = {
      'binance': 0,
      'okx': 0.0005,
      'coinbase': -0.0010,
      'kraken': 0.0008,
      'kucoin': 0.0010,
      'huobi': 0.0005,
      'gate': -0.0005,
      'bitget': 0.0015,
      'mexc': -0.0005,
      'bybit': 0.0010,
      'crypto_com': -0.0008,
      'bingx': 0.0012,
      'bitfinex': -0.0012,
      'phemex': 0.0008,
      'deribit': 0.0006
    };
    
    const adjustment = brokerAdjustments[broker] || 0;
    const adjustedPrice = fallbackPrice * (1 + adjustment);
    
    console.log(`📊 Fallback price: ${pair} on ${broker} = $${adjustedPrice.toLocaleString()}`);
    return adjustedPrice;
    
  } catch (error) {
    console.error(`❌ Error getting price for ${pair} on ${broker}:`, error);
    return null;
  }
};

// Search pairs function (unchanged)
export const searchPairs = (query: string, brokerId?: string): string[] => {
  const searchQuery = query.toUpperCase();
  let availablePairs: string[] = [];
  
  if (brokerId) {
    const broker = brokers.find(b => b.id === brokerId);
    availablePairs = broker?.pairs || [];
  } else {
    const allPairs = new Set<string>();
    brokers.forEach(broker => {
      broker.pairs.forEach(pair => allPairs.add(pair));
    });
    availablePairs = Array.from(allPairs);
  }
  
  return availablePairs
    .filter(pair => pair.includes(searchQuery))
    .sort()
    .slice(0, 50);
};
