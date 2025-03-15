require('dotenv').config();
const { MongoClient } = require('mongodb');

// Use the MONGODB_URI from the .env file
const uri = process.env.MONGODB_URI;

async function main() {
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    console.log('Connected to MongoDB Atlas');

    // Specify the database and collection you want to work with
    const database = client.db('sample_mflix');
    const collection = database.collection('comments');

    // Example: Find one document in the collection
    const document = await collection.findOne({});
    console.log('Found document:', document);

  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
  } finally {
    // Close the connection
    await client.close();
  }
}

main().catch(console.error);
