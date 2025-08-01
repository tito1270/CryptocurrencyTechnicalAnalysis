import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, ChevronLeft, ChevronRight, Filter, ArrowRight, ExternalLink } from 'lucide-react';
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
  const [selectedQuoteCurrencies, setSelectedQuoteCurrencies] = useState<string[]>(['all']);
  const [currentPage, setCurrentPage] = useState(1);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [selectingPair, setSelectingPair] = useState<string | null>(null);

  // Reset to first page when search query or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTypes, selectedQuoteCurrencies]);

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

    // Apply quote currency filter
    if (!selectedQuoteCurrencies.includes('all')) {
      filtered = filtered.filter(pair => {
        const quoteCurrency = pair.split('/')[1]; // Get the part after '/'
        return selectedQuoteCurrencies.some(currency =>
          quoteCurrency && quoteCurrency.toUpperCase() === currency.toUpperCase()
        );
      });
    }

    return filtered.sort();
  }, [pairs, searchQuery, selectedTypes, selectedQuoteCurrencies]);

  // Get available quote currencies from all pairs
  const availableQuoteCurrencies = useMemo(() => {
    const quoteCurrencies = new Set<string>();
    pairs.forEach(pair => {
      const quoteCurrency = pair.split('/')[1];
      if (quoteCurrency) {
        quoteCurrencies.add(quoteCurrency.toUpperCase());
      }
    });
    // Sort by common currencies first, then alphabetically
    const commonCurrencies = ['USDT', 'BTC', 'ETH', 'BUSD', 'USDC', 'BNB', 'FDUSD'];
    const sortedCurrencies = Array.from(quoteCurrencies).sort((a, b) => {
      const aIndex = commonCurrencies.indexOf(a);
      const bIndex = commonCurrencies.indexOf(b);

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });
    return sortedCurrencies;
  }, [pairs]);

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

  const handlePairSelect = (pair: string) => {
    setSelectingPair(pair);
    onPairSelect(pair);
    // Add a small delay to show feedback before closing
    setTimeout(() => {
      setSelectingPair(null);
      onClose();
    }, 300);
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
            <div>
              <h2 className="text-xl font-semibold text-white">Select Trading Pair</h2>
              <p className="text-sm text-gray-400 mt-1">Click any pair to automatically replace current selection and scan</p>
            </div>
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
            <div className="mt-4 p-4 bg-gray-700 rounded-lg space-y-6">
              {/* Crypto Type Filters */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Filter by Token Type</h4>
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

              {/* Quote Currency Filters */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Filter by Quote Currency</h4>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedQuoteCurrencies.includes('all')}
                      onChange={() => handleQuoteCurrencyToggle('all')}
                      className="rounded border-gray-500 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">All Quotes</span>
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
                disabled={selectingPair !== null}
                className={`group flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 hover:scale-[1.02] ${
                  selectingPair === pair
                    ? 'bg-emerald-500 text-white shadow-lg ring-2 ring-emerald-300 animate-pulse'
                    : selectedPair === pair
                    ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:shadow-md'
                } ${selectingPair !== null && selectingPair !== pair ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={`Click to scan ${pair} - URL will update automatically`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${getPairCategoryColor(pair)}`}></div>
                  <span className="font-medium">{pair}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400">
                    {getPairCategory(pair)}
                  </span>
                  <span className="text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Go to Scan
                  </span>
                </div>
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
