import React from 'react';
import { AlertTriangle, TrendingDown, Shield, Info, DollarSign, BookOpen, TrendingUp } from 'lucide-react';

const Disclaimer: React.FC = () => {
  return (
    <div className="bg-gray-900 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-red-600 rounded-lg mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Risk Disclaimer</h1>
          <p className="text-xl text-gray-300">
            Important Information About Cryptocurrency Trading Risks
          </p>
        </div>

        <div className="space-y-8">
          {/* Main Warning */}
          <div className="bg-red-900/30 border-2 border-red-600 rounded-lg p-8">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400 mr-4" />
              <h2 className="text-2xl font-bold text-red-300">IMPORTANT RISK WARNING</h2>
            </div>
            <p className="text-red-200 text-lg leading-relaxed">
              <strong>Cryptocurrency trading involves substantial risk and may not be suitable for all investors.</strong> 
              The high degree of leverage and volatility in cryptocurrency markets can work against you as well as for you. 
              Before deciding to trade cryptocurrencies, you should carefully consider your investment objectives, 
              level of experience, and risk appetite.
            </p>
          </div>

          {/* General Disclaimer */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <Info className="w-6 h-6 text-blue-400 mr-3" />
              General Disclaimer
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                CryptoAnalyzer Pro ("we," "us," or "our") provides cryptocurrency market analysis, trading signals, 
                and educational content for informational purposes only. The information provided on our website 
                and through our services should not be construed as financial, investment, trading, or any other 
                type of advice.
              </p>
              <p>
                <strong className="text-white">We are not financial advisors, investment advisors, or licensed brokers.</strong> 
                All content is provided for educational and informational purposes only and should not be considered 
                as a recommendation to buy, sell, or hold any cryptocurrency or financial instrument.
              </p>
            </div>
          </div>

          {/* Trading Risks */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <TrendingDown className="w-6 h-6 text-red-400 mr-3" />
              Cryptocurrency Trading Risks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-red-900/20 rounded-lg p-4 border border-red-700/50">
                  <h3 className="text-lg font-semibold text-red-300 mb-2">High Volatility</h3>
                  <p className="text-red-200 text-sm">
                    Cryptocurrency prices can fluctuate dramatically within short periods, potentially resulting 
                    in significant gains or losses.
                  </p>
                </div>
                <div className="bg-orange-900/20 rounded-lg p-4 border border-orange-700/50">
                  <h3 className="text-lg font-semibold text-orange-300 mb-2">Market Manipulation</h3>
                  <p className="text-orange-200 text-sm">
                    Cryptocurrency markets may be subject to manipulation by large holders, exchanges, 
                    or coordinated groups.
                  </p>
                </div>
                <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-700/50">
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">Regulatory Risk</h3>
                  <p className="text-yellow-200 text-sm">
                    Changes in government regulations can significantly impact cryptocurrency values 
                    and market accessibility.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/50">
                  <h3 className="text-lg font-semibold text-purple-300 mb-2">Technology Risk</h3>
                  <p className="text-purple-200 text-sm">
                    Technical issues, security breaches, or protocol failures can affect cryptocurrency 
                    networks and values.
                  </p>
                </div>
                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
                  <h3 className="text-lg font-semibold text-blue-300 mb-2">Liquidity Risk</h3>
                  <p className="text-blue-200 text-sm">
                    Some cryptocurrencies may have limited liquidity, making it difficult to buy or sell 
                    at desired prices.
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Loss Risk</h3>
                  <p className="text-gray-200 text-sm">
                    You could lose your entire investment. Never invest more than you can afford to lose.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* No Guarantees */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <Shield className="w-6 h-6 text-yellow-400 mr-3" />
              No Guarantees or Warranties
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong className="text-white">Past performance does not guarantee future results.</strong> 
                All trading signals, analysis, and recommendations are based on historical data and current 
                market conditions, which may not continue in the future.
              </p>
              <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-700/50">
                <ul className="text-yellow-200 space-y-2">
                  <li>• We do not guarantee the accuracy, completeness, or timeliness of any information provided</li>
                  <li>• We do not guarantee any specific investment results or profits</li>
                  <li>• We do not guarantee that our signals or analysis will be profitable</li>
                  <li>• We do not guarantee the availability or functionality of our services</li>
                  <li>• We do not guarantee protection against losses or market downturns</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Personal Responsibility */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <DollarSign className="w-6 h-6 text-emerald-400 mr-3" />
              Your Personal Responsibility
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong className="text-white">You are solely responsible for your trading decisions and their consequences.</strong> 
                Before making any investment decisions, you should:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-900/20 rounded-lg p-4 border border-emerald-700/50">
                  <h3 className="text-emerald-300 font-semibold mb-2">Due Diligence</h3>
                  <ul className="text-emerald-200 text-sm space-y-1">
                    <li>• Conduct your own research</li>
                    <li>• Verify all information independently</li>
                    <li>• Understand the risks involved</li>
                    <li>• Assess your risk tolerance</li>
                  </ul>
                </div>
                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
                  <h3 className="text-blue-300 font-semibold mb-2">Professional Advice</h3>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>• Consult qualified financial advisors</li>
                    <li>• Seek professional tax advice</li>
                    <li>• Consider legal implications</li>
                    <li>• Review your financial situation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Analysis Limitations */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <BookOpen className="w-6 h-6 text-purple-400 mr-3" />
              Technical Analysis Limitations
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Our technical analysis and trading signals are based on mathematical algorithms and historical 
                price patterns. However, technical analysis has inherent limitations:
              </p>
              <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/50">
                <ul className="text-purple-200 space-y-2">
                  <li>• <strong>Historical Bias:</strong> Based on past data that may not predict future movements</li>
                  <li>• <strong>Market Conditions:</strong> May not account for sudden market changes or news events</li>
                  <li>• <strong>False Signals:</strong> Can generate incorrect buy/sell signals, especially in volatile markets</li>
                  <li>• <strong>Lagging Indicators:</strong> Many indicators react to price changes rather than predict them</li>
                  <li>• <strong>Market Sentiment:</strong> Cannot fully capture human emotions and market psychology</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Regulatory Compliance */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4">Regulatory Compliance</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Cryptocurrency regulations vary by jurisdiction and are constantly evolving. It is your 
                responsibility to ensure compliance with all applicable laws and regulations in your jurisdiction.
              </p>
              <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
                <p className="text-blue-200">
                  <strong>Important:</strong> Some jurisdictions may restrict or prohibit cryptocurrency trading. 
                  Ensure you are legally permitted to trade cryptocurrencies in your location before using our services.
                </p>
              </div>
            </div>
          </div>

          {/* Third-Party Information */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Information</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Our platform may include information from third-party sources, including news feeds, 
                price data from exchanges, and market analysis from external providers. We do not 
                guarantee the accuracy, completeness, or reliability of such third-party information.
              </p>
              <p>
                <strong className="text-white">We are not responsible for any errors, omissions, or delays 
                in third-party information or for any actions taken based on such information.</strong>
              </p>
            </div>
          </div>

          {/* Contact and Questions */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-lg p-8 border border-emerald-500/30">
            <h2 className="text-2xl font-semibold text-white mb-4">Questions About This Disclaimer</h2>
            <p className="text-gray-300 mb-4">
              If you have any questions about this disclaimer or need clarification about the risks 
              involved in cryptocurrency trading, please contact us:
            </p>
            <div className="space-y-2 text-gray-300">
              <p><strong className="text-white">Email:</strong> <span className="text-emerald-400">legal@cryptoanalyzer.pro</span></p>
              <p><strong className="text-white">Phone:</strong> <span className="text-blue-400">+1 (555) 123-4567</span></p>
            </div>
          </div>

          {/* Final Warning */}
          <div className="bg-red-900/30 border-2 border-red-600 rounded-lg p-8">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-300 mb-4">FINAL WARNING</h2>
              <p className="text-red-200 text-lg">
                <strong>Never invest more than you can afford to lose.</strong> Cryptocurrency trading 
                is highly speculative and involves substantial risk. Only trade with funds you can 
                afford to lose completely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
