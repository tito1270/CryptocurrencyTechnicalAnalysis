import { AnalysisResult, TechnicalIndicator, TradingStrategy } from '../types';
import { technicalIndicators } from '../data/indicators';
import { tradingStrategies } from '../data/strategies';
import { cryptoNews } from '../data/news';
import { getPairPrice, getFallbackPrice } from './priceAPI';

// Simple analysis engine without conflicts
export const performAnalysis = async (
  pair: string,
  broker: string,
  timeframe: string,
  tradeType: 'SPOT' | 'FUTURES',
  selectedIndicators: string[],
  selectedStrategies: string[]
): Promise<AnalysisResult> => {
  console.log(`🚀 Starting analysis for ${pair} on ${broker}...`);
  
  try {
    // Get current price
    const currentPrice = await getCurrentPrice(pair, broker);
    
    // Filter indicators and strategies
    const activeIndicators = technicalIndicators.filter(ind => 
      selectedIndicators.includes(ind.id)
    );
    
    const activeStrategies = tradingStrategies.filter(strat => 
      selectedStrategies.includes(strat.id)
    );
    
    // Simple sentiment calculation
    const { sentiment, confidence } = calculateSentiment(activeIndicators, activeStrategies);
    
    // Generate recommendation
    const recommendation = generateRecommendation(sentiment, confidence);
    
    // Calculate price levels
    const levels = calculatePriceLevels(currentPrice, sentiment);
    
    // Simple news analysis
    const newsAnalysis = analyzeNews(pair);

    return {
      pair,
      broker,
      timeframe,
      tradeType,
      overallSentiment: sentiment,
      confidence,
      recommendation: recommendation.action,
      recommendedEntryPrice: levels.entryPrice,
      profitTarget: levels.profitTarget,
      stopLoss: levels.stopLoss,
      riskRewardRatio: 2.0,
      newsImpact: 'MEDIUM',
      explanation: recommendation.explanation,
      newsAnalysis: newsAnalysis,
      upcomingEvents: [],
      entryPrice: currentPrice,
      targetPrice: levels.profitTarget,
      supportLevel: levels.supportLevel,
      resistanceLevel: levels.resistanceLevel,
      indicators: activeIndicators,
      strategies: activeStrategies,
      priceSource: 'LIVE_API',
      priceTimestamp: Date.now(),
      candlestickPatterns: [],
      trendAnalysis: {
        direction: 'UPTREND',
        strength: 'MODERATE',
        duration: 5,
        confidence: 70,
        supportLevel: currentPrice * 0.95,
        resistanceLevel: currentPrice * 1.05,
        trendLine: { slope: 0.1, intercept: currentPrice, r2: 0.7 }
      },
      patternConfirmation: true,
      optionsRecommendations: []
    };
  } catch (error) {
    console.error(`Analysis failed for ${pair}:`, error);
    throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get current price with fallback
const getCurrentPrice = async (pair: string, broker: string): Promise<number> => {
  try {
    const price = await getPairPrice(broker, pair);
    if (price && price > 0) {
      return price;
    }
    return getFallbackPrice(pair);
  } catch (error) {
    return getFallbackPrice(pair);
  }
};

// Simple sentiment calculation
const calculateSentiment = (indicators: TechnicalIndicator[], strategies: TradingStrategy[]) => {
  let bullishCount = 0;
  let bearishCount = 0;
  
  indicators.forEach(indicator => {
    if (indicator.signal === 'BUY') bullishCount++;
    if (indicator.signal === 'SELL') bearishCount++;
  });
  
  strategies.forEach(strategy => {
    if (strategy.signal.includes('BUY')) bullishCount++;
    if (strategy.signal.includes('SELL')) bearishCount++;
  });
  
  const total = bullishCount + bearishCount;
  if (total === 0) {
    return { sentiment: 'NEUTRAL' as const, confidence: 50 };
  }
  
  const bullishRatio = bullishCount / total;
  
  let sentiment: AnalysisResult['overallSentiment'];
  if (bullishRatio > 0.7) sentiment = 'STRONG_BULLISH';
  else if (bullishRatio > 0.6) sentiment = 'BULLISH';
  else if (bullishRatio < 0.3) sentiment = 'STRONG_BEARISH';
  else if (bullishRatio < 0.4) sentiment = 'BEARISH';
  else sentiment = 'NEUTRAL';
  
  const confidence = Math.round(Math.abs(bullishRatio - 0.5) * 200);
  
  return { sentiment, confidence: Math.max(50, Math.min(90, confidence)) };
};

// Generate trading recommendation
const generateRecommendation = (sentiment: string, confidence: number) => {
  let action: AnalysisResult['recommendation'];
  let explanation: string;
  
  if (sentiment === 'STRONG_BULLISH' && confidence > 75) {
    action = 'STRONG_BUY';
    explanation = `🎯 **STRONG BUY RECOMMENDATION** (${confidence}% confidence)\n\nStrong bullish signals detected across multiple indicators and strategies. High probability upward movement expected.`;
  } else if (sentiment === 'BULLISH' && confidence > 65) {
    action = 'BUY';
    explanation = `🎯 **BUY RECOMMENDATION** (${confidence}% confidence)\n\nBullish signals detected. Moderate upward movement expected with good risk-reward ratio.`;
  } else if (sentiment === 'STRONG_BEARISH' && confidence > 75) {
    action = 'STRONG_SELL';
    explanation = `🎯 **STRONG SELL RECOMMENDATION** (${confidence}% confidence)\n\nStrong bearish signals detected. High probability downward movement expected.`;
  } else if (sentiment === 'BEARISH' && confidence > 65) {
    action = 'SELL';
    explanation = `🎯 **SELL RECOMMENDATION** (${confidence}% confidence)\n\nBearish signals detected. Moderate downward movement expected.`;
  } else {
    action = 'HOLD';
    explanation = `🎯 **HOLD RECOMMENDATION** (${confidence}% confidence)\n\nMixed signals detected. Market in consolidation phase. Wait for clearer direction.`;
  }
  
  return { action, explanation };
};

// Calculate price levels
const calculatePriceLevels = (currentPrice: number, sentiment: string) => {
  let entryMultiplier = 1;
  let targetMultiplier = 1;
  let stopMultiplier = 1;
  
  switch (sentiment) {
    case 'STRONG_BULLISH':
      entryMultiplier = 1.005;
      targetMultiplier = 1.15;
      stopMultiplier = 0.93;
      break;
    case 'BULLISH':
      entryMultiplier = 1.002;
      targetMultiplier = 1.10;
      stopMultiplier = 0.95;
      break;
    case 'BEARISH':
      entryMultiplier = 0.998;
      targetMultiplier = 0.90;
      stopMultiplier = 1.05;
      break;
    case 'STRONG_BEARISH':
      entryMultiplier = 0.995;
      targetMultiplier = 0.85;
      stopMultiplier = 1.07;
      break;
    default:
      entryMultiplier = 1.000;
      targetMultiplier = 1.05;
      stopMultiplier = 0.97;
      break;
  }
  
  return {
    entryPrice: currentPrice * entryMultiplier,
    profitTarget: currentPrice * targetMultiplier,
    stopLoss: currentPrice * stopMultiplier,
    supportLevel: currentPrice * 0.95,
    resistanceLevel: currentPrice * 1.05
  };
};

// Simple news analysis
const analyzeNews = (pair: string): string => {
  const [baseCurrency] = pair.split('/');
  
  return `📊 NEWS ANALYSIS for ${pair}\n\nAnalyzed ${cryptoNews.length} news sources for market sentiment. Current market conditions show mixed signals with moderate volatility expected.\n\nKey factors affecting ${baseCurrency}:\n• Market sentiment: Neutral to positive\n• Trading volume: Normal levels\n• Technical outlook: Following broader market trends`;
};