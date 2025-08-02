import React, { useState, useMemo } from 'react';

interface CryptoPairSearchProps {
  pairs: string[];
  selectedPair: string;
  onPairSelect: (pair: string) => void;
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
  lastUpdated?: number | null;
  onRefresh?: () => void;
}

const ITEMS_PER_PAGE = 100;

const CryptoPairSearch: React.FC<CryptoPairSearchProps> = ({
  pairs,
  selectedPair,
  onPairSelect,
  isOpen,
  onClose,
  loading = false,
  error = null,
  lastUpdated = null,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredPairs = useMemo(() => {
    let filtered = pairs || []; // Add null safety

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pair => {
        const lowerPair = pair.toLowerCase();
        const [base, quote] = pair.split('/');
        return (
          lowerPair.includes(query) ||
          base.toLowerCase().includes(query) ||
          quote.toLowerCase().includes(query) ||
          lowerPair.startsWith(query) ||
          base.toLowerCase().startsWith(query)
        );
      });
      
      // Sort by relevance - exact matches first, then starts with, then contains
      filtered.sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const [aBase] = a.split('/');
        const [bBase] = b.split('/');
        
        // Exact base match first
        if (aBase.toLowerCase() === query && bBase.toLowerCase() !== query) return -1;
        if (bBase.toLowerCase() === query && aBase.toLowerCase() !== query) return 1;
        
        // Starts with query
        if (aLower.startsWith(query) && !bLower.startsWith(query)) return -1;
        if (bLower.startsWith(query) && !aLower.startsWith(query)) return 1;
        
        // Base starts with query
        if (aBase.toLowerCase().startsWith(query) && !bBase.toLowerCase().startsWith(query)) return -1;
        if (bBase.toLowerCase().startsWith(query) && !aBase.toLowerCase().startsWith(query)) return 1;
        
        // Alphabetical
        return a.localeCompare(b);
      });
    } else {
      filtered = filtered.sort();
    }

    return filtered;
  }, [pairs, searchQuery]);

  const totalPages = Math.ceil(filteredPairs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPairs = filteredPairs.slice(startIndex, endIndex);

  const handlePairSelect = (pair: string) => {
    try {
      if (onPairSelect && typeof onPairSelect === 'function') {
        onPairSelect(pair);
      }
      if (onClose && typeof onClose === 'function') {
        onClose();
      }
    } catch (err) {
      console.error('Error selecting pair:', err);
    }
  };

  const handleRefresh = () => {
    try {
      if (onRefresh && typeof onRefresh === 'function') {
        onRefresh();
      }
    } catch (err) {
      console.error('Error refreshing pairs:', err);
    }
  };

  const handleClose = () => {
    try {
      if (onClose && typeof onClose === 'function') {
        onClose();
      }
    } catch (err) {
      console.error('Error closing modal:', err);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
    setSelectedIndex(0);
  }, [searchQuery]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!currentPairs.length) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, currentPairs.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (currentPairs[selectedIndex]) {
          handlePairSelect(currentPairs[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        handleClose();
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col" onKeyDown={handleKeyDown}>
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Select Trading Pair</h2>
              {lastUpdated && (
                <p className="text-sm text-gray-400 mt-1">
                  Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {onRefresh && (
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh pairs"
                  type="button"
                >
                  <span className={`text-gray-400 ${loading ? 'animate-spin' : ''}`}>
                    ↻
                  </span>
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Close dialog"
                type="button"
              >
                <span className="text-gray-400 text-lg">×</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search crypto pairs (e.g., BTC, ETH, DOGE)..."
              value={searchQuery}
              onChange={(e) => {
                try {
                  setSearchQuery(e.target.value);
                } catch (error) {
                  console.error('Error updating search query:', error);
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && filteredPairs.length > 0) {
                  handlePairSelect(filteredPairs[0]);
                }
              }}
              className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              autoFocus
              disabled={loading}
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                title="Clear search"
                type="button"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mb-4"></div>
              <p className="text-gray-400">Loading active trading pairs...</p>
              <p className="text-sm text-gray-500 mt-2">Fetching live data from exchange</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <div className="text-red-400 text-4xl mb-4">⚠️</div>
              <p className="text-red-400 font-medium mb-2">Failed to Load Trading Pairs</p>
              <p className="text-sm text-gray-400 mb-4">{error}</p>
              {onRefresh && (
                <button
                  onClick={handleRefresh}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  type="button"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pairs List */}
        {!loading && !error && (
          <div className="flex-1 overflow-auto p-6">
            {pairs && pairs.length > 0 && (
              <div className="mb-6 text-center bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="text-emerald-400 font-semibold">
                    📊 {pairs.length.toLocaleString()} Total Pairs
                  </div>
                  <div className="text-gray-400">•</div>
                  <div className="text-blue-400 font-semibold">
                    🔍 {filteredPairs.length.toLocaleString()} Filtered
                  </div>
                  <div className="text-gray-400">•</div>
                  <div className="text-purple-400 font-semibold">
                    📄 {currentPairs.length} Per Page
                  </div>
                </div>
                {searchQuery && (
                  <div className="mt-2 text-xs text-gray-500">
                    Search results for: "<span className="text-emerald-400">{searchQuery}</span>"
                  </div>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {currentPairs.map((pair, index) => {
                const [base, quote] = pair.split('/');
                const isSelected = selectedPair === pair;
                const isHighlighted = index === selectedIndex;
                return (
                  <button
                    key={pair}
                    onClick={() => handlePairSelect(pair)}
                    className={`p-3 rounded-lg text-left transition-all duration-200 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-lg transform scale-105 ring-2 ring-emerald-400'
                        : isHighlighted
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:shadow-md'
                    }`}
                    type="button"
                    disabled={loading}
                  >
                    <div className="font-medium text-sm">
                      <span className="text-white">{base}</span>
                      <span className="text-gray-400 text-xs">/{quote}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredPairs.length === 0 && pairs && pairs.length > 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-lg font-medium">No trading pairs found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Try adjusting your search terms or browse all {pairs.length.toLocaleString()} available pairs
                </p>
                <button
                  onClick={handleClearSearch}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm"
                  type="button"
                >
                  Clear Search
                </button>
              </div>
            )}

            {(!pairs || pairs.length === 0) && !loading && !error && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-lg font-medium">No pairs available</p>
                <p className="text-sm text-gray-500 mt-2">
                  Please check your connection and try refreshing
                </p>
                {onRefresh && (
                  <button
                    onClick={handleRefresh}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                    type="button"
                  >
                    Refresh Pairs
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Enhanced Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="p-6 border-t border-gray-700 bg-gray-800/50">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <span>Page {currentPage} of {totalPages.toLocaleString()}</span>
                  <span>•</span>
                  <span>{filteredPairs.length.toLocaleString()} pairs total</span>
                  <span>•</span>
                  <span>Showing {Math.min(ITEMS_PER_PAGE, filteredPairs.length - (currentPage - 1) * ITEMS_PER_PAGE)} pairs</span>
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
                >
                  ⏮️ First
                </button>

                {/* Previous Page */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                  type="button"
                >
                  <span>←</span>
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
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                  type="button"
                >
                  <span>Next</span>
                  <span>→</span>
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
                >
                  Last ⏭️
                </button>
              </div>
            </div>

            {/* Quick Jump */}
            <div className="mt-4 flex items-center justify-center space-x-2 text-sm">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoPairSearch;