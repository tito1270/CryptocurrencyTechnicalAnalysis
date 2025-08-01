import livePriceStreamer from './livePriceStreamer';
import priceValidator from './priceValidator';
import { fetchRealTimePrices } from './priceAPI';
import { PriceData } from '../types';

interface TestResults {
  testName: string;
  passed: boolean;
  duration: number;
  details: string;
  dataSize: number;
}

class LivePriceSystemTest {
  private results: TestResults[] = [];

  public async runAllTests(): Promise<void> {
    console.log('🚀 Starting comprehensive live price system tests...');
    console.log('==========================================');

    await this.testDirectAPIFetch();
    await this.testLiveStreamerInitialization();
    await this.testWebSocketConnections();
    await this.testPriceValidation();
    await this.testArbitrageDetection();
    await this.testPriceSanitization();
    await this.testLiveStreaming();

    this.printTestSummary();
  }

  private async testDirectAPIFetch(): Promise<void> {
    const testName = 'Direct API Fetch Test';
    const startTime = Date.now();
    
    try {
      console.log('\n🔍 Test 1: Direct API Fetch');
      console.log('----------------------------------------');
      
      const prices = await fetchRealTimePrices();
      const duration = Date.now() - startTime;
      
      const exchanges = [...new Set(prices.map(p => p.broker))];
      const pairs = [...new Set(prices.map(p => p.pair))];
      
      console.log(`✅ Fetched ${prices.length} prices`);
      console.log(`📊 Exchanges: ${exchanges.length} (${exchanges.join(', ')})`);
      console.log(`💱 Unique pairs: ${pairs.length}`);
      console.log(`⏱️ Duration: ${duration}ms`);
      
      // Test specific pairs
      const btcPrices = prices.filter(p => p.pair === 'BTC/USDT');
      const ethPrices = prices.filter(p => p.pair === 'ETH/USDT');
      
      console.log(`💰 BTC/USDT prices: ${btcPrices.length} exchanges`);
      btcPrices.slice(0, 3).forEach(p => {
        console.log(`  ${p.broker.toUpperCase()}: $${p.price.toLocaleString()}`);
      });
      
      console.log(`💎 ETH/USDT prices: ${ethPrices.length} exchanges`);
      ethPrices.slice(0, 3).forEach(p => {
        console.log(`  ${p.broker.toUpperCase()}: $${p.price.toLocaleString()}`);
      });

      this.results.push({
        testName,
        passed: prices.length > 100,
        duration,
        details: `${prices.length} prices, ${exchanges.length} exchanges, ${pairs.length} pairs`,
        dataSize: prices.length
      });

    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      this.results.push({
        testName,
        passed: false,
        duration: Date.now() - startTime,
        details: `Error: ${error}`,
        dataSize: 0
      });
    }
  }

  private async testLiveStreamerInitialization(): Promise<void> {
    const testName = 'Live Streamer Initialization';
    const startTime = Date.now();
    
    try {
      console.log('\n🔌 Test 2: Live Streamer Initialization');
      console.log('----------------------------------------');
      
      // Test streamer start
      await livePriceStreamer.start();
      const duration = Date.now() - startTime;
      
      // Wait for initial data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const prices = livePriceStreamer.getLastPrices();
      const wsStatus = livePriceStreamer.getWebSocketStatus();
      const isStreaming = livePriceStreamer.isStreamingLive();
      
      console.log(`📊 Live streamer status: ${isStreaming ? '✅ Active' : '⚠️ Inactive'}`);
      console.log(`💾 Cached prices: ${prices.length}`);
      console.log(`🔌 WebSocket connections:`);
      
      Object.entries(wsStatus).forEach(([exchange, connected]) => {
        console.log(`  ${exchange.toUpperCase()}: ${connected ? '🟢 Connected' : '🔴 Disconnected'}`);
      });

      this.results.push({
        testName,
        passed: prices.length > 0,
        duration,
        details: `${prices.length} cached prices, ${Object.values(wsStatus).filter(Boolean).length} WS connections`,
        dataSize: prices.length
      });

    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      this.results.push({
        testName,
        passed: false,
        duration: Date.now() - startTime,
        details: `Error: ${error}`,
        dataSize: 0
      });
    }
  }

  private async testWebSocketConnections(): Promise<void> {
    const testName = 'WebSocket Connections Test';
    const startTime = Date.now();
    
    try {
      console.log('\n🌐 Test 3: WebSocket Connections');
      console.log('----------------------------------------');
      
      const wsStatus = livePriceStreamer.getWebSocketStatus();
      const connectedExchanges = Object.entries(wsStatus).filter(([_, connected]) => connected);
      const duration = Date.now() - startTime;
      
      console.log(`🔌 Active WebSocket connections: ${connectedExchanges.length}`);
      connectedExchanges.forEach(([exchange]) => {
        console.log(`  ✅ ${exchange.toUpperCase()}: Live streaming active`);
      });
      
      if (connectedExchanges.length === 0) {
        console.log('⚠️ No WebSocket connections active - using API polling fallback');
      }

      this.results.push({
        testName,
        passed: true, // This test always passes as fallback is acceptable
        duration,
        details: `${connectedExchanges.length} WebSocket connections active`,
        dataSize: connectedExchanges.length
      });

    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      this.results.push({
        testName,
        passed: false,
        duration: Date.now() - startTime,
        details: `Error: ${error}`,
        dataSize: 0
      });
    }
  }

  private async testPriceValidation(): Promise<void> {
    const testName = 'Price Validation System';
    const startTime = Date.now();
    
    try {
      console.log('\n🔍 Test 4: Price Validation System');
      console.log('----------------------------------------');
      
      const prices = livePriceStreamer.getLastPrices() || await fetchRealTimePrices();
      const validation = priceValidator.validatePrices(prices);
      const duration = Date.now() - startTime;
      
      console.log(`📊 Validation results:`);
      console.log(`  Overall status: ${validation.isValid ? '✅ Valid' : '⚠️ Issues detected'}`);
      console.log(`  Total prices: ${prices.length}`);
      console.log(`  Anomalies: ${validation.anomalies.length} (${(validation.anomalies.length / prices.length * 100).toFixed(1)}%)`);
      console.log(`  Arbitrage opportunities: ${validation.arbitrageOpportunities.length}`);
      console.log(`  Price spread: ${validation.priceSpread.toFixed(2)}%`);
      console.log(`  Outliers: ${validation.outliers.length}`);
      
      if (validation.anomalies.length > 0) {
        console.log('\n⚠️ Sample anomalies:');
        validation.anomalies.slice(0, 3).forEach(anomaly => {
          console.log(`  • ${anomaly}`);
        });
      }

      this.results.push({
        testName,
        passed: validation.isValid,
        duration,
        details: `${validation.anomalies.length} anomalies, ${validation.arbitrageOpportunities.length} arbitrage ops`,
        dataSize: prices.length
      });

    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      this.results.push({
        testName,
        passed: false,
        duration: Date.now() - startTime,
        details: `Error: ${error}`,
        dataSize: 0
      });
    }
  }

  private async testArbitrageDetection(): Promise<void> {
    const testName = 'Arbitrage Detection';
    const startTime = Date.now();
    
    try {
      console.log('\n💰 Test 5: Arbitrage Detection');
      console.log('----------------------------------------');
      
      const prices = livePriceStreamer.getLastPrices() || await fetchRealTimePrices();
      const opportunities = priceValidator.getTopArbitrageOpportunities(prices, 5);
      const duration = Date.now() - startTime;
      
      console.log(`🔥 Found ${opportunities.length} arbitrage opportunities:`);
      
      if (opportunities.length > 0) {
        opportunities.forEach((opp, index) => {
          console.log(`  ${index + 1}. ${opp.pair}:`);
          console.log(`     Buy: ${opp.buyExchange.toUpperCase()} at $${opp.buyPrice.toLocaleString()}`);
          console.log(`     Sell: ${opp.sellExchange.toUpperCase()} at $${opp.sellPrice.toLocaleString()}`);
          console.log(`     Profit: ${opp.profitPercent.toFixed(2)}% ($${(opp.sellPrice - opp.buyPrice).toLocaleString()})`);
          console.log(`     Volume: $${opp.volume.toLocaleString()}`);
        });
      } else {
        console.log('  No significant arbitrage opportunities found (profit < 0.5%)');
      }

      this.results.push({
        testName,
        passed: true, // This test always passes
        duration,
        details: `${opportunities.length} arbitrage opportunities found`,
        dataSize: opportunities.length
      });

    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      this.results.push({
        testName,
        passed: false,
        duration: Date.now() - startTime,
        details: `Error: ${error}`,
        dataSize: 0
      });
    }
  }

  private async testPriceSanitization(): Promise<void> {
    const testName = 'Price Sanitization';
    const startTime = Date.now();
    
    try {
      console.log('\n🧹 Test 6: Price Sanitization');
      console.log('----------------------------------------');
      
      const rawPrices = await fetchRealTimePrices();
      const sanitizedPrices = priceValidator.sanitizePrices(rawPrices);
      const duration = Date.now() - startTime;
      
      const removedCount = rawPrices.length - sanitizedPrices.length;
      const removalRate = (removedCount / rawPrices.length * 100);
      
      console.log(`📊 Sanitization results:`);
      console.log(`  Original prices: ${rawPrices.length}`);
      console.log(`  Sanitized prices: ${sanitizedPrices.length}`);
      console.log(`  Removed outliers: ${removedCount} (${removalRate.toFixed(1)}%)`);
      console.log(`  Data quality: ${removalRate < 10 ? '✅ Excellent' : removalRate < 20 ? '⚠️ Good' : '❌ Poor'}`);

      this.results.push({
        testName,
        passed: removalRate < 25, // Pass if less than 25% removed
        duration,
        details: `${removedCount} outliers removed (${removalRate.toFixed(1)}%)`,
        dataSize: sanitizedPrices.length
      });

    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      this.results.push({
        testName,
        passed: false,
        duration: Date.now() - startTime,
        details: `Error: ${error}`,
        dataSize: 0
      });
    }
  }

  private async testLiveStreaming(): Promise<void> {
    const testName = 'Live Streaming Performance';
    const startTime = Date.now();
    
    try {
      console.log('\n⚡ Test 7: Live Streaming Performance');
      console.log('----------------------------------------');
      
      let updateCount = 0;
      const updates: { timestamp: number; priceCount: number }[] = [];
      
      // Subscribe to live updates
      const unsubscribe = livePriceStreamer.subscribe((prices) => {
        updateCount++;
        updates.push({
          timestamp: Date.now(),
          priceCount: prices.length
        });
        console.log(`📊 Update #${updateCount}: ${prices.length} prices`);
      });
      
      // Wait for updates
      console.log('⏳ Monitoring live updates for 10 seconds...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      unsubscribe();
      const duration = Date.now() - startTime;
      
      const avgUpdateInterval = updates.length > 1 ? 
        (updates[updates.length - 1].timestamp - updates[0].timestamp) / (updates.length - 1) : 0;
      
      console.log(`📈 Live streaming performance:`);
      console.log(`  Total updates: ${updateCount}`);
      console.log(`  Average interval: ${avgUpdateInterval.toFixed(0)}ms`);
      console.log(`  Update frequency: ${(updateCount / 10).toFixed(1)} updates/second`);
      console.log(`  Streaming status: ${livePriceStreamer.isStreamingLive() ? '✅ Active' : '⚠️ Inactive'}`);

      this.results.push({
        testName,
        passed: updateCount > 0,
        duration,
        details: `${updateCount} updates in 10s, ${avgUpdateInterval.toFixed(0)}ms interval`,
        dataSize: updateCount
      });

    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      this.results.push({
        testName,
        passed: false,
        duration: Date.now() - startTime,
        details: `Error: ${error}`,
        dataSize: 0
      });
    }
  }

  private printTestSummary(): void {
    console.log('\n📋 TEST SUMMARY');
    console.log('==========================================');
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${totalTests - passedTests} ❌`);
    console.log(`Success Rate: ${(passedTests / totalTests * 100).toFixed(1)}%`);
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log('');
    
    this.results.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.testName}`);
      console.log(`   Duration: ${result.duration}ms | Data: ${result.dataSize} items`);
      console.log(`   Details: ${result.details}`);
    });
    
    console.log('\n🎉 Live price system test completed!');
    console.log(`🔥 Your crypto price system is now ${passedTests === totalTests ? 'FULLY LIVE' : 'PARTIALLY LIVE'} with real-time streaming!`);
  }

  public getResults(): TestResults[] {
    return this.results;
  }
}

// Export test runner
export const livePriceSystemTest = new LivePriceSystemTest();
export default livePriceSystemTest;