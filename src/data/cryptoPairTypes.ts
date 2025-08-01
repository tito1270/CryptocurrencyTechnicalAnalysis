import { CryptoPairType } from '../types';

export const cryptoPairTypes: CryptoPairType[] = [
  {
    id: 'major',
    name: 'Major Cryptocurrencies',
    description: 'Top market cap cryptocurrencies with high liquidity',
    keywords: ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE', 'DOT', 'MATIC', 'AVAX', 'ATOM', 'LINK', 'UNI', 'LTC', 'BCH', 'XLM', 'ALGO', 'VET', 'ICP', 'FIL']
  },
  {
    id: 'defi',
    name: 'DeFi Tokens',
    description: 'Decentralized Finance protocol tokens',
    keywords: ['AAVE', 'UNI', 'SUSHI', 'COMP', 'MKR', 'SNX', 'CRV', 'BAL', 'YFI', 'ALPHA', 'CAKE', 'DODO', 'RUNE', 'GRT', 'LINA', 'TWT', 'SFP', 'AUTO', 'BELT']
  },
  {
    id: 'gaming',
    name: 'Gaming & NFT',
    description: 'Gaming and NFT-related tokens',
    keywords: ['AXS', 'SLP', 'SAND', 'MANA', 'ENJ', 'CHZ', 'GALA', 'ALICE', 'TLM', 'SKILL', 'HERO', 'JEWEL', 'GHST', 'YGG', 'NAKA', 'PYR', 'SUPER', 'TVK']
  },
  {
    id: 'layer2',
    name: 'Layer 2 & Scaling',
    description: 'Layer 2 solutions and scaling tokens',
    keywords: ['MATIC', 'OP', 'ARB', 'METIS', 'BOBA', 'LRC', 'IMX', 'DYDX', 'GMX', 'STRK', 'ZK', 'ZRO', 'MANTA', 'BLAST', 'MANTLE', 'BASE', 'SCROLL']
  },
  {
    id: 'ai',
    name: 'AI & Data',
    description: 'Artificial Intelligence and data-related tokens',
    keywords: ['FET', 'AGIX', 'OCEAN', 'WLD', 'ARKM', 'RNDR', 'LPT', 'TAO', 'AI', 'GRT', 'LINK', 'BAND']
  },
  {
    id: 'meme',
    name: 'Meme Tokens',
    description: 'Community-driven and meme tokens',
    keywords: ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK', 'WIF', 'LUNC', 'USTC']
  },
  {
    id: 'stablecoin',
    name: 'Stablecoins',
    description: 'Stable value cryptocurrencies',
    keywords: ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'FRAX', 'LUSD', 'FDUSD', 'PYUSD']
  },
  {
    id: 'ecosystem',
    name: 'Exchange & Ecosystem Tokens',
    description: 'Exchange and blockchain ecosystem tokens',
    keywords: ['BNB', 'CRO', 'LEO', 'HT', 'OKB', 'KCS', 'GT', 'MX', 'NEXO', 'TWT', 'FTT']
  },
  {
    id: 'newgen',
    name: 'New Generation L1/L2',
    description: 'Newer generation blockchain and scaling solutions',
    keywords: ['SOL', 'SUI', 'SEI', 'APT', 'TIA', 'INJ', 'NEAR', 'FTM', 'ROSE', 'ONE', 'KAVA', 'ATOM']
  },
  {
    id: 'depin',
    name: 'DePIN & Infrastructure',
    description: 'Decentralized Physical Infrastructure tokens',
    keywords: ['FIL', 'AR', 'STORJ', 'THETA', 'RNDR', 'LPT', 'HNT', 'MOBILE', 'IOT']
  }
];

export const categorizeToken = (symbol: string): string[] => {
  const categories: string[] = [];
  const tokenSymbol = symbol.split('/')[0].toUpperCase();
  
  cryptoPairTypes.forEach(type => {
    if (type.keywords.some(keyword => 
      tokenSymbol === keyword || 
      (tokenSymbol.includes(keyword) && keyword.length > 2) ||
      (keyword.includes(tokenSymbol) && tokenSymbol.length > 2)
    )) {
      categories.push(type.id);
    }
  });
  
  // Default category if no specific match
  if (categories.length === 0) {
    categories.push('other');
  }
  
  return categories;
};
