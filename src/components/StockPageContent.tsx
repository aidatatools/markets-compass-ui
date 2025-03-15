'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StockChart from '@/components/StockChart';

interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockPageContentProps {
  symbol: string;
}

export default function StockPageContent({ symbol }: StockPageContentProps) {
  const [data, setData] = useState<CandlestickData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/stocks/candlestick?symbol=${symbol}&adjusted=true`);
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch data');
        }
        
        setData(result.data.candlesticks);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{symbol} Chart</h1>
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Markets
          </Link>
        </div>
        <div className="bg-[#1E222D] rounded-xl p-4 shadow-lg">
          <StockChart
            data={data}
            symbol={symbol}
            height={600}
            width={1000}
          />
        </div>
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          * Showing adjusted prices for accurate historical comparison
        </div>
      </div>
    </div>
  );
} 