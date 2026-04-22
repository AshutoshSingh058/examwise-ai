import fs from "fs/promises"
import { existsSync, mkdirSync } from "fs"
import path from "path"

export interface KBSource {
  id: string
  title: string
  type: "text" | "pdf" | "youtube" | "document"
  subject: string
  addedAt: string
  status: "processed" | "pending" | "failed"
  content: string
  userId?: string
}

const DATA_DIR = path.join(process.cwd(), "data")
const USERS_DIR = path.join(DATA_DIR, "users")

// --- DB Logic ---

function getUserKBPath(userId: string): string {
  const userDir = path.join(USERS_DIR, userId);
  if (!existsSync(userDir)) {
    mkdirSync(userDir, { recursive: true });
  }
  return path.join(userDir, 'kb.json');
}

export async function getSources(userId?: string): Promise<KBSource[]> {
  try {
    if (!userId) return []; // In hierarchical mode, we MUST have a userId
    
    const kbPath = getUserKBPath(userId);
    if (!existsSync(kbPath)) return [];
    
    const data = await fs.readFile(kbPath, "utf-8")
    const parsed = JSON.parse(data)
    return parsed.sources || []
  } catch (error) {
    return []
  }
}

export async function addSource(source: Omit<KBSource, "id" | "addedAt"> & { userId: string }): Promise<KBSource> {
  const sources = await getSources(source.userId)
  const newSource: KBSource = {
    ...source,
    id: Math.random().toString(36).substring(2, 11),
    addedAt: new Date().toISOString()
  }
  
  sources.push(newSource)
  const kbPath = getUserKBPath(source.userId);
  await fs.writeFile(kbPath, JSON.stringify({ sources }, null, 2))
  return newSource
}

export async function deleteSource(id: string, userId: string): Promise<void> {
  let sources = await getSources(userId)
  sources = sources.filter(s => s.id !== id)
  const kbPath = getUserKBPath(userId);
  await fs.writeFile(kbPath, JSON.stringify({ sources }, null, 2))
}

// Keep for migration script or anonymous session claiming
export async function claimLegacyData(userId: string, legacySources: KBSource[] = []) {
  if (!legacySources || legacySources.length === 0) return;
  const sources = await getSources(userId);
  const updated = [...sources, ...legacySources.map(s => ({ ...s, userId }))];
  const kbPath = getUserKBPath(userId);
  await fs.writeFile(kbPath, JSON.stringify({ sources: updated }, null, 2));
}
