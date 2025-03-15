'use client';

import { useParams } from 'next/navigation';
import StockPageContent from './StockPageContent';

export default function SymbolPageWrapper() {
  const params = useParams();
  const symbol = typeof params?.symbol === 'string' ? params.symbol : '';
  
  return <StockPageContent symbol={symbol} />;
} 