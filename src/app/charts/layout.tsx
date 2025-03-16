import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Charts | Markets Compass',
  description: 'View detailed market charts and analysis',
};

export default function ChartsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 