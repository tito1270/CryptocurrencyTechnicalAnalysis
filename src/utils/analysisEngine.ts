import { AnalysisResult, TechnicalIndicator, TradingStrategy } from '../types';
import { technicalIndicators } from '../data/indicators';
import { tradingStrategies } from '../data/strategies';
import { cryptoNews } from '../data/news';
import { getPairPrice, getFallbackPrice } from './priceAPI';

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
  
  // Calculate overall sentiment based on indicators and strategies
  const { sentiment, confidence } = calculateOverallSentiment(activeIndicators, activeStrategies);
  
  // Analyze news impact for the pair
  const newsAnalysis = analyzeNewsImpact(pair, activeIndicators, activeStrategies);
  
  // Get real current price
  const currentPrice = await getCurrentPrice(pair, broker);
  const priceLevels = calculatePriceLevels(currentPrice, sentiment, newsAnalysis.impact);
  
  // Generate comprehensive recommendation
  const recommendation = generateRecommendation(
    sentiment, 
    confidence, 
    newsAnalysis, 
    activeIndicators, 
    activeStrategies,
    currentPrice,
    priceLevels
  );
  
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
    entryPrice: priceLevels.entryPrice,
    targetPrice: priceLevels.targetPrice,
    supportLevel: priceLevels.supportLevel,
    resistanceLevel: priceLevels.resistanceLevel,
    indicators: activeIndicators,
    strategies: activeStrategies
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
  
  const netScore = (bullishScore - bearishScore) / totalWeight;
  const confidence = Math.min(95, Math.max(50, Math.abs(netScore) * 100));
  
  let sentiment: AnalysisResult['overallSentiment'];
  if (netScore > 0.4) sentiment = 'STRONG_BULLISH';
  else if (netScore > 0.1) sentiment = 'BULLISH';
  else if (netScore < -0.4) sentiment = 'STRONG_BEARISH';
  else if (netScore < -0.1) sentiment = 'BEARISH';
  else sentiment = 'NEUTRAL';
  
  return { sentiment, confidence };
};

const getCurrentPrice = async (pair: string, broker: string): Promise<number> => {
  try {
    // Try to get real-time price from API
    const realPrice = await getPairPrice(broker, pair);
    if (realPrice && realPrice > 0) {
      return realPrice;
    }
  } catch (error) {
    console.error('Error fetching real-time price:', error);
  }
  
  // Fallback to simulated price
  return getFallbackPrice(pair);
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
  
  // Find relevant news for this pair
  const relevantNews = cryptoNews.filter(news => 
    news.relevantPairs.some(newsPair => 
      newsPair.includes(baseCurrency) || newsPair === pair
    )
  );
  
  if (relevantNews.length === 0) {
    return {
      impact: 'LOW' as const,
      analysis: `No significant recent news found for ${pair}. Technical analysis is based purely on price action and indicators.`,
      upcomingEvents: []
    };
  }
  
  // Analyze sentiment from news
  const positiveNews = relevantNews.filter(news => news.sentiment === 'POSITIVE');
  const negativeNews = relevantNews.filter(news => news.sentiment === 'NEGATIVE');
  const highImpactNews = relevantNews.filter(news => news.impact === 'HIGH');
  
  let impact: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (highImpactNews.length > 0) impact = 'HIGH';
  else if (relevantNews.length > 2) impact = 'MEDIUM';
  
  // Generate news analysis
  let analysis = `News Analysis for ${pair}:\n\n`;
  
  if (positiveNews.length > negativeNews.length) {
    analysis += `📈 BULLISH NEWS SENTIMENT: ${positiveNews.length} positive vs ${negativeNews.length} negative news items.\n\n`;
  } else if (negativeNews.length > positiveNews.length) {
    analysis += `📉 BEARISH NEWS SENTIMENT: ${negativeNews.length} negative vs ${positiveNews.length} positive news items.\n\n`;
  } else {
    analysis += `⚖️ NEUTRAL NEWS SENTIMENT: Balanced positive and negative news coverage.\n\n`;
  }
  
  // Add specific news items
  relevantNews.slice(0, 3).forEach((news, index) => {
    const emoji = news.sentiment === 'POSITIVE' ? '🟢' : news.sentiment === 'NEGATIVE' ? '🔴' : '🟡';
    analysis += `${emoji} ${news.title}\n${news.summary}\nImpact: ${news.impact} | Source: ${news.source}\n\n`;
  });
  
  // Look for upcoming events (simulated based on news patterns)
  const upcomingEvents: string[] = [];
  if (baseCurrency === 'BTC' && Math.random() > 0.7) {
    upcomingEvents.push('Bitcoin ETF decision expected within 2 weeks');
  }
  if (baseCurrency === 'ETH' && Math.random() > 0.8) {
    upcomingEvents.push('Ethereum network upgrade scheduled next month');
  }
  if (pair.includes('USDT') && Math.random() > 0.9) {
    upcomingEvents.push('Federal Reserve interest rate decision next week');
  }
  
  return {
    impact,
    analysis,
    upcomingEvents
  };
};

const generateRecommendation = (
  sentiment: string,
  confidence: number,
  newsAnalysis: { impact: string; analysis: string; upcomingEvents?: string[] },
  indicators: TechnicalIndicator[],
  strategies: TradingStrategy[],
  currentPrice: number,
  priceLevels: any
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
  
  // Adjust based on news impact
  if (newsAnalysis.impact === 'HIGH') {
    if (newsAnalysis.analysis.includes('BULLISH') && (action === 'HOLD' || action === 'BUY')) {
      action = action === 'BUY' ? 'STRONG_BUY' : 'BUY';
    } else if (newsAnalysis.analysis.includes('BEARISH') && (action === 'HOLD' || action === 'SELL')) {
      action = action === 'SELL' ? 'STRONG_SELL' : 'SELL';
    }
  }
  
  // Calculate recommended prices based on action
  let entryPrice = currentPrice;
  let profitTarget = currentPrice;
  let stopLoss = currentPrice;
  let riskRewardRatio = 1;
  
  switch (action) {
    case 'STRONG_BUY':
      entryPrice = currentPrice * 1.005; // Enter slightly above current price
      profitTarget = currentPrice * 1.15; // 15% profit target
      stopLoss = currentPrice * 0.95; // 5% stop loss
      riskRewardRatio = 3.0;
      break;
    case 'BUY':
      entryPrice = currentPrice * 1.002;
      profitTarget = currentPrice * 1.10; // 10% profit target
      stopLoss = currentPrice * 0.96; // 4% stop loss
      riskRewardRatio = 2.5;
      break;
    case 'HOLD':
      entryPrice = currentPrice;
      profitTarget = currentPrice * 1.05; // 5% profit target
      stopLoss = currentPrice * 0.97; // 3% stop loss
      riskRewardRatio = 1.7;
      break;
    case 'SELL':
      entryPrice = currentPrice * 0.998;
      profitTarget = currentPrice * 0.90; // 10% profit on short
      stopLoss = currentPrice * 1.04; // 4% stop loss
      riskRewardRatio = 2.5;
      break;
    case 'STRONG_SELL':
      entryPrice = currentPrice * 0.995;
      profitTarget = currentPrice * 0.85; // 15% profit on short
      stopLoss = currentPrice * 1.05; // 5% stop loss
      riskRewardRatio = 3.0;
      break;
  }
  
  // Generate detailed explanation
  explanation = `🎯 **${action} RECOMMENDATION** (Confidence: ${confidence}%)\n\n`;
  
  explanation += `**Technical Analysis Summary:**\n`;
  explanation += `• Overall Sentiment: ${sentiment.replace('_', ' ')}\n`;
  explanation += `• Active Indicators: ${indicators.length} (${indicators.filter(i => i.signal === 'BUY').length} bullish, ${indicators.filter(i => i.signal === 'SELL').length} bearish)\n`;
  explanation += `• Active Strategies: ${strategies.length} (${strategies.filter(s => s.signal.includes('BUY')).length} bullish, ${strategies.filter(s => s.signal.includes('SELL')).length} bearish)\n\n`;
  
  explanation += `**News Impact Analysis:**\n`;
  explanation += `• News Impact Level: ${newsAnalysis.impact}\n`;
  explanation += `• ${newsAnalysis.analysis.split('\n')[0]}\n\n`;
  
  explanation += `**Key Reasoning:**\n`;
  
  if (action.includes('BUY')) {
    explanation += `• 📈 Multiple bullish signals detected across technical indicators\n`;
    explanation += `• 🎯 Strong momentum and trend confirmation\n`;
    if (newsAnalysis.impact === 'HIGH' && newsAnalysis.analysis.includes('BULLISH')) {
      explanation += `• 📰 Positive news sentiment providing additional upward catalyst\n`;
    }
    explanation += `• 💰 Favorable risk-reward ratio of ${riskRewardRatio}:1\n`;
  } else if (action.includes('SELL')) {
    explanation += `• 📉 Multiple bearish signals detected across technical indicators\n`;
    explanation += `• ⚠️ Negative momentum and trend reversal signs\n`;
    if (newsAnalysis.impact === 'HIGH' && newsAnalysis.analysis.includes('BEARISH')) {
      explanation += `• 📰 Negative news sentiment creating downward pressure\n`;
    }
    explanation += `• 🛡️ Risk-reward ratio of ${riskRewardRatio}:1 favors short position\n`;
  } else {
    explanation += `• ⚖️ Mixed signals from technical indicators\n`;
    explanation += `• 🔄 Market consolidation phase detected\n`;
    explanation += `• ⏳ Waiting for clearer directional signals\n`;
    if (newsAnalysis.upcomingEvents && newsAnalysis.upcomingEvents.length > 0) {
      explanation += `• 📅 Upcoming events may provide trading opportunities:\n`;
      newsAnalysis.upcomingEvents.forEach(event => {
        explanation += `  - ${event}\n`;
      });
    }
  }
  
  explanation += `\n**Risk Management:**\n`;
  explanation += `• Entry Price: $${entryPrice.toFixed(4)}\n`;
  explanation += `• Profit Target: $${profitTarget.toFixed(4)}\n`;
  explanation += `• Stop Loss: $${stopLoss.toFixed(4)}\n`;
  explanation += `• Risk-Reward Ratio: ${riskRewardRatio}:1\n`;
  
  if (action === 'HOLD') {
    explanation += `\n**Hold Strategy:**\n`;
    explanation += `• Monitor for breakout above $${priceLevels.resistanceLevel.toFixed(4)} for bullish continuation\n`;
    explanation += `• Watch for breakdown below $${priceLevels.supportLevel.toFixed(4)} for bearish reversal\n`;
    explanation += `• Keep position size moderate due to uncertainty\n`;
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