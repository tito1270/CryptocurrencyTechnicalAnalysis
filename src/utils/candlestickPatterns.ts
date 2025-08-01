// Candlestick Pattern Detection Engine
// Daily timeframe analysis for trend determination

export interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export interface CandlestickPattern {
  id: string;
  name: string;
  type: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'REVERSAL' | 'CONTINUATION';
  reliability: 'HIGH' | 'MEDIUM' | 'LOW';
  successProbability: number; // Percentage
  signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  description: string;
  candles: number; // Number of candles required for pattern
  strength: number; // 1-10 pattern strength
  timeframe: string;
  detectedAt: number;
}

export interface PatternAnalysisResult {
  patterns: CandlestickPattern[];
  overallPatternSentiment: 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH';
  patternConfidence: number;
  successProbability: number;
  trendDirection: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS';
  analysis: string;
}

// Generate realistic daily candle data based on current price
export const generateDailyCandleData = (currentPrice: number, sentiment: string): CandleData[] => {
  const candles: CandleData[] = [];
  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;
  
  // Generate 30 days of candle data for pattern detection
  let basePrice = currentPrice * 0.85; // Start from lower base
  
  for (let i = 29; i >= 0; i--) {
    const timestamp = now - (i * msPerDay);
    
    // Create realistic price movement based on sentiment
    let volatility = 0.03 + Math.random() * 0.04; // 3-7% daily volatility
    let trendBias = 0;
    
    // Adjust trend bias based on overall sentiment
    switch (sentiment) {
      case 'STRONG_BULLISH':
        trendBias = 0.015 + Math.random() * 0.02; // 1.5-3.5% upward bias
        break;
      case 'BULLISH':
        trendBias = 0.005 + Math.random() * 0.015; // 0.5-2% upward bias
        break;
      case 'BEARISH':
        trendBias = -0.005 - Math.random() * 0.015; // 0.5-2% downward bias
        break;
      case 'STRONG_BEARISH':
        trendBias = -0.015 - Math.random() * 0.02; // 1.5-3.5% downward bias
        break;
      default:
        trendBias = (Math.random() - 0.5) * 0.01; // Random walk
    }
    
    // Generate OHLC with realistic relationships
    const open = basePrice;
    const direction = Math.random() > 0.5 ? 1 : -1;
    const bodySize = volatility * (0.3 + Math.random() * 0.4); // 30-70% of volatility
    const wickSize = volatility * (0.2 + Math.random() * 0.3); // 20-50% of volatility
    
    let close = open + (direction * bodySize * basePrice) + (trendBias * basePrice);
    let high = Math.max(open, close) + (wickSize * basePrice);
    let low = Math.min(open, close) - (wickSize * basePrice);
    
    // Ensure low > 0
    if (low <= 0) low = Math.min(open, close) * 0.95;
    
    // Generate volume (higher volume on trend days)
    const baseVolume = 1000000 + Math.random() * 5000000;
    const volumeMultiplier = Math.abs(trendBias) > 0.01 ? 1.5 + Math.random() : 0.8 + Math.random() * 0.4;
    const volume = baseVolume * volumeMultiplier;
    
    candles.push({
      open,
      high,
      low,
      close,
      volume,
      timestamp
    });
    
    // Update base price for next candle
    basePrice = close;
  }
  
  return candles;
};

// Pattern detection functions
export const detectHammer = (candles: CandleData[], index: number): CandlestickPattern | null => {
  if (index < 1) return null;
  
  const candle = candles[index];
  const bodySize = Math.abs(candle.close - candle.open);
  const lowerWick = Math.min(candle.open, candle.close) - candle.low;
  const upperWick = candle.high - Math.max(candle.open, candle.close);
  const range = candle.high - candle.low;
  
  // Hammer criteria: small body, long lower wick, small upper wick
  const isHammer = lowerWick >= bodySize * 2 && 
                   upperWick <= bodySize * 0.5 && 
                   bodySize < range * 0.3;
  
  if (!isHammer) return null;
  
  // Check if we're in a downtrend (look at previous 3 candles)
  const previousCandles = candles.slice(Math.max(0, index - 3), index);
  const isDowntrend = previousCandles.every((c, i) => 
    i === 0 || c.close < previousCandles[i - 1].close
  );
  
  return {
    id: 'hammer',
    name: 'Hammer',
    type: 'BULLISH',
    reliability: isDowntrend ? 'HIGH' : 'MEDIUM',
    successProbability: isDowntrend ? 75 : 65,
    signal: isDowntrend ? 'BUY' : 'NEUTRAL',
    description: 'Bullish reversal pattern with small body and long lower shadow',
    candles: 1,
    strength: isDowntrend ? 8 : 6,
    timeframe: 'DAILY',
    detectedAt: candle.timestamp
  };
};

export const detectDoji = (candles: CandleData[], index: number): CandlestickPattern | null => {
  const candle = candles[index];
  const bodySize = Math.abs(candle.close - candle.open);
  const range = candle.high - candle.low;
  
  // Doji criteria: very small body relative to range
  const isDoji = bodySize <= range * 0.1 && range > 0;
  
  if (!isDoji) return null;
  
  // Determine doji type and sentiment based on context
  const upperWick = candle.high - Math.max(candle.open, candle.close);
  const lowerWick = Math.min(candle.open, candle.close) - candle.low;
  
  let type: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  let successProbability = 55;
  let signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL' = 'NEUTRAL';
  
  // Dragonfly Doji (long lower wick)
  if (lowerWick > upperWick * 2) {
    type = 'BULLISH';
    successProbability = 70;
    signal = 'BUY';
  }
  // Gravestone Doji (long upper wick)
  else if (upperWick > lowerWick * 2) {
    type = 'BEARISH';
    successProbability = 70;
    signal = 'SELL';
  }
  
  return {
    id: 'doji',
    name: 'Doji',
    type,
    reliability: 'MEDIUM',
    successProbability,
    signal,
    description: 'Indecision pattern with open and close at nearly same level',
    candles: 1,
    strength: 5,
    timeframe: 'DAILY',
    detectedAt: candle.timestamp
  };
};

export const detectEngulfing = (candles: CandleData[], index: number): CandlestickPattern | null => {
  if (index < 1) return null;
  
  const current = candles[index];
  const previous = candles[index - 1];
  
  const prevBody = Math.abs(previous.close - previous.open);
  const currBody = Math.abs(current.close - current.open);
  
  // Bullish Engulfing
  const isBullishEngulfing = previous.close < previous.open && // Previous red
                            current.close > current.open && // Current green
                            current.open < previous.close && // Current opens below prev close
                            current.close > previous.open && // Current closes above prev open
                            currBody > prevBody; // Current body larger
  
  // Bearish Engulfing
  const isBearishEngulfing = previous.close > previous.open && // Previous green
                            current.close < current.open && // Current red
                            current.open > previous.close && // Current opens above prev close
                            current.close < previous.open && // Current closes below prev open
                            currBody > prevBody; // Current body larger
  
  if (isBullishEngulfing) {
    return {
      id: 'bullish_engulfing',
      name: 'Bullish Engulfing',
      type: 'BULLISH',
      reliability: 'HIGH',
      successProbability: 78,
      signal: 'BUY',
      description: 'Strong bullish reversal pattern with current candle engulfing previous',
      candles: 2,
      strength: 8,
      timeframe: 'DAILY',
      detectedAt: current.timestamp
    };
  }
  
  if (isBearishEngulfing) {
    return {
      id: 'bearish_engulfing',
      name: 'Bearish Engulfing',
      type: 'BEARISH',
      reliability: 'HIGH',
      successProbability: 78,
      signal: 'SELL',
      description: 'Strong bearish reversal pattern with current candle engulfing previous',
      candles: 2,
      strength: 8,
      timeframe: 'DAILY',
      detectedAt: current.timestamp
    };
  }
  
  return null;
};

export const detectMorningEveningStar = (candles: CandleData[], index: number): CandlestickPattern | null => {
  if (index < 2) return null;
  
  const first = candles[index - 2];
  const middle = candles[index - 1];
  const last = candles[index];
  
  const firstBody = Math.abs(first.close - first.open);
  const middleBody = Math.abs(middle.close - middle.open);
  const lastBody = Math.abs(last.close - last.open);
  
  // Morning Star (Bullish)
  const isMorningStar = first.close < first.open && // First candle red
                       middleBody < firstBody * 0.5 && // Middle small body
                       last.close > last.open && // Last candle green
                       last.close > (first.open + first.close) / 2; // Last closes above first midpoint
  
  // Evening Star (Bearish)
  const isEveningStar = first.close > first.open && // First candle green
                       middleBody < firstBody * 0.5 && // Middle small body
                       last.close < last.open && // Last candle red
                       last.close < (first.open + first.close) / 2; // Last closes below first midpoint
  
  if (isMorningStar) {
    return {
      id: 'morning_star',
      name: 'Morning Star',
      type: 'BULLISH',
      reliability: 'HIGH',
      successProbability: 82,
      signal: 'BUY',
      description: 'Three-candle bullish reversal pattern indicating trend change',
      candles: 3,
      strength: 9,
      timeframe: 'DAILY',
      detectedAt: last.timestamp
    };
  }
  
  if (isEveningStar) {
    return {
      id: 'evening_star',
      name: 'Evening Star',
      type: 'BEARISH',
      reliability: 'HIGH',
      successProbability: 82,
      signal: 'SELL',
      description: 'Three-candle bearish reversal pattern indicating trend change',
      candles: 3,
      strength: 9,
      timeframe: 'DAILY',
      detectedAt: last.timestamp
    };
  }
  
  return null;
};

export const detectSpinningTop = (candles: CandleData[], index: number): CandlestickPattern | null => {
  const candle = candles[index];
  const bodySize = Math.abs(candle.close - candle.open);
  const upperWick = candle.high - Math.max(candle.open, candle.close);
  const lowerWick = Math.min(candle.open, candle.close) - candle.low;
  const range = candle.high - candle.low;
  
  // Spinning top criteria: small body, long wicks on both sides
  const isSpinningTop = bodySize < range * 0.25 && 
                       upperWick > bodySize && 
                       lowerWick > bodySize;
  
  if (!isSpinningTop) return null;
  
  return {
    id: 'spinning_top',
    name: 'Spinning Top',
    type: 'NEUTRAL',
    reliability: 'MEDIUM',
    successProbability: 60,
    signal: 'NEUTRAL',
    description: 'Indecision pattern with small body and long wicks on both sides',
    candles: 1,
    strength: 4,
    timeframe: 'DAILY',
    detectedAt: candle.timestamp
  };
};

export const detectPiercing = (candles: CandleData[], index: number): CandlestickPattern | null => {
  if (index < 1) return null;
  
  const previous = candles[index - 1];
  const current = candles[index];
  
  // Piercing pattern criteria
  const isPiercing = previous.close < previous.open && // Previous red
                    current.close > current.open && // Current green
                    current.open < previous.low && // Current opens below previous low
                    current.close > (previous.open + previous.close) / 2 && // Closes above midpoint
                    current.close < previous.open; // But below previous open
  
  if (!isPiercing) return null;
  
  return {
    id: 'piercing',
    name: 'Piercing Pattern',
    type: 'BULLISH',
    reliability: 'MEDIUM',
    successProbability: 72,
    signal: 'BUY',
    description: 'Two-candle bullish reversal with second candle piercing first',
    candles: 2,
    strength: 7,
    timeframe: 'DAILY',
    detectedAt: current.timestamp
  };
};

export const detectDarkCloudCover = (candles: CandleData[], index: number): CandlestickPattern | null => {
  if (index < 1) return null;
  
  const previous = candles[index - 1];
  const current = candles[index];
  
  // Dark Cloud Cover criteria
  const isDarkCloud = previous.close > previous.open && // Previous green
                     current.close < current.open && // Current red
                     current.open > previous.high && // Current opens above previous high
                     current.close < (previous.open + previous.close) / 2 && // Closes below midpoint
                     current.close > previous.open; // But above previous open
  
  if (!isDarkCloud) return null;
  
  return {
    id: 'dark_cloud_cover',
    name: 'Dark Cloud Cover',
    type: 'BEARISH',
    reliability: 'MEDIUM',
    successProbability: 72,
    signal: 'SELL',
    description: 'Two-candle bearish reversal with second candle covering first',
    candles: 2,
    strength: 7,
    timeframe: 'DAILY',
    detectedAt: current.timestamp
  };
};

export const detectThreeWhiteSoldiers = (candles: CandleData[], index: number): CandlestickPattern | null => {
  if (index < 2) return null;
  
  const first = candles[index - 2];
  const second = candles[index - 1];
  const third = candles[index];
  
  // Three White Soldiers criteria
  const isThreeWhite = first.close > first.open && // All green candles
                      second.close > second.open &&
                      third.close > third.open &&
                      second.close > first.close && // Progressive higher closes
                      third.close > second.close &&
                      second.open > first.open && // Opens within previous body
                      second.open < first.close &&
                      third.open > second.open &&
                      third.open < second.close;
  
  if (!isThreeWhite) return null;
  
  return {
    id: 'three_white_soldiers',
    name: 'Three White Soldiers',
    type: 'BULLISH',
    reliability: 'HIGH',
    successProbability: 80,
    signal: 'STRONG_BUY',
    description: 'Three consecutive bullish candles with progressive higher closes',
    candles: 3,
    strength: 9,
    timeframe: 'DAILY',
    detectedAt: third.timestamp
  };
};

export const detectThreeBlackCrows = (candles: CandleData[], index: number): CandlestickPattern | null => {
  if (index < 2) return null;
  
  const first = candles[index - 2];
  const second = candles[index - 1];
  const third = candles[index];
  
  // Three Black Crows criteria
  const isThreeBlack = first.close < first.open && // All red candles
                      second.close < second.open &&
                      third.close < third.open &&
                      second.close < first.close && // Progressive lower closes
                      third.close < second.close &&
                      second.open < first.open && // Opens within previous body
                      second.open > first.close &&
                      third.open < second.open &&
                      third.open > second.close;
  
  if (!isThreeBlack) return null;
  
  return {
    id: 'three_black_crows',
    name: 'Three Black Crows',
    type: 'BEARISH',
    reliability: 'HIGH',
    successProbability: 80,
    signal: 'STRONG_SELL',
    description: 'Three consecutive bearish candles with progressive lower closes',
    candles: 3,
    strength: 9,
    timeframe: 'DAILY',
    detectedAt: third.timestamp
  };
};

// Main pattern detection function
export const detectAllPatterns = (candles: CandleData[]): CandlestickPattern[] => {
  const patterns: CandlestickPattern[] = [];
  
  for (let i = 0; i < candles.length; i++) {
    // Single candle patterns
    const hammer = detectHammer(candles, i);
    const doji = detectDoji(candles, i);
    const spinningTop = detectSpinningTop(candles, i);
    
    // Two candle patterns
    const engulfing = detectEngulfing(candles, i);
    const piercing = detectPiercing(candles, i);
    const darkCloud = detectDarkCloudCover(candles, i);
    
    // Three candle patterns
    const star = detectMorningEveningStar(candles, i);
    const soldiers = detectThreeWhiteSoldiers(candles, i);
    const crows = detectThreeBlackCrows(candles, i);
    
    // Add detected patterns
    [hammer, doji, spinningTop, engulfing, piercing, darkCloud, star, soldiers, crows]
      .filter(pattern => pattern !== null)
      .forEach(pattern => patterns.push(pattern!));
  }
  
  // Sort by timestamp (most recent first) and strength
  return patterns.sort((a, b) => {
    if (b.detectedAt !== a.detectedAt) {
      return b.detectedAt - a.detectedAt;
    }
    return b.strength - a.strength;
  });
};

// Analyze patterns and generate overall sentiment
export const analyzePatterns = (patterns: CandlestickPattern[]): PatternAnalysisResult => {
  if (patterns.length === 0) {
    return {
      patterns: [],
      overallPatternSentiment: 'NEUTRAL',
      patternConfidence: 50,
      successProbability: 50,
      trendDirection: 'SIDEWAYS',
      analysis: '❌ No significant candlestick patterns detected in daily timeframe analysis.'
    };
  }
  
  // Get recent patterns (last 3 days)
  const recentTimestamp = Date.now() - (3 * 24 * 60 * 60 * 1000);
  const recentPatterns = patterns.filter(p => p.detectedAt >= recentTimestamp);
  
  // Calculate weighted sentiment
  let bullishScore = 0;
  let bearishScore = 0;
  let totalWeight = 0;
  let totalSuccessProbability = 0;
  
  recentPatterns.forEach(pattern => {
    let weight = pattern.strength;
    
    // Weight by reliability
    if (pattern.reliability === 'HIGH') weight *= 1.5;
    else if (pattern.reliability === 'LOW') weight *= 0.7;
    
    totalWeight += weight;
    totalSuccessProbability += pattern.successProbability * weight;
    
    if (pattern.type === 'BULLISH') {
      bullishScore += weight;
    } else if (pattern.type === 'BEARISH') {
      bearishScore += weight;
    }
  });
  
  const netScore = totalWeight > 0 ? (bullishScore - bearishScore) / totalWeight : 0;
  const avgSuccessProbability = totalWeight > 0 ? totalSuccessProbability / totalWeight : 50;
  const confidence = Math.min(95, Math.max(50, Math.abs(netScore) * 15 + 50));
  
  // Determine overall sentiment
  let sentiment: 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH';
  let trendDirection: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS';
  
  if (netScore > 0.6) {
    sentiment = 'STRONG_BULLISH';
    trendDirection = 'UPTREND';
  } else if (netScore > 0.2) {
    sentiment = 'BULLISH';
    trendDirection = 'UPTREND';
  } else if (netScore < -0.6) {
    sentiment = 'STRONG_BEARISH';
    trendDirection = 'DOWNTREND';
  } else if (netScore < -0.2) {
    sentiment = 'BEARISH';
    trendDirection = 'DOWNTREND';
  } else {
    sentiment = 'NEUTRAL';
    trendDirection = 'SIDEWAYS';
  }
  
  // Generate analysis text
  let analysis = `🕯️ **CANDLESTICK PATTERN ANALYSIS** (Daily Timeframe)\n\n`;
  analysis += `📊 **Pattern Summary:**\n`;
  analysis += `• Total Patterns Detected: ${patterns.length}\n`;
  analysis += `• Recent Patterns (3 days): ${recentPatterns.length}\n`;
  analysis += `• Pattern Confidence: ${confidence.toFixed(1)}%\n`;
  analysis += `• Success Probability: ${avgSuccessProbability.toFixed(1)}%\n`;
  analysis += `• Trend Direction: ${trendDirection}\n\n`;
  
  if (recentPatterns.length > 0) {
    analysis += `🎯 **Recent Patterns:**\n`;
    recentPatterns.slice(0, 3).forEach(pattern => {
      const emoji = pattern.type === 'BULLISH' ? '🟢' : pattern.type === 'BEARISH' ? '🔴' : '🟡';
      const daysAgo = Math.floor((Date.now() - pattern.detectedAt) / (24 * 60 * 60 * 1000));
      analysis += `${emoji} **${pattern.name}** (${pattern.reliability} reliability)\n`;
      analysis += `   • Type: ${pattern.type} • Signal: ${pattern.signal}\n`;
      analysis += `   • Success Rate: ${pattern.successProbability}% • Strength: ${pattern.strength}/10\n`;
      analysis += `   • Detected: ${daysAgo} day(s) ago\n`;
      analysis += `   • ${pattern.description}\n\n`;
    });
    
    // Bullish vs Bearish breakdown
    const bullishPatterns = recentPatterns.filter(p => p.type === 'BULLISH').length;
    const bearishPatterns = recentPatterns.filter(p => p.type === 'BEARISH').length;
    const neutralPatterns = recentPatterns.filter(p => p.type === 'NEUTRAL').length;
    
    analysis += `📈 **Pattern Sentiment Breakdown:**\n`;
    analysis += `• Bullish Patterns: ${bullishPatterns} (${((bullishPatterns / recentPatterns.length) * 100).toFixed(1)}%)\n`;
    analysis += `• Bearish Patterns: ${bearishPatterns} (${((bearishPatterns / recentPatterns.length) * 100).toFixed(1)}%)\n`;
    analysis += `• Neutral Patterns: ${neutralPatterns} (${((neutralPatterns / recentPatterns.length) * 100).toFixed(1)}%)\n\n`;
    
    analysis += `🎯 **Pattern-Based Recommendation:**\n`;
    if (sentiment.includes('BULLISH')) {
      analysis += `• Strong bullish pattern signals detected\n`;
      analysis += `• Multiple reversal/continuation patterns favor upside\n`;
      analysis += `• Daily timeframe confirms bullish momentum\n`;
    } else if (sentiment.includes('BEARISH')) {
      analysis += `• Strong bearish pattern signals detected\n`;
      analysis += `• Multiple reversal/continuation patterns favor downside\n`;
      analysis += `• Daily timeframe confirms bearish momentum\n`;
    } else {
      analysis += `• Mixed or neutral pattern signals\n`;
      analysis += `• No clear directional bias from patterns\n`;
      analysis += `• Wait for clearer pattern confirmation\n`;
    }
  }
  
  return {
    patterns,
    overallPatternSentiment: sentiment,
    patternConfidence: confidence,
    successProbability: avgSuccessProbability,
    trendDirection,
    analysis
  };
};