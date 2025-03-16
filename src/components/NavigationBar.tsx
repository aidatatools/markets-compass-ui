'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SYMBOLS = ['SPY', 'QQQ', 'DIA', 'GLD'];

export default function NavigationBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-800 text-white p-4 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <Link 
          href="/" 
          className={`text-lg font-semibold hover:text-blue-400 transition-colors ${
            pathname === '/' ? 'text-blue-400' : ''
          }`}
        >
          Markets Compass
        </Link>

        <div className="flex items-center space-x-8">
          {/* Charts Dropdown */}
          <div className="relative group">
            <Link
              href="/charts"
              className={`hover:text-blue-400 transition-colors ${
                pathname === '/charts' || pathname.startsWith('/charts/') ? 'text-blue-400' : ''
              }`}
            >
              Charts
            </Link>
            <div className="absolute left-0 mt-2 py-2 w-32 bg-gray-800 rounded-md shadow-xl z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300">
              {SYMBOLS.map((symbol) => (
                <Link
                  key={`chart-${symbol}`}
                  href={`/${symbol}`}
                  className={`block px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                    pathname === `/${symbol}` ? 'text-blue-400' : ''
                  }`}
                >
                  {symbol}
                </Link>
              ))}
            </div>
          </div>

          {/* Predictions Dropdown */}
          <div className="relative group">
            <Link
              href="/predictions"
              className={`hover:text-blue-400 transition-colors ${
                pathname === '/predictions' || pathname.startsWith('/predictions/') ? 'text-blue-400' : ''
              }`}
            >
              Predictions
            </Link>
            <div className="absolute left-0 mt-2 py-2 w-32 bg-gray-800 rounded-md shadow-xl z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300">
              {SYMBOLS.map((symbol) => (
                <Link
                  key={`prediction-${symbol}`}
                  href={`/predictions/${symbol}`}
                  className={`block px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                    pathname === `/predictions/${symbol}` ? 'text-blue-400' : ''
                  }`}
                >
                  {symbol}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 