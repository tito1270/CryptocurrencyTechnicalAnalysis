export interface Broker {
  id: string;
  name: string;
  logo: string;
  pairs: string[];
}

export interface TechnicalIndicator {
  id: string;
  name: string;
  category: string;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  value: number;
  description: string;
}

export interface TradingStrategy {
  id: string;
  name: string;
  type: string;
  signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  description: string;
}

export interface PriceData {
  broker: string;
  pair: string;
  price: number;
  change24h: number;
  volume: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

export interface AnalysisResult {
  pair: string;
  broker: string;
  timeframe: string;
  tradeType: 'SPOT' | 'FUTURES';
  overallSentiment: 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH';
  confidence: number;
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  recommendedEntryPrice: number;
  profitTarget: number;
  stopLoss: number;
  riskRewardRatio: number;
  newsImpact: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
  newsAnalysis: string;
  upcomingEvents?: string[];
  entryPrice: number;
  targetPrice: number;
  supportLevel: number;
  resistanceLevel: number;
  indicators: TechnicalIndicator[];
  strategies: TradingStrategy[];
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  source: string;
  timestamp: number;
  relevantPairs: string[];
}