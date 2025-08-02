import React, { useEffect, useRef, useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, RefreshCw, ExternalLink } from 'lucide-react';

interface TradingViewWidgetProps {
  pair: string;
  height?: number;
  theme?: 'light' | 'dark';
  interval?: string;
  onPriceUpdate?: (price: number, change: number) => void;
}

// Simulated TradingView price data (since direct API is restricted)
const getTradingViewPrice = async (symbol: string) => {
  try {
    // Simulate realistic price movements
    const basePrice = {
      'BTCUSDT': 43000,
      'ETHUSDT': 2600,
      'BNBUSDT': 310,
      'XRPUSDT': 0.62,
      'ADAUSDT': 0.48,
      'SOLUSDT': 95,
      'DOGEUSDT': 0.089,
      'DOTUSDT': 7.2,
      'MATICUSDT': 0.85,
      'AVAXUSDT': 35
    };
    
    const cleanSymbol = symbol.replace('/', '').toUpperCase();
    const base = basePrice[cleanSymbol as keyof typeof basePrice] || 1.0;
    const variation = (Math.random() - 0.5) * 0.04; // ±2% variation
    const price = base * (1 + variation);
    const change24h = (Math.random() - 0.3) * 8; // Bias towards positive changes
    
    return { price, change24h };
  } catch (error) {
    console.error('Error getting TradingView price:', error);
    return { price: 0, change24h: 0 };
  }
};

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  pair,
  height = 400,
  theme = 'dark',
  interval = '1h',
  onPriceUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  // Simulate TradingView widget initialization
  useEffect(() => {
    const loadWidget = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get simulated price data
        const { price, change24h } = await getTradingViewPrice(pair);
        setCurrentPrice(price);
        setPriceChange(change24h);
        setLastUpdate(new Date());
        
        if (onPriceUpdate) {
          onPriceUpdate(price, change24h);
        }
        
        // Simulate TradingView widget creation
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="
              width: 100%;
              height: ${height}px;
              background: linear-gradient(135deg, ${theme === 'dark' ? '#1f2937, #374151' : '#f3f4f6, #e5e7eb'});
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: ${theme === 'dark' ? '#ffffff' : '#000000'};
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              position: relative;
              overflow: hidden;
            ">
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.1;">
                <svg width="100%" height="100%" viewBox="0 0 400 200">
                  ${generateRandomChart()}
                </svg>
              </div>
              <div style="z-index: 1; text-align: center; padding: 20px;">
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 8px;">
                  📊 ${pair} Chart
                </div>
                <div style="font-size: 32px; font-weight: bold; color: ${price >= 0 ? '#10b981' : '#ef4444'}; margin-bottom: 8px;">
                  $${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </div>
                <div style="font-size: 16px; color: ${change24h >= 0 ? '#10b981' : '#ef4444'};">
                  ${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}% (24h)
                </div>
                <div style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
                  🔗 Simulated TradingView Data
                </div>
                <div style="font-size: 10px; color: #6b7280; margin-top: 4px;">
                  Real integration requires TradingView API key
                </div>
              </div>
            </div>
          `;
        }
        
      } catch (err) {
        console.error('Error loading TradingView widget:', err);
        setError('Failed to load chart data');
      } finally {
        setIsLoading(false);
      }
    };

    loadWidget();
  }, [pair, height, theme, interval]);

  // Generate random chart-like SVG
  const generateRandomChart = () => {
    const points = [];
    const numPoints = 50;
    let currentY = 100;
    
    for (let i = 0; i < numPoints; i++) {
      const x = (i / (numPoints - 1)) * 400;
      currentY += (Math.random() - 0.5) * 20;
      currentY = Math.max(20, Math.min(180, currentY));
      points.push(`${x},${currentY}`);
    }
    
    return `
      <path d="M ${points.join(' L ')}" 
            stroke="${priceChange >= 0 ? '#10b981' : '#ef4444'}" 
            stroke-width="2" 
            fill="none" 
            opacity="0.8"/>
      <path d="M ${points.join(' L ')} L 400,200 L 0,200 Z" 
            fill="url(#gradient)" 
            opacity="0.2"/>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${priceChange >= 0 ? '#10b981' : '#ef4444'};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${priceChange >= 0 ? '#10b981' : '#ef4444'};stop-opacity:0" />
        </linearGradient>
      </defs>
    `;
  };

  // Auto-refresh price data
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { price, change24h } = await getTradingViewPrice(pair);
        setCurrentPrice(price);
        setPriceChange(change24h);
        setLastUpdate(new Date());
        
        if (onPriceUpdate) {
          onPriceUpdate(price, change24h);
        }
      } catch (err) {
        console.error('Error updating price:', err);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [pair, onPriceUpdate]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const { price, change24h } = await getTradingViewPrice(pair);
      setCurrentPrice(price);
      setPriceChange(change24h);
      setLastUpdate(new Date());
      
      if (onPriceUpdate) {
        onPriceUpdate(price, change24h);
      }
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  const openInTradingView = () => {
    const symbol = pair.replace('/', '');
    window.open(`https://www.tradingview.com/chart/?symbol=${symbol}`, '_blank');
  };

  if (error) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6" style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-red-400 font-medium mb-2">Chart Error</h3>
            <p className="text-gray-400 text-sm mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-white font-medium">{pair} Chart</h3>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>TradingView Integration</span>
              <span>•</span>
              <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Price Display */}
          <div className="text-right mr-4">
            <div className="text-white font-mono font-bold">
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </div>
            <div className={`text-sm font-medium flex items-center ${
              priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {priceChange >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors disabled:opacity-50"
            title="Refresh chart"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={openInTradingView}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            title="Open in TradingView"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-800/80 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
              <span className="text-gray-400 text-sm">Loading chart...</span>
            </div>
          </div>
        )}
        <div ref={containerRef} style={{ height }} />
      </div>
    </div>
  );
};

export default TradingViewWidget;