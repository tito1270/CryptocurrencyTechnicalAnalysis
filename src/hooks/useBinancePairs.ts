import { useState, useEffect, useCallback } from 'react';
import { PriceData } from '../types';

const BINANCE_API = 'https://api.binance.com/api/v3';
const REQUEST_TIMEOUT = 15000; // 15 seconds for comprehensive load
const REFRESH_INTERVAL = 30000; // 30 seconds for live updates
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds between retries

interface UseBinancePairsReturn {
  pairs: string[];
  priceData: PriceData[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refreshPairs: () => Promise<void>;
  totalPairs: number;
  activePairs: number;
}

// Make request with retry logic and better error handling
const makeRequestWithRetry = async (url: string, attempts: number = RETRY_ATTEMPTS): Promise<any> => {
  for (let i = 0; i < attempts; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'User-Agent': 'Mozilla/5.0 (compatible; CryptoAnalyzer/1.0)'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      
      if (response.status === 429) {
        // Rate limited, wait longer before retry
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1) * 3));
        continue;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error: any) {
      console.warn(`API request attempt ${i + 1} failed:`, error.message);
      
      if (i === attempts - 1) {
        throw error;
      }
      
      // Progressive backoff
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, i)));
    }
  }
  
  throw new Error('All retry attempts failed');
};

// Enhanced parser for comprehensive Binance data
const parseBinanceTickerData = (data: any[]): { pairs: string[], priceData: PriceData[] } => {
  if (!Array.isArray(data)) {
    throw new Error('Invalid data format received from Binance API');
  }

  console.log(`Processing ${data.length} raw trading pairs from Binance...`);

  const validTickers = data.filter(ticker => 
    ticker.symbol && 
    ticker.lastPrice && 
    parseFloat(ticker.lastPrice) > 0 &&
    ticker.status === 'TRADING' && // Only include actively trading pairs
    ticker.count > 0 // At least some trading activity
  );

  const pairsSet = new Set<string>();
  const priceDataArray: PriceData[] = [];

  // Extended list of supported quote currencies
  const quoteCurrencies = [
    { suffix: 'USDT', length: 4, priority: 1 },
    { suffix: 'USDC', length: 4, priority: 2 },
    { suffix: 'BUSD', length: 4, priority: 3 },
    { suffix: 'FDUSD', length: 5, priority: 4 },
    { suffix: 'TUSD', length: 4, priority: 5 },
    { suffix: 'BTC', length: 3, priority: 6 },
    { suffix: 'ETH', length: 3, priority: 7 },
    { suffix: 'BNB', length: 3, priority: 8 },
    { suffix: 'SOL', length: 3, priority: 9 },
    { suffix: 'DOT', length: 3, priority: 10 },
    { suffix: 'ADA', length: 3, priority: 11 },
    { suffix: 'XRP', length: 3, priority: 12 },
    { suffix: 'DOGE', length: 4, priority: 13 },
    { suffix: 'MATIC', length: 5, priority: 14 },
    { suffix: 'AVAX', length: 4, priority: 15 },
    { suffix: 'TRY', length: 3, priority: 16 },
    { suffix: 'EUR', length: 3, priority: 17 },
    { suffix: 'GBP', length: 3, priority: 18 },
    { suffix: 'AUD', length: 3, priority: 19 },
    { suffix: 'BRL', length: 3, priority: 20 },
    { suffix: 'UAH', length: 3, priority: 21 },
    { suffix: 'RUB', length: 3, priority: 22 },
    { suffix: 'DAI', length: 3, priority: 23 },
    { suffix: 'VAI', length: 3, priority: 24 },
    { suffix: 'BKRW', length: 4, priority: 25 },
    { suffix: 'IDRT', length: 4, priority: 26 },
    { suffix: 'NGN', length: 3, priority: 27 },
    { suffix: 'BIDR', length: 4, priority: 28 },
    { suffix: 'AEUR', length: 4, priority: 29 },
    { suffix: 'GYEN', length: 4, priority: 30 }
  ];

  validTickers.forEach(ticker => {
    const symbol = ticker.symbol;
    let pair = '';
    let quoteCurrency = '';
    
    // Find matching quote currency
    for (const quote of quoteCurrencies) {
      if (symbol.endsWith(quote.suffix)) {
        const baseCurrency = symbol.slice(0, -quote.length);
        if (baseCurrency.length >= 2) { // Ensure valid base currency
          pair = `${baseCurrency}/${quote.suffix}`;
          quoteCurrency = quote.suffix;
          break;
        }
      }
    }

    // Only include pairs with valid format and recognizable quote currency
    if (pair.includes('/') && pair.split('/')[0].length >= 2) {
      pairsSet.add(pair);
      
      const volume24h = parseFloat(ticker.volume) || 0;
      const quoteVolume24h = parseFloat(ticker.quoteVolume) || 0;
      
      priceDataArray.push({
        broker: 'binance',
        pair,
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.priceChangePercent) || 0,
        volume: volume24h,
        high24h: parseFloat(ticker.highPrice) || 0,
        low24h: parseFloat(ticker.lowPrice) || 0,
        timestamp: Date.now(),
        // Additional useful data
        quoteVolume: quoteVolume24h,
        openPrice: parseFloat(ticker.openPrice) || 0,
        prevClosePrice: parseFloat(ticker.prevClosePrice) || 0,
        weightedAvgPrice: parseFloat(ticker.weightedAvgPrice) || 0,
        priceChange: parseFloat(ticker.priceChange) || 0,
        count: parseInt(ticker.count) || 0 // Number of trades
      });
    }
  });

  // Advanced sorting: prioritize by quote currency preference and volume
  const sortedPairs = Array.from(pairsSet).sort((a, b) => {
    const aQuote = a.split('/')[1];
    const bQuote = b.split('/')[1];
    
    // Find priority for each quote currency
    const aQuoteData = quoteCurrencies.find(q => q.suffix === aQuote);
    const bQuoteData = quoteCurrencies.find(q => q.suffix === bQuote);
    
    const aPriority = aQuoteData?.priority || 999;
    const bPriority = bQuoteData?.priority || 999;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // If same quote currency, sort by base currency alphabetically
    return a.localeCompare(b);
  });

  // Sort price data by quote volume (descending) for better performance insights
  priceDataArray.sort((a, b) => {
    const aVolume = (a as any).quoteVolume || a.volume;
    const bVolume = (b as any).quoteVolume || b.volume;
    return bVolume - aVolume;
  });

  console.log(`✅ Processed ${sortedPairs.length} valid trading pairs`);
  console.log(`Top quote currencies: ${Array.from(new Set(sortedPairs.map(p => p.split('/')[1]))).slice(0, 10).join(', ')}`);

  return { pairs: sortedPairs, priceData: priceDataArray };
};

export const useBinancePairs = (): UseBinancePairsReturn => {
  const [pairs, setPairs] = useState<string[]>([]);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [totalPairs, setTotalPairs] = useState<number>(0);
  const [activePairs, setActivePairs] = useState<number>(0);

  const fetchBinancePairs = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      
      console.log('🔄 Fetching comprehensive Binance trading pairs...');
      const url = `${BINANCE_API}/ticker/24hr`;
      const data = await makeRequestWithRetry(url);
      
      const { pairs: fetchedPairs, priceData: fetchedPriceData } = parseBinanceTickerData(data);
      
      if (fetchedPairs.length === 0) {
        throw new Error('No valid trading pairs found');
      }
      
      setPairs(fetchedPairs);
      setPriceData(fetchedPriceData);
      setTotalPairs(data.length);
      setActivePairs(fetchedPairs.length);
      setLastUpdated(Date.now());
      
      console.log(`✅ Successfully loaded ${fetchedPairs.length} Binance trading pairs with live prices`);
      console.log(`📊 Total symbols processed: ${data.length}, Active pairs: ${fetchedPairs.length}`);
      
    } catch (err: any) {
      const errorMessage = err.name === 'AbortError' 
        ? 'Request timed out. Please check your internet connection.'
        : err.message || 'Failed to load Binance trading pairs';
      
      console.error('Failed to fetch Binance pairs:', err);
      setError(errorMessage);
      
      // Set enhanced fallback pairs to prevent complete failure
      if (pairs.length === 0) {
        const fallbackPairs = [
          'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT',
          'SOL/USDT', 'DOGE/USDT', 'DOT/USDT', 'MATIC/USDT', 'AVAX/USDT',
          'ATOM/USDT', 'LINK/USDT', 'UNI/USDT', 'LTC/USDT', 'BCH/USDT',
          'NEAR/USDT', 'ALGO/USDT', 'VET/USDT', 'ICP/USDT', 'FIL/USDT'
        ];
        setPairs(fallbackPairs);
        setPriceData([]);
        setActivePairs(fallbackPairs.length);
      }
    } finally {
      setLoading(false);
    }
  }, [pairs.length]);

  const refreshPairs = useCallback(async (): Promise<void> => {
    setLoading(true);
    await fetchBinancePairs();
  }, [fetchBinancePairs]);

  // Initial load
  useEffect(() => {
    fetchBinancePairs();
  }, [fetchBinancePairs]);

  // Set up live price updates with error recovery
  useEffect(() => {
    if (pairs.length === 0 && !error) return;

    const interval = setInterval(() => {
      // Only refresh if we're not in an error state or if enough time has passed
      if (!error || (lastUpdated && Date.now() - lastUpdated > 300000)) { // 5 minutes for error recovery
        fetchBinancePairs();
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [pairs.length, error, lastUpdated, fetchBinancePairs]);

  return {
    pairs,
    priceData,
    loading,
    error,
    lastUpdated,
    refreshPairs,
    totalPairs,
    activePairs
  };
};
