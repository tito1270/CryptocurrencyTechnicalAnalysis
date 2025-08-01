import React from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Globe, 
  Zap, 
  Shield, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Target,
  Clock,
  DollarSign,
  Activity
} from 'lucide-react';

const Homepage: React.FC = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section with Main Description */}
      <section className="text-center py-12 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 rounded-xl border border-gray-700">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Free Cryptocurrency Technical Analysis Platform
            <span className="block text-2xl md:text-3xl text-emerald-400 mt-2">
              Professional Trading Tools, Forever Free
            </span>
          </h1>
          
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            <strong>CryptoAnalyzer Pro</strong> is the ultimate free cryptocurrency technical analysis platform designed for both new and experienced traders. 
            Our comprehensive tool provides professional-grade market analysis across <strong>12+ major exchanges</strong> including Binance, Coinbase, Kraken, and Bybit. 
            Analyze over <strong>1,000+ cryptocurrency pairs</strong> including Bitcoin, Ethereum, and trending altcoins with <strong>25+ advanced technical indicators</strong> 
            and proven trading strategies. Built for the crypto community, our platform offers institutional-quality analysis tools that professional traders use, 
            completely free forever with no hidden fees, subscriptions, or limitations.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center space-x-2 bg-emerald-500/20 px-4 py-2 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 font-medium">Free Forever</span>
            </div>
            <div className="flex items-center space-x-2 bg-blue-500/20 px-4 py-2 rounded-lg">
              <Globe className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 font-medium">12+ Exchanges</span>
            </div>
            <div className="flex items-center space-x-2 bg-purple-500/20 px-4 py-2 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <span className="text-purple-300 font-medium">25+ Indicators</span>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-xl hover:shadow-emerald-500/25"
            >
              <TrendingUp className="w-6 h-6" />
              <span>START FREE ANALYSIS NOW</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-gray-400 mt-2">No registration • Instant results • Always free</p>
          </div>
        </div>
      </section>

      {/* Benefits for New Traders */}
      <section className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Perfect for New Cryptocurrency Traders
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-6">
            Start your cryptocurrency trading journey with confidence. Our platform provides everything new traders need
            to understand market movements and make informed decisions without risking capital on expensive tools.
          </p>
          <button
            onClick={() => document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all"
          >
            <Target className="w-5 h-5" />
            <span>Try Free Analysis</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-emerald-500/50 transition-colors">
            <DollarSign className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Zero Cost Learning</h3>
            <p className="text-gray-300">
              Learn technical analysis without spending money on expensive tools. Practice with real market data 
              and develop your skills using professional-grade indicators completely free.
            </p>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500/50 transition-colors">
            <Users className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Beginner-Friendly Interface</h3>
            <p className="text-gray-300">
              Simple, intuitive design that doesn't overwhelm new traders. Clear explanations for each indicator 
              and strategy help you understand what signals mean and how to interpret them.
            </p>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500/50 transition-colors">
            <Shield className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Risk-Free Practice</h3>
            <p className="text-gray-300">
              Test strategies and learn market patterns without risking real money. Our analysis tools help you 
              understand when to enter or exit positions before trading with actual funds.
            </p>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-orange-500/50 transition-colors">
            <Target className="w-8 h-8 text-orange-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Multi-Exchange Coverage</h3>
            <p className="text-gray-300">
              Compare prices and opportunities across major exchanges. Learn which platforms offer better 
              rates and understand market differences between exchanges.
            </p>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-cyan-500/50 transition-colors">
            <Activity className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Real-Time Market Data</h3>
            <p className="text-gray-300">
              Access live cryptocurrency prices and market movements. Stay updated with real-time analysis 
              to understand how markets react to news and events.
            </p>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-pink-500/50 transition-colors">
            <Clock className="w-8 h-8 text-pink-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Multiple Timeframes</h3>
            <p className="text-gray-300">
              Analyze short-term and long-term trends with various timeframe options. Learn how different 
              time periods affect trading strategies and market analysis.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works - Scanning Procedure */}
      <section className="py-12 bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              How Our Cryptocurrency Analysis Scanning Works
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-6">
              Our advanced scanning system analyzes cryptocurrency markets using sophisticated algorithms and proven trading methodologies.
              Here's the complete step-by-step process of how our free analysis tool delivers professional-grade market insights.
            </p>
            <button
              onClick={() => document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
            >
              <Activity className="w-5 h-5" />
              <span>Experience the Process</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Exchange Connection & Data Retrieval</h3>
                  <p className="text-gray-300">
                    Our system establishes secure connections to over 12 major cryptocurrency exchanges including Binance, Coinbase Pro, Kraken, 
                    Bybit, KuCoin, and others. We retrieve real-time market data including current prices, trading volume, order book depth, 
                    and historical price movements for your selected cryptocurrency pair across multiple timeframes (1m, 5m, 15m, 1h, 4h, 1d).
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Technical Indicator Calculation</h3>
                  <p className="text-gray-300">
                    The platform calculates 25+ professional technical indicators including RSI (Relative Strength Index), MACD (Moving Average Convergence Divergence), 
                    Bollinger Bands, Stochastic Oscillator, Williams %R, EMA/SMA crossovers, Volume indicators, and Fibonacci retracements. 
                    Each indicator is computed using industry-standard formulas with configurable periods and parameters.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Pattern Recognition & Signal Detection</h3>
                  <p className="text-gray-300">
                    Our advanced algorithms identify chart patterns such as head and shoulders, triangles, flags, pennants, and support/resistance levels. 
                    The system detects golden crosses, death crosses, breakout patterns, and momentum shifts. Each pattern is analyzed for reliability 
                    and potential profit targets based on historical performance data.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Multi-Strategy Analysis</h3>
                  <p className="text-gray-300">
                    The platform applies multiple proven trading strategies simultaneously including trend following, mean reversion, momentum trading, 
                    and scalping strategies. Each strategy is weighted based on current market conditions, volatility levels, and historical success rates 
                    for the specific cryptocurrency pair being analyzed.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">5</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Risk Assessment & Probability Scoring</h3>
                  <p className="text-gray-300">
                    Every trading signal is assigned a probability score and risk rating based on confluence of indicators, market volatility, 
                    and current market sentiment. The system calculates potential stop-loss levels, take-profit targets, and position sizing recommendations 
                    based on proven risk management principles used by professional traders.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">6</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Market Sentiment Integration</h3>
                  <p className="text-gray-300">
                    Our analysis incorporates broader market sentiment by analyzing Bitcoin dominance, fear and greed index, social media sentiment, 
                    and correlation with traditional markets. This helps provide context for individual cryptocurrency movements within the broader market ecosystem.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">7</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Comprehensive Report Generation</h3>
                  <p className="text-gray-300">
                    Finally, the system generates a detailed analysis report including trade direction (BUY/SELL/HOLD), confidence levels, 
                    supporting indicators, potential entry/exit points, and risk warnings. The report includes easy-to-understand explanations 
                    perfect for both beginners learning technical analysis and experienced traders seeking quick insights.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">8</div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Real-Time Updates & Monitoring</h3>
                  <p className="text-gray-300">
                    The analysis continuously updates as new market data becomes available. Users can monitor how signals evolve over time and receive 
                    alerts when significant changes occur in the analysis. This real-time capability ensures traders never miss important market movements 
                    or changes in trading conditions.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-lg p-6 max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-3">Complete Analysis in Under 30 Seconds</h3>
              <p className="text-gray-300 mb-4">
                Our optimized scanning engine processes thousands of data points and delivers comprehensive analysis results in less than 30 seconds. 
                The entire process from data collection to final report generation is automated, ensuring consistent and reliable analysis every time you scan.
              </p>
              <div className="flex items-center justify-center space-x-2 text-emerald-400">
                <Zap className="w-5 h-5" />
                <span className="font-medium">Lightning Fast • Professional Grade • Always Free</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Professional Trading Features, Completely Free
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Access institutional-quality cryptocurrency analysis tools without paying premium prices. 
            Our platform provides everything professional traders use, available free forever.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gray-800 border border-gray-700 rounded-lg">
            <Globe className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Multi-Exchange</h3>
            <p className="text-gray-300 text-sm">Compare opportunities across 12+ major cryptocurrency exchanges</p>
          </div>
          
          <div className="text-center p-6 bg-gray-800 border border-gray-700 rounded-lg">
            <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">25+ Indicators</h3>
            <p className="text-gray-300 text-sm">Professional technical indicators including RSI, MACD, Bollinger Bands</p>
          </div>
          
          <div className="text-center p-6 bg-gray-800 border border-gray-700 rounded-lg">
            <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Live Analysis</h3>
            <p className="text-gray-300 text-sm">Real-time market data and instant analysis updates</p>
          </div>
          
          <div className="text-center p-6 bg-gray-800 border border-gray-700 rounded-lg">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Free Forever</h3>
            <p className="text-gray-300 text-sm">No subscriptions, no hidden fees, no limitations on usage</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center py-12 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-xl border border-emerald-500/30">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Analyzing Cryptocurrency Markets Today
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Join thousands of traders using our free platform to make informed cryptocurrency trading decisions. 
            No registration required, no credit card needed - start analyzing immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center space-x-2 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              <span>Instant Access</span>
            </div>
            <div className="flex items-center space-x-2 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              <span>No Registration</span>
            </div>
            <div className="flex items-center space-x-2 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              <span>Always Free</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
