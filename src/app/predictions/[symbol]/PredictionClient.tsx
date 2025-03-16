'use client';

import { useEffect, useState } from 'react';
import PredictionContent from '@/components/PredictionContent';

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

export default function PredictionClientPage({ symbol }: Props) {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/predictions/${symbol}`);
        const data = await response.json();
        
        if (!data) {
          throw new Error('Failed to fetch prediction');
        }
        
        setPrediction(data);
        setError(null);
      } catch (err) {
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

  return <PredictionContent prediction={prediction} />;
} 