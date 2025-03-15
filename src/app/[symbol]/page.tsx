import { Metadata } from 'next';
import StockPageContent from '@/components/StockPageContent';

type Props = {
  params: { symbol: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Ensure params is resolved
  const symbol = params.symbol;
  
  return {
    title: `${symbol} | Markets Compass`,
  };
}

// Define valid symbols to ensure the page is generated for them
export function generateStaticParams() {
  return [
    { symbol: 'SPY' },
    { symbol: 'QQQ' },
    { symbol: 'DIA' },
    { symbol: 'GLD' },
  ];
}

export default async function Page({ params }: Props) {
  // Ensure params is resolved
  const symbol = params.symbol;
  
  return <StockPageContent symbol={symbol} />;
} 