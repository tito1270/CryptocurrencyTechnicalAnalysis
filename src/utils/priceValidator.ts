import { PriceData } from '../types';

interface PriceValidationResult {
  isValid: boolean;
  anomalies: string[];
  arbitrageOpportunities: ArbitrageOpportunity[];
  averagePrice: number;
  priceSpread: number;
  outliers: PriceData[];
}

interface ArbitrageOpportunity {
  pair: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  profitPercent: number;
  volume: number;
}

interface PriceStats {
  pair: string;
  prices: PriceData[];
  average: number;
  median: number;
  standardDeviation: number;
  spread: number;
  outliers: PriceData[];
}

class PriceValidator {
  private readonly MAX_PRICE_DEVIATION = 0.05; // 5% maximum deviation
  private readonly MIN_ARBITRAGE_PROFIT = 0.5; // 0.5% minimum arbitrage profit
  private readonly MIN_VOLUME_THRESHOLD = 10000; // $10k minimum volume

  public validatePrices(prices: PriceData[]): PriceValidationResult {
    console.log(`🔍 Validating ${prices.length} prices across exchanges...`);
    
    const groupedByPair = this.groupPricesByPair(prices);
    const anomalies: string[] = [];
    const arbitrageOpportunities: ArbitrageOpportunity[] = [];
    const outliers: PriceData[] = [];
    
    let totalValidPrices = 0;
    let totalPrice = 0;
    let maxSpread = 0;

    Object.entries(groupedByPair).forEach(([pair, pairPrices]) => {
      if (pairPrices.length < 2) return;

      const stats = this.calculatePriceStats(pair, pairPrices);
      
      // Check for outliers
      stats.outliers.forEach(outlier => {
        outliers.push(outlier);
        anomalies.push(
          `${outlier.broker.toUpperCase()}: ${pair} price $${outlier.price.toLocaleString()} deviates ${((outlier.price - stats.average) / stats.average * 100).toFixed(2)}% from average`
        );
      });

      // Check for arbitrage opportunities
      const arbitrage = this.findArbitrageOpportunities(pair, pairPrices);
      arbitrageOpportunities.push(...arbitrage);

      // Track overall statistics
      totalValidPrices += pairPrices.length;
      totalPrice += stats.average * pairPrices.length;
      maxSpread = Math.max(maxSpread, stats.spread);
    });

    const averagePrice = totalPrice / totalValidPrices;
    const isValid = anomalies.length < prices.length * 0.1; // Less than 10% anomalies

    console.log(`📊 Validation complete: ${isValid ? '✅' : '⚠️'} Valid, ${anomalies.length} anomalies, ${arbitrageOpportunities.length} arbitrage opportunities`);

    return {
      isValid,
      anomalies,
      arbitrageOpportunities,
      averagePrice,
      priceSpread: maxSpread,
      outliers
    };
  }

  private groupPricesByPair(prices: PriceData[]): { [pair: string]: PriceData[] } {
    return prices.reduce((groups, price) => {
      if (!groups[price.pair]) {
        groups[price.pair] = [];
      }
      groups[price.pair].push(price);
      return groups;
    }, {} as { [pair: string]: PriceData[] });
  }

  private calculatePriceStats(pair: string, prices: PriceData[]): PriceStats {
    const sortedPrices = prices.map(p => p.price).sort((a, b) => a - b);
    const average = sortedPrices.reduce((sum, price) => sum + price, 0) / sortedPrices.length;
    const median = sortedPrices[Math.floor(sortedPrices.length / 2)];
    
    // Calculate standard deviation
    const variance = sortedPrices.reduce((sum, price) => sum + Math.pow(price - average, 2), 0) / sortedPrices.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Calculate spread
    const minPrice = Math.min(...sortedPrices);
    const maxPrice = Math.max(...sortedPrices);
    const spread = ((maxPrice - minPrice) / average) * 100;
    
    // Identify outliers (prices more than 2 standard deviations from mean)
    const outliers = prices.filter(price => 
      Math.abs(price.price - average) > 2 * standardDeviation ||
      Math.abs(price.price - average) / average > this.MAX_PRICE_DEVIATION
    );

    return {
      pair,
      prices,
      average,
      median,
      standardDeviation,
      spread,
      outliers
    };
  }

  private findArbitrageOpportunities(pair: string, prices: PriceData[]): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];
    
    // Only consider prices with sufficient volume
    const validPrices = prices.filter(p => p.volume >= this.MIN_VOLUME_THRESHOLD);
    
    if (validPrices.length < 2) return opportunities;

    // Sort by price to find buy/sell opportunities
    const sortedPrices = validPrices.sort((a, b) => a.price - b.price);
    const cheapest = sortedPrices[0];
    const mostExpensive = sortedPrices[sortedPrices.length - 1];
    
    // Calculate potential profit
    const profitPercent = ((mostExpensive.price - cheapest.price) / cheapest.price) * 100;
    
    if (profitPercent >= this.MIN_ARBITRAGE_PROFIT) {
      opportunities.push({
        pair,
        buyExchange: cheapest.broker,
        sellExchange: mostExpensive.broker,
        buyPrice: cheapest.price,
        sellPrice: mostExpensive.price,
        profitPercent,
        volume: Math.min(cheapest.volume, mostExpensive.volume)
      });
    }

    return opportunities;
  }

  public getTopArbitrageOpportunities(prices: PriceData[], limit: number = 10): ArbitrageOpportunity[] {
    const validation = this.validatePrices(prices);
    return validation.arbitrageOpportunities
      .sort((a, b) => b.profitPercent - a.profitPercent)
      .slice(0, limit);
  }

  public getPriceAccuracyReport(prices: PriceData[]): string {
    const validation = this.validatePrices(prices);
    const groupedByPair = this.groupPricesByPair(prices);
    
    let report = `📊 Price Accuracy Report\n`;
    report += `══════════════════════════\n`;
    report += `Total Prices: ${prices.length}\n`;
    report += `Unique Pairs: ${Object.keys(groupedByPair).length}\n`;
    report += `Exchanges: ${[...new Set(prices.map(p => p.broker))].length}\n`;
    report += `Anomalies: ${validation.anomalies.length} (${(validation.anomalies.length / prices.length * 100).toFixed(1)}%)\n`;
    report += `Arbitrage Opportunities: ${validation.arbitrageOpportunities.length}\n`;
    report += `Overall Status: ${validation.isValid ? '✅ Valid' : '⚠️ Issues Detected'}\n\n`;
    
    if (validation.arbitrageOpportunities.length > 0) {
      report += `🔥 Top Arbitrage Opportunities:\n`;
      validation.arbitrageOpportunities
        .sort((a, b) => b.profitPercent - a.profitPercent)
        .slice(0, 5)
        .forEach((opp, index) => {
          report += `${index + 1}. ${opp.pair}: Buy ${opp.buyExchange.toUpperCase()} ($${opp.buyPrice.toLocaleString()}) → Sell ${opp.sellExchange.toUpperCase()} ($${opp.sellPrice.toLocaleString()}) = ${opp.profitPercent.toFixed(2)}% profit\n`;
        });
      report += `\n`;
    }
    
    if (validation.anomalies.length > 0) {
      report += `⚠️ Price Anomalies:\n`;
      validation.anomalies.slice(0, 5).forEach(anomaly => {
        report += `• ${anomaly}\n`;
      });
      if (validation.anomalies.length > 5) {
        report += `• ... and ${validation.anomalies.length - 5} more\n`;
      }
    }
    
    return report;
  }

  public sanitizePrices(prices: PriceData[]): PriceData[] {
    console.log(`🧹 Sanitizing ${prices.length} prices...`);
    
    const validation = this.validatePrices(prices);
    const groupedByPair = this.groupPricesByPair(prices);
    const sanitizedPrices: PriceData[] = [];
    
    Object.entries(groupedByPair).forEach(([pair, pairPrices]) => {
      if (pairPrices.length === 1) {
        // Single price, keep it
        sanitizedPrices.push(...pairPrices);
        return;
      }
      
      const stats = this.calculatePriceStats(pair, pairPrices);
      
      // Remove outliers and keep valid prices
      const validPrices = pairPrices.filter(price => 
        !stats.outliers.includes(price)
      );
      
      // If we removed too many prices, use median as reference
      if (validPrices.length === 0) {
        const medianPrice = stats.median;
        sanitizedPrices.push({
          ...pairPrices[0],
          price: medianPrice,
          broker: 'consensus' // Mark as consensus price
        });
      } else {
        sanitizedPrices.push(...validPrices);
      }
    });
    
    console.log(`✅ Sanitization complete: ${sanitizedPrices.length} valid prices (removed ${prices.length - sanitizedPrices.length} outliers)`);
    return sanitizedPrices;
  }
}

// Export singleton instance
export const priceValidator = new PriceValidator();
export default priceValidator;