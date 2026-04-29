# Developer Guide: Getting Started with ExamWise AI

This guide will help you set up the project locally and understand the development workflow.

## 🛠️ Prerequisites
- **Node.js**: 18.x or higher.
- **npm**: (or pnpm/yarn).
- **MongoDB Atlas Account**: For cloud database.
- **Google AI Studio Key**: For Gemini API access.

## 🚀 Local Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd examwise-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   GEMINI_API_KEY="your_gemini_api_key"
   MONGODB_URI="your_mongodb_atlas_connection_string"
   ```

4. **Initialize Database (Optional)**:
   If you have legacy JSON data in `data/`, run the migration script:
   ```bash
   node scripts/migrate-json-to-mongodb.mjs
   ```
   To seed initial activity data:
   ```bash
   node scripts/seed-activity.mjs
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the result.

## 📁 Key Directories
- `/app`: Contains all routes and layouts.
- `/components`: Shared React components (UI, Chat, etc.).
- `/lib`: Core business logic, DB clients, and AI services.
- `/scripts`: Utility scripts for migration and maintenance.
- `/public`: Static assets.

## 🧪 Development Workflow

### Adding New API Routes
Create a `route.ts` file in a new directory under `app/api/`. Use the lazy-initialized MongoDB client from `lib/mongodb.ts` to ensure stability.

### AI Model Updates
AI configuration is centralized in `lib/ai/config.ts`. To change the model or system instructions, update this file.

### UI Components
We use Radix UI primitives. When adding new UI elements, follow the existing patterns in the `components/` directory.

## 📤 Deployment
The project is optimized for **Vercel**.
- Connect your GitHub repository to Vercel.
- Add `GEMINI_API_KEY` and `MONGODB_URI` to Vercel Environment Variables.
- Vercel will automatically detect the Next.js project and deploy it.

---
> [!NOTE]
> Ensure that your MongoDB Atlas IP Access List includes the IP address from which you are developing or use `0.0.0.0/0` for development (not recommended for production).
