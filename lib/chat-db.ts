import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_DIR = path.join(DATA_DIR, 'users');

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

function getUserChatPath(userId: string): string {
  const userDir = path.join(USERS_DIR, userId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  return path.join(userDir, 'chats.json');
}

export function getChatSessions(userId: string): ChatSession[] {
  try {
    const chatPath = getUserChatPath(userId);
    if (!fs.existsSync(chatPath)) return [];
    
    const data = fs.readFileSync(chatPath, 'utf8');
    const sessions: ChatSession[] = JSON.parse(data).sessions;
    return sessions.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error(`[Chat-DB] Error reading sessions for user ${userId}:`, error);
    return [];
  }
}

export function saveChatSessions(userId: string, sessions: ChatSession[]) {
  try {
    const chatPath = getUserChatPath(userId);
    fs.writeFileSync(chatPath, JSON.stringify({ sessions }, null, 2));
  } catch (error) {
    console.error('Error saving chat sessions:', error);
  }
}

export function createChatSession(userId: string, title: string = 'New Chat'): ChatSession {
  const sessions = getChatSessions(userId);
  const newSession: ChatSession = {
    id: uuidv4(),
    userId,
    title,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  sessions.push(newSession);
  saveChatSessions(userId, sessions);
  return newSession;
}

export function getChatSession(userId: string, id: string): ChatSession | undefined {
  const sessions = getChatSessions(userId);
  return sessions.find(s => s.id === id);
}

export function addMessageToSession(userId: string, id: string, message: Omit<ChatMessage, 'timestamp'>): ChatSession | null {
  const sessions = getChatSessions(userId);
  const index = sessions.findIndex(s => s.id === id);
  
  if (index === -1) {
    console.warn(`[Chat-DB] Session ${id} not found for user ${userId}. Available:`, sessions.map(s => s.id));
    return null;
  }
  
  const newMessage: ChatMessage = {
    ...message,
    timestamp: new Date().toISOString()
  };
  
  sessions[index].messages.push(newMessage);
  sessions[index].updatedAt = new Date().toISOString();
  
  // Update title if it's the first user message
  if (sessions[index].messages.filter(m => m.role === 'user').length === 1 && message.role === 'user') {
    sessions[index].title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
  }
  
  saveChatSessions(userId, sessions);
  return sessions[index];
}

export function deleteChatSession(userId: string, id: string): void {
  let sessions = getChatSessions(userId);
  sessions = sessions.filter(s => s.id !== id);
  saveChatSessions(userId, sessions);
}
