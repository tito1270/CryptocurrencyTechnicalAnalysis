import { TechnicalIndicator } from '../types';

export const technicalIndicators: TechnicalIndicator[] = [
  {
    id: 'rsi',
    name: 'RSI (14)',
    category: 'Momentum',
    signal: 'BUY',
    value: 65.4,
    description: 'Relative Strength Index - measures overbought/oversold conditions'
  },
  {
    id: 'macd',
    name: 'MACD (12,26,9)',
    category: 'Trend',
    signal: 'BUY',
    value: 0.045,
    description: 'Moving Average Convergence Divergence'
  },
  {
    id: 'stochastic',
    name: 'Stochastic %K',
    category: 'Momentum',
    signal: 'SELL',
    value: 78.2,
    description: 'Stochastic oscillator comparing closing price to price range'
  },
  {
    id: 'bollinger',
    name: 'Bollinger Bands',
    category: 'Volatility',
    signal: 'NEUTRAL',
    value: 0.75,
    description: 'Price channels based on standard deviation'
  },
  {
    id: 'williams_r',
    name: 'Williams %R',
    category: 'Momentum',
    signal: 'BUY',
    value: -25.6,
    description: 'Momentum indicator measuring overbought/oversold levels'
  },
  {
    id: 'cci',
    name: 'CCI (20)',
    category: 'Momentum',
    signal: 'BUY',
    value: 45.8,
    description: 'Commodity Channel Index'
  },
  {
    id: 'apo',
    name: 'APO (12,26)',
    category: 'Trend',
    signal: 'BUY',
    value: 2.3,
    description: 'Absolute Price Oscillator'
  },
  {
    id: 'ppo',
    name: 'PPO (12,26,9)',
    category: 'Momentum',
    signal: 'NEUTRAL',
    value: 1.2,
    description: 'Percentage Price Oscillator'
  },
  {
    id: 'mom',
    name: 'Momentum (10)',
    category: 'Momentum',
    signal: 'BUY',
    value: 1850.4,
    description: 'Rate of change indicator'
  },
  {
    id: 'roc',
    name: 'ROC (12)',
    category: 'Momentum',
    signal: 'BUY',
    value: 4.2,
    description: 'Rate of Change'
  },
  {
    id: 'adx',
    name: 'ADX (14)',
    category: 'Trend',
    signal: 'BUY',
    value: 28.5,
    description: 'Average Directional Index - trend strength'
  },
  {
    id: 'aroon',
    name: 'Aroon (14)',
    category: 'Trend',
    signal: 'BUY',
    value: 71.4,
    description: 'Aroon oscillator - trend identification'
  },
  {
    id: 'obv',
    name: 'OBV',
    category: 'Volume',
    signal: 'BUY',
    value: 12500000,
    description: 'On Balance Volume'
  },
  {
    id: 'cmf',
    name: 'CMF (20)',
    category: 'Volume',
    signal: 'BUY',
    value: 0.15,
    description: 'Chaikin Money Flow'
  },
  {
    id: 'fi',
    name: 'Force Index (13)',
    category: 'Volume',
    signal: 'BUY',
    value: 15680,
    description: 'Force Index - price and volume momentum'
  },
  {
    id: 'emv',
    name: 'EMV (14)',
    category: 'Volume',
    signal: 'NEUTRAL',
    value: 0.8,
    description: 'Ease of Movement'
  },
  {
    id: 'vpt',
    name: 'VPT',
    category: 'Volume',
    signal: 'BUY',
    value: 8900000,
    description: 'Volume Price Trend'
  },
  {
    id: 'nvi',
    name: 'NVI',
    category: 'Volume',
    signal: 'BUY',
    value: 1000.8,
    description: 'Negative Volume Index'
  },
  {
    id: 'mfi',
    name: 'MFI (14)',
    category: 'Volume',
    signal: 'NEUTRAL',
    value: 55.2,
    description: 'Money Flow Index'
  },
  {
    id: 'trix',
    name: 'TRIX (14)',
    category: 'Trend',
    signal: 'BUY',
    value: 0.0012,
    description: 'Triple Exponentially Smoothed Average'
  },
  {
    id: 'vortex',
    name: 'Vortex (14)',
    category: 'Trend',
    signal: 'BUY',
    value: 1.08,
    description: 'Vortex Indicator'
  },
  {
    id: 'kst',
    name: 'KST',
    category: 'Momentum',
    signal: 'BUY',
    value: 15.6,
    description: 'Know Sure Thing oscillator'
  },
  {
    id: 'dmi',
    name: 'DMI (14)',
    category: 'Trend',
    signal: 'BUY',
    value: 25.8,
    description: 'Directional Movement Index'
  },
  {
    id: 'dpo',
    name: 'DPO (20)',
    category: 'Trend',
    signal: 'NEUTRAL',
    value: 125.4,
    description: 'Detrended Price Oscillator'
  },
  {
    id: 'sar',
    name: 'Parabolic SAR',
    category: 'Trend',
    signal: 'BUY',
    value: 42150.5,
    description: 'Parabolic Stop and Reverse'
  }
];