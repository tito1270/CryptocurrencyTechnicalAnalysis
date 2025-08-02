import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Zap, 
  Play, 
  Pause, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Target,
  AlertCircle,
  CheckCircle,
  Star,
  TrendingUp as TrendingUpIcon,
  Eye,
  Clock,
  Activity
} from 'lucide-react';
import { useBinancePairs } from '../hooks/useBinancePairs';
import { performAnalysis } from '../utils/analysisEngine';
import { PriceData, AnalysisResult } from '../types';

interface BulkScannerProps {
  selectedBroker: string;
  selectedTimeframe: string;
  tradeType: 'SPOT' | 'FUTURES';
  selectedIndicators: string[];
  selectedStrategies: string[];
}

const ITEMS_PER_PAGE = 20;

const BulkScanner: React.FC<BulkScannerProps> = ({
  selectedBroker,
  selectedTimeframe,
  tradeType,
  selectedIndicators,
  selectedStrategies
}) => {
  const { pairs, priceData, loading: dataLoading, error: dataError, refreshPairs, dataSource } = useBinancePairs();

  // Scanning states
  const [isScanning, setIsScanning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [scanResults, setScanResults] = useState<Map<string, AnalysisResult>>(new Map());
  const [scannedPairs, setScannedPairs] = useState<Set<string>>(new Set());
  const [currentScanIndex, setCurrentScanIndex] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanSpeed, setScanSpeed] = useState(500); // milliseconds between scans

  // Filtering and pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'volume' | 'change24h' | 'confidence' | 'recommendation'>('volume');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'gainers' | 'losers' | 'high_volume' | 'analyzed'>('all');
  const [quoteCurrencyFilter, setQuoteCurrencyFilter] = useState<string>('all');
  const [recommendationFilter, setRecommendationFilter] = useState<string>('all');

  // Auto-scan settings
  const [autoScanEnabled, setAutoScanEnabled] = useState(false);
  const [scanBatchSize, setScanBatchSize] = useState(10);
  const [smartScanEnabled, setSmartScanEnabled] = useState(true);
  const [scanOnlyGainers, setScanOnlyGainers] = useState(false);
  const [minVolumeFilter, setMinVolumeFilter] = useState(1000000); // 1M minimum volume

  // Get unique quote currencies
  const quoteCurrencies = useMemo(() => {
    const currencies = new Set<string>();
    priceData.forEach(price => {
      const quote = price.pair.split('/')[1];
      if (quote) currencies.add(quote);
    });
    return Array.from(currencies).sort();
  }, [priceData]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = priceData.filter(price => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!price.pair.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Quote currency filter
      if (quoteCurrencyFilter !== 'all') {
        const quote = price.pair.split('/')[1];
        if (quote !== quoteCurrencyFilter) {
          return false;
        }
      }
      
      // Performance filter
      switch (filterType) {
        case 'gainers':
          return price.change24h > 0;
        case 'losers':
          return price.change24h < 0;
        case 'high_volume':
          const avgVolume = priceData.reduce((sum, p) => sum + (p.quoteVolume || p.volume), 0) / priceData.length;
          return (price.quoteVolume || price.volume) > avgVolume;
        case 'analyzed':
          return scannedPairs.has(price.pair);
        default:
          return true;
      }
    });

    // Recommendation filter
    if (recommendationFilter !== 'all') {
      filtered = filtered.filter(price => {
        const analysis = scanResults.get(price.pair);
        return analysis && analysis.recommendation === recommendationFilter;
      });
    }

    // Sort data
    filtered.sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'volume':
          aValue = a.quoteVolume || a.volume;
          bValue = b.quoteVolume || b.volume;
          break;
        case 'change24h':
          aValue = a.change24h;
          bValue = b.change24h;
          break;
        case 'confidence':
          const aAnalysis = scanResults.get(a.pair);
          const bAnalysis = scanResults.get(b.pair);
          aValue = aAnalysis?.confidence || 0;
          bValue = bAnalysis?.confidence || 0;
          break;
        case 'recommendation':
          const aRec = scanResults.get(a.pair);
          const bRec = scanResults.get(b.pair);
          const recOrder = { 'STRONG_BUY': 5, 'BUY': 4, 'HOLD': 3, 'SELL': 2, 'STRONG_SELL': 1 };
          aValue = aRec ? (recOrder[aRec.recommendation as keyof typeof recOrder] || 0) : 0;
          bValue = bRec ? (recOrder[bRec.recommendation as keyof typeof recOrder] || 0) : 0;
          break;
        default:
          aValue = a.volume;
          bValue = b.volume;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [priceData, searchQuery, quoteCurrencyFilter, filterType, recommendationFilter, sortBy, sortOrder, scannedPairs, scanResults]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  // Scan individual pair with enhanced error handling
  const scanPair = async (pair: string): Promise<void> => {
    if (scannedPairs.has(pair)) return;
    
    try {
      console.log(`🔍 Starting scan for ${pair}...`);
      setScannedPairs(prev => new Set([...prev, pair]));
      
      const analysis = await performAnalysis({
        pair,
        broker: selectedBroker,
        timeframe: selectedTimeframe,
        tradeType,
        indicators: selectedIndicators,
        strategies: selectedStrategies
      });
      
      if (analysis) {
        setScanResults(prev => new Map([...prev, [pair, analysis]]));
        console.log(`✅ Successfully analyzed ${pair}: ${analysis.recommendation}`);
      } else {
        throw new Error('Analysis returned null result');
      }
    } catch (error) {
      console.error(`❌ Failed to scan ${pair}:`, error);
      // Remove from scanned pairs if analysis failed
      setScannedPairs(prev => {
        const newSet = new Set(prev);
        newSet.delete(pair);
        return newSet;
      });
      
      // Show error notification for individual scans
      if (!isScanning) {
        console.warn(`Individual scan failed for ${pair}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  // Smart filtering for better scan targets
  const getSmartScanTargets = (data: typeof paginatedData) => {
    if (!smartScanEnabled) {
      return data.filter(price => !scannedPairs.has(price.pair));
    }

    let targets = data.filter(price => {
      if (scannedPairs.has(price.pair)) return false;
      
      // Volume filter
      if ((price.quoteVolume || price.volume) < minVolumeFilter) return false;
      
      // Only scan gainers if enabled
      if (scanOnlyGainers && price.change24h <= 0) return false;
      
      return true;
    });

    // Sort by potential - high volume gainers first
    targets.sort((a, b) => {
      const aScore = (a.quoteVolume || a.volume) * (Math.max(0, a.change24h) + 1);
      const bScore = (b.quoteVolume || b.volume) * (Math.max(0, b.change24h) + 1);
      return bScore - aScore;
    });

    return targets;
  };

  // Bulk scan current page
  const handleBulkScan = async () => {
    try {
      if (isScanning) {
        setIsPaused(!isPaused);
        return;
      }

      if (selectedIndicators.length === 0) {
        alert('Please select at least one technical indicator before scanning.');
        return;
      }

      setIsScanning(true);
      setIsPaused(false);
      setCurrentScanIndex(0);
      
      const pairsToScan = getSmartScanTargets(paginatedData);
      
      if (pairsToScan.length === 0) {
        alert('No pairs available for scanning. Try adjusting your filters.');
        setIsScanning(false);
        return;
      }

      console.log(`🚀 Starting bulk scan of ${pairsToScan.length} pairs with smart filtering`);
      
      for (let i = 0; i < pairsToScan.length; i++) {
        if (isPaused) {
          await new Promise(resolve => {
            const checkPause = () => {
              if (!isPaused) {
                resolve(undefined);
              } else {
                setTimeout(checkPause, 100);
              }
            };
            checkPause();
          });
        }

        if (!isScanning) break; // Stop if scanning was cancelled
        
        setCurrentScanIndex(i + 1);
        setScanProgress(Math.round(((i + 1) / pairsToScan.length) * 100));
        
        await scanPair(pairsToScan[i].pair);
        await new Promise(resolve => setTimeout(resolve, scanSpeed));
      }
      
      setIsScanning(false);
      setCurrentScanIndex(0);
      setScanProgress(0);
      
      console.log(`✅ Bulk scan completed. Analyzed ${pairsToScan.length} pairs.`);
    } catch (error) {
      console.error('Error in bulk scan:', error);
      setIsScanning(false);
      setCurrentScanIndex(0);
      setScanProgress(0);
    }
  };

  // Auto-scan functionality
  useEffect(() => {
    if (!autoScanEnabled || isScanning) return;

    const interval = setInterval(async () => {
      try {
        const unscannedPairs = filteredData.filter(price => !scannedPairs.has(price.pair));
        if (unscannedPairs.length === 0) return;

        const batch = unscannedPairs.slice(0, scanBatchSize);
        for (const price of batch) {
          await scanPair(price.pair);
          await new Promise(resolve => setTimeout(resolve, scanSpeed * 2)); // Slower for auto-scan
        }
      } catch (error) {
        console.error('Error in auto-scan:', error);
      }
    }, 30000); // Run every 30 seconds

    return () => clearInterval(interval);
  }, [autoScanEnabled, isScanning, filteredData, scannedPairs, scanBatchSize, scanSpeed]);

  // Stop scanning
  const stopScanning = () => {
    try {
      setIsScanning(false);
      setIsPaused(false);
      setCurrentScanIndex(0);
      setScanProgress(0);
    } catch (error) {
      console.error('Error stopping scan:', error);
    }
  };

  // Clear all results
  const clearResults = () => {
    try {
      setScanResults(new Map());
      setScannedPairs(new Set());
      stopScanning();
    } catch (error) {
      console.error('Error clearing results:', error);
    }
  };

  // Handle refresh with error handling
  const handleRefresh = () => {
    try {
      if (refreshPairs && typeof refreshPairs === 'function') {
        refreshPairs();
      }
    } catch (error) {
      console.error('Error refreshing pairs:', error);
    }
  };

  // Handle individual scan with validation
  const handleIndividualScan = async (pair: string) => {
    try {
      if (!pair) {
        console.error('No pair specified for scan');
        return;
      }

      if (selectedIndicators.length === 0) {
        console.error('No indicators selected for scan');
        return;
      }

      if (scannedPairs.has(pair) || isScanning) {
        return;
      }

      await scanPair(pair);
    } catch (error) {
      console.error(`Error scanning individual pair ${pair}:`, error);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    try {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
      }
    } catch (error) {
      console.error('Error changing page:', error);
    }
  };

  // Get recommendation badge
  const getRecommendationBadge = (recommendation: string) => {
    const badges = {
      STRONG_BUY: { color: 'bg-emerald-600', text: 'Strong Buy', icon: TrendingUpIcon },
      BUY: { color: 'bg-green-600', text: 'Buy', icon: TrendingUp },
      HOLD: { color: 'bg-yellow-600', text: 'Hold', icon: BarChart3 },
      SELL: { color: 'bg-orange-600', text: 'Sell', icon: TrendingDown },
      STRONG_SELL: { color: 'bg-red-600', text: 'Strong Sell', icon: TrendingDown }
    };
    return badges[recommendation as keyof typeof badges] || badges.HOLD;
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, quoteCurrencyFilter, filterType, recommendationFilter, sortBy, sortOrder]);

  const scanStats = useMemo(() => {
    const results = Array.from(scanResults.values());
    return {
      total: results.length,
      strongBuy: results.filter(r => r.recommendation === 'STRONG_BUY').length,
      buy: results.filter(r => r.recommendation === 'BUY').length,
      hold: results.filter(r => r.recommendation === 'HOLD').length,
      sell: results.filter(r => r.recommendation === 'SELL').length,
      strongSell: results.filter(r => r.recommendation === 'STRONG_SELL').length,
      avgConfidence: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.confidence, 0) / results.length) : 0
    };
  }, [scanResults]);

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-semibold text-white">Advanced Bulk Scanner</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-400">Data source:</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  dataSource === 'binance' ? 'bg-emerald-500/20 text-emerald-400' :
                  dataSource === 'alternative' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {dataSource === 'binance' ? '🟢 Binance Live' : 
                   dataSource === 'alternative' ? '🔵 Multi-Source' : 
                   '🟡 Offline Mode'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={dataLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              title="Refresh market data"
            >
              <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
            
            <button
              onClick={clearResults}
              disabled={isScanning}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              title="Clear all scan results"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Clear Results</span>
            </button>
          </div>
        </div>

        {dataError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{dataError}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
            <div className="text-blue-400 font-bold text-lg">{filteredData.length.toLocaleString()}</div>
            <div className="text-blue-300 text-xs">Filtered Pairs</div>
          </div>
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
            <div className="text-purple-400 font-bold text-lg">{scanStats.total}</div>
            <div className="text-purple-300 text-xs">Analyzed</div>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-3 text-center">
            <div className="text-emerald-400 font-bold text-lg">{scanStats.strongBuy + scanStats.buy}</div>
            <div className="text-emerald-300 text-xs">Buy Signals</div>
          </div>
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-center">
            <div className="text-red-400 font-bold text-lg">{scanStats.sell + scanStats.strongSell}</div>
            <div className="text-red-300 text-xs">Sell Signals</div>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 text-center">
            <div className="text-yellow-400 font-bold text-lg">{scanStats.avgConfidence}%</div>
            <div className="text-yellow-300 text-xs">Avg Confidence</div>
          </div>
          <div className="bg-gray-500/20 border border-gray-500/30 rounded-lg p-3 text-center">
            <div className="text-gray-400 font-bold text-lg">{scanStats.hold}</div>
            <div className="text-gray-300 text-xs">Hold Signals</div>
          </div>
        </div>

        {/* Scan Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBulkScan}
              disabled={paginatedData.length === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
            >
              {isScanning ? (
                isPaused ? (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Resume Scan</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pause Scan</span>
                  </>
                )
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Start Bulk Scan</span>
                </>
              )}
            </button>

            {isScanning && (
              <button
                onClick={stopScanning}
                className="flex items-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Stop</span>
              </button>
            )}

            {isScanning && (
              <div className="flex items-center space-x-2">
                <div className="bg-gray-700 rounded-full px-3 py-1">
                  <span className="text-sm text-gray-300">
                    {currentScanIndex} / {getSmartScanTargets(paginatedData).length}
                  </span>
                </div>
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-400">{scanProgress}%</span>
                {smartScanEnabled && (
                  <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded">
                    🧠 Smart
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-400">Auto-scan:</label>
              <button
                onClick={() => setAutoScanEnabled(!autoScanEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoScanEnabled ? 'bg-emerald-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoScanEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <select
                value={scanSpeed}
                onChange={(e) => setScanSpeed(Number(e.target.value))}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value={100}>Fast (0.1s)</option>
                <option value={500}>Normal (0.5s)</option>
                <option value={1000}>Slow (1s)</option>
                <option value={2000}>Very Slow (2s)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-400">Smart scan:</label>
              <button
                onClick={() => setSmartScanEnabled(!smartScanEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  smartScanEnabled ? 'bg-blue-600' : 'bg-gray-600'
                }`}
                title="Enable smart filtering for better scan targets"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    smartScanEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
        {/* Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search trading pairs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>
        </div>

        {/* Smart Scan Settings */}
        {smartScanEnabled && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-blue-400 mb-3">🧠 Smart Scan Settings</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-400">Only gainers:</label>
                <button
                  onClick={() => setScanOnlyGainers(!scanOnlyGainers)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    scanOnlyGainers ? 'bg-emerald-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      scanOnlyGainers ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-400">Min volume:</label>
                <select
                  value={minVolumeFilter}
                  onChange={(e) => setMinVolumeFilter(Number(e.target.value))}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value={100000}>100K</option>
                  <option value={500000}>500K</option>
                  <option value={1000000}>1M</option>
                  <option value={5000000}>5M</option>
                  <option value={10000000}>10M</option>
                </select>
              </div>

              <div className="text-xs text-gray-400">
                🎯 Smart scan prioritizes high-volume, trending pairs for better results
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Quote Currency Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={quoteCurrencyFilter}
              onChange={(e) => setQuoteCurrencyFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Quotes</option>
              {quoteCurrencies.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>

          {/* Performance Filter */}
          <div className="flex space-x-2">
            {[
              { id: 'all', label: 'All', icon: BarChart3 },
              { id: 'gainers', label: 'Gainers', icon: TrendingUp },
              { id: 'losers', label: 'Losers', icon: TrendingDown },
              { id: 'high_volume', label: 'High Volume', icon: Eye },
              { id: 'analyzed', label: 'Analyzed', icon: CheckCircle }
            ].map(filter => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setFilterType(filter.id as any)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filterType === filter.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>

          {/* Recommendation Filter */}
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-gray-400" />
            <select
              value={recommendationFilter}
              onChange={(e) => setRecommendationFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Recommendations</option>
              <option value="STRONG_BUY">Strong Buy</option>
              <option value="BUY">Buy</option>
              <option value="HOLD">Hold</option>
              <option value="SELL">Sell</option>
              <option value="STRONG_SELL">Strong Sell</option>
            </select>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="volume">Volume</option>
              <option value="change24h">24h Change</option>
              <option value="confidence">Confidence</option>
              <option value="recommendation">Recommendation</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 bg-gray-700 border border-gray-600 rounded text-gray-300 hover:bg-gray-600 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-900">
              <tr>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Pair</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Price</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">24h Change</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Volume</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Recommendation</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Confidence</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((price, index) => {
                const analysis = scanResults.get(price.pair);
                const isScanned = scannedPairs.has(price.pair);
                const badge = analysis ? getRecommendationBadge(analysis.recommendation) : null;
                
                return (
                  <tr key={`${price.pair}-${index}`} className="hover:bg-gray-700/50 border-b border-gray-700">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{price.pair}</span>
                        {analysis && (
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-white font-mono">
                      ${price.price.toLocaleString(undefined, { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className={`flex items-center justify-end space-x-1 ${
                        price.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {price.change24h >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span className="font-mono font-bold">
                          {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-300 font-mono">
                      ${((price.quoteVolume || price.volume) / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isScanned ? (
                        <span className="px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded text-xs">
                          Analyzed
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded text-xs">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {badge && analysis ? (
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium text-white ${badge.color}`}>
                          <badge.icon className="w-3 h-3" />
                          <span>{badge.text}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {analysis ? (
                        <span className="text-white font-mono">{analysis.confidence}%</span>
                      ) : (
                        <span className="text-gray-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                                              <button
                          onClick={() => handleIndividualScan(price.pair)}
                          disabled={isScanned || isScanning}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            isScanned
                              ? 'bg-gray-600/20 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                          type="button"
                          title={isScanned ? 'Already scanned' : 'Scan this pair'}
                        >
                          {isScanned ? 'Done' : 'Scan'}
                        </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-700 bg-gray-900">
            <div className="text-sm text-gray-400">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} pairs
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
                  return (
                                          <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded ${
                          currentPage === pageNum
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        type="button"
                        title={`Go to page ${pageNum}`}
                      >
                        {pageNum}
                      </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
                title="Next page"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Recommendations */}
      {scanResults.size > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(scanResults.entries())
              .filter(([_, analysis]) => ['STRONG_BUY', 'BUY'].includes(analysis.recommendation))
              .sort(([_, a], [__, b]) => b.confidence - a.confidence)
              .slice(0, 6)
              .map(([pair, analysis]) => {
                const badge = getRecommendationBadge(analysis.recommendation);
                return (
                  <div key={pair} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{pair}</h4>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium text-white ${badge.color}`}>
                        <badge.icon className="w-3 h-3" />
                        <span>{badge.text}</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confidence:</span>
                        <span className="text-white font-mono">{analysis.confidence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Entry:</span>
                        <span className="text-emerald-400 font-mono">${analysis.entryPrice.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Target:</span>
                        <span className="text-blue-400 font-mono">${analysis.targetPrice.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Risk/Reward:</span>
                        <span className="text-purple-400 font-mono">{analysis.riskRewardRatio.toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 mt-3 line-clamp-2">
                      {analysis.explanation}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkScanner;