'use client';

import { useParams } from 'next/navigation';

export default function SymbolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
} 