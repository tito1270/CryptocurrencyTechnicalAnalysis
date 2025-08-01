import React from 'react';
import { Users, Target, Shield, Award, TrendingUp, Globe, BarChart3, Zap } from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <div className="bg-gray-900 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg mx-auto mb-6">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">About CryptoAnalyzer Pro</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
            Your trusted partner in cryptocurrency trading and market analysis since 2024
          </p>
          <button
            onClick={() => {
              window.location.href = '/#scan-section';
              setTimeout(() => {
                document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all"
          >
            <TrendingUp className="w-5 h-5" />
            <span>Try Our Platform</span>
          </button>
        </div>

        {/* Mission Statement */}
        <div className="bg-gray-800 rounded-lg p-8 mb-12 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
            <Target className="w-6 h-6 text-emerald-400 mr-3" />
            Our Mission
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            CryptoAnalyzer Pro is a comprehensive digital platform designed to empower cryptocurrency traders 
            and investors with professional-grade market analysis tools. We provide real-time trading signals, 
            technical analysis, and market insights across 15+ major cryptocurrency exchanges, helping both 
            novice and experienced traders make informed decisions in the volatile crypto market.
          </p>
        </div>

        {/* What We Do */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">What We Provide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <BarChart3 className="w-8 h-8 text-emerald-400 mr-3" />
                <h3 className="text-lg font-semibold text-white">Technical Analysis</h3>
              </div>
              <p className="text-gray-300">
                Advanced technical indicators including RSI, MACD, Bollinger Bands, and 25+ other professional 
                trading tools to analyze market trends and price movements.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <Zap className="w-8 h-8 text-blue-400 mr-3" />
                <h3 className="text-lg font-semibold text-white">Real-Time Signals</h3>
              </div>
              <p className="text-gray-300">
                Live trading signals with buy/sell/hold recommendations, entry points, profit targets, 
                and stop-loss levels based on comprehensive market analysis.
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <Globe className="w-8 h-8 text-purple-400 mr-3" />
                <h3 className="text-lg font-semibold text-white">Multi-Exchange Support</h3>
              </div>
              <p className="text-gray-300">
                Coverage of 15+ major exchanges including Binance, Coinbase, Kraken, KuCoin, and others, 
                with access to 10,000+ trading pairs per exchange.
              </p>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="bg-gray-800 rounded-lg p-8 mb-12 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
            <Users className="w-6 h-6 text-blue-400 mr-3" />
            Our Story
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-4">
            Founded in 2024, CryptoAnalyzer Pro was born from the need for reliable, professional-grade 
            cryptocurrency analysis tools that are accessible to traders of all levels. Our team of 
            experienced traders, data scientists, and software engineers recognized the gap between 
            complex institutional trading tools and simple retail apps.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed">
            We built CryptoAnalyzer Pro to bridge this gap, providing sophisticated analysis capabilities 
            in an intuitive, user-friendly interface. Our platform combines traditional technical analysis 
            with modern news sentiment analysis and AI-powered insights to give traders a comprehensive 
            view of the cryptocurrency markets.
          </p>
        </div>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-white mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">📊 Advanced Analytics</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• 25+ Technical Indicators</li>
                <li>• 16+ Trading Strategies</li>
                <li>• Multiple Timeframe Analysis</li>
                <li>• Risk-Reward Calculations</li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">📈 Real-Time Data</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Live Price Feeds</li>
                <li>• Real-Time News Integration</li>
                <li>• Market Sentiment Analysis</li>
                <li>• Instant Signal Updates</li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">🔍 Comprehensive Coverage</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• 15+ Major Exchanges</li>
                <li>• 10,000+ Trading Pairs</li>
                <li>• All Major Cryptocurrencies</li>
                <li>• DeFi, NFT, and Meme Tokens</li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">🛡️ Risk Management</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Stop-Loss Recommendations</li>
                <li>• Profit Target Calculations</li>
                <li>• Risk-Reward Analysis</li>
                <li>• Position Sizing Guidance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Our Commitment */}
        <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-lg p-8 border border-emerald-500/30">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
            <Shield className="w-6 h-6 text-emerald-400 mr-3" />
            Our Commitment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-emerald-300 mb-2">Accuracy & Reliability</h3>
              <p className="text-gray-300">
                We strive to provide the most accurate and reliable trading signals and market analysis, 
                continuously improving our algorithms and data sources.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-300 mb-2">Educational Focus</h3>
              <p className="text-gray-300">
                Beyond just providing signals, we aim to educate our users about trading strategies, 
                risk management, and market dynamics.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-300 mb-2">Transparency</h3>
              <p className="text-gray-300">
                We believe in complete transparency about our methods, limitations, and the risks 
                involved in cryptocurrency trading.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-300 mb-2">Continuous Innovation</h3>
              <p className="text-gray-300">
                We continuously update and improve our platform with new features, better analysis 
                tools, and enhanced user experience.
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-semibold text-white mb-4">Ready to Start Trading Smarter?</h2>
          <p className="text-gray-300 mb-6">
            Join thousands of traders who trust CryptoAnalyzer Pro for their market analysis needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                window.location.href = '/#scan-section';
                setTimeout(() => {
                  document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-bold rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              <TrendingUp className="w-5 h-5" />
              <span>START FREE ANALYSIS</span>
            </button>
            <button
              onClick={() => window.location.href = '/#contact'}
              className="inline-flex items-center px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all duration-200"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
