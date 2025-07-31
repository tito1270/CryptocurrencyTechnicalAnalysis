import React from 'react';
import { TrendingUp, BarChart3, Globe } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CryptoAnalyzer Pro</h1>
              <p className="text-xs text-gray-400">Multi-Exchange Technical Analysis Platform</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Globe className="w-4 h-4" />
              <span>12+ Exchanges</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <BarChart3 className="w-4 h-4" />
              <span>25+ Indicators</span>
            </div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-emerald-400 font-medium">LIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;