import { Metadata } from 'next';
import Link from 'next/link';

const SYMBOLS = ['SPY', 'QQQ', 'DIA', 'GLD'];

export const metadata: Metadata = {
  title: 'Market Predictions | Markets Compass',
  description: 'View market predictions and forecasts for major indices and ETFs',
};

export default function PredictionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Market Predictions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {SYMBOLS.map((symbol) => (
          <Link
            key={symbol}
            href={`/predictions/${symbol}`}
            className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{symbol}</h2>
              <span className="text-sm text-gray-500">View Details →</span>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-600">Short-term Forecast (1-3 days)</h3>
                <p className="text-gray-700">Coming soon</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600">Medium-term Forecast (1-2 weeks)</h3>
                <p className="text-gray-700">Coming soon</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600">Long-term Forecast (1-3 months)</h3>
                <p className="text-gray-700">Coming soon</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 