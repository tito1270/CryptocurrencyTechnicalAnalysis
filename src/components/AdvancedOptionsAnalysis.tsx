import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Target, Shield, AlertTriangle, DollarSign, Calendar, BarChart3, Activity, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface AdvancedOptionsStrategy {
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

interface OptionsAnalysisResult {
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

interface AdvancedOptionsAnalysisProps {
  optionsAnalysis: OptionsAnalysisResult;
  pair: string;
}

const AdvancedOptionsAnalysis: React.FC<AdvancedOptionsAnalysisProps> = ({
  optionsAnalysis,
  pair
}) => {
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BULLISH':
        return 'text-green-600 bg-green-100 border-green-300';
      case 'BEARISH':
        return 'text-red-600 bg-red-100 border-red-300';
      case 'NEUTRAL':
        return 'text-gray-600 bg-gray-100 border-gray-300';
      case 'VOLATILITY':
        return 'text-purple-600 bg-purple-100 border-purple-300';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'HIGH':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSuccessProbabilityColor = (probability: number) => {
    if (probability >= 60) return 'text-green-600';
    if (probability >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const StrategyCard: React.FC<{ strategy: AdvancedOptionsStrategy; isPrimary?: boolean }> = ({ strategy, isPrimary = false }) => {
    const isExpanded = expandedStrategy === strategy.name;
    
    return (
      <div className={`border rounded-lg ${isPrimary ? 'border-2 border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className={`font-semibold text-lg ${isPrimary ? 'text-blue-900' : 'text-gray-900'}`}>
                  {strategy.name}
                  {isPrimary && <span className="text-sm text-blue-600 ml-2">(Recommended)</span>}
                </h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(strategy.type)}`}>
                  {strategy.type}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(strategy.complexity)}`}>
                  {strategy.complexity}
                </span>
              </div>
              
              <p className="text-gray-700 mb-3">{strategy.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="bg-white rounded-lg p-2 border">
                  <div className="text-gray-600 text-xs">Success Rate</div>
                  <div className={`font-semibold ${getSuccessProbabilityColor(strategy.successProbability)}`}>
                    {strategy.successProbability}%
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2 border">
                  <div className="text-gray-600 text-xs">Max Risk</div>
                  <div className="font-semibold text-red-600">{strategy.maxRisk}</div>
                </div>
                <div className="bg-white rounded-lg p-2 border">
                  <div className="text-gray-600 text-xs">Max Profit</div>
                  <div className="font-semibold text-green-600">{strategy.maxProfit}</div>
                </div>
                <div className="bg-white rounded-lg p-2 border">
                  <div className="text-gray-600 text-xs">Time Decay</div>
                  <div className={`font-semibold ${strategy.timeDecay === 'POSITIVE' ? 'text-green-600' : strategy.timeDecay === 'NEGATIVE' ? 'text-red-600' : 'text-gray-600'}`}>
                    {strategy.timeDecay}
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setExpandedStrategy(isExpanded ? null : strategy.name)}
              className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {isExpanded && (
            <div className="mt-4 space-y-4 border-t pt-4">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Setup Instructions</h5>
                <ul className="space-y-1">
                  {strategy.setup.map((step, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-600 font-medium">{index + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2">Breakeven Points</h5>
                <div className="space-y-1">
                  {strategy.breakeven.map((be, index) => (
                    <div key={index} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      {be}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2">Ideal Market Conditions</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {strategy.idealMarketConditions.map((condition, index) => (
                    <div key={index} className="text-sm text-gray-700 bg-green-50 p-2 rounded border border-green-200">
                      ✓ {condition}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2">Exit Strategy</h5>
                <div className="space-y-1">
                  {strategy.exitStrategy.map((exit, index) => (
                    <div key={index} className="text-sm text-gray-700 bg-yellow-50 p-2 rounded border border-yellow-200">
                      • {exit}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2">Potential Adjustments</h5>
                <div className="space-y-1">
                  {strategy.adjustments.map((adjustment, index) => (
                    <div key={index} className="text-sm text-gray-700 bg-blue-50 p-2 rounded border border-blue-200">
                      ⚙️ {adjustment}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          Advanced Options Analysis
        </h2>
        <p className="text-gray-600 mt-1">Professional-grade options strategies for {pair}</p>
      </div>

      {/* Market Context */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Market Context
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-sm text-gray-600">Implied Volatility</div>
            <div className="font-semibold text-lg">{optionsAnalysis.marketContext.impliedVolatility}</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-sm text-gray-600">Technical Bias</div>
            <div className="font-semibold text-lg">{optionsAnalysis.marketContext.technicalBias}</div>
          </div>
          
          <div className={`rounded-lg p-3 border ${getRiskLevelColor(optionsAnalysis.marketContext.riskLevel)}`}>
            <div className="text-sm opacity-80">Risk Level</div>
            <div className="font-semibold text-lg">{optionsAnalysis.marketContext.riskLevel}</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-sm text-gray-600">Optimal Duration</div>
            <div className="font-semibold text-sm">{optionsAnalysis.marketContext.timeToExpiration}</div>
          </div>
        </div>
      </div>

      {/* Specific Recommendations */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-600" />
          Specific Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Position Size
              </div>
              <div className="font-semibold">{optionsAnalysis.recommendations.positionSize}</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Expiration
              </div>
              <div className="font-semibold text-sm">{optionsAnalysis.recommendations.expiration}</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <Activity className="w-4 h-4" />
                Entry Timing
              </div>
              <div className="font-semibold text-sm">{optionsAnalysis.recommendations.timing}</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <Target className="w-4 h-4" />
                Strike Selection
              </div>
              <div className="font-semibold text-sm">{optionsAnalysis.recommendations.strikes}</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Risk Management
              </div>
              <div className="font-semibold text-sm">{optionsAnalysis.recommendations.hedging}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Strategy */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Recommended Strategy
        </h3>
        <StrategyCard strategy={optionsAnalysis.primaryStrategy} isPrimary={true} />
      </div>

      {/* Alternative Strategies */}
      {optionsAnalysis.alternativeStrategies.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              Alternative Strategies ({optionsAnalysis.alternativeStrategies.length})
            </h3>
            <button
              onClick={() => setShowAlternatives(!showAlternatives)}
              className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {showAlternatives ? 'Hide' : 'Show'} Alternatives
              {showAlternatives ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          
          {showAlternatives && (
            <div className="space-y-4">
              {optionsAnalysis.alternativeStrategies.map((strategy, index) => (
                <StrategyCard key={index} strategy={strategy} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Risk Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Professional Options Trading Disclaimer</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Options trading involves substantial risk and is not suitable for all investors. The strategies presented are for educational purposes only. 
              Past performance does not guarantee future results. Please consult with a qualified financial advisor before implementing any options strategies.
              Consider your investment objectives, risk tolerance, and trading experience before trading options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedOptionsAnalysis;