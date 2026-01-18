import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// Make this route dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Log request timestamp for debugging
    console.log('Predictions batch API call:', new Date().toISOString());
    
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined');
    }

    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('items');
    const predictions = db.collection('predictions');

    // Get the latest prediction for each symbol
    const latestPredictions = await predictions.aggregate([
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: '$symbol',
          shortTerm: { $first: '$shortTerm' },
          mediumTerm: { $first: '$mediumTerm' },
          longTerm: { $first: '$longTerm' },
          timestamp: { $first: '$timestamp' }
        }
      }
    ]).toArray();

    await client.close();

    const results = latestPredictions.reduce((acc, pred) => {
      acc[pred._id] = {
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