export interface PingResult {
  service: string;
  url: string;
  success: boolean;
  response?: string;
  error?: string;
  timestamp: string;
}

export interface SearchEngineService {
  name: string;
  pingUrl: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  authInstructions?: string;
}

export class SearchEnginePing {
  private static readonly PING_SERVICES: SearchEngineService[] = [
    {
      name: 'Google',
      pingUrl: 'https://www.google.com/ping?sitemap=',
      method: 'GET',
    },
    {
      name: 'Bing',
      pingUrl: 'https://www.bing.com/ping?sitemap=',
      method: 'GET',
    },
    {
      name: 'Yandex',
      pingUrl: 'https://webmaster.yandex.com/ping?sitemap=',
      method: 'GET',
    },
    {
      name: 'IndexNow (Bing/Yandex)',
      pingUrl: 'https://api.indexnow.org/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      requiresAuth: true,
      authInstructions: 'Requires API key from IndexNow'
    }
  ];

  private static readonly SEARCH_ENGINE_WEBMASTER_TOOLS = [
    {
      name: 'Google Search Console',
      url: 'https://search.google.com/search-console',
      submitUrl: 'https://search.google.com/search-console/sitemaps',
      apiUrl: 'https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/sitemaps/{feedpath}',
      requiresAuth: true,
      authInstructions: 'Requires Google Search Console API key and site verification'
    },
    {
      name: 'Bing Webmaster Tools',
      url: 'https://www.bing.com/webmasters',
      submitUrl: 'https://www.bing.com/webmasters/sitemaps',
      apiUrl: 'https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch',
      requiresAuth: true,
      authInstructions: 'Requires Bing Webmaster Tools API key and site verification'
    },
    {
      name: 'Yandex Webmaster',
      url: 'https://webmaster.yandex.com',
      submitUrl: 'https://webmaster.yandex.com/sites/',
      apiUrl: 'https://api.webmaster.yandex.net/v4/user/{userId}/hosts/{hostId}/sitemap',
      requiresAuth: true,
      authInstructions: 'Requires Yandex OAuth token and host verification'
    },
    {
      name: 'Baidu Webmaster (China)',
      url: 'http://zhanzhang.baidu.com',
      submitUrl: 'http://zhanzhang.baidu.com/sitemap/index',
      requiresAuth: true,
      authInstructions: 'Requires Baidu account and site verification'
    },
    {
      name: 'Naver Webmaster (Korea)',
      url: 'https://searchadvisor.naver.com',
      submitUrl: 'https://searchadvisor.naver.com/console/board',
      requiresAuth: true,
      authInstructions: 'Requires Naver account and site verification'
    },
    {
      name: 'Seznam (Czech Republic)',
      url: 'https://search.seznam.cz',
      submitUrl: 'https://search.seznam.cz/howto/seo',
      requiresAuth: false,
      authInstructions: 'Manual submission through webpage'
    }
  ];

  static async pingAllServices(sitemapUrl: string): Promise<PingResult[]> {
    const results: PingResult[] = [];
    
    for (const service of this.PING_SERVICES) {
      try {
        const result = await this.pingService(service, sitemapUrl);
        results.push(result);
      } catch (error) {
        results.push({
          service: service.name,
          url: service.pingUrl + encodeURIComponent(sitemapUrl),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return results;
  }

  static async pingService(service: SearchEngineService, sitemapUrl: string): Promise<PingResult> {
    const timestamp = new Date().toISOString();
    
    try {
      let response: Response;
      
      if (service.method === 'GET') {
        const fullUrl = service.pingUrl + encodeURIComponent(sitemapUrl);
        response = await fetch(fullUrl, {
          method: 'GET',
          headers: service.headers || {},
        });
      } else {
        // POST method for IndexNow
        const body = service.name === 'IndexNow (Bing/Yandex)' 
          ? JSON.stringify({
              host: new URL(sitemapUrl).hostname,
              key: 'YOUR_INDEXNOW_KEY', // This should be configured
              urlList: [sitemapUrl]
            })
          : sitemapUrl;
          
        response = await fetch(service.pingUrl, {
          method: 'POST',
          headers: service.headers || {},
          body: body
        });
      }

      const success = response.ok || response.status === 200;
      const responseText = await response.text();

      return {
        service: service.name,
        url: service.method === 'GET' 
          ? service.pingUrl + encodeURIComponent(sitemapUrl)
          : service.pingUrl,
        success,
        response: responseText,
        timestamp
      };
    } catch (error) {
      return {
        service: service.name,
        url: service.pingUrl + encodeURIComponent(sitemapUrl),
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        timestamp
      };
    }
  }

  static getSearchEngineServices(): SearchEngineService[] {
    return [...this.PING_SERVICES];
  }

  static getWebmasterTools() {
    return [...this.SEARCH_ENGINE_WEBMASTER_TOOLS];
  }

  static generateSubmissionReport(results: PingResult[]): string {
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    
    let report = `🔍 SEARCH ENGINE PING REPORT\n`;
    report += `📊 Success Rate: ${successful}/${total} (${Math.round((successful/total) * 100)}%)\n`;
    report += `⏰ Generated: ${new Date().toLocaleString()}\n\n`;
    
    report += `✅ SUCCESSFUL PINGS:\n`;
    results.filter(r => r.success).forEach(result => {
      report += `  • ${result.service}: ${result.url}\n`;
    });
    
    if (results.some(r => !r.success)) {
      report += `\n❌ FAILED PINGS:\n`;
      results.filter(r => !r.success).forEach(result => {
        report += `  • ${result.service}: ${result.error}\n`;
      });
    }
    
    report += `\n📋 MANUAL SUBMISSION URLS:\n`;
    this.SEARCH_ENGINE_WEBMASTER_TOOLS.forEach(tool => {
      report += `  • ${tool.name}: ${tool.url}\n`;
    });
    
    return report;
  }

  static async autoSubmitSitemap(
    sitemapUrl: string, 
    options?: { 
      enableLogging?: boolean;
      webhookUrl?: string;
    }
  ): Promise<PingResult[]> {
    if (options?.enableLogging) {
      console.log(`🚀 Starting automatic sitemap submission for: ${sitemapUrl}`);
    }

    const results = await this.pingAllServices(sitemapUrl);
    const report = this.generateSubmissionReport(results);
    
    if (options?.enableLogging) {
      console.log(report);
    }

    // Optional webhook notification
    if (options?.webhookUrl) {
      try {
        await fetch(options.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'sitemap_submission',
            sitemapUrl,
            results,
            report,
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        console.warn('Failed to send webhook notification:', error);
      }
    }

    return results;
  }
}

// Export utility functions for easier usage
export const pingSearchEngines = SearchEnginePing.pingAllServices.bind(SearchEnginePing);
export const autoSubmitSitemap = SearchEnginePing.autoSubmitSitemap.bind(SearchEnginePing);
export const getWebmasterTools = SearchEnginePing.getWebmasterTools.bind(SearchEnginePing);
export const generateSubmissionReport = SearchEnginePing.generateSubmissionReport.bind(SearchEnginePing);
