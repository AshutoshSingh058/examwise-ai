import { getDb } from './mongodb';

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

const COLLECTION = 'activities';

// Subject Detection Keywords (Keep these as they are logic, not DB state)
const SUBJECT_KEYWORDS: Record<string, string[]> = {
  "DBMS": ["dbms", "database", "sql", "normalization", "transaction", "acid", "query", "normalization", "relational", "normalization"],
  "Web Technology": ["web", "html", "css", "js", "javascript", "react", "nextjs", "http", "server", "frontend", "backend"],
  "Operating Systems": ["os", "operating system", "kernel", "process", "thread", "scheduling", "deadlock", "paging", "segmentation"],
  "Data Structures": ["dsa", "data structure", "algorithm", "link list", "tree", "graph", "stack", "queue", "sorting", "searching"],
  "Computer Networks": ["network", "tcp", "ip", "osi", "routing", "switch", "protocol", "lan", "wan", "http", "dns"]
};

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

export function detectSubject(text: string): string {
  const content = text.toLowerCase();
  for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      return subject;
    }
  }
  return "General";
}

export function detectTopic(text: string): string {
  const content = text.toLowerCase();
  for (const [topic, keywords] of Object.entries(DBMS_KEYWORDS)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      return topic;
    }
  }
  return "General";
}

export async function logActivity(event: Omit<ActivityEvent, "time">) {
  try {
    const db = await getDb();
    const newEvent: ActivityEvent = {
      ...event,
      time: new Date().toISOString(),
    };

    await db.collection<ActivityEvent>(COLLECTION).insertOne(newEvent);
    console.log(`📡 [Activity] Logged to MongoDB: ${newEvent.action} - ${newEvent.topic} (${newEvent.subject})`);
  } catch (error) {
    console.error("❌ [Activity] Failed to log activity:", error);
  }
}

export async function getActivities(): Promise<ActivityEvent[]> {
  try {
    const db = await getDb();
    return await db.collection<ActivityEvent>(COLLECTION).find().toArray();
  } catch (error) {
    return [];
  }
}

export async function getBlindSpots(userId: string, subject?: string): Promise<string[]> {
  const allActivities = await getActivities();
  
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

  const userCovered = new Set(
    allActivities
      .filter(a => a.userId === userId && (!subject || a.subject.toLowerCase() === subject.toLowerCase()))
      .map(a => a.topic)
  );

  const blindSpots = trending.filter(t => !userCovered.has(t));
  return blindSpots;
}

