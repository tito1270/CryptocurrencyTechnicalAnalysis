#!/usr/bin/env node

/**
 * Deployment Automation Hooks for SEO and Search Engine Indexing
 * 
 * This script automatically handles:
 * 1. Sitemap generation and update
 * 2. Search engine ping submissions
 * 3. Deployment notifications
 * 4. SEO validation checks
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SITE_URL = process.env.SITE_URL || 'https://cryptoanalyzer-pro.com';
const DEPLOY_ENV = process.env.NODE_ENV || 'production';
const WEBHOOK_URL = process.env.SEO_WEBHOOK_URL;

// Configuration for different deployment environments
const CONFIG = {
  production: {
    enableSEO: true,
    enablePinging: true,
    enableValidation: true,
    sitemapPath: './public/sitemap.xml'
  },
  staging: {
    enableSEO: true,
    enablePinging: false,
    enableValidation: true,
    sitemapPath: './public/sitemap.xml'
  },
  development: {
    enableSEO: false,
    enablePinging: false,
    enableValidation: false,
    sitemapPath: './public/sitemap.xml'
  }
};

class DeploymentHooks {
  constructor() {
    this.config = CONFIG[DEPLOY_ENV];
    this.startTime = new Date();
    this.logMessages = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(logMessage);
    this.logMessages.push({ timestamp, type, message });
  }

  async preDeploy() {
    this.log('🚀 Starting pre-deployment hooks...', 'info');
    
    if (this.config.enableValidation) {
      await this.validateSEORequirements();
    }

    if (this.config.enableSEO) {
      await this.generateSitemap();
      await this.updateRobotsTxt();
    }

    this.log('✅ Pre-deployment hooks completed', 'success');
  }

  async postDeploy() {
    this.log('🎯 Starting post-deployment hooks...', 'info');
    
    if (this.config.enablePinging) {
      await this.pingSearchEngines();
    }

    await this.sendDeploymentNotification();
    await this.generateDeploymentReport();

    this.log('✅ Post-deployment hooks completed', 'success');
  }

  async validateSEORequirements() {
    this.log('🔍 Validating SEO requirements...', 'info');
    
    const requirements = [
      { file: './public/robots.txt', name: 'Robots.txt' },
      { file: './public/sitemap.xml', name: 'Sitemap.xml' },
      { file: './index.html', name: 'HTML meta tags' }
    ];

    for (const req of requirements) {
      if (fs.existsSync(req.file)) {
        this.log(`✓ ${req.name} found`, 'success');
      } else {
        this.log(`✗ ${req.name} missing`, 'error');
        throw new Error(`Required SEO file missing: ${req.file}`);
      }
    }
  }

  async generateSitemap() {
    this.log('📄 Generating updated sitemap...', 'info');
    
    try {
      // Import and use the sitemap generator
      const { generateSitemap } = await import('../src/utils/sitemapGenerator.ts');
      const sitemapContent = generateSitemap(SITE_URL);
      
      // Write to public directory
      fs.writeFileSync(this.config.sitemapPath, sitemapContent, 'utf8');
      this.log(`✓ Sitemap generated: ${this.config.sitemapPath}`, 'success');
      
      // Generate sitemap index if needed
      await this.generateSitemapIndex();
      
    } catch (error) {
      this.log(`✗ Sitemap generation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async generateSitemapIndex() {
    const sitemapIndexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;

    fs.writeFileSync('./public/sitemap-index.xml', sitemapIndexContent, 'utf8');
    this.log('✓ Sitemap index generated', 'success');
  }

  async updateRobotsTxt() {
    this.log('🤖 Updating robots.txt...', 'info');
    
    const robotsContent = `User-agent: *
Allow: /

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/sitemap-index.xml

# Crawl delay (optional, 1 second)
Crawl-delay: 1

# Allow access to all important pages
Allow: /
Allow: /about
Allow: /contact
Allow: /sitemap
Allow: /privacy
Allow: /terms
Allow: /disclaimer

# Block common bot traps and unnecessary files
Disallow: /api/
Disallow: /*.json$
Disallow: /node_modules/
Disallow: /src/
Disallow: /*.js$
Disallow: /*.css$
Disallow: /*.map$

# Allow search engine bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: YandexBot
Allow: /

User-agent: Baiduspider
Allow: /

# Last updated: ${new Date().toISOString()}
`;

    fs.writeFileSync('./public/robots.txt', robotsContent, 'utf8');
    this.log('✓ Robots.txt updated', 'success');
  }

  async pingSearchEngines() {
    this.log('📡 Pinging search engines...', 'info');
    
    try {
      const { autoSubmitSitemap } = await import('../src/utils/searchEnginePing.ts');
      const sitemapUrl = `${SITE_URL}/sitemap.xml`;
      
      const results = await autoSubmitSitemap(sitemapUrl, {
        enableLogging: true,
        webhookUrl: WEBHOOK_URL
      });
      
      const successful = results.filter(r => r.success).length;
      const total = results.length;
      
      this.log(`✓ Search engine pinging completed: ${successful}/${total} successful`, 'success');
      
      // Log individual results
      results.forEach(result => {
        const status = result.success ? '✓' : '✗';
        this.log(`  ${status} ${result.service}`, result.success ? 'success' : 'warning');
      });
      
    } catch (error) {
      this.log(`✗ Search engine pinging failed: ${error.message}`, 'error');
    }
  }

  async sendDeploymentNotification() {
    if (!WEBHOOK_URL) {
      this.log('⚠️ No webhook URL configured, skipping notification', 'warning');
      return;
    }

    this.log('📢 Sending deployment notification...', 'info');
    
    try {
      const notification = {
        type: 'deployment_complete',
        environment: DEPLOY_ENV,
        siteUrl: SITE_URL,
        timestamp: this.startTime.toISOString(),
        duration: Date.now() - this.startTime.getTime(),
        seoEnabled: this.config.enableSEO,
        pingingEnabled: this.config.enablePinging,
        logs: this.logMessages
      };

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      });

      if (response.ok) {
        this.log('✓ Deployment notification sent', 'success');
      } else {
        this.log(`✗ Notification failed: ${response.statusText}`, 'warning');
      }
    } catch (error) {
      this.log(`✗ Notification error: ${error.message}`, 'warning');
    }
  }

  async generateDeploymentReport() {
    const duration = Date.now() - this.startTime.getTime();
    const report = {
      deployment: {
        environment: DEPLOY_ENV,
        startTime: this.startTime.toISOString(),
        endTime: new Date().toISOString(),
        duration: `${Math.round(duration / 1000)}s`,
        siteUrl: SITE_URL
      },
      seo: {
        sitemapGenerated: this.config.enableSEO,
        robotsUpdated: this.config.enableSEO,
        searchEnginesPinged: this.config.enablePinging
      },
      logs: this.logMessages
    };

    // Save report to file
    const reportPath = `./deployment-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    
    this.log(`📋 Deployment report saved: ${reportPath}`, 'info');
    
    // Also output summary to console
    console.log('\n📊 DEPLOYMENT SUMMARY');
    console.log('========================');
    console.log(`Environment: ${DEPLOY_ENV}`);
    console.log(`Duration: ${Math.round(duration / 1000)}s`);
    console.log(`Site URL: ${SITE_URL}`);
    console.log(`SEO Enabled: ${this.config.enableSEO ? '✓' : '✗'}`);
    console.log(`Pinging Enabled: ${this.config.enablePinging ? '✓' : '✗'}`);
    console.log('========================\n');
  }
}

// CLI Interface
async function main() {
  const hooks = new DeploymentHooks();
  const command = process.argv[2];

  try {
    switch (command) {
      case 'pre-deploy':
        await hooks.preDeploy();
        break;
      case 'post-deploy':
        await hooks.postDeploy();
        break;
      case 'full-deploy':
        await hooks.preDeploy();
        await hooks.postDeploy();
        break;
      default:
        console.log('Usage: node deploy-hooks.js [pre-deploy|post-deploy|full-deploy]');
        console.log('');
        console.log('Environment variables:');
        console.log('  SITE_URL - Your website URL (default: https://cryptoanalyzer-pro.com)');
        console.log('  NODE_ENV - Deployment environment (production|staging|development)');
        console.log('  SEO_WEBHOOK_URL - Optional webhook for notifications');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Deployment hook failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { DeploymentHooks };
