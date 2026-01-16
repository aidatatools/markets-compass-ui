'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

interface DynamicETFCardProps {
  symbol: string;
  name: string;
  description: string;
  stockData?: StockData;
  isLoading: boolean;
  mounted: boolean;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DynamicETFCard({
  symbol,
  name,
  description,
  stockData,
  isLoading,
  mounted,
}: DynamicETFCardProps) {
  const [sparklineData, setSparklineData] = useState<number[]>([]);

  // Fetch historical data for sparkline (last 30 days)
  const { data: candlestickData } = useSWR(
    `/api/stocks/candlestick?symbol=${symbol}&months=1`,
    fetcher,
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (candlestickData?.data) {
      // Get last 30 closing prices for sparkline
      const closingPrices = candlestickData.data
        .slice(-30)
        .map((item: any) => item.close);
      setSparklineData(closingPrices);
    }
  }, [candlestickData]);

  const isPositive = stockData ? stockData.change >= 0 : false;
  const changeColor = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const bgColor = isPositive ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20';

  return (
    <Link
      href={`/${symbol}`}
      className={`group relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 overflow-hidden ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      {/* Animated gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="font-bold text-3xl text-gray-900 dark:text-white">{symbol}</div>
              {!isLoading && stockData && (
                <div className={`text-xs px-2 py-1 rounded-full ${bgColor} ${changeColor} font-semibold`}>
                  {isPositive ? '▲' : '▼'} {Math.abs(stockData.changePercent).toFixed(2)}%
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{description}</div>
          </div>
        </div>

        {/* Price Display */}
        <div className="mb-4">
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24" />
            </div>
          ) : stockData ? (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                ${stockData.price.toFixed(2)}
              </div>
              <div className={`text-sm font-semibold ${changeColor} flex items-center gap-1`}>
                <span>{isPositive ? '+' : ''}{stockData.change.toFixed(2)}</span>
                <span>({isPositive ? '+' : ''}{stockData.changePercent.toFixed(2)}%)</span>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">Data unavailable</div>
          )}
        </div>

        {/* Sparkline Chart */}
        {sparklineData.length > 0 && (
          <div className="mb-4">
            <div className="h-16 w-full">
              <Sparkline data={sparklineData} isPositive={isPositive} />
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {!isLoading && stockData && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
              <div className="text-xs text-gray-500 dark:text-gray-400">Open</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                ${stockData.open?.toFixed(2) || 'N/A'}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
              <div className="text-xs text-gray-500 dark:text-gray-400">High</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                ${stockData.high?.toFixed(2) || 'N/A'}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
              <div className="text-xs text-gray-500 dark:text-gray-400">Low</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                ${stockData.low?.toFixed(2) || 'N/A'}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
              <div className="text-xs text-gray-500 dark:text-gray-400">Volume</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {stockData.volume ? formatVolume(stockData.volume) : 'N/A'}
              </div>
            </div>
          </div>
        )}

        {/* View Details Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">View full chart</span>
          <span className="text-blue-500 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

// Sparkline Component
function Sparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  const [svgPath, setSvgPath] = useState('');

  useEffect(() => {
    if (data.length === 0) return;

    const width = 100;
    const height = 100;
    const padding = 5;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * (width - 2 * padding) + padding;
      const y = height - padding - ((value - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });

    const path = `M ${points.join(' L ')}`;
    setSvgPath(path);
  }, [data]);

  const strokeColor = isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
  const fillColor = isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id={`gradient-${isPositive ? 'up' : 'down'}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      {svgPath && (
        <>
          <path
            d={`${svgPath} L 95,95 L 5,95 Z`}
            fill={`url(#gradient-${isPositive ? 'up' : 'down'})`}
          />
          <path
            d={svgPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}

function formatVolume(volume: number): string {
  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(2)}B`;
  } else if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(2)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(2)}K`;
  }
  return volume.toString();
}
