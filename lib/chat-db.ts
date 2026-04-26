import { getDb } from './mongodb';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

const COLLECTION = 'chats';

export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  try {
    const db = await getDb();
    const sessions = await db.collection<ChatSession>(COLLECTION)
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();
    return sessions;
  } catch (error) {
    console.error(`[Chat-DB] Error reading sessions for user ${userId}:`, error);
    return [];
  }
}

export async function createChatSession(userId: string, title: string = 'New Chat'): Promise<ChatSession> {
  const newSession: ChatSession = {
    id: uuidv4(),
    userId,
    title,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const db = await getDb();
  await db.collection<ChatSession>(COLLECTION).insertOne(newSession);
  return newSession;
}

export async function getChatSession(userId: string, id: string): Promise<ChatSession | undefined> {
  try {
    const db = await getDb();
    const session = await db.collection<ChatSession>(COLLECTION).findOne({ id, userId });
    return session || undefined;
  } catch (error) {
    return undefined;
  }
}

export async function addMessageToSession(userId: string, id: string, message: Omit<ChatMessage, 'timestamp'>): Promise<ChatSession | null> {
  const db = await getDb();
  const session = await getChatSession(userId, id);
  
  if (!session) {
    console.warn(`[Chat-DB] Session ${id} not found for user ${userId}.`);
    return null;
  }
  
  const newMessage: ChatMessage = {
    ...message,
    timestamp: new Date().toISOString()
  };
  
  const messages = [...session.messages, newMessage];
  const updatedAt = new Date().toISOString();
  
  // Update title if it's the first user message AND title is still "New Chat"
  let title = session.title;
  const isDefaultTitle = title === 'New Chat';
  
  if (isDefaultTitle && messages.filter(m => m.role === 'user').length === 1 && message.role === 'user') {
    title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
  }
  
  const result = await db.collection<ChatSession>(COLLECTION).findOneAndUpdate(
    { id, userId },
    { 
      $set: { 
        messages,
        title,
        updatedAt
      } 
    },
    { returnDocument: 'after' }
  );
  
  return result as ChatSession | null;
}

export async function deleteChatSession(userId: string, id: string): Promise<void> {
  const db = await getDb();
  await db.collection<ChatSession>(COLLECTION).deleteOne({ id, userId });
}

