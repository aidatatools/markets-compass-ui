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
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-lg text-white">Loading chart data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Calculate price change and percentage
  const latestPrice = data.length > 0 ? data[data.length - 1].close : 0;
  const previousPrice = data.length > 1 ? data[data.length - 2].close : latestPrice;
  const priceChange = latestPrice - previousPrice;
  const percentChange = previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">{symbol}</h1>
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Markets
          </Link>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center mt-1">
            <span className="text-2xl font-semibold">${latestPrice.toFixed(2)}</span>
            <span className={`ml-2 px-2 py-1 rounded text-sm ${isPositive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
              {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="bg-[#1E222D] rounded-xl p-4 shadow-lg mb-6">
          <StockChart
            data={data}
            symbol={symbol}
            height={600}
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Open</h3>
            <p className="text-xl font-semibold">${data.length > 0 ? data[data.length - 1].open.toFixed(2) : 'N/A'}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">High</h3>
            <p className="text-xl font-semibold">${data.length > 0 ? data[data.length - 1].high.toFixed(2) : 'N/A'}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Low</h3>
            <p className="text-xl font-semibold">${data.length > 0 ? data[data.length - 1].low.toFixed(2) : 'N/A'}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Volume</h3>
            <p className="text-xl font-semibold">{data.length > 0 ? (data[data.length - 1].volume).toLocaleString() : 'N/A'}</p>
          </div>
        </div>
        
        <div className="text-sm text-gray-400 mb-8">
          * Showing adjusted prices for accurate historical comparison
        </div>
      </div>
    </div>
  );
} 