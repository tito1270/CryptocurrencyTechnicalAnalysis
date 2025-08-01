import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, Search, Eye } from 'lucide-react';
import { SEOOptimizer } from '../utils/seoOptimization';

interface SEOValidatorProps {
  currentPage?: string;
  enabled?: boolean;
}

interface ValidationResult {
  type: 'success' | 'warning' | 'error' | 'info';
  category: string;
  message: string;
  recommendation?: string;
}

export default function SEOValidator({ currentPage = 'home', enabled = true }: SEOValidatorProps) {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [seoScore, setSeoScore] = useState(0);

  useEffect(() => {
    if (!enabled || process.env.NODE_ENV !== 'development') return;

    validateCurrentPage();
  }, [currentPage, enabled]);

  const validateCurrentPage = () => {
    const results: ValidationResult[] = [];
    
    // Get current meta tags
    const title = document.title;
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
    
    // Title validation
    if (title.length < 30) {
      results.push({
        type: 'error',
        category: 'Title',
        message: `Title too short (${title.length} chars)`,
        recommendation: 'Titles should be 30-60 characters for optimal SEO'
      });
    } else if (title.length > 60) {
      results.push({
        type: 'warning',
        category: 'Title',
        message: `Title too long (${title.length} chars)`,
        recommendation: 'Titles over 60 characters may be truncated in search results'
      });
    } else {
      results.push({
        type: 'success',
        category: 'Title',
        message: `Title length optimal (${title.length} chars)`
      });
    }

    // Brand presence in title
    if (!title.toLowerCase().includes('cryptoanalyzer')) {
      results.push({
        type: 'warning',
        category: 'Title',
        message: 'Brand name not found in title',
        recommendation: 'Include "CryptoAnalyzer Pro" for brand recognition'
      });
    }

    // Primary keywords in title
    const primaryKeywords = ['crypto', 'bitcoin', 'ethereum', 'trading', 'analysis'];
    const titleLower = title.toLowerCase();
    const foundKeywords = primaryKeywords.filter(keyword => titleLower.includes(keyword));
    
    if (foundKeywords.length < 2) {
      results.push({
        type: 'warning',
        category: 'Title',
        message: `Only ${foundKeywords.length} primary keywords found in title`,
        recommendation: 'Include more primary keywords: crypto, bitcoin, ethereum, trading, analysis'
      });
    }

    // Description validation
    if (metaDescription.length < 120) {
      results.push({
        type: 'error',
        category: 'Description',
        message: `Description too short (${metaDescription.length} chars)`,
        recommendation: 'Descriptions should be 120-160 characters for optimal display'
      });
    } else if (metaDescription.length > 160) {
      results.push({
        type: 'warning',
        category: 'Description',
        message: `Description too long (${metaDescription.length} chars)`,
        recommendation: 'Descriptions over 160 characters may be truncated'
      });
    } else {
      results.push({
        type: 'success',
        category: 'Description',
        message: `Description length optimal (${metaDescription.length} chars)`
      });
    }

    // Keywords validation
    if (!metaKeywords) {
      results.push({
        type: 'warning',
        category: 'Keywords',
        message: 'No meta keywords found',
        recommendation: 'Add meta keywords for better search engine compatibility'
      });
    } else {
      const keywordCount = metaKeywords.split(',').length;
      if (keywordCount > 10) {
        results.push({
          type: 'warning',
          category: 'Keywords',
          message: `Too many keywords (${keywordCount})`,
          recommendation: 'Limit to 10 most relevant keywords'
        });
      } else {
        results.push({
          type: 'success',
          category: 'Keywords',
          message: `Keyword count optimal (${keywordCount})`
        });
      }
    }

    // Open Graph validation
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');

    if (!ogTitle || !ogDescription || !ogImage) {
      results.push({
        type: 'error',
        category: 'Open Graph',
        message: 'Missing Open Graph tags',
        recommendation: 'Add og:title, og:description, and og:image for social sharing'
      });
    } else {
      results.push({
        type: 'success',
        category: 'Open Graph',
        message: 'Open Graph tags complete'
      });
    }

    // Twitter Card validation
    const twitterCard = document.querySelector('meta[property="twitter:card"]')?.getAttribute('content');
    const twitterTitle = document.querySelector('meta[property="twitter:title"]')?.getAttribute('content');

    if (!twitterCard || !twitterTitle) {
      results.push({
        type: 'warning',
        category: 'Twitter',
        message: 'Incomplete Twitter Card tags',
        recommendation: 'Add twitter:card and twitter:title for better Twitter sharing'
      });
    } else {
      results.push({
        type: 'success',
        category: 'Twitter',
        message: 'Twitter Card tags complete'
      });
    }

    // Structured data validation
    const structuredData = document.querySelector('#structured-data');
    if (!structuredData) {
      results.push({
        type: 'warning',
        category: 'Structured Data',
        message: 'No structured data found',
        recommendation: 'Add JSON-LD structured data for rich snippets'
      });
    } else {
      try {
        JSON.parse(structuredData.textContent || '{}');
        results.push({
          type: 'success',
          category: 'Structured Data',
          message: 'Valid structured data found'
        });
      } catch {
        results.push({
          type: 'error',
          category: 'Structured Data',
          message: 'Invalid JSON in structured data',
          recommendation: 'Fix JSON syntax errors in structured data'
        });
      }
    }

    // Canonical URL validation
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
    if (!canonical) {
      results.push({
        type: 'warning',
        category: 'Canonical',
        message: 'No canonical URL found',
        recommendation: 'Add canonical URL to prevent duplicate content issues'
      });
    } else {
      results.push({
        type: 'success',
        category: 'Canonical',
        message: 'Canonical URL present'
      });
    }

    // Calculate SEO score
    const successCount = results.filter(r => r.type === 'success').length;
    const totalChecks = results.length;
    const score = Math.round((successCount / totalChecks) * 100);
    
    setValidationResults(results);
    setSeoScore(score);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (!enabled || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
        title="SEO Validator"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Validation Panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 w-96 max-h-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gray-900 p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                SEO Validator
              </h3>
              <div className={`text-lg font-bold ${getScoreColor(seoScore)}`}>
                {seoScore}%
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">Page: {currentPage}</p>
          </div>

          <div className="max-h-64 overflow-y-auto p-4 space-y-3">
            {validationResults.map((result, index) => (
              <div key={index} className="bg-gray-700 rounded p-3">
                <div className="flex items-start space-x-2">
                  {getIcon(result.type)}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                      {result.category}
                    </div>
                    <div className="text-sm text-white mt-1">
                      {result.message}
                    </div>
                    {result.recommendation && (
                      <div className="text-xs text-gray-300 mt-2 italic">
                        💡 {result.recommendation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 p-3 border-t border-gray-700">
            <button
              onClick={validateCurrentPage}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded transition-colors"
            >
              Re-validate
            </button>
          </div>
        </div>
      )}
    </>
  );
}
