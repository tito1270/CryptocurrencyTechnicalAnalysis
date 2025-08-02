import { PriceData } from '../types';
import { brokers } from '../data/brokers';
import { fetchRealTimePrices, getPairPrice, getFallbackPrice } from './priceAPI';
import livePriceStreamer from './livePriceStreamer';

// Enhanced live price generation with real API integration and streaming support
export const generateLivePrices = async (selectedPairs?: string[]): Promise<PriceData[]> => {
  console.log('🚀 PriceSimulator: Starting LIVE price fetch from all exchanges...');

  try {
    // First check if we have live streamer data available
    const streamerPrices = livePriceStreamer.getLastPrices();
    if (streamerPrices.length > 100 && livePriceStreamer.isStreamingLive()) {
      console.log(`⚡ Using live streamer data: ${streamerPrices.length} prices`);
      
      // Filter for selected pairs if specified
      if (selectedPairs && selectedPairs.length > 0) {
        const filtered = streamerPrices.filter(price =>
          selectedPairs.some(pair => price.pair === pair)
        );
        return filtered.length > 0 ? filtered : streamerPrices;
      }
      
      return streamerPrices;
    }

    // Fallback to direct API call with timeout
    const timeoutPromise = new Promise<PriceData[]>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timeout after 8 seconds')), 8000)
    );

    const pricesPromise = fetchAllExchangesLive(selectedPairs);
    const realPrices = await Promise.race([pricesPromise, timeoutPromise]);

    if (realPrices && realPrices.length > 50) {
      console.log(`✅ PriceSimulator: Successfully loaded ${realPrices.length} LIVE prices`);
      
      // Log sample prices for verification
      const btcPrices = realPrices.filter(p => p.pair === 'BTC/USDT');
      const ethPrices = realPrices.filter(p => p.pair === 'ETH/USDT');
      
      if (btcPrices.length > 0) {
        console.log(`💰 BTC/USDT prices across exchanges:`);
        btcPrices.slice(0, 5).forEach(p => {
          console.log(`  ${p.broker.toUpperCase()}: $${p.price.toLocaleString()}`);
        });
      }
      
      if (ethPrices.length > 0) {
        console.log(`💎 ETH/USDT prices across exchanges:`);
        ethPrices.slice(0, 3).forEach(p => {
          console.log(`  ${p.broker.toUpperCase()}: $${p.price.toLocaleString()}`);
        });
      }
      
      return realPrices;
    } else {
      console.log('⚠️ Insufficient live data, generating fallback for Binance only');
      return generateEnhancedFallback(selectedPairs);
    }
  } catch (error) {
    console.log(`⚠️ PriceSimulator: Live API timeout/error (${error instanceof Error ? error.message : 'unknown'}), using fallback for Binance only`);
    return generateEnhancedFallback(selectedPairs);
  }
};

// Fetch from all exchanges with live APIs
const fetchAllExchangesLive = async (selectedPairs?: string[]): Promise<PriceData[]> => {
  console.log('🌐 Fetching from ALL exchange APIs simultaneously...');
  
  const allPrices: PriceData[] = [];
  
  try {
    // Get live prices from real APIs
    const livePrices = await fetchRealTimePrices();
    
    if (livePrices.length > 0) {
      allPrices.push(...livePrices);
      console.log(`✅ Live API data: ${livePrices.length} prices from real exchanges`);
    }
    
    // Filter for specific pairs if requested
    if (selectedPairs && selectedPairs.length > 0) {
      const filtered = allPrices.filter(price =>
        selectedPairs.some(pair => price.pair === pair)
      );
      
      if (filtered.length > 0) {
        console.log(`📊 Filtered to ${filtered.length} prices for requested pairs`);
        return filtered;
      }
    }
    
    return allPrices;
    
  } catch (error) {
    console.error('❌ All exchange APIs failed:', error);
    return [];
  }
};

// Fallback with current market data - Binance only
const generateEnhancedFallback = (selectedPairs?: string[]): PriceData[] => {
  console.log('🔄 Generating fallback prices for Binance only...');
  
  const prices: PriceData[] = [];
  
  // Current market prices (January 2025 - Updated)
  const currentMarketPrices: { [key: string]: number } = {
    'BTC': 97500,   // Bitcoin
    'ETH': 3480,    // Ethereum
    'BNB': 695,     // Binance Coin
    'XRP': 2.48,    // Ripple
    'ADA': 0.98,    // Cardano
    'SOL': 238,     // Solana
    'DOGE': 0.385,  // Dogecoin
    'MATIC': 1.15,  // Polygon
    'DOT': 8.95,    // Polkadot
    'AVAX': 42.5,   // Avalanche
    'SHIB': 0.0000285, // Shiba Inu
    'LTC': 115,     // Litecoin
    'ATOM': 8.85,   // Cosmos
    'LINK': 22.5,   // Chainlink
    'UNI': 12.8,    // Uniswap
    'BCH': 485,     // Bitcoin Cash
    'XLM': 0.385,   // Stellar
    'ALGO': 0.385,  // Algorand
    'VET': 0.0485,  // VeChain
    'ICP': 12.5,    // Internet Computer
    'FIL': 5.95,    // Filecoin
    'TRX': 0.285,   // Tron
    'ETC': 32.5,    // Ethereum Classic
    'THETA': 2.85,  // Theta
    'NEAR': 6.95,   // Near Protocol
    'FTM': 0.885,   // Fantom
    'HBAR': 0.285,  // Hedera
    'ONE': 0.0285,  // Harmony
    'SAND': 0.585,  // The Sandbox
    'MANA': 0.485,  // Decentraland
    'CRO': 0.185,   // Crypto.com Coin
    'PEPE': 0.0000185, // Pepe
    'FLOKI': 0.000285, // Floki
    'BONK': 0.0000085, // Bonk
    'WIF': 3.85,    // Dogwifhat
    'OP': 2.85,     // Optimism
    'ARB': 1.285,   // Arbitrum
    'SUI': 2.85,    // Sui
    'SEI': 0.585,   // Sei
    'TIA': 8.85,    // Celestia
    'JTO': 4.25,    // Jito
    'PYTH': 0.585,  // Pyth Network
    'JUP': 1.485,   // Jupiter
    'BLUR': 0.485,  // Blur
    'IMX': 2.85,    // Immutable X
    'APT': 12.85,   // Aptos
    'GMT': 0.285,   // STEPN
    'STX': 2.85,    // Stacks
    'INJ': 32.5,    // Injective
    'ROSE': 0.125,  // Oasis Network
    'JASMY': 0.0485, // JasmyCoin
    'LUNC': 0.000185, // Terra Luna Classic
    'USTC': 0.0385, // TerraClassicUSD
    'FET': 2.85,    // Fetch.ai
    'AGIX': 0.885,  // SingularityNET
    'OCEAN': 0.985, // Ocean Protocol
    'RNDR': 12.5,   // Render Token
    'TAO': 585,     // Bittensor
    'AI': 1.285,    // Sleepless AI
    'WLD': 3.85,    // Worldcoin
    'ARKM': 2.85,   // Arkham
    'LPT': 22.5,    // Livepeer
    'GRT': 0.385,   // The Graph
    'AAVE': 285,    // Aave
    'COMP': 85.5,   // Compound
    'MKR': 1685,    // Maker
    'SNX': 3.85,    // Synthetix
    'CRV': 0.785,   // Curve
    'UMA': 4.85,    // UMA
    'BAL': 3.85,    // Balancer
    'SUSHI': 1.85,  // SushiSwap
    'YFI': 7850,    // Yearn Finance
    'CAKE': 3.85,   // PancakeSwap
    'USDT': 1.000,  // Tether
    'USDC': 0.9998, // USD Coin
    'DAI': 1.001,   // Dai
    'BUSD': 1.000,  // Binance USD
    'TUSD': 0.9995, // TrueUSD
    'FDUSD': 1.000  // First Digital USD
  };
  
  // Exchange configurations - only Binance allowed for fallback prices
  const exchangeConfigs = [
    { id: 'binance', spread: 0, volume_mult: 1.0, quotes: ['USDT', 'USDC', 'BTC', 'ETH', 'BNB', 'FDUSD'] }
    // All other exchanges removed - they must use live APIs only
  ];
  
  // Generate prices for all exchanges
  exchangeConfigs.forEach(exchange => {
    Object.entries(currentMarketPrices).forEach(([crypto, basePrice]) => {
      exchange.quotes.forEach(quote => {
        if (crypto === quote) return;
        
        // Skip if specific pairs requested and this isn't one of them
        const pair = `${crypto}/${quote}`;
        if (selectedPairs && selectedPairs.length > 0 && !selectedPairs.includes(pair)) {
          return;
        }
        
        const microVariation = (Math.random() - 0.5) * 0.0005; // ±0.025%
        const finalPrice = basePrice * (1 + exchange.spread + microVariation);
        
        // Realistic 24h change based on crypto type
        const volatility = crypto === 'BTC' || crypto === 'ETH' ? 3 : // Major: ±1.5%
                           ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'FDUSD'].includes(crypto) ? 0.05 : // Stables: ±0.025%
                           crypto === 'PEPE' || crypto === 'FLOKI' || crypto === 'BONK' ? 12 : // Meme: ±6%
                           6; // Others: ±3%
        
        const change24h = (Math.random() - 0.5) * volatility;
        
        // Volume based on market cap tier
        const baseVolume = basePrice > 1000 ? 150000000 : // Major: 150M
                           basePrice > 10 ? 75000000 : // Mid-cap: 75M
                           basePrice > 0.1 ? 30000000 : // Small-cap: 30M
                           10000000; // Micro-cap: 10M
        
        const volume = baseVolume * exchange.volume_mult * (0.8 + Math.random() * 0.4);
        
        // High/Low calculations
        const dailyRange = Math.abs(change24h) / 100 * 0.6 + 0.01;
        const high24h = finalPrice * (1 + dailyRange + Math.random() * 0.005);
        const low24h = finalPrice * (1 - dailyRange - Math.random() * 0.005);
        
        prices.push({
          broker: exchange.id,
          pair,
          price: finalPrice,
          change24h,
          volume,
          high24h,
          low24h,
          timestamp: Date.now()
        });
      });
    });
  });
  
  console.log(`📊 Binance fallback only: ${prices.length} current market prices generated`);
  return prices;
};

// Get real-time price for specific pair/broker with live API
export const getRealTimePrice = async (broker: string, pair: string): Promise<number | null> => {
  try {
    console.log(`🔍 Getting LIVE price for ${pair} on ${broker.toUpperCase()}...`);

    // Try live API first with timeout
    const timeoutPromise = new Promise<number | null>((_, reject) =>
      setTimeout(() => reject(new Error('Live price fetch timeout')), 3000)
    );

    const pricePromise = getPairPrice(broker, pair);

    try {
      const livePrice = await Promise.race([pricePromise, timeoutPromise]);
      if (livePrice && livePrice > 0) {
        console.log(`✅ LIVE API price: ${pair} on ${broker.toUpperCase()} = $${livePrice.toLocaleString()}`);
        return livePrice;
      }
    } catch (timeoutError) {
      console.log(`⚠️ Live API timeout for ${pair} on ${broker.toUpperCase()}`);
    }

    // Only allow fallback prices for Binance
    if (broker === 'binance') {
      console.log(`🔄 Using fallback price for ${pair} on ${broker.toUpperCase()}`);
      const marketPrice = getFallbackPrice(pair);
      const adjustedPrice = marketPrice * (1 + (Math.random() - 0.5) * 0.001);
      console.log(`📊 Fallback price: ${pair} on ${broker.toUpperCase()} = $${adjustedPrice.toLocaleString()}`);
      return adjustedPrice;
    } else {
      console.warn(`⚠️ ${broker.toUpperCase()} failed - no fallback prices allowed for this exchange`);
      return null;
    }

  } catch (error) {
    console.error(`❌ Error getting price for ${pair} on ${broker.toUpperCase()}:`, error);
    
    // Only allow fallback prices for Binance
    if (broker === 'binance') {
      return getFallbackPrice(pair);
    } else {
      console.warn(`⚠️ ${broker.toUpperCase()} error - no fallback prices allowed for this exchange`);
      return null;
    }
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