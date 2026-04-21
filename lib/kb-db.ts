import fs from "fs/promises"
import path from "path"

export interface KBSource {
  id: string
  title: string
  type: "text" | "pdf" | "youtube" | "document"
  subject: string
  addedAt: string
  status: "processed" | "pending" | "failed"
  content: string
}

const dataDir = path.join(process.cwd(), "data")
const dbPath = path.join(dataDir, "examwise_memory.json")

async function ensureDb() {
  try {
    await fs.mkdir(dataDir, { recursive: true })
    try {
      await fs.access(dbPath)
    } catch {
      await fs.writeFile(dbPath, "[]")
    }
  } catch (error) {
    console.error("Failed to initialize DB", error)
  }
}

export async function getSources(): Promise<KBSource[]> {
  await ensureDb()
  const data = await fs.readFile(dbPath, "utf-8")
  return JSON.parse(data)
}

export async function addSource(source: Omit<KBSource, "id" | "addedAt">): Promise<KBSource> {
  const sources = await getSources()
  const newSource: KBSource = {
    ...source,
    id: crypto.randomUUID(),
    addedAt: new Date().toISOString()
  }
  sources.push(newSource)
  await fs.writeFile(dbPath, JSON.stringify(sources, null, 2))
  return newSource
}

export async function deleteSource(id: string): Promise<void> {
  let sources = await getSources()
  sources = sources.filter(s => s.id !== id)
  await fs.writeFile(dbPath, JSON.stringify(sources, null, 2))
}
