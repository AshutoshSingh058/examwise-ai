import { getDb } from './mongodb';

export interface KBSource {
  id: string;
  title: string;
  type: "text" | "pdf" | "youtube" | "document";
  subject: string;
  addedAt: string;
  status: "processed" | "pending" | "failed";
  content: string;
  userId?: string;
}

const COLLECTION = 'knowledge_base';

export async function getSources(userId?: string): Promise<KBSource[]> {
  try {
    if (!userId) return [];
    
    const db = await getDb();
    const sources = await db.collection<KBSource>(COLLECTION)
      .find({ userId })
      .sort({ addedAt: -1 })
      .toArray();
    return sources;
  } catch (error) {
    console.error('[KB-DB] getSources error:', error);
    return [];
  }
}

export async function addSource(source: Omit<KBSource, "id" | "addedAt"> & { userId: string }): Promise<KBSource> {
  const newSource: KBSource = {
    ...source,
    id: Math.random().toString(36).substring(2, 11),
    addedAt: new Date().toISOString()
  }
  
  const db = await getDb();
  await db.collection<KBSource>(COLLECTION).insertOne(newSource);
  return newSource;
}

export async function deleteSource(id: string, userId: string): Promise<void> {
  const db = await getDb();
  await db.collection<KBSource>(COLLECTION).deleteOne({ id, userId });
}

export async function claimLegacyData(userId: string, legacySources: KBSource[] = []) {
  if (!legacySources || legacySources.length === 0) return;
  
  const db = await getDb();
  const sourcesWithUserId = legacySources.map(s => ({ ...s, userId }));
  await db.collection<KBSource>(COLLECTION).insertMany(sourcesWithUserId);
}

