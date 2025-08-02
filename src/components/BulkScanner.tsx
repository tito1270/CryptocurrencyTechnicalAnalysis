import React, { useState } from 'react';
import { Search, Filter, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { generateLivePrices } from '../utils/priceSimulator';
import { PriceData } from '../types';

interface BulkScannerProps {
  selectedBroker: string;
  selectedTimeframe: string;
  tradeType: 'SPOT' | 'FUTURES';
  selectedIndicators: string[];
  selectedStrategies: string[];
}

const BulkScanner: React.FC<BulkScannerProps> = ({
  selectedBroker,
  selectedTimeframe,
  tradeType,
  selectedIndicators,
  selectedStrategies
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<PriceData[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'gainers' | 'losers'>('all');

  const handleBulkScan = async () => {
    setIsScanning(true);
    
    try {
      const prices = await generateLivePrices();
      setScanResults(prices);
    } catch (error) {
      console.error('Bulk scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const filteredResults = scanResults.filter(result => {
    switch (filterType) {
      case 'gainers':
        return result.change24h > 0;
      case 'losers':
        return result.change24h < 0;
      default:
        return true;
    }
  }).sort((a, b) => b.change24h - a.change24h);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Bulk Market Scanner</h2>
          <p className="text-sm text-gray-400 mt-1">
            Scan multiple pairs simultaneously from {selectedBroker.toUpperCase()}
          </p>
        </div>
        
        <button
          onClick={handleBulkScan}
          disabled={isScanning}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Start Bulk Scan</span>
            </>
          )}
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Filter:</span>
        </div>
        <div className="flex space-x-2">
          {[
            { id: 'all', label: 'All Pairs', icon: BarChart3 },
            { id: 'gainers', label: 'Gainers', icon: TrendingUp },
            { id: 'losers', label: 'Losers', icon: TrendingDown }
          ].map(filter => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === filter.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      {isScanning && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
          <div className="text-white font-bold text-lg">Scanning Market...</div>
          <div className="text-purple-400 text-sm">Analyzing multiple pairs simultaneously</div>
        </div>
      )}

      {scanResults.length > 0 && !isScanning && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">
              Scan Results ({filteredResults.length} pairs)
            </h3>
            <div className="text-sm text-gray-400">
              Last scan: {new Date().toLocaleTimeString()}
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-800">
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 text-gray-400">Pair</th>
                  <th className="text-right py-2 text-gray-400">Price</th>
                  <th className="text-right py-2 text-gray-400">24h Change</th>
                  <th className="text-right py-2 text-gray-400">Volume</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result, index) => (
                  <tr key={`${result.broker}-${result.pair}-${index}`} className="hover:bg-gray-700/50 border-b border-gray-700">
                    <td className="py-2 text-white font-medium">{result.pair}</td>
                    <td className="py-2 text-right text-white font-mono">
                      ${result.price.toLocaleString(undefined, { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6
                      })}
                    </td>
                    <td className="py-2 text-right">
                      <div className={`flex items-center justify-end space-x-1 ${
                        result.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {result.change24h >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span className="font-mono font-bold">
                          {result.change24h >= 0 ? '+' : ''}{result.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2 text-right text-gray-300 font-mono">
                      ${(result.volume / 1000000).toFixed(1)}M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {scanResults.length === 0 && !isScanning && (
        <div className="text-center py-12 text-gray-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Click "Start Bulk Scan" to analyze multiple cryptocurrency pairs</p>
        </div>
      )}
    </div>
  );
};

export default BulkScanner;