import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function main() {
  const client = new MongoClient(uri as string);

  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');

    const db = client.db('markets_compass');
    console.log('Using database:', db.databaseName);

    const predictions = db.collection('predictions');
    console.log('Using collection:', predictions.collectionName);

    // List all collections in the database
    const collections = await db.listCollections().toArray();
    console.log('\nAvailable collections:', collections.map(c => c.name));

    // Find the latest prediction for SPY
    console.log('\nSearching for SPY predictions...');
    const query = { symbolId: 'SPY' };
    console.log('Query:', JSON.stringify(query));

    const latestPrediction = await predictions.findOne(
      query,
      { sort: { timestamp: -1 } }
    );

    if (latestPrediction) {
      console.log('\nFound prediction:', {
        _id: latestPrediction._id,
        symbolId: latestPrediction.symbolId,
        prediction: latestPrediction.prediction,
        timestamp: latestPrediction.timestamp,
        hasHtmlReport: !!latestPrediction.htmlReport
      });
    } else {
      console.log('\nNo predictions found for SPY');
    }

    // Show all documents in the collection
    console.log('\nAll documents in collection:');
    const allDocs = await predictions.find({}).toArray();
    console.log('Total documents:', allDocs.length);
    allDocs.forEach(doc => {
      console.log('Document:', {
        _id: doc._id,
        symbolId: doc.symbolId,
        prediction: doc.prediction,
        timestamp: doc.timestamp
      });
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

main().catch(console.error); 