import { NewsItem } from '../types';

export const cryptoNews: NewsItem[] = [
  {
    id: '1',
    title: 'Bitcoin ETF Sees Record $2.1B Inflows This Week as Institutional Adoption Accelerates',
    summary: 'Institutional investors pour record amounts into Bitcoin ETFs as regulatory clarity improves. BlackRock and Fidelity lead with massive inflows, signaling strong institutional confidence in cryptocurrency markets.',
    sentiment: 'POSITIVE',
    impact: 'HIGH',
    source: 'Bloomberg',
    url: 'https://www.bloomberg.com/news/articles/2024/01/15/bitcoin-etf-inflows-reach-record-highs',
    publishedAt: '2024-01-15T14:30:00Z',
    timestamp: Date.now() - 3600000, // 1 hour ago
    relevantPairs: ['BTC/USDT', 'BTC/USD', 'BTC/BUSD', 'BTC/ETH']
  },
  {
    id: '2',
    title: 'Ethereum Shanghai Upgrade Successfully Reduces Gas Fees by 40% Across Network',
    summary: 'Latest Ethereum network upgrade successfully implements EIP-4844, dramatically reducing Layer 2 transaction costs. DeFi protocols report 40% lower gas fees, improving user experience across the ecosystem.',
    sentiment: 'POSITIVE',
    impact: 'HIGH',
    source: 'Ethereum Foundation',
    url: 'https://ethereum.org/en/roadmap/dencun/',
    publishedAt: '2024-01-15T12:15:00Z',
    timestamp: Date.now() - 7200000, // 2 hours ago
    relevantPairs: ['ETH/USDT', 'ETH/USD', 'ETH/BTC', 'MATIC/USDT', 'ARB/USDT', 'OP/USDT']
  },
  {
    id: '3',
    title: 'SEC Formally Accepts Solana ETF Application from VanEck for Review Process',
    summary: 'Securities and Exchange Commission accepts Solana ETF application from VanEck for formal review process. Decision expected within 240 days, boosting SOL ecosystem confidence and institutional interest.',
    sentiment: 'POSITIVE',
    impact: 'HIGH',
    source: 'CoinDesk',
    url: 'https://www.coindesk.com/policy/2024/01/15/vaneck-files-solana-etf-application-with-sec',
    publishedAt: '2024-01-15T10:45:00Z',
    timestamp: Date.now() - 10800000, // 3 hours ago
    relevantPairs: ['SOL/USDT', 'SOL/USD', 'SOL/BTC', 'RAY/USDT', 'JTO/USDT', 'JUP/USDT']
  },
  {
    id: '4',
    title: 'Cross-Chain Bridge Exploit Results in $150M Loss Across Multiple DeFi Protocols',
    summary: 'Major cross-chain bridge exploit affects multiple DeFi protocols resulting in $150M loss. Security firms CertiK and PeckShield confirm the attack, causing concerns across the broader DeFi ecosystem.',
    sentiment: 'NEGATIVE',
    impact: 'HIGH',
    source: 'CertiK',
    url: 'https://www.certik.com/resources/blog/cross-chain-bridge-security-analysis',
    publishedAt: '2024-01-15T08:20:00Z',
    timestamp: Date.now() - 14400000, // 4 hours ago
    relevantPairs: ['UNI/USDT', 'AAVE/USDT', 'COMP/USDT', 'SUSHI/USDT', 'CRV/USDT', 'MKR/USDT']
  },
  {
    id: '25',
    title: 'Federal Reserve Signals Aggressive Rate Hikes as Inflation Persists, Risk Assets Under Pressure',
    summary: 'Fed Chairman Powell indicates more aggressive monetary tightening ahead as inflation remains elevated. Higher interest rates traditionally reduce appetite for risk assets including cryptocurrencies and tech stocks.',
    sentiment: 'NEGATIVE',
    impact: 'HIGH',
    source: 'Federal Reserve',
    url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20240115a.htm',
    publishedAt: '2024-01-15T16:00:00Z',
    timestamp: Date.now() - 1800000, // 30 minutes ago
    relevantPairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'ADA/USDT', 'AVAX/USDT']
  },
  {
    id: '26',
    title: 'Major Crypto Exchange Faces SEC Enforcement Action Over Unregistered Securities',
    summary: 'Securities and Exchange Commission files enforcement action against major crypto exchange for allegedly offering unregistered securities. Action includes potential fines and operational restrictions.',
    sentiment: 'NEGATIVE',
    impact: 'HIGH',
    source: 'Reuters',
    url: 'https://www.reuters.com/business/finance/sec-files-enforcement-crypto-exchange-2024-01-15',
    publishedAt: '2024-01-15T13:45:00Z',
    timestamp: Date.now() - 5400000, // 1.5 hours ago
    relevantPairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'ADA/USDT', 'DOT/USDT']
  },
  {
    id: '27',
    title: 'Bitcoin Mining Difficulty Reaches All-Time High as Energy Costs Surge Globally',
    summary: 'Bitcoin mining difficulty adjustment reaches record levels while energy costs surge globally. Smaller mining operations report significant pressure on profitability and potential shutdowns.',
    sentiment: 'NEGATIVE',
    impact: 'MEDIUM',
    source: 'CoinTelegraph',
    url: 'https://cointelegraph.com/news/bitcoin-mining-difficulty-energy-costs',
    publishedAt: '2024-01-15T11:30:00Z',
    timestamp: Date.now() - 9000000, // 2.5 hours ago
    relevantPairs: ['BTC/USDT', 'BTC/USD', 'BTC/ETH']
  },
  {
    id: '28',
    title: 'Whale Wallets Show Massive Outflows as Large Holders Reduce Crypto Positions',
    summary: 'On-chain data reveals significant outflows from whale wallets across major cryptocurrencies. Large holders appear to be reducing positions amid regulatory uncertainty and macro headwinds.',
    sentiment: 'NEGATIVE',
    impact: 'HIGH',
    source: 'Whale Alert',
    url: 'https://whale-alert.io/analysis/massive-outflows-2024-01-15',
    publishedAt: '2024-01-15T09:15:00Z',
    timestamp: Date.now() - 12600000, // 3.5 hours ago
    relevantPairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'ADA/USDT', 'MATIC/USDT']
  },
  {
    id: '29',
    title: 'Technical Analysis Shows Major Resistance Breakdown Across Crypto Markets',
    summary: 'Multiple cryptocurrencies break below key technical support levels on high volume. Chart patterns suggest potential continuation of bearish trend with increased selling pressure.',
    sentiment: 'NEGATIVE',
    impact: 'MEDIUM',
    source: 'TradingView',
    url: 'https://www.tradingview.com/chart/BTCUSDT/crypto-market-breakdown-2024',
    publishedAt: '2024-01-15T15:20:00Z',
    timestamp: Date.now() - 2400000, // 40 minutes ago
    relevantPairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'ADA/USDT', 'AVAX/USDT']
  },
  {
    id: '30',
    title: 'Stablecoin Reserves Drop to Lowest Levels in 18 Months Amid Market Uncertainty',
    summary: 'USDT and USDC reserves reach 18-month lows as investors withdraw from crypto markets. Declining stablecoin supply often indicates reduced buying power and potential further price pressure.',
    sentiment: 'NEGATIVE',
    impact: 'MEDIUM',
    source: 'DeFiLlama',
    url: 'https://defillama.com/stablecoins/analysis-reserve-decline',
    publishedAt: '2024-01-15T14:10:00Z',
    timestamp: Date.now() - 4200000, // 70 minutes ago
    relevantPairs: ['USDT/USD', 'USDC/USD', 'BTC/USDT', 'ETH/USDT', 'BNB/USDT']
  },
  {
    id: '5',
    title: 'Binance Announces New AI-Powered Trading Protocol for Launchpad',
    summary: 'Binance Launchpad reveals upcoming token sale for revolutionary AI-powered trading protocol. BNB holders get exclusive access to participate in the sale with staking rewards multipliers.',
    sentiment: 'POSITIVE',
    impact: 'MEDIUM',
    source: 'Binance Blog',
    url: 'https://www.binance.com/en/blog/launchpad/ai-trading-protocol-announcement',
    publishedAt: '2024-01-15T06:00:00Z',
    timestamp: Date.now() - 18000000, // 5 hours ago
    relevantPairs: ['BNB/USDT', 'BNB/USD', 'BNB/BTC']
  },
  {
    id: '6',
    title: 'Federal Reserve Signals Potential Interest Rate Cuts in Q2 2024',
    summary: 'Fed Chairman Jerome Powell signals potential interest rate reductions in Q2 2024 during congressional testimony. Historically bullish environment for risk assets including cryptocurrencies.',
    sentiment: 'POSITIVE',
    impact: 'HIGH',
    source: 'Reuters',
    url: 'https://www.reuters.com/markets/us/fed-chairman-hints-rate-cuts-2024',
    publishedAt: '2024-01-15T04:30:00Z',
    timestamp: Date.now() - 21600000, // 6 hours ago
    relevantPairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'ADA/USDT', 'MATIC/USDT']
  },
  {
    id: '7',
    title: 'Cardano Smart Contract Activity Surges 300% Following Major Network Upgrade',
    summary: 'Cardano network experiences unprecedented 300% surge in smart contract deployment following the latest Vasil upgrade. New DeFi protocols and NFT marketplaces drive ADA ecosystem expansion.',
    sentiment: 'POSITIVE',
    impact: 'MEDIUM',
    source: 'Cardano Foundation',
    url: 'https://cardanofoundation.org/en/news/cardano-smart-contract-growth-vasil-upgrade',
    publishedAt: '2024-01-15T02:15:00Z',
    timestamp: Date.now() - 25200000, // 7 hours ago
    relevantPairs: ['ADA/USDT', 'ADA/USD', 'ADA/BTC']
  },
  {
    id: '8',
    title: 'Ripple Achieves Major Legal Victory in Landmark SEC Case',
    summary: 'Federal court rules in favor of Ripple in landmark case against SEC, providing crucial regulatory clarity for XRP. Decision sets positive precedent for the entire cryptocurrency industry.',
    sentiment: 'POSITIVE',
    impact: 'HIGH',
    source: 'Law360',
    url: 'https://www.law360.com/fintech/articles/ripple-wins-major-ruling-against-sec',
    publishedAt: '2024-01-15T00:45:00Z',
    timestamp: Date.now() - 28800000, // 8 hours ago
    relevantPairs: ['XRP/USDT', 'XRP/USD', 'XRP/BTC']
  },
  {
    id: '9',
    title: 'Polygon zkEVM Mainnet Launch Brings Ethereum Compatibility to Zero-Knowledge Scaling',
    summary: 'Polygon zkEVM successfully launches on mainnet, offering full Ethereum compatibility with zero-knowledge scaling. Major DApps including Uniswap and Aave announce migration plans.',
    sentiment: 'POSITIVE',
    impact: 'HIGH',
    source: 'Polygon Labs',
    url: 'https://polygon.technology/blog/polygon-zkevm-mainnet-launch',
    publishedAt: '2024-01-14T22:30:00Z',
    timestamp: Date.now() - 32400000, // 9 hours ago
    relevantPairs: ['MATIC/USDT', 'MATIC/USD', 'MATIC/BTC']
  },
  {
    id: '10',
    title: 'Elon Musk Confirms Dogecoin Integration with X Platform Payment System',
    summary: 'Tesla CEO Elon Musk officially confirms Dogecoin will be integrated into X (formerly Twitter) platform payment system. DOGE to be used for premium subscriptions and creator payments.',
    sentiment: 'POSITIVE',
    impact: 'HIGH',
    source: 'X (Twitter)',
    url: 'https://twitter.com/elonmusk/status/dogecoin-integration-announcement',
    publishedAt: '2024-01-14T20:00:00Z',
    timestamp: Date.now() - 36000000, // 10 hours ago
    relevantPairs: ['DOGE/USDT', 'DOGE/USD', 'DOGE/BTC']
  },
  {
    id: '11',
    title: 'Avalanche Subnet Activity Reaches All-Time High as Gaming and DeFi Surge',
    summary: 'Avalanche network processes record transactions as gaming and DeFi subnets gain significant traction. AVAX staking rewards increase due to higher network activity and validator participation.',
    sentiment: 'POSITIVE',
    impact: 'MEDIUM',
    source: 'Avalanche Foundation',
    url: 'https://www.avax.network/blog/avalanche-subnet-activity-all-time-high',
    publishedAt: '2024-01-14T18:20:00Z',
    timestamp: Date.now() - 39600000, // 11 hours ago
    relevantPairs: ['AVAX/USDT', 'AVAX/USD', 'AVAX/BTC']
  },
  {
    id: '12',
    title: 'Chainlink Releases Cross-Chain Interoperability Protocol Across 12 Blockchains',
    summary: 'Chainlink announces the release of CCIP (Cross-Chain Interoperability Protocol) enabling secure cross-chain smart contract communication across 12 major blockchains including Ethereum, Polygon, and Avalanche.',
    sentiment: 'POSITIVE',
    impact: 'MEDIUM',
    source: 'Chainlink Labs',
    url: 'https://blog.chain.link/ccip-cross-chain-interoperability-protocol-launch',
    publishedAt: '2024-01-14T16:45:00Z',
    timestamp: Date.now() - 43200000, // 12 hours ago
    relevantPairs: ['LINK/USDT', 'LINK/USD', 'LINK/BTC']
  },
  {
    id: '13',
    title: 'Tether (USDT) Mints Additional $1B to Meet Growing Institutional Demand',
    summary: 'Tether Treasury authorizes the minting of an additional $1 billion USDT tokens on Ethereum to meet growing institutional and retail demand. Market cap reaches new all-time high of $95.2 billion.',
    sentiment: 'POSITIVE',
    impact: 'MEDIUM',
    source: 'The Block',
    url: 'https://www.theblock.co/post/tether-mints-1-billion-usdt-institutional-demand',
    publishedAt: '2024-01-14T14:30:00Z',
    timestamp: Date.now() - 46800000, // 13 hours ago
    relevantPairs: ['USDT/USD', 'BTC/USDT', 'ETH/USDT', 'BNB/USDT']
  },
  {
    id: '14',
    title: 'MicroStrategy Acquires Additional 3,000 Bitcoin Worth $300M for Treasury',
    summary: 'Business intelligence firm MicroStrategy announces the acquisition of an additional 3,000 Bitcoin for approximately $300 million, bringing total holdings to over 190,000 BTC worth $18+ billion.',
    sentiment: 'POSITIVE',
    impact: 'HIGH',
    source: 'MicroStrategy',
    url: 'https://www.microstrategy.com/en/investor-relations/bitcoin-acquisition-announcement',
    publishedAt: '2024-01-14T12:00:00Z',
    timestamp: Date.now() - 50400000, // 14 hours ago
    relevantPairs: ['BTC/USDT', 'BTC/USD', 'MSTR/USD']
  },
  {
    id: '15',
    title: 'Binance.US Receives Approval to Resume USD Deposits and Withdrawals',
    summary: 'Binance.US receives regulatory approval to resume USD deposits and withdrawals following months of restrictions. The exchange demonstrates compliance with enhanced reporting and monitoring requirements.',
    sentiment: 'POSITIVE',
    impact: 'MEDIUM',
    source: 'Binance.US',
    url: 'https://www.binance.us/en/blog/binance-us-resumes-usd-deposits-withdrawals',
    publishedAt: '2024-01-14T10:15:00Z',
    timestamp: Date.now() - 54000000, // 15 hours ago
    relevantPairs: ['BTC/USD', 'ETH/USD', 'BNB/USD', 'SOL/USD']
  },
  {
    id: '16',
    title: 'Cosmos Hub Approves Major Upgrade to Enable Liquid Staking for ATOM',
    summary: 'Cosmos Hub community votes to approve a major network upgrade enabling liquid staking functionality for ATOM tokens. The upgrade allows users to stake ATOM while maintaining liquidity through derivatives.',
    sentiment: 'POSITIVE',
    impact: 'MEDIUM',
    source: 'Cosmos Network',
    url: 'https://cosmos.network/news/cosmos-hub-liquid-staking-upgrade-approval',
    publishedAt: '2024-01-14T08:45:00Z',
    timestamp: Date.now() - 57600000, // 16 hours ago
    relevantPairs: ['ATOM/USDT', 'ATOM/USD', 'ATOM/BTC']
  },
  {
    id: '17',
    title: 'Uniswap Labs Launches Mobile Wallet with Built-in DEX Trading',
    summary: 'Uniswap Labs releases mobile wallet application featuring built-in decentralized exchange trading across multiple chains. The wallet supports Ethereum, Polygon, Arbitrum, and Optimism networks.',
    sentiment: 'POSITIVE',
    impact: 'MEDIUM',
    source: 'Uniswap Labs',
    url: 'https://uniswap.org/blog/uniswap-mobile-wallet-launch',
    publishedAt: '2024-01-14T06:20:00Z',
    timestamp: Date.now() - 61200000, // 17 hours ago
    relevantPairs: ['UNI/USDT', 'UNI/USD', 'UNI/ETH']
  },
  {
    id: '18',
    title: 'Grayscale Bitcoin Trust (GBTC) Sees $500M in Outflows Following ETF Conversion',
    summary: 'Grayscale Bitcoin Trust experiences $500 million in outflows as investors migrate to lower-fee Bitcoin ETF alternatives. Despite outflows, total Bitcoin ETF ecosystem sees net positive flows.',
    sentiment: 'NEUTRAL',
    impact: 'MEDIUM',
    source: 'Financial Times',
    url: 'https://www.ft.com/content/grayscale-bitcoin-trust-outflows-etf-conversion',
    publishedAt: '2024-01-14T04:00:00Z',
    timestamp: Date.now() - 64800000, // 18 hours ago
    relevantPairs: ['BTC/USDT', 'BTC/USD', 'GBTC/USD']
  },
  {
    id: '19',
    title: 'OpenSea Implements Zero-Fee NFT Trading to Compete with Rival Marketplaces',
    summary: 'NFT marketplace OpenSea eliminates creator fees and implements zero-fee trading to remain competitive with rivals like Blur and Magic Eden. The move aims to retain market share amid increasing competition.',
    sentiment: 'NEUTRAL',
    impact: 'LOW',
    source: 'OpenSea Blog',
    url: 'https://opensea.io/blog/zero-fee-trading-announcement',
    publishedAt: '2024-01-14T02:30:00Z',
    timestamp: Date.now() - 68400000, // 19 hours ago
    relevantPairs: ['ETH/USDT', 'BLUR/USDT', 'MAGIC/USDT']
  },
  {
    id: '20',
    title: 'Kraken Exchange Launches Institutional Custody Service for 50+ Digital Assets',
    summary: 'Kraken announces the launch of institutional-grade custody services supporting over 50 digital assets. The service targets institutional clients with enhanced security, insurance coverage, and regulatory compliance.',
    sentiment: 'POSITIVE',
    impact: 'LOW',
    source: 'Kraken',
    url: 'https://blog.kraken.com/institutional-custody-service-launch',
    publishedAt: '2024-01-14T00:15:00Z',
    timestamp: Date.now() - 72000000, // 20 hours ago
    relevantPairs: ['BTC/USD', 'ETH/USD', 'KNC/USDT']
  },
  {
    id: '21',
    title: 'Lido Finance Governance Proposes V2 Upgrade for Enhanced Staking Efficiency',
    summary: 'Lido Finance community proposes V2 protocol upgrade to improve staking efficiency and reduce operational costs. The upgrade includes better validator management and enhanced user experience features.',
    sentiment: 'POSITIVE',
    impact: 'MEDIUM',
    source: 'Lido Finance',
    url: 'https://blog.lido.fi/lido-v2-protocol-upgrade-proposal',
    publishedAt: '2024-01-13T22:45:00Z',
    timestamp: Date.now() - 75600000, // 21 hours ago
    relevantPairs: ['LDO/USDT', 'ETH/USDT', 'STETH/ETH']
  },
  {
    id: '22',
    title: 'Aave Protocol Launches on Base Network with $10M Liquidity Incentives',
    summary: 'Aave launches its lending protocol on Coinbase\'s Base network with $10 million in liquidity mining incentives. The deployment aims to capitalize on Base\'s growing ecosystem and lower transaction costs.',
    sentiment: 'POSITIVE',
    impact: 'MEDIUM',
    source: 'Aave',
    url: 'https://governance.aave.com/aave-base-network-deployment',
    publishedAt: '2024-01-13T20:30:00Z',
    timestamp: Date.now() - 79200000, // 22 hours ago
    relevantPairs: ['AAVE/USDT', 'AAVE/USD', 'ETH/USDT']
  },
  {
    id: '23',
    title: 'Arbitrum Foundation Allocates $100M for Gaming Ecosystem Development',
    summary: 'Arbitrum Foundation announces $100 million allocation for gaming ecosystem development on Arbitrum One and Arbitrum Nova. Funding targets game developers, infrastructure, and user acquisition programs.',
    sentiment: 'POSITIVE',
    impact: 'MEDIUM',
    source: 'Arbitrum Foundation',
    url: 'https://arbitrum.foundation/gaming-ecosystem-development-fund',
    publishedAt: '2024-01-13T18:00:00Z',
    timestamp: Date.now() - 82800000, // 23 hours ago
    relevantPairs: ['ARB/USDT', 'ARB/USD', 'ARB/ETH']
  },
  {
    id: '24',
    title: 'Immutable X Partners with Epic Games for Blockchain Gaming Integration',
    summary: 'Immutable X announces strategic partnership with Epic Games to integrate blockchain gaming capabilities into Unreal Engine. The collaboration aims to make NFT and cryptocurrency integration easier for game developers.',
    sentiment: 'POSITIVE',
    impact: 'MEDIUM',
    source: 'Immutable X',
    url: 'https://www.immutable.com/news/epic-games-partnership-announcement',
    publishedAt: '2024-01-13T16:15:00Z',
    timestamp: Date.now() - 86400000, // 24 hours ago
    relevantPairs: ['IMX/USDT', 'IMX/USD', 'GALA/USDT', 'SAND/USDT']
  }
];
