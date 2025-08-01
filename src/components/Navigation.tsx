import React, { useState } from 'react';
import { TrendingUp, Menu, X, Home, Info, Mail, Shield, FileText, AlertTriangle, Map, RefreshCw } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onRefresh?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange, onRefresh }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'sitemap', label: 'Sitemap', icon: Map },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'disclaimer', label: 'Disclaimer', icon: AlertTriangle },
  ];

  const handlePageChange = (pageId: string) => {
    onPageChange(pageId);
    setIsMobileMenuOpen(false);
  };

  const handleHomeAndRefresh = () => {
    handlePageChange('home');
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleHomeAndRefresh}>
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CryptoAnalyzer Pro</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Multi-Exchange Technical Analysis Platform</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white ml-2 shadow-md"
              title="Refresh all data and reset analysis"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Scan Now Button */}
            <button
              onClick={() => {
                if (currentPage !== 'home') {
                  handlePageChange('home');
                  setTimeout(() => {
                    document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                } else {
                  document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all bg-gradient-to-r from-emerald-500 to-blue-600 text-white hover:from-emerald-600 hover:to-blue-700 ml-2 shadow-lg hover:shadow-emerald-500/25"
            >
              <TrendingUp className="w-4 h-4" />
              <span>SCAN NOW</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Status Indicator */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-emerald-400 font-medium">LIVE</span>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-800">
            <div className="py-4 space-y-1">
              {/* Mobile Refresh Button */}
              <button
                onClick={() => {
                  handleRefresh();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white font-medium shadow-md mb-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>REFRESH ALL DATA</span>
              </button>

              {/* Mobile Scan Button */}
              <button
                onClick={() => {
                  if (currentPage !== 'home') {
                    handlePageChange('home');
                    setTimeout(() => {
                      document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  } else {
                    document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all bg-gradient-to-r from-emerald-500 to-blue-600 text-white hover:from-emerald-600 hover:to-blue-700 font-bold shadow-lg mb-2"
              >
                <TrendingUp className="w-5 h-5" />
                <span>START SCANNING NOW</span>
              </button>

              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handlePageChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      currentPage === item.id
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
