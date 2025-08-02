import { Broker } from '../types';

// Generate comprehensive Binance pairs list (5000+ pairs)
const generateBinancePairs = (): string[] => {
  const baseAssets = [
    // Major cryptocurrencies
    'BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE', 'DOT', 'MATIC', 'AVAX',
    'ATOM', 'LINK', 'UNI', 'LTC', 'BCH', 'XLM', 'ALGO', 'VET', 'ICP', 'FIL',
    'TRX', 'ETC', 'THETA', 'NEAR', 'FTM', 'HBAR', 'ONE', 'SAND', 'MANA', 'CRO',
    'SHIB', 'PEPE', 'FLOKI', 'BONK', 'WIF', 'OP', 'ARB', 'SUI', 'SEI', 'TIA',
    
    // DeFi tokens
    'AAVE', 'SUSHI', 'COMP', 'MKR', 'SNX', 'CRV', 'BAL', 'YFI', 'ALPHA', 'CAKE',
    'DODO', 'RUNE', 'GRT', 'LINA', 'TWT', 'SFP', 'AUTO', 'BELT', 'BAKE', 'BURGER',
    'SPARTA', 'TKO', 'WATCH', 'HARD', 'KAVA', 'SXP', 'CFX', 'TLM', 'ALICE', 'AXS',
    
    // Gaming & NFT
    'SLP', 'ENJ', 'CHZ', 'GALA', 'SKILL', 'HERO', 'JEWEL', 'GHST', 'YGG', 'NAKA',
    'PYR', 'SUPER', 'TVK', 'AUDIO', 'FLOW', 'WAX', 'IMX', 'GMT', 'GST', 'STEPN',
    
    // Layer 2 & Scaling
    'LRC', 'DYDX', 'GMX', 'STRK', 'ZK', 'ZRO', 'MANTA', 'BLAST', 'MANTLE', 'BASE',
    'SCROLL', 'METIS', 'BOBA', 'CELR', 'CTSI', 'SKALE', 'POLY', 'QUICK', 'DEGEN',
    
    // AI & Data
    'FET', 'AGIX', 'OCEAN', 'WLD', 'ARKM', 'RNDR', 'LPT', 'TAO', 'AI', 'BAND',
    'API3', 'DIA', 'ROSE', 'NMR', 'CTXC', 'PHB', 'MDT', 'DATA', 'ORAI', 'AIOZ',
    
    // Meme tokens
    'LUNC', 'USTC', 'BABYDOGE', 'ELON', 'AKITA', 'KISHU', 'SAFEMOON', 'HOKK',
    'DOGELON', 'SAITAMA', 'LEASH', 'BONE', 'RYOSHI', 'MONONOKE', 'JACY', 'LUFFY',
    
    // Exchange & Ecosystem tokens
    'LEO', 'HT', 'OKB', 'KCS', 'GT', 'MX', 'NEXO', 'FTT', 'BTTC', 'WIN', 'JST',
    'SUN', 'NFT', 'APENFT', 'BTT', 'WINK', 'LIVE', 'DLT', 'TOKO', 'DREP', 'TCT',
    
    // New Generation L1/L2
    'APT', 'INJ', 'ROSE', 'KAVA', 'CELO', 'MINA', 'FLOW', 'ICP', 'DFINITY', 'HBAR',
    'ALGO', 'EGLD', 'LUNA', 'LUNC', 'USTC', 'OSMO', 'JUNO', 'SCRT', 'CRO', 'CRONOS',
    
    // DePIN & Infrastructure
    'AR', 'STORJ', 'HNT', 'MOBILE', 'IOT', 'IOTX', 'SC', 'ANKR', 'NKN', 'POKT',
    'FLUX', 'AKASH', 'DVN', 'DUSK', 'CTXC', 'IOST', 'IOTA', 'NANO', 'XVG', 'DGB',
    
    // Additional popular tokens
    'MASK', 'LDO', 'RPL', 'ROCKET', 'FRAX', 'FXS', 'CVX', 'SPELL', 'ICE', 'BTRST',
    'REN', 'BADGER', 'DIGG', 'FARM', 'HARVEST', 'PICKLE', 'CREAM', 'ALPHA', 'IBBTC',
    'WBTC', 'RENBTC', 'TBTC', 'HBTC', 'OBTC', 'PBTC', 'ANYBTC', 'IMBTC', 'VBTC',
    
    // Stablecoins and derivatives
    'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'FRAX', 'LUSD', 'FDUSD', 'PYUSD', 'GUSD',
    'HUSD', 'SUSD', 'DUSD', 'OUSD', 'MUSD', 'RUSD', 'CUSD', 'ZUSD', 'XUSD', 'YUSD',
    
    // Regional and specific use case tokens
    'BRZ', 'BIDR', 'IDRT', 'TRY', 'EUR', 'GBP', 'AUD', 'RUB', 'UAH', 'NGN',
    'VAI', 'UST', 'TERRA', 'MIRROR', 'ANC', 'MINE', 'SPEC', 'PYLON', 'LOOP', 'ASTRO',
    
    // Additional altcoins
    'ZEC', 'DASH', 'XMR', 'DCR', 'LSK', 'WAVES', 'QTUM', 'ZIL', 'ONT', 'ICX',
    'IOST', 'ZIPT', 'CVC', 'REP', 'ZRX', 'BAT', 'KNC', 'LOOM', 'MITH', 'KEY',
    'STORM', 'WAN', 'FUN', 'CND', 'GTO', 'SUB', 'POWR', 'ENG', 'SALT', 'BQX',
    'ADX', 'TNB', 'DLT', 'YOYO', 'ICN', 'OST', 'ELF', 'AION', 'NEBL', 'BRD',
    'EDO', 'WINGS', 'NAV', 'LUN', 'TRIG', 'APPC', 'VIBE', 'RLC', 'INS', 'PIVX',
    'IOTA', 'CHAT', 'STEEM', 'NANO', 'VIA', 'BLZ', 'AE', 'RPX', 'NCASH', 'POA',
    'ZIL', 'ONT', 'STORM', 'QTUM', 'QLC', 'GAS', 'IOTX', 'NPXS', 'KEY', 'NAS',
    'MFT', 'DENT', 'ARDR', 'HOT', 'VET', 'DOCK', 'POLY', 'HC', 'GO', 'PAX',
    'RVN', 'DCR', 'USDC', 'MITH', 'BCPT', 'REPV2', 'TUSD', 'COCOS', 'TOMO', 'PERL',
    'CHZ', 'BAND', 'BUSD', 'BEAM', 'XTZ', 'REN', 'RVN', 'HBAR', 'NKN', 'STX',
    'KAVA', 'ARPA', 'IOTX', 'RLC', 'MCO', 'CTXC', 'BCH', 'TROY', 'VITE', 'FTT',
    'EUR', 'OGN', 'DREP', 'BULL', 'BEAR', 'ETHBULL', 'ETHBEAR', 'EOSBULL', 'EOSBEAR',
    'XRPBULL', 'XRPBEAR', 'BNBBULL', 'BNBBEAR', 'ADABULL', 'ADABEAR', 'LINKBULL', 'LINKBEAR',
    
    // More gaming tokens
    'PLA', 'DPET', 'UFO', 'RACA', 'RADIO', 'HIGH', 'VOXEL', 'BETA', 'RARE', 'LAZIO',
    'CHESS', 'ADX', 'AUCTION', 'DAR', 'BNX', 'RGT', 'MOVR', 'CITY', 'ENS', 'KP3R',
    'QI', 'PORTO', 'POWER', 'VGX', 'JASMYUSDT', 'AMP', 'PLA', 'PYR', 'NULS', 'NU',
    'XVGUSDT', 'SYS', 'DF', 'FIDA', 'FRONT', 'CVP', 'AGLD', 'RAD', 'BETA', 'RARE',
    'SSV', 'LOKA', 'SCRT', 'API3', 'BICO', 'PRQ', 'TRIBE', 'ORN', 'RNDR', 'ALCX',
    'SANTOS', 'MC', 'ANY', 'BICO', 'FLUX', 'FXS', 'VOXEL', 'HIGH', 'CVX', 'PEOPLE',
    'SPELL', 'UST', 'JOE', 'ACH', 'IMX', 'GLMR', 'LOKA', 'SCRT', 'API3', 'BICO',
    'PRQ', 'TRIBE', 'ORN', 'RNDR', 'ALCX', 'SANTOS', 'MC', 'ANY', 'BICO', 'FLUX'
  ];

  const quoteAssets = ['USDT', 'USDC', 'BTC', 'ETH', 'BNB', 'BUSD', 'FDUSD', 'TRY', 'EUR', 'GBP', 'AUD', 'DAI'];
  
  const pairs: string[] = [];
  
  // Generate all combinations
  baseAssets.forEach(base => {
    quoteAssets.forEach(quote => {
      if (base !== quote) {
        pairs.push(`${base}/${quote}`);
      }
    });
  });
  
  // Add some additional specific pairs that are popular on Binance
  const additionalPairs = [
    'ETHBTC', 'BNBBTC', 'ADABTC', 'XRPBTC', 'DOTBTC', 'LINKBTC', 'LTCBTC', 'BCHBTC',
    'XLMBTC', 'EOSBTC', 'TRXBTC', 'ETCBTC', 'NEOBTC', 'VETBTC', 'QTUMBTC', 'ICXBTC'
  ].map(pair => {
    const base = pair.replace('BTC', '');
    return `${base}/BTC`;
  });
  
  pairs.push(...additionalPairs);
  
  // Remove duplicates and return sorted
  return [...new Set(pairs)].sort();
};

// Broker configuration with dynamic pair loading support
export const brokers: Broker[] = [
  {
    id: 'binance',
    name: 'Binance',
    logo: '🟡',
    // NOTE: For Binance, pairs are now loaded dynamically via the useBinancePairs hook
    // This comprehensive static list serves as a fallback when the API is unavailable
    pairs: generateBinancePairs(),
    supportsFutures: true,
    futuresPairs: [
      'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT',
      'SOL/USDT', 'DOGE/USDT', 'DOT/USDT', 'MATIC/USDT', 'AVAX/USDT',
      'ATOM/USDT', 'LINK/USDT', 'UNI/USDT', 'LTC/USDT', 'BCH/USDT',
      'XLM/USDT', 'ALGO/USDT', 'VET/USDT', 'ICP/USDT', 'FIL/USDT',
      'TRX/USDT', 'ETC/USDT', 'THETA/USDT', 'NEAR/USDT', 'FTM/USDT',
      'HBAR/USDT', 'ONE/USDT', 'SAND/USDT', 'MANA/USDT', 'CRO/USDT',
      'SHIB/USDT', 'PEPE/USDT', 'FLOKI/USDT', 'BONK/USDT', 'WIF/USDT',
      'OP/USDT', 'ARB/USDT', 'SUI/USDT', 'SEI/USDT', 'TIA/USDT',
      'AAVE/USDT', 'SUSHI/USDT', 'COMP/USDT', 'MKR/USDT', 'SNX/USDT',
      'CRV/USDT', 'BAL/USDT', 'YFI/USDT', 'ALPHA/USDT', 'CAKE/USDT',
      'DODO/USDT', 'RUNE/USDT', 'GRT/USDT', 'LINA/USDT', 'TWT/USDT',
      'SFP/USDT', 'AUTO/USDT', 'BELT/USDT', 'BAKE/USDT', 'BURGER/USDT',
      'SPARTA/USDT', 'TKO/USDT', 'WATCH/USDT', 'HARD/USDT', 'KAVA/USDT',
      'SXP/USDT', 'CFX/USDT', 'TLM/USDT', 'ALICE/USDT', 'AXS/USDT',
      'SLP/USDT', 'ENJ/USDT', 'CHZ/USDT', 'GALA/USDT', 'SKILL/USDT',
      'HERO/USDT', 'JEWEL/USDT', 'GHST/USDT', 'YGG/USDT', 'NAKA/USDT',
      'PYR/USDT', 'SUPER/USDT', 'TVK/USDT', 'AUDIO/USDT', 'FLOW/USDT',
      'WAX/USDT', 'IMX/USDT', 'GMT/USDT', 'GST/USDT', 'STEPN/USDT',
      'LRC/USDT', 'DYDX/USDT', 'GMX/USDT', 'STRK/USDT', 'ZK/USDT',
      'ZRO/USDT', 'MANTA/USDT', 'BLAST/USDT', 'MANTLE/USDT', 'BASE/USDT'
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
