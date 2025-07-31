import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import Disclaimer from './components/Disclaimer';
import TradingControls from './components/TradingControls';
import AnalysisResults from './components/AnalysisResults';
import LivePrices from './components/LivePrices';
import CryptoNews from './components/CryptoNews';
import { AnalysisResult } from './types';
import { performAnalysis } from './utils/analysisEngine';
import { brokers } from './data/brokers';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedBroker, setSelectedBroker] = useState(brokers[0].id);
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
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
                  onPairChange={setSelectedPair}
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
                      Configure your settings and click "Analyze Market" to get started
                    </div>
                  </div>
                )}
                
                <LivePrices />
                <LivePrices selectedPair={selectedPair} selectedBroker={selectedBroker} />
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

export default App;