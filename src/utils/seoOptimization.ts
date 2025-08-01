// Google SEO Compliance Utility
// Ensures all meta tags meet Google's requirements and best practices

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  url?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  locale?: string;
  siteName?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export interface OptimizedSEO {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  twitterTitle: string;
  twitterDescription: string;
  structuredData: object;
  warnings: string[];
}

export class SEOOptimizer {
  private static readonly LIMITS = {
    TITLE_MIN: 30,
    TITLE_MAX: 60,
    DESCRIPTION_MIN: 120,
    DESCRIPTION_MAX: 160,
    KEYWORDS_MAX: 10,
    KEYWORD_LENGTH_MAX: 20,
    OG_TITLE_MAX: 95,
    TWITTER_TITLE_MAX: 70,
    TWITTER_DESCRIPTION_MAX: 125
  };

  private static readonly TOP_CRYPTO_KEYWORDS = [
    'cryptocurrency', 'bitcoin', 'ethereum', 'crypto trading', 'blockchain',
    'BTC', 'ETH', 'technical analysis', 'trading signals', 'crypto scanner',
    'cryptocurrency analysis', 'bitcoin analysis', 'ethereum trading',
    'crypto platform', 'trading indicators', 'market analysis', 'DeFi',
    'altcoin', 'crypto news', 'price prediction', 'trading bot',
    'crypto portfolio', 'binance', 'coinbase', 'free crypto tools'
  ];

  private static readonly BRANDED_KEYWORDS = [
    'CryptoAnalyzer Pro', 'crypto analyzer', 'professional crypto analysis',
    'free cryptocurrency tools', 'crypto technical analysis platform'
  ];

  static optimize(config: SEOConfig): OptimizedSEO {
    const warnings: string[] = [];
    
    // Optimize title
    const optimizedTitle = this.optimizeTitle(config.title, warnings);
    
    // Optimize description  
    const optimizedDescription = this.optimizeDescription(config.description, warnings);
    
    // Optimize keywords
    const optimizedKeywords = this.optimizeKeywords(config.keywords, warnings);
    
    // Create social media variants
    const ogTitle = this.createOGTitle(optimizedTitle, warnings);
    const ogDescription = this.createOGDescription(optimizedDescription, warnings);
    const twitterTitle = this.createTwitterTitle(optimizedTitle, warnings);
    const twitterDescription = this.createTwitterDescription(optimizedDescription, warnings);
    
    // Generate structured data
    const structuredData = this.generateStructuredData(config);

    return {
      title: optimizedTitle,
      description: optimizedDescription,
      keywords: optimizedKeywords,
      ogTitle,
      ogDescription,
      twitterTitle,
      twitterDescription,
      structuredData,
      warnings
    };
  }

  private static optimizeTitle(title: string, warnings: string[]): string {
    // Remove extra spaces and trim
    let optimized = title.replace(/\s+/g, ' ').trim();
    
    // Check length compliance
    if (optimized.length < this.LIMITS.TITLE_MIN) {
      warnings.push(`Title too short (${optimized.length} chars). Recommended: ${this.LIMITS.TITLE_MIN}-${this.LIMITS.TITLE_MAX} chars`);
    }
    
    if (optimized.length > this.LIMITS.TITLE_MAX) {
      // Truncate at word boundary
      optimized = this.truncateAtWordBoundary(optimized, this.LIMITS.TITLE_MAX);
      warnings.push(`Title truncated to ${optimized.length} chars for Google compliance`);
    }
    
    // Ensure branded keyword is present
    if (!optimized.toLowerCase().includes('cryptoanalyzer')) {
      optimized = optimized.replace(' | ', ' - CryptoAnalyzer Pro | ');
    }
    
    return optimized;
  }

  private static optimizeDescription(description: string, warnings: string[]): string {
    let optimized = description.replace(/\s+/g, ' ').trim();
    
    if (optimized.length < this.LIMITS.DESCRIPTION_MIN) {
      warnings.push(`Description too short (${optimized.length} chars). Recommended: ${this.LIMITS.DESCRIPTION_MIN}-${this.LIMITS.DESCRIPTION_MAX} chars`);
    }
    
    if (optimized.length > this.LIMITS.DESCRIPTION_MAX) {
      optimized = this.truncateAtWordBoundary(optimized, this.LIMITS.DESCRIPTION_MAX);
      warnings.push(`Description truncated to ${optimized.length} chars for Google compliance`);
    }
    
    // Ensure call-to-action
    if (!optimized.toLowerCase().includes('free') && !optimized.toLowerCase().includes('analyze')) {
      optimized = optimized.replace('.', '. Start your free analysis now.');
      if (optimized.length > this.LIMITS.DESCRIPTION_MAX) {
        optimized = this.truncateAtWordBoundary(optimized, this.LIMITS.DESCRIPTION_MAX);
      }
    }
    
    return optimized;
  }

  private static optimizeKeywords(keywords: string[], warnings: string[]): string {
    // Combine user keywords with top crypto keywords
    const allKeywords = [...keywords, ...this.TOP_CRYPTO_KEYWORDS, ...this.BRANDED_KEYWORDS];
    
    // Remove duplicates and filter by length
    const uniqueKeywords = [...new Set(allKeywords)]
      .filter(keyword => keyword.length <= this.LIMITS.KEYWORD_LENGTH_MAX)
      .slice(0, this.LIMITS.KEYWORDS_MAX);
    
    if (keywords.length > this.LIMITS.KEYWORDS_MAX) {
      warnings.push(`Keywords limited to ${this.LIMITS.KEYWORDS_MAX} for optimal SEO performance`);
    }
    
    return uniqueKeywords.join(', ');
  }

  private static createOGTitle(title: string, warnings: string[]): string {
    if (title.length > this.LIMITS.OG_TITLE_MAX) {
      const truncated = this.truncateAtWordBoundary(title, this.LIMITS.OG_TITLE_MAX);
      warnings.push(`Open Graph title truncated to ${truncated.length} chars`);
      return truncated;
    }
    return title;
  }

  private static createOGDescription(description: string, warnings: string[]): string {
    // OG description can be longer than meta description
    if (description.length > 200) {
      return this.truncateAtWordBoundary(description, 200);
    }
    return description;
  }

  private static createTwitterTitle(title: string, warnings: string[]): string {
    if (title.length > this.LIMITS.TWITTER_TITLE_MAX) {
      const truncated = this.truncateAtWordBoundary(title, this.LIMITS.TWITTER_TITLE_MAX);
      warnings.push(`Twitter title truncated to ${truncated.length} chars`);
      return truncated;
    }
    return title;
  }

  private static createTwitterDescription(description: string, warnings: string[]): string {
    if (description.length > this.LIMITS.TWITTER_DESCRIPTION_MAX) {
      const truncated = this.truncateAtWordBoundary(description, this.LIMITS.TWITTER_DESCRIPTION_MAX);
      warnings.push(`Twitter description truncated to ${truncated.length} chars`);
      return truncated;
    }
    return description;
  }

  private static truncateAtWordBoundary(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace);
    }
    
    return truncated;
  }

  private static generateStructuredData(config: SEOConfig): object {
    const baseUrl = config.url || 'https://cryptoanalyzer-pro.com';
    
    return {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "CryptoAnalyzer Pro",
      "alternateName": ["Crypto Analyzer", "Cryptocurrency Analysis Platform"],
      "description": config.description,
      "url": baseUrl,
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web Browser",
      "browserRequirements": "Requires JavaScript. Supports Chrome 60+, Firefox 60+, Safari 12+, Edge 79+",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "validFrom": "2024-01-01"
      },
      "featureList": [
        "Bitcoin (BTC) technical analysis",
        "Ethereum (ETH) price analysis", 
        "1000+ cryptocurrency pairs support",
        "25+ technical indicators",
        "Multi-exchange analysis (15+ exchanges)",
        "Real-time market data",
        "Free trading signals",
        "Bulk cryptocurrency scanner",
        "News sentiment analysis",
        "Risk management tools"
      ],
      "audience": {
        "@type": "Audience",
        "audienceType": "Cryptocurrency traders and investors"
      },
      "provider": {
        "@type": "Organization",
        "name": "CryptoAnalyzer Pro",
        "url": baseUrl,
        "logo": `${baseUrl}/crypto-analyzer-logo.png`,
        "sameAs": [
          "https://twitter.com/cryptoanalyzerpro",
          "https://facebook.com/cryptoanalyzerpro"
        ]
      },
      "datePublished": "2024-01-01",
      "dateModified": new Date().toISOString().split('T')[0],
      "inLanguage": "en-US",
      "isAccessibleForFree": true,
      "keywords": config.keywords.join(', ')
    };
  }

  static validateSEO(seo: OptimizedSEO): { score: number; issues: string[]; recommendations: string[] } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Title validation
    if (seo.title.length < this.LIMITS.TITLE_MIN) {
      issues.push('Title is too short');
      score -= 10;
    }
    if (seo.title.length > this.LIMITS.TITLE_MAX) {
      issues.push('Title is too long');
      score -= 15;
    }
    if (!seo.title.toLowerCase().includes('crypto')) {
      recommendations.push('Consider including "crypto" in the title');
      score -= 5;
    }

    // Description validation
    if (seo.description.length < this.LIMITS.DESCRIPTION_MIN) {
      issues.push('Description is too short');
      score -= 15;
    }
    if (seo.description.length > this.LIMITS.DESCRIPTION_MAX) {
      issues.push('Description is too long');
      score -= 10;
    }

    // Keywords validation
    const keywordCount = seo.keywords.split(', ').length;
    if (keywordCount < 5) {
      recommendations.push('Add more relevant keywords');
      score -= 5;
    }
    if (keywordCount > this.LIMITS.KEYWORDS_MAX) {
      issues.push('Too many keywords');
      score -= 10;
    }

    return { score, issues, recommendations };
  }
}

// Pre-defined SEO configs for different pages
export const SEO_CONFIGS = {
  home: {
    title: "Free Crypto Analysis - CryptoAnalyzer Pro | Bitcoin & Ethereum Trading",
    description: "Professional cryptocurrency technical analysis platform. Analyze Bitcoin, Ethereum & 1000+ crypto pairs with 25+ indicators across 15+ exchanges. Free forever with real-time trading signals.",
    keywords: ["cryptocurrency analysis", "bitcoin analysis", "ethereum trading", "crypto scanner", "free crypto tools", "technical indicators", "trading signals", "blockchain analysis"]
  },
  
  scanner: {
    title: "Crypto Scanner - Free Technical Analysis Tool | CryptoAnalyzer Pro", 
    description: "Advanced cryptocurrency scanner with 25+ technical indicators. Analyze any crypto pair across major exchanges including Binance, Coinbase, Kraken. Get instant trading signals for free.",
    keywords: ["crypto scanner", "cryptocurrency scanner", "bitcoin scanner", "technical analysis", "trading indicators", "crypto signals", "free scanner tool"]
  },

  bulk: {
    title: "Bulk Crypto Scanner - Analyze 100+ Pairs | CryptoAnalyzer Pro",
    description: "Scan multiple cryptocurrency pairs simultaneously. Advanced filtering, batch analysis, and comprehensive reporting for serious crypto traders. Analyze hundreds of pairs in seconds.",
    keywords: ["bulk crypto scanner", "batch analysis", "multi-pair scanning", "crypto screening", "portfolio analysis", "crypto batch processing"]
  },

  news: {
    title: "Crypto News & Market Analysis | CryptoAnalyzer Pro",
    description: "Latest cryptocurrency news with sentiment analysis. Real-time market updates for Bitcoin, Ethereum, DeFi, and altcoins. Get trading insights from breaking crypto news.",
    keywords: ["crypto news", "bitcoin news", "ethereum news", "market analysis", "sentiment analysis", "trading news", "crypto updates"]
  },

  about: {
    title: "About CryptoAnalyzer Pro - Professional Crypto Analysis Platform",
    description: "Learn about CryptoAnalyzer Pro's mission to provide free, professional-grade cryptocurrency analysis tools. Discover our advanced features, exchange coverage, and trading indicators.",
    keywords: ["about crypto analyzer", "crypto platform", "trading tools company", "cryptocurrency analysis", "bitcoin analysis platform", "professional crypto tools"]
  },

  contact: {
    title: "Contact CryptoAnalyzer Pro - Support & Technical Help",
    description: "Get professional support for cryptocurrency analysis platform. Technical assistance for trading tools, platform features, and crypto analysis. Fast response guaranteed.",
    keywords: ["crypto support", "technical support", "platform help", "cryptocurrency assistance", "trading support", "crypto analyzer contact"]
  },

  privacy: {
    title: "Privacy Policy - CryptoAnalyzer Pro Data Protection",
    description: "CryptoAnalyzer Pro privacy policy explaining data protection practices for cryptocurrency trading platform. GDPR compliant with transparent data handling policies.",
    keywords: ["privacy policy", "data protection", "crypto privacy", "trading data security", "GDPR compliance", "cryptocurrency privacy"]
  },

  terms: {
    title: "Terms of Service - CryptoAnalyzer Pro Platform Usage",
    description: "Terms and conditions for using CryptoAnalyzer Pro cryptocurrency analysis platform. Legal framework for trading tools, signals, and platform features.",
    keywords: ["terms of service", "platform terms", "crypto terms", "trading platform legal", "cryptocurrency analysis terms", "usage agreement"]
  },

  disclaimer: {
    title: "Trading Disclaimer - CryptoAnalyzer Pro Risk Warning",
    description: "Important risk disclaimers for cryptocurrency trading. Understand Bitcoin, Ethereum trading risks, market volatility warnings before using analysis tools.",
    keywords: ["trading disclaimer", "crypto risk warning", "investment risks", "cryptocurrency disclaimer", "trading risks", "market volatility"]
  },

  sitemap: {
    title: "Sitemap - CryptoAnalyzer Pro Complete Navigation Guide",
    description: "Complete sitemap for CryptoAnalyzer Pro cryptocurrency platform. Navigate all Bitcoin analysis tools, Ethereum trading features, and crypto scanners easily.",
    keywords: ["crypto sitemap", "platform navigation", "crypto tools directory", "bitcoin analysis sitemap", "ethereum trading sitemap", "cryptocurrency navigation"]
  }
};

export function optimizeSEOForPage(page: string, customConfig?: Partial<SEOConfig>): OptimizedSEO {
  const baseConfig = SEO_CONFIGS[page as keyof typeof SEO_CONFIGS] || SEO_CONFIGS.home;
  const config = { ...baseConfig, ...customConfig };
  
  return SEOOptimizer.optimize({
    ...config,
    url: customConfig?.url || `https://cryptoanalyzer-pro.com${page === 'home' ? '' : `/${page}`}`
  });
}
