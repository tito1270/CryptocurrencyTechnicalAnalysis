import React from 'react';
import { useState, useMemo } from 'react';
import { brokers } from '../data/brokers';
import { technicalIndicators } from '../data/indicators';
import { tradingStrategies } from '../data/strategies';
import { searchPairs } from '../utils/priceSimulator';
import { Search, X, Link, Copy, Check } from 'lucide-react';
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
  isAnalyzing?: boolean;
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
  onAnalyze,
  isAnalyzing = false
}) => {
  const currentBroker = brokers.find(b => b.id === selectedBroker);
  const [showAdvancedPairSearch, setShowAdvancedPairSearch] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentDropdownPage, setCurrentDropdownPage] = useState(0);

  // Reset pagination when broker changes
  React.useEffect(() => {
    setCurrentDropdownPage(0);
  }, [selectedBroker]);
  
  // Pagination constants
  const PAIRS_PER_PAGE = 19; // Leave room for selected pair

  // Show limited pairs for the dropdown with pagination, ensuring selected pair is always first
  const { limitedPairs, totalPages, hasNextPage, hasPrevPage } = useMemo(() => {
    if (!currentBroker) return { limitedPairs: [], totalPages: 0, hasNextPage: false, hasPrevPage: false };

    const allPairs = currentBroker.pairs;
    const totalPairs = allPairs.length;
    const totalPagesCount = Math.ceil(totalPairs / PAIRS_PER_PAGE);

    // Always include the selected pair first if it exists
    const selectedPairIncluded = selectedPair && allPairs.includes(selectedPair);

    // Get pairs for current page
    const startIndex = currentDropdownPage * PAIRS_PER_PAGE;
    let pagePairs = allPairs.slice(startIndex, startIndex + PAIRS_PER_PAGE);

    // If selected pair is included, ensure it's always first and adjust the list
    if (selectedPairIncluded) {
      // Remove selected pair from page pairs if it's there
      pagePairs = pagePairs.filter(pair => pair !== selectedPair);
      // Add selected pair at the beginning and limit to PAIRS_PER_PAGE
      pagePairs = [selectedPair, ...pagePairs.slice(0, PAIRS_PER_PAGE - 1)];
    }

    return {
      limitedPairs: pagePairs,
      totalPages: totalPagesCount,
      hasNextPage: currentDropdownPage < totalPagesCount - 1,
      hasPrevPage: currentDropdownPage > 0
    };
  }, [currentBroker, selectedPair, currentDropdownPage]);

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  };

  const handleCopyLink = async () => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('pair', selectedPair);
    currentUrl.searchParams.set('broker', selectedBroker);
    currentUrl.searchParams.set('timeframe', selectedTimeframe);
    currentUrl.searchParams.set('type', tradeType);

    const urlString = currentUrl.toString();

    // Check if we're in an iframe or restricted context - use fallback directly
    const isRestricted = window.self !== window.top || !window.isSecureContext;

    if (isRestricted || !navigator.clipboard) {
      // Use fallback method directly for restricted environments
      const success = fallbackCopyTextToClipboard(urlString);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        console.error('Failed to copy link using fallback method');
      }
      return;
    }

    try {
      // Only try clipboard API in unrestricted, secure contexts
      await navigator.clipboard.writeText(urlString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard API failed, trying fallback:', err);
      // Try fallback method
      const success = fallbackCopyTextToClipboard(urlString);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        console.error('Failed to copy link: Both methods failed');
      }
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-semibold text-white mb-4">Trading Configuration</h2>
      
      {/* Enhanced Broker Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Choose Exchange
            <span className="text-gray-400 text-xs ml-2">({brokers.length} exchanges available)</span>
          </label>
          <div className="relative">
            <select
              value={selectedBroker}
              onChange={(e) => onBrokerChange(e.target.value)}
              className="w-full bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-500 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 appearance-none cursor-pointer text-sm font-medium shadow-lg"
            >
              {brokers.map(broker => (
                <option key={broker.id} value={broker.id} className="bg-gray-700 py-2">
                  {broker.logo} {broker.name} ({broker.pairs.length} pairs)
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Selected: <span className="text-emerald-400 font-medium">{currentBroker?.logo} {currentBroker?.name}</span> 
            • {currentBroker?.pairs.length} trading pairs available
          </div>
        </div>
        
        {/* Popular Exchanges Quick Select */}
        <div className="border-t border-gray-600 pt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Popular Exchanges</label>
          <div className="flex flex-wrap gap-2">
            {['binance', 'okx', 'coinbase', 'kucoin', 'bybit'].map(brokerId => {
              const broker = brokers.find(b => b.id === brokerId);
              if (!broker) return null;
              return (
                <button
                  key={brokerId}
                  onClick={() => onBrokerChange(brokerId)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedBroker === brokerId
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  {broker.logo} {broker.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pair Selection */}
      <div className="grid grid-cols-1 gap-4">
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
              title="Advanced Pair Search with 300 pairs per batch, filtering, and URL updates"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              title="Copy analysis link with current settings"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
            <div className="flex items-center space-x-2">
              <Link className="w-3 h-3" />
              <span>Quick select or search {currentBroker?.pairs.length || 0} pairs • URL updates automatically</span>
            </div>

            {/* Dropdown Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentDropdownPage(prev => Math.max(0, prev - 1))}
                  disabled={!hasPrevPage}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    hasPrevPage
                      ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  PREV
                </button>

                <span className="text-xs text-gray-400">
                  {currentDropdownPage + 1} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentDropdownPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={!hasNextPage}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    hasNextPage
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  NEXT
                </button>
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
      
      {/* Enhanced Analyze Button */}
      <button
        onClick={onAnalyze}
        disabled={isAnalyzing || !selectedPair || selectedIndicators.length === 0}
        className={`w-full font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
          isAnalyzing
            ? 'bg-gradient-to-r from-yellow-600 to-orange-600 cursor-not-allowed'
            : !selectedPair || selectedIndicators.length === 0
            ? 'bg-gray-600 cursor-not-allowed text-gray-400'
            : 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white transform hover:scale-105 animate-pulse hover:animate-none'
        }`}
        aria-label={`Analyze ${selectedPair} market data and get trading recommendations using ${selectedTimeframe} timeframe`}
      >
        <div className="flex items-center justify-center space-x-2">
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>🔍 Analyzing {selectedPair}...</span>
            </>
          ) : (
            <>
              <span>🚀 Analyze Market & Get Recommendation</span>
              <span className="text-sm opacity-75">({selectedTimeframe} Chart)</span>
            </>
          )}
        </div>
      </button>
      
      {/* Analysis Status */}
      {selectedIndicators.length === 0 && (
        <div className="text-center text-sm text-red-400 bg-red-900/20 border border-red-700 rounded-lg p-2">
          ⚠️ Please select at least one technical indicator to perform analysis
        </div>
      )}
      
      {!selectedPair && (
        <div className="text-center text-sm text-yellow-400 bg-yellow-900/20 border border-yellow-700 rounded-lg p-2">
          ⚠️ Please select a trading pair to analyze
        </div>
      )}
      
      <div className="text-xs text-gray-400 text-center mt-2">
        Analysis includes technical indicators, trading strategies, news sentiment, and personalized buy/sell/hold recommendations with entry/exit points. Results will be displayed in the section to the right.
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
