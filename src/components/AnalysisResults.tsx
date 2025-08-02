import React from 'react';
import { AnalysisResult } from '../types';
import { TrendingUp, TrendingDown, Target, Shield, AlertTriangle, DollarSign, Newspaper } from 'lucide-react';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result }) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'STRONG_BULLISH': return 'text-emerald-400';
      case 'BULLISH': return 'text-emerald-300';
      case 'NEUTRAL': return 'text-gray-300';
      case 'BEARISH': return 'text-red-300';
      case 'STRONG_BEARISH': return 'text-red-400';
      default: return 'text-gray-300';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'STRONG_BUY': return 'bg-emerald-600 text-white';
      case 'BUY': return 'bg-emerald-500 text-white';
      case 'HOLD': return 'bg-yellow-500 text-white';
      case 'SELL': return 'bg-red-500 text-white';
      case 'STRONG_SELL': return 'bg-red-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY':
      case 'STRONG_BUY':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'SELL':
      case 'STRONG_SELL':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Analysis Results</h2>
          <div className="flex items-center space-x-3 mt-1">
            <span className="text-sm text-gray-400">{result.pair}</span>
            <span className="text-sm text-gray-400">{result.broker.toUpperCase()}</span>
            <span className="text-sm text-gray-400">{result.timeframe}</span>
            <span className={`text-sm font-medium px-2 py-1 rounded ${
              result.tradeType === 'SPOT' 
                ? 'bg-emerald-600 text-emerald-100' 
                : 'bg-blue-600 text-blue-100'
            }`}>
              {result.tradeType}
            </span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(result.recommendation)}`}>
          {result.recommendation.replace('_', ' ')}
        </div>
      </div>
      
      {/* Main Recommendation */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          <span>Trading Recommendation</span>
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-emerald-400">${result.recommendedEntryPrice.toFixed(4)}</div>
            <div className="text-xs text-gray-400">Entry Price</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-400">${result.profitTarget.toFixed(4)}</div>
            <div className="text-xs text-gray-400">Profit Target</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-400">${result.stopLoss.toFixed(4)}</div>
            <div className="text-xs text-gray-400">Stop Loss</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-400">{result.riskRewardRatio.toFixed(1)}:1</div>
            <div className="text-xs text-gray-400">Risk/Reward</div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-sm text-gray-300 whitespace-pre-line">
            {result.explanation}
          </div>
        </div>
      </div>
      
      {/* Market Sentiment */}
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Market Sentiment</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(result.overallSentiment)} bg-gray-700`}>
            {result.overallSentiment.replace('_', ' ')}
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{result.confidence}%</div>
            <div className="text-sm text-gray-400">Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">${result.entryPrice.toFixed(6)}</div>
            <div className="text-sm text-gray-400">Current Price</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">${result.supportLevel.toFixed(4)}</div>
            <div className="text-sm text-gray-400">Support</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">${result.resistanceLevel.toFixed(4)}</div>
            <div className="text-sm text-gray-400">Resistance</div>
          </div>
        </div>
      </div>
      
      {/* Technical Indicators */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Technical Indicators</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {result.indicators.map(indicator => (
            <div key={indicator.id} className="bg-gray-900 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{indicator.name}</span>
                <div className="flex items-center space-x-2">
                  {getSignalIcon(indicator.signal)}
                  <span className={`text-xs font-medium ${getSentimentColor(indicator.signal)}`}>
                    {indicator.signal}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-400">{indicator.category}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Trading Strategies */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Trading Strategies</h3>
        <div className="grid grid-cols-1 gap-3">
          {result.strategies.map(strategy => (
            <div key={strategy.id} className="bg-gray-900 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">{strategy.name}</span>
                <div className="flex items-center space-x-2">
                  {getSignalIcon(strategy.signal)}
                  <span className={`text-xs font-medium ${getSentimentColor(strategy.signal)}`}>
                    {strategy.signal.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-400">{strategy.confidence}%</span>
                </div>
              </div>
              <div className="text-xs text-gray-300">{strategy.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* News Analysis */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
          <Newspaper className="w-5 h-5 text-blue-400" />
          <span>News Analysis</span>
        </h3>
        <div className="text-sm text-gray-300 whitespace-pre-line">
          {result.newsAnalysis}
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;