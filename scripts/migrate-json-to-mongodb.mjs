import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_DIR = path.join(DATA_DIR, 'users');
const ENV_PATH = path.join(process.cwd(), '.env.local');

/**
 * Manually parse .env.local to get MONGODB_URI
 */
function getMongoUri() {
  if (!fs.existsSync(ENV_PATH)) {
    throw new Error('.env.local file not found');
  }
  const envContent = fs.readFileSync(ENV_PATH, 'utf8');
  const match = envContent.match(/MONGODB_URI=["']?([^"'\n]+)["']?/);
  if (!match || !match[1]) {
    throw new Error('MONGODB_URI not found in .env.local');
  }
  return match[1];
}

async function migrate() {
  const uri = getMongoUri();
  const client = new MongoClient(uri);

  try {
    console.log('🚀 Starting Migration to MongoDB Atlas...');
    await client.connect();
    const db = client.db('examwise');

    // 1. Migrate Activity Logs
    console.log('\n📡 Migrating Activity Logs...');
    const activityPath = path.join(DATA_DIR, 'activity.json');
    if (fs.existsSync(activityPath)) {
      const activities = JSON.parse(fs.readFileSync(activityPath, 'utf8'));
      if (activities.length > 0) {
        await db.collection('activities').insertMany(activities);
        console.log(`✅ Migrated ${activities.length} activity logs.`);
      }
    } else {
      console.log('ℹ️ No activity logs found.');
    }

    // 2. Migrate User Data
    console.log('\n👤 Migrating Users...');
    if (fs.existsSync(USERS_DIR)) {
      const userDirs = fs.readdirSync(USERS_DIR);
      
      for (const userId of userDirs) {
        const userPath = path.join(USERS_DIR, userId);
        if (!fs.statSync(userPath).isDirectory()) continue;

        console.log(`\n  Processing user: ${userId}`);

        // a. Profile
        const profilePath = path.join(userPath, 'profile.json');
        if (fs.existsSync(profilePath)) {
          const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
          await db.collection('users').updateOne(
            { id: userId },
            { $set: profile },
            { upsert: true }
          );
          console.log(`    ✅ Profile migrated.`);
        }

        // b. Chats
        const chatsPath = path.join(userPath, 'chats.json');
        if (fs.existsSync(chatsPath)) {
          const { sessions } = JSON.parse(fs.readFileSync(chatsPath, 'utf8'));
          if (sessions && sessions.length > 0) {
            // Add userId to each session just in case it's missing (though it shouldn't be)
            const sessionsWithUser = sessions.map(s => ({ ...s, userId }));
            await db.collection('chats').insertMany(sessionsWithUser);
            console.log(`    ✅ ${sessions.length} chat sessions migrated.`);
          }
        }

        // c. Knowledge Base
        const kbPath = path.join(userPath, 'kb.json');
        if (fs.existsSync(kbPath)) {
          const { sources } = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
          if (sources && sources.length > 0) {
            const sourcesWithUser = sources.map(s => ({ ...s, userId }));
            await db.collection('knowledge_base').insertMany(sourcesWithUser);
            console.log(`    ✅ ${sources.length} KB sources migrated.`);
          }
        }
      }
    }

    console.log('\n✨ Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
  } finally {
    await client.close();
  }
}

migrate();
