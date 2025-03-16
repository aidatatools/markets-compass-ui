import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined');
    }

    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('markets_compass');
    const predictions = db.collection('predictions');

    // Get the latest prediction for each symbol
    const latestPredictions = await predictions.aggregate([
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: '$symbolId',
          prediction: { $first: '$prediction' },
          confidence: { $first: '$confidence' },
          timestamp: { $first: '$timestamp' }
        }
      }
    ]).toArray();

    await client.close();

    const results = latestPredictions.reduce((acc, pred) => {
      acc[pred._id] = {
        prediction: pred.prediction,
        confidence: pred.confidence,
        timestamp: pred.timestamp
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching batch predictions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
} 