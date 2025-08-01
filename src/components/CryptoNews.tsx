import React from 'react';
import { NewsItem } from '../types';
import { cryptoNews } from '../data/news';
import { Clock, TrendingUp, TrendingDown, AlertCircle, ExternalLink, Calendar } from 'lucide-react';

const CryptoNews: React.FC = () => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return 'text-emerald-400';
      case 'NEGATIVE': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return <TrendingUp className="w-4 h-4" />;
      case 'NEGATIVE': return <TrendingDown className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      HIGH: 'bg-red-600 text-white',
      MEDIUM: 'bg-yellow-600 text-white',
      LOW: 'bg-green-600 text-white'
    };
    return colors[impact as keyof typeof colors] || 'bg-gray-600 text-white';
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  const formatPublishedDate = (publishedAt: string) => {
    const date = new Date(publishedAt);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleNewsClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Sort news by timestamp (newest first)
  const sortedNews = [...cryptoNews].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Live Crypto News & Sentiment</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-blue-400">LIVE UPDATES</span>
        </div>
      </div>
      
      <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">Scan Integration</span>
        </div>
        <p className="text-xs text-gray-300">
          All news is automatically included in market analysis with date/time stamps. 
          Each scan analyzes sentiment from the latest {cryptoNews.length} news sources.
        </p>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {sortedNews.map(news => (
          <div 
            key={news.id} 
            className="bg-gray-900 rounded-lg p-4 hover:bg-gray-850 transition-colors cursor-pointer border border-gray-700 hover:border-gray-600"
            onClick={() => handleNewsClick(news.url)}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-medium text-white line-clamp-2 flex-1 hover:text-blue-400 transition-colors">
                {news.title}
              </h3>
              <div className="flex items-center space-x-2 ml-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactBadge(news.impact)}`}>
                  {news.impact}
                </span>
                <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
              </div>
            </div>
            
            <p className="text-sm text-gray-300 mb-3 line-clamp-2">
              {news.summary}
            </p>
            
            <div className="flex items-center justify-between text-xs mb-3">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-1 ${getSentimentColor(news.sentiment)}`}>
                  {getSentimentIcon(news.sentiment)}
                  <span className="font-medium">{news.sentiment}</span>
                </div>
                <div className="flex items-center space-x-1 text-blue-400">
                  <span className="font-medium">{news.source}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{formatTimeAgo(news.timestamp)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Published: {formatPublishedDate(news.publishedAt)}</span>
              </div>
              <span className="text-blue-400 hover:text-blue-300 underline cursor-pointer">
                Read Full Article →
              </span>
            </div>
            
            {news.relevantPairs.length > 0 && (
              <div className="pt-3 border-t border-gray-700">
                <div className="text-xs text-gray-400 mb-1">Relevant Trading Pairs:</div>
                <div className="flex flex-wrap gap-1">
                  {news.relevantPairs.slice(0, 5).map(pair => (
                    <span key={pair} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded hover:bg-gray-600 transition-colors">
                      {pair}
                    </span>
                  ))}
                  {news.relevantPairs.length > 5 && (
                    <span className="px-2 py-1 bg-gray-700 text-xs text-gray-400 rounded">
                      +{news.relevantPairs.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Auto-updates every 5 minutes</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>{cryptoNews.length} sources</span>
            <span>•</span>
            <span>Real-time sentiment analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoNews;
