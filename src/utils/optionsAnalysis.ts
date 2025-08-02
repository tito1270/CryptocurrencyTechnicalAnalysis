import { CandlestickPattern, TrendAnalysis, PatternAnalysisResult } from '../types';

export interface AdvancedOptionsStrategy {
  name: string;
  type: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'VOLATILITY';
  complexity: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  maxRisk: string;
  maxProfit: string;
  breakeven: string[];
  timeDecay: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  volatilityImpact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  description: string;
  setup: string[];
  marketOutlook: string;
  riskReward: string;
  successProbability: number;
  idealMarketConditions: string[];
  exitStrategy: string[];
  adjustments: string[];
}

export interface OptionsAnalysisResult {
  primaryStrategy: AdvancedOptionsStrategy;
  alternativeStrategies: AdvancedOptionsStrategy[];
  marketContext: {
    impliedVolatility: string;
    timeToExpiration: string;
    technicalBias: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  recommendations: {
    positionSize: string;
    expiration: string;
    strikes: string;
    timing: string;
    hedging: string;
  };
}

// Define comprehensive options strategies
const optionsStrategies: Record<string, AdvancedOptionsStrategy> = {
  longCall: {
    name: 'Long Call',
    type: 'BULLISH',
    complexity: 'BEGINNER',
    maxRisk: 'Premium paid',
    maxProfit: 'Unlimited',
    breakeven: ['Strike + Premium'],
    timeDecay: 'NEGATIVE',
    volatilityImpact: 'POSITIVE',
    description: 'Simple bullish strategy with limited risk and unlimited profit potential',
    setup: ['Buy 1 Call Option ATM or slightly OTM'],
    marketOutlook: 'Expecting significant upward movement',
    riskReward: 'Limited risk, unlimited reward',
    successProbability: 35,
    idealMarketConditions: ['Strong bullish momentum', 'Low to rising implied volatility', 'Clear breakout patterns'],
    exitStrategy: ['Close position at 50-100% profit', 'Close at 50% loss', 'Roll to next expiration if still bullish'],
    adjustments: ['Roll up and out if profitable', 'Add protective put if position moves against you']
  },

  longPut: {
    name: 'Long Put',
    type: 'BEARISH',
    complexity: 'BEGINNER',
    maxRisk: 'Premium paid',
    maxProfit: 'Strike - Premium (if stock goes to zero)',
    breakeven: ['Strike - Premium'],
    timeDecay: 'NEGATIVE',
    volatilityImpact: 'POSITIVE',
    description: 'Simple bearish strategy with limited risk and high profit potential',
    setup: ['Buy 1 Put Option ATM or slightly OTM'],
    marketOutlook: 'Expecting significant downward movement',
    riskReward: 'Limited risk, high reward potential',
    successProbability: 35,
    idealMarketConditions: ['Strong bearish momentum', 'Low to rising implied volatility', 'Clear breakdown patterns'],
    exitStrategy: ['Close position at 50-100% profit', 'Close at 50% loss', 'Roll to next expiration if still bearish'],
    adjustments: ['Roll down and out if profitable', 'Add protective call if position moves against you']
  },

  bullCallSpread: {
    name: 'Bull Call Spread',
    type: 'BULLISH',
    complexity: 'INTERMEDIATE',
    maxRisk: 'Net premium paid',
    maxProfit: 'Difference between strikes - net premium',
    breakeven: ['Lower strike + net premium'],
    timeDecay: 'NEGATIVE',
    volatilityImpact: 'NEUTRAL',
    description: 'Moderate bullish strategy with limited risk and profit',
    setup: ['Buy ATM call', 'Sell OTM call (+5-10%)'],
    marketOutlook: 'Expecting moderate upward movement',
    riskReward: 'Limited risk, limited reward',
    successProbability: 50,
    idealMarketConditions: ['Moderate bullish momentum', 'High implied volatility', 'Range-bound to mildly bullish'],
    exitStrategy: ['Close at 50% max profit', 'Close at 50% loss', 'Manage near expiration'],
    adjustments: ['Close short leg if breached', 'Roll entire spread if needed']
  },

  bearPutSpread: {
    name: 'Bear Put Spread',
    type: 'BEARISH',
    complexity: 'INTERMEDIATE',
    maxRisk: 'Net premium paid',
    maxProfit: 'Difference between strikes - net premium',
    breakeven: ['Higher strike - net premium'],
    timeDecay: 'NEGATIVE',
    volatilityImpact: 'NEUTRAL',
    description: 'Moderate bearish strategy with limited risk and profit',
    setup: ['Buy ATM put', 'Sell OTM put (-5-10%)'],
    marketOutlook: 'Expecting moderate downward movement',
    riskReward: 'Limited risk, limited reward',
    successProbability: 50,
    idealMarketConditions: ['Moderate bearish momentum', 'High implied volatility', 'Range-bound to mildly bearish'],
    exitStrategy: ['Close at 50% max profit', 'Close at 50% loss', 'Manage near expiration'],
    adjustments: ['Close short leg if breached', 'Roll entire spread if needed']
  },

  ironCondor: {
    name: 'Iron Condor',
    type: 'NEUTRAL',
    complexity: 'ADVANCED',
    maxRisk: 'Net premium paid',
    maxProfit: 'Net premium received',
    breakeven: ['Lower strike + net credit', 'Upper strike - net credit'],
    timeDecay: 'POSITIVE',
    volatilityImpact: 'NEGATIVE',
    description: 'Neutral strategy profiting from range-bound movement',
    setup: ['Sell OTM put', 'Buy further OTM put', 'Sell OTM call', 'Buy further OTM call'],
    marketOutlook: 'Expecting sideways movement within range',
    riskReward: 'Limited risk, limited reward',
    successProbability: 65,
    idealMarketConditions: ['Low volatility', 'Range-bound market', 'High implied volatility'],
    exitStrategy: ['Close at 25-50% max profit', 'Manage untested side', 'Close if price approaches short strikes'],
    adjustments: ['Close untested side early', 'Convert to iron butterfly', 'Roll strikes if needed']
  },

  longStraddle: {
    name: 'Long Straddle',
    type: 'VOLATILITY',
    complexity: 'INTERMEDIATE',
    maxRisk: 'Total premium paid',
    maxProfit: 'Unlimited',
    breakeven: ['Strike + total premium', 'Strike - total premium'],
    timeDecay: 'NEGATIVE',
    volatilityImpact: 'POSITIVE',
    description: 'Volatility strategy profiting from large price movements',
    setup: ['Buy ATM call', 'Buy ATM put'],
    marketOutlook: 'Expecting large movement in either direction',
    riskReward: 'Limited risk, unlimited reward',
    successProbability: 30,
    idealMarketConditions: ['Low implied volatility', 'Expecting major news/events', 'High volatility patterns'],
    exitStrategy: ['Close profitable leg first', 'Hold other leg for further movement', 'Close both at 50% loss'],
    adjustments: ['Convert to strangle', 'Close one side and run the other', 'Roll to different strikes']
  },

  shortStraddle: {
    name: 'Short Straddle',
    type: 'NEUTRAL',
    complexity: 'ADVANCED',
    maxRisk: 'Unlimited',
    maxProfit: 'Net premium received',
    breakeven: ['Strike + net credit', 'Strike - net credit'],
    timeDecay: 'POSITIVE',
    volatilityImpact: 'NEGATIVE',
    description: 'High-risk neutral strategy profiting from minimal movement',
    setup: ['Sell ATM call', 'Sell ATM put'],
    marketOutlook: 'Expecting minimal price movement',
    riskReward: 'Unlimited risk, limited reward',
    successProbability: 70,
    idealMarketConditions: ['High implied volatility', 'Expected volatility contraction', 'Range-bound market'],
    exitStrategy: ['Close at 25% max profit', 'Manage aggressively', 'Have stop loss plan'],
    adjustments: ['Convert to iron condor', 'Roll strikes', 'Close early if volatility expands']
  },

  callBackspread: {
    name: 'Call Backspread',
    type: 'BULLISH',
    complexity: 'ADVANCED',
    maxRisk: 'Net debit + spread width',
    maxProfit: 'Unlimited above upper breakeven',
    breakeven: ['Lower strike + net cost', 'Upper strike + ratio adjustment'],
    timeDecay: 'NEGATIVE',
    volatilityImpact: 'POSITIVE',
    description: 'Advanced bullish strategy with unlimited profit potential',
    setup: ['Sell 1 ITM call', 'Buy 2 OTM calls'],
    marketOutlook: 'Expecting explosive upward movement',
    riskReward: 'Limited risk, unlimited reward above upper BE',
    successProbability: 25,
    idealMarketConditions: ['Strong bullish patterns', 'Low implied volatility', 'Expecting major breakout'],
    exitStrategy: ['Close at significant profit', 'Manage carefully near expiration', 'Close if movement stalls'],
    adjustments: ['Close short leg if breached', 'Adjust ratio if needed', 'Convert to different strategy']
  },

  putBackspread: {
    name: 'Put Backspread',
    type: 'BEARISH',
    complexity: 'ADVANCED',
    maxRisk: 'Net debit + spread width',
    maxProfit: 'Substantial below lower breakeven',
    breakeven: ['Upper strike - net cost', 'Lower strike - ratio adjustment'],
    timeDecay: 'NEGATIVE',
    volatilityImpact: 'POSITIVE',
    description: 'Advanced bearish strategy with high profit potential',
    setup: ['Sell 1 ITM put', 'Buy 2 OTM puts'],
    marketOutlook: 'Expecting explosive downward movement',
    riskReward: 'Limited risk, high reward below lower BE',
    successProbability: 25,
    idealMarketConditions: ['Strong bearish patterns', 'Low implied volatility', 'Expecting major breakdown'],
    exitStrategy: ['Close at significant profit', 'Manage carefully near expiration', 'Close if movement stalls'],
    adjustments: ['Close short leg if breached', 'Adjust ratio if needed', 'Convert to different strategy']
  }
};

export const performAdvancedOptionsAnalysis = (
  patterns: CandlestickPattern[],
  trendAnalysis: TrendAnalysis,
  overallSignal: PatternAnalysisResult['overallSignal'],
  currentPrice: number,
  impliedVolatility: number = 25 // Default IV
): OptionsAnalysisResult => {
  // Determine primary strategy based on patterns and trend
  let primaryStrategyKey = 'ironCondor'; // Default neutral strategy
  const alternativeStrategyKeys: string[] = [];

  // Analyze pattern strength and reliability
  const highReliabilityPatterns = patterns.filter(p => p.reliability === 'HIGH');
  const bullishPatterns = patterns.filter(p => p.type === 'BULLISH' || p.signal.includes('BUY'));
  const bearishPatterns = patterns.filter(p => p.type === 'BEARISH' || p.signal.includes('SELL'));
  const volatilityPatterns = patterns.filter(p => 
    ['outside-bar', 'pin-bar', 'morning-star', 'evening-star'].includes(p.id)
  );

  // Strategy selection logic
  if (overallSignal === 'STRONG_BUY' && trendAnalysis.direction === 'UPTREND') {
    if (highReliabilityPatterns.length > 0 && trendAnalysis.confidence > 80) {
      primaryStrategyKey = 'callBackspread';
      alternativeStrategyKeys.push('longCall', 'bullCallSpread');
    } else {
      primaryStrategyKey = 'longCall';
      alternativeStrategyKeys.push('bullCallSpread', 'callBackspread');
    }
  } else if (overallSignal === 'STRONG_SELL' && trendAnalysis.direction === 'DOWNTREND') {
    if (highReliabilityPatterns.length > 0 && trendAnalysis.confidence > 80) {
      primaryStrategyKey = 'putBackspread';
      alternativeStrategyKeys.push('longPut', 'bearPutSpread');
    } else {
      primaryStrategyKey = 'longPut';
      alternativeStrategyKeys.push('bearPutSpread', 'putBackspread');
    }
  } else if (overallSignal === 'BUY' && trendAnalysis.direction === 'UPTREND') {
    primaryStrategyKey = 'bullCallSpread';
    alternativeStrategyKeys.push('longCall', 'ironCondor');
  } else if (overallSignal === 'SELL' && trendAnalysis.direction === 'DOWNTREND') {
    primaryStrategyKey = 'bearPutSpread';
    alternativeStrategyKeys.push('longPut', 'ironCondor');
  } else if (volatilityPatterns.length > 0 || patterns.some(p => p.type === 'REVERSAL')) {
    if (impliedVolatility < 20) {
      primaryStrategyKey = 'longStraddle';
      alternativeStrategyKeys.push('longCall', 'longPut');
    } else {
      primaryStrategyKey = 'ironCondor';
      alternativeStrategyKeys.push('shortStraddle', 'bullCallSpread');
    }
  } else if (trendAnalysis.direction === 'SIDEWAYS') {
    if (impliedVolatility > 30) {
      primaryStrategyKey = 'ironCondor';
      alternativeStrategyKeys.push('shortStraddle', 'bullCallSpread');
    } else {
      primaryStrategyKey = 'longStraddle';
      alternativeStrategyKeys.push('ironCondor', 'longCall');
    }
  }

  // Determine market context
  const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 
    patterns.length > 2 && highReliabilityPatterns.length > 0 ? 'LOW' :
    patterns.length > 1 || trendAnalysis.confidence > 70 ? 'MEDIUM' : 'HIGH';

  const marketContext = {
    impliedVolatility: impliedVolatility > 30 ? 'HIGH' : impliedVolatility > 20 ? 'MEDIUM' : 'LOW',
    timeToExpiration: '30-45 days optimal for most strategies',
    technicalBias: `${overallSignal.replace('_', ' ')} - ${trendAnalysis.direction}`,
    riskLevel
  };

  // Generate specific recommendations
  const recommendations = {
    positionSize: riskLevel === 'LOW' ? '2-5% of portfolio' : riskLevel === 'MEDIUM' ? '1-3% of portfolio' : '0.5-2% of portfolio',
    expiration: getOptimalExpiration(primaryStrategyKey, volatilityPatterns.length > 0),
    strikes: getOptimalStrikes(primaryStrategyKey, currentPrice, trendAnalysis),
    timing: getOptimalTiming(patterns, trendAnalysis),
    hedging: getHedgingRecommendation(primaryStrategyKey, riskLevel)
  };

  return {
    primaryStrategy: optionsStrategies[primaryStrategyKey],
    alternativeStrategies: alternativeStrategyKeys.map(key => optionsStrategies[key]),
    marketContext,
    recommendations
  };
};

const getOptimalExpiration = (strategyKey: string, hasVolatilityPatterns: boolean): string => {
  if (hasVolatilityPatterns) {
    return '20-30 days to capture quick moves';
  }

  switch (strategyKey) {
    case 'longCall':
    case 'longPut':
      return '45-60 days for time to work';
    case 'bullCallSpread':
    case 'bearPutSpread':
      return '30-45 days for optimal theta decay';
    case 'ironCondor':
    case 'shortStraddle':
      return '30-45 days for maximum theta collection';
    case 'longStraddle':
      return '30-60 days depending on catalyst timing';
    case 'callBackspread':
    case 'putBackspread':
      return '45-90 days for explosive moves';
    default:
      return '30-45 days standard';
  }
};

const getOptimalStrikes = (strategyKey: string, currentPrice: number, trendAnalysis: TrendAnalysis): string => {
  const atm = currentPrice.toFixed(2);
  const resistance = trendAnalysis.resistanceLevel.toFixed(2);
  const support = trendAnalysis.supportLevel.toFixed(2);

  switch (strategyKey) {
    case 'longCall':
      return `ATM ($${atm}) or slightly OTM targeting $${resistance}`;
    case 'longPut':
      return `ATM ($${atm}) or slightly OTM targeting $${support}`;
    case 'bullCallSpread':
      return `Buy $${atm} call, Sell $${(currentPrice * 1.05).toFixed(2)} call`;
    case 'bearPutSpread':
      return `Buy $${atm} put, Sell $${(currentPrice * 0.95).toFixed(2)} put`;
    case 'ironCondor':
      return `Short $${(currentPrice * 0.95).toFixed(2)} put & $${(currentPrice * 1.05).toFixed(2)} call, protect with wings`;
    case 'longStraddle':
      return `ATM straddle at $${atm}`;
    case 'shortStraddle':
      return `ATM straddle at $${atm}`;
    case 'callBackspread':
      return `Sell $${(currentPrice * 0.98).toFixed(2)} call, Buy 2x $${(currentPrice * 1.03).toFixed(2)} calls`;
    case 'putBackspread':
      return `Sell $${(currentPrice * 1.02).toFixed(2)} put, Buy 2x $${(currentPrice * 0.97).toFixed(2)} puts`;
    default:
      return `Center strikes around $${atm}`;
  }
};

const getOptimalTiming = (patterns: CandlestickPattern[], trendAnalysis: TrendAnalysis): string => {
  const hasReversalPatterns = patterns.some(p => p.type === 'REVERSAL');
  const hasHighConfidencePatterns = patterns.some(p => p.confidence > 85);

  if (hasHighConfidencePatterns && hasReversalPatterns) {
    return 'Enter immediately - high conviction setup';
  } else if (trendAnalysis.confidence > 80) {
    return 'Enter on any minor pullback in trend direction';
  } else if (patterns.length > 2) {
    return 'Wait for confirmation candle before entry';
  } else {
    return 'Scale into position over 2-3 days';
  }
};

const getHedgingRecommendation = (strategyKey: string, riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'): string => {
  if (riskLevel === 'HIGH') {
    return 'Consider hedging with opposite direction position or protective stops';
  }

  switch (strategyKey) {
    case 'longCall':
      return 'Consider protective put if position becomes profitable';
    case 'longPut':
      return 'Consider protective call if position becomes profitable';
    case 'shortStraddle':
      return 'Essential: Have adjustment plan ready, consider delta hedging';
    case 'callBackspread':
    case 'putBackspread':
      return 'Monitor carefully, have exit plan for unfavorable scenarios';
    default:
      return 'Standard position sizing and stop losses sufficient';
  }
};