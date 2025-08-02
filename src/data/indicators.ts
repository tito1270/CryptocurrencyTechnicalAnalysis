import { TechnicalIndicator } from '../types';

export const technicalIndicators: TechnicalIndicator[] = [
  {
    id: 'rsi',
    name: 'RSI (14)',
    category: 'Momentum',
    signal: 'SELL',
    value: 78.4,
    description: 'Relative Strength Index - measures overbought/oversold conditions'
  },
  {
    id: 'macd',
    name: 'MACD (12,26,9)',
    category: 'Trend',
    signal: 'BUY',
    value: 0.025,
    description: 'Moving Average Convergence Divergence'
  },
  {
    id: 'stochastic',
    name: 'Stochastic %K',
    category: 'Momentum',
    signal: 'SELL',
    value: 82.7,
    description: 'Stochastic oscillator comparing closing price to price range'
  },
  {
    id: 'bollinger',
    name: 'Bollinger Bands',
    category: 'Volatility',
    signal: 'SELL',
    value: 0.92,
    description: 'Price channels based on standard deviation'
  },
  {
    id: 'williams_r',
    name: 'Williams %R',
    category: 'Momentum',
    signal: 'SELL',
    value: -12.8,
    description: 'Momentum indicator measuring overbought/oversold levels'
  },
  {
    id: 'cci',
    name: 'CCI (20)',
    category: 'Momentum',
    signal: 'SELL',
    value: 145.8,
    description: 'Commodity Channel Index'
  },
  {
    id: 'apo',
    name: 'APO (12,26)',
    category: 'Trend',
    signal: 'BUY',
    value: 1.8,
    description: 'Absolute Price Oscillator'
  },
  {
    id: 'ppo',
    name: 'PPO (12,26,9)',
    category: 'Momentum',
    signal: 'NEUTRAL',
    value: -0.2,
    description: 'Percentage Price Oscillator'
  },
  {
    id: 'mom',
    name: 'Momentum (10)',
    category: 'Momentum',
    signal: 'SELL',
    value: -850.4,
    description: 'Rate of change indicator'
  },
  {
    id: 'roc',
    name: 'ROC (12)',
    category: 'Momentum',
    signal: 'SELL',
    value: -2.8,
    description: 'Rate of Change'
  },
  {
    id: 'adx',
    name: 'ADX (14)',
    category: 'Trend',
    signal: 'NEUTRAL',
    value: 22.3,
    description: 'Average Directional Index - trend strength'
  },
  {
    id: 'aroon',
    name: 'Aroon (14)',
    category: 'Trend',
    signal: 'SELL',
    value: 28.6,
    description: 'Aroon oscillator - trend identification'
  },
  {
    id: 'obv',
    name: 'OBV',
    category: 'Volume',
    signal: 'SELL',
    value: -8500000,
    description: 'On Balance Volume'
  },
  {
    id: 'cmf',
    name: 'CMF (20)',
    category: 'Volume',
    signal: 'SELL',
    value: -0.22,
    description: 'Chaikin Money Flow'
  },
  {
    id: 'fi',
    name: 'Force Index (13)',
    category: 'Volume',
    signal: 'SELL',
    value: -18650,
    description: 'Force Index - price and volume momentum'
  },
  {
    id: 'emv',
    name: 'EMV (14)',
    category: 'Volume',
    signal: 'NEUTRAL',
    value: -0.3,
    description: 'Ease of Movement'
  },
  {
    id: 'vpt',
    name: 'VPT',
    category: 'Volume',
    signal: 'SELL',
    value: -5200000,
    description: 'Volume Price Trend'
  },
  {
    id: 'nvi',
    name: 'NVI',
    category: 'Volume',
    signal: 'BUY',
    value: 1002.1,
    description: 'Negative Volume Index'
  },
  {
    id: 'mfi',
    name: 'MFI (14)',
    category: 'Volume',
    signal: 'SELL',
    value: 75.8,
    description: 'Money Flow Index'
  },
  {
    id: 'trix',
    name: 'TRIX (14)',
    category: 'Trend',
    signal: 'NEUTRAL',
    value: -0.0008,
    description: 'Triple Exponentially Smoothed Average'
  },
  {
    id: 'vortex',
    name: 'Vortex (14)',
    category: 'Trend',
    signal: 'SELL',
    value: 0.89,
    description: 'Vortex Indicator'
  },
  {
    id: 'kst',
    name: 'KST',
    category: 'Momentum',
    signal: 'SELL',
    value: -12.4,
    description: 'Know Sure Thing oscillator'
  },
  {
    id: 'dmi',
    name: 'DMI (14)',
    category: 'Trend',
    signal: 'SELL',
    value: 18.2,
    description: 'Directional Movement Index'
  },
  {
    id: 'dpo',
    name: 'DPO (20)',
    category: 'Trend',
    signal: 'NEUTRAL',
    value: -45.7,
    description: 'Detrended Price Oscillator'
  },
  {
    id: 'sar',
    name: 'Parabolic SAR',
    category: 'Trend',
    signal: 'SELL',
    value: 48750.2,
    description: 'Parabolic Stop and Reverse'
  }
];