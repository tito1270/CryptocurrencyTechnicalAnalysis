import React, { useState, useMemo, useEffect } from 'react';
import { Play, Pause, Search, Filter, TrendingUp, TrendingDown, ArrowRight, ChevronLeft, ChevronRight, Settings2 } from 'lucide-react';
import { AnalysisResult } from '../types';
import { performAnalysis } from '../utils/analysisEngine';
import { brokers } from '../data/brokers';
import { technicalIndicators } from '../data/indicators';
import { tradingStrategies } from '../data/strategies';
import { cryptoPairTypes, categorizeToken } from '../data/cryptoPairTypes';

interface BulkScannerProps {
  selectedBroker: string;
  selectedTimeframe: string;
  tradeType: 'SPOT' | 'FUTURES';
  selectedIndicators: string[];
  selectedStrategies: string[];
}

interface ScanResult extends AnalysisResult {
  scanTime: number;
}

const PAIRS_PER_BATCH = 100;

const BulkScanner: React.FC<BulkScannerProps> = ({
  selectedBroker,
  selectedTimeframe,
  tradeType,
  selectedIndicators,
  selectedStrategies
}) => {
  const [scanMode, setScanMode] = useState<'individual' | 'bulk'>('individual');
  const [selectedQuoteCurrencies, setSelectedQuoteCurrencies] = useState<string[]>(['USDT']);
  const [selectedPairTypes, setSelectedPairTypes] = useState<string[]>(['all']);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBatch, setCurrentBatch] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentlyScanning, setCurrentlyScanning] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'confidence' | 'riskReward' | 'recommendation'>('confidence');
  const [filterBy, setFilterBy] = useState<'all' | 'buy' | 'sell' | 'hold'>('all');
  const [selectedPair, setSelectedPair] = useState('');

  const currentBroker = brokers.find(b => b.id === selectedBroker);

  // Get available quote currencies from current broker
  const availableQuoteCurrencies = useMemo(() => {
    if (!currentBroker) return [];
    const quoteCurrencies = new Set<string>();
    currentBroker.pairs.forEach(pair => {
      const quoteCurrency = pair.split('/')[1];
      if (quoteCurrency) {
        quoteCurrencies.add(quoteCurrency.toUpperCase());
      }
    });
    const commonCurrencies = ['USDT', 'BTC', 'ETH', 'BUSD', 'USDC', 'BNB', 'FDUSD'];
    return Array.from(quoteCurrencies).sort((a, b) => {
      const aIndex = commonCurrencies.indexOf(a);
      const bIndex = commonCurrencies.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [currentBroker]);

  // Filter pairs based on selected criteria
  const filteredPairs = useMemo(() => {
    if (!currentBroker) return [];
    
    let filtered = currentBroker.pairs;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(pair =>
        pair.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply quote currency filter
    if (!selectedQuoteCurrencies.includes('all')) {
      filtered = filtered.filter(pair => {
        const quoteCurrency = pair.split('/')[1];
        return selectedQuoteCurrencies.some(currency =>
          quoteCurrency && quoteCurrency.toUpperCase() === currency.toUpperCase()
        );
      });
    }

    // Apply pair type filter
    if (!selectedPairTypes.includes('all')) {
      filtered = filtered.filter(pair => {
        const categories = categorizeToken(pair);
        return selectedPairTypes.some(type => categories.includes(type));
      });
    }

    return filtered.sort();
  }, [currentBroker, searchQuery, selectedQuoteCurrencies, selectedPairTypes]);

  // Pagination for bulk scanning
  const totalBatches = Math.ceil(filteredPairs.length / PAIRS_PER_BATCH);
  const currentBatchPairs = useMemo(() => {
    const startIndex = currentBatch * PAIRS_PER_BATCH;
    return filteredPairs.slice(startIndex, startIndex + PAIRS_PER_BATCH);
  }, [filteredPairs, currentBatch]);

  // Filter and sort scan results
  const filteredResults = useMemo(() => {
    let filtered = scanResults;

    // Apply recommendation filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(result => {
        switch (filterBy) {
          case 'buy':
            return result.recommendation.includes('BUY');
          case 'sell':
            return result.recommendation.includes('SELL');
          case 'hold':
            return result.recommendation === 'HOLD';
          default:
            return true;
        }
      });
    }

    // Sort results
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return b.confidence - a.confidence;
        case 'riskReward':
          return b.riskRewardRatio - a.riskRewardRatio;
        case 'recommendation':
          const recommendations = ['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL'];
          return recommendations.indexOf(a.recommendation) - recommendations.indexOf(b.recommendation);
        default:
          return 0;
      }
    });
  }, [scanResults, sortBy, filterBy]);

  const handleQuoteCurrencyToggle = (currency: string) => {
    if (currency === 'all') {
      setSelectedQuoteCurrencies(['all']);
    } else {
      setSelectedQuoteCurrencies(prev => {
        const newCurrencies = prev.filter(id => id !== 'all');
        if (newCurrencies.includes(currency)) {
          const filtered = newCurrencies.filter(id => id !== currency);
          return filtered.length === 0 ? ['all'] : filtered;
        } else {
          return [...newCurrencies, currency];
        }
      });
    }
  };

  const handlePairTypeToggle = (typeId: string) => {
    if (typeId === 'all') {
      setSelectedPairTypes(['all']);
    } else {
      setSelectedPairTypes(prev => {
        const newTypes = prev.filter(id => id !== 'all');
        if (newTypes.includes(typeId)) {
          const filtered = newTypes.filter(id => id !== typeId);
          return filtered.length === 0 ? ['all'] : filtered;
        } else {
          return [...newTypes, typeId];
        }
      });
    }
  };

  const handleIndividualScan = async (pair: string) => {
    setIsScanning(true);
    setCurrentlyScanning(pair);
    setScanProgress(0);

    try {
      const result = await performAnalysis(
        pair,
        selectedBroker,
        selectedTimeframe,
        tradeType,
        selectedIndicators,
        selectedStrategies
      );

      const scanResult: ScanResult = {
        ...result,
        scanTime: Date.now()
      };

      setScanResults(prev => {
        const existingIndex = prev.findIndex(r => r.pair === pair);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = scanResult;
          return updated;
        }
        return [scanResult, ...prev];
      });

      setScanProgress(100);
    } catch (error) {
      console.error('Individual scan error:', error);
    } finally {
      setIsScanning(false);
      setCurrentlyScanning('');
    }
  };

  const handleBulkScan = async () => {
    if (currentBatchPairs.length === 0) return;

    setIsScanning(true);
    setScanProgress(0);
    
    const batchResults: ScanResult[] = [];
    
    for (let i = 0; i < currentBatchPairs.length; i++) {
      const pair = currentBatchPairs[i];
      setCurrentlyScanning(pair);
      
      try {
        const result = await performAnalysis(
          pair,
          selectedBroker,
          selectedTimeframe,
          tradeType,
          selectedIndicators,
          selectedStrategies
        );

        const scanResult: ScanResult = {
          ...result,
          scanTime: Date.now()
        };

        batchResults.push(scanResult);
        
        // Update progress
        setScanProgress(((i + 1) / currentBatchPairs.length) * 100);
        
        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error scanning ${pair}:`, error);
      }
    }

    setScanResults(prev => [...batchResults, ...prev.filter(r => !batchResults.find(br => br.pair === r.pair))]);
    setIsScanning(false);
    setCurrentlyScanning('');
    setScanProgress(0);
  };

  const handleNextBatch = () => {
    if (currentBatch < totalBatches - 1) {
      setCurrentBatch(currentBatch + 1);
      setScanResults([]); // Clear previous results when moving to next batch
    }
  };

  const handlePrevBatch = () => {
    if (currentBatch > 0) {
      setCurrentBatch(currentBatch - 1);
      setScanResults([]); // Clear previous results when moving to previous batch
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'STRONG_BUY':
        return 'text-green-400';
      case 'BUY':
        return 'text-green-300';
      case 'HOLD':
        return 'text-yellow-400';
      case 'SELL':
        return 'text-red-300';
      case 'STRONG_SELL':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'STRONG_BUY':
      case 'BUY':
        return <TrendingUp className="w-4 h-4" />;
      case 'SELL':
      case 'STRONG_SELL':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-yellow-400" />;
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Bulk Market Scanner</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Settings2 className="w-4 h-4 text-gray-300" />
          <span className="text-sm text-gray-300">Filters</span>
        </button>
      </div>

      {/* Scan Mode Selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setScanMode('individual')}
          className={`p-4 rounded-lg border transition-colors ${
            scanMode === 'individual'
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <div className="text-center">
            <Search className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">Individual Scan</div>
            <div className="text-xs opacity-75">Scan specific pairs</div>
          </div>
        </button>
        <button
          onClick={() => setScanMode('bulk')}
          className={`p-4 rounded-lg border transition-colors ${
            scanMode === 'bulk'
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <div className="text-center">
            <Filter className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">Bulk Scan</div>
            <div className="text-xs opacity-75">Scan multiple pairs in batches</div>
          </div>
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-700 rounded-lg p-4 space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Pairs</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search crypto pairs (e.g., BTC, ETH, DOGE)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Quote Currency Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Quote Currency</label>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedQuoteCurrencies.includes('all')}
                  onChange={() => handleQuoteCurrencyToggle('all')}
                  className="rounded border-gray-500 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">All</span>
              </label>
              {availableQuoteCurrencies.map(currency => (
                <label key={currency} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedQuoteCurrencies.includes(currency)}
                    onChange={() => handleQuoteCurrencyToggle(currency)}
                    className="rounded border-gray-500 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300 font-mono">{currency}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pair Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Token Category</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPairTypes.includes('all')}
                  onChange={() => handlePairTypeToggle('all')}
                  className="rounded border-gray-500 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-300">All Types</span>
              </label>
              {cryptoPairTypes.map(type => (
                <label key={type.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPairTypes.includes(type.id)}
                    onChange={() => handlePairTypeToggle(type.id)}
                    className="rounded border-gray-500 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-300">{type.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Individual Scan Mode */}
      {scanMode === 'individual' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Select Pair to Scan</label>
            <div className="flex space-x-2">
              <select
                value={selectedPair}
                onChange={(e) => setSelectedPair(e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Choose a pair...</option>
                {filteredPairs.slice(0, 50).map(pair => (
                  <option key={pair} value={pair}>{pair}</option>
                ))}
              </select>
              <button
                onClick={() => selectedPair && handleIndividualScan(selectedPair)}
                disabled={!selectedPair || isScanning}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Scan</span>
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {filteredPairs.length} pairs available • Showing first 50 in dropdown
            </div>
          </div>
        </div>
      )}

      {/* Bulk Scan Mode */}
      {scanMode === 'bulk' && (
        <div className="space-y-4">
          {/* Batch Info */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-medium text-white">Batch {currentBatch + 1} of {totalBatches}</h3>
                <p className="text-sm text-gray-400">
                  Scanning {currentBatchPairs.length} pairs • {filteredPairs.length} total pairs available
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevBatch}
                  disabled={currentBatch === 0}
                  className="p-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-300 font-mono">
                  {currentBatch + 1}/{totalBatches}
                </span>
                <button
                  onClick={handleNextBatch}
                  disabled={currentBatch >= totalBatches - 1}
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={handleBulkScan}
              disabled={isScanning || currentBatchPairs.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isScanning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>
                {isScanning ? `Scanning ${currentlyScanning}...` : `Scan Batch ${currentBatch + 1} (${currentBatchPairs.length} pairs)`}
              </span>
            </button>

            {/* Progress Bar */}
            {isScanning && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span>Progress: {Math.round(scanProgress)}%</span>
                  <span>Currently scanning: {currentlyScanning}</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Section */}
      {scanResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">
              Scan Results ({filteredResults.length})
            </h3>
            <div className="flex items-center space-x-4">
              {/* Filter Results */}
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm"
              >
                <option value="all">All Recommendations</option>
                <option value="buy">Buy Signals</option>
                <option value="sell">Sell Signals</option>
                <option value="hold">Hold Signals</option>
              </select>
              
              {/* Sort Results */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm"
              >
                <option value="confidence">Sort by Confidence</option>
                <option value="riskReward">Sort by Risk/Reward</option>
                <option value="recommendation">Sort by Recommendation</option>
              </select>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredResults.map((result) => (
              <div key={result.pair} className="bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">{result.pair}</h4>
                  <div className={`flex items-center space-x-1 ${getRecommendationColor(result.recommendation)}`}>
                    {getRecommendationIcon(result.recommendation)}
                    <span className="text-sm font-medium">{result.recommendation.replace('_', ' ')}</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entry Price:</span>
                    <span className="text-emerald-400 font-mono">${result.recommendedEntryPrice.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Target:</span>
                    <span className="text-green-400 font-mono">${result.profitTarget.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stop Loss:</span>
                    <span className="text-red-400 font-mono">${result.stopLoss.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk/Reward:</span>
                    <span className="text-blue-400 font-mono">{result.riskRewardRatio.toFixed(1)}:1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Confidence:</span>
                    <span className="text-yellow-400 font-mono">{result.confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">News Impact:</span>
                    <span className={`font-mono ${
                      result.newsImpact === 'HIGH' ? 'text-red-400' : 
                      result.newsImpact === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {result.newsImpact}
                    </span>
                  </div>
                  
                  {/* Candlestick Patterns */}
                  {result.candlestickPatterns && result.candlestickPatterns.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Patterns:</span>
                      <span className="text-purple-400 font-mono text-xs">
                        {result.candlestickPatterns.length} detected
                      </span>
                    </div>
                  )}
                  
                  {/* Trend Analysis */}
                  {result.trendAnalysis && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Trend:</span>
                      <span className={`font-mono text-xs ${
                        result.trendAnalysis.direction === 'UPTREND' ? 'text-green-400' : 
                        result.trendAnalysis.direction === 'DOWNTREND' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {result.trendAnalysis.direction} ({result.trendAnalysis.strength})
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-600">
                  <div className="text-xs text-gray-400 mb-1">Key Reasoning:</div>
                  <div className="text-xs text-gray-300 line-clamp-3">
                    {result.explanation.split('\n').find(line => line.includes('Key Reasoning:'))?.split('Key Reasoning:')[1]?.split('\n')[1] || 
                     result.explanation.split('\n')[0]}
                  </div>
                  
                  {/* Pattern Summary */}
                  {result.candlestickPatterns && result.candlestickPatterns.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-400 mb-1">Top Patterns:</div>
                      <div className="text-xs text-gray-300">
                        {result.candlestickPatterns.slice(0, 2).map(pattern => pattern.name).join(', ')}
                        {result.candlestickPatterns.length > 2 && ` +${result.candlestickPatterns.length - 2} more`}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Batch Navigation for Results */}
          {scanMode === 'bulk' && totalBatches > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-600">
              <div className="text-sm text-gray-400">
                Batch {currentBatch + 1} of {totalBatches} • {filteredPairs.length} total pairs
              </div>
              <button
                onClick={handleNextBatch}
                disabled={currentBatch >= totalBatches - 1}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <span>Next Batch</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkScanner;
