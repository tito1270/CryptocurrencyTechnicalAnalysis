export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export interface SitemapConfig {
  baseUrl: string;
  defaultChangefreq: SitemapUrl['changefreq'];
  defaultPriority: number;
}

export class SitemapGenerator {
  private config: SitemapConfig;
  private urls: SitemapUrl[] = [];

  constructor(config: SitemapConfig) {
    this.config = config;
  }

  addUrl(url: Partial<SitemapUrl> & { loc: string }): void {
    const fullUrl: SitemapUrl = {
      loc: url.loc.startsWith('/') ? `${this.config.baseUrl}${url.loc}` : url.loc,
      lastmod: url.lastmod || new Date().toISOString(),
      changefreq: url.changefreq || this.config.defaultChangefreq,
      priority: url.priority !== undefined ? url.priority : this.config.defaultPriority,
    };

    this.urls.push(fullUrl);
  }

  addStaticPages(): void {
    const staticPages = [
      { loc: '/', priority: 1.0, changefreq: 'daily' as const },
      { loc: '/#scan-section', priority: 0.9, changefreq: 'hourly' as const },
      { loc: '/#bulk-scanner', priority: 0.9, changefreq: 'daily' as const },
      { loc: '/#live-prices', priority: 0.8, changefreq: 'hourly' as const },
      { loc: '/#crypto-news', priority: 0.8, changefreq: 'hourly' as const },
      { loc: '/about', priority: 0.7, changefreq: 'monthly' as const },
      { loc: '/contact', priority: 0.6, changefreq: 'monthly' as const },
      { loc: '/sitemap', priority: 0.6, changefreq: 'weekly' as const },
      { loc: '/privacy', priority: 0.4, changefreq: 'monthly' as const },
      { loc: '/terms', priority: 0.4, changefreq: 'monthly' as const },
      { loc: '/disclaimer', priority: 0.4, changefreq: 'monthly' as const },
    ];

    staticPages.forEach(page => this.addUrl(page));
  }

  addDynamicPages(): void {
    // Add popular crypto pair URLs for better SEO
    const popularPairs = [
      'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'XRP/USDT',
      'SOL/USDT', 'DOT/USDT', 'DOGE/USDT', 'AVAX/USDT', 'MATIC/USDT'
    ];

    popularPairs.forEach(pair => {
      this.addUrl({
        loc: `/?pair=${encodeURIComponent(pair)}`,
        priority: 0.8,
        changefreq: 'hourly'
      });
    });

    // Add timeframe-specific URLs
    const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
    timeframes.forEach(timeframe => {
      this.addUrl({
        loc: `/?timeframe=${timeframe}`,
        priority: 0.7,
        changefreq: 'daily'
      });
    });
  }

  generateXML(): string {
    const urls = this.urls.map(url => {
      return `  <url>
    <loc>${this.escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${urls}

</urlset>`;
  }

  generateJSON(): object {
    return {
      sitemapUrl: `${this.config.baseUrl}/sitemap.xml`,
      lastGenerated: new Date().toISOString(),
      totalUrls: this.urls.length,
      urls: this.urls
    };
  }

  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  clear(): void {
    this.urls = [];
  }

  getUrls(): SitemapUrl[] {
    return [...this.urls];
  }
}

export function generateSitemap(baseUrl: string = 'https://cryptoanalyzer-pro.com'): string {
  const generator = new SitemapGenerator({
    baseUrl,
    defaultChangefreq: 'weekly',
    defaultPriority: 0.5
  });

  generator.addStaticPages();
  generator.addDynamicPages();

  return generator.generateXML();
}

export function generateSitemapInfo(baseUrl: string = 'https://cryptoanalyzer-pro.com'): object {
  const generator = new SitemapGenerator({
    baseUrl,
    defaultChangefreq: 'weekly',
    defaultPriority: 0.5
  });

  generator.addStaticPages();
  generator.addDynamicPages();

  return generator.generateJSON();
}
