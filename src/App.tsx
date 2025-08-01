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
              <div className="border-t border-gray-700 pt-12 mt-12">
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
