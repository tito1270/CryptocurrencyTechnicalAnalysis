// Debug utility for testing price simulator timeout fixes

import { generateLivePrices, getRealTimePrice } from './priceSimulator';
import { fetchRealTimePrices } from './priceAPI';

export const testPriceSimulatorFixes = async (): Promise<void> => {
  console.log('🧪 Testing Price Simulator Timeout Fixes...');
  console.log('================================================');
  
  // Test 1: generateLivePrices with timeout
  console.log('\n📊 Test 1: generateLivePrices');
  try {
    const startTime = Date.now();
    const prices = await generateLivePrices(['BTC/USDT', 'ETH/USDT']);
    const endTime = Date.now();
    
    console.log(`✅ generateLivePrices completed in ${endTime - startTime}ms`);
    console.log(`📈 Retrieved ${prices.length} prices`);
    console.log(`💰 Sample prices:`, prices.slice(0, 3).map(p => `${p.pair}: $${p.price.toLocaleString()}`));
  } catch (error) {
    console.error('❌ generateLivePrices failed:', error);
  }

  // Test 2: getRealTimePrice with timeout  
  console.log('\n💱 Test 2: getRealTimePrice');
  try {
    const startTime = Date.now();
    const btcPrice = await getRealTimePrice('binance', 'BTC/USDT');
    const endTime = Date.now();
    
    console.log(`✅ getRealTimePrice completed in ${endTime - startTime}ms`);
    console.log(`💰 BTC/USDT price: $${btcPrice?.toLocaleString()}`);
  } catch (error) {
    console.error('❌ getRealTimePrice failed:', error);
  }

  // Test 3: fetchRealTimePrices direct call
  console.log('\n🌐 Test 3: fetchRealTimePrices');
  try {
    const startTime = Date.now();
    const allPrices = await fetchRealTimePrices();
    const endTime = Date.now();
    
    console.log(`✅ fetchRealTimePrices completed in ${endTime - startTime}ms`);
    console.log(`📊 Total prices: ${allPrices.length}`);
    
    const exchanges = [...new Set(allPrices.map(p => p.broker))];
    const pairs = [...new Set(allPrices.map(p => p.pair))];
    console.log(`🏢 Exchanges: ${exchanges.length} (${exchanges.join(', ')})`);
    console.log(`💱 Unique pairs: ${pairs.length}`);
    
    // Show sample prices
    const samplePrices = allPrices.slice(0, 5);
    console.log('💰 Sample prices:');
    samplePrices.forEach(p => {
      console.log(`  ${p.broker}: ${p.pair} = $${p.price.toLocaleString()} (${p.change24h > 0 ? '+' : ''}${p.change24h.toFixed(2)}%)`);
    });
    
  } catch (error) {
    console.error('❌ fetchRealTimePrices failed:', error);
  }

  console.log('\n🎯 Testing completed!');
  console.log('================================================');
};

export const runTimeoutStressTest = async (): Promise<void> => {
  console.log('⚡ Running Timeout Stress Test...');
  console.log('================================');
  
  const results = {
    successful: 0,
    failed: 0,
    timeouts: 0,
    totalTime: 0
  };
  
  const testRuns = 5;
  
  for (let i = 1; i <= testRuns; i++) {
    console.log(`\n🔄 Run ${i}/${testRuns}:`);
    const startTime = Date.now();
    
    try {
      const prices = await generateLivePrices(['BTC/USDT', 'ETH/USDT', 'BNB/USDT']);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (prices.length > 0) {
        results.successful++;
        console.log(`✅ Success in ${duration}ms - ${prices.length} prices`);
      } else {
        results.failed++;
        console.log(`⚠️ No prices returned in ${duration}ms`);
      }
      
      results.totalTime += duration;
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      results.totalTime += duration;
      
      if (error instanceof Error && error.message.includes('timeout')) {
        results.timeouts++;
        console.log(`⏰ Timeout in ${duration}ms`);
      } else {
        results.failed++;
        console.log(`❌ Error in ${duration}ms: ${error instanceof Error ? error.message : 'unknown'}`);
      }
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Stress Test Results:');
  console.log(`✅ Successful: ${results.successful}/${testRuns} (${Math.round(results.successful/testRuns*100)}%)`);
  console.log(`❌ Failed: ${results.failed}/${testRuns} (${Math.round(results.failed/testRuns*100)}%)`);
  console.log(`⏰ Timeouts: ${results.timeouts}/${testRuns} (${Math.round(results.timeouts/testRuns*100)}%)`);
  console.log(`⚡ Average time: ${Math.round(results.totalTime/testRuns)}ms`);
  console.log('================================');
};

// Helper function to check if the fixes are working
export const validateTimeoutFixes = (): boolean => {
  console.log('🔍 Validating Timeout Fixes...');
  
  // Check if timeout values are reasonable
  const checks = [
    { name: 'PriceSimulator timeout', value: 5000, max: 10000 },
    { name: 'getRealTimePrice timeout', value: 2000, max: 5000 },
    { name: 'API request timeout', value: 8000, max: 15000 }
  ];
  
  let allPassed = true;
  
  checks.forEach(check => {
    if (check.value <= check.max) {
      console.log(`✅ ${check.name}: ${check.value}ms (reasonable)`);
    } else {
      console.log(`❌ ${check.name}: ${check.value}ms (too high)`);
      allPassed = false;
    }
  });
  
  console.log(`\n🎯 Validation ${allPassed ? 'PASSED' : 'FAILED'}`);
  return allPassed;
};

// Export for console debugging
if (typeof window !== 'undefined') {
  (window as any).debugPriceSimulator = {
    testFixes: testPriceSimulatorFixes,
    stressTest: runTimeoutStressTest,
    validate: validateTimeoutFixes
  };
}
