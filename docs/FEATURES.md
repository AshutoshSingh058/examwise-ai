# Feature Deep-Dive: ExamWise AI

Explore the powerful features that make ExamWise AI a great study companion.

## 💬 1. Intelligent Chat System
The heart of ExamWise is its contextual chat, powered by **Gemini AI**.
- **Context Awareness**: The AI doesn't just answer general questions; it understands your specific study materials.
- **LaTeX Support**: Perfectly renders mathematical formulas and scientific notation using `katex`.
- **Markdown Support**: Rich formatting for better readability.
- **Session Persistence**: All conversations are saved to MongoDB and can be resumed at any time.

## 📚 2. Knowledge Base (KB)
Turn any document into a source of knowledge.
- **Multi-Format Support**:
    - **PDFs**: Full text extraction.
    - **Office Docs**: Support for `.docx`, `.pptx`, etc.
    - **YouTube Transcripts**: Paste a URL to "watch" the video through the AI.
- **Personalized Storage**: Each user has their own private KB, ensuring data privacy and relevant context.

## 🔥 3. Hot Topics (Community Trends)
Stay ahead by seeing what the community is focusing on.
- **Aggregation Engine**: Analyzes global activity logs to identify trending topics.
- **Real-time Updates**: The dashboard dynamically reflects changing trends in the academic community.
- **Visual Insights**: Uses `recharts` to provide a visual overview of topic popularity.

## 🙈 4. Blind Spots
Identify what you *don't* know.
- **Gap Analysis**: By comparing your chat history and knowledge base against common curriculum topics, ExamWise identifies potential "Blind Spots".
- **Actionable Advice**: Provides suggestions on which topics to focus on next to ensure a well-rounded understanding.

## 👤 5. User Management
- **Profile Customization**: Manage your learning preferences.
- **Unified Dashboard**: Access all your chats, KB sources, and insights from a single view.
- **Secure Data**: All user-specific data is keyed by a unique `userId`, ensuring isolation in the database.
