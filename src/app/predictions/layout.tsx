import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market Predictions | Markets Compass',
  description: 'View market predictions and forecasts for major indices and ETFs',
};

export default function PredictionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 