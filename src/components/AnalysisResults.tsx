import React from 'react';
import { AnalysisResult } from '../types';
import { TrendingUp, TrendingDown, Target, Shield, AlertTriangle, DollarSign, Newspaper, Calendar, TrendingUp as BullIcon, TrendingDown as BearIcon } from 'lucide-react';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result }) => {
  // Sentiment color mapping
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'STRONG_BULLISH': return 'text-emerald-400';
      case 'BULLISH': return 'text-green-400';
      case 'NEUTRAL': return 'text-yellow-400';
      case 'BEARISH': return 'text-red-400';
      case 'STRONG_BEARISH': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'STRONG_BUY': return 'bg-emerald-600 border-emerald-500';
      case 'BUY': return 'bg-green-600 border-green-500';
      case 'HOLD': return 'bg-yellow-600 border-yellow-500';
      case 'SELL': return 'bg-red-600 border-red-500';
      case 'STRONG_SELL': return 'bg-red-700 border-red-600';
      default: return 'bg-gray-600 border-gray-500';
    }
  };

  // Success probability color based on percentage
  const getSuccessProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-emerald-400';
    if (probability >= 70) return 'text-green-400';
    if (probability >= 60) return 'text-yellow-400';
    if (probability >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  // Trend direction color
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'UPTREND': return 'text-emerald-400';
      case 'DOWNTREND': return 'text-red-400';
      case 'SIDEWAYS': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-6">
      {/* Header Section */}
      <div className="border-b border-gray-700 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              Daily Timeframe • {result.priceSource === 'LIVE_API' ? '🟢 Live' : '🟡 Simulated'} Data
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Trading Pair</div>
            <div className="text-lg font-semibold text-white">{result.pair}</div>
            <div className="text-sm text-gray-500">{result.broker.toUpperCase()}</div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Overall Sentiment</div>
            <div className={`text-lg font-semibold ${getSentimentColor(result.overallSentiment)}`}>
              {result.overallSentiment.replace('_', ' ')}
            </div>
            <div className="text-sm text-gray-500">Confidence: {result.confidence}%</div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Success Probability</div>
            <div className={`text-lg font-semibold ${getSuccessProbabilityColor(result.successProbability || 50)}`}>
              {result.successProbability?.toFixed(1) || '50.0'}%
            </div>
            <div className="text-sm text-gray-500">Pattern Enhanced</div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Trend Direction</div>
            <div className={`text-lg font-semibold ${getTrendColor(result.trendDirection || 'SIDEWAYS')}`}>
              {result.trendDirection || 'SIDEWAYS'}
            </div>
            <div className="text-sm text-gray-500">Daily Analysis</div>
          </div>
        </div>
      </div>

      {/* Recommendation Section */}
      <div className={`p-4 rounded-lg border-2 ${getRecommendationColor(result.recommendation)}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">
            🎯 {result.recommendation.replace('_', ' ')} RECOMMENDATION
          </h3>
          <div className="text-sm text-white bg-black bg-opacity-30 px-3 py-1 rounded">
            Risk-Reward: {result.riskRewardRatio.toFixed(1)}:1
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-black bg-opacity-30 p-3 rounded">
            <div className="text-sm text-gray-200 mb-1">Entry Price</div>
            <div className="text-lg font-semibold text-white">
              ${result.recommendedEntryPrice.toFixed(4)}
            </div>
          </div>

          <div className="bg-black bg-opacity-30 p-3 rounded">
            <div className="text-sm text-gray-200 mb-1">Profit Target</div>
            <div className="text-lg font-semibold text-white">
              ${result.profitTarget.toFixed(4)}
            </div>
          </div>

          <div className="bg-black bg-opacity-30 p-3 rounded">
            <div className="text-sm text-gray-200 mb-1">Stop Loss</div>
            <div className="text-lg font-semibold text-white">
              ${result.stopLoss.toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      {/* Candlestick Pattern Analysis Section */}
      {result.candlestickPatterns && result.candlestickPatterns.length > 0 && (
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            🕯️ Candlestick Pattern Analysis
            <span className="ml-3 text-sm bg-blue-600 px-2 py-1 rounded">
              Daily Timeframe
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Pattern Sentiment</div>
              <div className={`text-lg font-semibold ${getSentimentColor(result.patternSentiment || 'NEUTRAL')}`}>
                {result.patternSentiment?.replace('_', ' ') || 'NEUTRAL'}
              </div>
              <div className="text-sm text-gray-500">
                Confidence: {result.patternConfidence?.toFixed(1) || '50.0'}%
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Patterns Detected</div>
              <div className="text-lg font-semibold text-white">
                {result.candlestickPatterns.length}
              </div>
              <div className="text-sm text-gray-500">
                Last 30 days analyzed
              </div>
            </div>
          </div>

          {/* Top 3 Recent Patterns */}
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white mb-3">Recent Key Patterns</h4>
            {result.candlestickPatterns.slice(0, 3).map((pattern, index) => {
              const getPatternTypeColor = (type: string) => {
                switch (type) {
                  case 'BULLISH': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  case 'BEARISH': return 'bg-red-100 text-red-800 border-red-200';
                  case 'NEUTRAL': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                  case 'REVERSAL': return 'bg-purple-100 text-purple-800 border-purple-200';
                  case 'CONTINUATION': return 'bg-blue-100 text-blue-800 border-blue-200';
                  default: return 'bg-gray-100 text-gray-800 border-gray-200';
                }
              };

              const getReliabilityIcon = (reliability: string) => {
                switch (reliability) {
                  case 'HIGH': return '🔥';
                  case 'MEDIUM': return '⚡';
                  case 'LOW': return '💫';
                  default: return '📊';
                }
              };

              const daysAgo = Math.floor((Date.now() - pattern.detectedAt) / (24 * 60 * 60 * 1000));

              return (
                <div key={index} className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getReliabilityIcon(pattern.reliability)}</span>
                      <div>
                        <div className="text-lg font-semibold text-white">{pattern.name}</div>
                        <div className="text-sm text-gray-400">{pattern.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getPatternTypeColor(pattern.type)}`}>
                        {pattern.type}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    <div>
                      <div className="text-xs text-gray-400">Success Rate</div>
                      <div className={`text-sm font-semibold ${getSuccessProbabilityColor(pattern.successProbability)}`}>
                        {pattern.successProbability}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Reliability</div>
                      <div className="text-sm font-semibold text-white">{pattern.reliability}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Strength</div>
                      <div className="text-sm font-semibold text-white">{pattern.strength}/10</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Detected</div>
                      <div className="text-sm font-semibold text-white">
                        {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Technical Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Indicators */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-4">Technical Indicators ({result.indicators.length})</h3>
          <div className="space-y-3">
            {result.indicators.map((indicator, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                <div>
                  <div className="font-medium text-white">{indicator.name}</div>
                  <div className="text-sm text-gray-400">{indicator.description}</div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${getSentimentColor(indicator.signal)}`}>
                    {indicator.signal}
                  </div>
                  <div className="text-sm text-gray-400">{indicator.value.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategies */}
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-4">Trading Strategies ({result.strategies.length})</h3>
          <div className="space-y-3">
            {result.strategies.map((strategy, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                <div>
                  <div className="font-medium text-white">{strategy.name}</div>
                  <div className="text-sm text-gray-400">{strategy.description}</div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${getSentimentColor(strategy.signal)}`}>
                    {strategy.signal.replace('_', ' ')}
                  </div>
                  <div className="text-sm text-gray-400">{strategy.confidence}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Price Levels */}
      <div className="bg-gray-900 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-4">Key Price Levels</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-3 rounded">
            <div className="text-sm text-gray-400 mb-1">Support Level</div>
            <div className="text-lg font-semibold text-green-400">
              ${result.supportLevel.toFixed(4)}
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded">
            <div className="text-sm text-gray-400 mb-1">Entry Price</div>
            <div className="text-lg font-semibold text-blue-400">
              ${result.entryPrice.toFixed(4)}
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded">
            <div className="text-sm text-gray-400 mb-1">Target Price</div>
            <div className="text-lg font-semibold text-yellow-400">
              ${result.targetPrice.toFixed(4)}
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded">
            <div className="text-sm text-gray-400 mb-1">Resistance Level</div>
            <div className="text-lg font-semibold text-red-400">
              ${result.resistanceLevel.toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="bg-gray-900 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-4">Detailed Analysis</h3>
        <div className="prose prose-invert max-w-none">
          <pre className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">
            {result.explanation}
          </pre>
        </div>
      </div>

      {/* Pattern Analysis Details */}
      {result.patternAnalysis && (
        <div className="bg-gray-900 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-white mb-4">🕯️ Candlestick Pattern Details</h3>
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">
              {result.patternAnalysis}
            </pre>
          </div>
        </div>
      )}

      {/* News Analysis */}
      <div className="bg-gray-900 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-4">
          News Impact Analysis 
          <span className={`ml-3 px-2 py-1 rounded text-sm ${
            result.newsImpact === 'HIGH' ? 'bg-red-600' : 
            result.newsImpact === 'MEDIUM' ? 'bg-yellow-600' : 'bg-green-600'
          }`}>
            {result.newsImpact} IMPACT
          </span>
        </h3>
        <div className="prose prose-invert max-w-none">
          <pre className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">
            {result.newsAnalysis}
          </pre>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-900 border border-yellow-700 p-4 rounded-lg">
        <div className="flex items-start">
          <div className="text-yellow-400 mr-3">⚠️</div>
          <div>
            <div className="font-semibold text-yellow-200 mb-1">Investment Disclaimer</div>
            <div className="text-sm text-yellow-300">
              This analysis is for educational purposes only and should not be considered as financial advice. 
              Cryptocurrency trading involves significant risk. Success probability is based on historical pattern 
              performance and does not guarantee future results. Always conduct your own research and consider 
              consulting with financial advisors before making investment decisions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
