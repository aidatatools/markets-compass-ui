import { Metadata } from 'next';
import PredictionContainer from './PredictionContainer';

interface Props {
  params: {
    symbol: string;
  };
}

export const metadata: Metadata = {
  title: 'SPY Predictions | Markets Compass',
  description: 'Market predictions and forecasts for SPY',
};

export default async function PredictionPage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const symbol = resolvedParams.symbol.toUpperCase();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PredictionContainer symbol={symbol} />
    </div>
  );
} 