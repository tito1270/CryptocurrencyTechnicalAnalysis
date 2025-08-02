import React, { useState } from 'react';
import { performAnalysis } from '../utils/analysisEngine';
import { AnalysisResult } from '../types';

const TestAnalyzer: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing analyze function...');
      
      const testResult = await performAnalysis(
        'BTC/USDT',
        'binance',
        '1h',
        'SPOT',
        ['rsi', 'macd', 'bollinger'],
        ['golden_cross', 'breakout']
      );
      
      setResult(testResult);
      alert('✅ Test SUCCESSFUL! Analyze function is working!');
      
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      alert(`❌ Test FAILED: ${err.message}`);
      console.error('Test error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-red-800 border-2 border-red-500 rounded-lg p-4 m-4">
      <h2 className="text-white text-xl font-bold mb-4">🧪 ANALYZE FUNCTION TEST</h2>
      
      <button
        onClick={handleTest}
        disabled={isAnalyzing}
        className={`px-6 py-3 rounded-lg font-bold ${
          isAnalyzing 
            ? 'bg-yellow-600 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700'
        } text-white`}
      >
        {isAnalyzing ? '🔄 Testing...' : '🚀 TEST ANALYZE FUNCTION'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-900 border border-red-600 rounded text-red-200">
          <strong>ERROR:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-green-900 border border-green-600 rounded text-green-200">
          <strong>SUCCESS!</strong> Analysis completed for {result.pair}<br/>
          Recommendation: {result.recommendation}<br/>
          Confidence: {result.confidence}%<br/>
          Entry Price: ${result.entryPrice.toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default TestAnalyzer;