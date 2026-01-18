import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const symbolId = resolvedParams.symbol.toUpperCase();
    console.log('Fetching prediction for symbol:', symbolId);

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined');
    }

    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('items');
    const predictions = db.collection('predictions');

    const prediction = await predictions
      .find({ symbol: symbolId })
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray()
      .then(docs => docs[0] || null);

    await client.close();

    if (!prediction) {
      console.log('No prediction found for:', symbolId);
      return NextResponse.json(
        { error: 'No prediction found' },
        { status: 404 }
      );
    }

    console.log('Found prediction:', {
      _id: prediction._id,
      symbol: prediction.symbol,
      timestamp: prediction.timestamp
    });

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