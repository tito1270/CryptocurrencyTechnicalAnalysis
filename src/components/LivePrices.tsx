import React, { useState, useEffect, useMemo } from 'react';
import { PriceData, AnalysisResult } from '../types';
import { useBinancePairs } from '../hooks/useBinancePairs';
import { performAnalysis } from '../utils/analysisEngine';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  Zap,
  Target,
  AlertCircle,
  CheckCircle,
  Eye,
  TrendingDown as TrendingDownIcon
} from 'lucide-react';

interface LivePricesProps {
  selectedPair?: string;
  selectedBroker?: string;
}

const ITEMS_PER_PAGE = 50;

const LivePrices: React.FC<LivePricesProps> = ({ selectedPair, selectedBroker }) => {
  const { pairs, priceData, loading, error, lastUpdated, refreshPairs, totalPairs, activePairs, dataSource } = useBinancePairs();
  
  // Pagination and filtering states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'volume' | 'change24h' | 'price' | 'pair'>('volume');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'gainers' | 'losers' | 'high_volume'>('all');
  const [quoteCurrencyFilter, setQuoteCurrencyFilter] = useState<string>('all');
  
  // Scanning states
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<Map<string, AnalysisResult>>(new Map());
  const [scannedPairs, setScannedPairs] = useState<Set<string>>(new Set());

  // Get unique quote currencies for filtering
  const quoteCurrencies = useMemo(() => {
    const currencies = new Set<string>();
    priceData.forEach(price => {
      const quote = price.pair.split('/')[1];
      if (quote) currencies.add(quote);
    });
    return Array.from(currencies).sort();
  }, [priceData]);

  // Filtered and sorted data
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
      switch (filterBy) {
        case 'gainers':
          return price.change24h > 0;
        case 'losers':
          return price.change24h < 0;
        case 'high_volume':
          const avgVolume = priceData.reduce((sum, p) => sum + (p.quoteVolume || p.volume), 0) / priceData.length;
          return (price.quoteVolume || price.volume) > avgVolume;
        default:
          return true;
      }
    });

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
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'pair':
          return sortOrder === 'asc' ? a.pair.localeCompare(b.pair) : b.pair.localeCompare(a.pair);
        default:
          aValue = a.volume;
          bValue = b.volume;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [priceData, searchQuery, quoteCurrencyFilter, filterBy, sortBy, sortOrder]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  // Handle scan individual pair
  const handleScanPair = async (pair: string) => {
    try {
      if (isScanning || scannedPairs.has(pair)) return;
      
      if (!pair) {
        console.error('No pair specified for scan');
        return;
      }
      
      setIsScanning(true);
      setScannedPairs(prev => new Set([...prev, pair]));
      
      const analysis = await performAnalysis({
        pair,
        broker: 'binance',
        timeframe: '1h',
        tradeType: 'SPOT' as const,
        indicators: ['RSI', 'MACD', 'SMA', 'BOLLINGER'],
        strategies: ['MOMENTUM', 'TREND_FOLLOWING']
      });
      
      setScanResults(prev => new Map([...prev, [pair, analysis]]));
    } catch (error) {
      console.error(`Failed to scan ${pair}:`, error);
      // Remove from scanned pairs if analysis failed
      setScannedPairs(prev => {
        const newSet = new Set(prev);
        newSet.delete(pair);
        return newSet;
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Handle bulk scan visible pairs
  const handleBulkScan = async () => {
    try {
      if (isScanning) return;
      
      setIsScanning(true);
      const pairsToScan = paginatedData.map(price => price.pair);
      
      for (const pair of pairsToScan) {
        if (scannedPairs.has(pair)) continue;
        
        setScannedPairs(prev => new Set([...prev, pair]));
        
        try {
          const analysis = await performAnalysis({
            pair,
            broker: 'binance',
            timeframe: '1h',
            tradeType: 'SPOT' as const,
            indicators: ['RSI', 'MACD', 'SMA', 'BOLLINGER'],
            strategies: ['MOMENTUM', 'TREND_FOLLOWING']
          });
          
          setScanResults(prev => new Map([...prev, [pair, analysis]]));
        } catch (error) {
          console.error(`Failed to analyze ${pair}:`, error);
          // Remove from scanned pairs if analysis failed
          setScannedPairs(prev => {
            const newSet = new Set(prev);
            newSet.delete(pair);
            return newSet;
          });
        }
        
        // Add delay between scans
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error in bulk scan:', error);
    } finally {
      setIsScanning(false);
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
      STRONG_BUY: { color: 'bg-emerald-600', text: 'Strong Buy', icon: TrendingUp },
      BUY: { color: 'bg-green-600', text: 'Buy', icon: TrendingUp },
      HOLD: { color: 'bg-yellow-600', text: 'Hold', icon: BarChart3 },
      SELL: { color: 'bg-orange-600', text: 'Sell', icon: TrendingDown },
      STRONG_SELL: { color: 'bg-red-600', text: 'Strong Sell', icon: TrendingDownIcon }
    };
    return badges[recommendation as keyof typeof badges] || badges.HOLD;
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, quoteCurrencyFilter, filterBy, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Live Market Prices</h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-400">
                Data source: 
              </span>
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
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              title="Refresh live prices"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Loading...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
            <div className="text-blue-400 font-bold text-lg">{totalPairs.toLocaleString()}</div>
            <div className="text-blue-300 text-xs">Total Symbols</div>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-3 text-center">
            <div className="text-emerald-400 font-bold text-lg">{activePairs.toLocaleString()}</div>
            <div className="text-emerald-300 text-xs">Active Pairs</div>
          </div>
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
            <div className="text-purple-400 font-bold text-lg">{filteredData.length.toLocaleString()}</div>
            <div className="text-purple-300 text-xs">Filtered Results</div>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 text-center">
            <div className="text-yellow-400 font-bold text-lg">{scannedPairs.size}</div>
            <div className="text-yellow-300 text-xs">Scanned Pairs</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
        {/* Search and Bulk Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search pairs (e.g., BTC, ETH, DOGE)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 w-64"
              />
            </div>
            <button
              onClick={handleBulkScan}
              disabled={isScanning || paginatedData.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              title="Scan all pairs on current page"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Bulk Scan Page</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
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
              { id: 'high_volume', label: 'High Volume', icon: Eye }
            ].map(filter => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setFilterBy(filter.id as any)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filterBy === filter.id
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
              <option value="price">Price</option>
              <option value="pair">Pair Name</option>
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

      {/* Price Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-900">
              <tr>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Pair</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Price</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">24h Change</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Volume</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Analysis</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((price, index) => {
                const scanResult = scanResults.get(price.pair);
                const isScanned = scannedPairs.has(price.pair);
                const badge = scanResult ? getRecommendationBadge(scanResult.recommendation) : null;
                
                return (
                  <tr key={`${price.pair}-${index}`} className="hover:bg-gray-700/50 border-b border-gray-700">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{price.pair}</span>
                        {scanResult && (
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span className="text-xs text-emerald-400">Analyzed</span>
                          </div>
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
                      <button
                        onClick={() => handleScanPair(price.pair)}
                        disabled={isScanning || isScanned}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          isScanned
                            ? 'bg-emerald-600/20 text-emerald-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                        type="button"
                        title={isScanned ? 'Already scanned' : `Scan ${price.pair}`}
                      >
                        {isScanned ? 'Scanned' : 'Scan'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {badge && scanResult && (
                        <div className="flex flex-col items-center space-y-1">
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium text-white ${badge.color}`}>
                            <badge.icon className="w-3 h-3" />
                            <span>{badge.text}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {scanResult.confidence}% conf.
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-700 bg-gray-900 space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <span>Page {currentPage} of {totalPages.toLocaleString()}</span>
                <span>•</span>
                <span>Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length.toLocaleString()} pairs</span>
                <span>•</span>
                <span>{Math.min(ITEMS_PER_PAGE, filteredData.length - (currentPage - 1) * ITEMS_PER_PAGE)} per page</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                  currentPage === 1
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
                type="button"
                title="First page"
              >
                ⏮️ First
              </button>

              {/* Previous Page */}
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                type="button"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              
              {/* Page Numbers */}
              <div className="hidden sm:flex items-center space-x-1">
                {(() => {
                  const pages = [];
                  const showPages = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
                  let endPage = Math.min(totalPages, startPage + showPages - 1);
                  
                  if (endPage - startPage < showPages - 1) {
                    startPage = Math.max(1, endPage - showPages + 1);
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                          currentPage === i
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                        type="button"
                        title={`Go to page ${i}`}
                      >
                        {i}
                      </button>
                    );
                  }
                  return pages;
                })()}
              </div>

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                type="button"
                title="Next page"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                  currentPage === totalPages
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
                type="button"
                title="Last page"
              >
                Last ⏭️
              </button>
            </div>
          </div>
        )}

        {/* Quick Jump to Page */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 p-3 bg-gray-800/50 border-t border-gray-700 text-sm">
            <span className="text-gray-400">Jump to page:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  handlePageChange(page);
                }
              }}
              className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-center"
            />
            <span className="text-gray-400">of {totalPages.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Scan Results Summary */}
      {scanResults.size > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Analysis Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL'].map(rec => {
              const count = Array.from(scanResults.values()).filter(result => result.recommendation === rec).length;
              const badge = getRecommendationBadge(rec);
              return (
                <div key={rec} className={`${badge.color}/20 border ${badge.color}/30 rounded-lg p-3 text-center`}>
                  <div className={`font-bold text-lg`} style={{ color: badge.color.replace('bg-', '').replace('-600', '') === 'emerald' ? '#10b981' : 
                    badge.color.replace('bg-', '').replace('-600', '') === 'green' ? '#059669' :
                    badge.color.replace('bg-', '').replace('-600', '') === 'yellow' ? '#d97706' :
                    badge.color.replace('bg-', '').replace('-600', '') === 'orange' ? '#ea580c' : '#dc2626' }}>
                    {count}
                  </div>
                  <div className="text-xs text-gray-300">{badge.text}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LivePrices;