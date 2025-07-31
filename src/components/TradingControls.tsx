import React from 'react';
import { useState, useMemo } from 'react';
import { brokers } from '../data/brokers';
import { technicalIndicators } from '../data/indicators';
import { tradingStrategies } from '../data/strategies';
import { searchPairs } from '../utils/priceSimulator';
import { Search, X } from 'lucide-react';

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
  const [pairSearchQuery, setPairSearchQuery] = useState('');
  const [showPairSearch, setShowPairSearch] = useState(false);
  
  // Filter pairs based on search query
  const filteredPairs = useMemo(() => {
    if (!currentBroker) return [];
    
    if (pairSearchQuery.trim() === '') {
      return currentBroker.pairs.slice(0, 50); // Show first 50 pairs by default
    }
    
    return currentBroker.pairs
      .filter(pair => 
        pair.toLowerCase().includes(pairSearchQuery.toLowerCase())
      )
      .slice(0, 50);
  }, [currentBroker, pairSearchQuery]);

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
          <div className="relative">
            <div className="flex space-x-2">
              <select
                value={selectedPair}
                onChange={(e) => onPairChange(e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {filteredPairs.map(pair => (
                  <option key={pair} value={pair}>{pair}</option>
                ))}
              </select>
              <button
                onClick={() => setShowPairSearch(!showPairSearch)}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                title="Search pairs"
              >
                <Search className="w-4 h-4 text-gray-300" />
              </button>
            </div>
            
            {showPairSearch && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-700 border border-gray-600 rounded-lg p-3 z-10">
                <div className="flex items-center space-x-2 mb-3">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Type to search pairs (e.g., BTC, ETH, DOGE)..."
                    value={pairSearchQuery}
                    onChange={(e) => setPairSearchQuery(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setShowPairSearch(false);
                      setPairSearchQuery('');
                    }}
                    className="p-1 hover:bg-gray-600 rounded"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                
                <div className="text-xs text-gray-400 mb-2">
                  Showing {filteredPairs.length} of {currentBroker?.pairs.length || 0} pairs
                </div>
                
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredPairs.map(pair => (
                    <button
                      key={pair}
                      onClick={() => {
                        onPairChange(pair);
                        setShowPairSearch(false);
                        setPairSearchQuery('');
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        selectedPair === pair
                          ? 'bg-emerald-600 text-white'
                          : 'hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      {pair}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
    </div>
  );
};

export default TradingControls;