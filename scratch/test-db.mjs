import { MongoClient } from 'mongodb';

async function test() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set in environment');
    return;
  }

  console.log('Testing connection to:', uri.replace(/:([^@]+)@/, ':****@'));
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Successfully connected to MongoDB Atlas!');
    
    const db = client.db('examwise');
    const usersCount = await db.collection('users').countDocuments();
    console.log('Total users in MongoDB:', usersCount);

    const nikhil = await db.collection('users').findOne({ email: 'nikhilmehla@gmail.com' });
    if (nikhil) {
      console.log('Found Nikhil Mehla in MongoDB!');
      console.log('Password in DB:', nikhil.password);
    } else {
      console.log('Nikhil Mehla NOT found in MongoDB.');
    }

  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await client.close();
  }
}

test();
