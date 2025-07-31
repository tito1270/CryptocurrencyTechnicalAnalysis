import { CryptoPairType } from '../types';

export const cryptoPairTypes: CryptoPairType[] = [
  {
    id: 'major',
    name: 'Major Cryptocurrencies',
    description: 'Top market cap cryptocurrencies with high liquidity',
    keywords: ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE', 'DOT', 'MATIC', 'AVAX', 'ATOM', 'LINK', 'UNI', 'LTC', 'BCH']
  },
  {
    id: 'defi',
    name: 'DeFi Tokens',
    description: 'Decentralized Finance protocol tokens',
    keywords: ['AAVE', 'UNI', 'SUSHI', 'COMP', 'MKR', 'SNX', 'CRV', 'BAL', 'YFI', 'ALPHA', 'CREAM', 'BADGER', 'CAKE', 'PANCAKE', 'DODO']
  },
  {
    id: 'gaming',
    name: 'Gaming & NFT',
    description: 'Gaming and NFT-related tokens',
    keywords: ['AXS', 'SLP', 'SAND', 'MANA', 'ENJ', 'CHZ', 'GALA', 'ALICE', 'TLM', 'SKILL', 'HERO', 'JEWEL', 'GHST', 'REALM']
  },
  {
    id: 'layer2',
    name: 'Layer 2 & Scaling',
    description: 'Layer 2 solutions and scaling tokens',
    keywords: ['MATIC', 'OP', 'ARB', 'METIS', 'BOBA', 'LRC', 'IMX', 'DYDX', 'GMX', 'STRK', 'ZK', 'ZRO', 'MANTA', 'BLAST']
  },
  {
    id: 'ai',
    name: 'AI & Data',
    description: 'Artificial Intelligence and data tokens',
    keywords: ['FET', 'AGIX', 'OCEAN', 'WLD', 'ARKM', 'RNDR', 'LPT', 'PRIME', 'TAO', 'AI16Z', 'VIRTUAL', 'ZEREBRO', 'GOAT']
  },
  {
    id: 'meme',
    name: 'Meme Tokens',
    description: 'Community-driven and meme tokens',
    keywords: ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK', 'WIF', 'POPCAT', 'MEW', 'PNUT', 'CHILLGUY', 'TURBO', 'NEIRO', 'FARTCOIN']
  },
  {
    id: 'stablecoin',
    name: 'Stablecoins',
    description: 'Stable value cryptocurrencies',
    keywords: ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'FRAX', 'LUSD', 'SUSD', 'GUSD', 'FDUSD', 'PYUSD']
  },
  {
    id: 'ecosystem',
    name: 'Ecosystem Tokens',
    description: 'Blockchain ecosystem and utility tokens',
    keywords: ['BNB', 'CRO', 'FTT', 'LEO', 'HT', 'OKB', 'KCS', 'GT', 'MX', 'TWT', 'NEXO', 'MCO']
  },
  {
    id: 'privacy',
    name: 'Privacy Coins',
    description: 'Privacy-focused cryptocurrencies',
    keywords: ['XMR', 'ZEC', 'DASH', 'SCRT', 'ROSE', 'ORAI', 'NYM', 'TORN', 'BEAM', 'GRIN', 'FIRO']
  },
  {
    id: 'interoperability',
    name: 'Interoperability',
    description: 'Cross-chain and bridge tokens',
    keywords: ['DOT', 'KSM', 'ATOM', 'IBC', 'AXL', 'WORMHOLE', 'W', 'ZRO', 'OMNI', 'CCIP', 'LINK']
  }
];

export const categorizeToken = (symbol: string): string[] => {
  const categories: string[] = [];
  const tokenSymbol = symbol.split('/')[0].toUpperCase();
  
  cryptoPairTypes.forEach(type => {
    if (type.keywords.some(keyword => tokenSymbol.includes(keyword) || keyword.includes(tokenSymbol))) {
      categories.push(type.id);
    }
  });
  
  // Default category if no specific match
  if (categories.length === 0) {
    categories.push('other');
  }
  
  return categories;
};