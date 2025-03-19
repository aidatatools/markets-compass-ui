'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StockChart from '@/components/StockChart';
import useSWR from 'swr';

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

interface ApiResponse {
  success: boolean;
  data: {
    symbol: string;
    candlesticks: CandlestickData[];
  };
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.status}`);
  }
  return response.json();
};

export default function StockPageContent({ symbol }: StockPageContentProps) {
  // Use state to track if we've attempted to load data
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    symbol ? [`/api/stocks/candlestick`, symbol] : null, // Only fetch if symbol is available
    ([url, currentSymbol]) => fetcher(`${url}?symbol=${currentSymbol}&adjusted=true&t=${Date.now()}`),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 0,
      revalidateIfStale: true,
      revalidateOnMount: true,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      onSuccess: () => setHasAttemptedLoad(true),
      onError: () => setHasAttemptedLoad(true),
    }
  );

  // Force a refetch when the symbol changes
  useEffect(() => {
    if (symbol) {
      console.log('Symbol changed to:', symbol, '- forcing refetch');
      setHasAttemptedLoad(false);
      mutate();
    }
  }, [symbol, mutate]);

  // Log data updates
  useEffect(() => {
    console.log('Component rendered with symbol:', symbol);
    
    if (data) {
      console.log('Stock data loaded:', {
        symbol,
        requestedSymbol: symbol,
        returnedSymbol: data.data.symbol,
        timestamp: new Date().toISOString(),
        dataPoints: data.data.candlesticks.length,
        lastDate: data.data.candlesticks.length > 0 
          ? new Date(data.data.candlesticks[data.data.candlesticks.length - 1].timestamp).toISOString()
          : null,
      });
    }
  }, [data, symbol]);

  // Add loading timeout
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        if (isLoading && !data && !hasAttemptedLoad) {
          console.log('Loading timeout reached, forcing refetch');
          setHasAttemptedLoad(true);
          mutate();
        }
      }, 5000); // 5 second timeout

      return () => clearTimeout(timer);
    }
  }, [isLoading, data, hasAttemptedLoad, mutate]);

  // Better loading state detection
  const isLoadingData = isLoading && !data && !hasAttemptedLoad;

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-lg text-white">Loading chart data for {symbol}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-red-500">
          <p>Error loading data: {error.message}</p>
          <button 
            onClick={() => mutate()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const candlestickData = data?.data.candlesticks || [];

  // Calculate price change and percentage
  const latestPrice = candlestickData.length > 0 ? candlestickData[candlestickData.length - 1].close : 0;
  const previousPrice = candlestickData.length > 1 ? candlestickData[candlestickData.length - 2].close : latestPrice;
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
          {candlestickData.length > 0 ? (
            <StockChart
              key={`chart-${symbol}-${Date.now()}`}
              data={candlestickData}
              symbol={symbol}
              height={600}
            />
          ) : (
            <div className="flex items-center justify-center h-[600px] text-white">
              <p>No chart data available for {symbol}</p>
              <button 
                onClick={() => mutate()} 
                className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Retry
              </button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Open</h3>
            <p className="text-xl font-semibold">${candlestickData.length > 0 ? candlestickData[candlestickData.length - 1].open.toFixed(2) : 'N/A'}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">High</h3>
            <p className="text-xl font-semibold">${candlestickData.length > 0 ? candlestickData[candlestickData.length - 1].high.toFixed(2) : 'N/A'}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Low</h3>
            <p className="text-xl font-semibold">${candlestickData.length > 0 ? candlestickData[candlestickData.length - 1].low.toFixed(2) : 'N/A'}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Volume</h3>
            <p className="text-xl font-semibold">{candlestickData.length > 0 ? (candlestickData[candlestickData.length - 1].volume).toLocaleString() : 'N/A'}</p>
          </div>
        </div>
        
        <div className="text-sm text-gray-400 mb-8">
          * Showing adjusted prices for accurate historical comparison
        </div>
      </div>
    </div>
  );
} 