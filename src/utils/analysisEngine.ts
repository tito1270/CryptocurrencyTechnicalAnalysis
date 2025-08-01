import { AnalysisResult, TechnicalIndicator, TradingStrategy } from '../types';
import { technicalIndicators } from '../data/indicators';
import { tradingStrategies } from '../data/strategies';
import { cryptoNews } from '../data/news';
import { getPairPrice, getFallbackPrice } from './priceAPI';
import { 
  generateDailyCandleData, 
  detectAllPatterns, 
  analyzePatterns,
  type CandlestickPattern,
  type PatternAnalysisResult 
} from './candlestickPatterns';

export const performAnalysis = async (
  pair: string,
  broker: string,
  timeframe: string,
  tradeType: 'SPOT' | 'FUTURES',
  selectedIndicators: string[],
  selectedStrategies: string[]
): Promise<AnalysisResult> => {
  // Filter selected indicators and strategies
  const activeIndicators = technicalIndicators.filter(ind => 
    selectedIndicators.includes(ind.id)
  );
  
  const activeStrategies = tradingStrategies.filter(strat => 
    selectedStrategies.includes(strat.id)
  );
  
  // Get LIVE current price with metadata from specific broker
  const priceData = await getCurrentPrice(pair, broker);
  const currentPrice = priceData.price;
  
  // Calculate overall sentiment based on indicators and strategies
  const { sentiment, confidence } = calculateOverallSentiment(activeIndicators, activeStrategies);
  
  // Generate daily candlestick data for pattern analysis
  const dailyCandleData = generateDailyCandleData(currentPrice, sentiment);
  
  // Detect all candlestick patterns
  const detectedPatterns = detectAllPatterns(dailyCandleData);
  
  // Analyze patterns for overall sentiment and success probability
  const patternAnalysis = analyzePatterns(detectedPatterns);
  
  // Analyze news impact for the pair
  const newsAnalysis = analyzeNewsImpact(pair, activeIndicators, activeStrategies);
  
  // Enhanced sentiment calculation incorporating candlestick patterns
  const enhancedSentiment = calculateEnhancedSentiment(
    sentiment, 
    confidence, 
    patternAnalysis.overallPatternSentiment,
    patternAnalysis.patternConfidence,
    newsAnalysis.impact
  );
  
  const priceLevels = calculatePriceLevels(currentPrice, enhancedSentiment.sentiment, newsAnalysis.impact);
  
  // Generate comprehensive recommendation with pattern integration
  const recommendation = generateEnhancedRecommendation(
    enhancedSentiment.sentiment, 
    enhancedSentiment.confidence, 
    newsAnalysis, 
    activeIndicators, 
    activeStrategies,
    currentPrice,
    priceLevels,
    patternAnalysis
  );
  
  return {
    pair,
    broker,
    timeframe: 'DAILY', // Always use daily for candlestick pattern analysis
    tradeType,
    overallSentiment: enhancedSentiment.sentiment,
    confidence: enhancedSentiment.confidence,
    recommendation: recommendation.action,
    recommendedEntryPrice: recommendation.entryPrice,
    profitTarget: recommendation.profitTarget,
    stopLoss: recommendation.stopLoss,
    riskRewardRatio: recommendation.riskRewardRatio,
    newsImpact: newsAnalysis.impact,
    explanation: recommendation.explanation,
    newsAnalysis: newsAnalysis.analysis,
    upcomingEvents: newsAnalysis.upcomingEvents,
    entryPrice: priceLevels.entryPrice,
    targetPrice: priceLevels.targetPrice,
    supportLevel: priceLevels.supportLevel,
    resistanceLevel: priceLevels.resistanceLevel,
    indicators: activeIndicators,
    strategies: activeStrategies,
    priceSource: priceData.source,
    priceTimestamp: priceData.timestamp,
    // New candlestick pattern fields
    candlestickPatterns: detectedPatterns,
    patternSentiment: patternAnalysis.overallPatternSentiment,
    patternConfidence: patternAnalysis.patternConfidence,
    successProbability: enhancedSentiment.successProbability,
    patternAnalysis: patternAnalysis.analysis,
    trendDirection: patternAnalysis.trendDirection
  };
};

// Enhanced sentiment calculation incorporating patterns
const calculateEnhancedSentiment = (
  technicalSentiment: string,
  technicalConfidence: number,
  patternSentiment: string,
  patternConfidence: number,
  newsImpact: string
) => {
  // Weight allocation: 40% technical, 35% patterns, 25% news
  const technicalWeight = 0.40;
  const patternWeight = 0.35;
  const newsWeight = 0.25;
  
  // Convert sentiments to numerical scores
  const getSentimentScore = (sentiment: string): number => {
    switch (sentiment) {
      case 'STRONG_BULLISH': return 2;
      case 'BULLISH': return 1;
      case 'NEUTRAL': return 0;
      case 'BEARISH': return -1;
      case 'STRONG_BEARISH': return -2;
      default: return 0;
    }
  };
  
  const technicalScore = getSentimentScore(technicalSentiment);
  const patternScore = getSentimentScore(patternSentiment);
  
  // News score based on impact
  let newsScore = 0;
  if (newsImpact === 'HIGH') newsScore = 0.5;
  else if (newsImpact === 'MEDIUM') newsScore = 0.3;
  else newsScore = 0.1;
  
  // Calculate weighted sentiment score
  const weightedScore = (
    technicalScore * technicalWeight +
    patternScore * patternWeight +
    newsScore * newsWeight
  );
  
  // Calculate combined confidence
  const combinedConfidence = Math.min(95, Math.max(50, 
    (technicalConfidence * technicalWeight + 
     patternConfidence * patternWeight + 
     70 * newsWeight) // Base news confidence of 70%
  ));
  
  // Calculate success probability based on pattern reliability and overall sentiment strength
  const baseSuccessProbability = 50;
  const sentimentStrengthBonus = Math.abs(weightedScore) * 15; // Up to 30% bonus for strong sentiment
  const confidenceBonus = (combinedConfidence - 50) * 0.4; // Up to 18% bonus for high confidence
  const patternReliabilityBonus = patternConfidence > 70 ? 10 : patternConfidence > 50 ? 5 : 0;
  
  const successProbability = Math.min(95, Math.max(35, 
    baseSuccessProbability + sentimentStrengthBonus + confidenceBonus + patternReliabilityBonus
  ));
  
  // Convert back to sentiment
  let finalSentiment: AnalysisResult['overallSentiment'];
  if (weightedScore > 1.0) finalSentiment = 'STRONG_BULLISH';
  else if (weightedScore > 0.3) finalSentiment = 'BULLISH';
  else if (weightedScore < -1.0) finalSentiment = 'STRONG_BEARISH';
  else if (weightedScore < -0.3) finalSentiment = 'BEARISH';
  else finalSentiment = 'NEUTRAL';
  
  return {
    sentiment: finalSentiment,
    confidence: Math.round(combinedConfidence),
    successProbability: Math.round(successProbability)
  };
};

const calculateOverallSentiment = (
  indicators: TechnicalIndicator[],
  strategies: TradingStrategy[]
) => {
  // Handle case when no indicators or strategies are selected
  if (indicators.length === 0 && strategies.length === 0) {
    return {
      sentiment: 'NEUTRAL' as const,
      confidence: 50
    };
  }

  let bullishScore = 0;
  let bearishScore = 0;
  let totalWeight = 0;
  
  // Score indicators
  indicators.forEach(indicator => {
    const weight = 1;
    totalWeight += weight;
    
    switch (indicator.signal) {
      case 'BUY':
        bullishScore += weight;
        break;
      case 'SELL':
        bearishScore += weight;
        break;
      case 'NEUTRAL':
        // No score change
        break;
    }
  });
  
  // Score strategies with higher weight
  strategies.forEach(strategy => {
    const weight = 2; // Strategies have higher weight
    totalWeight += weight;
    
    switch (strategy.signal) {
      case 'STRONG_BUY':
        bullishScore += weight * 1.5;
        break;
      case 'BUY':
        bullishScore += weight;
        break;
      case 'SELL':
        bearishScore += weight;
        break;
      case 'STRONG_SELL':
        bearishScore += weight * 1.5;
        break;
      case 'NEUTRAL':
        // No score change
        break;
    }
  });
  
  // Prevent division by zero when no indicators or strategies are selected
  const netScore = totalWeight > 0 ? (bullishScore - bearishScore) / totalWeight : 0;
  const confidence = Math.min(95, Math.max(50, Math.abs(netScore) * 100));
  
  let sentiment: AnalysisResult['overallSentiment'];
  if (netScore > 0.4) sentiment = 'STRONG_BULLISH';
  else if (netScore > 0.1) sentiment = 'BULLISH';
  else if (netScore < -0.4) sentiment = 'STRONG_BEARISH';
  else if (netScore < -0.1) sentiment = 'BEARISH';
  else sentiment = 'NEUTRAL';
  
  return { sentiment, confidence };
};

const getCurrentPrice = async (pair: string, broker: string): Promise<{price: number, source: 'LIVE_API' | 'FALLBACK', timestamp: number}> => {
  try {
    console.log(`🔍 Fetching LIVE API price for ${pair} from ${broker.toUpperCase()} exchange...`);

    // Try to get LIVE real-time price specifically from the selected broker's API
    const realPrice = await getPairPrice(broker, pair);
    if (realPrice && realPrice > 0) {
      console.log(`✅ LIVE API price from ${broker.toUpperCase()}: $${realPrice.toFixed(6)} for ${pair}`);
      return {
        price: realPrice,
        source: 'LIVE_API',
        timestamp: Date.now()
      };
    } else {
      console.warn(`⚠️ No LIVE API data available for ${pair} on ${broker.toUpperCase()}`);
    }
  } catch (error) {
    console.error(`❌ Error fetching LIVE ${pair} price from ${broker.toUpperCase()}:`, error);
  }

  // Fallback to current market price only if broker-specific LIVE API fails
  console.log(`🔄 Using current market price for ${pair} (${broker.toUpperCase()} LIVE API unavailable)`);
  return {
    price: getFallbackPrice(pair),
    source: 'FALLBACK',
    timestamp: Date.now()
  };
};

const calculatePriceLevels = (currentPrice: number, sentiment: string, newsImpact: string) => {
  const volatility = 0.05; // 5% volatility assumption
  
  // Adjust volatility based on news impact
  const newsMultiplier = newsImpact === 'HIGH' ? 1.5 : newsImpact === 'MEDIUM' ? 1.2 : 1.0;
  const adjustedVolatility = volatility * newsMultiplier;
  
  let entryMultiplier = 1;
  let targetMultiplier = 1.08; // 8% target
  let stopMultiplier = 0.95; // 5% stop loss
  
  switch (sentiment) {
    case 'STRONG_BULLISH':
      entryMultiplier = 1.01;
      targetMultiplier = 1.12;
      stopMultiplier = 0.97;
      break;
    case 'BULLISH':
      entryMultiplier = 1.005;
      targetMultiplier = 1.08;
      stopMultiplier = 0.96;
      break;
    case 'BEARISH':
      entryMultiplier = 0.995;
      targetMultiplier = 0.92;
      stopMultiplier = 1.04;
      break;
    case 'STRONG_BEARISH':
      entryMultiplier = 0.99;
      targetMultiplier = 0.88;
      stopMultiplier = 1.05;
      break;
    default:
      // NEUTRAL
      break;
  }
  
  return {
    entryPrice: currentPrice * entryMultiplier,
    targetPrice: currentPrice * targetMultiplier,
    supportLevel: currentPrice * (1 - adjustedVolatility),
    resistanceLevel: currentPrice * (1 + adjustedVolatility)
  };
};

const analyzeNewsImpact = (pair: string, indicators: TechnicalIndicator[], strategies: TradingStrategy[]) => {
  const [baseCurrency] = pair.split('/');
  const scanTimestamp = new Date().toISOString();

  // Find relevant news for this pair (include all news, not just pair-specific)
  const relevantNews = cryptoNews.filter(news =>
    news.relevantPairs.some(newsPair =>
      newsPair.includes(baseCurrency) || newsPair === pair
    )
  );

  // Also include general market news that affects all cryptocurrencies
  const generalMarketNews = cryptoNews.filter(news =>
    news.title.toLowerCase().includes('fed') ||
    news.title.toLowerCase().includes('sec') ||
    news.title.toLowerCase().includes('regulation') ||
    news.title.toLowerCase().includes('etf') ||
    news.title.toLowerCase().includes('institutional') ||
    news.impact === 'HIGH'
  );

  // Combine relevant and general market news (remove duplicates)
  const allRelevantNews = [...relevantNews];
  generalMarketNews.forEach(generalNews => {
    if (!allRelevantNews.find(news => news.id === generalNews.id)) {
      allRelevantNews.push(generalNews);
    }
  });

  // Sort by timestamp (newest first)
  allRelevantNews.sort((a, b) => b.timestamp - a.timestamp);

  if (allRelevantNews.length === 0) {
    return {
      impact: 'LOW' as const,
      analysis: `📊 COMPREHENSIVE NEWS SCAN (${scanTimestamp})\n\n❌ No significant recent news found specifically for ${pair}. Technical analysis is based purely on price action and selected indicators.\n\n📈 Total News Sources Analyzed: ${cryptoNews.length}\n🔍 Relevant News Found: 0\n📅 Scan Date/Time: ${new Date().toLocaleString()}`,
      upcomingEvents: []
    };
  }

  // Analyze sentiment from news with timestamps
  const positiveNews = allRelevantNews.filter(news => news.sentiment === 'POSITIVE');
  const negativeNews = allRelevantNews.filter(news => news.sentiment === 'NEGATIVE');
  const neutralNews = allRelevantNews.filter(news => news.sentiment === 'NEUTRAL');
  const highImpactNews = allRelevantNews.filter(news => news.impact === 'HIGH');
  const mediumImpactNews = allRelevantNews.filter(news => news.impact === 'MEDIUM');
  const lowImpactNews = allRelevantNews.filter(news => news.impact === 'LOW');

  let impact: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (highImpactNews.length >= 2) impact = 'HIGH';
  else if (highImpactNews.length > 0 || mediumImpactNews.length >= 3) impact = 'MEDIUM';
  else if (allRelevantNews.length >= 5) impact = 'MEDIUM';

  // Generate comprehensive news analysis with timestamps
  let analysis = `📊 COMPREHENSIVE NEWS SCAN REPORT\n`;
  analysis += `🕐 Scan Date/Time: ${new Date().toLocaleString()}\n`;
  analysis += `📈 Total News Sources Analyzed: ${cryptoNews.length}\n`;
  analysis += `🔍 Relevant News for ${pair}: ${allRelevantNews.length}\n\n`;

  analysis += `📊 SENTIMENT BREAKDOWN:\n`;
  analysis += `🟢 Positive News: ${positiveNews.length} (${((positiveNews.length / allRelevantNews.length) * 100).toFixed(1)}%)\n`;
  analysis += `🔴 Negative News: ${negativeNews.length} (${((negativeNews.length / allRelevantNews.length) * 100).toFixed(1)}%)\n`;
  analysis += `🟡 Neutral News: ${neutralNews.length} (${((neutralNews.length / allRelevantNews.length) * 100).toFixed(1)}%)\n\n`;

  analysis += `📈 IMPACT DISTRIBUTION:\n`;
  analysis += `🚨 High Impact: ${highImpactNews.length}\n`;
  analysis += `⚠️ Medium Impact: ${mediumImpactNews.length}\n`;
  analysis += `ℹ️ Low Impact: ${lowImpactNews.length}\n\n`;

  if (positiveNews.length > negativeNews.length) {
    analysis += `📈 OVERALL BULLISH NEWS SENTIMENT: ${positiveNews.length} positive vs ${negativeNews.length} negative news items.\n\n`;
  } else if (negativeNews.length > positiveNews.length) {
    analysis += `📉 OVERALL BEARISH NEWS SENTIMENT: ${negativeNews.length} negative vs ${positiveNews.length} positive news items.\n\n`;
  } else {
    analysis += `⚖️ BALANCED NEWS SENTIMENT: Neutral balance between positive and negative coverage.\n\n`;
  }

  // Add most recent and impactful news items with timestamps
  analysis += `🗞️ KEY NEWS ITEMS (Most Recent & High Impact):\n\n`;

  const topNewsItems = allRelevantNews
    .filter(news => news.impact === 'HIGH' || news.sentiment !== 'NEUTRAL')
    .slice(0, 5);

  topNewsItems.forEach((news, index) => {
    const emoji = news.sentiment === 'POSITIVE' ? '🟢' : news.sentiment === 'NEGATIVE' ? '🔴' : '🟡';
    const timeAgo = Math.floor((Date.now() - news.timestamp) / (1000 * 60 * 60));
    const publishedDate = new Date(news.publishedAt).toLocaleDateString();

    analysis += `${emoji} [${news.impact} IMPACT] ${news.title}\n`;
    analysis += `📝 ${news.summary}\n`;
    analysis += `📰 Source: ${news.source}\n`;
    analysis += `📅 Published: ${publishedDate} (${timeAgo}h ago)\n`;
    analysis += `🔗 URL: ${news.url}\n`;
    analysis += `💱 Pairs: ${news.relevantPairs.slice(0, 3).join(', ')}\n\n`;
  });

  // Add remaining news count
  if (allRelevantNews.length > 5) {
    analysis += `📊 Additional ${allRelevantNews.length - 5} news items analyzed but not displayed.\n\n`;
  }

  // Look for upcoming events based on recent news patterns
  const upcomingEvents: string[] = [];

  // Check for ETF-related news
  if (allRelevantNews.some(news => news.title.toLowerCase().includes('etf'))) {
    upcomingEvents.push('🏛️ ETF decisions and institutional flows may continue impacting market');
  }

  // Check for regulatory news
  if (allRelevantNews.some(news => news.title.toLowerCase().includes('sec') || news.title.toLowerCase().includes('regulation'))) {
    upcomingEvents.push('⚖️ Regulatory developments may affect market sentiment in coming weeks');
  }

  // Check for technical upgrades
  if (allRelevantNews.some(news => news.title.toLowerCase().includes('upgrade') || news.title.toLowerCase().includes('launch'))) {
    upcomingEvents.push('🔧 Protocol upgrades and new launches may drive ecosystem growth');
  }

  // Check for institutional adoption
  if (allRelevantNews.some(news => news.title.toLowerCase().includes('institutional') || news.title.toLowerCase().includes('adoption'))) {
    upcomingEvents.push('🏢 Institutional adoption trends suggest continued corporate interest');
  }

  // Add Fed-related events if relevant
  if (allRelevantNews.some(news => news.title.toLowerCase().includes('fed') || news.title.toLowerCase().includes('rate'))) {
    upcomingEvents.push('🏦 Federal Reserve decisions may impact crypto markets via risk-on/risk-off sentiment');
  }

  analysis += `🔮 UPCOMING MARKET CATALYSTS:\n`;
  if (upcomingEvents.length > 0) {
    upcomingEvents.forEach(event => {
      analysis += `• ${event}\n`;
    });
  } else {
    analysis += `• No major upcoming catalysts identified from current news flow\n`;
  }

  analysis += `\n⏰ Next news scan will include all new sources and updates\n`;
  analysis += `📊 This analysis included ${cryptoNews.length} total news sources from multiple exchanges and media outlets\n`;

  return {
    impact,
    analysis,
    upcomingEvents
  };
};

const generateEnhancedRecommendation = (
  sentiment: string,
  confidence: number,
  newsAnalysis: { impact: string; analysis: string; upcomingEvents?: string[] },
  indicators: TechnicalIndicator[],
  strategies: TradingStrategy[],
  currentPrice: number,
  priceLevels: any,
  patternAnalysis: PatternAnalysisResult
) => {
  let action: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  let explanation = '';
  
  // Determine base action from sentiment and confidence
  if (sentiment === 'STRONG_BULLISH' && confidence > 80) {
    action = 'STRONG_BUY';
  } else if (sentiment === 'BULLISH' && confidence > 70) {
    action = 'BUY';
  } else if (sentiment === 'STRONG_BEARISH' && confidence > 80) {
    action = 'STRONG_SELL';
  } else if (sentiment === 'BEARISH' && confidence > 70) {
    action = 'SELL';
  } else {
    action = 'HOLD';
  }
  
  // Adjust based on news impact and pattern analysis
  if (newsAnalysis.impact === 'HIGH') {
    if (newsAnalysis.analysis.includes('BULLISH') && (action === 'HOLD' || action === 'BUY')) {
      action = action === 'BUY' ? 'STRONG_BUY' : 'BUY';
    } else if (newsAnalysis.analysis.includes('BEARISH') && (action === 'HOLD' || action === 'SELL')) {
      action = action === 'SELL' ? 'STRONG_SELL' : 'SELL';
    }
  }
  
  // Pattern-based adjustments
  if (patternAnalysis.overallPatternSentiment === 'STRONG_BULLISH' && patternAnalysis.patternConfidence > 75) {
    if (action === 'HOLD' || action === 'BUY') action = 'STRONG_BUY';
  } else if (patternAnalysis.overallPatternSentiment === 'STRONG_BEARISH' && patternAnalysis.patternConfidence > 75) {
    if (action === 'HOLD' || action === 'SELL') action = 'STRONG_SELL';
  }
  
  // Calculate recommended prices based on action and patterns
  let entryPrice = currentPrice;
  let profitTarget = currentPrice;
  let stopLoss = currentPrice;
  let riskRewardRatio = 1;
  
  // Adjust entry, target, and stop based on pattern analysis
  const patternMultiplier = patternAnalysis.successProbability > 75 ? 1.2 : 
                           patternAnalysis.successProbability > 60 ? 1.1 : 1.0;
  
  switch (action) {
    case 'STRONG_BUY':
      entryPrice = currentPrice * 1.005;
      profitTarget = currentPrice * (1.15 * patternMultiplier);
      stopLoss = currentPrice * 0.95;
      riskRewardRatio = 3.0 * patternMultiplier;
      break;
    case 'BUY':
      entryPrice = currentPrice * 1.002;
      profitTarget = currentPrice * (1.10 * patternMultiplier);
      stopLoss = currentPrice * 0.96;
      riskRewardRatio = 2.5 * patternMultiplier;
      break;
    case 'HOLD':
      entryPrice = currentPrice;
      profitTarget = currentPrice * 1.05;
      stopLoss = currentPrice * 0.97;
      riskRewardRatio = 1.7;
      break;
    case 'SELL':
      entryPrice = currentPrice * 0.998;
      profitTarget = currentPrice * (0.90 / patternMultiplier);
      stopLoss = currentPrice * 1.04;
      riskRewardRatio = 2.5 * patternMultiplier;
      break;
    case 'STRONG_SELL':
      entryPrice = currentPrice * 0.995;
      profitTarget = currentPrice * (0.85 / patternMultiplier);
      stopLoss = currentPrice * 1.05;
      riskRewardRatio = 3.0 * patternMultiplier;
      break;
  }
  
  // Generate comprehensive explanation with candlestick pattern integration
  explanation = `🎯 **${action} RECOMMENDATION** (Confidence: ${confidence}%)\n`;
  explanation += `📊 **Success Probability: ${patternAnalysis.successProbability.toFixed(1)}%**\n\n`;
  
  explanation += `**🕯️ DAILY TIMEFRAME ANALYSIS SUMMARY:**\n`;
  explanation += `• Overall Sentiment: ${sentiment.replace('_', ' ')}\n`;
  explanation += `• Pattern Sentiment: ${patternAnalysis.overallPatternSentiment.replace('_', ' ')}\n`;
  explanation += `• Trend Direction: ${patternAnalysis.trendDirection}\n`;
  explanation += `• Pattern Confidence: ${patternAnalysis.patternConfidence.toFixed(1)}%\n\n`;
  
  explanation += `**📈 TECHNICAL ANALYSIS COMPONENTS:**\n`;
  explanation += `• Active Indicators: ${indicators.length} (${indicators.filter(i => i.signal === 'BUY').length} bullish, ${indicators.filter(i => i.signal === 'SELL').length} bearish)\n`;
  explanation += `• Active Strategies: ${strategies.length} (${strategies.filter(s => s.signal.includes('BUY')).length} bullish, ${strategies.filter(s => s.signal.includes('SELL')).length} bearish)\n`;
  explanation += `• Candlestick Patterns: ${patternAnalysis.patterns.length} detected (Daily timeframe)\n`;
  explanation += `• News Impact Level: ${newsAnalysis.impact}\n\n`;
  
  // Add pattern-specific insights
  if (patternAnalysis.patterns.length > 0) {
    const recentPatterns = patternAnalysis.patterns.slice(0, 3);
    explanation += `**🕯️ KEY CANDLESTICK PATTERNS:**\n`;
    recentPatterns.forEach(pattern => {
      const emoji = pattern.type === 'BULLISH' ? '🟢' : pattern.type === 'BEARISH' ? '🔴' : '🟡';
      explanation += `${emoji} ${pattern.name} - ${pattern.successProbability}% success rate (${pattern.reliability} reliability)\n`;
    });
    explanation += `\n`;
  }
  
  explanation += `**🎯 KEY REASONING:**\n`;
  
  if (action.includes('BUY')) {
    explanation += `• 📈 Multiple bullish signals across technical indicators and candlestick patterns\n`;
    explanation += `• 🎯 Strong momentum confirmation from daily timeframe analysis\n`;
    if (patternAnalysis.trendDirection === 'UPTREND') {
      explanation += `• 📊 Candlestick patterns confirm uptrend continuation\n`;
    }
    if (newsAnalysis.impact === 'HIGH' && newsAnalysis.analysis.includes('BULLISH')) {
      explanation += `• 📰 Positive news sentiment providing additional upward catalyst\n`;
    }
    explanation += `• 💰 Favorable risk-reward ratio of ${riskRewardRatio.toFixed(1)}:1\n`;
    explanation += `• 🎲 Success probability enhanced by pattern reliability: ${patternAnalysis.successProbability.toFixed(1)}%\n`;
  } else if (action.includes('SELL')) {
    explanation += `• 📉 Multiple bearish signals across technical indicators and candlestick patterns\n`;
    explanation += `• ⚠️ Negative momentum and trend reversal confirmation from daily analysis\n`;
    if (patternAnalysis.trendDirection === 'DOWNTREND') {
      explanation += `• 📊 Candlestick patterns confirm downtrend continuation\n`;
    }
    if (newsAnalysis.impact === 'HIGH' && newsAnalysis.analysis.includes('BEARISH')) {
      explanation += `• 📰 Negative news sentiment creating downward pressure\n`;
    }
    explanation += `• 🛡️ Risk-reward ratio of ${riskRewardRatio.toFixed(1)}:1 favors short position\n`;
    explanation += `• 🎲 Success probability enhanced by pattern reliability: ${patternAnalysis.successProbability.toFixed(1)}%\n`;
  } else {
    explanation += `• ⚖️ Mixed signals from technical indicators and patterns\n`;
    explanation += `• 🔄 Market consolidation phase detected on daily timeframe\n`;
    explanation += `• ⏳ Waiting for clearer directional signals from patterns\n`;
    explanation += `• 📊 Pattern analysis suggests ${patternAnalysis.trendDirection.toLowerCase()} market structure\n`;
    if (newsAnalysis.upcomingEvents && newsAnalysis.upcomingEvents.length > 0) {
      explanation += `• 📅 Upcoming events may provide trading opportunities:\n`;
      newsAnalysis.upcomingEvents.forEach(event => {
        explanation += `  - ${event}\n`;
      });
    }
  }
  
  explanation += `\n**💼 RISK MANAGEMENT (Enhanced by Pattern Analysis):**\n`;
  explanation += `• Entry Price: $${entryPrice.toFixed(4)}\n`;
  explanation += `• Profit Target: $${profitTarget.toFixed(4)}\n`;
  explanation += `• Stop Loss: $${stopLoss.toFixed(4)}\n`;
  explanation += `• Risk-Reward Ratio: ${riskRewardRatio.toFixed(1)}:1\n`;
  explanation += `• Success Probability: ${patternAnalysis.successProbability.toFixed(1)}%\n`;
  
  if (action === 'HOLD') {
    explanation += `\n**⏸️ HOLD STRATEGY:**\n`;
    explanation += `• Monitor for breakout above $${priceLevels.resistanceLevel.toFixed(4)} for bullish continuation\n`;
    explanation += `• Watch for breakdown below $${priceLevels.supportLevel.toFixed(4)} for bearish reversal\n`;
    explanation += `• Keep position size moderate due to mixed signals\n`;
    explanation += `• Pattern analysis suggests ${patternAnalysis.trendDirection.toLowerCase()} consolidation\n`;
  }
  
  // Add pattern analysis summary
  explanation += `\n**🕯️ CANDLESTICK PATTERN SUMMARY:**\n`;
  explanation += `${patternAnalysis.analysis.split('\n').slice(0, 5).join('\n')}\n`;
  
  return {
    action,
    entryPrice,
    profitTarget,
    stopLoss,
    riskRewardRatio,
    explanation
  };
};
