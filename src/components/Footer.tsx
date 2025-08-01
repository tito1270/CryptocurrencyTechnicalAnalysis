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
          <div className="col-span-1 md:col-span-2">
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
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Platform Features</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Bitcoin & Ethereum Analysis</li>
              <li>• 25+ Technical Indicators</li>
              <li>• Multi-Exchange Support</li>
              <li>• Real-Time Price Data</li>
              <li>• Free Trading Signals</li>
              <li>• Cryptocurrency Scanner</li>
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

        {/* Disclaimer */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
            <p className="text-sm text-yellow-200">
              <strong>Risk Disclaimer:</strong> Cryptocurrency trading involves substantial risk and may not be suitable for all investors. 
              Past performance does not guarantee future results. CryptoAnalyzer Pro provides educational tools and analysis but does not 
              provide investment advice. Always conduct your own research and consult with financial advisors before making investment decisions.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
