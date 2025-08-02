import { Broker } from '../types';

// Define realistic trading pairs based on actual exchange offerings
const generateRealisticPairs = (baseCurrency: string = 'USDT', exchangeType: 'major' | 'altcoin' = 'major'): string[] => {
  // Major cryptocurrencies that are widely available across all exchanges (updated for 2025)
  const majorCryptos = [
    'BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE', 'DOT', 'MATIC', 'AVAX',
    'ATOM', 'LINK', 'UNI', 'LTC', 'BCH', 'XLM', 'ALGO', 'VET', 'ICP', 'FIL',
    'TRX', 'ETC', 'THETA', 'NEAR', 'FTM', 'HBAR', 'ONE', 'SAND', 'MANA', 'CRO',
    'APE', 'LRC', 'ENJ', 'CHZ', 'GALA', 'AXS', 'FLOW', 'XTZ', 'WAVES', 'KAVA',
    'SHIB', 'PEPE', 'WIF', 'BONK', 'FLOKI', 'OP', 'ARB', 'SUI', 'TIA', 'JUP'
  ];

  // Popular altcoins and newer tokens (more selective)
  const popularAltcoins = [
    'SHIB', 'PEPE', 'FLOKI', 'BONK', 'WIF', 'OP', 'ARB', 'SUI', 'SEI', 'TIA',
    'JTO', 'PYTH', 'JUP', 'BLUR', 'IMX', 'APT', 'GMT', 'STX', 'INJ', 'ROSE',
    'JASMY', 'LUNC', 'USTC', 'FET', 'AGIX', 'OCEAN', 'RNDR', 'TAO', 'AI', 'WLD',
    'ARKM', 'LPT', 'GRT', 'COMP', 'MKR', 'AAVE', 'SNX', 'CRV', 'UMA', 'BAL'
  ];

  // DeFi tokens (verified and active)
  const defiTokens = [
    'CAKE', 'SUSHI', 'ALPHA', 'YFI', 'CREAM', 'DODO', 'RUNE', 'KLAY', 'BAKE',
    'TWT', 'SFP', 'LINA', 'FOR', 'AUTO', 'BELT', 'WATCH', 'TKO', 'PUNDIX',
    'DF', 'FIRO', 'CTSI', 'DENT', 'HOT', 'WIN', 'BTT', 'CELR', 'OGN'
  ];

  // Gaming and NFT tokens
  const gamingTokens = [
    'AXS', 'SLP', 'SAND', 'MANA', 'ENJ', 'CHZ', 'GALA', 'ALICE', 'TLM', 'SKILL',
    'HERO', 'JEWEL', 'GHST', 'YGG', 'NAKA', 'PYR', 'SUPER', 'TVK', 'ATA', 'GTC'
  ];

  // Layer 2 and scaling solutions
  const layer2Tokens = [
    'MATIC', 'OP', 'ARB', 'METIS', 'BOBA', 'LRC', 'IMX', 'DYDX', 'GMX', 'STRK',
    'ZK', 'ZRO', 'MANTA', 'BLAST', 'MODE', 'SCROLL', 'BASE', 'MANTLE'
  ];

  // Stablecoins (most important ones)
  const stablecoins = [
    'USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'FRAX', 'LUSD', 'FDUSD', 'PYUSD'
  ];

  // Combine based on exchange type
  let cryptos: string[] = [];
  if (exchangeType === 'major') {
    cryptos = [...majorCryptos, ...popularAltcoins.slice(0, 15), ...defiTokens.slice(0, 10)];
  } else {
    cryptos = [...majorCryptos, ...popularAltcoins, ...defiTokens, ...gamingTokens, ...layer2Tokens];
  }

  const pairs: string[] = [];
  
  // Generate pairs with appropriate quote currencies
  const quoteCurrencies = baseCurrency === 'USDT' ? ['USDT', 'USDC', 'BTC', 'ETH', 'BNB'] : 
                         baseCurrency === 'USD' ? ['USD', 'USDC', 'USDT', 'BTC', 'ETH'] : 
                         ['USDT', 'BTC', 'ETH', 'USDC'];
  
  quoteCurrencies.forEach(quote => {
    cryptos.forEach(crypto => {
      if (crypto !== quote) {
        pairs.push(`${crypto}/${quote}`);
      }
    });
  });
  
  // Add major cross-crypto pairs (only for major cryptos)
  const majorQuotes = ['BTC', 'ETH', 'BNB'];
  majorQuotes.forEach(quote => {
    majorCryptos.slice(0, 20).forEach(crypto => {
      if (crypto !== quote) {
        pairs.push(`${crypto}/${quote}`);
      }
    });
  });
  
  // Sort and return realistic number of pairs (200-500 instead of 12,000)
  return [...new Set(pairs)].sort();
};

// Define futures-specific pairs (typically major cryptocurrencies)
const generateFuturesPairs = (): string[] => {
  const futureCryptos = [
    'BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE', 'DOT', 'MATIC', 'AVAX',
    'ATOM', 'LINK', 'UNI', 'LTC', 'BCH', 'XLM', 'ALGO', 'VET', 'ICP', 'FIL',
    'TRX', 'ETC', 'NEAR', 'FTM', 'SAND', 'MANA', 'OP', 'ARB', 'SUI'
  ];
  
  const futuresPairs: string[] = [];
  const quoteCurrencies = ['USDT', 'USD', 'BTC'];
  
  quoteCurrencies.forEach(quote => {
    futureCryptos.forEach(crypto => {
      if (crypto !== quote) {
        futuresPairs.push(`${crypto}/${quote}`);
      }
    });
  });
  
  return [...new Set(futuresPairs)].sort();
};

export const brokers: Broker[] = [
  {
    id: 'binance',
    name: 'Binance',
    logo: '🟡',
    pairs: generateRealisticPairs('USDT', 'altcoin'), // Full altcoin selection
    supportsFutures: true,
    futuresPairs: generateFuturesPairs()
  }
];
