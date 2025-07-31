import React from 'react';
import { Shield, Eye, Lock, Database, Globe, UserCheck } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-gray-900 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-300">
            Last updated: January 30, 2025
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <Eye className="w-6 h-6 text-emerald-400 mr-3" />
              Introduction
            </h2>
            <p className="text-gray-300 leading-relaxed">
              CryptoAnalyzer Pro ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you visit our website
              <strong className="text-white"><p>https://cryptoanalyzer.pro/</p></strong>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white mb-1">Business Hours</h3>
                <p className="text-gray-300 mb-2">When you can reach us.</p>
                <div className="text-yellow-400 space-y-1">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM PST</p>
                  <p className="mt-1">Saturday: 10:00 AM - 4:00 PM PST</p>
                  <p className="mt-1">Sunday: Closed</p>
                </div>
              </div> and use our services.
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy,
              please do not access the site.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <Database className="w-6 h-6 text-blue-400 mr-3" />
              Information We Collect
            </h2>
            
            <div className="space-y-6">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-emerald-300 mb-3">Personal Information</h3>
                <p className="text-gray-300 mb-3">
                  We may collect personal information that you voluntarily provide to us when you:
                </p>
                <ul className="text-gray-300 space-y-2 ml-4">
                  <li>• Contact us through our contact form</li>
                  <li>• Subscribe to our newsletter</li>
                  <li>• Create an account on our platform</li>
                  <li>• Participate in surveys or feedback forms</li>
                </ul>
                <p className="text-gray-300 mt-3">
                  This information may include: name, email address, phone number, and any other information you choose to provide.
                </p>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-blue-300 mb-3">Automatically Collected Information</h3>
                <p className="text-gray-300 mb-3">
                  When you visit our website, we may automatically collect certain information about your device, including:
                </p>
                <ul className="text-gray-300 space-y-2 ml-4">
                  <li>• IP address and location data</li>
                  <li>• Browser type and version</li>
                  <li>• Operating system</li>
                  <li>• Pages visited and time spent on pages</li>
                  <li>• Referring website addresses</li>
                  <li>• Device identifiers and characteristics</li>
                </ul>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-purple-300 mb-3">Cookies and Tracking Technologies</h3>
                <p className="text-gray-300">
                  We use cookies, web beacons, and similar tracking technologies to collect information about your 
                  browsing activities. This helps us improve our website functionality, analyze usage patterns, 
                  and provide personalized content. You can control cookie settings through your browser preferences.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <UserCheck className="w-6 h-6 text-emerald-400 mr-3" />
              How We Use Your Information
            </h2>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300 mb-4">We use the information we collect for the following purposes:</p>
              <ul className="text-gray-300 space-y-2 ml-4">
                <li>• <strong className="text-white">Service Provision:</strong> To provide, maintain, and improve our cryptocurrency analysis services</li>
                <li>• <strong className="text-white">Communication:</strong> To respond to your inquiries, send updates, and provide customer support</li>
                <li>• <strong className="text-white">Analytics:</strong> To analyze website usage and improve user experience</li>
                <li>• <strong className="text-white">Marketing:</strong> To send promotional materials and newsletters (with your consent)</li>
                <li>• <strong className="text-white">Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                <li>• <strong className="text-white">Security:</strong> To protect against fraud, unauthorized access, and other security issues</li>
                <li>• <strong className="text-white">Personalization:</strong> To customize content and recommendations based on your preferences</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <Globe className="w-6 h-6 text-blue-400 mr-3" />
              Information Sharing and Disclosure
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-emerald-300 mb-3">Third-Party Service Providers</h3>
                <p className="text-gray-300">
                  We may share your information with trusted third-party service providers who assist us in operating 
                  our website and providing our services, including:
                </p>
                <ul className="text-gray-300 space-y-1 ml-4 mt-2">
                  <li>• Web hosting and cloud storage providers</li>
                  <li>• Analytics services (Google Analytics)</li>
                  <li>• Email marketing platforms</li>
                  <li>• Payment processors</li>
                  <li>• Customer support tools</li>
                </ul>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-blue-300 mb-3">Advertising Partners</h3>
                <p className="text-gray-300">
                  We may work with advertising partners, including Google AdSense, to display relevant advertisements. 
                  These partners may use cookies and similar technologies to collect information about your visits 
                  to our site and other websites to provide targeted advertising.
                </p>
              </div>

              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-red-300 mb-3">Legal Requirements</h3>
                <p className="text-gray-300">
                  We may disclose your information if required by law, court order, or government regulation, 
                  or to protect our rights, property, or safety, or that of our users or others.
                </p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <Lock className="w-6 h-6 text-emerald-400 mr-3" />
              Data Security
            </h2>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300 mb-4">
                We implement appropriate technical and organizational security measures to protect your personal 
                information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="text-gray-300 space-y-2 ml-4">
                <li>• SSL/TLS encryption for data transmission</li>
                <li>• Secure server infrastructure</li>
                <li>• Regular security audits and updates</li>
                <li>• Access controls and authentication</li>
                <li>• Employee training on data protection</li>
              </ul>
              <p className="text-gray-300 mt-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. 
                While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Your Privacy Rights</h2>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300 mb-4">Depending on your location, you may have the following rights:</p>
              <ul className="text-gray-300 space-y-2 ml-4">
                <li>• <strong className="text-white">Access:</strong> Request access to your personal information</li>
                <li>• <strong className="text-white">Correction:</strong> Request correction of inaccurate information</li>
                <li>• <strong className="text-white">Deletion:</strong> Request deletion of your personal information</li>
                <li>• <strong className="text-white">Portability:</strong> Request transfer of your data to another service</li>
                <li>• <strong className="text-white">Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li>• <strong className="text-white">Restriction:</strong> Request limitation of processing</li>
              </ul>
              <p className="text-gray-300 mt-4">
                To exercise these rights, please contact us at <strong className="text-emerald-400">privacy@cryptoanalyzer.pro</strong>
              </p>
            </div>
          </section>

          {/* Cookies Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Cookies Policy</h2>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300 mb-4">We use the following types of cookies:</p>
              <div className="space-y-3">
                <div>
                  <h4 className="text-emerald-300 font-medium">Essential Cookies</h4>
                  <p className="text-gray-300 text-sm">Required for basic website functionality and security.</p>
                </div>
                <div>
                  <h4 className="text-blue-300 font-medium">Analytics Cookies</h4>
                  <p className="text-gray-300 text-sm">Help us understand how visitors interact with our website.</p>
                </div>
                <div>
                  <h4 className="text-purple-300 font-medium">Advertising Cookies</h4>
                  <p className="text-gray-300 text-sm">Used to deliver relevant advertisements and measure their effectiveness.</p>
                </div>
                <div>
                  <h4 className="text-yellow-300 font-medium">Preference Cookies</h4>
                  <p className="text-gray-300 text-sm">Remember your settings and preferences for a better experience.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Links</h2>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300">
                Our website may contain links to third-party websites. We are not responsible for the privacy 
                practices or content of these external sites. We encourage you to review the privacy policies 
                of any third-party sites you visit.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Children's Privacy</h2>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300">
                Our services are not intended for children under 18 years of age. We do not knowingly collect 
                personal information from children under 18. If you are a parent or guardian and believe your 
                child has provided us with personal information, please contact us immediately.
              </p>
            </div>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">International Data Transfers</h2>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your information in accordance 
                with applicable data protection laws.
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Changes to This Privacy Policy</h2>
            
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <p className="text-gray-300">
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new Privacy Policy on this page and updating the "Last updated" date. 
                Your continued use of our services after any modifications constitutes acceptance of the updated policy.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
            
            <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-lg p-6 border border-emerald-500/30">
              <p className="text-gray-300 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-gray-300">
                <p><strong className="text-white">Email:</strong> <span className="text-emerald-400">privacy@cryptoanalyzer.pro</span></p>
                <p></p>
                <p>
                  <br />
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
