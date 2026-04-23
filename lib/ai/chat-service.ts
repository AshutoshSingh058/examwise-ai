import { getAIModel } from "./gemini";
import { KBSource } from "@/lib/kb-db";

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export interface ChatSessionOptions {
  history?: ChatMessage[];
  systemInstruction?: string;
}

export class ChatService {
  /**
   * Encapsulated Knowledge Base Filtering
   */
  static filterKB(sources: KBSource[], query: string, contextText: string = ""): KBSource[] {
    const searchContext = `${query} ${contextText}`.toLowerCase();
    const keywords = searchContext.split(/\W+/).filter(k => k.length > 2);

    return sources.filter(source => {
      const title = source.title.toLowerCase();
      const subject = source.subject.toLowerCase();

      if (title.includes("syllabus") || subject.includes("syllabus")) return true;
      if (source.subject === "Quick Attach") return true;

      return keywords.some(keyword => title.includes(keyword) || subject.includes(keyword));
    });
  }

  /**
   * Unified System Instruction Builder
   */
  static buildSystemInstruction(profile: any, filteredSources: KBSource[], sessionDocs: any[] = [], messageCount: number = 0): string {
    let instruction = "You are ExamWise AI, an expert exam preparation tutor for college students.";

    if (profile && profile.name) {
      instruction = `You are ExamWise AI, an expert exam preparation tutor tutoring ${profile.name} at ${profile.college}. ` +
        `Focus on their ${profile.course} curriculum for ${profile.semester}. `;
    }

    if (filteredSources.length > 0) {
      instruction += "\n\nKNOWLEDGE BASE CONTEXT:\n" +
        filteredSources.map(s => `--- SOURCE: ${s.title} (${s.subject}) ---\n${s.content}\n--- END SOURCE ---`).join("\n\n");
    }

    if (sessionDocs && sessionDocs.length > 0) {
      instruction += "\n\nSESSION DOCUMENTS:\n" +
        sessionDocs.map((s: any) => `--- DOC: ${s.name} ---\n${s.content}\n--- END DOC ---`).join("\n\n");
    }

    if (messageCount === 1) {
      instruction += "\n\nFORMAT: Provide a strategy with Top Topics, Likely Questions, Hour Plan, and Memory Tricks.";
    } else {
      instruction += "\n\nFORMAT: Transition to direct expert mode. Provide clear, concise answers.";
    }

    return instruction;
  }

  /**
   * SDK-Native Chat Session Starter
   */
  static async startChatSession(options: ChatSessionOptions) {
    const model = getAIModel({ systemInstruction: options.systemInstruction });
    
    const chatHistory = (options.history || []).map(msg => ({
      role: msg.role === "model" ? "model" as const : "user" as const,
      parts: [{ text: msg.content }]
    }));

    return model.startChat({
      history: chatHistory,
    });
  }
}
