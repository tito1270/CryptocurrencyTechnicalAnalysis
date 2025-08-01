import React from 'react';
import { AnalysisResult } from '../types';
import { TrendingUp, TrendingDown, Target, Shield, AlertTriangle, DollarSign, Newspaper, Calendar, TrendingUp as BullIcon, TrendingDown as BearIcon } from 'lucide-react';

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

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case 'STRONG_BULLISH': return 'bg-emerald-600';
      case 'BULLISH': return 'bg-emerald-500';
      case 'NEUTRAL': return 'bg-gray-500';
      case 'BEARISH': return 'bg-red-500';
      case 'STRONG_BEARISH': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'STRONG_BUY': return 'text-emerald-400 bg-emerald-600';
      case 'BUY': return 'text-emerald-300 bg-emerald-500';
      case 'HOLD': return 'text-yellow-300 bg-yellow-500';
      case 'SELL': return 'text-red-300 bg-red-500';
      case 'STRONG_SELL': return 'text-red-400 bg-red-600';
      default: return 'text-gray-300 bg-gray-500';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'STRONG_BUY':
      case 'BUY':
        return <BullIcon className="w-5 h-5" />;
      case 'SELL':
      case 'STRONG_SELL':
        return <BearIcon className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Analysis Results</h2>
          <div className="flex items-center space-x-3 mt-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">{result.pair}</span>
              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
              <span className="text-sm text-gray-400">{result.broker.toUpperCase()}</span>
              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
              <span className="text-sm text-gray-400">{result.timeframe}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-emerald-400">${result.entryPrice.toFixed(6)}</span>
              <div className={`w-2 h-2 rounded-full animate-pulse ${result.priceSource === 'LIVE_API' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
              <span className={`text-xs ${result.priceSource === 'LIVE_API' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {result.priceSource === 'LIVE_API' ? `LIVE ${result.broker.toUpperCase()}` : 'FALLBACK'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${getRecommendationColor(result.recommendation).split(' ')[1]} text-white`}>
            {getRecommendationIcon(result.recommendation)}
            <span>{result.recommendation.replace('_', ' ')}</span>
          </div>
        </div>
      </div>
      
      {/* Recommendation Summary */}
      <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-emerald-500">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-white flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Trading Recommendation</span>
          </h3>
          <div className={`px-2 py-1 rounded text-xs font-medium ${result.newsImpact === 'HIGH' ? 'bg-red-600' : result.newsImpact === 'MEDIUM' ? 'bg-yellow-600' : 'bg-green-600'} text-white`}>
            {result.newsImpact} NEWS IMPACT
          </div>
        </div>
        
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
        
        <div className="bg-gray-800 rounded-lg p-3 mb-4">
          <h4 className="text-sm font-medium text-white mb-2 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span>Detailed Analysis & Reasoning</span>
          </h4>
          <div className="text-sm text-gray-300 whitespace-pre-line max-h-64 overflow-y-auto">
            {result.explanation}
          </div>
        </div>
        
        {result.upcomingEvents && result.upcomingEvents.length > 0 && (
          <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-700">
            <h4 className="text-sm font-medium text-blue-300 mb-2 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Upcoming Events to Watch</span>
            </h4>
            <ul className="text-sm text-blue-200 space-y-1">
              {result.upcomingEvents.map((event, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{event}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* News Analysis */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-3 flex items-center space-x-2">
          <Newspaper className="w-5 h-5 text-blue-400" />
          <span>News & Market Sentiment Analysis</span>
        </h3>
        <div className="text-sm text-gray-300 whitespace-pre-line max-h-48 overflow-y-auto bg-gray-800 rounded p-3">
          {result.newsAnalysis}
        </div>
      </div>
      
      {/* Overall Sentiment */}
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Overall Market Sentiment</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentBg(result.overallSentiment)} text-white`}>
            {result.overallSentiment.replace('_', ' ')}
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{result.confidence}%</div>
            <div className="text-sm text-gray-400">Confidence</div>
          </div>
          <div className={`text-center bg-gray-800 rounded-lg p-3 border-l-2 ${result.priceSource === 'LIVE_API' ? 'border-emerald-500' : 'border-yellow-500'}`}>
            <div className="flex items-center justify-center space-x-2">
              <div className={`text-2xl font-bold ${result.priceSource === 'LIVE_API' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                ${result.entryPrice.toFixed(6)}
              </div>
              <div className={`w-2 h-2 rounded-full animate-pulse ${result.priceSource === 'LIVE_API' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
            </div>
            <div className={`text-sm font-medium ${result.priceSource === 'LIVE_API' ? 'text-emerald-300' : 'text-yellow-300'}`}>
              {result.priceSource === 'LIVE_API' ? `LIVE ${result.broker.toUpperCase()} API` : 'Current Market Price'}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Updated: {new Date(result.priceTimestamp).toLocaleTimeString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">${result.targetPrice.toFixed(4)}</div>
            <div className="text-sm text-gray-400">Price Target</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">${((result.profitTarget - result.recommendedEntryPrice) / result.recommendedEntryPrice * 100).toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Potential Gain</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-sm text-gray-400">Support</div>
              <div className="text-white font-medium">${result.supportLevel.toFixed(4)}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-sm text-gray-400">Resistance</div>
              <div className="text-white font-medium">${result.resistanceLevel.toFixed(4)}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Technical Indicators */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Technical Indicators</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
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
              <div className="text-xs text-gray-400 mb-1">{indicator.category}</div>
              <div className="text-sm text-gray-300">{indicator.value}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Trading Strategies */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Trading Strategies</h3>
        <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
          {result.strategies.map(strategy => (
            <div key={strategy.id} className="bg-gray-900 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-white">{strategy.name}</span>
                  <span className="text-xs text-gray-400 ml-2">({strategy.type})</span>
                </div>
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
    </div>
  );
};

export default AnalysisResults;
