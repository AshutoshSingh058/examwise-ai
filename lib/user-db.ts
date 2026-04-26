import { getDb } from './mongodb';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  password?: string;
  isProfileComplete: boolean;
  profile?: {
    name: string;
    college: string;
    university: string;
    course: string;
    subject: string;
    semester: string;
    examDate?: string;
  };
  createdAt: string;
}

const COLLECTION = 'users';

export async function findUserById(id: string): Promise<User | undefined> {
  try {
    const db = await getDb();
    const user = await db.collection<User>(COLLECTION).findOne({ id });
    return user || undefined;
  } catch (error) {
    console.error('[User-DB] findUserById error:', error);
    return undefined;
  }
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  try {
    const db = await getDb();
    const user = await db.collection<User>(COLLECTION).findOne({ email: email.toLowerCase() });
    return user || undefined;
  } catch (error) {
    console.error('[User-DB] findUserByEmail error:', error);
    return undefined;
  }
}

export async function createUser(email: string, password?: string): Promise<User> {
  const userId = uuidv4();
  const newUser: User = {
    id: userId,
    email: email.toLowerCase(),
    password: password,
    isProfileComplete: false,
    createdAt: new Date().toISOString()
  };
  
  const db = await getDb();
  await db.collection<User>(COLLECTION).insertOne(newUser);
  
  return newUser;
}

export async function updateUserProfile(id: string, profile: User['profile']): Promise<User | null> {
  const db = await getDb();
  const result = await db.collection<User>(COLLECTION).findOneAndUpdate(
    { id },
    { 
      $set: { 
        profile,
        isProfileComplete: true 
      } 
    },
    { returnDocument: 'after' }
  );
  
  return result as User | null;
}

