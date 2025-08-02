import { useState, useEffect, useCallback } from 'react';
import { PriceData } from '../types';

const BINANCE_API = 'https://api.binance.com/api/v3';
const REQUEST_TIMEOUT = 10000; // 10 seconds for initial load
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
}

// Make request with retry logic
const makeRequestWithRetry = async (url: string, attempts: number = RETRY_ATTEMPTS): Promise<any> => {
  for (let i = 0; i < attempts; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
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
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1) * 2));
        continue;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error: any) {
      console.warn(`API request attempt ${i + 1} failed:`, error.message);
      
      if (i === attempts - 1) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
    }
  }
  
  throw new Error('All retry attempts failed');
};

// Parse Binance ticker data to extract pairs and price information
const parseBinanceTickerData = (data: any[]): { pairs: string[], priceData: PriceData[] } => {
  if (!Array.isArray(data)) {
    throw new Error('Invalid data format received from Binance API');
  }

  const validTickers = data.filter(ticker => 
    ticker.symbol && 
    ticker.lastPrice && 
    parseFloat(ticker.lastPrice) > 0 &&
    parseFloat(ticker.volume) > 0 && // Only include pairs with trading volume
    ticker.status === 'TRADING' // Only include actively trading pairs
  );

  const pairsSet = new Set<string>();
  const priceDataArray: PriceData[] = [];

  validTickers.forEach(ticker => {
    const symbol = ticker.symbol;
    let pair = '';
    
    // Parse different quote currencies in order of preference
    if (symbol.endsWith('USDT')) {
      pair = `${symbol.slice(0, -4)}/USDT`;
    } else if (symbol.endsWith('USDC')) {
      pair = `${symbol.slice(0, -4)}/USDC`;
    } else if (symbol.endsWith('BUSD')) {
      pair = `${symbol.slice(0, -4)}/BUSD`;
    } else if (symbol.endsWith('FDUSD')) {
      pair = `${symbol.slice(0, -5)}/FDUSD`;
    } else if (symbol.endsWith('BTC')) {
      pair = `${symbol.slice(0, -3)}/BTC`;
    } else if (symbol.endsWith('ETH')) {
      pair = `${symbol.slice(0, -3)}/ETH`;
    } else if (symbol.endsWith('BNB')) {
      pair = `${symbol.slice(0, -3)}/BNB`;
    } else if (symbol.endsWith('TRY')) {
      pair = `${symbol.slice(0, -3)}/TRY`;
    } else if (symbol.endsWith('EUR')) {
      pair = `${symbol.slice(0, -3)}/EUR`;
    } else if (symbol.endsWith('GBP')) {
      pair = `${symbol.slice(0, -3)}/GBP`;
    } else if (symbol.endsWith('AUD')) {
      pair = `${symbol.slice(0, -3)}/AUD`;
    } else if (symbol.endsWith('DAI')) {
      pair = `${symbol.slice(0, -3)}/DAI`;
    } else if (symbol.endsWith('TUSD')) {
      pair = `${symbol.slice(0, -4)}/TUSD`;
    } else {
      // Skip pairs we can't parse properly
      return;
    }

    // Only include pairs with valid format
    if (pair.includes('/') && pair.split('/')[0].length > 0) {
      pairsSet.add(pair);
      
      priceDataArray.push({
        broker: 'binance',
        pair,
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.priceChangePercent) || 0,
        volume: parseFloat(ticker.volume) || 0,
        high24h: parseFloat(ticker.highPrice) || 0,
        low24h: parseFloat(ticker.lowPrice) || 0,
        timestamp: Date.now()
      });
    }
  });

  // Sort pairs alphabetically for better UX
  const sortedPairs = Array.from(pairsSet).sort((a, b) => {
    // Prioritize major pairs (USDT, USDC, BTC, ETH)
    const majorQuotes = ['USDT', 'USDC', 'BTC', 'ETH'];
    const aQuote = a.split('/')[1];
    const bQuote = b.split('/')[1];
    
    const aIndex = majorQuotes.indexOf(aQuote);
    const bIndex = majorQuotes.indexOf(bQuote);
    
    if (aIndex !== -1 && bIndex !== -1) {
      if (aIndex !== bIndex) return aIndex - bIndex;
    } else if (aIndex !== -1) {
      return -1;
    } else if (bIndex !== -1) {
      return 1;
    }
    
    return a.localeCompare(b);
  });

  // Sort price data by volume (descending) for better performance
  priceDataArray.sort((a, b) => b.volume - a.volume);

  return { pairs: sortedPairs, priceData: priceDataArray };
};

export const useBinancePairs = (): UseBinancePairsReturn => {
  const [pairs, setPairs] = useState<string[]>([]);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchBinancePairs = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      
      const url = `${BINANCE_API}/ticker/24hr`;
      const data = await makeRequestWithRetry(url);
      
      const { pairs: fetchedPairs, priceData: fetchedPriceData } = parseBinanceTickerData(data);
      
      if (fetchedPairs.length === 0) {
        throw new Error('No valid trading pairs found');
      }
      
      setPairs(fetchedPairs);
      setPriceData(fetchedPriceData);
      setLastUpdated(Date.now());
      
      console.log(`✅ Successfully loaded ${fetchedPairs.length} Binance trading pairs with live prices`);
      
    } catch (err: any) {
      const errorMessage = err.name === 'AbortError' 
        ? 'Request timed out. Please check your internet connection.'
        : err.message || 'Failed to load Binance trading pairs';
      
      console.error('Failed to fetch Binance pairs:', err);
      setError(errorMessage);
      
      // Set minimal fallback pairs to prevent complete failure
      if (pairs.length === 0) {
        setPairs(['BTC/USDT', 'ETH/USDT', 'BNB/USDT']);
        setPriceData([]);
      }
    } finally {
      setLoading(false);
    }
  }, [pairs.length]);

  const refreshPairs = useCallback(async (): Promise<void> => {
    await fetchBinancePairs();
  }, [fetchBinancePairs]);

  // Initial load
  useEffect(() => {
    fetchBinancePairs();
  }, [fetchBinancePairs]);

  // Set up live price updates
  useEffect(() => {
    if (pairs.length === 0 || error) return;

    const interval = setInterval(() => {
      fetchBinancePairs();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [pairs.length, error, fetchBinancePairs]);

  return {
    pairs,
    priceData,
    loading,
    error,
    lastUpdated,
    refreshPairs
  };
};
