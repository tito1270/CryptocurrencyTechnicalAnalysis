import { NewsItem } from '../types';

export const cryptoNews: NewsItem[] = [
  {
    id: '1',
    title: 'Bitcoin ETF Sees Record $2.1B Inflows This Week',
    summary: 'Institutional investors pour record amounts into Bitcoin ETFs as regulatory clarity improves. BlackRock and Fidelity lead with massive inflows, signaling strong institutional confidence.',
    sentiment: 'POSITIVE',
    impact: 'HIGH',
    source: 'Bloomberg',
    timestamp: Date.now() - 3600000, // 1 hour ago
    relevantPairs: ['BTC/USDT', 'BTC/USD', 'BTC/BUSD', 'BTC/ETH']
  },
  {
    id: '2',
    title: 'Ethereum Shanghai Upgrade Reduces Gas Fees by 40%',
    summary: 'Latest Ethereum network upgrade successfully implements EIP-4844, dramatically reducing Layer 2 transaction costs. DeFi protocols report 40% lower gas fees.',
    sentiment: 'POSITIVE',
    impact: 'HIGH',
    source: 'Ethereum Foundation',
    timestamp: Date.now() - 7200000, // 2 hours ago
    relevantPairs: ['ETH/USDT', 'ETH/USD', 'ETH/BTC', 'MATIC/USDT', 'ARB/USDT', 'OP/USDT']
  },
  {
    id: '3',
    title: 'SEC Approves Solana ETF Application for Review',
    summary: 'Securities and Exchange Commission accepts Solana ETF application from VanEck for formal review process. Decision expected within 240 days, boosting SOL ecosystem confidence.',
    sentiment: 'POSITIVE',
    impact: 'HIGH',
    source: 'SEC Filing',
    timestamp: Date.now() - 10800000, // 3 hours ago
    relevantPairs: ['SOL/USDT', 'SOL/USD', 'SOL/BTC', 'RAY/USDT', 'JTO/USDT', 'JUP/USDT']
  },
  {
    id: '4',
    title: 'Major DeFi Hack Affects Multiple Protocols',
    summary: 'Cross-chain bridge exploit results in $150M loss across multiple DeFi protocols. Security concerns impact broader DeFi token prices.',
    sentiment: 'NEGATIVE',
    impact: 'HIGH',
    source: 'CertiK',
    timestamp: Date.now() - 14400000, // 4 hours ago
    relevantPairs: ['UNI/USDT', 'AAVE/USDT', 'COMP/USDT', 'SUSHI/USDT', 'CRV/USDT', 'MKR/USDT']
  },
  {
    id: '5',
    title: 'Binance Announces New Launchpad Project',
    summary: 'Binance Launchpad reveals upcoming token sale for AI-powered trading protocol. BNB holders get exclusive access to participate in the sale.',
    sentiment: 'POSITIVE',
    impact: 'MEDIUM',
    source: 'Binance',
    timestamp: Date.now() - 18000000, // 5 hours ago
    relevantPairs: ['BNB/USDT', 'BNB/USD', 'BNB/BTC']
  },
  {
    id: '6',
    title: 'Federal Reserve Hints at Rate Cuts Next Quarter',
    summary: 'Fed Chairman signals potential interest rate reductions in Q2 2024, historically bullish for risk assets including cryptocurrencies.',
    sentiment: 'POSITIVE',
    impact: 'HIGH',
    source: 'Federal Reserve',
    timestamp: Date.now() - 21600000, // 6 hours ago
    relevantPairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'ADA/USDT', 'MATIC/USDT']
  },
  {
    id: '7',
    title: 'Cardano Smart Contract Activity Surges 300%',
    summary: 'Cardano network sees unprecedented smart contract deployment growth. New DeFi protocols and NFT marketplaces drive ADA ecosystem expansion.',
    sentiment: 'POSITIVE',
    impact: 'MEDIUM',
    source: 'Cardano Foundation',
    timestamp: Date.now() - 25200000, // 7 hours ago
    relevantPairs: ['ADA/USDT', 'ADA/USD', 'ADA/BTC']
  },
  {
    id: '8',
    title: 'Ripple Wins Major Legal Victory Against SEC',
    summary: 'Court rules in favor of Ripple in landmark case, clarifying XRP regulatory status. Decision sets positive precedent for crypto industry.',
    sentiment: 'POSITIVE',
    impact: 'HIGH',
    source: 'Reuters',
    timestamp: Date.now() - 28800000, // 8 hours ago
    relevantPairs: ['XRP/USDT', 'XRP/USD', 'XRP/BTC']
  },
  {
    id: '9',
    title: 'Polygon Announces zkEVM Mainnet Launch',
    summary: 'Polygon zkEVM goes live on mainnet, offering Ethereum-compatible zero-knowledge scaling. Major DApps announce migration plans.',
    sentiment: 'POSITIVE',
    impact: 'HIGH',
    source: 'Polygon Labs',
    timestamp: Date.now() - 32400000, // 9 hours ago
    relevantPairs: ['MATIC/USDT', 'MATIC/USD', 'MATIC/BTC']
  },
  {
    id: '10',
    title: 'Dogecoin Integration with X (Twitter) Payments',
    summary: 'Elon Musk confirms Dogecoin will be integrated into X platform payment system. DOGE to be used for premium subscriptions and creator payments.',
    sentiment: 'POSITIVE',
    impact: 'HIGH',
    source: 'X (Twitter)',
    timestamp: Date.now() - 36000000, // 10 hours ago
    relevantPairs: ['DOGE/USDT', 'DOGE/USD', 'DOGE/BTC']
  },
  {
    id: '11',
    title: 'Avalanche Subnet Activity Reaches All-Time High',
    summary: 'Avalanche network processes record transactions as gaming and DeFi subnets gain traction. AVAX staking rewards increase due to higher activity.',
    sentiment: 'POSITIVE',
    impact: 'MEDIUM',
    source: 'Avalanche Foundation',
    timestamp: Date.now() - 39600000, // 11 hours ago
    relevantPairs: ['AVAX/USDT', 'AVAX/USD', 'AVAX/BTC']
  },
  {
    id: '12',
    title: 'Chainlink Announces Cross-Chain Protocol Upgrade',
    summary: 'Chainlink releases CCIP (Cross-Chain Interoperability Protocol) enabling secure cross-chain smart contract communication across 12 blockchains.',
    sentiment: 'POSITIVE',
    impact: 'MEDIUM',
    source: 'Chainlink Labs',
    timestamp: Date.now() - 43200000, // 12 hours ago
    relevantPairs: ['LINK/USDT', 'LINK/USD', 'LINK/BTC']
  }
];