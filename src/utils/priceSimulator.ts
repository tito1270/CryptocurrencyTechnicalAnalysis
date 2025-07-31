import { PriceData } from '../types';
import { brokers } from '../data/brokers';
import { fetchRealTimePrices, getPairPrice, getFallbackPrice } from './priceAPI';

// Real-time price fetching with API integration
export const generateLivePrices = async (selectedPairs?: string[]): Promise<PriceData[]> => {
  try {
    // Fetch real prices from APIs
    const realPrices = await fetchRealTimePrices();
    
    if (realPrices.length > 0) {
      // If we have real data, use it
      if (selectedPairs && selectedPairs.length > 0) {
        return realPrices.filter(price => 
          selectedPairs.some(pair => price.pair === pair)
        );
      }
      return realPrices;
    } else {
      // Fallback to simulated data if APIs fail
      return generateFallbackPrices(selectedPairs);
    }
  } catch (error) {
    console.error('Error fetching live prices:', error);
    return generateFallbackPrices(selectedPairs);
  }
};

// Fallback price generation when APIs are unavailable
const generateFallbackPrices = (selectedPairs?: string[]): PriceData[] => {
  const prices: PriceData[] = [];
  
  if (selectedPairs && selectedPairs.length > 0) {
    brokers.forEach(broker => {
      selectedPairs.forEach(pair => {
        if (broker.pairs.includes(pair)) {
          prices.push(generateFallbackPriceData(broker.id, pair));
        }
      });
    });
  } else {
    const popularPairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT', 'SOL/USDT'];
    
    brokers.forEach(broker => {
      popularPairs.forEach(pair => {
        if (broker.pairs.includes(pair)) {
          prices.push(generateFallbackPriceData(broker.id, pair));
        }
      });
    });
  }
  
  return prices;
};

// Generate fallback price data
const generateFallbackPriceData = (broker: string, pair: string): PriceData => {
  const basePrice = getFallbackPrice(pair);
  
  // Add small broker variations
  const brokerVariations: { [key: string]: number } = {
    'binance': 0,
    'okx': 0.001,
    'coinbase': -0.002,
    'kraken': 0.0015,
    'kucoin': -0.001,
    'huobi': 0.0005,
    'gate': -0.0015,
    'bitget': 0.002,
    'mexc': -0.0005,
    'bybit': 0.001,
    'crypto_com': -0.001,
    'bingx': 0.0015,
    'bitfinex': -0.002,
    'phemex': 0.001,
    'deribit': 0.0005
  };
  
  const variation = brokerVariations[broker] || 0;
  const currentPrice = basePrice * (1 + variation);
  
  return {
    broker,
    pair,
    price: currentPrice,
    change24h: (Math.random() - 0.5) * 20, // -10% to +10%
    volume: Math.random() * 50000000 + 10000000, // 10M to 60M
    high24h: currentPrice * (1 + Math.random() * 0.05),
    low24h: currentPrice * (1 - Math.random() * 0.05),
    timestamp: Date.now()
  };
};

// Get real-time price for a specific pair and broker
export const getRealTimePrice = async (broker: string, pair: string): Promise<number | null> => {
  try {
    return await getPairPrice(broker, pair);
  } catch (error) {
    console.error(`Error getting real-time price for ${pair} on ${broker}:`, error);
    return null;
  }
};

// Function to search pairs across all brokers
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