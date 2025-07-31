import React from 'react';
import { FileText, AlertTriangle, Scale, Shield, Users, Gavel } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="bg-gray-900 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg mx-auto mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-300">
            Last updated: January 30, 2025
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <Scale className="w-6 h-6 text-emerald-400 mr-3" />
              Agreement to Terms
            </h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms of Service ("Terms") govern your use of CryptoAnalyzer Pro's website located at 
              <strong className="text-white"> https://singular-chimera-3bb75d.netlify.app</strong> ("Service") 
              operated by CryptoAnalyzer Pro ("us", "we", or "our"). By accessing or using our Service, 
              you agree to be bound by these Terms. If you disagree with any part of these terms, 
              then you may not access the Service.
            </p>
          </section>

          {/* Acceptance */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <Users className="w-6 h-6 text-blue-400 mr-3" />
              Acceptance of Terms
            </h2>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300 mb-4">
                By accessing and using CryptoAnalyzer Pro, you accept and agree to be bound by the terms 
                and provision of this agreement. Additionally, when using this website's particular services, 
                you shall be subject to any posted guidelines or rules applicable to such services.
              </p>
              <p className="text-gray-300">
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Description of Service</h2>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300 mb-4">
                CryptoAnalyzer Pro provides cryptocurrency market analysis tools, including but not limited to:
              </p>
              <ul className="text-gray-300 space-y-2 ml-4">
                <li>• Real-time cryptocurrency price data and charts</li>
                <li>• Technical analysis indicators and trading signals</li>
                <li>• Market news and sentiment analysis</li>
                <li>• Educational content about cryptocurrency trading</li>
                <li>• Portfolio tracking and analysis tools</li>
              </ul>
              <p className="text-gray-300 mt-4">
                Our services are provided for informational and educational purposes only and do not constitute 
                financial, investment, or trading advice.
              </p>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">User Responsibilities</h2>
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-emerald-300 mb-3">Account Security</h3>
                <ul className="text-gray-300 space-y-2 ml-4">
                  <li>• You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>• You must notify us immediately of any unauthorized use of your account</li>
                  <li>• You are responsible for all activities that occur under your account</li>
                </ul>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-blue-300 mb-3">Acceptable Use</h3>
                <p className="text-gray-300 mb-3">You agree not to:</p>
                <ul className="text-gray-300 space-y-2 ml-4">
                  <li>• Use the service for any unlawful purpose or in violation of any applicable laws</li>
                  <li>• Attempt to gain unauthorized access to our systems or other users' accounts</li>
                  <li>• Interfere with or disrupt the service or servers connected to the service</li>
                  <li>• Transmit any viruses, malware, or other harmful code</li>
                  <li>• Scrape, harvest, or collect user information without permission</li>
                  <li>• Use automated systems to access the service without authorization</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Investment Disclaimer */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 text-yellow-400 mr-3" />
              Investment and Trading Disclaimer
            </h2>
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-6">
              <div className="space-y-4 text-yellow-200">
                <p className="font-semibold text-yellow-100">
                  IMPORTANT: Please read this disclaimer carefully before using our services.
                </p>
                <ul className="space-y-2 ml-4">
                  <li>• <strong>Not Financial Advice:</strong> All information provided is for educational purposes only and does not constitute financial, investment, or trading advice.</li>
                  <li>• <strong>High Risk:</strong> Cryptocurrency trading involves substantial risk of loss and may not be suitable for all investors.</li>
                  <li>• <strong>No Guarantees:</strong> Past performance does not guarantee future results. All trading signals and analysis are based on historical data and market indicators.</li>
                  <li>• <strong>Your Responsibility:</strong> You are solely responsible for your trading decisions and any resulting profits or losses.</li>
                  <li>• <strong>Consult Professionals:</strong> Always consult with qualified financial advisors before making investment decisions.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <Shield className="w-6 h-6 text-emerald-400 mr-3" />
              Intellectual Property Rights
            </h2>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300 mb-4">
                The Service and its original content, features, and functionality are and will remain the 
                exclusive property of CryptoAnalyzer Pro and its licensors. The Service is protected by 
                copyright, trademark, and other laws. Our trademarks and trade dress may not be used 
                in connection with any product or service without our prior written consent.
              </p>
              <p className="text-gray-300">
                You may not reproduce, distribute, modify, create derivative works of, publicly display, 
                publicly perform, republish, download, store, or transmit any of the material on our Service 
                without our prior written consent.
              </p>
            </div>
          </section>

          {/* Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Privacy Policy</h2>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your 
                use of the Service, to understand our practices. By using our Service, you consent to the 
                collection and use of information in accordance with our Privacy Policy.
              </p>
            </div>
          </section>

          {/* Prohibited Uses */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Prohibited Uses</h2>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300 mb-4">You may not use our Service:</p>
              <ul className="text-gray-300 space-y-2 ml-4">
                <li>• For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>• To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>• To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>• To submit false or misleading information</li>
                <li>• To upload or transmit viruses or any other type of malicious code</li>
                <li>• To collect or track the personal information of others</li>
                <li>• To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                <li>• For any obscene or immoral purpose</li>
                <li>• To interfere with or circumvent the security features of the Service</li>
              </ul>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <Gavel className="w-6 h-6 text-red-400 mr-3" />
              Termination
            </h2>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300 mb-4">
                We may terminate or suspend your account and bar access to the Service immediately, 
                without prior notice or liability, under our sole discretion, for any reason whatsoever 
                and without limitation, including but not limited to a breach of the Terms.
              </p>
              <p className="text-gray-300">
                If you wish to terminate your account, you may simply discontinue using the Service. 
                Upon termination, your right to use the Service will cease immediately.
              </p>
            </div>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Disclaimer</h2>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300 mb-4">
                The information on this website is provided on an "as is" basis. To the fullest extent 
                permitted by law, this Company:
              </p>
              <ul className="text-gray-300 space-y-2 ml-4">
                <li>• Excludes all representations and warranties relating to this website and its contents</li>
                <li>• Excludes all liability for damages arising out of or in connection with your use of this website</li>
                <li>• Does not guarantee the accuracy, completeness, or timeliness of the information provided</li>
                <li>• Makes no warranties about the availability or functionality of the Service</li>
              </ul>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Limitation of Liability</h2>
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6">
              <p className="text-red-200 mb-4">
                In no event shall CryptoAnalyzer Pro, nor its directors, employees, partners, agents, 
                suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, 
                or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                or other intangible losses, resulting from your use of the Service.
              </p>
              <p className="text-red-200">
                Our total liability to you for all claims arising from or relating to the Service shall 
                not exceed the amount you paid us, if any, for the Service during the twelve (12) months 
                preceding the claim.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Governing Law</h2>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300">
                These Terms shall be interpreted and governed by the laws of the State of California, 
                United States, without regard to its conflict of law provisions. Our failure to enforce 
                any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Changes to Terms</h2>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                If a revision is material, we will provide at least 30 days notice prior to any new terms 
                taking effect. What constitutes a material change will be determined at our sole discretion. 
                Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Contact Information</h2>
            <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-lg p-6 border border-emerald-500/30">
              <p className="text-gray-300 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-gray-300">
                <p><strong className="text-white">Email:</strong> <span className="text-emerald-400">legal@cryptoanalyzer.pro</span></p>
                <p><strong className="text-white">Phone:</strong> <span className="text-blue-400">+1 (555) 123-4567</span></p>
                <p><strong className="text-white">Address:</strong> 123 Crypto Street, San Francisco, CA 94105, United States</p>
              </div>
            </div>
          </section>

          {/* Acknowledgment */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Acknowledgment</h2>
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
              <p className="text-blue-200">
                By using CryptoAnalyzer Pro, you acknowledge that you have read these Terms of Service 
                and agree to be bound by them. These Terms constitute the entire agreement between you 
                and CryptoAnalyzer Pro regarding the use of the Service.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;