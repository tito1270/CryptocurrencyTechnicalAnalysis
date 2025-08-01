import React, { useEffect } from 'react';
import { SEOOptimizer, type SEOConfig } from '../utils/seoOptimization';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords: string | string[];
  canonical?: string;
  ogImage?: string;
  structuredData?: object;
  page?: string;
  enableOptimization?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogImage = '/crypto-analyzer-og-image.jpg',
  structuredData,
  page = 'home',
  enableOptimization = true
}) => {
  useEffect(() => {
    let optimizedSEO;

    if (enableOptimization) {
      // Optimize for Google compliance
      const config: SEOConfig = {
        title,
        description,
        keywords: Array.isArray(keywords) ? keywords : keywords.split(', '),
        url: canonical || window.location.href,
        image: ogImage
      };

      optimizedSEO = SEOOptimizer.optimize(config);

      // Log warnings in development
      if (process.env.NODE_ENV === 'development' && optimizedSEO.warnings.length > 0) {
        console.warn('SEO Optimization Warnings:', optimizedSEO.warnings);
      }
    } else {
      optimizedSEO = {
        title,
        description,
        keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords,
        ogTitle: title,
        ogDescription: description,
        twitterTitle: title,
        twitterDescription: description,
        structuredData: structuredData || {},
        warnings: []
      };
    }

    // Update document title
    document.title = optimizedSEO.title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', optimizedSEO.description);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', optimizedSEO.keywords);
    }

    // Add or update meta robots
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    // Add meta viewport if missing
    let metaViewport = document.querySelector('meta[name="viewport"]');
    if (!metaViewport) {
      metaViewport = document.createElement('meta');
      metaViewport.setAttribute('name', 'viewport');
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      document.head.appendChild(metaViewport);
    }

    // Add meta charset if missing
    let metaCharset = document.querySelector('meta[charset]');
    if (!metaCharset) {
      metaCharset = document.createElement('meta');
      metaCharset.setAttribute('charset', 'UTF-8');
      document.head.insertBefore(metaCharset, document.head.firstChild);
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', optimizedSEO.ogTitle);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', optimizedSEO.ogDescription);
    }

    const ogImageTag = document.querySelector('meta[property="og:image"]');
    if (ogImageTag) {
      ogImageTag.setAttribute('content', ogImage);
    }

    // Add missing OG tags
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', canonical || window.location.href);
    }

    const ogType = document.querySelector('meta[property="og:type"]');
    if (ogType) {
      ogType.setAttribute('content', 'website');
    }

    const ogSiteName = document.querySelector('meta[property="og:site_name"]');
    if (ogSiteName) {
      ogSiteName.setAttribute('content', 'CryptoAnalyzer Pro');
    }

    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', optimizedSEO.twitterTitle);
    }

    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', optimizedSEO.twitterDescription);
    }

    const twitterImage = document.querySelector('meta[property="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute('content', ogImage);
    }

    const twitterCard = document.querySelector('meta[property="twitter:card"]');
    if (twitterCard) {
      twitterCard.setAttribute('content', 'summary_large_image');
    }

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical || window.location.href);

    // Add hreflang for international SEO
    let hreflangLink = document.querySelector('link[rel="alternate"][hreflang="en"]');
    if (!hreflangLink) {
      hreflangLink = document.createElement('link');
      hreflangLink.setAttribute('rel', 'alternate');
      hreflangLink.setAttribute('hreflang', 'en');
      hreflangLink.setAttribute('href', canonical || window.location.href);
      document.head.appendChild(hreflangLink);
    }

    // Update structured data with optimized version
    const finalStructuredData = enableOptimization ? optimizedSEO.structuredData : structuredData;
    if (finalStructuredData) {
      let structuredDataScript = document.querySelector('#structured-data');
      if (!structuredDataScript) {
        structuredDataScript = document.createElement('script');
        structuredDataScript.setAttribute('type', 'application/ld+json');
        structuredDataScript.setAttribute('id', 'structured-data');
        document.head.appendChild(structuredDataScript);
      }
      structuredDataScript.textContent = JSON.stringify(finalStructuredData);
    }

    // Add DNS prefetch and preconnect for performance
    const dnsPrefetches = [
      '//fonts.googleapis.com',
      '//api.coingecko.com',
      '//www.google-analytics.com'
    ];

    dnsPrefetches.forEach(href => {
      let link = document.querySelector(`link[rel="dns-prefetch"][href="${href}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'dns-prefetch');
        link.setAttribute('href', href);
        document.head.appendChild(link);
      }
    });

    // Add theme color for mobile browsers
    let themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
      themeColor = document.createElement('meta');
      themeColor.setAttribute('name', 'theme-color');
      themeColor.setAttribute('content', '#10B981');
      document.head.appendChild(themeColor);
    }

  }, [title, description, keywords, canonical, ogImage, structuredData, page, enableOptimization]);

  return null; // This component doesn't render anything
};

export default SEOHead;
