import React from 'react';
import { Mail, Phone, MapPin, Shield, FileText, Info, Home, Newspaper, TrendingUp } from 'lucide-react';

interface FooterProps {
  onPageChange: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onPageChange }) => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">CryptoAnalyzer Pro</h3>
                <p className="text-sm text-gray-400">Professional Crypto Trading Platform</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              <strong>Free cryptocurrency technical analysis platform</strong> providing real-time Bitcoin, Ethereum, and altcoin market data
              across 12+ exchanges. Professional trading signals, advanced technical indicators, and comprehensive crypto analysis tools
              for both new and experienced cryptocurrency traders. Always free, no subscriptions required.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>© 2024 CryptoAnalyzer Pro</span>
              <span>•</span>
              <span>All rights reserved</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => onPageChange('home')}
                  className="text-gray-300 hover:text-emerald-400 transition-colors flex items-center space-x-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onPageChange('about')}
                  className="text-gray-300 hover:text-emerald-400 transition-colors flex items-center space-x-2"
                >
                  <Info className="w-4 h-4" />
                  <span>About Us</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onPageChange('home')}
                  className="text-gray-300 hover:text-emerald-400 transition-colors flex items-center space-x-2"
                >
                  <Newspaper className="w-4 h-4" />
                  <span>Crypto News</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onPageChange('contact')}
                  className="text-gray-300 hover:text-emerald-400 transition-colors flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact Us</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onPageChange('sitemap')}
                  className="text-gray-300 hover:text-emerald-400 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Sitemap</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Trading Tools */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Crypto Trading Tools</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    onPageChange('home');
                    setTimeout(() => {
                      document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-sm"
                >
                  • Bitcoin Technical Analysis
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onPageChange('home');
                    setTimeout(() => {
                      document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-sm"
                >
                  • Ethereum Trading Signals
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onPageChange('home');
                    setTimeout(() => {
                      document.getElementById('bulk-scanner')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-sm"
                >
                  • Bulk Crypto Scanner
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onPageChange('home');
                    setTimeout(() => {
                      document.getElementById('crypto-news')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-sm"
                >
                  • Crypto News Analysis
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onPageChange('home');
                    setTimeout(() => {
                      document.getElementById('live-prices')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-sm"
                >
                  • Live Crypto Prices
                </button>
              </li>
              <li className="text-gray-300 text-sm">• 25+ Technical Indicators</li>
            </ul>
          </div>

          {/* Crypto Categories */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Cryptocurrency Analysis</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Bitcoin (BTC) Analysis</li>
              <li>• Ethereum (ETH) Trading</li>
              <li>• DeFi Token Scanner</li>
              <li>• Meme Coin Analysis</li>
              <li>• Layer 2 Tokens</li>
              <li>• AI Cryptocurrency</li>
              <li>• Gaming Token Analysis</li>
              <li>• Stablecoin Monitoring</li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Legal & Support</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => onPageChange('privacy')}
                  className="text-gray-300 hover:text-emerald-400 transition-colors flex items-center space-x-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onPageChange('terms')}
                  className="text-gray-300 hover:text-emerald-400 transition-colors flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Terms of Service</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onPageChange('disclaimer')}
                  className="text-gray-300 hover:text-emerald-400 transition-colors flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Disclaimer</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Exchanges Sitemap */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Major Exchanges</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Binance Analysis</li>
                <li>• Coinbase Pro Trading</li>
                <li>• Kraken Technical Analysis</li>
                <li>• KuCoin Scanner</li>
                <li>• Huobi Trading Signals</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Trading Pairs</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• BTC/USDT Analysis</li>
                <li>• ETH/USDT Trading</li>
                <li>• BNB/USDT Signals</li>
                <li>• SOL/USDT Scanner</li>
                <li>• ADA/USDT Analysis</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Market Data</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Real-Time Crypto Prices</li>
                <li>• Market Cap Rankings</li>
                <li>• Volume Analysis</li>
                <li>• Price Alerts</li>
                <li>• Market Sentiment</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => onPageChange('sitemap')}
                    className="text-gray-300 hover:text-emerald-400 transition-colors text-sm"
                  >
                    • Complete Sitemap
                  </button>
                </li>
                <li className="text-gray-300 text-sm">• Trading Education</li>
                <li className="text-gray-300 text-sm">• API Documentation</li>
                <li className="text-gray-300 text-sm">• Platform Updates</li>
                <li className="text-gray-300 text-sm">• Security Features</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Scan CTA */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="text-center mb-6">
            <button
              onClick={() => {
                window.location.href = '/#scan-section';
                setTimeout(() => {
                  document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-xl hover:shadow-emerald-500/25"
            >
              <TrendingUp className="w-6 h-6" />
              <span>START FREE ANALYSIS NOW</span>
            </button>
            <p className="text-sm text-gray-400 mt-2">Quick access to cryptocurrency scanning tools</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>support@cryptoanalyzer.pro</span>
            </div>
            <div className="flex items-center space-x-2">
            </div>
            <div className="flex items-center space-x-2">
            </div>
          </div>
        </div>

        {/* SEO Keywords & Disclaimer */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <h5 className="text-sm font-semibold text-gray-300 mb-2">Keywords & Topics Covered:</h5>
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong>Cryptocurrency Analysis:</strong> Bitcoin analysis, Ethereum trading, crypto technical indicators, trading signals, market analysis,
              cryptocurrency scanner, DeFi analysis, meme coin trading, altcoin analysis, blockchain analysis, crypto news sentiment,
              real-time crypto prices, multi-exchange trading, crypto portfolio tracking, cryptocurrency market data,
              trading strategies, risk management, crypto volatility analysis, market trends, digital asset analysis.
            </p>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
            <p className="text-sm text-yellow-200">
              <strong>Risk Disclaimer:</strong> <strong>Cryptocurrency trading</strong> involves substantial risk and may not be suitable for all investors.
              Past performance does not guarantee future results. <strong>CryptoAnalyzer Pro</strong> provides educational tools and <strong>market analysis</strong> but does not
              provide investment advice. Always conduct your own research and consult with financial advisors before making <strong>cryptocurrency investment</strong> decisions.
              Our <strong>Bitcoin analysis</strong>, <strong>Ethereum trading signals</strong>, and other crypto tools are for educational purposes only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
