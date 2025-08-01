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
import { AnalysisResult } from './types';
import { performAnalysis } from './utils/analysisEngine';
import { brokers } from './data/brokers';

// URL parameter hook for trading pair
const useTradingPairFromURL = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const getPairFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get('pair') || 'BTC/USDT';
  };
  
  const updatePairInURL = (pair: string) => {
    const params = new URLSearchParams(location.search);
    params.set('pair', pair);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };
  
  return { getPairFromURL, updatePairInURL };
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedBroker, setSelectedBroker] = useState(brokers[0].id);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [tradeType, setTradeType] = useState<'SPOT' | 'FUTURES'>('SPOT');
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([
    'rsi', 'macd', 'stochastic', 'bollinger', 'williams_r'
  ]);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([
    'golden_cross', 'breakout', 'momentum', 'support_resistance'
  ]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { getPairFromURL, updatePairInURL } = useTradingPairFromURL();
  const [selectedPair, setSelectedPair] = useState(getPairFromURL());

  // Update selected pair when URL changes
  useEffect(() => {
    const pairFromURL = getPairFromURL();
    if (pairFromURL !== selectedPair) {
      setSelectedPair(pairFromURL);
    }
  }, [getPairFromURL]);

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

  const handlePairChange = (pair: string) => {
    setSelectedPair(pair);
    updatePairInURL(pair);
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

  // SEO data for each page
  const getSEOData = () => {
    switch (currentPage) {
      case 'about':
        return {
          title: 'About CryptoAnalyzer Pro - Professional Cryptocurrency Analysis Platform | Free Trading Tools',
          description: 'Learn about CryptoAnalyzer Pro, the leading cryptocurrency technical analysis platform. Discover our mission, advanced features, and commitment to providing free professional-grade trading tools for Bitcoin, Ethereum, and 1000+ cryptocurrencies.',
          keywords: 'about crypto analyzer, cryptocurrency platform history, trading tools company, bitcoin analysis platform, ethereum technical analysis, crypto trading mission, professional crypto tools, cryptocurrency analysis company, trading platform features, crypto market analysis tools',
          structuredData: {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About CryptoAnalyzer Pro",
            "description": "Professional cryptocurrency analysis platform providing free trading tools and market analysis"
          }
        };
      case 'contact':
        return {
          title: 'Contact CryptoAnalyzer Pro - Support & Technical Assistance | Crypto Trading Help',
          description: 'Get professional support for CryptoAnalyzer Pro. Contact our technical team for help with cryptocurrency analysis, trading tools, platform features, and technical indicators. Fast response guaranteed.',
          keywords: 'crypto support, cryptocurrency platform support, bitcoin analysis help, ethereum trading assistance, technical indicator support, crypto scanner help, trading platform contact, cryptocurrency tool support, crypto analysis assistance, trading signal support',
          structuredData: {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact CryptoAnalyzer Pro",
            "description": "Professional support for cryptocurrency trading platform"
          }
        };
      case 'privacy':
        return {
          title: 'Privacy Policy - CryptoAnalyzer Pro Data Protection | Cryptocurrency Trading Privacy',
          description: 'CryptoAnalyzer Pro privacy policy explaining how we protect your cryptocurrency trading data, personal information, and platform usage. GDPR compliant with transparent data practices.',
          keywords: 'crypto privacy policy, cryptocurrency data protection, trading data privacy, crypto platform security, GDPR compliance crypto, bitcoin trading privacy, ethereum analysis privacy, crypto tool data protection, trading signal privacy',
          structuredData: {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Privacy Policy",
            "description": "Data protection and privacy policy for cryptocurrency trading platform"
          }
        };
      case 'terms':
        return {
          title: 'Terms of Service - CryptoAnalyzer Pro Platform Usage | Cryptocurrency Trading Terms',
          description: 'Terms and conditions for using CryptoAnalyzer Pro cryptocurrency analysis platform. Legal framework for Bitcoin, Ethereum analysis tools, trading signals, and platform features.',
          keywords: 'crypto terms of service, cryptocurrency platform terms, bitcoin analysis terms, ethereum trading terms, crypto tool usage terms, trading platform legal, cryptocurrency analysis legal, trading signal terms',
          structuredData: {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Terms of Service",
            "description": "Terms and conditions for cryptocurrency trading platform usage"
          }
        };
      case 'disclaimer':
        return {
          title: 'Trading Disclaimer - CryptoAnalyzer Pro Risk Warning | Cryptocurrency Investment Risks',
          description: 'Important risk disclaimers for cryptocurrency trading using CryptoAnalyzer Pro. Understand Bitcoin, Ethereum trading risks, market volatility, and investment warnings before using our analysis tools.',
          keywords: 'crypto trading disclaimer, cryptocurrency risk warning, bitcoin trading risks, ethereum investment risks, crypto market volatility, trading signal disclaimer, cryptocurrency analysis risks, crypto investment warning',
          structuredData: {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Trading Disclaimer",
            "description": "Risk warnings and disclaimers for cryptocurrency trading platform"
          }
        };
      case 'sitemap':
        return {
          title: 'Sitemap - CryptoAnalyzer Pro Navigation | All Cryptocurrency Analysis Tools & Pages',
          description: 'Complete sitemap for CryptoAnalyzer Pro cryptocurrency platform. Navigate all Bitcoin analysis tools, Ethereum trading features, crypto scanners, market data, and platform sections easily.',
          keywords: 'crypto platform sitemap, cryptocurrency analysis navigation, bitcoin tool sitemap, ethereum analysis sitemap, crypto scanner navigation, trading platform map, cryptocurrency tool directory, crypto analysis sections',
          structuredData: {
            "@context": "https://schema.org",
            "@type": "SiteNavigationElement",
            "name": "CryptoAnalyzer Pro Sitemap",
            "description": "Complete navigation for cryptocurrency analysis platform"
          }
        };
      default:
        return {
          title: 'Free Cryptocurrency Technical Analysis Tool - CryptoAnalyzer Pro | Bitcoin, Ethereum Trading Platform',
          description: 'Professional cryptocurrency technical analysis platform for traders. Analyze Bitcoin, Ethereum, and 1000+ crypto pairs across 15+ exchanges with 25+ indicators. Free forever for beginners and professionals. Real-time market analysis, trading signals, and comprehensive crypto scanning tools.',
          keywords: 'cryptocurrency technical analysis, crypto trading platform, bitcoin analysis, ethereum technical indicators, free crypto scanner, multi-exchange trading, cryptocurrency signals, crypto market analysis, trading indicators, blockchain analysis, DeFi tokens, altcoin scanner, crypto charts, technical analysis tools, cryptocurrency trading strategies, free crypto tools, bitcoin price prediction, crypto portfolio tracker, trading bot signals, cryptocurrency trends, bulk crypto scanner, crypto news analysis, real-time crypto data',
          structuredData: {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "CryptoAnalyzer Pro",
            "description": "Professional cryptocurrency technical analysis platform for traders",
            "url": "https://cryptoanalyzer-pro.com",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Multi-exchange cryptocurrency analysis",
              "25+ technical indicators",
              "Real-time market data",
              "Trading signals",
              "Bulk crypto scanning",
              "News sentiment analysis"
            ]
          }
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
                    onBrokerChange={setSelectedBroker}
                    onPairChange={handlePairChange}
                    onTimeframeChange={setSelectedTimeframe}
                    onTradeTypeChange={setTradeType}
                    onIndicatorToggle={handleIndicatorToggle}
                    onStrategyToggle={handleStrategyToggle}
                    onAnalyze={handleAnalyze}
                  />

                  <CryptoNews />
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

                  <LivePrices selectedPair={selectedPair} selectedBroker={selectedBroker} />
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
        structuredData={seoData.structuredData}
      />
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderCurrentPage()}
      <Footer onPageChange={setCurrentPage} />
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
