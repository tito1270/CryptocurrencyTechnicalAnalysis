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
    return params.get('timeframe') || '1d';
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
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
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

    // Validate if current pair is available in the new broker for the current trade type
    const newBroker = brokers.find(b => b.id === brokerId);
    if (newBroker) {
      const availablePairs = tradeType === 'FUTURES' 
        ? (newBroker.futuresPairs || [])
        : newBroker.pairs;
      
      // If current pair is not available in the new broker, reset to first available pair
      if (!availablePairs.includes(selectedPair)) {
        const newPair = availablePairs.length > 0 ? availablePairs[0] : 'BTC/USDT';
        setSelectedPair(newPair);
        updatePairInURL(newPair);
      }
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

  const handleTradeTypeChange = (newTradeType: 'SPOT' | 'FUTURES') => {
    setTradeType(newTradeType);
    
    // Validate if current pair is available in the new trade type
    const currentBroker = brokers.find(b => b.id === selectedBroker);
    if (currentBroker) {
      const availablePairs = newTradeType === 'FUTURES' 
        ? (currentBroker.futuresPairs || [])
        : currentBroker.pairs;
      
      // If current pair is not available in the new trade type, reset to first available pair
      if (!availablePairs.includes(selectedPair)) {
        const newPair = availablePairs.length > 0 ? availablePairs[0] : 'BTC/USDT';
        setSelectedPair(newPair);
        updatePairInURL(newPair);
      }
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null); // Clear any previous errors

    try {
      // Validate inputs before proceeding
      if (!selectedPair || selectedIndicators.length === 0) {
        throw new Error('Please select a trading pair and at least one technical indicator.');
      }

      const result = await performAnalysis(
        selectedPair,
        selectedBroker,
        selectedTimeframe,
        tradeType,
        selectedIndicators,
        selectedStrategies
      );
      
      if (!result) {
        throw new Error('Analysis failed to produce results. Please try again.');
      }

      setAnalysisResult(result);
      
      // Scroll to results section after analysis is complete
      setTimeout(() => {
        const resultsSection = document.getElementById('analysis-results');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed. Please check your internet connection and try again.';
      setAnalysisError(errorMessage);
      
      // Scroll to show the error message
      setTimeout(() => {
        const resultsSection = document.getElementById('analysis-results');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefresh = () => {
    // Clear analysis result to reset scanned data
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setAnalysisError(null);

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
                    onTradeTypeChange={handleTradeTypeChange}
                    onIndicatorToggle={handleIndicatorToggle}
                    onStrategyToggle={handleStrategyToggle}
                    onAnalyze={handleAnalyze}
                    isAnalyzing={isAnalyzing}
                  />

                  <div id="crypto-news">
                    <CryptoNews />
                  </div>
                </div>

                {/* Right Column - Results and Data */}
                <div id="analysis-results" className="lg:col-span-2 space-y-6">
                  {isAnalyzing && (
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-emerald-500/30 rounded-lg p-8 text-center shadow-lg">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-6"></div>
                      <div className="text-white font-bold text-xl mb-2">🔍 Scanning {selectedPair}</div>
                      <div className="text-emerald-400 font-medium mb-4">Analyzing Market Data...</div>
                      <div className="text-sm text-gray-400 mb-4">
                        • Processing {selectedIndicators.length} technical indicators<br/>
                        • Applying {selectedStrategies.length} trading strategies<br/>
                        • Fetching live price data from {selectedBroker.toUpperCase()}<br/>
                        • Analyzing news sentiment and market patterns
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        This usually takes 5-15 seconds...
                      </div>
                    </div>
                  )}

                  {analysisResult && !isAnalyzing && !analysisError && (
                    <AnalysisResults result={analysisResult} />
                  )}

                  {analysisError && !isAnalyzing && (
                    <div className="bg-red-900/20 border border-red-700 rounded-lg p-8 text-center">
                      <div className="text-red-400 text-lg mb-2">❌ Analysis Failed</div>
                      <div className="text-sm text-red-300 mb-4">
                        {analysisError}
                      </div>
                      <button
                        onClick={() => {
                          setAnalysisError(null);
                          handleAnalyze();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
                      >
                        🔄 Try Again
                      </button>
                    </div>
                  )}

                  {!analysisResult && !isAnalyzing && !analysisError && (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                      <div className="text-gray-400 text-lg mb-2">📊 Ready for Market Analysis</div>
                      <div className="text-sm text-gray-500">
                        Configure your settings in the left panel and click "🚀 Analyze Market & Get Recommendation" to get started with your free cryptocurrency technical analysis. Results will appear here.
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
