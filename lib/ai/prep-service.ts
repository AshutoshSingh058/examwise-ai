import { getChatSessions } from '../chat-db';
import { getSources } from '../kb-db';
import { findUserById } from '../user-db';

export class PrepService {
  /**
   * Gathers subject-specific context for a user from recent chats and KB
   */
  static async gatherContext(userId: string) {
    // 1. Get Subject from profile
    let subject = "DBMS"; // Default fallback
    const user = await findUserById(userId);
    
    if (user && user.profile?.subject) {
      subject = user.profile.subject;
    }

    // 2. Get Latest 3 Chats for this subject (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const allSessions = await getChatSessions(userId);

    
    const relevantSessions = allSessions
      .filter(s => {
        const date = new Date(s.updatedAt);
        // For demo purposes, we'll be lenient with the 7-day rule if there are few sessions
        return date > sevenDaysAgo || allSessions.length < 5;
      })
      .slice(0, 3);

    const chatContext = relevantSessions.map(s => {
      return `--- Session: ${s.title} ---\n${s.messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}`;
    }).join('\n\n');

    // 3. Get Recent KB items for this subject
    const allSources = await getSources(userId);
    const relevantSources = allSources
      .filter(src => src.subject.toLowerCase() === subject.toLowerCase())
      .slice(0, 3);

    const kbContext = relevantSources.map(src => {
      return `--- Source: ${src.title} ---\n${src.content?.substring(0, 5000)}`; // Sample content
    }).join('\n\n');

    return {
      subject,
      context: `SUBJECT: ${subject}\n\nRECENT CHAT HISTORY:\n${chatContext}\n\nRELEVANT STUDY MATERIALS:\n${kbContext}`
    };
  }

  static buildPrepPrompt(context: string, subject: string) {
    return `
      You are an elite academic mentor specializing in "Last Minute Preparation" for university students.
      Using the provided context (student's recent chats and study materials), generate a high-intensity revision guide for the subject: ${subject}.
      
      The student has an exam very soon. Be concise, strategic, and encouraging.

      STRUCTURE YOUR RESPONSE EXACTLY WITH THESE SECTIONS:

      # ⚡ Last Minute Prep: ${subject}
      
      ## 🎯 Top 5 Likely Questions
      (Identify the most repeated or critical topics in the context and turn them into likely exam questions)

      ## 📝 Cheat Sheet (Must-Know Concepts)
      (Bullet points of core formulas, definitions, or diagrams mentioned in the materials)

      ## 🔍 Your Personal Weak Spots
      (Based on the chat history, identify areas where the student asked many questions or seemed confused)

      ## 💡 Mnemonics & Memory Tricks
      (Create 2-3 fun mnemonics to help remember the hardest concepts in this subject)

      ## 🚫 What To Skip (If time is short)
      (Identify low-priority or introductory topics that are less likely to carry high marks)

      ## ⏳ Final 90-Minute Revision Plan
      (Provide a minute-by-minute breakdown of how to spend the next 1.5 hours)

      CONTEXT:
      ${context}
    `;
  }
}
