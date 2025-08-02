import { AnalysisResult, TechnicalIndicator, TradingStrategy } from '../types';
import { technicalIndicators } from '../data/indicators';
import { tradingStrategies } from '../data/strategies';
import { cryptoNews } from '../data/news';
import { getPairPrice, getFallbackPrice } from './priceAPI';
import { generateOHLCData, performPatternAnalysis } from './candlestickPatterns';

// NEW COMPREHENSIVE ANALYSIS ENGINE
// Prioritizes candlestick patterns with higher weighting, integrates all indicators,
// and provides strategic entry/exit calculations with news sentiment

export const performAnalysis = async (
  pair: string,
  broker: string,
  timeframe: string,
  tradeType: 'SPOT' | 'FUTURES',
  selectedIndicators: string[],
  selectedStrategies: string[]
): Promise<AnalysisResult> => {
  console.log(`🚀 Starting comprehensive analysis for ${pair} on ${broker}...`);
  
  try {
    // Step 1: Get LIVE current price with enhanced error handling
    const priceData = await getCurrentPrice(pair, broker);
    const currentPrice = priceData.price;
    
    // Validate price data
    if (!currentPrice || currentPrice <= 0) {
      // Only allow fallback prices for Binance
      if (priceData.broker === 'binance') {
        console.warn(`⚠️ Invalid price for ${pair} on Binance, using fallback price`);
        const fallbackPrice = getFallbackPrice(pair);
        if (fallbackPrice <= 0) {
          throw new Error(`Unable to get valid price for ${pair}. Please try again.`);
        }
        priceData.price = fallbackPrice;
        priceData.source = 'FALLBACK';
      } else {
        throw new Error(`Broker ${priceData.broker} is not supported. Only Binance is available.`);
      }
    }
    
    // Step 2: Generate OHLC data for pattern analysis (enhanced with current price)
    const ohlcData = generateOHLCData(priceData.price, 50, timeframe);
    
    // Step 3: PRIORITY - Candlestick Pattern Analysis (Higher Weight)
    const patternAnalysis = performPatternAnalysis(ohlcData, timeframe, priceData.price);
    console.log(`📊 Detected ${patternAnalysis.detectedPatterns.length} candlestick patterns`);
    
    // Step 4: Filter and analyze selected indicators with fallback
    const activeIndicators = technicalIndicators.filter(ind => 
      selectedIndicators.includes(ind.id)
    );
    
    // Ensure we have at least some indicators for analysis
    if (activeIndicators.length === 0 && selectedIndicators.length > 0) {
      console.warn('⚠️ No matching indicators found, using default indicators');
      // Add some default indicators
      const defaultIndicators = technicalIndicators.slice(0, 3);
      activeIndicators.push(...defaultIndicators);
    }
    
    // Step 5: Filter and analyze selected strategies with fallback
    const activeStrategies = tradingStrategies.filter(strat => 
      selectedStrategies.includes(strat.id)
    );
    
    // Ensure we have at least some strategies for analysis
    if (activeStrategies.length === 0 && selectedStrategies.length > 0) {
      console.warn('⚠️ No matching strategies found, using default strategies');
      const defaultStrategies = tradingStrategies.slice(0, 2);
      activeStrategies.push(...defaultStrategies);
    }
    
    // Step 6: Comprehensive News Analysis with Real-time Relevance
    const newsAnalysis = analyzeComprehensiveNewsImpact(pair, priceData.price, patternAnalysis);
    
    // Step 7: WEIGHTED SENTIMENT CALCULATION (Patterns get highest priority)
    const { sentiment, confidence } = calculateWeightedSentiment(
      patternAnalysis,
      activeIndicators, 
      activeStrategies,
      newsAnalysis
    );
    
    // Step 8: Strategic Price Level Calculations
    const strategicLevels = calculateStrategicPriceLevels(
      priceData.price, 
      sentiment, 
      patternAnalysis, 
      newsAnalysis,
      timeframe
    );
    
    // Step 9: Generate Comprehensive Trading Recommendation
    const recommendation = generateTradingRecommendation(
      sentiment,
      confidence,
      patternAnalysis,
      newsAnalysis,
      activeIndicators,
      activeStrategies,
      strategicLevels,
      priceData.price
    );

    console.log(`✅ Analysis complete: ${sentiment} sentiment with ${confidence}% confidence`);
    console.log(`🎯 Recommendation: ${recommendation.action} at ${recommendation.entryPrice.toFixed(4)}`);

    return {
      pair,
      broker,
      timeframe,
      tradeType,
      overallSentiment: sentiment,
      confidence,
      recommendation: recommendation.action,
      recommendedEntryPrice: recommendation.entryPrice,
      profitTarget: recommendation.profitTarget,
      stopLoss: recommendation.stopLoss,
      riskRewardRatio: recommendation.riskRewardRatio,
      newsImpact: newsAnalysis.impact,
      explanation: recommendation.explanation,
      newsAnalysis: newsAnalysis.analysis,
      upcomingEvents: newsAnalysis.upcomingEvents,
      entryPrice: strategicLevels.entryPrice,
      targetPrice: strategicLevels.targetPrice,
      supportLevel: strategicLevels.supportLevel,
      resistanceLevel: strategicLevels.resistanceLevel,
      indicators: activeIndicators,
      strategies: activeStrategies,
      priceSource: priceData.source,
      priceTimestamp: priceData.timestamp,
      // Enhanced pattern analysis results
      patternAnalysis,
      candlestickPatterns: patternAnalysis.detectedPatterns,
      trendAnalysis: patternAnalysis.trendAnalysis,
      patternConfirmation: patternAnalysis.patternConfirmation,
      optionsRecommendations: patternAnalysis.optionsRecommendations || []
    };
  } catch (error) {
    console.error(`❌ Analysis failed for ${pair}:`, error);
    
    // Only create fallback analysis for Binance
    if (broker === 'binance') {
      const fallbackPrice = getFallbackPrice(pair);
      const basicOHLC = generateOHLCData(fallbackPrice, 20, timeframe);
      const basicPattern = performPatternAnalysis(basicOHLC, timeframe, fallbackPrice);
      
      return {
        pair,
        broker,
        timeframe,
        tradeType,
        overallSentiment: 'NEUTRAL',
        confidence: 50,
        recommendation: 'HOLD',
        recommendedEntryPrice: fallbackPrice,
        profitTarget: fallbackPrice * 1.05,
        stopLoss: fallbackPrice * 0.97,
        riskRewardRatio: 1.5,
        newsImpact: 'LOW',
        explanation: `⚠️ **LIMITED ANALYSIS** (Fallback Mode - Binance Only)\n\nAnalysis completed with limited data due to connection issues.\n\n**Current Status:**\n• Using fallback price data\n• Basic pattern analysis only\n• Conservative HOLD recommendation\n\n**Recommendation:** Monitor for better signal confirmation when market data is available.`,
        newsAnalysis: 'Limited news analysis due to data availability',
        upcomingEvents: [],
        entryPrice: fallbackPrice,
        targetPrice: fallbackPrice * 1.05,
        supportLevel: fallbackPrice * 0.95,
        resistanceLevel: fallbackPrice * 1.05,
        indicators: technicalIndicators.slice(0, 3),
        strategies: tradingStrategies.slice(0, 2),
        priceSource: 'FALLBACK',
        priceTimestamp: Date.now(),
        patternAnalysis: basicPattern,
        candlestickPatterns: basicPattern.detectedPatterns,
        trendAnalysis: basicPattern.trendAnalysis,
        patternConfirmation: false,
        optionsRecommendations: []
      };
    } else {
          // Only Binance is supported
    throw new Error(`Analysis failed for ${pair} on ${broker}. Only Binance is supported.`);
    }
  }
};

// ENHANCED WEIGHTED SENTIMENT CALCULATION
// Candlestick patterns get 40% weight, indicators 30%, strategies 20%, news 10%
const calculateWeightedSentiment = (
  patternAnalysis: any,
  indicators: TechnicalIndicator[],
  strategies: TradingStrategy[],
  newsAnalysis: any
) => {
  let bullishScore = 0;
  let bearishScore = 0;
  let totalWeight = 0;
  
  // CANDLESTICK PATTERNS - HIGHEST PRIORITY (40% of total weight)
  const patternWeight = 40;
  if (patternAnalysis.detectedPatterns.length > 0) {
    let patternBullishScore = 0;
    let patternBearishScore = 0;
    let patternTotalWeight = 0;
    
    patternAnalysis.detectedPatterns.forEach(pattern => {
      const reliability = pattern.reliability === 'HIGH' ? 3 : pattern.reliability === 'MEDIUM' ? 2 : 1;
      const confidence = pattern.confidence / 100;
      const weight = reliability * confidence;
      
      patternTotalWeight += weight;
      
      if (pattern.type === 'BULLISH' || pattern.signal.includes('BUY')) {
        patternBullishScore += weight;
      } else if (pattern.type === 'BEARISH' || pattern.signal.includes('SELL')) {
        patternBearishScore += weight;
      }
    });
    
    // Add trend analysis to pattern score
    const trendWeight = 2;
    patternTotalWeight += trendWeight;
    
    if (patternAnalysis.trendAnalysis.direction === 'UPTREND') {
      patternBullishScore += trendWeight * (patternAnalysis.trendAnalysis.confidence / 100);
    } else if (patternAnalysis.trendAnalysis.direction === 'DOWNTREND') {
      patternBearishScore += trendWeight * (patternAnalysis.trendAnalysis.confidence / 100);
    }
    
    if (patternTotalWeight > 0) {
      bullishScore += (patternBullishScore / patternTotalWeight) * patternWeight;
      bearishScore += (patternBearishScore / patternTotalWeight) * patternWeight;
      totalWeight += patternWeight;
    }
  }
  
  // TECHNICAL INDICATORS - HIGH PRIORITY (30% of total weight)
  const indicatorWeight = 30;
  if (indicators.length > 0) {
    let indicatorBullishScore = 0;
    let indicatorBearishScore = 0;
    
    indicators.forEach(indicator => {
      const weight = 1; // Equal weight for all indicators
      
      switch (indicator.signal) {
        case 'BUY':
          indicatorBullishScore += weight;
          break;
        case 'SELL':
          indicatorBearishScore += weight;
          break;
      }
    });
    
    const indicatorTotal = indicators.length;
    if (indicatorTotal > 0) {
      bullishScore += (indicatorBullishScore / indicatorTotal) * indicatorWeight;
      bearishScore += (indicatorBearishScore / indicatorTotal) * indicatorWeight;
      totalWeight += indicatorWeight;
    }
  }
  
  // TRADING STRATEGIES - MEDIUM PRIORITY (20% of total weight)
  const strategyWeight = 20;
  if (strategies.length > 0) {
    let strategyBullishScore = 0;
    let strategyBearishScore = 0;
    
    strategies.forEach(strategy => {
      const weight = strategy.confidence / 100; // Weight by confidence
      
      switch (strategy.signal) {
        case 'STRONG_BUY':
          strategyBullishScore += weight * 1.5;
          break;
        case 'BUY':
          strategyBullishScore += weight;
          break;
        case 'SELL':
          strategyBearishScore += weight;
          break;
        case 'STRONG_SELL':
          strategyBearishScore += weight * 1.5;
          break;
      }
    });
    
    const strategyTotal = strategies.reduce((sum, s) => sum + s.confidence / 100, 0);
    if (strategyTotal > 0) {
      bullishScore += (strategyBullishScore / strategyTotal) * strategyWeight;
      bearishScore += (strategyBearishScore / strategyTotal) * strategyWeight;
      totalWeight += strategyWeight;
    }
  }
  
  // NEWS ANALYSIS - CONTEXTUAL PRIORITY (10% of total weight)
  const newsWeight = 10;
  if (newsAnalysis.impact !== 'LOW') {
    let newsScore = 0;
    
    if (newsAnalysis.analysis.includes('BULLISH')) {
      newsScore = newsAnalysis.impact === 'HIGH' ? 1 : 0.7;
      bullishScore += newsScore * newsWeight;
    } else if (newsAnalysis.analysis.includes('BEARISH')) {
      newsScore = newsAnalysis.impact === 'HIGH' ? 1 : 0.7;
      bearishScore += newsScore * newsWeight;
    }
    
    if (newsScore > 0) {
      totalWeight += newsWeight;
    }
  }
  
  // Calculate final sentiment
  let sentiment: AnalysisResult['overallSentiment'] = 'NEUTRAL';
  let confidence = 50;
  
  if (totalWeight > 0) {
    const netScore = (bullishScore - bearishScore) / totalWeight;
    
    // More refined thresholds based on weighted scoring
    if (netScore > 0.7) sentiment = 'STRONG_BULLISH';
    else if (netScore > 0.3) sentiment = 'BULLISH';
    else if (netScore < -0.7) sentiment = 'STRONG_BEARISH';
    else if (netScore < -0.3) sentiment = 'BEARISH';
    else sentiment = 'NEUTRAL';
    
    // Confidence based on signal strength and pattern confirmation
    confidence = Math.min(95, Math.max(55, Math.abs(netScore) * 100));
    
    // Boost confidence if patterns confirm trend
    if (patternAnalysis.patternConfirmation) {
      confidence = Math.min(95, confidence + 10);
    }
    
    // Reduce confidence if conflicting signals
    if (patternAnalysis.conflictingSignals) {
      confidence = Math.max(50, confidence - 15);
    }
  }
  
  return { sentiment, confidence: Math.round(confidence) };
};

// COMPREHENSIVE NEWS ANALYSIS WITH REAL-TIME MARKET RELEVANCE
const analyzeComprehensiveNewsImpact = (pair: string, currentPrice: number, patternAnalysis: any) => {
  const [baseCurrency] = pair.split('/');
  const scanTimestamp = new Date().toISOString();

  console.log(`📰 Analyzing news impact for ${pair} with ${cryptoNews.length} sources...`);

  // Find highly relevant news for this specific pair
  const pairSpecificNews = cryptoNews.filter(news =>
    news.relevantPairs.some(newsPair =>
      newsPair.toLowerCase().includes(baseCurrency.toLowerCase()) || 
      newsPair.toLowerCase() === pair.toLowerCase()
    )
  );

  // Find general market-moving news
  const marketMovingNews = cryptoNews.filter(news =>
    news.title.toLowerCase().includes('bitcoin') ||
    news.title.toLowerCase().includes('ethereum') ||
    news.title.toLowerCase().includes('fed') ||
    news.title.toLowerCase().includes('sec') ||
    news.title.toLowerCase().includes('regulation') ||
    news.title.toLowerCase().includes('etf') ||
    news.title.toLowerCase().includes('institutional') ||
    news.impact === 'HIGH'
  );

  // Combine and deduplicate news
  const allRelevantNews = [...pairSpecificNews];
  marketMovingNews.forEach(generalNews => {
    if (!allRelevantNews.find(news => news.id === generalNews.id)) {
      allRelevantNews.push(generalNews);
    }
  });

  // Sort by relevance and recency
  allRelevantNews.sort((a, b) => {
    // Prioritize pair-specific news
    const aIsPairSpecific = pairSpecificNews.includes(a) ? 2 : 1;
    const bIsPairSpecific = pairSpecificNews.includes(b) ? 2 : 1;
    
    if (aIsPairSpecific !== bIsPairSpecific) {
      return bIsPairSpecific - aIsPairSpecific;
    }
    
    // Then by impact level
    const impactScore = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const aImpactScore = impactScore[a.impact];
    const bImpactScore = impactScore[b.impact];
    
    if (aImpactScore !== bImpactScore) {
      return bImpactScore - aImpactScore;
    }
    
    // Finally by timestamp (newest first)
    return b.timestamp - a.timestamp;
  });

  if (allRelevantNews.length === 0) {
    return {
      impact: 'LOW' as const,
      analysis: `📊 REAL-TIME NEWS ANALYSIS (${scanTimestamp})\n\n❌ No significant news found for ${pair}. Analysis based purely on technical patterns and indicators.\n\n🔍 Searched ${cryptoNews.length} news sources\n📅 Scan Time: ${new Date().toLocaleString()}`,
      upcomingEvents: []
    };
  }

  // Enhanced sentiment analysis with pattern correlation
  const positiveNews = allRelevantNews.filter(news => news.sentiment === 'POSITIVE');
  const negativeNews = allRelevantNews.filter(news => news.sentiment === 'NEGATIVE');
  const neutralNews = allRelevantNews.filter(news => news.sentiment === 'NEUTRAL');
  const highImpactNews = allRelevantNews.filter(news => news.impact === 'HIGH');
  const mediumImpactNews = allRelevantNews.filter(news => news.impact === 'MEDIUM');

  // Determine impact level with pattern consideration
  let impact: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  
  // Boost impact if news aligns with pattern signals
  const patternIsBullish = patternAnalysis.overallSignal.includes('BUY');
  const patternIsBearish = patternAnalysis.overallSignal.includes('SELL');
  const newsIsBullish = positiveNews.length > negativeNews.length;
  const newsIsBearish = negativeNews.length > positiveNews.length;
  
  const newsPatternAlignment = (patternIsBullish && newsIsBullish) || (patternIsBearish && newsIsBearish);
  
  if (highImpactNews.length >= 2 || (highImpactNews.length >= 1 && newsPatternAlignment)) {
    impact = 'HIGH';
  } else if (highImpactNews.length > 0 || mediumImpactNews.length >= 3 || (mediumImpactNews.length >= 2 && newsPatternAlignment)) {
    impact = 'MEDIUM';
  } else if (allRelevantNews.length >= 5 || newsPatternAlignment) {
    impact = 'MEDIUM';
  }

  // Generate comprehensive analysis
  let analysis = `📊 COMPREHENSIVE NEWS MARKET ANALYSIS\n`;
  analysis += `🕐 Real-time Scan: ${new Date().toLocaleString()}\n`;
  analysis += `💱 Pair Focus: ${pair} (${baseCurrency} analysis)\n`;
  analysis += `📈 Total Sources: ${cryptoNews.length} | Relevant: ${allRelevantNews.length}\n`;
  analysis += `🎯 Pair-Specific News: ${pairSpecificNews.length}\n\n`;

  // Pattern-News Correlation Analysis
  analysis += `🔗 PATTERN-NEWS CORRELATION:\n`;
  if (newsPatternAlignment) {
    analysis += `✅ NEWS CONFIRMS TECHNICAL PATTERNS: ${patternAnalysis.overallSignal.replace('_', ' ')} signal supported by ${newsIsBullish ? 'positive' : 'negative'} news sentiment\n`;
  } else if ((patternIsBullish && newsIsBearish) || (patternIsBearish && newsIsBullish)) {
    analysis += `⚠️ CONFLICTING SIGNALS: Technical patterns suggest ${patternAnalysis.overallSignal.replace('_', ' ')} while news sentiment is ${newsIsBullish ? 'bullish' : 'bearish'}\n`;
  } else {
    analysis += `🔄 MIXED SIGNALS: Patterns show ${patternAnalysis.overallSignal.replace('_', ' ')}, news sentiment neutral/mixed\n`;
  }
  analysis += `\n`;

  analysis += `📊 SENTIMENT BREAKDOWN:\n`;
  analysis += `🟢 Positive: ${positiveNews.length} (${((positiveNews.length / allRelevantNews.length) * 100).toFixed(1)}%)\n`;
  analysis += `🔴 Negative: ${negativeNews.length} (${((negativeNews.length / allRelevantNews.length) * 100).toFixed(1)}%)\n`;
  analysis += `🟡 Neutral: ${neutralNews.length} (${((neutralNews.length / allRelevantNews.length) * 100).toFixed(1)}%)\n\n`;

  analysis += `📈 IMPACT ANALYSIS:\n`;
  analysis += `🚨 High Impact: ${highImpactNews.length}\n`;
  analysis += `⚠️ Medium Impact: ${mediumImpactNews.length}\n`;
  analysis += `ℹ️ Low Impact: ${allRelevantNews.filter(n => n.impact === 'LOW').length}\n\n`;

  // Market sentiment determination
  if (positiveNews.length > negativeNews.length + 1) {
    analysis += `📈 OVERALL BULLISH NEWS ENVIRONMENT: Strong positive sentiment (${positiveNews.length} vs ${negativeNews.length})\n`;
    if (newsPatternAlignment) analysis += `🎯 Technical patterns CONFIRM bullish news bias\n`;
  } else if (negativeNews.length > positiveNews.length + 1) {
    analysis += `📉 OVERALL BEARISH NEWS ENVIRONMENT: Strong negative sentiment (${negativeNews.length} vs ${positiveNews.length})\n`;
    if (newsPatternAlignment) analysis += `🎯 Technical patterns CONFIRM bearish news bias\n`;
  } else {
    analysis += `⚖️ BALANCED NEWS ENVIRONMENT: Mixed sentiment creating market uncertainty\n`;
  }
  analysis += `\n`;

  // Top news items with enhanced relevance scoring
  analysis += `🗞️ KEY MARKET-MOVING NEWS:\n\n`;
  const topNews = allRelevantNews.slice(0, 5);
  
  topNews.forEach((news, index) => {
    const emoji = news.sentiment === 'POSITIVE' ? '🟢' : news.sentiment === 'NEGATIVE' ? '🔴' : '🟡';
    const isPairSpecific = pairSpecificNews.includes(news);
    const relevanceTag = isPairSpecific ? '[PAIR-SPECIFIC]' : '[MARKET-WIDE]';
    const timeAgo = Math.floor((Date.now() - news.timestamp) / (1000 * 60 * 60));
    
    analysis += `${emoji} ${relevanceTag} [${news.impact}] ${news.title}\n`;
    analysis += `📝 ${news.summary}\n`;
    analysis += `📰 ${news.source} | 📅 ${timeAgo}h ago\n`;
    if (isPairSpecific) analysis += `💱 Direct impact on ${news.relevantPairs.join(', ')}\n`;
    analysis += `\n`;
  });

  // Upcoming catalysts and events
  const upcomingEvents: string[] = [];
  
  if (allRelevantNews.some(news => news.title.toLowerCase().includes('etf'))) {
    upcomingEvents.push('🏛️ ETF decisions and institutional adoption trends');
  }
  if (allRelevantNews.some(news => news.title.toLowerCase().includes('sec') || news.title.toLowerCase().includes('regulation'))) {
    upcomingEvents.push('⚖️ Regulatory developments and compliance updates');
  }
  if (allRelevantNews.some(news => news.title.toLowerCase().includes('fed') || news.title.toLowerCase().includes('rate'))) {
    upcomingEvents.push('🏦 Federal Reserve decisions affecting crypto market sentiment');
  }
  if (allRelevantNews.some(news => news.title.toLowerCase().includes('upgrade') || news.title.toLowerCase().includes('launch'))) {
    upcomingEvents.push('🔧 Protocol upgrades and new product launches');
  }
  if (allRelevantNews.some(news => news.title.toLowerCase().includes('institutional'))) {
    upcomingEvents.push('🏢 Institutional adoption and corporate treasury decisions');
  }

  analysis += `🔮 UPCOMING MARKET CATALYSTS:\n`;
  if (upcomingEvents.length > 0) {
    upcomingEvents.forEach(event => analysis += `• ${event}\n`);
  } else {
    analysis += `• No major catalysts identified from current news flow\n`;
  }

  analysis += `\n📊 Analysis includes real-time correlation with technical patterns\n`;
  analysis += `⏰ Next scan will incorporate new developments and price action\n`;

  return {
    impact,
    analysis,
    upcomingEvents
  };
};

// STRATEGIC PRICE LEVEL CALCULATIONS
const calculateStrategicPriceLevels = (
  currentPrice: number, 
  sentiment: string, 
  patternAnalysis: any, 
  newsAnalysis: any,
  timeframe: string
) => {
  console.log(`💰 Calculating strategic price levels for ${sentiment} sentiment...`);
  
  // Base volatility adjusted by timeframe
  const timeframeMultipliers = {
    '1m': 0.002, '5m': 0.005, '15m': 0.008, '30m': 0.012,
    '1h': 0.015, '4h': 0.025, '1d': 0.035, '1w': 0.055
  };
  const baseVolatility = timeframeMultipliers[timeframe] || 0.035;
  
  // Adjust volatility based on news impact and pattern strength
  let adjustedVolatility = baseVolatility;
  
  if (newsAnalysis.impact === 'HIGH') adjustedVolatility *= 1.5;
  else if (newsAnalysis.impact === 'MEDIUM') adjustedVolatility *= 1.25;
  
  if (patternAnalysis.detectedPatterns.length > 2) adjustedVolatility *= 1.2;
  if (patternAnalysis.patternConfirmation) adjustedVolatility *= 1.1;
  
  // Calculate strategic levels based on sentiment and analysis
  let entryMultiplier = 1;
  let targetMultiplier = 1;
  let stopMultiplier = 1;
  
  // Enhanced multipliers based on comprehensive analysis
  switch (sentiment) {
    case 'STRONG_BULLISH':
      entryMultiplier = 1.008; // Enter slightly above current
      targetMultiplier = 1.15; // 15% target
      stopMultiplier = 0.93;   // 7% stop
      break;
    case 'BULLISH':
      entryMultiplier = 1.005;
      targetMultiplier = 1.10; // 10% target
      stopMultiplier = 0.95;   // 5% stop
      break;
    case 'BEARISH':
      entryMultiplier = 0.995;
      targetMultiplier = 0.90; // 10% target (short)
      stopMultiplier = 1.05;   // 5% stop
      break;
    case 'STRONG_BEARISH':
      entryMultiplier = 0.992;
      targetMultiplier = 0.85; // 15% target (short)
      stopMultiplier = 1.07;   // 7% stop
      break;
    default: // NEUTRAL
      entryMultiplier = 1.000;
      targetMultiplier = 1.05; // 5% conservative target
      stopMultiplier = 0.97;   // 3% stop
      break;
  }
  
  // Use trend analysis for support/resistance
  const supportLevel = patternAnalysis.trendAnalysis.supportLevel || currentPrice * (1 - adjustedVolatility);
  const resistanceLevel = patternAnalysis.trendAnalysis.resistanceLevel || currentPrice * (1 + adjustedVolatility);
  
  return {
    entryPrice: currentPrice * entryMultiplier,
    targetPrice: currentPrice * targetMultiplier,
    supportLevel,
    resistanceLevel
  };
};

// COMPREHENSIVE TRADING RECOMMENDATION GENERATOR
const generateTradingRecommendation = (
  sentiment: string,
  confidence: number,
  patternAnalysis: any,
  newsAnalysis: any,
  indicators: TechnicalIndicator[],
  strategies: TradingStrategy[],
  strategicLevels: any,
  currentPrice: number
) => {
  console.log(`🎯 Generating trading recommendation for ${sentiment} sentiment...`);
  
  let action: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL' = 'HOLD';
  
  // Enhanced decision logic with pattern priority
  const patternSignal = patternAnalysis.overallSignal;
  const hasStrongPatterns = patternAnalysis.detectedPatterns.some(p => p.reliability === 'HIGH');
  const trendStrength = patternAnalysis.trendAnalysis.strength;
  
  // Pattern-driven decisions (highest priority)
  if (patternSignal === 'STRONG_BUY' && confidence > 75 && hasStrongPatterns) {
    action = 'STRONG_BUY';
  } else if (patternSignal === 'BUY' && confidence > 65) {
    action = 'BUY';
  } else if (patternSignal === 'STRONG_SELL' && confidence > 75 && hasStrongPatterns) {
    action = 'STRONG_SELL';
  } else if (patternSignal === 'SELL' && confidence > 65) {
    action = 'SELL';
  } else if (sentiment === 'STRONG_BULLISH' && confidence > 80) {
    action = 'STRONG_BUY';
  } else if (sentiment === 'BULLISH' && confidence > 70) {
    action = 'BUY';
  } else if (sentiment === 'STRONG_BEARISH' && confidence > 80) {
    action = 'STRONG_SELL';
  } else if (sentiment === 'BEARISH' && confidence > 70) {
    action = 'SELL';
  }
  
  // News impact adjustments
  if (newsAnalysis.impact === 'HIGH' && confidence > 60) {
    if (newsAnalysis.analysis.includes('BULLISH') && !action.includes('SELL')) {
      action = action === 'BUY' ? 'STRONG_BUY' : 'BUY';
    } else if (newsAnalysis.analysis.includes('BEARISH') && !action.includes('BUY')) {
      action = action === 'SELL' ? 'STRONG_SELL' : 'SELL';
    }
  }
  
  // Calculate strategic prices
  const entryPrice = strategicLevels.entryPrice;
  let profitTarget = strategicLevels.targetPrice;
  let stopLoss = currentPrice;
  let riskRewardRatio = 1;
  
  // Action-specific price calculations
  switch (action) {
    case 'STRONG_BUY':
      profitTarget = currentPrice * 1.18; // 18% target
      stopLoss = currentPrice * 0.93;     // 7% stop
      riskRewardRatio = 2.5;
      break;
    case 'BUY':
      profitTarget = currentPrice * 1.12; // 12% target
      stopLoss = currentPrice * 0.95;     // 5% stop
      riskRewardRatio = 2.4;
      break;
    case 'HOLD':
      profitTarget = currentPrice * 1.06; // 6% target
      stopLoss = currentPrice * 0.96;     // 4% stop
      riskRewardRatio = 1.5;
      break;
    case 'SELL':
      profitTarget = currentPrice * 0.88; // 12% profit on short
      stopLoss = currentPrice * 1.05;     // 5% stop
      riskRewardRatio = 2.4;
      break;
    case 'STRONG_SELL':
      profitTarget = currentPrice * 0.82; // 18% profit on short
      stopLoss = currentPrice * 1.07;     // 7% stop
      riskRewardRatio = 2.5;
      break;
  }
  
  // Generate comprehensive explanation
  let explanation = `🎯 **${action} RECOMMENDATION** (${confidence}% confidence)\n\n`;
  
  explanation += `**🔬 COMPREHENSIVE ANALYSIS SUMMARY:**\n`;
  explanation += `• Market Sentiment: ${sentiment.replace('_', ' ')}\n`;
  explanation += `• Pattern Signal: ${patternSignal.replace('_', ' ')}\n`;
  explanation += `• Detected Patterns: ${patternAnalysis.detectedPatterns.length}\n`;
  explanation += `• Trend Direction: ${patternAnalysis.trendAnalysis.direction} (${patternAnalysis.trendAnalysis.strength})\n`;
  explanation += `• News Impact: ${newsAnalysis.impact}\n`;
  explanation += `• Active Indicators: ${indicators.length}\n`;
  explanation += `• Active Strategies: ${strategies.length}\n\n`;
  
  // Pattern analysis highlights
  if (patternAnalysis.detectedPatterns.length > 0) {
    explanation += `**🕯️ CANDLESTICK PATTERN ANALYSIS (Priority Signal):**\n`;
    const topPatterns = patternAnalysis.detectedPatterns
      .filter(p => p.reliability === 'HIGH' || p.confidence > 75)
      .slice(0, 3);
    
    if (topPatterns.length > 0) {
      topPatterns.forEach(pattern => {
        explanation += `• ${pattern.name}: ${pattern.type} signal (${pattern.confidence}% confidence, ${pattern.reliability} reliability)\n`;
      });
      explanation += `• Pattern Confirmation: ${patternAnalysis.patternConfirmation ? '✅ Confirmed with trend' : '⚠️ Mixed signals'}\n`;
    }
    explanation += `\n`;
  }
  
  // News correlation
  explanation += `**📰 NEWS-TECHNICAL CORRELATION:**\n`;
  if (newsAnalysis.analysis.includes('CONFIRMS')) {
    explanation += `• ✅ News sentiment CONFIRMS technical patterns\n`;
  } else if (newsAnalysis.analysis.includes('CONFLICTING')) {
    explanation += `• ⚠️ News sentiment conflicts with technical signals\n`;
  } else {
    explanation += `• 🔄 News sentiment neutral/mixed with technical analysis\n`;
  }
  explanation += `• ${newsAnalysis.analysis.split('\n')[0]}\n\n`;
  
  // Key reasoning based on action
  explanation += `**🎯 KEY REASONING:**\n`;
  if (action.includes('BUY')) {
    explanation += `• 📈 Strong bullish confluence across multiple timeframes\n`;
    explanation += `• 🎯 High-probability upward momentum confirmed\n`;
    if (patternAnalysis.patternConfirmation) {
      explanation += `• 🕯️ Candlestick patterns confirm bullish bias\n`;
    }
    if (hasStrongPatterns) {
      explanation += `• ⭐ High-reliability patterns detected\n`;
    }
    if (newsAnalysis.impact === 'HIGH' && newsAnalysis.analysis.includes('BULLISH')) {
      explanation += `• 📰 Positive news catalyst supporting upward move\n`;
    }
  } else if (action.includes('SELL')) {
    explanation += `• 📉 Strong bearish confluence across multiple indicators\n`;
    explanation += `• ⚠️ High-probability downward pressure identified\n`;
    if (patternAnalysis.patternConfirmation) {
      explanation += `• 🕯️ Candlestick patterns confirm bearish bias\n`;
    }
    if (hasStrongPatterns) {
      explanation += `• ⭐ High-reliability reversal patterns detected\n`;
    }
    if (newsAnalysis.impact === 'HIGH' && newsAnalysis.analysis.includes('BEARISH')) {
      explanation += `• 📰 Negative news creating downward pressure\n`;
    }
  } else {
    explanation += `• ⚖️ Mixed signals requiring cautious approach\n`;
    explanation += `• 🔄 Market in consolidation/decision phase\n`;
    explanation += `• ⏳ Waiting for clearer directional confirmation\n`;
  }
  
  explanation += `• 💎 Optimal risk-reward ratio: ${riskRewardRatio}:1\n\n`;
  
  // Strategic price levels
  explanation += `**💰 STRATEGIC TRADING LEVELS:**\n`;
  explanation += `• Entry Price: $${entryPrice.toFixed(6)}\n`;
  explanation += `• Profit Target: $${profitTarget.toFixed(6)}\n`;
  explanation += `• Stop Loss: $${stopLoss.toFixed(6)}\n`;
  explanation += `• Support Level: $${strategicLevels.supportLevel.toFixed(6)}\n`;
  explanation += `• Resistance Level: $${strategicLevels.resistanceLevel.toFixed(6)}\n\n`;
  
  // Risk management
  explanation += `**🛡️ RISK MANAGEMENT:**\n`;
  explanation += `• Position Size: Conservative (2-5% of portfolio)\n`;
  explanation += `• Risk per Trade: Maximum 1-2% account risk\n`;
  explanation += `• Time Horizon: Short to medium term\n`;
  if (action === 'HOLD') {
    explanation += `• Strategy: Monitor for breakout signals\n`;
    explanation += `• Watch for: Break above $${strategicLevels.resistanceLevel.toFixed(4)} (bullish) or below $${strategicLevels.supportLevel.toFixed(4)} (bearish)\n`;
  }
  
  return {
    action,
    entryPrice,
    profitTarget,
    stopLoss,
    riskRewardRatio,
    explanation
  };
};

// EXISTING HELPER FUNCTIONS (keeping the same)
const getCurrentPrice = async (pair: string, broker: string): Promise<{price: number, source: 'LIVE_API' | 'FALLBACK', timestamp: number}> => {
  try {
    console.log(`🔍 Fetching LIVE price for ${pair} from ${broker.toUpperCase()}...`);
    const realPrice = await getPairPrice(broker, pair);
    
    if (realPrice && realPrice > 0) {
      console.log(`✅ LIVE price: $${realPrice.toFixed(6)}`);
      return {
        price: realPrice,
        source: 'LIVE_API',
        timestamp: Date.now()
      };
    }
  } catch (error) {
    console.error(`❌ Error fetching LIVE price:`, error);
  }

  // Only allow fallback prices for Binance
  if (broker === 'binance') {
    console.log(`🔄 Using fallback price for ${pair} on Binance`);
    return {
      price: getFallbackPrice(pair),
      source: 'FALLBACK',
      timestamp: Date.now()
    };
  } else {
    throw new Error(`Broker ${broker} is not supported. Only Binance is available.`);
  }
};
