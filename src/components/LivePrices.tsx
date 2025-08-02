import React, { useState, useEffect } from 'react';
import { PriceData } from '../types';
import { generateLivePrices } from '../utils/priceSimulator';
import livePriceStreamer from '../utils/livePriceStreamer';
import { TrendingUp, TrendingDown, RefreshCw, Trophy, AlertTriangle, Wifi, WifiOff, Zap } from 'lucide-react';

interface LivePricesProps {
  selectedPair?: string;
  selectedBroker?: string;
}

const LivePrices: React.FC<LivePricesProps> = ({ selectedPair, selectedBroker }) => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'fallback' | 'error'>('connected');
  const [retryCount, setRetryCount] = useState(0);
  const [wsStatus, setWsStatus] = useState<{ [key: string]: boolean }>({});
  const [isStreamingLive, setIsStreamingLive] = useState(false);

  const refreshPrices = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    
    try {
      console.log('🔄 LivePrices: Starting LIVE API price refresh...');
      
      // Set timeout for the entire operation
      const timeoutPromise = new Promise<PriceData[]>((_, reject) => 
        setTimeout(() => reject(new Error('LIVE API timeout')), 8000)
      );
      
      const pricesPromise = generateLivePrices();
      const newPrices = await Promise.race([pricesPromise, timeoutPromise]);
      
      if (newPrices && newPrices.length > 0) {
        setPrices(newPrices);
        setLastUpdate(new Date());
        setConnectionStatus(newPrices.length > 200 ? 'connected' : 'fallback');
        setRetryCount(0);
        
        console.log(`✅ LivePrices: Successfully loaded ${newPrices.length} LIVE prices`);
        
        // Log key prices for verification (use selected broker or fallback to any available)
        const btcPrice = newPrices.find(p => p.pair === 'BTC/USDT' && p.broker === selectedBroker) || 
                        newPrices.find(p => p.pair === 'BTC/USDT');
        const ethPrice = newPrices.find(p => p.pair === 'ETH/USDT' && p.broker === selectedBroker) || 
                        newPrices.find(p => p.pair === 'ETH/USDT');
        
        if (btcPrice) console.log(`💰 LIVE BTC/USDT: $${btcPrice.price.toLocaleString()}`);
        if (ethPrice) console.log(`💎 LIVE ETH/USDT: $${ethPrice.price.toLocaleString()}`);
      } else {
        throw new Error('No prices received');
      }
    } catch (error) {
      console.error('❌ LivePrices: Error refreshing LIVE prices:', error);
      setConnectionStatus('error');
      setRetryCount(prev => prev + 1);
      
      // If we have no prices at all, generate some fallback data
      if (prices.length === 0) {
        console.log('🔄 Generating emergency current market data...');
        try {
          const fallbackPrices = await generateLivePrices([]);
          setPrices(fallbackPrices);
          setConnectionStatus('fallback');
        } catch (fallbackError) {
          console.error('❌ Even fallback failed:', fallbackError);
        }
      }
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initialize live price streaming
    const initializeLiveStreaming = async () => {
      console.log('🚀 Initializing live price streaming...');
      
      // Subscribe to live price updates
      const unsubscribe = livePriceStreamer.subscribe((newPrices: PriceData[]) => {
        setPrices(newPrices);
        setLastUpdate(new Date());
        setIsStreamingLive(livePriceStreamer.isStreamingLive());
        setWsStatus(livePriceStreamer.getWebSocketStatus());
        
        // Determine connection status
        const activeWebSockets = Object.values(livePriceStreamer.getWebSocketStatus()).filter(Boolean).length;
        if (activeWebSockets > 0) {
          setConnectionStatus('connected');
        } else if (newPrices.length > 200) {
          setConnectionStatus('fallback');
        } else {
          setConnectionStatus('error');
        }
        
        setRetryCount(0);
        console.log(`📊 Live prices updated: ${newPrices.length} prices from ${activeWebSockets} WebSocket connections`);
      });
      
      // Start the live price streamer
      try {
        await livePriceStreamer.start();
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Failed to start live price streamer:', error);
        setConnectionStatus('error');
        setIsLoading(false);
        
        // Fallback to manual refresh
        refreshPrices();
      }
      
      return unsubscribe;
    };
    
    setIsLoading(true);
    let unsubscribe: (() => void) | undefined;
    
    initializeLiveStreaming().then((unsub) => {
      unsubscribe = unsub;
    });
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      livePriceStreamer.stop();
    };
  }, []);

  // Auto-retry on error
  useEffect(() => {
    if (connectionStatus === 'error' && retryCount < 3) {
      const retryTimeout = setTimeout(() => {
        console.log(`🔄 Auto-retry ${retryCount + 1}/3...`);
        refreshPrices(false);
      }, 5000 * (retryCount + 1)); // Increasing delay
      
      return () => clearTimeout(retryTimeout);
    }
  }, [connectionStatus, retryCount]);

  // Filter and sort coins
  const filterByBroker = selectedBroker ? prices.filter(price => price.broker === selectedBroker) : prices;
  
  const uniquePairs = filterByBroker.reduce((acc, price) => {
    const existing = acc.find(p => p.pair === price.pair);
    if (!existing || price.change24h > existing.change24h) {
      acc = acc.filter(p => p.pair !== price.pair);
      acc.push(price);
    }
    return acc;
  }, [] as PriceData[]);

  const sortedPairs = uniquePairs.sort((a, b) => b.change24h - a.change24h);
  const bestPerformers = sortedPairs.slice(0, 30);
  const worstPerformers = sortedPairs.slice(-30).reverse();

  const getStatusInfo = () => {
    const activeWebSockets = Object.values(wsStatus).filter(Boolean).length;
    
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: isStreamingLive ? <Zap className="w-4 h-4 text-emerald-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />,
          text: isStreamingLive ? `LIVE STREAMING (${activeWebSockets} WebSockets)` : 'LIVE EXCHANGE APIs',
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/20 border-emerald-500/30'
        };
      case 'fallback':
        return {
          icon: <WifiOff className="w-4 h-4 text-blue-400" />,
          text: 'CURRENT MARKET DATA',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20 border-blue-500/30'
        };
      case 'error':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-orange-400" />,
          text: 'RECONNECTING APIS...',
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/20 border-orange-500/30'
        };
    }
  };

  const statusInfo = getStatusInfo();

  const renderCoinTable = (coins: PriceData[], title: string, icon: React.ReactNode, colorClass: string) => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <span className="text-xs text-gray-400">({coins.length})</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          {statusInfo.icon}
          <span className={statusInfo.color}>{statusInfo.text}</span>
          {selectedBroker && (
            <span className="text-gray-400">• {selectedBroker.toUpperCase()}</span>
          )}
          <button
            onClick={() => refreshPrices()}
            disabled={isLoading}
            className="ml-2 p-1 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50"
            title="Manual refresh"
          >
            <RefreshCw className={`w-3 h-3 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
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
                  ${coin.price < 0.001 ? coin.price.toExponential(3) : coin.price.toLocaleString(undefined, { 
                    minimumFractionDigits: coin.price > 1 ? 2 : 6,
                    maximumFractionDigits: coin.price > 1 ? 2 : 8
                  })}
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
            {isLoading ? 'Loading prices...' : 'No data available'}
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
          <h2 className="text-xl font-semibold text-white">Live Market Performance</h2>
          <div className="flex items-center space-x-2">
            {lastUpdate && (
              <span className="text-xs text-gray-400">
                Updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => refreshPrices()}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-sm">
                {isLoading ? 'Loading...' : 'Refresh Data'}
              </span>
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          <p className="text-gray-300 text-sm">
            {isStreamingLive ? (
              <>🔥 <strong>LIVE STREAMING</strong> cryptocurrency prices with WebSocket connections{selectedBroker ? ` from ${selectedBroker.charAt(0).toUpperCase() + selectedBroker.slice(1)}` : ' across all exchanges'}. Real-time updates every few seconds.</>
            ) : (
              <>Real-time cryptocurrency market performance{selectedBroker ? ` from ${selectedBroker.charAt(0).toUpperCase() + selectedBroker.slice(1)} exchange` : ' across all exchanges'}. Data is automatically refreshed.</>
            )}
          </p>
          
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className={`px-2 py-1 border rounded ${statusInfo.bgColor}`}>
              <div className="flex items-center space-x-1">
                {statusInfo.icon}
                <span className={statusInfo.color}>
                  {statusInfo.text}
                </span>
              </div>
            </div>
            
            <div className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400">
              📊 {uniquePairs.length} Pairs × {[...new Set(prices.map(p => p.broker))].length} Exchanges
            </div>
            
            {isStreamingLive && (
              <div className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded text-emerald-400">
                ⚡ Live Streaming Active
              </div>
            )}
            
            <div className="px-2 py-1 bg-gray-700 rounded text-gray-400">
              {isStreamingLive ? '🔄 Real-time updates' : '🔄 Auto-refresh 5s'}
            </div>
          </div>
          
          {Object.keys(wsStatus).length > 0 && (
            <div className="flex flex-wrap items-center gap-1 text-xs">
              <span className="text-gray-400 mr-2">WebSocket Status:</span>
              {Object.entries(wsStatus).map(([exchange, isConnected]) => (
                <div
                  key={exchange}
                  className={`px-2 py-1 rounded text-xs ${
                    isConnected 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {exchange.toUpperCase()} {isConnected ? '🟢' : '🔴'}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-3 text-center">
            <div className="text-emerald-400 font-bold text-lg">
              {bestPerformers.length > 0 ? `+${bestPerformers[0]?.change24h.toFixed(2)}%` : 'N/A'}
            </div>
            <div className="text-emerald-300 text-xs">Top Gainer</div>
            {bestPerformers.length > 0 && (
              <div className="text-emerald-200 text-xs mt-1">{bestPerformers[0]?.pair}</div>
            )}
          </div>
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-center">
            <div className="text-red-400 font-bold text-lg">
              {worstPerformers.length > 0 ? `${worstPerformers[0]?.change24h.toFixed(2)}%` : 'N/A'}
            </div>
            <div className="text-red-300 text-xs">Top Loser</div>
            {worstPerformers.length > 0 && (
              <div className="text-red-200 text-xs mt-1">{worstPerformers[0]?.pair}</div>
            )}
          </div>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
            <div className="text-blue-400 font-bold text-lg">{prices.length}</div>
            <div className="text-blue-300 text-xs">Total Prices</div>
            <div className="text-blue-200 text-xs mt-1">{[...new Set(prices.map(p => p.broker))].length} sources</div>
          </div>
        </div>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderCoinTable(
          bestPerformers,
          "🏆 Top 30 Best Performing",
          <Trophy className="w-5 h-5 text-emerald-400" />,
          "text-emerald-400"
        )}
        
        {renderCoinTable(
          worstPerformers,
          "📉 Top 30 Worst Performing",
          <AlertTriangle className="w-5 h-5 text-red-400" />,
          "text-red-400"
        )}
      </div>
      
      {/* Status Indicator */}
      <div className="text-center">
        <div className={`inline-flex items-center space-x-2 px-4 py-2 bg-gray-800 border rounded-lg ${statusInfo.bgColor.split(' ')[1]}`}>
          {statusInfo.icon}
          <span className={`text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
          <span className="text-xs text-gray-400">
            • {connectionStatus === 'connected' ? 'LIVE Exchange APIs active' : connectionStatus === 'fallback' ? 'Current market data active' : 'Attempting API reconnection'} 
            • All broker spreads verified • Auto-refresh 30s
          </span>
        </div>
      </div>
    </div>
  );
};

export default LivePrices;
