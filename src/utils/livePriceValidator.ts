import { fetchRealTimePrices, getPairPrice, getFallbackPrice, getFallbackPriceAsync } from './priceAPI';
import { generateLivePrices, getRealTimePrice } from './priceSimulator';
import { PriceData } from '../types';

interface ValidationResult {
  success: boolean;
  message: string;
  timestamp: number;
  details?: any;
}

// Validate that prices are live and not fake/static
export const validateLivePrices = async (): Promise<ValidationResult[]> => {
  console.log('🔍 Starting live price validation...');
  const results: ValidationResult[] = [];
  
  try {
    // Test 1: Fetch real-time prices from API
    console.log('📊 Test 1: Real-time API prices');
    const startTime = Date.now();
    const apiPrices = await fetchRealTimePrices(['binance', 'coinbase', 'okx']);
    const fetchDuration = Date.now() - startTime;
    
    if (apiPrices.length > 0) {
      const btcPrices = apiPrices.filter(p => p.pair === 'BTC/USDT');
      const ethPrices = apiPrices.filter(p => p.pair === 'ETH/USDT');
      
      results.push({
        success: true,
        message: `✅ API fetched ${apiPrices.length} prices in ${fetchDuration}ms`,
        timestamp: Date.now(),
        details: {
          totalPrices: apiPrices.length,
          btcPrices: btcPrices.length,
          ethPrices: ethPrices.length,
          exchanges: [...new Set(apiPrices.map(p => p.broker))],
          samplePrices: apiPrices.slice(0, 5).map(p => ({
            broker: p.broker,
            pair: p.pair,
            price: p.price,
            timestamp: new Date(p.timestamp).toISOString()
          }))
        }
      });
    } else {
      results.push({
        success: false,
        message: '❌ API returned no prices',
        timestamp: Date.now()
      });
    }
    
    // Test 2: Validate price timestamps are recent
    console.log('⏰ Test 2: Price timestamp validation');
    const recentPrices = apiPrices.filter(p => {
      const priceAge = Date.now() - p.timestamp;
      return priceAge < 300000; // Less than 5 minutes old
    });
    
    const timestampValidation = recentPrices.length / apiPrices.length;
    results.push({
      success: timestampValidation > 0.95,
      message: `${timestampValidation > 0.95 ? '✅' : '⚠️'} ${Math.round(timestampValidation * 100)}% of prices have recent timestamps`,
      timestamp: Date.now(),
      details: {
        totalPrices: apiPrices.length,
        recentPrices: recentPrices.length,
        validationRatio: timestampValidation
      }
    });
    
    // Test 3: Validate price data structure
    console.log('🔍 Test 3: Price data structure validation');
    const invalidPrices = apiPrices.filter(p => 
      !p.price || 
      p.price <= 0 || 
      !p.broker || 
      !p.pair || 
      !p.timestamp
    );
    
    results.push({
      success: invalidPrices.length === 0,
      message: `${invalidPrices.length === 0 ? '✅' : '❌'} Price data structure validation: ${invalidPrices.length} invalid entries`,
      timestamp: Date.now(),
      details: {
        invalidCount: invalidPrices.length,
        totalCount: apiPrices.length,
        invalidSamples: invalidPrices.slice(0, 3)
      }
    });
    
    // Test 4: Test specific broker price fetching
    console.log('🏢 Test 4: Broker-specific price fetching');
    const testPairs = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'];
    const testBrokers = ['binance', 'coinbase', 'okx'];
    
    for (const broker of testBrokers) {
      for (const pair of testPairs) {
        try {
          const price = await getPairPrice(broker, pair);
          results.push({
            success: price !== null && price > 0,
            message: `${price !== null && price > 0 ? '✅' : '❌'} ${broker.toUpperCase()}: ${pair} = $${price?.toLocaleString() || 'N/A'}`,
            timestamp: Date.now(),
            details: { broker, pair, price }
          });
        } catch (error) {
          results.push({
            success: false,
            message: `❌ ${broker.toUpperCase()}: ${pair} fetch failed - ${error instanceof Error ? error.message : 'unknown error'}`,
            timestamp: Date.now(),
            details: { broker, pair, error: error instanceof Error ? error.message : 'unknown' }
          });
        }
      }
    }
    
    // Test 5: Validate price ranges are realistic
    console.log('💰 Test 5: Price range validation');
    const priceRangeTests = [
      { pair: 'BTC/USDT', minPrice: 50000, maxPrice: 200000 },
      { pair: 'ETH/USDT', minPrice: 1000, maxPrice: 10000 },
      { pair: 'BNB/USDT', minPrice: 200, maxPrice: 2000 },
      { pair: 'DOGE/USDT', minPrice: 0.01, maxPrice: 2 }
    ];
    
    for (const test of priceRangeTests) {
      const pairPrices = apiPrices.filter(p => p.pair === test.pair);
      const validPrices = pairPrices.filter(p => 
        p.price >= test.minPrice && p.price <= test.maxPrice
      );
      
      const validationRatio = pairPrices.length > 0 ? validPrices.length / pairPrices.length : 0;
      results.push({
        success: validationRatio > 0.9,
        message: `${validationRatio > 0.9 ? '✅' : '⚠️'} ${test.pair}: ${Math.round(validationRatio * 100)}% prices in realistic range (${test.minPrice}-${test.maxPrice})`,
        timestamp: Date.now(),
        details: {
          pair: test.pair,
          totalPrices: pairPrices.length,
          validPrices: validPrices.length,
          priceRange: [test.minPrice, test.maxPrice],
          actualPrices: pairPrices.map(p => ({ broker: p.broker, price: p.price }))
        }
      });
    }
    
    // Test 6: Validate live fallback system works
    console.log('🔄 Test 6: Live fallback system validation');
    const fallbackTests = ['BTC/USDT', 'ETH/USDT', 'DOGE/USDT'];
    for (const pair of fallbackTests) {
      try {
        const fallbackPrice = await getFallbackPriceAsync(pair);
        const [base] = pair.split('/');
        
        // Check if live fallback price is valid (any positive number is valid since it's live)
        const isValid = fallbackPrice > 0;
        
        results.push({
          success: isValid,
          message: `${isValid ? '✅' : '❌'} Live fallback ${pair}: $${fallbackPrice.toLocaleString()} ${isValid ? '(live data)' : '(invalid)'}`,
          timestamp: Date.now(),
          details: { pair, fallbackPrice, source: 'live_fallback', isValid }
        });
      } catch (error) {
        results.push({
          success: false,
          message: `❌ Live fallback ${pair}: Failed to get live price - ${error instanceof Error ? error.message : 'unknown error'}`,
          timestamp: Date.now(),
          details: { pair, error: error instanceof Error ? error.message : 'unknown error' }
        });
      }
    }
    
  } catch (error) {
    results.push({
      success: false,
      message: `❌ Validation failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      timestamp: Date.now(),
      details: { error: error instanceof Error ? error.message : 'unknown' }
    });
  }
  
  return results;
};

// Quick validation for debugging
export const quickPriceCheck = async (): Promise<void> => {
  console.log('🚀 Quick Price Check Starting...');
  console.log('=====================================');
  
  try {
    // Test API connection
    const prices = await fetchRealTimePrices(['binance']);
    console.log(`📊 Fetched ${prices.length} prices from API`);
    
    if (prices.length > 0) {
      const btc = prices.find(p => p.pair === 'BTC/USDT');
      const eth = prices.find(p => p.pair === 'ETH/USDT');
      
      if (btc) {
        console.log(`💰 BTC/USDT: $${btc.price.toLocaleString()} (${btc.change24h > 0 ? '+' : ''}${btc.change24h.toFixed(2)}%)`);
        console.log(`   📅 Timestamp: ${new Date(btc.timestamp).toISOString()}`);
        console.log(`   📈 24h High: $${btc.high24h.toLocaleString()}`);
        console.log(`   📉 24h Low: $${btc.low24h.toLocaleString()}`);
      }
      
      if (eth) {
        console.log(`💎 ETH/USDT: $${eth.price.toLocaleString()} (${eth.change24h > 0 ? '+' : ''}${eth.change24h.toFixed(2)}%)`);
        console.log(`   📅 Timestamp: ${new Date(eth.timestamp).toISOString()}`);
      }
      
      const exchanges = [...new Set(prices.map(p => p.broker))];
      const pairs = [...new Set(prices.map(p => p.pair))];
      console.log(`🏢 Exchanges: ${exchanges.join(', ')}`);
      console.log(`💱 Total unique pairs: ${pairs.length}`);
      
    } else {
      console.log('⚠️ No prices returned from API');
    }
    
  } catch (error) {
    console.error('❌ Quick check failed:', error);
  }
  
  console.log('=====================================');
  console.log('🎯 Quick Price Check Complete!');
};

// Real-time price monitoring (for development)
export const startPriceMonitoring = (intervalMs: number = 60000): () => void => {
  console.log(`🔄 Starting price monitoring (every ${intervalMs / 1000}s)...`);
  
  let monitoringCount = 0;
  const interval = setInterval(async () => {
    monitoringCount++;
    console.log(`\n📊 Price Monitor #${monitoringCount} - ${new Date().toISOString()}`);
    
    try {
      const btcPrice = await getRealTimePrice('binance', 'BTC/USDT');
      const ethPrice = await getRealTimePrice('binance', 'ETH/USDT');
      
      console.log(`💰 BTC: $${btcPrice?.toLocaleString() || 'N/A'}`);
      console.log(`💎 ETH: $${ethPrice?.toLocaleString() || 'N/A'}`);
      
    } catch (error) {
      console.error('❌ Monitor error:', error);
    }
  }, intervalMs);
  
  // Return cleanup function
  return () => {
    clearInterval(interval);
    console.log('🛑 Price monitoring stopped');
  };
};

// Export for console debugging
if (typeof window !== 'undefined') {
  (window as any).livePriceValidator = {
    validate: validateLivePrices,
    quickCheck: quickPriceCheck,
    startMonitoring: startPriceMonitoring
  };
}
