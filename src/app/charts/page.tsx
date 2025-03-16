'use client';

import Link from 'next/link';

const STOCKS = [
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
  { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF' },
  { symbol: 'GLD', name: 'SPDR Gold Trust' },
];

export default function ChartsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Market Charts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {STOCKS.map((stock) => (
          <Link
            key={stock.symbol}
            href={`/${stock.symbol}`}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-2xl text-gray-900 dark:text-white">{stock.symbol}</div>
                <div className="text-gray-600 dark:text-gray-400">{stock.name}</div>
              </div>
              <div className="text-blue-500 dark:text-blue-400">
                View Chart →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 