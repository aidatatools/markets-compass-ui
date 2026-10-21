import { NextRequest, NextResponse } from 'next/server';
import { getLatestPrediction } from '@/services/predictionService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const symbolId = symbol.toUpperCase();
    console.log('Fetching prediction for symbol:', symbolId);

    const prediction = await getLatestPrediction(symbolId);

    if (!prediction) {
      console.log('No prediction found for:', symbolId);
      return NextResponse.json(
        { error: 'No prediction found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      symbol: prediction.symbol,
      timestamp: prediction.timestamp,
      shortTerm: prediction.shortTerm,
      mediumTerm: prediction.mediumTerm,
      longTerm: prediction.longTerm,
      explanations: prediction.explanations
    });
  } catch (error) {
    console.error('Error fetching prediction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prediction' },
      { status: 500 }
    );
  }
}
