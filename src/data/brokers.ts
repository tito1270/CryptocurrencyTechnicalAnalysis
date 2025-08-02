import { Broker } from '../types';

// Simple broker configuration without conflicts
export const brokers: Broker[] = [
  {
    id: 'binance',
    name: 'Binance',
    logo: '🟡',
    pairs: [
      'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT',
      'SOL/USDT', 'DOGE/USDT', 'DOT/USDT', 'MATIC/USDT', 'AVAX/USDT',
      'ATOM/USDT', 'LINK/USDT', 'UNI/USDT', 'LTC/USDT', 'BCH/USDT',
      'XLM/USDT', 'ALGO/USDT', 'VET/USDT', 'ICP/USDT', 'FIL/USDT',
      'TRX/USDT', 'ETC/USDT', 'THETA/USDT', 'NEAR/USDT', 'FTM/USDT',
      'HBAR/USDT', 'ONE/USDT', 'SAND/USDT', 'MANA/USDT', 'CRO/USDT',
      'SHIB/USDT', 'PEPE/USDT', 'FLOKI/USDT', 'BONK/USDT', 'WIF/USDT',
      'OP/USDT', 'ARB/USDT', 'SUI/USDT', 'SEI/USDT', 'TIA/USDT',
      'BTC/USDC', 'ETH/USDC', 'BNB/USDC', 'XRP/USDC', 'ADA/USDC',
      'BTC/BTC', 'ETH/BTC', 'BNB/BTC', 'XRP/BTC', 'ADA/BTC'
    ],
    supportsFutures: true,
    futuresPairs: [
      'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT',
      'SOL/USDT', 'DOGE/USDT', 'DOT/USDT', 'MATIC/USDT', 'AVAX/USDT'
    ]
  }
];