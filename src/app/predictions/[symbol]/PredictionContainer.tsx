'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface Prediction {
  _id: string;
  symbolId: string;
  prediction: string;
  confidence: number;
  timestamp: string;
  rawResponse: {
    success: boolean;
    answer: string;
    learnings: string[];
    visitedUrls: string[];
  };
  markdownReport: string;
  htmlReport: string;
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
  return (confidence * 100).toFixed(2);
}

function getPredictionEmoji(prediction: string): string {
  const lowerPrediction = prediction.toLowerCase();
  if (lowerPrediction.includes('up') || lowerPrediction.includes('rise') || lowerPrediction.includes('increase') || lowerPrediction.includes('higher')) {
    return ' ⬆️';
  } else if (lowerPrediction.includes('down') || lowerPrediction.includes('fall') || lowerPrediction.includes('decrease') || lowerPrediction.includes('lower')) {
    return ' ⬇️';
  }
  return '';
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
        
        console.log('Received data:', {
          success: response.ok,
          status: response.status,
          hasData: !!data,
          hasMarkdownReport: data?.markdownReport ? 'yes' : 'no'
        });
        
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

  console.log('Rendering prediction:', {
    id: prediction._id,
    symbol: prediction.symbolId,
    hasMarkdownReport: !!prediction.markdownReport,
    markdownReportLength: prediction.markdownReport?.length
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{symbol} Market Predictions</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Powered by OpenAI o3-mini model for real-time market analysis via Deep-research
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Prediction</h2>
            <p className="mt-1 text-lg font-semibold">
              {prediction.prediction}{getPredictionEmoji(prediction.prediction)}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Confidence</h2>
            <p className="mt-1 text-lg font-semibold">{formatConfidence(prediction.confidence)}%</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</h2>
            <p className="mt-1 text-lg font-semibold">
              {formatDate(predictionDate)}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Time ({timezone})</h2>
            <p className="mt-1 text-lg font-semibold">
              {formatTime(predictionDate)}
            </p>
          </div>
        </div>
      </div>

      {prediction.markdownReport ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <article className="prose prose-slate lg:prose-lg dark:prose-invert
            prose-h1:text-3xl prose-h1:font-extrabold prose-h1:mb-4 prose-h1:text-blue-900 dark:prose-h1:text-blue-100
            prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-3 prose-h2:text-blue-800 dark:prose-h2:text-blue-200
            prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-2 prose-h3:text-blue-700 dark:prose-h3:text-blue-300
            prose-p:text-base prose-p:leading-7 prose-p:mb-4 prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-strong:text-blue-700 dark:prose-strong:text-blue-300 prose-strong:font-bold
            prose-ul:list-disc prose-ul:pl-5 prose-ul:my-4
            prose-li:my-2 prose-li:text-gray-700 dark:prose-li:text-gray-300
            prose-table:border-collapse prose-table:w-full
            prose-td:border prose-td:p-2 prose-td:border-gray-300 dark:prose-td:border-gray-600
            prose-th:bg-gray-100 dark:prose-th:bg-gray-700 prose-th:border prose-th:p-2 prose-th:border-gray-300 dark:prose-th:border-gray-600">
            <div className="space-y-4">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-3xl font-extrabold text-blue-900 dark:text-blue-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-6" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mt-8 mb-4" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mt-6 mb-3" {...props} />,
                  p: ({node, ...props}) => <p className="text-gray-700 dark:text-gray-300 leading-7 mb-4" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-blue-700 dark:text-blue-300" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 my-4 space-y-2" {...props} />,
                  li: ({node, ...props}) => <li className="text-gray-700 dark:text-gray-300" {...props} />,
                  hr: ({node, ...props}) => <hr className="my-8 border-gray-200 dark:border-gray-700" {...props} />,
                }}
              >
                {prediction.markdownReport}
              </ReactMarkdown>
            </div>
          </article>
        </div>
      ) : (
        <div className="p-6">
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded">
            No markdown report available for this prediction
          </div>
        </div>
      )}
    </div>
  );
} 