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
    signal: 'SELL',
    confidence: 65,
    description: '50-day MA crossing below 200-day MA - bearish signal'
  },
  {
    id: 'breakout',
    name: 'Breakout Strategy',
    type: 'Momentum',
    signal: 'STRONG_BUY',
    confidence: 85,
    description: 'Price breaking above resistance with high volume'
  },
  {
    id: 'mean_reversion',
    name: 'Mean Reversion',
    type: 'Counter-trend',
    signal: 'BUY',
    confidence: 72,
    description: 'Price returning to average after extreme moves'
  },
  {
    id: 'momentum',
    name: 'Momentum Strategy',
    type: 'Momentum',
    signal: 'BUY',
    confidence: 68,
    description: 'Following strong price momentum with confirmation'
  },
  {
    id: 'support_resistance',
    name: 'Support/Resistance',
    type: 'Technical Levels',
    signal: 'BUY',
    confidence: 75,
    description: 'Trading bounces off key support and resistance levels'
  },
  {
    id: 'rsi_divergence',
    name: 'RSI Divergence',
    type: 'Divergence',
    signal: 'STRONG_BUY',
    confidence: 82,
    description: 'Bullish divergence between price and RSI'
  },
  {
    id: 'macd_crossover',
    name: 'MACD Crossover',
    type: 'Trend',
    signal: 'BUY',
    confidence: 71,
    description: 'MACD line crossing above signal line'
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
    signal: 'BUY',
    confidence: 76,
    description: 'Volume confirming price movement direction'
  },
  {
    id: 'fibonacci_retracement',
    name: 'Fibonacci Retracement',
    type: 'Technical Levels',
    signal: 'BUY',
    confidence: 69,
    description: 'Price bouncing off key Fibonacci levels'
  },
  {
    id: 'harmonic_pattern',
    name: 'Harmonic Patterns',
    type: 'Pattern Recognition',
    signal: 'STRONG_BUY',
    confidence: 88,
    description: 'Bullish harmonic pattern completion'
  },
  {
    id: 'elliott_wave',
    name: 'Elliott Wave',
    type: 'Wave Analysis',
    signal: 'BUY',
    confidence: 73,
    description: 'Wave 3 impulse phase identification'
  },
  {
    id: 'ichimoku_cloud',
    name: 'Ichimoku Cloud',
    type: 'Comprehensive',
    signal: 'BUY',
    confidence: 77,
    description: 'Price above cloud with bullish signals'
  },
  {
    id: 'triple_confirmation',
    name: 'Triple Confirmation',
    type: 'Multi-factor',
    signal: 'STRONG_BUY',
    confidence: 91,
    description: 'Price, volume, and momentum all confirming direction'
  },
  {
    id: 'wyckoff_accumulation',
    name: 'Wyckoff Accumulation',
    type: 'Market Structure',
    signal: 'BUY',
    confidence: 84,
    description: 'Smart money accumulation phase detected'
  }
];