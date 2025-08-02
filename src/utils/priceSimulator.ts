import { PriceData } from '../types';
import { fetchRealTimePrices, getPairPrice, getFallbackPrice } from './priceAPI';

// Simple live price generation
export const generateLivePrices = async (selectedPairs?: string[]): Promise<PriceData[]> => {
  try {
    console.log('🚀 Fetching live prices...');
    
    const prices = await fetchRealTimePrices();
    
    if (prices.length > 0) {
      console.log(`✅ Got ${prices.length} live prices`);
      
      if (selectedPairs && selectedPairs.length > 0) {
        const filtered = prices.filter(price =>
          selectedPairs.some(pair => price.pair === pair)
        );
        return filtered.length > 0 ? filtered : prices;
      }
      
      return prices;
    }
    
    throw new Error('No prices received');
  } catch (error) {
    console.error('Live prices failed:', error);
    return generateFallbackPrices();
  }
};

// Get real-time price for specific pair
export const getRealTimePrice = async (broker: string, pair: string): Promise<number | null> => {
  try {
    const price = await getPairPrice(broker, pair);
    if (price && price > 0) {
      return price;
    }
    return getFallbackPrice(pair);
  } catch (error) {
    console.error(`Error getting price for ${pair}:`, error);
    return getFallbackPrice(pair);
  }
};

// Simple fallback price generation
const generateFallbackPrices = (): PriceData[] => {
  const pairs = [
    'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT',
    'SOL/USDT', 'DOGE/USDT', 'DOT/USDT', 'MATIC/USDT', 'AVAX/USDT'
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
      high24h: price * 1.05,
      low24h: price * 0.95,
      timestamp: Date.now()
    };
  });
};

// Search pairs function
export const searchPairs = (query: string, brokerId?: string): string[] => {
  const searchQuery = query.toUpperCase();
  const commonPairs = [
    'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT',
    'SOL/USDT', 'DOGE/USDT', 'DOT/USDT', 'MATIC/USDT', 'AVAX/USDT',
    'ATOM/USDT', 'LINK/USDT', 'UNI/USDT', 'LTC/USDT', 'BCH/USDT'
  ];
  
  return commonPairs
    .filter(pair => pair.includes(searchQuery))
    .slice(0, 50);
};