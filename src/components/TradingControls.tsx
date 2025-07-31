import React from 'react';
import { useState, useMemo } from 'react';
import { brokers } from '../data/brokers';
import { technicalIndicators } from '../data/indicators';
import { tradingStrategies } from '../data/strategies';
import { searchPairs } from '../utils/priceSimulator';
import { Search, X } from 'lucide-react';
import CryptoPairSearch from './CryptoPairSearch';

interface TradingControlsProps {
  selectedBroker: string;
  selectedPair: string;
  selectedTimeframe: string;
  tradeType: 'SPOT' | 'FUTURES';
  selectedIndicators: string[];
  selectedStrategies: string[];
  onBrokerChange: (broker: string) => void;
  onPairChange: (pair: string) => void;
  onTimeframeChange: (timeframe: string) => void;
  onTradeTypeChange: (type: 'SPOT' | 'FUTURES') => void;
  onIndicatorToggle: (indicatorId: string) => void;
  onStrategyToggle: (strategyId: string) => void;
  onAnalyze: () => void;
}

const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];

const TradingControls: React.FC<TradingControlsProps> = ({
  selectedBroker,
  selectedPair,
  selectedTimeframe,
  tradeType,
  selectedIndicators,
  selectedStrategies,
  onBrokerChange,
  onPairChange,
  onTimeframeChange,
  onTradeTypeChange,
  onIndicatorToggle,
  onStrategyToggle,
  onAnalyze
}) => {
  const currentBroker = brokers.find(b => b.id === selectedBroker);
  const [showAdvancedPairSearch, setShowAdvancedPairSearch] = useState(false);
  
  // Show limited pairs for the dropdown
  const limitedPairs = useMemo(() => {
    if (!currentBroker) return [];
    return currentBroker.pairs.slice(0, 20); // Show first 20 pairs in dropdown
  }, [currentBroker]);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold text-white mb-4">Trading Configuration</h2>
      
      {/* Broker and Pair Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Exchange</label>
          <select
            value={selectedBroker}
            onChange={(e) => onBrokerChange(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            {brokers.map(broker => (
              <option key={broker.id} value={broker.id}>
                {broker.logo} {broker.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Trading Pair</label>
          <div className="flex space-x-2">
            <select
              value={selectedPair}
              onChange={(e) => onPairChange(e.target.value)}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {limitedPairs.map(pair => (
                <option key={pair} value={pair}>{pair}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAdvancedPairSearch(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
              title="Advanced Pair Search with Categories & Pagination"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Quick select or click search for all {currentBroker?.pairs.length || 0} pairs with filtering
          </div>
        </div>
      </div>
      
      {/* Timeframe and Trade Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Timeframe</label>
          <div className="grid grid-cols-4 gap-2">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTimeframe === tf
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Trade Type</label>
          <div className="grid grid-cols-2 gap-2">
            {(['SPOT', 'FUTURES'] as const).map(type => (
              <button
                key={type}
                onClick={() => onTradeTypeChange(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tradeType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Technical Indicators */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Technical Indicators ({selectedIndicators.length}/25) - Select multiple for comprehensive analysis</label>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
          {technicalIndicators.map(indicator => (
            <label key={indicator.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIndicators.includes(indicator.id)}
                onChange={() => onIndicatorToggle(indicator.id)}
                className="rounded border-gray-600 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-gray-800"
              />
              <span className="text-sm text-gray-300">{indicator.name}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Trading Strategies */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Trading Strategies ({selectedStrategies.length}/16) - Combines with news analysis for recommendations</label>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {tradingStrategies.map(strategy => (
            <label key={strategy.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedStrategies.includes(strategy.id)}
                onChange={() => onStrategyToggle(strategy.id)}
                className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
              />
              <span className="text-sm text-gray-300">{strategy.name}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Analyze Button */}
      <button
        onClick={onAnalyze}
        className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        🚀 Analyze Market & Get Recommendation
      </button>
      
      <div className="text-xs text-gray-400 text-center mt-2">
        Analysis includes technical indicators, trading strategies, news sentiment, and personalized buy/sell/hold recommendations with entry/exit points.
      </div>

      {/* Advanced Crypto Pair Search Modal */}
      <CryptoPairSearch
        pairs={currentBroker?.pairs || []}
        selectedPair={selectedPair}
        onPairSelect={onPairChange}
        isOpen={showAdvancedPairSearch}
        onClose={() => setShowAdvancedPairSearch(false)}
      />
    </div>
  );
};

export default TradingControls;