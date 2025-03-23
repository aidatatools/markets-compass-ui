'use client';

import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';

const SYMBOLS = ['SPY', 'QQQ', 'DIA', 'GLD'];

interface Prediction {
  prediction: string;
  confidence: number;
  timestamp: string;
}

interface PredictionSummary {
  [key: string]: Prediction | null;
}

const fetcher = async (url: string) => {
  const response = await fetch(`${url}?t=${Date.now()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch predictions');
  }
  return response.json();
};

export default function PredictionsPage() {
  const { data, error, isLoading, mutate } = useSWR('/api/predictions/batch', fetcher, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: true,
    dedupingInterval: 10000
  });
  
  const formatPredictions = (): PredictionSummary => {
    if (!data) return {};
    
    const results: PredictionSummary = {};
    SYMBOLS.forEach(symbol => {
      const prediction = data[symbol];
      if (prediction) {
        results[symbol] = {
          prediction: prediction.prediction,
          confidence: Math.round(prediction.confidence * 100), // Convert decimal to percentage
          timestamp: prediction.timestamp
        };
      } else {
        results[symbol] = null;
      }
    });
    
    return results;
  };
  
  const predictions = formatPredictions();

  const getPredictionEmoji = (prediction: string): string => {
    const lowerPrediction = prediction?.toLowerCase() || '';
    if (lowerPrediction.includes('up') || lowerPrediction.includes('rise') || 
        lowerPrediction.includes('increase') || lowerPrediction.includes('higher')) {
      return '⬆️';
    }
    if (lowerPrediction.includes('down') || lowerPrediction.includes('fall') || 
        lowerPrediction.includes('decrease') || lowerPrediction.includes('lower')) {
      return '⬇️';
    }
    return '';
  };

  const formatTimestamp = (timestamp: string): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Market Predictions</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {SYMBOLS.map((symbol) => (
            <div key={symbol} className="block bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Market Predictions</h1>
        <button 
          onClick={() => mutate()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {SYMBOLS.map((symbol) => (
          <Link
            key={symbol}
            href={`/predictions/${symbol}`}
            className="block bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{symbol}</h2>
                {predictions[symbol] ? (
                  <div className="mt-2">
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      {predictions[symbol]?.prediction} {getPredictionEmoji(predictions[symbol]?.prediction || '')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Confidence: {predictions[symbol]?.confidence}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Updated: {formatTimestamp(predictions[symbol]?.timestamp || '')}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 mt-2">No prediction available</p>
                )}
              </div>
              <span className="text-blue-500 dark:text-blue-400">View Details →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 