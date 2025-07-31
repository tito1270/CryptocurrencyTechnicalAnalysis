import React, { useState, useEffect } from 'react';
import { PriceData } from '../types';
import { generateLivePrices } from '../utils/priceSimulator';
import { TrendingUp, TrendingDown, RefreshCw, Search, Filter } from 'lucide-react';

interface LivePricesProps {
  selectedPair?: string;
  selectedBroker?: string;
}

const LivePrices: React.FC<LivePricesProps> = ({ selectedPair, selectedBroker }) => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [filterPair, setFilterPair] = useState('');
  const [filterBroker, setFilterBroker] = useState('');

  const refreshPrices = async () => {
    setIsLoading(true);
    try {
      const newPrices = await generateLivePrices();
      setPrices(newPrices);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error refreshing prices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter prices based on current filters
  const filteredPrices = prices.filter(price => {
    const pairMatch = filterPair === '' || price.pair.toLowerCase().includes(filterPair.toLowerCase());
    const brokerMatch = filterBroker === '' || price.broker === filterBroker;
    return pairMatch && brokerMatch;
  });

  useEffect(() => {
    refreshPrices();
    const interval = setInterval(refreshPrices, 60000); // Update every 60 seconds
    return () => clearInterval(interval);
  }, []);

  // Auto-set filters based on selected pair/broker
  useEffect(() => {
    if (selectedPair && selectedPair !== filterPair) {
      setFilterPair(selectedPair);
    }
  }, [selectedPair, filterPair]);

  useEffect(() => {
    if (selectedBroker && selectedBroker !== filterBroker) {
      setFilterBroker(selectedBroker);
    }
  }, [selectedBroker, filterBroker]);
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Live Prices</h2>
        <div className="flex items-center space-x-2">
          {lastUpdate && (
            <span className="text-xs text-gray-400">
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refreshPrices}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gray-300 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm text-gray-300">
              {isLoading ? 'Loading...' : 'Refresh'}
            </span>
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by pair (e.g., BTC, ETH)..."
            value={filterPair}
            onChange={(e) => setFilterPair(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filterBroker}
            onChange={(e) => setFilterBroker(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none"
          >
            <option value="">All Exchanges</option>
            <option value="binance">Binance</option>
            <option value="okx">OKX</option>
            <option value="coinbase">Coinbase Pro</option>
            <option value="kraken">Kraken</option>
            <option value="kucoin">KuCoin</option>
            <option value="huobi">Huobi</option>
            <option value="gate">Gate.io</option>
            <option value="bitget">Bitget</option>
            <option value="mexc">MEXC</option>
            <option value="bybit">Bybit</option>
            <option value="crypto_com">Crypto.com</option>
            <option value="bingx">BingX</option>
            <option value="bitfinex">Bitfinex</option>
            <option value="phemex">Phemex</option>
            <option value="deribit">Deribit</option>
          </select>
        </div>
      </div>
      
      <div className="text-sm text-gray-400 mb-3">
        Showing {filteredPrices.length} of {prices.length} price feeds 
        {prices.length > 0 && (
          <span className="ml-2 text-emerald-400">• LIVE DATA</span>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 text-gray-400">Exchange</th>
              <th className="text-left py-2 text-gray-400">Pair</th>
              <th className="text-right py-2 text-gray-400">Price</th>
              <th className="text-right py-2 text-gray-400">24h Change</th>
              <th className="text-right py-2 text-gray-400">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredPrices.slice(0, 50).map((price, index) => (
              <tr key={`${price.broker}-${price.pair}-${index}`} className="hover:bg-gray-700/50">
                <td className="py-2 text-gray-300 capitalize">{price.broker}</td>
                <td className="py-2 text-white font-medium">{price.pair}</td>
                <td className="py-2 text-right text-white font-mono">
                  ${price.price < 0.001 ? price.price.toExponential(3) : price.price.toFixed(price.price > 1 ? 2 : 6)}
                </td>
                <td className="py-2 text-right">
                  <div className={`flex items-center justify-end space-x-1 ${
                    price.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {price.change24h >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span className="font-mono">
                      {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                    </span>
                  </div>
                </td>
                <td className="py-2 text-right text-gray-300 font-mono">
                  ${(price.volume / 1000000).toFixed(1)}M
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LivePrices;