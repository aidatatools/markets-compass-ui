'use client';

import Link from 'next/link';
import Image from 'next/image';
import TimeDisplay from '@/components/TimeDisplay';
import FeedbackForm from '@/components/FeedbackForm';

const STOCKS = [
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
  { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF' },
  { symbol: 'GLD', name: 'SPDR Gold Trust' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="relative w-full h-[300px] mb-8">
        <Image
          src="/markets-aidatatools-com.jpg"
          alt="Markets Compass Cover"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Markets Compass</h1>
            <p className="text-gray-600 dark:text-gray-400">Track major market indices and commodities</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <TimeDisplay />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
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

        <div className="max-w-2xl mx-auto">
          <FeedbackForm />
        </div>
      </div>
    </div>
  );
}
