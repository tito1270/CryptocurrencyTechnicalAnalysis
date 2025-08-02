import { TradingStrategy } from '../types';

export const tradingStrategies: TradingStrategy[] = [
  {
    id: 'golden_cross',
    name: 'Golden Cross',
    type: 'Trend Following',
    signal: 'BUY',
    confidence: 78,
    description: '50-day MA crossing above 200-day MA - strong bullish signal'
  },
  {
    id: 'death_cross',
    name: 'Death Cross',
    type: 'Trend Following',
    signal: 'STRONG_SELL',
    confidence: 82,
    description: '50-day MA crossing below 200-day MA - strong bearish signal'
  },
  {
    id: 'breakout',
    name: 'Breakout Strategy',
    type: 'Momentum',
    signal: 'SELL',
    confidence: 75,
    description: 'Price breaking below key support with high volume'
  },
  {
    id: 'mean_reversion',
    name: 'Mean Reversion',
    type: 'Counter-trend',
    signal: 'SELL',
    confidence: 68,
    description: 'Price extended far above mean, expecting reversion'
  },
  {
    id: 'momentum',
    name: 'Momentum Strategy',
    type: 'Momentum',
    signal: 'SELL',
    confidence: 72,
    description: 'Strong negative momentum with bearish confirmation'
  },
  {
    id: 'support_resistance',
    name: 'Support/Resistance',
    type: 'Technical Levels',
    signal: 'SELL',
    confidence: 79,
    description: 'Price rejecting at key resistance level with volume'
  },
  {
    id: 'rsi_divergence',
    name: 'RSI Divergence',
    type: 'Divergence',
    signal: 'STRONG_SELL',
    confidence: 85,
    description: 'Bearish divergence between price and RSI'
  },
  {
    id: 'macd_crossover',
    name: 'MACD Crossover',
    type: 'Trend',
    signal: 'SELL',
    confidence: 73,
    description: 'MACD line crossing below signal line'
  },
  {
    id: 'bollinger_squeeze',
    name: 'Bollinger Squeeze',
    type: 'Volatility',
    signal: 'NEUTRAL',
    confidence: 60,
    description: 'Low volatility preceding potential breakout'
  },
  {
    id: 'volume_price_trend',
    name: 'Volume Price Trend',
    type: 'Volume',
    signal: 'SELL',
    confidence: 77,
    description: 'Volume confirming bearish price movement'
  },
  {
    id: 'fibonacci_retracement',
    name: 'Fibonacci Retracement',
    type: 'Technical Levels',
    signal: 'SELL',
    confidence: 71,
    description: 'Price rejecting at key Fibonacci resistance levels'
  },
  {
    id: 'harmonic_pattern',
    name: 'Harmonic Patterns',
    type: 'Pattern Recognition',
    signal: 'STRONG_SELL',
    confidence: 89,
    description: 'Bearish harmonic pattern completion'
  },
  {
    id: 'elliott_wave',
    name: 'Elliott Wave',
    type: 'Wave Analysis',
    signal: 'SELL',
    confidence: 76,
    description: 'Wave 5 completion suggesting reversal'
  },
  {
    id: 'ichimoku_cloud',
    name: 'Ichimoku Cloud',
    type: 'Comprehensive',
    signal: 'SELL',
    confidence: 81,
    description: 'Price below cloud with bearish signals'
  },
  {
    id: 'triple_confirmation',
    name: 'Triple Confirmation',
    type: 'Multi-factor',
    signal: 'STRONG_SELL',
    confidence: 93,
    description: 'Price, volume, and momentum all confirming bearish direction'
  },
  {
    id: 'wyckoff_accumulation',
    name: 'Wyckoff Distribution',
    type: 'Market Structure',
    signal: 'SELL',
    confidence: 87,
    description: 'Smart money distribution phase detected'
  }
];