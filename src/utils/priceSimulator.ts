import { PriceData } from '../types';
import { brokers } from '../data/brokers';
import { fetchRealTimePrices, getPairPrice, getFallbackPrice } from './priceAPI';

// Enhanced real-time price fetching with comprehensive API integration
export const generateLivePrices = async (selectedPairs?: string[]): Promise<PriceData[]> => {
  try {
    console.log('🔄 PriceSimulator: Fetching enhanced real-time prices...');
    
    // Fetch comprehensive real prices from enhanced API
    const realPrices = await fetchRealTimePrices();
    
    if (realPrices.length > 100) {
      console.log(`✅ PriceSimulator: Got ${realPrices.length} real prices from enhanced API`);
      
      // If specific pairs are requested, filter for them
      if (selectedPairs && selectedPairs.length > 0) {
        const filteredPrices = realPrices.filter(price => 
          selectedPairs.some(pair => price.pair === pair)
        );
        console.log(`📊 Filtered to ${filteredPrices.length} prices for ${selectedPairs.length} requested pairs`);
        return filteredPrices;
      }
      
      return realPrices;
    } else {
      console.warn('⚠️ Insufficient real data from API, using enhanced fallback');
      return generateEnhancedFallbackPrices(selectedPairs);
    }
  } catch (error) {
    console.error('❌ PriceSimulator: Error fetching live prices:', error);
    return generateEnhancedFallbackPrices(selectedPairs);
  }
};

// Enhanced fallback price generation with current market accuracy
const generateEnhancedFallbackPrices = (selectedPairs?: string[]): PriceData[] => {
  console.log('🔄 Generating enhanced fallback prices...');
  const prices: PriceData[] = [];
  
  // Updated realistic price mapping (December 2024)
  const currentPrices: { [key: string]: number } = {
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
    'APE': 1.50,
    'LRC': 0.25,
    'ENJ': 0.39,
    'CHZ': 0.11,
    'GALA': 0.055,
    'AXS': 8.00,
    'FLOW': 0.92,
    'XTZ': 1.30,
    'WAVES': 2.80,
    'KAVA': 0.55,
    
    // Popular newer tokens
    'PEPE': 0.000024,
    'FLOKI': 0.00026,
    'BONK': 0.000005,
    'WIF': 2.00,
    'OP': 2.50,
    'ARB': 1.00,
    'SUI': 4.50,
    'SEI': 0.50,
    'TIA': 8.00,
    'JTO': 3.00,
    'PYTH': 0.50,
    'JUP': 1.20,
    'BLUR': 0.40,
    'IMX': 2.00,
    'APT': 15,
    'GMT': 0.25,
    'STX': 2.00,
    'INJ': 30,
    'ROSE': 0.10,
    'JASMY': 0.05,
    'LUNC': 0.000014,
    'USTC': 0.00003,
    
    // DeFi tokens
    'AAVE': 360,
    'COMP': 90,
    'MKR': 1700,
    'SNX': 4.50,
    'CRV': 1.10,
    'UMA': 3.20,
    'BAL': 3.80,
    'SUSHI': 2.20,
    'YFI': 8400,
    'CAKE': 2.50,
    'ALPHA': 0.15,
    'DODO': 0.20,
    'RUNE': 6.50,
    'KLAY': 0.20,
    'BAKE': 0.50,
    'TWT': 1.20,
    'SFP': 0.90,
    'LINA': 0.02,
    
    // Gaming tokens
    'SLP': 0.005,
    'ALICE': 2.00,
    'TLM': 0.02,
    'SKILL': 0.50,
    'HERO': 1.00,
    'JEWEL': 3.00,
    'GHST': 1.50,
    'YGG': 0.80,
    'NAKA': 0.50,
    'PYR': 8.00,
    'SUPER': 2.00,
    'TVK': 1.00,
    'ATA': 0.25,
    'GTC': 1.50,
    
    // AI & Data
    'FET': 2.00,
    'AGIX': 0.80,
    'OCEAN': 0.90,
    'WLD': 3.00,
    'ARKM': 2.50,
    'RNDR': 9.00,
    'LPT': 20,
    'TAO': 600,
    'GRT': 0.30,
    
    // Layer 2
    'METIS': 60,
    'BOBA': 0.40,
    'DYDX': 2.00,
    'GMX': 40,
    'STRK': 0.90,
    'ZK': 0.30,
    'ZRO': 8.00,
    'MANTA': 1.50,
    
    // Ecosystem tokens
    'LEO': 9.00,
    'HT': 8.00,
    'OKB': 60,
    'KCS': 15,
    'GT': 15,
    'MX': 0.50,
    'NEXO': 2.00,
    
    // Stablecoins
    'USDT': 1.00,
    'USDC': 1.00,
    'BUSD': 1.00,
    'DAI': 1.00,
    'TUSD': 1.00,
    'USDP': 1.00,
    'FRAX': 1.00,
    'LUSD': 1.00,
    'FDUSD': 1.00,
    'PYUSD': 1.00
  };
  
  // Enhanced broker configurations with realistic spreads
  const brokerConfigs = [
    { id: 'binance', spread: 0.0000, volume_mult: 1.0, fee: 0.001 }, // Baseline
    { id: 'okx', spread: 0.0004, volume_mult: 0.85, fee: 0.001 },
    { id: 'coinbase', spread: -0.0010, volume_mult: 0.7, fee: 0.005 }, // Premium
    { id: 'kraken', spread: 0.0006, volume_mult: 0.6, fee: 0.0025 },
    { id: 'kucoin', spread: 0.0008, volume_mult: 0.55, fee: 0.001 },
    { id: 'huobi', spread: 0.0004, volume_mult: 0.5, fee: 0.002 },
    { id: 'gate', spread: -0.0006, volume_mult: 0.4, fee: 0.002 },
    { id: 'bitget', spread: 0.0012, volume_mult: 0.45, fee: 0.001 },
    { id: 'mexc', spread: -0.0004, volume_mult: 0.35, fee: 0.002 },
    { id: 'bybit', spread: 0.0008, volume_mult: 0.55, fee: 0.001 },
    { id: 'crypto_com', spread: -0.0008, volume_mult: 0.5, fee: 0.004 },
    { id: 'bingx', spread: 0.0010, volume_mult: 0.3, fee: 0.001 },
    { id: 'bitfinex', spread: -0.0012, volume_mult: 0.4, fee: 0.002 },
    { id: 'phemex', spread: 0.0008, volume_mult: 0.25, fee: 0.001 },
    { id: 'deribit', spread: 0.0006, volume_mult: 0.2, fee: 0.0005 }
  ];
  
  if (selectedPairs && selectedPairs.length > 0) {
    // Generate prices for specific pairs
    brokers.forEach(broker => {
      const brokerConfig = brokerConfigs.find(bc => bc.id === broker.id) || brokerConfigs[0];
      
      selectedPairs.forEach(pair => {
        if (broker.pairs.includes(pair)) {
          prices.push(generateEnhancedPriceData(broker.id, pair, brokerConfig, currentPrices));
        }
      });
    });
  } else {
    // Generate prices for popular pairs across all brokers
    const popularPairs = [
      'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT', 'SOL/USDT',
      'DOGE/USDT', 'DOT/USDT', 'MATIC/USDT', 'AVAX/USDT', 'SHIB/USDT', 'LTC/USDT',
      'ATOM/USDT', 'LINK/USDT', 'UNI/USDT', 'BCH/USDT', 'NEAR/USDT', 'FTM/USDT',
      'PEPE/USDT', 'WIF/USDT', 'OP/USDT', 'ARB/USDT', 'SUI/USDT', 'AAVE/USDT'
    ];
    
    brokers.forEach(broker => {
      const brokerConfig = brokerConfigs.find(bc => bc.id === broker.id) || brokerConfigs[0];
      
      popularPairs.forEach(pair => {
        if (broker.pairs.includes(pair)) {
          prices.push(generateEnhancedPriceData(broker.id, pair, brokerConfig, currentPrices));
        }
      });
    });
  }
  
  console.log(`📊 Enhanced fallback generated ${prices.length} realistic prices`);
  return prices;
};

// Generate enhanced fallback price data with realistic market conditions
const generateEnhancedPriceData = (
  broker: string, 
  pair: string, 
  brokerConfig: any, 
  currentPrices: { [key: string]: number }
): PriceData => {
  const [base, quote] = pair.split('/');
  const basePrice = currentPrices[base] || getFallbackPrice(pair);
  
  // Apply broker spread and micro-variations
  const microVariation = (Math.random() - 0.5) * 0.0002; // ±0.01%
  const finalSpread = brokerConfig.spread + microVariation;
  const exchangePrice = basePrice * (1 + finalSpread);
  
  // Realistic 24h change based on market conditions
  const volatility = base === 'BTC' || base === 'ETH' ? 4 : // Major coins: ±2%
                     ['USDT', 'USDC', 'DAI', 'BUSD'].includes(base) ? 0.1 : // Stables: ±0.05%
                     base === 'PEPE' || base === 'FLOKI' || base === 'BONK' ? 15 : // Meme coins: ±7.5%
                     8; // Other alts: ±4%
  
  const change24h = (Math.random() - 0.5) * volatility;
  
  // Volume calculation based on market cap and popularity
  const baseVolume = basePrice > 1000 ? 100000000 : // Major coins
                     basePrice > 10 ? 50000000 : // Mid-cap
                     basePrice > 0.1 ? 20000000 : // Small-cap
                     10000000; // Micro-cap
  
  const volume = baseVolume * brokerConfig.volume_mult * (0.7 + Math.random() * 0.6);
  
  // High/Low calculations with realistic spreads
  const dailyRange = Math.abs(change24h) / 100 * 0.8 + 0.01;
  const high24h = exchangePrice * (1 + dailyRange + Math.random() * 0.005);
  const low24h = exchangePrice * (1 - dailyRange - Math.random() * 0.005);
  
  return {
    broker,
    pair,
    price: exchangePrice,
    change24h,
    volume,
    high24h,
    low24h,
    timestamp: Date.now()
  };
};

// Get real-time price for a specific pair and broker
export const getRealTimePrice = async (broker: string, pair: string): Promise<number | null> => {
  try {
    console.log(`🔍 Getting real-time price for ${pair} on ${broker.toUpperCase()}...`);
    
    // Try to get from enhanced API first
    const apiPrice = await getPairPrice(broker, pair);
    if (apiPrice && apiPrice > 0) {
      console.log(`✅ Got API price: ${pair} on ${broker.toUpperCase()} = $${apiPrice.toLocaleString()}`);
      return apiPrice;
    }
    
    // Fallback to enhanced fallback calculation
    console.log(`🔄 Using enhanced fallback for ${pair} on ${broker.toUpperCase()}`);
    const fallbackPrice = getFallbackPrice(pair);
    
    // Apply broker-specific adjustments
    const brokerAdjustments: { [key: string]: number } = {
      'binance': 0,
      'okx': 0.0004,
      'coinbase': -0.0010,
      'kraken': 0.0006,
      'kucoin': 0.0008,
      'huobi': 0.0004,
      'gate': -0.0006,
      'bitget': 0.0012,
      'mexc': -0.0004,
      'bybit': 0.0008,
      'crypto_com': -0.0008,
      'bingx': 0.0010,
      'bitfinex': -0.0012,
      'phemex': 0.0008,
      'deribit': 0.0006
    };
    
    const adjustment = brokerAdjustments[broker] || 0;
    const adjustedPrice = fallbackPrice * (1 + adjustment);
    
    console.log(`📊 Enhanced fallback price: ${pair} on ${broker.toUpperCase()} = $${adjustedPrice.toLocaleString()}`);
    return adjustedPrice;
    
  } catch (error) {
    console.error(`❌ Error getting real-time price for ${pair} on ${broker}:`, error);
    return null;
  }
};

// Function to search pairs across all brokers (unchanged)
export const searchPairs = (query: string, brokerId?: string): string[] => {
  const searchQuery = query.toUpperCase();
  let availablePairs: string[] = [];
  
  if (brokerId) {
    const broker = brokers.find(b => b.id === brokerId);
    availablePairs = broker?.pairs || [];
  } else {
    // Search across all brokers
    const allPairs = new Set<string>();
    brokers.forEach(broker => {
      broker.pairs.forEach(pair => allPairs.add(pair));
    });
    availablePairs = Array.from(allPairs);
  }
  
  return availablePairs
    .filter(pair => pair.includes(searchQuery))
    .sort()
    .slice(0, 50); // Limit to 50 results for performance
};
