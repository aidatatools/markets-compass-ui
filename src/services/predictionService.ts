import { prisma } from '@/lib/prisma';

export interface ExplanationItem {
  explanation: string;
  citationUrl: string;
}

export interface TermPrediction {
  direction: 'up' | 'down' | 'neutral';
  confidence: number;
  prediction: string;
}

export interface Prediction {
  symbol: string;
  timestamp: Date;
  shortTerm: TermPrediction;
  mediumTerm: TermPrediction;
  longTerm: TermPrediction;
  explanations?: ExplanationItem[];
}

// Shape of a row in the Prediction table (Json columns come back untyped)
interface PredictionRow {
  symbol: string;
  timestamp: Date;
  shortTerm: unknown;
  mediumTerm: unknown;
  longTerm: unknown;
  explanations: unknown;
}

function toPrediction(row: PredictionRow): Prediction {
  return {
    symbol: row.symbol,
    timestamp: new Date(row.timestamp),
    shortTerm: row.shortTerm as TermPrediction,
    mediumTerm: row.mediumTerm as TermPrediction,
    longTerm: row.longTerm as TermPrediction,
    explanations: row.explanations as ExplanationItem[],
  };
}

export async function getLatestPrediction(symbol: string): Promise<Prediction | null> {
  if (!symbol) {
    throw new Error('Symbol is required');
  }

  const row: PredictionRow | null = await prisma.prediction.findFirst({
    where: { symbol: symbol.toUpperCase() },
    orderBy: { timestamp: 'desc' },
  });

  return row ? toPrediction(row) : null;
}

// Latest prediction for every symbol
export async function getLatestPredictions(): Promise<Prediction[]> {
  const rows: PredictionRow[] = await prisma.prediction.findMany({
    distinct: ['symbol'],
    orderBy: [{ symbol: 'asc' }, { timestamp: 'desc' }],
  });

  return rows.map(toPrediction);
}
