import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { useReCaptcha } from '../utils/recaptcha';

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { executeRecaptcha } = useReCaptcha();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Execute reCAPTCHA
      const recaptchaToken = await executeRecaptcha('contact_form');
      if (!recaptchaToken) {
        throw new Error('reCAPTCHA verification failed');
      }

      // Prepare form data with reCAPTCHA token
      const submissionData = {
        ...formData,
        recaptchaToken
      };

      // Simulate form submission
      console.log('Form submission:', submissionData);

      setTimeout(() => {
        setSubmitStatus('success');
        setIsSubmitting(false);
        setFormData({ name: '', email: '', subject: '', message: '' });

        // Reset success message after 5 seconds
        setTimeout(() => setSubmitStatus('idle'), 5000);
      }, 1000);

    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage('Submission failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Contact CryptoAnalyzer Pro Support</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
            Get professional support for <strong>cryptocurrency trading</strong> and <strong>technical analysis</strong>.
            Our expert team provides assistance with <strong>Bitcoin analysis</strong>, <strong>crypto scanning tools</strong>,
            and platform features. Fast response guaranteed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
              <span>Try Free Analysis First</span>
            </button>
            <p className="text-sm text-gray-400 self-center">or contact us below</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
              <h2 className="text-2xl font-semibold text-white mb-6">Get In Touch</h2>
              <p className="text-gray-300 mb-8">
                Have questions about our platform, need technical support, or want to discuss partnership opportunities? 
                We'd love to hear from you. Our team typically responds within 24 hours.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-emerald-600 rounded-lg flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Email Us</h3>
                    <p className="text-gray-300 mb-2">Send us an email and we'll get back to you soon.</p>
                    <a href="mailto:support@cryptoanalyzer.pro" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                      support@cryptoanalyzer.pro
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="ml-4">
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="ml-4">
                    <p className="text-purple-400">
                      <br />
                      <br />
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Cryptocurrency Trading Support FAQ</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-emerald-400 font-medium mb-1">How accurate are your Bitcoin and crypto trading signals?</h4>
                  <p className="text-gray-300 text-sm">Our <strong>cryptocurrency trading signals</strong> are based on comprehensive <strong>technical analysis</strong> and <strong>news sentiment</strong>. While we strive for accuracy, all crypto trading involves risk.</p>
                </div>
                <div>
                  <h4 className="text-emerald-400 font-medium mb-1">Do you provide Bitcoin investment advice?</h4>
                  <p className="text-gray-300 text-sm">No, we provide <strong>educational crypto tools</strong> and <strong>market analysis</strong>. Always consult with financial advisors for cryptocurrency investment decisions.</p>
                </div>
                <div>
                  <h4 className="text-emerald-400 font-medium mb-1">Which cryptocurrency exchanges do you support?</h4>
                  <p className="text-gray-300 text-sm">We support 15+ major <strong>cryptocurrency exchanges</strong> including <strong>Binance</strong>, <strong>Coinbase</strong>, <strong>Kraken</strong>, <strong>KuCoin</strong>, and many others for comprehensive <strong>crypto analysis</strong>.</p>
                </div>
                <div>
                  <h4 className="text-emerald-400 font-medium mb-1">Is the crypto scanner really free?</h4>
                  <p className="text-gray-300 text-sm">Yes! Our <strong>cryptocurrency scanner</strong> and <strong>technical analysis tools</strong> are completely free. No subscriptions or hidden fees for basic features.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-6">Send Us a Message</h2>
            
            {submitStatus === 'success' && (
              <div className="bg-emerald-600/20 border border-emerald-500 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <p className="text-emerald-300 font-medium">✅ Message sent successfully! We'll get back to you soon.</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-600/20 border border-red-500 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <p className="text-red-300 font-medium">⚠️ {errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing Question</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="feedback">Feedback & Suggestions</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-vertical"
                  placeholder="Please describe your inquiry in detail..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Shield className="w-4 h-4 text-emerald-400" />
                <p className="text-sm text-emerald-400 font-medium">Protected by Google reCAPTCHA</p>
              </div>
              <p className="text-sm text-gray-400 text-center">
                By submitting this form, you agree to our Privacy Policy and Terms of Service.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Contact Options */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-white mb-8">Other Ways to Connect</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <Globe className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Live Chat</h3>
              <p className="text-gray-300 text-sm mb-4">
                Get instant help with our live chat support during business hours.
              </p>
              <button className="text-emerald-400 hover:text-emerald-300 font-medium">
                Start Live Chat
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <MessageSquare className="w-8 h-8 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Community Forum</h3>
              <p className="text-gray-300 text-sm mb-4">
                Join our community to discuss trading strategies and get peer support.
              </p>
              <button className="text-blue-400 hover:text-blue-300 font-medium">
                Visit Forum
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <Send className="w-8 h-8 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Newsletter</h3>
              <p className="text-gray-300 text-sm mb-4">
                Subscribe to get the latest market insights and platform updates.
              </p>
              <button className="text-purple-400 hover:text-purple-300 font-medium">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
