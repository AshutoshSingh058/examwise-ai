import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_DIR = path.join(DATA_DIR, 'users');
const REGISTRY_PATH = path.join(DATA_DIR, 'registry.json');

const OLD_USERS_PATH = path.join(DATA_DIR, 'users.json');
const OLD_CHATS_PATH = path.join(DATA_DIR, 'chats.json');
const OLD_KB_PATH = path.join(DATA_DIR, 'examwise_memory.json');

async function migrate() {
  console.log('🚀 Starting Hierarchical Migration...');

  // Ensure registry exists
  if (!fs.existsSync(REGISTRY_PATH)) {
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify({ emails: {} }, null, 2));
  }

  const registryData = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));

  // 1. Migrate Users
  if (fs.existsSync(OLD_USERS_PATH)) {
    console.log('👤 Migrating users...');
    const users = JSON.parse(fs.readFileSync(OLD_USERS_PATH, 'utf8')).users || [];
    for (const user of users) {
      const userDir = path.join(USERS_DIR, user.id);
      if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
      
      fs.writeFileSync(path.join(userDir, 'profile.json'), JSON.stringify(user, null, 2));
      registryData.emails[user.email.toLowerCase()] = user.id;
    }
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registryData, null, 2));
  }

  // 2. Migrate Chats
  if (fs.existsSync(OLD_CHATS_PATH)) {
    console.log('💬 Migrating chats...');
    const sessions = JSON.parse(fs.readFileSync(OLD_CHATS_PATH, 'utf8')).sessions || [];
    const grouped = sessions.reduce((acc: any, s: any) => {
      if (!acc[s.userId]) acc[s.userId] = [];
      acc[s.userId].push(s);
      return acc;
    }, {});

    for (const [userId, userSessions] of Object.entries(grouped)) {
      const userDir = path.join(USERS_DIR, userId);
      if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
      fs.writeFileSync(path.join(userDir, 'chats.json'), JSON.stringify({ sessions: userSessions }, null, 2));
    }
  }

  // 3. Migrate Knowledge Base
  if (fs.existsSync(OLD_KB_PATH)) {
    console.log('📚 Migrating Knowledge Base...');
    const sources = JSON.parse(fs.readFileSync(OLD_KB_PATH, 'utf8')).sources || [];
    const grouped = sources.reduce((acc: any, s: any) => {
      // If unowned, assign to the first user found or skip (usually first login will claim)
      const targetUserId = s.userId || Object.values(registryData.emails)[0];
      if (targetUserId) {
        if (!acc[targetUserId]) acc[targetUserId] = [];
        acc[targetUserId].push(s);
      }
      return acc;
    }, {});

    for (const [userId, userSources] of Object.entries(grouped)) {
      const userDir = path.join(USERS_DIR, userId as string);
      if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
      fs.writeFileSync(path.join(userDir, 'kb.json'), JSON.stringify({ sources: userSources }, null, 2));
    }
  }

  console.log('✅ Migration Complete!');
  console.log('Cleaning up old flat files...');
  // Optional: move to backup instead of delete
  const backupDir = path.join(DATA_DIR, 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
  
  if (fs.existsSync(OLD_USERS_PATH)) fs.renameSync(OLD_USERS_PATH, path.join(backupDir, 'users.json.bak'));
  if (fs.existsSync(OLD_CHATS_PATH)) fs.renameSync(OLD_CHATS_PATH, path.join(backupDir, 'chats.json.bak'));
  if (fs.existsSync(OLD_KB_PATH)) fs.renameSync(OLD_KB_PATH, path.join(backupDir, 'examwise_memory.json.bak'));
}

migrate().catch(console.error);
