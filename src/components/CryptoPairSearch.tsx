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

  const filteredPairs = useMemo(() => {
    let filtered = pairs;

    if (searchQuery.trim()) {
      filtered = filtered.filter(pair =>
        pair.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort();
  }, [pairs, searchQuery]);

  const totalPages = Math.ceil(filteredPairs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPairs = filteredPairs.slice(startIndex, endIndex);

  const handlePairSelect = (pair: string) => {
    onPairSelect(pair);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
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
                  onClick={onRefresh}
                  disabled={loading}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh pairs"
                >
                  <span className={`text-gray-400 ${loading ? 'animate-spin' : ''}`}>
                    ↻
                  </span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
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
              placeholder="Search crypto pairs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              autoFocus
              disabled={loading}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent mb-4"></div>
              <p className="text-gray-400">Loading active trading pairs...</p>
              <p className="text-sm text-gray-500 mt-2">Fetching live data from Binance</p>
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
                  onClick={onRefresh}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
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
            {pairs.length > 0 && (
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
              {currentPairs.map(pair => {
                const [base, quote] = pair.split('/');
                return (
                  <button
                    key={pair}
                    onClick={() => handlePairSelect(pair)}
                    className={`p-3 rounded-lg text-left transition-all duration-200 ${
                      selectedPair === pair
                        ? 'bg-emerald-600 text-white shadow-lg transform scale-105'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="font-medium text-sm">
                      <span className="text-white">{base}</span>
                      <span className="text-gray-400 text-xs">/{quote}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredPairs.length === 0 && pairs.length > 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-lg font-medium">No trading pairs found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Try adjusting your search terms or browse all {pairs.length.toLocaleString()} available pairs
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm"
                >
                  Clear Search
                </button>
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
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                    currentPage === 1
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  ⏮️ First
                </button>

                {/* Previous Page */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
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
                          onClick={() => setCurrentPage(i)}
                          className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                            currentPage === i
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
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
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <span>Next</span>
                  <span>→</span>
                </button>

                {/* Last Page */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                    currentPage === totalPages
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
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
                    setCurrentPage(page);
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