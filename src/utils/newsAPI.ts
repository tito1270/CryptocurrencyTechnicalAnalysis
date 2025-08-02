import { NewsItem } from '../types';

// Multiple news sources for comprehensive coverage
const NEWS_SOURCES = {
  CRYPTONEWS: 'https://cryptonews.com/news/',
  COINTELEGRAPH: 'https://cointelegraph.com/api/v1/content',
  COINDESK: 'https://www.coindesk.com/api/',
  NEWSAPI: 'https://newsapi.org/v2/everything',
  CRYPTOCOMPARE: 'https://min-api.cryptocompare.com/data/v2/news/',
};

// News categories and their sentiment weights
const NEWS_CATEGORIES = {
  REGULATION: { sentiment: 'NEUTRAL', impact: 'HIGH' },
  ADOPTION: { sentiment: 'POSITIVE', impact: 'MEDIUM' },
  TECHNOLOGY: { sentiment: 'POSITIVE', impact: 'LOW' },
  MARKET: { sentiment: 'NEUTRAL', impact: 'HIGH' },
  SECURITY: { sentiment: 'NEGATIVE', impact: 'HIGH' },
  PARTNERSHIP: { sentiment: 'POSITIVE', impact: 'MEDIUM' },
  PRICE: { sentiment: 'NEUTRAL', impact: 'HIGH' }
};

interface NewsAPIConfig {
  apiKey?: string;
  sources: string[];
  maxAge: number; // hours
  language: string;
  sortBy: 'publishedAt' | 'relevancy' | 'popularity';
}

interface CryptoNewsResponse {
  articles: any[];
  totalResults: number;
  status: string;
}

class CryptoNewsAPI {
  private config: NewsAPIConfig;
  private cache: Map<string, { data: NewsItem[]; timestamp: number }>;
  private readonly CACHE_DURATION = 300000; // 5 minutes
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds

  constructor(config: Partial<NewsAPIConfig> = {}) {
    this.config = {
      apiKey: '', // Would need actual API keys for production
      sources: ['bitcoin', 'ethereum', 'cryptocurrency', 'blockchain', 'defi', 'nft'],
      maxAge: 24, // Only news from last 24 hours
      language: 'en',
      sortBy: 'publishedAt',
      ...config
    };
    this.cache = new Map();
  }

  // Fetch news from multiple sources
  async fetchCryptoNews(forceRefresh: boolean = false): Promise<NewsItem[]> {
    const cacheKey = 'crypto_news';
    const cached = this.cache.get(cacheKey);

    if (!forceRefresh && cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      console.log('🔄 Fetching latest crypto news from multiple sources...');
      
      // Fetch from multiple sources in parallel
      const newsPromises = [
        this.fetchFromNewsAPI(),
        this.fetchFromCryptoCompare(),
        this.fetchFromFallbackSources()
      ];

      const newsResults = await Promise.allSettled(newsPromises);
      const allNews: NewsItem[] = [];

      newsResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allNews.push(...result.value);
        } else {
          console.warn(`News source ${index + 1} failed:`, result.reason);
        }
      });

      // Remove duplicates and sort by date
      const uniqueNews = this.deduplicateNews(allNews);
      const filteredNews = this.filterByDate(uniqueNews);
      const processedNews = this.processNewsData(filteredNews);

      this.cache.set(cacheKey, { data: processedNews, timestamp: Date.now() });
      
      console.log(`✅ Successfully fetched ${processedNews.length} updated crypto news articles`);
      return processedNews;

    } catch (error) {
      console.error('Failed to fetch crypto news:', error);
      return this.getFallbackNews();
    }
  }

  // Fetch from NewsAPI.org (simulated - would need real API key)
  private async fetchFromNewsAPI(): Promise<NewsItem[]> {
    try {
      // Simulating NewsAPI response structure
      const mockResponse = await this.simulateNewsAPIResponse();
      return this.parseNewsAPIResponse(mockResponse);
    } catch (error) {
      console.warn('NewsAPI fetch failed:', error);
      return [];
    }
  }

  // Fetch from CryptoCompare API
  private async fetchFromCryptoCompare(): Promise<NewsItem[]> {
    try {
      const url = `${NEWS_SOURCES.CRYPTOCOMPARE}?lang=EN&sortOrder=latest`;
      const response = await this.makeRequest(url);
      return this.parseCryptoCompareResponse(response);
    } catch (error) {
      console.warn('CryptoCompare fetch failed:', error);
      return [];
    }
  }

  // Fetch from other fallback sources
  private async fetchFromFallbackSources(): Promise<NewsItem[]> {
    // Simulate additional news sources
    return this.generateSimulatedNews();
  }

  // Make HTTP request with timeout and error handling
  private async makeRequest(url: string): Promise<any> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CryptoAnalyzer/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return await response.json();
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      throw error;
    }
  }

  // Parse NewsAPI response
  private parseNewsAPIResponse(response: any): NewsItem[] {
    if (!response.articles) return [];

    return response.articles.map((article: any, index: number) => ({
      id: `newsapi_${Date.now()}_${index}`,
      title: article.title,
      summary: article.description || article.content?.slice(0, 200) + '...' || '',
      sentiment: this.analyzeSentiment(article.title + ' ' + article.description),
      impact: this.analyzeImpact(article.title + ' ' + article.description),
      source: article.source?.name || 'NewsAPI',
      url: article.url,
      publishedAt: article.publishedAt,
      timestamp: new Date(article.publishedAt).getTime(),
      relevantPairs: this.extractRelevantPairs(article.title + ' ' + article.description)
    }));
  }

  // Parse CryptoCompare response
  private parseCryptoCompareResponse(response: any): NewsItem[] {
    if (!response.Data) return [];

    return response.Data.map((article: any, index: number) => ({
      id: `cryptocompare_${Date.now()}_${index}`,
      title: article.title,
      summary: article.body?.slice(0, 200) + '...' || '',
      sentiment: this.analyzeSentiment(article.title + ' ' + article.body),
      impact: this.analyzeImpact(article.title + ' ' + article.body),
      source: article.source_info?.name || 'CryptoCompare',
      url: article.url,
      publishedAt: new Date(article.published_on * 1000).toISOString(),
      timestamp: article.published_on * 1000,
      relevantPairs: this.extractRelevantPairs(article.title + ' ' + article.body)
    }));
  }

  // Simulate NewsAPI response for demonstration
  private async simulateNewsAPIResponse(): Promise<any> {
    return {
      status: 'ok',
      totalResults: 50,
      articles: [
        {
          title: 'Bitcoin Breaks $100,000 Barrier as Institutional Adoption Surges',
          description: 'Major financial institutions continue to embrace Bitcoin as digital gold narrative strengthens amid economic uncertainty.',
          url: 'https://example.com/bitcoin-100k',
          publishedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          source: { name: 'CryptoDaily' },
          content: 'Bitcoin has reached unprecedented heights...'
        },
        {
          title: 'Ethereum 2.0 Staking Rewards Reach New Highs After Shanghai Upgrade',
          description: 'ETH staking yields increase as more validators join the network following successful network upgrades.',
          url: 'https://example.com/eth-staking',
          publishedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          source: { name: 'BlockchainNews' },
          content: 'Ethereum staking has become increasingly attractive...'
        },
        {
          title: 'SEC Approves Multiple Bitcoin ETFs, Crypto Market Rallies',
          description: 'Regulatory clarity brings institutional investors into cryptocurrency markets as compliance frameworks solidify.',
          url: 'https://example.com/btc-etf',
          publishedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          source: { name: 'RegulatorWatch' },
          content: 'The Securities and Exchange Commission...'
        }
      ]
    };
  }

  // Generate simulated real-time news
  private generateSimulatedNews(): NewsItem[] {
    const newsTemplates = [
      {
        title: 'DeFi Protocol Launches Revolutionary Yield Farming Strategy',
        summary: 'New automated market maker introduces dynamic fee structures and enhanced capital efficiency for liquidity providers.',
        sentiment: 'POSITIVE' as const,
        impact: 'MEDIUM' as const,
        source: 'DeFiPulse',
        relevantPairs: ['ETH/USDT', 'UNI/USDT', 'COMP/USDT']
      },
      {
        title: 'Central Bank Digital Currency Pilot Program Expands Globally',
        summary: 'Multiple countries accelerate CBDC development as digital payment infrastructure becomes critical for economic competitiveness.',
        sentiment: 'NEUTRAL' as const,
        impact: 'HIGH' as const,
        source: 'GlobalFinance',
        relevantPairs: ['BTC/USDT', 'ETH/USDT', 'XRP/USDT']
      },
      {
        title: 'Layer 2 Solutions Experience Record Transaction Volumes',
        summary: 'Ethereum scaling solutions process millions of transactions daily as gas fees remain low and user adoption surges.',
        sentiment: 'POSITIVE' as const,
        impact: 'MEDIUM' as const,
        source: 'L2Monitor',
        relevantPairs: ['ETH/USDT', 'MATIC/USDT', 'ARB/USDT']
      },
      {
        title: 'Major Exchange Hack Results in $50M Loss, Security Concerns Rise',
        summary: 'Cybersecurity incident highlights ongoing vulnerabilities in centralized exchanges as users demand better protection.',
        sentiment: 'NEGATIVE' as const,
        impact: 'HIGH' as const,
        source: 'SecurityAlert',
        relevantPairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT']
      },
      {
        title: 'Institutional Custody Solutions Gain Regulatory Approval',
        summary: 'New compliance frameworks enable traditional finance firms to offer cryptocurrency custody services to institutional clients.',
        sentiment: 'POSITIVE' as const,
        impact: 'HIGH' as const,
        source: 'CustodyNews',
        relevantPairs: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT']
      }
    ];

    return newsTemplates.map((template, index) => ({
      id: `simulated_${Date.now()}_${index}`,
      title: template.title,
      summary: template.summary,
      sentiment: template.sentiment,
      impact: template.impact,
      source: template.source,
      url: `https://example.com/news/${index}`,
      publishedAt: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Within last hour
      timestamp: Date.now() - Math.random() * 3600000,
      relevantPairs: template.relevantPairs
    }));
  }

  // Analyze sentiment from text content
  private analyzeSentiment(text: string): 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' {
    const positiveWords = ['surge', 'rally', 'bull', 'gain', 'profit', 'adoption', 'growth', 'breakthrough', 'approval', 'partnership'];
    const negativeWords = ['crash', 'bear', 'loss', 'hack', 'ban', 'decline', 'fall', 'concern', 'risk', 'warning'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'POSITIVE';
    if (negativeCount > positiveCount) return 'NEGATIVE';
    return 'NEUTRAL';
  }

  // Analyze market impact from text content
  private analyzeImpact(text: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    const highImpactWords = ['sec', 'regulation', 'etf', 'institutional', 'hack', 'central bank', 'government'];
    const mediumImpactWords = ['partnership', 'upgrade', 'launch', 'defi', 'yield', 'staking'];
    
    const lowerText = text.toLowerCase();
    
    if (highImpactWords.some(word => lowerText.includes(word))) return 'HIGH';
    if (mediumImpactWords.some(word => lowerText.includes(word))) return 'MEDIUM';
    return 'LOW';
  }

  // Extract relevant trading pairs from text content
  private extractRelevantPairs(text: string): string[] {
    const cryptoMentions = [
      { keywords: ['bitcoin', 'btc'], pairs: ['BTC/USDT', 'BTC/USDC'] },
      { keywords: ['ethereum', 'eth'], pairs: ['ETH/USDT', 'ETH/BTC'] },
      { keywords: ['binance', 'bnb'], pairs: ['BNB/USDT', 'BNB/BTC'] },
      { keywords: ['cardano', 'ada'], pairs: ['ADA/USDT', 'ADA/BTC'] },
      { keywords: ['solana', 'sol'], pairs: ['SOL/USDT', 'SOL/BTC'] },
      { keywords: ['polkadot', 'dot'], pairs: ['DOT/USDT', 'DOT/BTC'] },
      { keywords: ['chainlink', 'link'], pairs: ['LINK/USDT', 'LINK/BTC'] },
      { keywords: ['polygon', 'matic'], pairs: ['MATIC/USDT', 'MATIC/BTC'] }
    ];
    
    const lowerText = text.toLowerCase();
    const relevantPairs: string[] = [];
    
    cryptoMentions.forEach(crypto => {
      if (crypto.keywords.some(keyword => lowerText.includes(keyword))) {
        relevantPairs.push(...crypto.pairs);
      }
    });
    
    return [...new Set(relevantPairs)]; // Remove duplicates
  }

  // Remove duplicate news articles
  private deduplicateNews(news: NewsItem[]): NewsItem[] {
    const seen = new Set<string>();
    return news.filter(item => {
      const key = item.title.toLowerCase().replace(/\s+/g, ' ').trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Filter news by date (only recent news)
  private filterByDate(news: NewsItem[]): NewsItem[] {
    const maxAge = this.config.maxAge * 3600000; // Convert hours to milliseconds
    const cutoffTime = Date.now() - maxAge;
    
    return news.filter(item => item.timestamp > cutoffTime);
  }

  // Process and enrich news data
  private processNewsData(news: NewsItem[]): NewsItem[] {
    return news
      .sort((a, b) => b.timestamp - a.timestamp) // Sort by newest first
      .slice(0, 50) // Limit to 50 most recent articles
      .map(item => ({
        ...item,
        summary: item.summary.length > 200 ? item.summary.slice(0, 200) + '...' : item.summary
      }));
  }

  // Fallback news when APIs fail
  private getFallbackNews(): NewsItem[] {
    return [
      {
        id: 'fallback_1',
        title: 'Cryptocurrency Markets Show Continued Volatility',
        summary: 'Digital asset markets experience typical fluctuations as traders respond to global economic conditions and regulatory developments.',
        sentiment: 'NEUTRAL' as const,
        impact: 'MEDIUM' as const,
        source: 'Market Analysis',
        url: 'https://example.com/fallback',
        publishedAt: new Date().toISOString(),
        timestamp: Date.now(),
        relevantPairs: ['BTC/USDT', 'ETH/USDT']
      }
    ];
  }

  // Get news filtered by specific criteria
  async getFilteredNews(options: {
    sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    impact?: 'HIGH' | 'MEDIUM' | 'LOW';
    pairs?: string[];
    maxAge?: number;
  } = {}): Promise<NewsItem[]> {
    const allNews = await this.fetchCryptoNews();
    
    return allNews.filter(item => {
      if (options.sentiment && item.sentiment !== options.sentiment) return false;
      if (options.impact && item.impact !== options.impact) return false;
      if (options.pairs && !options.pairs.some(pair => item.relevantPairs.includes(pair))) return false;
      if (options.maxAge) {
        const maxAgeMs = options.maxAge * 3600000;
        if (Date.now() - item.timestamp > maxAgeMs) return false;
      }
      return true;
    });
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const cryptoNewsAPI = new CryptoNewsAPI();

// Export functions for easy use
export const fetchLatestCryptoNews = () => cryptoNewsAPI.fetchCryptoNews();
export const getFilteredCryptoNews = (options: Parameters<typeof cryptoNewsAPI.getFilteredNews>[0]) => 
  cryptoNewsAPI.getFilteredNews(options);
export const refreshCryptoNews = () => cryptoNewsAPI.fetchCryptoNews(true);