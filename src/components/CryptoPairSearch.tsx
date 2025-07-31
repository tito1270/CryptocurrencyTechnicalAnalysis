import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Filter, ArrowRight } from 'lucide-react';
import { cryptoPairTypes, categorizeToken } from '../data/cryptoPairTypes';

interface CryptoPairSearchProps {
  pairs: string[];
  selectedPair: string;
  onPairSelect: (pair: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 300; // Show 300 pairs per batch as requested

const CryptoPairSearch: React.FC<CryptoPairSearchProps> = ({
  pairs,
  selectedPair,
  onPairSelect,
  isOpen,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['all']);
  const [currentPage, setCurrentPage] = useState(1);
  const [showTypeFilter, setShowTypeFilter] = useState(false);

  // Reset to first page when search query or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTypes]);

  // Filter and categorize pairs
  const filteredPairs = useMemo(() => {
    let filtered = pairs;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(pair =>
        pair.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (!selectedTypes.includes('all')) {
      filtered = filtered.filter(pair => {
        const categories = categorizeToken(pair);
        return selectedTypes.some(type => categories.includes(type));
      });
    }

    return filtered.sort();
  }, [pairs, searchQuery, selectedTypes]);

  // Pagination
  const totalPages = Math.ceil(filteredPairs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPairs = filteredPairs.slice(startIndex, endIndex);

  const handleTypeToggle = (typeId: string) => {
    if (typeId === 'all') {
      setSelectedTypes(['all']);
    } else {
      setSelectedTypes(prev => {
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

  const handlePairSelect = (pair: string) => {
    onPairSelect(pair);
    onClose();
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getPairCategory = (pair: string) => {
    const categories = categorizeToken(pair);
    const category = categories[0] || 'other';
    const categoryData = cryptoPairTypes.find(t => t.id === category);
    return categoryData?.name || 'Other';
  };

  const getPairCategoryColor = (pair: string) => {
    const categories = categorizeToken(pair);
    const category = categories[0] || 'other';
    
    const colorMap: { [key: string]: string } = {
      major: 'bg-blue-500',
      defi: 'bg-purple-500',
      gaming: 'bg-green-500',
      layer2: 'bg-orange-500',
      ai: 'bg-cyan-500',
      meme: 'bg-pink-500',
      stablecoin: 'bg-gray-500',
      ecosystem: 'bg-yellow-500',
      privacy: 'bg-red-500',
      interoperability: 'bg-indigo-500',
      other: 'bg-gray-400'
    };
    
    return colorMap[category] || 'bg-gray-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Select Trading Pair</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search crypto pairs (e.g., BTC, ETH, DOGE)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Type Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowTypeFilter(!showTypeFilter)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4 text-gray-300" />
              <span className="text-sm text-gray-300">Filter by Type</span>
            </button>
            
            <div className="text-sm text-gray-400">
              Showing {currentPairs.length} of {filteredPairs.length} pairs • Page {currentPage} of {totalPages}
            </div>
          </div>

          {/* Type Filters */}
          {showTypeFilter && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes('all')}
                    onChange={() => handleTypeToggle('all')}
                    className="rounded border-gray-500 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-300">All Types</span>
                </label>
                {cryptoPairTypes.map(type => (
                  <label key={type.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type.id)}
                      onChange={() => handleTypeToggle(type.id)}
                      className="rounded border-gray-500 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-300">{type.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pairs List */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {currentPairs.map(pair => (
              <button
                key={pair}
                onClick={() => handlePairSelect(pair)}
                className={`flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                  selectedPair === pair
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${getPairCategoryColor(pair)}`}></div>
                  <span className="font-medium">{pair}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {getPairCategory(pair)}
                </span>
              </button>
            ))}
          </div>

          {filteredPairs.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No trading pairs found</p>
              <p className="text-sm mt-2">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Enhanced Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                <span className="font-medium">Batch {currentPage} of {totalPages}</span> • 
                Showing pairs {startIndex + 1}-{Math.min(endIndex, filteredPairs.length)} of {filteredPairs.length} total
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-2 bg-emerald-600 text-white rounded-lg font-medium">
                    {currentPage}
                  </span>
                  <span className="text-gray-400">/</span>
                  <span className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg">
                    {totalPages}
                  </span>
                </div>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentPage / totalPages) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 mt-1 text-center">
                {Math.round((currentPage / totalPages) * 100)}% complete
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoPairSearch;