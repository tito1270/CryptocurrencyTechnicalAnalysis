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

const ITEMS_PER_PAGE = 50;

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
              <div className="mb-4 text-center">
                <p className="text-sm text-gray-400">
                  Showing {filteredPairs.length} of {pairs.length} active trading pairs
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {currentPairs.map(pair => (
                <button
                  key={pair}
                  onClick={() => handlePairSelect(pair)}
                  className={`p-3 rounded-lg text-left transition-colors ${
                    selectedPair === pair
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <span className="font-medium">{pair}</span>
                </button>
              ))}
            </div>

            {filteredPairs.length === 0 && pairs.length > 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">🔍</div>
                <p>No trading pairs found</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="p-6 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages} • {filteredPairs.length} pairs
              </div>
              
              <div className="flex items-center space-x-2">
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoPairSearch;