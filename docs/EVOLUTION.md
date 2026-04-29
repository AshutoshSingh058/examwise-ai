# Project Evolution: The ExamWise AI Journey

This document tracks the birth and growth of ExamWise AI, from its initial conception as a Gemini-powered chat tool to a full-fledged intelligent study platform.

## 🟢 Phase 1: The Core (Gemini AI Integration)
**Goal**: Establish a baseline chat experience with Google's Gemini AI.
- Initialized the Next.js project.
- Integrated `@google/generative-ai` SDK.
- Built the core chat interface with markdown and LaTeX support.
- Set up the initial `gemini-1.5-flash` model configuration.

## 📂 Phase 2: Building the Knowledge Base
**Goal**: Allow users to chat with their own documents.
- Implemented document upload functionality.
- Integrated `pdf-parse` and `officeparser` for server-side document processing.
- Created a repository for storing parsed text context.
- Added support for **YouTube Transcripts**, allowing users to ingest video content into their study sessions.

## 👤 Phase 3: Personalization and Multi-User Support
**Goal**: Separate data between users and provide a persistent experience.
- Implemented a local JSON-based storage system (`data/users/[userId]`).
- Separated Chat history and Knowledge Base per user.
- Added user profile management.

## 🔥 Phase 4: Community and Insights (Hot Topics)
**Goal**: Provide users with insights into what others are studying.
- Built a global **Activity Logging** system.
- Developed an aggregation engine to identify **Hot Topics** across the community.
- Implemented **Blind Spots** detection to help users identify gaps in their knowledge.
- Connected these dynamic metrics to the frontend dashboard.

## 🚀 Phase 5: Scaling with MongoDB Atlas
**Goal**: Move from local files to a production-ready cloud database.
- Migrated all JSON data to **MongoDB Atlas**.
- Wrote migration scripts (`scripts/migrate-json-to-mongodb.mjs`) to transition activity logs, user profiles, chats, and KB sources.
- Refactored database logic into a centralized `lib/mongodb.ts` client with lazy initialization for optimized serverless performance.

## 🛠️ Phase 6: Stability and Refinement
**Goal**: Finalize for V1 release.
- Standardized AI model usage to `gemini-2.0-flash-lite` (or the latest stable version).
- Fixed authentication and session persistence edge cases.
- Implemented health check APIs and optimized Vercel build configurations.
- Refined the UI with Radix UI and Tailwind CSS for a premium aesthetic.

---
*Last Updated: April 2026*
