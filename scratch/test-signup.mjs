import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

async function testSignup() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    return;
  }

  const email = `test-${Date.now()}@example.com`;
  const password = 'testpassword';
  
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('examwise');
    
    const newUser = {
      id: uuidv4(),
      email: email.toLowerCase(),
      password: password,
      isProfileComplete: false,
      createdAt: new Date().toISOString()
    };
    
    await db.collection('users').insertOne(newUser);
    console.log('User inserted successfully:', newUser.id);
    
    const found = await db.collection('users').findOne({ id: newUser.id });
    if (found) {
      console.log('User found in DB!');
    }
  } catch (err) {
    console.error('Signup failed:', err);
  } finally {
    await client.close();
  }
}

testSignup();
