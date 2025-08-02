import React, { useState, useEffect } from 'react';
import { NewsItem } from '../types';
import { fetchLatestCryptoNews, getFilteredCryptoNews, refreshCryptoNews } from '../utils/newsAPI';
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  ExternalLink, 
  Calendar, 
  RefreshCw,
  Filter,
  Search,
  Eye,
  Newspaper,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const CryptoNews: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  
  // Filtering and pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<'ALL' | 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'>('ALL');
  const [impactFilter, setImpactFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [maxAge, setMaxAge] = useState<number>(24); // Hours

  // Load news data
  const loadNews = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      let newsData: NewsItem[];
      
      if (forceRefresh) {
        newsData = await refreshCryptoNews();
      } else {
        newsData = await fetchLatestCryptoNews();
      }
      
      setNews(newsData);
      setLastUpdated(Date.now());
      console.log(`📰 Loaded ${newsData.length} crypto news articles`);
      
    } catch (err) {
      console.error('Failed to load crypto news:', err);
      setError('Failed to load latest crypto news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter news based on current filters
  const getFilteredNews = () => {
    let filtered = news;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query)
      );
    }

    // Sentiment filter
    if (sentimentFilter !== 'ALL') {
      filtered = filtered.filter(item => item.sentiment === sentimentFilter);
    }

    // Impact filter
    if (impactFilter !== 'ALL') {
      filtered = filtered.filter(item => item.impact === impactFilter);
    }

    // Age filter
    const maxAgeMs = maxAge * 3600000; // Convert hours to milliseconds
    const cutoffTime = Date.now() - maxAgeMs;
    filtered = filtered.filter(item => item.timestamp > cutoffTime);

    return filtered;
  };

  const filteredNews = getFilteredNews();
  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Initial load and auto-refresh
  useEffect(() => {
    loadNews();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => loadNews(true), 300000);
    
    return () => clearInterval(interval);
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sentimentFilter, impactFilter, maxAge]);

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

  const handleRefresh = () => {
    loadNews(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Newspaper className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Real-Time Crypto News</h2>
          </div>
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Loading...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
            <div className="text-blue-400 font-bold text-lg">{news.length}</div>
            <div className="text-blue-300 text-xs">Total Articles</div>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-3 text-center">
            <div className="text-emerald-400 font-bold text-lg">
              {news.filter(n => n.sentiment === 'POSITIVE').length}
            </div>
            <div className="text-emerald-300 text-xs">Positive News</div>
          </div>
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-center">
            <div className="text-red-400 font-bold text-lg">
              {news.filter(n => n.impact === 'HIGH').length}
            </div>
            <div className="text-red-300 text-xs">High Impact</div>
          </div>
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
            <div className="text-purple-400 font-bold text-lg">{filteredNews.length}</div>
            <div className="text-purple-300 text-xs">Filtered Results</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
        {/* Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search news articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Sentiment Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Sentiment:</span>
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value as any)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All</option>
              <option value="POSITIVE">Positive</option>
              <option value="NEUTRAL">Neutral</option>
              <option value="NEGATIVE">Negative</option>
            </select>
          </div>

          {/* Impact Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Impact:</span>
            <select
              value={impactFilter}
              onChange={(e) => setImpactFilter(e.target.value as any)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Max Age Filter */}
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Max Age:</span>
            <select
              value={maxAge}
              onChange={(e) => setMaxAge(Number(e.target.value))}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value={1}>1 hour</option>
              <option value={6}>6 hours</option>
              <option value={12}>12 hours</option>
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* News Articles */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg">
        {loading && news.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-transparent"></div>
            <span className="ml-3 text-gray-400">Loading latest crypto news...</span>
          </div>
        ) : paginatedNews.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <Eye className="w-8 h-8 text-gray-400 mr-3" />
            <span className="text-gray-400">No news articles match your current filters</span>
          </div>
        ) : (
          <div className="space-y-1">
            {paginatedNews.map((newsItem, index) => (
              <div 
                key={newsItem.id} 
                className="bg-gray-900 p-4 hover:bg-gray-850 transition-colors cursor-pointer border-b border-gray-700 last:border-b-0"
                onClick={() => handleNewsClick(newsItem.url)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium text-white line-clamp-2 flex-1 hover:text-blue-400 transition-colors">
                    {newsItem.title}
                  </h3>
                  <div className="flex items-center space-x-2 ml-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactBadge(newsItem.impact)}`}>
                      {newsItem.impact}
                    </span>
                    <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                  {newsItem.summary}
                </p>
                
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center space-x-1 ${getSentimentColor(newsItem.sentiment)}`}>
                      {getSentimentIcon(newsItem.sentiment)}
                      <span className="font-medium">{newsItem.sentiment}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-blue-400">
                      <span className="font-medium">{newsItem.source}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(newsItem.timestamp)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Published: {formatPublishedDate(newsItem.publishedAt)}</span>
                  </div>
                  <span className="text-blue-400 hover:text-blue-300 underline cursor-pointer">
                    Read Full Article →
                  </span>
                </div>
                
                {newsItem.relevantPairs.length > 0 && (
                  <div className="pt-3 border-t border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">Relevant Trading Pairs:</div>
                    <div className="flex flex-wrap gap-1">
                      {newsItem.relevantPairs.slice(0, 5).map(pair => (
                        <span key={pair} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded hover:bg-gray-600 transition-colors">
                          {pair}
                        </span>
                      ))}
                      {newsItem.relevantPairs.length > 5 && (
                        <span className="px-2 py-1 bg-gray-700 text-xs text-gray-400 rounded">
                          +{newsItem.relevantPairs.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-700 bg-gray-900">
            <div className="text-sm text-gray-400">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredNews.length)} of {filteredNews.length} articles
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded ${
                        currentPage === pageNum
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Auto-refresh Notice */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>Auto-updates every 5 minutes</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Only updated news (last {maxAge}h)</span>
            <span>•</span>
            <span>Real-time sentiment analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoNews;
