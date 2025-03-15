import { Metadata } from 'next';
import SymbolPageWrapper from '@/components/SymbolPageWrapper';

export const metadata: Metadata = {
  title: 'Stock Details | Markets Compass',
};

// Define valid symbols to ensure the page is generated for them
export function generateStaticParams() {
  return [
    { symbol: 'SPY' },
    { symbol: 'QQQ' },
    { symbol: 'DIA' },
    { symbol: 'GLD' },
  ];
}

export default function Page() {
  return <SymbolPageWrapper />;
} 