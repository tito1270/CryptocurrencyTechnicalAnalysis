import { OHLCData, CandlestickPattern, TrendAnalysis, PatternAnalysisResult } from '../types';
import { performAdvancedOptionsAnalysis, OptionsAnalysisResult } from './optionsAnalysis';

// Utility functions for pattern detection
const isHammer = (candle: OHLCData): boolean => {
  const body = Math.abs(candle.close - candle.open);
  const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
  const upperShadow = candle.high - Math.max(candle.open, candle.close);
  const totalRange = candle.high - candle.low;
  
  return (
    lowerShadow >= body * 2 && // Lower shadow at least 2x body
    upperShadow <= body * 0.1 && // Very small upper shadow
    totalRange > 0 // Valid range
  );
};

const isShootingStar = (candle: OHLCData): boolean => {
  const body = Math.abs(candle.close - candle.open);
  const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
  const upperShadow = candle.high - Math.max(candle.open, candle.close);
  const totalRange = candle.high - candle.low;
  
  return (
    upperShadow >= body * 2 && // Upper shadow at least 2x body
    lowerShadow <= body * 0.1 && // Very small lower shadow
    totalRange > 0 // Valid range
  );
};

const isDoji = (candle: OHLCData): boolean => {
  const body = Math.abs(candle.close - candle.open);
  const totalRange = candle.high - candle.low;
  
  return totalRange > 0 && body <= totalRange * 0.1; // Body is less than 10% of total range
};

const isEngulfing = (prev: OHLCData, current: OHLCData, bullish: boolean): boolean => {
  if (bullish) {
    return (
      prev.close < prev.open && // Previous is bearish
      current.close > current.open && // Current is bullish
      current.open < prev.close && // Current opens below previous close
      current.close > prev.open // Current closes above previous open
    );
  } else {
    return (
      prev.close > prev.open && // Previous is bullish
      current.close < current.open && // Current is bearish
      current.open > prev.close && // Current opens above previous close
      current.close < prev.open // Current closes below previous open
    );
  }
};

const isInsideBar = (prev: OHLCData, current: OHLCData): boolean => {
  return (
    current.high <= prev.high &&
    current.low >= prev.low &&
    current.high < prev.high || current.low > prev.low // Not exactly equal
  );
};

const isOutsideBar = (prev: OHLCData, current: OHLCData): boolean => {
  return (
    current.high > prev.high &&
    current.low < prev.low
  );
};

const isMorningStar = (candles: OHLCData[]): boolean => {
  if (candles.length < 3) return false;
  
  const [first, second, third] = candles.slice(-3);
  
  return (
    // First candle is bearish
    first.close < first.open &&
    // Second candle is small (doji or small body) and gaps down
    Math.abs(second.close - second.open) < Math.abs(first.close - first.open) * 0.3 &&
    second.high < first.low &&
    // Third candle is bullish and closes above first candle's midpoint
    third.close > third.open &&
    third.close > (first.open + first.close) / 2
  );
};

const isEveningStar = (candles: OHLCData[]): boolean => {
  if (candles.length < 3) return false;
  
  const [first, second, third] = candles.slice(-3);
  
  return (
    // First candle is bullish
    first.close > first.open &&
    // Second candle is small (doji or small body) and gaps up
    Math.abs(second.close - second.open) < Math.abs(first.close - first.open) * 0.3 &&
    second.low > first.high &&
    // Third candle is bearish and closes below first candle's midpoint
    third.close < third.open &&
    third.close < (first.open + first.close) / 2
  );
};

const isThreeWhiteSoldiers = (candles: OHLCData[]): boolean => {
  if (candles.length < 3) return false;
  
  const lastThree = candles.slice(-3);
  
  return lastThree.every(candle => candle.close > candle.open) && // All bullish
    lastThree[1].close > lastThree[0].close && // Ascending closes
    lastThree[2].close > lastThree[1].close &&
    lastThree[1].open > lastThree[0].open && // Ascending opens
    lastThree[2].open > lastThree[1].open;
};

const isThreeBlackCrows = (candles: OHLCData[]): boolean => {
  if (candles.length < 3) return false;
  
  const lastThree = candles.slice(-3);
  
  return lastThree.every(candle => candle.close < candle.open) && // All bearish
    lastThree[1].close < lastThree[0].close && // Descending closes
    lastThree[2].close < lastThree[1].close &&
    lastThree[1].open < lastThree[0].open && // Descending opens
    lastThree[2].open < lastThree[1].open;
};

const isPinBar = (candle: OHLCData): { isPinBar: boolean; direction: 'BULLISH' | 'BEARISH' | null } => {
  const body = Math.abs(candle.close - candle.open);
  const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
  const upperShadow = candle.high - Math.max(candle.open, candle.close);
  const totalRange = candle.high - candle.low;
  
  if (totalRange === 0) return { isPinBar: false, direction: null };
  
  // Bullish pin bar (hammer-like with long lower shadow)
  if (lowerShadow >= totalRange * 0.6 && body <= totalRange * 0.3) {
    return { isPinBar: true, direction: 'BULLISH' };
  }
  
  // Bearish pin bar (shooting star-like with long upper shadow)
  if (upperShadow >= totalRange * 0.6 && body <= totalRange * 0.3) {
    return { isPinBar: true, direction: 'BEARISH' };
  }
  
  return { isPinBar: false, direction: null };
};

// Main pattern detection function
export const detectCandlestickPatterns = (
  ohlcData: OHLCData[],
  timeframe: string = '1h'
): CandlestickPattern[] => {
  if (ohlcData.length < 2) return [];
  
  const patterns: CandlestickPattern[] = [];
  const currentCandle = ohlcData[ohlcData.length - 1];
  const previousCandle = ohlcData.length > 1 ? ohlcData[ohlcData.length - 2] : null;
  
  // Single candle patterns
  if (isHammer(currentCandle)) {
    patterns.push({
      id: 'hammer',
      name: 'Hammer',
      type: 'BULLISH',
      reliability: 'MEDIUM',
      signal: 'BUY',
      confidence: 70,
      description: 'Bullish reversal pattern with long lower shadow',
      implications: 'Suggests potential upward reversal, especially after downtrend',
      timeframe,
      detectedAt: currentCandle.timestamp,
      candlesRequired: 1,
      optionsStrategy: ['Bull Call Spread', 'Long Call', 'Cash Secured Put']
    });
  }
  
  if (isShootingStar(currentCandle)) {
    patterns.push({
      id: 'shooting-star',
      name: 'Shooting Star',
      type: 'BEARISH',
      reliability: 'MEDIUM',
      signal: 'SELL',
      confidence: 70,
      description: 'Bearish reversal pattern with long upper shadow',
      implications: 'Suggests potential downward reversal, especially after uptrend',
      timeframe,
      detectedAt: currentCandle.timestamp,
      candlesRequired: 1,
      optionsStrategy: ['Bear Put Spread', 'Long Put', 'Covered Call']
    });
  }
  
  if (isDoji(currentCandle)) {
    patterns.push({
      id: 'doji',
      name: 'Doji',
      type: 'NEUTRAL',
      reliability: 'MEDIUM',
      signal: 'NEUTRAL',
      confidence: 60,
      description: 'Indecision pattern with equal open and close prices',
      implications: 'Market indecision, potential reversal depending on context',
      timeframe,
      detectedAt: currentCandle.timestamp,
      candlesRequired: 1,
      optionsStrategy: ['Iron Condor', 'Short Straddle', 'Short Strangle']
    });
  }
  
  const pinBarResult = isPinBar(currentCandle);
  if (pinBarResult.isPinBar) {
    patterns.push({
      id: 'pin-bar',
      name: `${pinBarResult.direction === 'BULLISH' ? 'Bullish' : 'Bearish'} Pin Bar`,
      type: pinBarResult.direction!,
      reliability: 'HIGH',
      signal: pinBarResult.direction === 'BULLISH' ? 'BUY' : 'SELL',
      confidence: 80,
      description: `Strong ${pinBarResult.direction!.toLowerCase()} rejection pattern`,
      implications: `High probability ${pinBarResult.direction!.toLowerCase()} move expected`,
      timeframe,
      detectedAt: currentCandle.timestamp,
      candlesRequired: 1,
      optionsStrategy: pinBarResult.direction === 'BULLISH' 
        ? ['Long Call', 'Bull Call Spread', 'Call Backspread']
        : ['Long Put', 'Bear Put Spread', 'Put Backspread']
    });
  }
  
  // Two candle patterns
  if (previousCandle) {
    if (isEngulfing(previousCandle, currentCandle, true)) {
      patterns.push({
        id: 'bullish-engulfing',
        name: 'Bullish Engulfing',
        type: 'BULLISH',
        reliability: 'HIGH',
        signal: 'STRONG_BUY',
        confidence: 85,
        description: 'Strong bullish reversal pattern',
        implications: 'High probability upward move, strong buying pressure',
        timeframe,
        detectedAt: currentCandle.timestamp,
        candlesRequired: 2,
        optionsStrategy: ['Long Call', 'Bull Call Spread', 'Call Calendar Spread']
      });
    }
    
    if (isEngulfing(previousCandle, currentCandle, false)) {
      patterns.push({
        id: 'bearish-engulfing',
        name: 'Bearish Engulfing',
        type: 'BEARISH',
        reliability: 'HIGH',
        signal: 'STRONG_SELL',
        confidence: 85,
        description: 'Strong bearish reversal pattern',
        implications: 'High probability downward move, strong selling pressure',
        timeframe,
        detectedAt: currentCandle.timestamp,
        candlesRequired: 2,
        optionsStrategy: ['Long Put', 'Bear Put Spread', 'Put Calendar Spread']
      });
    }
    
    if (isInsideBar(previousCandle, currentCandle)) {
      patterns.push({
        id: 'inside-bar',
        name: 'Inside Bar',
        type: 'CONTINUATION',
        reliability: 'MEDIUM',
        signal: 'NEUTRAL',
        confidence: 65,
        description: 'Consolidation pattern indicating potential continuation',
        implications: 'Market consolidation, breakout expected in direction of trend',
        timeframe,
        detectedAt: currentCandle.timestamp,
        candlesRequired: 2,
        optionsStrategy: ['Iron Condor', 'Short Straddle', 'Butterfly Spread']
      });
    }
    
    if (isOutsideBar(previousCandle, currentCandle)) {
      patterns.push({
        id: 'outside-bar',
        name: 'Outside Bar (Engulfing Bar)',
        type: 'REVERSAL',
        reliability: 'HIGH',
        signal: currentCandle.close > currentCandle.open ? 'BUY' : 'SELL',
        confidence: 75,
        description: 'Strong volatility pattern indicating potential reversal',
        implications: 'High volatility, strong directional move expected',
        timeframe,
        detectedAt: currentCandle.timestamp,
        candlesRequired: 2,
        optionsStrategy: currentCandle.close > currentCandle.open 
          ? ['Long Call', 'Bull Call Spread', 'Long Straddle']
          : ['Long Put', 'Bear Put Spread', 'Long Straddle']
      });
    }
  }
  
  // Three candle patterns
  if (ohlcData.length >= 3) {
    if (isMorningStar(ohlcData)) {
      patterns.push({
        id: 'morning-star',
        name: 'Morning Star',
        type: 'BULLISH',
        reliability: 'HIGH',
        signal: 'STRONG_BUY',
        confidence: 90,
        description: 'Powerful bullish reversal pattern',
        implications: 'Very strong upward reversal signal, high reliability',
        timeframe,
        detectedAt: currentCandle.timestamp,
        candlesRequired: 3,
        optionsStrategy: ['Long Call', 'Bull Call Spread', 'Call Backspread']
      });
    }
    
    if (isEveningStar(ohlcData)) {
      patterns.push({
        id: 'evening-star',
        name: 'Evening Star',
        type: 'BEARISH',
        reliability: 'HIGH',
        signal: 'STRONG_SELL',
        confidence: 90,
        description: 'Powerful bearish reversal pattern',
        implications: 'Very strong downward reversal signal, high reliability',
        timeframe,
        detectedAt: currentCandle.timestamp,
        candlesRequired: 3,
        optionsStrategy: ['Long Put', 'Bear Put Spread', 'Put Backspread']
      });
    }
    
    if (isThreeWhiteSoldiers(ohlcData)) {
      patterns.push({
        id: 'three-white-soldiers',
        name: 'Three White Soldiers',
        type: 'BULLISH',
        reliability: 'HIGH',
        signal: 'STRONG_BUY',
        confidence: 88,
        description: 'Strong bullish continuation pattern',
        implications: 'Sustained upward momentum, very bullish',
        timeframe,
        detectedAt: currentCandle.timestamp,
        candlesRequired: 3,
        optionsStrategy: ['Long Call', 'Bull Call Spread', 'Call Ratio Spread']
      });
    }
    
    if (isThreeBlackCrows(ohlcData)) {
      patterns.push({
        id: 'three-black-crows',
        name: 'Three Black Crows',
        type: 'BEARISH',
        reliability: 'HIGH',
        signal: 'STRONG_SELL',
        confidence: 88,
        description: 'Strong bearish continuation pattern',
        implications: 'Sustained downward momentum, very bearish',
        timeframe,
        detectedAt: currentCandle.timestamp,
        candlesRequired: 3,
        optionsStrategy: ['Long Put', 'Bear Put Spread', 'Put Ratio Spread']
      });
    }
  }
  
  return patterns;
};

// Trend analysis function
export const analyzeTrend = (ohlcData: OHLCData[]): TrendAnalysis => {
  if (ohlcData.length < 10) {
    return {
      direction: 'SIDEWAYS',
      strength: 'WEAK',
      duration: 0,
      confidence: 50,
      supportLevel: 0,
      resistanceLevel: 0,
      trendLine: { slope: 0, intercept: 0, r2: 0 }
    };
  }
  
  const closes = ohlcData.map(d => d.close);
  const highs = ohlcData.map(d => d.high);
  const lows = ohlcData.map(d => d.low);
  
  // Calculate linear regression for trend line
  const n = closes.length;
  const xValues = Array.from({ length: n }, (_, i) => i);
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = closes.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * closes[i], 0);
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate R-squared
  const meanY = sumY / n;
  const ssTotal = closes.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
  const ssRes = closes.reduce((sum, y, i) => {
    const predicted = slope * i + intercept;
    return sum + Math.pow(y - predicted, 2);
  }, 0);
  const r2 = 1 - (ssRes / ssTotal);
  
  // Determine trend direction and strength
  let direction: TrendAnalysis['direction'];
  let strength: TrendAnalysis['strength'];
  
  const slopeThreshold = Math.abs(slope) / (closes[closes.length - 1] / 100); // Percentage slope
  
  if (slope > 0.1 && r2 > 0.5) {
    direction = 'UPTREND';
  } else if (slope < -0.1 && r2 > 0.5) {
    direction = 'DOWNTREND';
  } else {
    direction = 'SIDEWAYS';
  }
  
  if (r2 > 0.8 && slopeThreshold > 0.5) {
    strength = 'STRONG';
  } else if (r2 > 0.6 && slopeThreshold > 0.2) {
    strength = 'MODERATE';
  } else {
    strength = 'WEAK';
  }
  
  // Calculate support and resistance levels
  const recentData = ohlcData.slice(-20); // Last 20 periods
  const supportLevel = Math.min(...recentData.map(d => d.low));
  const resistanceLevel = Math.max(...recentData.map(d => d.high));
  
  // Calculate trend duration (simplified)
  let duration = 1;
  for (let i = closes.length - 2; i >= 0; i--) {
    const currentTrend = closes[i + 1] > closes[i] ? 'UP' : 'DOWN';
    const expectedTrend = direction === 'UPTREND' ? 'UP' : 'DOWN';
    
    if (direction === 'SIDEWAYS' || currentTrend === expectedTrend) {
      duration++;
    } else {
      break;
    }
  }
  
  const confidence = Math.min(95, Math.max(50, r2 * 100));
  
  return {
    direction,
    strength,
    duration,
    confidence: Math.round(confidence),
    supportLevel,
    resistanceLevel,
    trendLine: {
      slope,
      intercept,
      r2: Math.round(r2 * 100) / 100
    }
  };
};

// Generate OHLC data from current price (for demo/testing purposes)
export const generateOHLCData = (
  currentPrice: number,
  periods: number = 20
): OHLCData[] => {
  const data: OHLCData[] = [];
  let price = currentPrice * 0.95; // Start slightly lower
  
  for (let i = 0; i < periods; i++) {
    const volatility = 0.02; // 2% volatility
    const trend = Math.random() > 0.5 ? 1 : -1;
    const change = price * volatility * (Math.random() * trend);
    
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) * (1 + Math.random() * volatility);
    const low = Math.min(open, close) * (1 - Math.random() * volatility);
    const volume = Math.floor(Math.random() * 1000000) + 100000;
    
    data.push({
      timestamp: Date.now() - (periods - i) * 3600000, // 1 hour intervals
      open,
      high,
      low,
      close,
      volume
    });
    
    price = close;
  }
  
  return data;
};

// Comprehensive pattern analysis with advanced options recommendations
export const performPatternAnalysis = (
  ohlcData: OHLCData[],
  timeframe: string = '1h',
  currentPrice?: number
): PatternAnalysisResult => {
  const detectedPatterns = detectCandlestickPatterns(ohlcData, timeframe);
  const trendAnalysis = analyzeTrend(ohlcData);
  
  // Calculate overall signal from patterns
  let bullishScore = 0;
  let bearishScore = 0;
  let totalWeight = 0;
  
  detectedPatterns.forEach(pattern => {
    const weight = pattern.reliability === 'HIGH' ? 3 : pattern.reliability === 'MEDIUM' ? 2 : 1;
    totalWeight += weight;
    
    if (pattern.type === 'BULLISH' || pattern.signal.includes('BUY')) {
      bullishScore += weight * (pattern.confidence / 100);
    } else if (pattern.type === 'BEARISH' || pattern.signal.includes('SELL')) {
      bearishScore += weight * (pattern.confidence / 100);
    }
  });
  
  // Incorporate trend analysis
  const trendWeight = 2;
  totalWeight += trendWeight;
  
  if (trendAnalysis.direction === 'UPTREND') {
    bullishScore += trendWeight * (trendAnalysis.confidence / 100);
  } else if (trendAnalysis.direction === 'DOWNTREND') {
    bearishScore += trendWeight * (trendAnalysis.confidence / 100);
  }
  
  // Calculate overall signal
  let overallSignal: PatternAnalysisResult['overallSignal'] = 'NEUTRAL';
  
  if (totalWeight > 0) {
    const netScore = (bullishScore - bearishScore) / totalWeight;
    
    if (netScore > 0.6) overallSignal = 'STRONG_BUY';
    else if (netScore > 0.2) overallSignal = 'BUY';
    else if (netScore < -0.6) overallSignal = 'STRONG_SELL';
    else if (netScore < -0.2) overallSignal = 'SELL';
  }
  
  // Check for pattern confirmation and conflicts
  const bullishPatterns = detectedPatterns.filter(p => p.type === 'BULLISH' || p.signal.includes('BUY'));
  const bearishPatterns = detectedPatterns.filter(p => p.type === 'BEARISH' || p.signal.includes('SELL'));
  
  const patternConfirmation = 
    (bullishPatterns.length > 0 && trendAnalysis.direction === 'UPTREND') ||
    (bearishPatterns.length > 0 && trendAnalysis.direction === 'DOWNTREND');
  
  const conflictingSignals = bullishPatterns.length > 0 && bearishPatterns.length > 0;
  
  // Generate basic options recommendations
  const basicOptionsRecommendations = generateOptionsRecommendations(
    detectedPatterns,
    trendAnalysis,
    overallSignal
  );

  // Generate advanced options analysis if current price is provided
  let advancedOptionsAnalysis: OptionsAnalysisResult | undefined;
  if (currentPrice) {
    advancedOptionsAnalysis = performAdvancedOptionsAnalysis(
      detectedPatterns,
      trendAnalysis,
      overallSignal,
      currentPrice
    );
  }
  
  return {
    detectedPatterns,
    trendAnalysis,
    overallSignal,
    patternConfirmation,
    conflictingSignals,
    optionsRecommendations: basicOptionsRecommendations,
    advancedOptionsAnalysis
  };
};

const generateOptionsRecommendations = (
  patterns: CandlestickPattern[],
  trend: TrendAnalysis,
  signal: PatternAnalysisResult['overallSignal']
): PatternAnalysisResult['optionsRecommendations'] => {
  const recommendations: PatternAnalysisResult['optionsRecommendations'] = [];
  
  // High probability setups
  if (signal === 'STRONG_BUY' && trend.direction === 'UPTREND') {
    recommendations.push({
      strategy: 'Bull Call Spread',
      reasoning: 'Strong bullish signals with confirmed uptrend - limited risk, good probability',
      expiration: '30-45 days',
      strikes: ['ATM Long Call', 'OTM Short Call (+10%)']
    });
    
    recommendations.push({
      strategy: 'Long Call',
      reasoning: 'High conviction bullish setup with strong pattern confirmation',
      expiration: '45-60 days',
      strikes: ['ATM or slightly OTM (+2-5%)']
    });
  }
  
  if (signal === 'STRONG_SELL' && trend.direction === 'DOWNTREND') {
    recommendations.push({
      strategy: 'Bear Put Spread',
      reasoning: 'Strong bearish signals with confirmed downtrend - limited risk, good probability',
      expiration: '30-45 days',
      strikes: ['ATM Long Put', 'OTM Short Put (-10%)']
    });
    
    recommendations.push({
      strategy: 'Long Put',
      reasoning: 'High conviction bearish setup with strong pattern confirmation',
      expiration: '45-60 days',
      strikes: ['ATM or slightly OTM (-2-5%)']
    });
  }
  
  // Neutral/ranging strategies
  if (signal === 'NEUTRAL' || trend.direction === 'SIDEWAYS') {
    recommendations.push({
      strategy: 'Iron Condor',
      reasoning: 'Sideways movement expected - profit from time decay in range',
      expiration: '30-45 days',
      strikes: ['Short strikes around ±5-10% from current price']
    });
    
    recommendations.push({
      strategy: 'Short Straddle',
      reasoning: 'Low volatility environment with range-bound movement expected',
      expiration: '20-30 days',
      strikes: ['ATM strikes']
    });
  }
  
  // High volatility setups
  const hasHighVolatilityPatterns = patterns.some(p => 
    ['outside-bar', 'pin-bar', 'bullish-engulfing', 'bearish-engulfing'].includes(p.id)
  );
  
  if (hasHighVolatilityPatterns) {
    recommendations.push({
      strategy: 'Long Straddle',
      reasoning: 'High volatility patterns detected - expect significant movement in either direction',
      expiration: '30-45 days',
      strikes: ['ATM strikes']
    });
  }
  
  return recommendations;
};