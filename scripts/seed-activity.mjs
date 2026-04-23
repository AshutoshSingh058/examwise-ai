import fs from "fs/promises"
import { existsSync, mkdirSync } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_DIR = path.join(DATA_DIR, "users");
const ACTIVITY_FILE = path.join(DATA_DIR, "activity.json");

const SUBJECTS = ["DBMS", "Data Structures", "Web Technology", "Operating Systems"];
const TOPICS = {
  "DBMS": ["Normalization", "SQL", "Transactions", "Concurrency Control", "Indexing", "ER Modeling"],
  "Data Structures": ["Binary Trees", "Linked Lists", "Graphs", "Stacks", "Queues", "Sorting"],
  "Web Technology": ["React", "HTML/CSS", "Next.js", "JavaScript"],
  "Operating Systems": ["Paging", "Deadlocks", "Process Scheduling", "Memory Management"]
};

const COURSES = ["BTech CSE", "BTech IT", "BCA"];

async function seed() {
  console.log("🌱 Starting Seeding Process...");

  // 1. Generate 10 Fake Users & Profiles
  /** @type {string[]} */
  const userIds = [];
  for (let i = 0; i < 10; i++) {
    const userId = uuidv4();
    userIds.push(userId);
    const userDir = path.join(USERS_DIR, userId);
    
    if (!existsSync(userDir)) {
      mkdirSync(userDir, { recursive: true });
    }

    const profile = {
      id: userId,
      name: `Student_${i + 1}`,
      course: COURSES[Math.floor(Math.random() * COURSES.length)],
      semester: `${Math.floor(Math.random() * 8) + 1}th Sem`,
      college: "ExamWise Institute",
      university: "State Technical University",
      subject: SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)]
    };

    await fs.writeFile(path.join(userDir, "profile.json"), JSON.stringify(profile, null, 2));
    
    // Also create empty chats.json to avoid errors
    await fs.writeFile(path.join(userDir, "chats.json"), JSON.stringify({ sessions: [] }, null, 2));
  }
  console.log(`✅ Created 10 users and profiles in ${USERS_DIR}`);

  // 2. Generate 60 Activity Events
  const activities = [];
  const now = new Date();

  for (let i = 0; i < 60; i++) {
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
    const topics = TOPICS[subject];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const action = Math.random() > 0.8 ? "upload" : "chat";
    
    // 70% of events in the last 12 hours (to trigger "Rising")
    // 30% in the last 48 hours
    const isRecent = Math.random() > 0.3;
    const hoursAgo = isRecent ? Math.random() * 12 : Math.random() * 48;
    const time = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString();

    activities.push({
      userId,
      subject,
      course: COURSES[Math.floor(Math.random() * COURSES.length)],
      topic,
      action,
      queryType: Math.random() > 0.5 ? "query" : "strategy",
      time
    });
  }

  // Sort by time
  activities.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  await fs.writeFile(ACTIVITY_FILE, JSON.stringify(activities, null, 2));
  console.log(`✅ Created 60 activity signals in ${ACTIVITY_FILE}`);
  console.log("🌟 Seeding Complete! Refresh the Hot Topics page to see the results.");
}

seed().catch(console.error);
