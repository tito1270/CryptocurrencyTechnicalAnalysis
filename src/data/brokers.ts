import { Broker } from '../types';

// Broker configuration with dynamic pair loading support
export const brokers: Broker[] = [
  {
    id: 'binance',
    name: 'Binance',
    logo: '🟡',
    // NOTE: For Binance, pairs are now loaded dynamically via the useBinancePairs hook
    // This static list serves as a fallback when the API is unavailable
    pairs: [
      'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT',
      'SOL/USDT', 'DOGE/USDT', 'DOT/USDT', 'MATIC/USDT', 'AVAX/USDT',
      'ATOM/USDT', 'LINK/USDT', 'UNI/USDT', 'LTC/USDT', 'BCH/USDT',
      'XLM/USDT', 'ALGO/USDT', 'VET/USDT', 'ICP/USDT', 'FIL/USDT',
      'TRX/USDT', 'ETC/USDT', 'THETA/USDT', 'NEAR/USDT', 'FTM/USDT',
      'HBAR/USDT', 'ONE/USDT', 'SAND/USDT', 'MANA/USDT', 'CRO/USDT',
      'SHIB/USDT', 'PEPE/USDT', 'FLOKI/USDT', 'BONK/USDT', 'WIF/USDT',
      'OP/USDT', 'ARB/USDT', 'SUI/USDT', 'SEI/USDT', 'TIA/USDT'
    ],
    supportsFutures: true,
    futuresPairs: [
      'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT',
      'SOL/USDT', 'DOGE/USDT', 'DOT/USDT', 'MATIC/USDT', 'AVAX/USDT',
      'ATOM/USDT', 'LINK/USDT', 'UNI/USDT', 'LTC/USDT', 'BCH/USDT',
      'XLM/USDT', 'ALGO/USDT', 'VET/USDT', 'ICP/USDT', 'FIL/USDT'
    ]
  }
];

// Helper function to determine if a broker supports dynamic pair loading
export const supportsDynamicPairs = (brokerId: string): boolean => {
  return brokerId === 'binance';
};

// Get fallback pairs for a broker (used when dynamic loading fails)
export const getFallbackPairs = (brokerId: string, tradeType: 'SPOT' | 'FUTURES' = 'SPOT'): string[] => {
  const broker = brokers.find(b => b.id === brokerId);
  if (!broker) return [];
  
  return tradeType === 'FUTURES' ? (broker.futuresPairs || []) : broker.pairs;
};
