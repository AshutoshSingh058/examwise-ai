import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_DIR = path.join(DATA_DIR, 'users');
const REGISTRY_PATH = path.join(DATA_DIR, 'registry.json');

// Ensure directories exist
if (!fs.existsSync(USERS_DIR)) {
  fs.mkdirSync(USERS_DIR, { recursive: true });
}

// Ensure registry exists
if (!fs.existsSync(REGISTRY_PATH)) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify({ emails: {} }, null, 2));
}

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
    semester: string;
    examDate?: string;
  };
  createdAt: string;
}

/**
 * Registry Helper: Maps email to userId
 */
function getRegistry(): Record<string, string> {
  try {
    const data = fs.readFileSync(REGISTRY_PATH, 'utf8');
    return JSON.parse(data).emails;
  } catch (e) {
    return {};
  }
}

function saveRegistry(emails: Record<string, string>) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify({ emails }, null, 2));
}

/**
 * User Helper: Path to a specific user's profile
 */
function getUserProfilePath(userId: string): string {
  const userDir = path.join(USERS_DIR, userId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  return path.join(userDir, 'profile.json');
}

export function findUserById(id: string): User | undefined {
  try {
    const profilePath = getUserProfilePath(id);
    if (!fs.existsSync(profilePath)) return undefined;
    const data = fs.readFileSync(profilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return undefined;
  }
}

export function findUserByEmail(email: string): User | undefined {
  const registry = getRegistry();
  const userId = registry[email.toLowerCase()];
  if (!userId) return undefined;
  return findUserById(userId);
}

export function createUser(email: string, password?: string): User {
  const userId = uuidv4();
  const newUser: User = {
    id: userId,
    email: email.toLowerCase(),
    password: password,
    isProfileComplete: false,
    createdAt: new Date().toISOString()
  };
  
  // 1. Update Registry
  const registry = getRegistry();
  registry[email.toLowerCase()] = userId;
  saveRegistry(registry);
  
  // 2. Save Profile
  fs.writeFileSync(getUserProfilePath(userId), JSON.stringify(newUser, null, 2));
  
  return newUser;
}

export function updateUserProfile(id: string, profile: User['profile']): User | null {
  const user = findUserById(id);
  if (!user) return null;
  
  const updatedUser: User = {
    ...user,
    profile,
    isProfileComplete: true
  };
  
  fs.writeFileSync(getUserProfilePath(id), JSON.stringify(updatedUser, null, 2));
  return updatedUser;
}

// Keep for migration script
export { REGISTRY_PATH, USERS_DIR, getUserProfilePath };
