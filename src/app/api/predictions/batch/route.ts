import { NextResponse } from 'next/server';
import { getLatestPredictions } from '@/services/predictionService';

// Make this route dynamic
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Log request timestamp for debugging
    console.log('Predictions batch API call:', new Date().toISOString());

    const latestPredictions = await getLatestPredictions();

    const results = latestPredictions.reduce((acc, pred) => {
      acc[pred.symbol] = {
        shortTerm: pred.shortTerm,
        mediumTerm: pred.mediumTerm,
        longTerm: pred.longTerm,
        timestamp: pred.timestamp
      };
      return acc;
    }, {} as Record<string, any>);

    console.log('Predictions found:', Object.keys(results).length);

    // Create response with no-cache headers
    const response = NextResponse.json(results);
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Expires', '0');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error) {
    console.error('Error fetching batch predictions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}
