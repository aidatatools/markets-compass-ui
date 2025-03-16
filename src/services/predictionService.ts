import { MongoClient, Document } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export interface Prediction {
  symbol: string;
  timestamp: Date;
  shortTerm: {
    direction: 'up' | 'down' | 'neutral';
    confidence: number;
    prediction: string;
  };
  mediumTerm: {
    direction: 'up' | 'down' | 'neutral';
    confidence: number;
    prediction: string;
  };
  longTerm: {
    direction: 'up' | 'down' | 'neutral';
    confidence: number;
    prediction: string;
  };
}

type PredictionDocument = Document & Prediction;

export async function getLatestPrediction(symbol: string): Promise<Prediction | null> {
  if (!symbol) {
    throw new Error('Symbol is required');
  }

  try {
    console.log('Connecting to MongoDB...');
    const client = await clientPromise;
    console.log('Connected successfully to MongoDB');

    const db = client.db('markets_compass');
    const collection = db.collection<PredictionDocument>('predictions');

    console.log(`Fetching prediction for symbol: ${symbol.toUpperCase()}`);
    const prediction = await collection
      .find({ symbol: symbol.toUpperCase() })
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();
    
    console.log(`Found ${prediction.length} predictions for ${symbol.toUpperCase()}`);

    if (prediction.length === 0) {
      console.log(`No predictions found for ${symbol.toUpperCase()}`);
      return null;
    }

    // Convert the MongoDB document to our Prediction type
    const { _id, ...predictionData } = prediction[0];
    
    // Log the prediction data for debugging
    console.log('Prediction data:', JSON.stringify(predictionData, null, 2));
    
    return {
      ...predictionData,
      timestamp: new Date(predictionData.timestamp)
    };
  } catch (error) {
    console.error('Detailed error in getLatestPrediction:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      symbol,
      mongoUri: uri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://[username]:[password]@')
    });
    throw new Error(`Failed to fetch prediction: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 