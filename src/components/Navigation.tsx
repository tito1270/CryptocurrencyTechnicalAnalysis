import React, { useState } from 'react';
import { TrendingUp, Menu, X, Home, Info, Mail, Shield, FileText, AlertTriangle } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'disclaimer', label: 'Disclaimer', icon: AlertTriangle },
  ];

  const handlePageChange = (pageId: string) => {
    onPageChange(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handlePageChange('home')}>
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
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all bg-gradient-to-r from-emerald-500 to-blue-600 text-white hover:from-emerald-600 hover:to-blue-700 ml-4 shadow-lg hover:shadow-emerald-500/25"
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
