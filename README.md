# 🎓 ExamWise AI

**ExamWise AI** is a premium, Gemini-powered study platform designed to transform your learning materials into interactive knowledge. Chat with your PDFs, YouTube videos, and Office documents while gaining insights from community trends.

![ExamWise AI Banner](https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=1200)

## ✨ Key Features
- **🤖 Gemini-Powered Chat**: High-performance AI contextualized by your own data.
- **📄 Universal Knowledge Base**: Support for PDF, Word, PowerPoint, and YouTube Transcripts.
- **🔥 Hot Topics**: Real-time community trend analysis.
- **🧩 Blind Spot Detection**: Identify and fill gaps in your knowledge.
- **☁️ Cloud Sync**: Fully integrated with MongoDB Atlas for persistent storage.

## 📂 Documentation
For detailed information, please refer to our documentation suite:
- [🚀 **Developer Guide**](./docs/DEVELOPER_GUIDE.md): Local setup and development workflow.
- [🏗️ **Architecture Overview**](./docs/ARCHITECTURE.md): Technical stack and system design.
- [🟢 **Project Evolution**](./docs/EVOLUTION.md): The story and history of ExamWise.
- [💬 **Feature Deep-Dive**](./docs/FEATURES.md): Detailed look at core functionalities.

## 🛠️ Quick Start

### 1. Setup Environment
Create a `.env.local` file:
```env
GEMINI_API_KEY="your_api_key"
MONGODB_URI="your_mongodb_uri"
```

### 2. Install & Run
```bash
npm install
npm run dev
```

## 🏗️ Technology Stack
- **Frontend**: Next.js 15, Tailwind CSS, Radix UI, Recharts.
- **Backend**: Next.js API Routes, Gemini AI SDK.
- **Database**: MongoDB Atlas.
- **Parsing**: pdf-parse, officeparser, youtube-transcript.

---
*Built with ❤️ for students and lifelong learners.*
