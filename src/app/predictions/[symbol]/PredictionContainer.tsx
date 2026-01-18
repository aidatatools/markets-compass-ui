'use client';

import { useEffect, useState } from 'react';

interface TermPrediction {
  direction: 'up' | 'down' | 'neutral';
  confidence: number;
  prediction: string;
}

interface ExplanationItem {
  explanation: string;
  citationUrl: string;
}

interface Prediction {
  symbol: string;
  timestamp: string;
  shortTerm: TermPrediction;
  mediumTerm: TermPrediction;
  longTerm: TermPrediction;
  explanations: ExplanationItem[];
}

interface Props {
  symbol: string;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function getTimezone(): string {
  const date = new Date();
  const timezone = date.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ')[2];
  return timezone;
}

function formatConfidence(confidence: number): string {
  return (confidence * 100).toFixed(0);
}

function getDirectionEmoji(direction: string): string {
  switch (direction) {
    case 'up':
      return '📈';
    case 'down':
      return '📉';
    default:
      return '➡️';
  }
}

function getDirectionColor(direction: string): string {
  switch (direction) {
    case 'up':
      return 'text-green-600 dark:text-green-400';
    case 'down':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-yellow-600 dark:text-yellow-400';
  }
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.7) return 'bg-green-500';
  if (confidence >= 0.5) return 'bg-yellow-500';
  return 'bg-red-500';
}

function TermCard({ title, term, timeframe }: { title: string; term: TermPrediction; timeframe: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">{timeframe}</span>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{getDirectionEmoji(term.direction)}</span>
        <span className={`text-2xl font-bold capitalize ${getDirectionColor(term.direction)}`}>
          {term.direction}
        </span>
      </div>
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">Confidence</span>
          <span className="font-semibold">{formatConfidence(term.confidence)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getConfidenceColor(term.confidence)}`}
            style={{ width: `${term.confidence * 100}%` }}
          />
        </div>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300">{term.prediction}</p>
    </div>
  );
}

export default function PredictionContainer({ symbol }: Props) {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true);
        console.log('Fetching prediction for:', symbol);

        const response = await fetch(`/api/predictions/${symbol}`);
        const data = await response.json();

        console.log('Received data:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch prediction');
        }

        setPrediction(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching prediction:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [symbol]);

  if (loading) {
    return (
      <div className="animate-pulse p-6">
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded">
          No prediction available for {symbol}
        </div>
      </div>
    );
  }

  const predictionDate = new Date(prediction.timestamp);
  const timezone = getTimezone();

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {symbol} Market Predictions
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI-powered deep research analysis
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Last updated: {formatDate(predictionDate)} at {formatTime(predictionDate)} {timezone}
          </p>
        </div>

        {/* Prediction Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TermCard title="Short Term" term={prediction.shortTerm} timeframe="1-5 days" />
          <TermCard title="Medium Term" term={prediction.mediumTerm} timeframe="1-4 weeks" />
          <TermCard title="Long Term" term={prediction.longTerm} timeframe="1-3 months" />
        </div>
      </div>

      {/* Key Insights */}
      {prediction.explanations && prediction.explanations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Key Insights</h2>
          <div className="space-y-4">
            {prediction.explanations.map((item, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="text-gray-700 dark:text-gray-300 mb-2">{item.explanation}</p>
                <a
                  href={item.citationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Source
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
