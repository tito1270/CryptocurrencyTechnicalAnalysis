import React from 'react';
import { CandlestickPattern, TrendAnalysis, PatternAnalysisResult } from '../types';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Target, DollarSign, Calendar, BarChart3, Activity } from 'lucide-react';
import AdvancedOptionsAnalysis from './AdvancedOptionsAnalysis';

interface CandlestickPatternAnalysisProps {
  patternAnalysis: PatternAnalysisResult;
  currentPrice: number;
  pair: string;
}

const CandlestickPatternAnalysis: React.FC<CandlestickPatternAnalysisProps> = ({
  patternAnalysis,
  currentPrice,
  pair
}) => {
  const { detectedPatterns, trendAnalysis, overallSignal, patternConfirmation, conflictingSignals, optionsRecommendations, advancedOptionsAnalysis } = patternAnalysis;

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'STRONG_BUY':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'BUY':
        return 'text-green-500 bg-green-50 border-green-200';
      case 'SELL':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'STRONG_SELL':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getPatternTypeColor = (type: string) => {
    switch (type) {
      case 'BULLISH':
        return 'text-green-600 bg-green-100';
      case 'BEARISH':
        return 'text-red-600 bg-red-100';
      case 'REVERSAL':
        return 'text-purple-600 bg-purple-100';
      case 'CONTINUATION':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getReliabilityBadge = (reliability: string) => {
    const colors = {
      HIGH: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-red-100 text-red-800'
    };
    return colors[reliability as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'UPTREND':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'DOWNTREND':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'SIDEWAYS':
        return <Minus className="w-5 h-5 text-gray-600" />;
      default:
        return <Activity className="w-5 h-5 text-purple-600" />;
    }
  };

  const formatPrice = (price: number) => {
    return price.toFixed(6);
  };

  return (
    <div className="space-y-6">
      {/* Main Pattern Analysis */}
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Header */}
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Candlestick Pattern Analysis
          </h2>
          <p className="text-gray-600 mt-1">Comprehensive pattern recognition and trend analysis for {pair}</p>
        </div>

        {/* Overall Signal */}
        <div className={`rounded-lg border-2 p-4 ${getSignalColor(overallSignal)}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Overall Pattern Signal</h3>
              <p className="text-sm opacity-80">Combined analysis of all detected patterns</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{overallSignal.replace('_', ' ')}</div>
              <div className="flex items-center gap-2 mt-1">
                {patternConfirmation && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-200 text-green-800">
                    ✓ Pattern Confirmed
                  </span>
                )}
                {conflictingSignals && (
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-200 text-yellow-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Mixed Signals
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
            {getTrendIcon(trendAnalysis.direction)}
            Trend Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-sm text-gray-600">Direction</div>
              <div className="font-semibold text-lg">{trendAnalysis.direction}</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-sm text-gray-600">Strength</div>
              <div className="font-semibold text-lg">{trendAnalysis.strength}</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-sm text-gray-600">Duration</div>
              <div className="font-semibold text-lg">{trendAnalysis.duration} periods</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-sm text-gray-600">Confidence</div>
              <div className="font-semibold text-lg">{trendAnalysis.confidence}%</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <Target className="w-4 h-4" />
                Support Level
              </div>
              <div className="font-semibold text-lg text-green-600">${formatPrice(trendAnalysis.supportLevel)}</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <Target className="w-4 h-4" />
                Resistance Level
              </div>
              <div className="font-semibold text-lg text-red-600">${formatPrice(trendAnalysis.resistanceLevel)}</div>
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-700">
            <strong>Trend Line:</strong> Slope: {trendAnalysis.trendLine.slope.toFixed(4)}, 
            R² = {trendAnalysis.trendLine.r2} (correlation strength)
          </div>
        </div>

        {/* Detected Patterns */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detected Candlestick Patterns ({detectedPatterns.length})
          </h3>
          
          {detectedPatterns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No significant candlestick patterns detected in current timeframe</p>
              <p className="text-sm">Try different timeframes or wait for new price action</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {detectedPatterns.map((pattern, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{pattern.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPatternTypeColor(pattern.type)}`}>
                          {pattern.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReliabilityBadge(pattern.reliability)}`}>
                          {pattern.reliability} Reliability
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-2">{pattern.description}</p>
                      <p className="text-sm text-gray-600 mb-3">{pattern.implications}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Signal:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${getSignalColor(pattern.signal)}`}>
                            {pattern.signal}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Confidence:</span>
                          <span className="ml-2 font-semibold">{pattern.confidence}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Candles Required:</span>
                          <span className="ml-2 font-semibold">{pattern.candlesRequired}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Options Strategies for this pattern */}
                  {pattern.optionsStrategy && pattern.optionsStrategy.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Suggested Options Strategies:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {pattern.optionsStrategy.map((strategy, stratIndex) => (
                          <span key={stratIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {strategy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Basic Options Recommendations */}
        {optionsRecommendations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Basic Options Recommendations
            </h3>
            
            <div className="grid gap-4">
              {optionsRecommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-900">{rec.strategy}</h4>
                      <p className="text-gray-700 mt-1">{rec.reasoning}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Recommended Expiration
                      </div>
                      <div className="font-semibold">{rec.expiration}</div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-3 border">
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        Strike Selection
                      </div>
                      <div className="text-sm">
                        {rec.strikes.map((strike, strikeIndex) => (
                          <div key={strikeIndex} className="text-gray-700">{strike}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Risk Disclaimer</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Candlestick patterns are not guarantees of future price movement. Always combine with other forms of analysis 
                and proper risk management. Options trading involves significant risk and may not be suitable for all investors.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Options Analysis */}
      {advancedOptionsAnalysis && (
        <AdvancedOptionsAnalysis
          optionsAnalysis={advancedOptionsAnalysis}
          pair={pair}
        />
      )}
    </div>
  );
};

export default CandlestickPatternAnalysis;