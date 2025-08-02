import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import Disclaimer from './components/Disclaimer';
import Homepage from './components/Homepage';
import TradingControls from './components/TradingControls';
import AnalysisResults from './components/AnalysisResults';
import LivePrices from './components/LivePrices';
import CryptoNews from './components/CryptoNews';
import BulkScanner from './components/BulkScanner';
import Sitemap from './components/Sitemap';
import SEOHead from './components/SEOHead';
import SEOValidator from './components/SEOValidator';
import { AnalysisResult } from './types';
import { performAnalysis } from './utils/analysisEngine';
import { brokers } from './data/brokers';

// URL parameter hook for trading parameters
const useTradingParametersFromURL = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Utility functions for localStorage preferences
  const savePreferredBroker = (brokerId: string) => {
    try {
      localStorage.setItem('preferred_broker', brokerId);
    } catch (e) {
      console.warn('Failed to save broker preference:', e);
    }
  };
  
  const getPreferredBroker = (): string => {
    try {
      const saved = localStorage.getItem('preferred_broker');
      if (saved && brokers.find(b => b.id === saved)) {
        return saved;
      }
    } catch (e) {
      console.warn('Failed to load broker preference:', e);
    }
    return 'binance'; // Default fallback
  };
  
  const getPairFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get('pair') || 'BTC/USDT';
  };
  
  const getTimeframeFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get('timeframe') || '1h';
  };
  
  const getBrokerFromURL = () => {
    const params = new URLSearchParams(location.search);
    const brokerParam = params.get('broker');
    
    // If broker is specified in URL, validate it exists
    if (brokerParam) {
      const validBroker = brokers.find(b => b.id === brokerParam);
      if (validBroker) {
        // Save this as user's preference for future visits
        savePreferredBroker(brokerParam);
        return brokerParam;
      }
    }
    
    // Use user's saved preference or default to Binance
    return getPreferredBroker();
  };
  
  const getTradeTypeFromURL = () => {
    const params = new URLSearchParams(location.search);
    return (params.get('type') as 'SPOT' | 'FUTURES') || 'SPOT';
  };
  
  const updatePairInURL = (pair: string) => {
    const params = new URLSearchParams(location.search);
    params.set('pair', pair);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };
  
  const updateTimeframeInURL = (timeframe: string) => {
    const params = new URLSearchParams(location.search);
    params.set('timeframe', timeframe);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };
  
  return { 
    getPairFromURL, 
    getTimeframeFromURL,
    getBrokerFromURL,
    getTradeTypeFromURL,
    updatePairInURL,
    updateTimeframeInURL
  };
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([
    'rsi', 'macd', 'stochastic', 'bollinger', 'williams_r'
  ]);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([
    'golden_cross', 'breakout', 'momentum', 'support_resistance'
  ]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { 
    getPairFromURL, 
    getTimeframeFromURL,
    getBrokerFromURL,
    getTradeTypeFromURL,
    updatePairInURL,
    updateTimeframeInURL 
  } = useTradingParametersFromURL();
  
  const [selectedPair, setSelectedPair] = useState(getPairFromURL());
  const [selectedBroker, setSelectedBroker] = useState(getBrokerFromURL());
  const [selectedTimeframe, setSelectedTimeframe] = useState(getTimeframeFromURL());
  const [tradeType, setTradeType] = useState<'SPOT' | 'FUTURES'>(getTradeTypeFromURL());

  // Update parameters when URL changes
  useEffect(() => {
    const pairFromURL = getPairFromURL();
    const timeframeFromURL = getTimeframeFromURL();
    const brokerFromURL = getBrokerFromURL();
    const tradeTypeFromURL = getTradeTypeFromURL();
    
    if (pairFromURL !== selectedPair) {
      setSelectedPair(pairFromURL);
    }
    if (timeframeFromURL !== selectedTimeframe) {
      setSelectedTimeframe(timeframeFromURL);
    }
    if (brokerFromURL !== selectedBroker) {
      setSelectedBroker(brokerFromURL);
    }
    if (tradeTypeFromURL !== tradeType) {
      setTradeType(tradeTypeFromURL);
    }
  }, [getPairFromURL, getTimeframeFromURL, getBrokerFromURL, getTradeTypeFromURL]);

  const handleIndicatorToggle = (indicatorId: string) => {
    setSelectedIndicators(prev => 
      prev.includes(indicatorId) 
        ? prev.filter(id => id !== indicatorId)
        : [...prev, indicatorId]
    );
  };

  const handleStrategyToggle = (strategyId: string) => {
    setSelectedStrategies(prev => 
      prev.includes(strategyId) 
        ? prev.filter(id => id !== strategyId)
        : [...prev, strategyId]
    );
  };

  const handleBrokerChange = (brokerId: string) => {
    setSelectedBroker(brokerId);
    // Save user's broker preference
    try {
      localStorage.setItem('preferred_broker', brokerId);
    } catch (e) {
      console.warn('Failed to save broker preference:', e);
    }
  };

  const handlePairChange = (pair: string) => {
    setSelectedPair(pair);
    updatePairInURL(pair);
  };

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    updateTimeframeInURL(timeframe);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    try {
      const result = await performAnalysis(
        selectedPair,
        selectedBroker,
        selectedTimeframe,
        tradeType,
        selectedIndicators,
        selectedStrategies
      );
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefresh = () => {
    // Clear analysis result to reset scanned data
    setAnalysisResult(null);
    setIsAnalyzing(false);

    // Reset to default values
    setSelectedPair('BTC/USDT');
    handleBrokerChange('binance'); // Default to Binance and save preference
    setSelectedTimeframe('1h');
    setTradeType('SPOT');
    setSelectedIndicators([
      'rsi', 'macd', 'stochastic', 'bollinger', 'williams_r'
    ]);
    setSelectedStrategies([
      'golden_cross', 'breakout', 'momentum', 'support_resistance'
    ]);

    // Clear URL parameters
    if (navigate && location) {
      const params = new URLSearchParams(location.search);
      params.delete('pair');
      navigate(`${location.pathname}`, { replace: true });
    }
  };

  // SEO data for each page - Google compliant with proper length limits
  const getSEOData = () => {
    switch (currentPage) {
      case 'about':
        return {
          title: 'About CryptoAnalyzer Pro - Professional Crypto Analysis Platform',
          description: 'Learn about CryptoAnalyzer Pro, the leading cryptocurrency technical analysis platform. Discover our advanced features and commitment to providing free trading tools.',
          keywords: ['about crypto analyzer', 'cryptocurrency platform', 'trading tools company', 'bitcoin analysis platform', 'ethereum technical analysis', 'professional crypto tools', 'trading platform features']
        };
      case 'contact':
        return {
          title: 'Contact CryptoAnalyzer Pro - Support & Technical Help',
          description: 'Get professional support for CryptoAnalyzer Pro. Contact our technical team for help with cryptocurrency analysis, trading tools, and platform features.',
          keywords: ['crypto support', 'technical support', 'platform help', 'cryptocurrency assistance', 'trading support', 'crypto analyzer contact', 'bitcoin analysis help']
        };
      case 'privacy':
        return {
          title: 'Privacy Policy - CryptoAnalyzer Pro Data Protection',
          description: 'CryptoAnalyzer Pro privacy policy explaining data protection practices for cryptocurrency trading platform. GDPR compliant with transparent data handling.',
          keywords: ['privacy policy', 'data protection', 'crypto privacy', 'trading data security', 'GDPR compliance', 'cryptocurrency privacy', 'platform security']
        };
      case 'terms':
        return {
          title: 'Terms of Service - CryptoAnalyzer Pro Platform Usage',
          description: 'Terms and conditions for using CryptoAnalyzer Pro cryptocurrency analysis platform. Legal framework for trading tools, signals, and platform features.',
          keywords: ['terms of service', 'platform terms', 'crypto terms', 'trading platform legal', 'cryptocurrency analysis terms', 'usage agreement', 'legal framework']
        };
      case 'disclaimer':
        return {
          title: 'Trading Disclaimer - CryptoAnalyzer Pro Risk Warning',
          description: 'Important risk disclaimers for cryptocurrency trading. Understand Bitcoin, Ethereum trading risks, market volatility warnings before using analysis tools.',
          keywords: ['trading disclaimer', 'crypto risk warning', 'investment risks', 'cryptocurrency disclaimer', 'trading risks', 'market volatility', 'investment warning']
        };
      case 'sitemap':
        return {
          title: 'Sitemap - CryptoAnalyzer Pro Complete Navigation Guide',
          description: 'Complete sitemap for CryptoAnalyzer Pro cryptocurrency platform. Navigate all Bitcoin analysis tools, Ethereum trading features, and crypto scanners.',
          keywords: ['crypto sitemap', 'platform navigation', 'crypto tools directory', 'bitcoin analysis sitemap', 'ethereum trading sitemap', 'cryptocurrency navigation']
        };
      default:
        return {
          title: 'Free Crypto Analysis - CryptoAnalyzer Pro | Bitcoin & Ethereum',
          description: 'Professional cryptocurrency technical analysis platform. Analyze Bitcoin, Ethereum & 1000+ crypto pairs with 25+ indicators across 15+ exchanges. Free forever.',
          keywords: ['cryptocurrency analysis', 'bitcoin analysis', 'ethereum trading', 'crypto scanner', 'free crypto tools', 'technical indicators', 'trading signals', 'blockchain analysis']
        };
    }
  };

  const seoData = getSEOData();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'about':
        return <AboutUs />;
      case 'contact':
        return <ContactUs />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'terms':
        return <TermsOfService />;
      case 'disclaimer':
        return <Disclaimer />;
      case 'sitemap':
        return <Sitemap onPageChange={setCurrentPage} />;
      default:
        return (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* SEO Homepage Content */}
            <div className="mb-12">
              <Homepage />
            </div>

            {/* Trading Analysis Section */}
            <div id="scan-section" className="border-t border-gray-700 pt-12 scroll-mt-20">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Start Your Free Cryptocurrency Analysis
                </h2>
                <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                  Select your cryptocurrency pair, choose your preferred exchange, and configure technical indicators
                  to receive professional-grade market analysis instantly. No registration required.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Controls */}
                <div className="lg:col-span-1 space-y-6">
                  <TradingControls
                    selectedBroker={selectedBroker}
                    selectedPair={selectedPair}
                    selectedTimeframe={selectedTimeframe}
                    tradeType={tradeType}
                    selectedIndicators={selectedIndicators}
                    selectedStrategies={selectedStrategies}
                    onBrokerChange={handleBrokerChange}
                    onPairChange={handlePairChange}
                    onTimeframeChange={handleTimeframeChange}
                    onTradeTypeChange={setTradeType}
                    onIndicatorToggle={handleIndicatorToggle}
                    onStrategyToggle={handleStrategyToggle}
                    onAnalyze={handleAnalyze}
                  />

                  <div id="crypto-news">
                    <CryptoNews />
                  </div>
                </div>

                {/* Right Column - Results and Data */}
                <div className="lg:col-span-2 space-y-6">
                  {isAnalyzing && (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
                      <div className="text-white font-medium">Analyzing Market Data...</div>
                      <div className="text-sm text-gray-400 mt-2">
                        Processing {selectedIndicators.length} indicators and {selectedStrategies.length} strategies
                      </div>
                    </div>
                  )}

                  {analysisResult && !isAnalyzing && (
                    <AnalysisResults result={analysisResult} />
                  )}

                  {!analysisResult && !isAnalyzing && (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                      <div className="text-gray-400 text-lg mb-2">Ready for Market Analysis</div>
                      <div className="text-sm text-gray-500">
                        Configure your settings and click "Analyze Market" to get started with your free cryptocurrency technical analysis
                      </div>
                    </div>
                  )}

                  <div id="live-prices">
                    <LivePrices selectedPair={selectedPair} selectedBroker={selectedBroker} />
                  </div>
                </div>
              </div>

              {/* Bulk Scanner Section */}
              <div id="bulk-scanner" className="border-t border-gray-700 pt-12 mt-12 scroll-mt-20">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Advanced Bulk Market Scanner
                  </h2>
                  <p className="text-lg text-gray-300 max-w-4xl mx-auto">
                    Scan multiple cryptocurrency pairs simultaneously with advanced filtering options. Get comprehensive
                    technical analysis with news integration for hundreds of pairs in organized batches of 100.
                  </p>
                </div>

                <BulkScanner
                  selectedBroker={selectedBroker}
                  selectedTimeframe={selectedTimeframe}
                  tradeType={tradeType}
                  selectedIndicators={selectedIndicators}
                  selectedStrategies={selectedStrategies}
                />
              </div>
            </div>
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        page={currentPage}
        enableOptimization={true}
      />
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} onRefresh={handleRefresh} />
      {renderCurrentPage()}
      <Footer onPageChange={setCurrentPage} />
      <SEOValidator currentPage={currentPage} enabled={true} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
