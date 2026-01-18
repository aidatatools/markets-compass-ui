import { Metadata } from 'next';
import PredictionContainer from './PredictionContainer';

interface Props {
  params: Promise<{
    symbol: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const symbol = resolvedParams.symbol.toUpperCase();

  return {
    title: `${symbol} Predictions | Markets Compass`,
    description: `Market predictions and forecasts for ${symbol}`,
  };
}

export default async function PredictionPage({ params }: Props) {
  const resolvedParams = await params;
  const symbol = resolvedParams.symbol.toUpperCase();

  return (
    <div className="container mx-auto px-4 py-8">
      <PredictionContainer symbol={symbol} />
    </div>
  );
} 