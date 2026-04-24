import fs from "fs/promises"
import { existsSync, mkdirSync } from "fs"
import path from "path"

export interface ActivityEvent {
  userId: string;
  sessionId?: string;
  subject: string;
  course: string;
  topic: string;
  action: "chat" | "upload" | "view";
  queryType?: string;
  time: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const ACTIVITY_FILE = path.join(DATA_DIR, "activity.json");

// Subject Detection Keywords
const SUBJECT_KEYWORDS: Record<string, string[]> = {
  "DBMS": ["dbms", "database", "sql", "normalization", "transaction", "acid", "query", "normalization", "relational", "normalization"],
  "Web Technology": ["web", "html", "css", "js", "javascript", "react", "nextjs", "http", "server", "frontend", "backend"],
  "Operating Systems": ["os", "operating system", "kernel", "process", "thread", "scheduling", "deadlock", "paging", "segmentation"],
  "Data Structures": ["dsa", "data structure", "algorithm", "link list", "tree", "graph", "stack", "queue", "sorting", "searching"],
  "Computer Networks": ["network", "tcp", "ip", "osi", "routing", "switch", "protocol", "lan", "wan", "http", "dns"]
};

// DBMS Key Topics for Detection
const DBMS_KEYWORDS: Record<string, string[]> = {
  "Database Fundamentals": ["dbms", "database", "rdbms", "intro", "basics"],
  "Normalization": ["normalization", "normal form", "1nf", "2nf", "3nf", "bcnf", "4nf", "5nf"],
  "Transactions": ["transaction", "acid", "atomicity", "consistency", "isolation", "durability", "commit", "rollback"],
  "Concurrency Control": ["concurrency", "locking", "2pl", "deadlock", "wound-wait", "wait-die", "timestamp ordering"],
  "SQL": ["sql", "select", "insert", "update", "delete", "join", "query", "ddl", "dml"],
  "Indexing": ["index", "b-tree", "b+ tree", "hashing", "primary index", "secondary index"],
  "ER Modeling": ["er diagram", "entity", "relationship", "cardinality", "attribute", "er-to-relational"],
  "Storage & Sharding": ["sharding", "partitioning", "raid", "disk storage", "buffer management"],
  "Relational Algebra": ["relational algebra", "projection", "selection", "cartesian product", "set theory"],
};

/**
 * Detects the Subject from text using keyword matching
 */
export function detectSubject(text: string): string {
  const content = text.toLowerCase();
  for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      return subject;
    }
  }
  return "General";
}

/**
 * Detects the specific topic from text using keyword matching
 */
export function detectTopic(text: string): string {
  const content = text.toLowerCase();
  
  for (const [topic, keywords] of Object.entries(DBMS_KEYWORDS)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      return topic;
    }
  }
  
  return "General";
}

/**
 * Logs a new activity event to the shared activity.json file
 */
export async function logActivity(event: Omit<ActivityEvent, "time">) {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }

    let activities: ActivityEvent[] = [];
    if (existsSync(ACTIVITY_FILE)) {
      const data = await fs.readFile(ACTIVITY_FILE, "utf-8");
      activities = JSON.parse(data);
    }

    const newEvent: ActivityEvent = {
      ...event,
      time: new Date().toISOString(),
    };

    activities.push(newEvent);

    // Retention Policy: Keep last 5000 events to manage file size
    if (activities.length > 5000) {
      activities = activities.slice(-5000);
    }

    await fs.writeFile(ACTIVITY_FILE, JSON.stringify(activities, null, 2));
    console.log(`📡 [Activity] Logged: ${newEvent.action} - ${newEvent.topic} (${newEvent.subject})`);
  } catch (error) {
    console.error("❌ [Activity] Failed to log activity:", error);
  }
}

/**
 * Returns all logged activities for aggregation
 */
export async function getActivities(): Promise<ActivityEvent[]> {
  try {
    if (!existsSync(ACTIVITY_FILE)) return [];
    const data = await fs.readFile(ACTIVITY_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

/**
 * Identifies topics that are trending in the community but haven't been covered by the user.
 * Now filters by subject to ensure relevance.
 */
export async function getBlindSpots(userId: string, subject?: string): Promise<string[]> {
  const allActivities = await getActivities();
  
  // 1. Get community top topics (filtered by subject if provided)
  const topicCounts: Record<string, number> = {};
  allActivities.forEach(a => {
    const isTargetSubject = !subject || a.subject.toLowerCase() === subject.toLowerCase();
    if (isTargetSubject && a.topic && a.topic !== "General") {
      topicCounts[a.topic] = (topicCounts[a.topic] || 0) + 1;
    }
  });

  const trending = Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([topic]) => topic);

  // 2. Get user's covered topics (in this subject)
  const userCovered = new Set(
    allActivities
      .filter(a => a.userId === userId && (!subject || a.subject.toLowerCase() === subject.toLowerCase()))
      .map(a => a.topic)
  );

  // 3. Find intersection (what's trending but user missed)
  const blindSpots = trending.filter(t => !userCovered.has(t));
  
  return blindSpots;
}
