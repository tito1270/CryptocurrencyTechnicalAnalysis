import React, { useState, useEffect } from 'react';
import { Search, Globe, Zap, CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { generateSitemap, generateSitemapInfo } from '../utils/sitemapGenerator';
import { 
  autoSubmitSitemap, 
  getWebmasterTools, 
  generateSubmissionReport,
  PingResult 
} from '../utils/searchEnginePing';

interface SEOManagerProps {
  siteUrl?: string;
  autoSubmit?: boolean;
}

export default function SEOManager({ 
  siteUrl = 'https://cryptoanalyzer-pro.com',
  autoSubmit = false 
}: SEOManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<Date | null>(null);
  const [submissionResults, setSubmissionResults] = useState<PingResult[]>([]);
  const [sitemapInfo, setSitemapInfo] = useState<any>(null);
  const [autoMode, setAutoMode] = useState(autoSubmit);

  useEffect(() => {
    // Load sitemap info on component mount
    const info = generateSitemapInfo(siteUrl);
    setSitemapInfo(info);

    // Auto-submit if enabled
    if (autoSubmit) {
      handleAutoSubmit();
    }
  }, [siteUrl, autoSubmit]);

  const handleAutoSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const sitemapUrl = `${siteUrl}/sitemap.xml`;
      const results = await autoSubmitSitemap(sitemapUrl, {
        enableLogging: true
      });
      
      setSubmissionResults(results);
      setLastSubmission(new Date());
    } catch (error) {
      console.error('Auto submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateSitemap = () => {
    const sitemap = generateSitemap(siteUrl);
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopySubmissionUrls = () => {
    const webmasterTools = getWebmasterTools();
    const urls = webmasterTools.map(tool => `${tool.name}: ${tool.url}`).join('\n');
    navigator.clipboard.writeText(urls);
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-500" />
    );
  };

  const successfulPings = submissionResults.filter(r => r.success).length;
  const totalPings = submissionResults.length;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Globe className="w-6 h-6 text-emerald-500" />
          <h3 className="text-lg font-semibold text-white">SEO & Search Engine Automation</h3>
        </div>
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={autoMode}
              onChange={(e) => setAutoMode(e.target.checked)}
              className="rounded"
            />
            <span>Auto Submit</span>
          </label>
        </div>
      </div>

      {/* Sitemap Info */}
      {sitemapInfo && (
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
          <h4 className="text-md font-medium text-white mb-3">📄 Sitemap Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Total URLs:</span>
              <span className="text-white ml-2 font-medium">{sitemapInfo.totalUrls}</span>
            </div>
            <div>
              <span className="text-gray-400">Last Generated:</span>
              <span className="text-white ml-2 font-medium">
                {new Date(sitemapInfo.lastGenerated).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleGenerateSitemap}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
            >
              📥 Download Sitemap
            </button>
            <button
              onClick={() => window.open(`${siteUrl}/sitemap.xml`, '_blank')}
              className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
            >
              🔗 View Online
            </button>
          </div>
        </div>
      )}

      {/* Submission Controls */}
      <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
        <h4 className="text-md font-medium text-white mb-3">🚀 Automatic Submission</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">
              Submit sitemap to {getWebmasterTools().length}+ search engines
            </span>
            <button
              onClick={handleAutoSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Submit Now</span>
                </>
              )}
            </button>
          </div>

          {lastSubmission && (
            <div className="text-xs text-gray-400 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Last submission: {lastSubmission.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Submission Results */}
      {submissionResults.length > 0 && (
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium text-white">📊 Submission Results</h4>
            <div className="text-sm">
              <span className="text-green-500 font-medium">{successfulPings}</span>
              <span className="text-gray-400">/{totalPings} successful</span>
            </div>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {submissionResults.map((result, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 bg-gray-800 rounded text-sm"
              >
                <div className="flex items-center space-x-2">
                  {getStatusIcon(result.success)}
                  <span className="text-white">{result.service}</span>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
          
          {submissionResults.some(r => !r.success) && (
            <div className="mt-3 p-2 bg-red-900/20 border border-red-700 rounded text-xs text-red-300">
              Some submissions failed. Check console for details.
            </div>
          )}
        </div>
      )}

      {/* Manual Submission URLs */}
      <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
        <h4 className="text-md font-medium text-white mb-3">🔗 Manual Submission URLs</h4>
        <div className="space-y-2 text-xs">
          {getWebmasterTools().map((tool, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-300">{tool.name}</span>
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Submit →
              </a>
            </div>
          ))}
        </div>
        <button
          onClick={handleCopySubmissionUrls}
          className="mt-3 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
        >
          📋 Copy All URLs
        </button>
      </div>

      {/* Search Engine List */}
      <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
        <h4 className="text-md font-medium text-white mb-3">🌍 Supported Search Engines</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
          <div>• Google (Worldwide)</div>
          <div>• Bing & Yahoo (Worldwide)</div>
          <div>• Yandex (Russia/CIS)</div>
          <div>• DuckDuckGo (Auto-indexed)</div>
          <div>• Baidu (China)</div>
          <div>• Naver (Korea)</div>
          <div>• Seznam (Czech Republic)</div>
          <div>• Qwant (Europe)</div>
        </div>
      </div>
    </div>
  );
}
