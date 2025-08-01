import React from 'react';
import { Home, Info, Mail, Shield, FileText, AlertTriangle, TrendingUp, Search, Newspaper, BarChart3, Zap } from 'lucide-react';
import SEOManager from './SEOManager';

interface SitemapProps {
  onPageChange: (page: string) => void;
}

const Sitemap: React.FC<SitemapProps> = ({ onPageChange }) => {
  const sitemapData = [
    {
      section: 'Main Pages',
      icon: Home,
      links: [
        { 
          id: 'home', 
          title: 'Home - Free Cryptocurrency Technical Analysis', 
          description: 'Main platform with crypto scanning tools, technical indicators, and market analysis',
          keywords: 'cryptocurrency analysis, bitcoin analysis, crypto scanner, trading platform'
        },
        { 
          id: 'about', 
          title: 'About Us - CryptoAnalyzer Pro', 
          description: 'Learn about our mission, features, and commitment to crypto traders',
          keywords: 'about crypto analyzer, trading platform history, crypto tools company'
        },
        { 
          id: 'contact', 
          title: 'Contact Us - Support & Inquiries', 
          description: 'Get in touch with our support team and technical assistance',
          keywords: 'crypto support, technical support, contact crypto analyzer, trading help'
        }
      ]
    },
    {
      section: 'Trading Tools',
      icon: TrendingUp,
      links: [
        {
          id: 'home',
          anchor: 'scan-section',
          title: 'Cryptocurrency Scanner - Free Technical Analysis',
          description: 'Real-time crypto analysis with 25+ indicators across 15+ exchanges',
          keywords: 'crypto scanner, bitcoin scanner, ethereum analysis, technical indicators, trading signals'
        },
        {
          id: 'home',
          anchor: 'bulk-scanner',
          title: 'Bulk Market Scanner - Batch Analysis Tool',
          description: 'Scan multiple crypto pairs simultaneously with advanced filtering',
          keywords: 'bulk crypto scanner, batch analysis, multi-pair scanning, crypto screening tool'
        }
      ]
    },
    {
      section: 'Market Data',
      icon: BarChart3,
      links: [
        {
          id: 'home',
          anchor: 'live-prices',
          title: 'Live Cryptocurrency Prices',
          description: 'Real-time crypto prices from multiple exchanges',
          keywords: 'live crypto prices, bitcoin price, ethereum price, real-time cryptocurrency data'
        },
        {
          id: 'home',
          anchor: 'crypto-news',
          title: 'Cryptocurrency News & Analysis',
          description: 'Latest crypto news with sentiment analysis and market impact',
          keywords: 'crypto news, bitcoin news, ethereum news, cryptocurrency market news, trading news'
        }
      ]
    },
    {
      section: 'Exchange Coverage',
      icon: Zap,
      links: [
        {
          id: 'binance',
          title: 'Binance Analysis - 10,000+ Trading Pairs',
          description: 'Technical analysis for all Binance trading pairs including BTC, ETH, BNB',
          keywords: 'binance analysis, binance trading pairs, BNB analysis, binance technical indicators'
        },
        {
          id: 'coinbase',
          title: 'Coinbase Pro Analysis - Major Cryptocurrencies',
          description: 'Professional analysis for Coinbase Pro supported cryptocurrencies',
          keywords: 'coinbase analysis, coinbase pro trading, bitcoin coinbase, ethereum coinbase'
        },
        {
          id: 'kraken',
          title: 'Kraken Exchange Analysis - Advanced Trading',
          description: 'Technical analysis for Kraken trading pairs with professional tools',
          keywords: 'kraken analysis, kraken trading, kraken technical analysis, advanced crypto trading'
        }
      ]
    },
    {
      section: 'Cryptocurrency Categories',
      icon: Search,
      links: [
        {
          id: 'bitcoin-analysis',
          title: 'Bitcoin (BTC) Technical Analysis',
          description: 'Professional Bitcoin analysis with price predictions and trading signals',
          keywords: 'bitcoin analysis, BTC technical analysis, bitcoin price prediction, bitcoin trading'
        },
        {
          id: 'ethereum-analysis',
          title: 'Ethereum (ETH) Technical Analysis',
          description: 'Comprehensive Ethereum analysis with smart contract insights',
          keywords: 'ethereum analysis, ETH technical analysis, ethereum price prediction, ethereum trading'
        },
        {
          id: 'defi-analysis',
          title: 'DeFi Tokens Analysis - UNI, AAVE, COMP',
          description: 'Technical analysis for decentralized finance tokens and protocols',
          keywords: 'DeFi analysis, UNI analysis, AAVE analysis, decentralized finance trading'
        },
        {
          id: 'meme-analysis',
          title: 'Meme Coins Analysis - DOGE, SHIB, PEPE',
          description: 'Analysis of popular meme cryptocurrencies with sentiment tracking',
          keywords: 'meme coin analysis, DOGE analysis, SHIB analysis, meme crypto trading'
        }
      ]
    },
    {
      section: 'Legal & Compliance',
      icon: Shield,
      links: [
        { 
          id: 'privacy', 
          title: 'Privacy Policy - Data Protection', 
          description: 'Our commitment to protecting your personal data and trading information',
          keywords: 'privacy policy, data protection, crypto privacy, trading data security'
        },
        { 
          id: 'terms', 
          title: 'Terms of Service - Platform Usage', 
          description: 'Terms and conditions for using CryptoAnalyzer Pro platform',
          keywords: 'terms of service, platform terms, crypto platform usage, trading terms'
        },
        { 
          id: 'disclaimer', 
          title: 'Trading Disclaimer - Risk Warning', 
          description: 'Important risk disclaimers and trading warnings for cryptocurrency investing',
          keywords: 'trading disclaimer, crypto risk warning, investment disclaimer, trading risks'
        }
      ]
    }
  ];

  const handleLinkClick = (linkData: any) => {
    if (linkData.anchor) {
      // Navigate to home page first, then scroll to anchor
      onPageChange('home');
      setTimeout(() => {
        const element = document.getElementById(linkData.anchor);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      onPageChange(linkData.id);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg mx-auto mb-6">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">CryptoAnalyzer Pro Sitemap</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
            Complete navigation guide to all cryptocurrency analysis tools, trading features, and platform sections
          </p>
          <div className="text-sm text-gray-400">
            <strong>Keywords:</strong> cryptocurrency sitemap, crypto trading platform, bitcoin analysis tools, 
            ethereum technical indicators, trading platform navigation, crypto scanner sitemap, blockchain analysis tools
          </div>
        </div>

        {/* Sitemap Sections */}
        <div className="space-y-12">
          {sitemapData.map((section, sectionIndex) => {
            const SectionIcon = section.icon;
            return (
              <div key={sectionIndex} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 p-6 border-b border-gray-700">
                  <h2 className="text-2xl font-semibold text-white flex items-center">
                    <SectionIcon className="w-8 h-8 text-emerald-400 mr-3" />
                    {section.section}
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.links.map((link, linkIndex) => (
                      <div key={linkIndex} className="bg-gray-700 rounded-lg p-5 hover:bg-gray-600 transition-colors">
                        <button
                          onClick={() => handleLinkClick(link)}
                          className="w-full text-left group"
                        >
                          <h3 className="text-lg font-semibold text-emerald-400 group-hover:text-emerald-300 mb-2 line-clamp-2">
                            {link.title}
                          </h3>
                          <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                            {link.description}
                          </p>
                          <div className="text-xs text-gray-400">
                            <strong>Keywords:</strong> {link.keywords}
                          </div>
                          {link.anchor && (
                            <div className="text-xs text-blue-400 mt-2">
                              <strong>Section:</strong> #{link.anchor}
                            </div>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Navigation */}
        <div className="mt-16 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-lg p-8 border border-emerald-500/30">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <button
              onClick={() => onPageChange('home')}
              className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Home className="w-6 h-6 text-emerald-400 mb-2" />
              <span className="text-sm text-white">Home</span>
            </button>
            <button
              onClick={() => {
                onPageChange('home');
                setTimeout(() => {
                  document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Search className="w-6 h-6 text-blue-400 mb-2" />
              <span className="text-sm text-white">Scanner</span>
            </button>
            <button
              onClick={() => {
                onPageChange('home');
                setTimeout(() => {
                  document.getElementById('bulk-scanner')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <BarChart3 className="w-6 h-6 text-purple-400 mb-2" />
              <span className="text-sm text-white">Bulk Scan</span>
            </button>
            <button
              onClick={() => {
                onPageChange('home');
                setTimeout(() => {
                  document.getElementById('crypto-news')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Newspaper className="w-6 h-6 text-yellow-400 mb-2" />
              <span className="text-sm text-white">News</span>
            </button>
            <button
              onClick={() => onPageChange('about')}
              className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Info className="w-6 h-6 text-cyan-400 mb-2" />
              <span className="text-sm text-white">About</span>
            </button>
            <button
              onClick={() => onPageChange('contact')}
              className="flex flex-col items-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Mail className="w-6 h-6 text-red-400 mb-2" />
              <span className="text-sm text-white">Contact</span>
            </button>
          </div>
        </div>

        {/* XML Sitemap Info */}
        <div className="mt-12 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">SEO & XML Sitemap Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-emerald-400 mb-2">Page Frequency</h4>
              <ul className="space-y-1">
                <li>• Home & Scanner: Daily updates</li>
                <li>• Market Data: Hourly updates</li>
                <li>• News Section: Real-time updates</li>
                <li>• Static Pages: Monthly updates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-emerald-400 mb-2">Priority Levels</h4>
              <ul className="space-y-1">
                <li>• Scanner Tools: Priority 1.0</li>
                <li>• Home Page: Priority 0.9</li>
                <li>• Trading Features: Priority 0.8</li>
                <li>• Information Pages: Priority 0.6</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button
            onClick={() => {
              onPageChange('home');
              setTimeout(() => {
                document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-bold text-lg rounded-xl hover:from-emerald-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-xl"
          >
            <TrendingUp className="w-6 h-6" />
            <span>START CRYPTO ANALYSIS NOW</span>
          </button>
          <p className="text-sm text-gray-400 mt-3">Access all cryptocurrency analysis tools from this comprehensive sitemap</p>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
