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
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshPrices, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter and sort prices
  const filteredPrices = selectedBroker 
    ? prices.filter(price => price.broker === selectedBroker)
    : prices;
  
  const sortedPrices = filteredPrices.sort((a, b) => b.change24h - a.change24h);
  const topGainers = sortedPrices.slice(0, 15);
  const topLosers = sortedPrices.slice(-15).reverse();

  const renderPriceTable = (priceList: PriceData[], title: string, icon: React.ReactNode, colorClass: string) => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-80">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 text-gray-400">Pair</th>
              <th className="text-right py-2 text-gray-400">Price</th>
              <th className="text-right py-2 text-gray-400">24h Change</th>
            </tr>
          </thead>
          <tbody>
            {priceList.map((price, index) => (
              <tr key={`${price.broker}-${price.pair}-${index}`} className="hover:bg-gray-700/50">
                <td className="py-2 text-white font-medium">{price.pair}</td>
                <td className="py-2 text-right text-white font-mono">
                  ${price.price.toLocaleString(undefined, { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6
                  })}
                </td>
                <td className="py-2 text-right">
                  <div className={`flex items-center justify-end space-x-1 ${colorClass}`}>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Live Market Prices</h2>
          <div className="flex items-center space-x-2">
            {lastUpdate && (
              <span className="text-xs text-gray-400">
                Updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={refreshPrices}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
        
        <p className="text-gray-300 text-sm">
          Real-time cryptocurrency prices from Binance exchange. Auto-refreshes every 30 seconds.
        </p>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-3 text-center">
            <div className="text-emerald-400 font-bold text-lg">
              {topGainers.length > 0 ? `+${topGainers[0]?.change24h.toFixed(2)}%` : 'N/A'}
            </div>
            <div className="text-emerald-300 text-xs">Top Gainer</div>
          </div>
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-center">
            <div className="text-red-400 font-bold text-lg">
              {topLosers.length > 0 ? `${topLosers[0]?.change24h.toFixed(2)}%` : 'N/A'}
            </div>
            <div className="text-red-300 text-xs">Top Loser</div>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
            <div className="text-blue-400 font-bold text-lg">{prices.length}</div>
            <div className="text-blue-300 text-xs">Total Pairs</div>
          </div>
        </div>
      </div>

      {/* Price Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderPriceTable(
          topGainers,
          "🏆 Top Gainers",
          <Trophy className="w-5 h-5 text-emerald-400" />,
          "text-emerald-400"
        )}
        
        {renderPriceTable(
          topLosers,
          "📉 Top Losers",
          <AlertTriangle className="w-5 h-5 text-red-400" />,
          "text-red-400"
        )}
      </div>
    </div>
  );
};

export default LivePrices;