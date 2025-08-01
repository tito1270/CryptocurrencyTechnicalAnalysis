import React, { useState, useEffect } from 'react';
import { PriceData } from '../types';
import { generateLivePrices } from '../utils/priceSimulator';
import { TrendingUp, TrendingDown, RefreshCw, Trophy, AlertTriangle } from 'lucide-react';

interface LivePricesProps {
  selectedPair?: string;
  selectedBroker?: string;
}

const LivePrices: React.FC<LivePricesProps> = ({ selectedPair, selectedBroker }) => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

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

  useEffect(() => {
    refreshPrices();
    const interval = setInterval(refreshPrices, 30000); // Update every 30 seconds for real live data
    return () => clearInterval(interval);
  }, []);

  // Filter and sort coins for best and worst performers
  const filterByBroker = selectedBroker ? prices.filter(price => price.broker === selectedBroker) : prices;
  
  // Get unique pairs and their best performance from the selected broker (or all brokers)
  const uniquePairs = filterByBroker.reduce((acc, price) => {
    const existing = acc.find(p => p.pair === price.pair);
    if (!existing || price.change24h > existing.change24h) {
      acc = acc.filter(p => p.pair !== price.pair);
      acc.push(price);
    }
    return acc;
  }, [] as PriceData[]);

  // Sort by performance
  const sortedPairs = uniquePairs.sort((a, b) => b.change24h - a.change24h);
  
  // Get top 30 best and worst performers
  const bestPerformers = sortedPairs.slice(0, 30);
  const worstPerformers = sortedPairs.slice(-30).reverse(); // reverse to show worst first

  const renderCoinTable = (coins: PriceData[], title: string, icon: React.ReactNode, colorClass: string) => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <span className="text-xs text-gray-400">({coins.length})</span>
        </div>
        <div className="text-xs text-gray-400">
          {selectedBroker ? `${selectedBroker.toUpperCase()} only` : 'All exchanges'}
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-96">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-800">
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 text-gray-400">#</th>
              <th className="text-left py-2 text-gray-400">Pair</th>
              <th className="text-right py-2 text-gray-400">Price</th>
              <th className="text-right py-2 text-gray-400">24h Change</th>
              <th className="text-right py-2 text-gray-400">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {coins.map((coin, index) => (
              <tr key={`${coin.broker}-${coin.pair}-${index}`} className="hover:bg-gray-700/50">
                <td className="py-2 text-gray-400 font-mono">#{index + 1}</td>
                <td className="py-2">
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{coin.pair}</span>
                    <span className="text-xs text-gray-400 capitalize">{coin.broker}</span>
                  </div>
                </td>
                <td className="py-2 text-right text-white font-mono">
                  ${coin.price < 0.001 ? coin.price.toExponential(3) : coin.price.toFixed(coin.price > 1 ? 2 : 6)}
                </td>
                <td className="py-2 text-right">
                  <div className={`flex items-center justify-end space-x-1 ${colorClass}`}>
                    {coin.change24h >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span className="font-mono font-bold">
                      {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                    </span>
                  </div>
                </td>
                <td className="py-2 text-right text-gray-300 font-mono">
                  ${(coin.volume / 1000000).toFixed(1)}M
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {coins.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No data available
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Market Performance Overview</h2>
          <div className="flex items-center space-x-2">
            {lastUpdate && (
              <span className="text-xs text-gray-400">
                Updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={refreshPrices}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-sm">
                {isLoading ? 'Refreshing...' : 'Refresh Market Data'}
              </span>
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-gray-300 text-sm">
            Real-time cryptocurrency market performance showing the top 30 best and worst performing coins{selectedBroker ? ` from ${selectedBroker.charAt(0).toUpperCase() + selectedBroker.slice(1)} exchange` : ' across all exchanges'}.
            {selectedBroker && ` You can change the exchange in the trading configuration above.`}
          </p>
          <div className="flex items-center space-x-2 text-xs">
            <div className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded text-emerald-400">
              🟢 LIVE PRICES: Real cryptocurrency market data from CoinGecko, CoinCap & Exchange APIs
            </div>
            <div className="px-2 py-1 bg-gray-700 rounded text-gray-400">
              🔄 Updates every 30 seconds
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-3 text-center">
            <div className="text-emerald-400 font-bold text-lg">{bestPerformers.length > 0 ? `+${bestPerformers[0]?.change24h.toFixed(2)}%` : 'N/A'}</div>
            <div className="text-emerald-300 text-xs">Top Gainer</div>
          </div>
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-center">
            <div className="text-red-400 font-bold text-lg">{worstPerformers.length > 0 ? `${worstPerformers[0]?.change24h.toFixed(2)}%` : 'N/A'}</div>
            <div className="text-red-300 text-xs">Top Loser</div>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
            <div className="text-blue-400 font-bold text-lg">{uniquePairs.length}</div>
            <div className="text-blue-300 text-xs">Total Pairs</div>
          </div>
        </div>
      </div>

      {/* Best and Worst Performers Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderCoinTable(
          bestPerformers,
          "Top 30 Best Performing Coins",
          <Trophy className="w-5 h-5 text-emerald-400" />,
          "text-emerald-400"
        )}
        
        {renderCoinTable(
          worstPerformers,
          "Top 30 Worst Performing Coins",
          <AlertTriangle className="w-5 h-5 text-red-400" />,
          "text-red-400"
        )}
      </div>
      
      {/* Data Source Indicator */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-emerald-500/30 rounded-lg">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-emerald-400 font-medium">LIVE MARKET DATA</span>
          <span className="text-xs text-gray-400">• Real prices from CoinGecko & Exchange APIs • Auto-refresh</span>
        </div>
      </div>
    </div>
  );
};

export default LivePrices;
