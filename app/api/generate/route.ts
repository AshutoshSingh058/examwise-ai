import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getSources } from "@/lib/kb-db";

export async function POST(req: Request) {
  try {
    const { prompt, history, profileContext, sessionDocs, userMessageCount, userId } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Attempt to read the Gemini API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: "Server Error: GEMINI_API_KEY is not configured in .env.local" 
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const sources = await getSources(userId);
    
    // --- SMART FOCUS FILTERING ---
    // 1. Identify search keywords from history, prompt, and profile
    const historyText = (history || []).map((m: any) => m.content).join(" ");
    const searchContext = `${prompt} ${historyText} ${profileContext?.course || ""} ${profileContext?.semester || ""}`.toLowerCase();
    
    // 2. Filter sources based on relevance
    const filteredSources = sources.filter(source => {
      const title = source.title.toLowerCase();
      const subject = source.subject.toLowerCase();
      
      // RULE A: Always include Syllabuses
      if (title.includes("syllabus") || subject.includes("syllabus")) return true;
      
      // RULE B: Always include current chat session attachments (LEGACY: for old docs in storage)
      if (source.subject === "Quick Attach") return true;
      
      // RULE C: Fuzzy Match Keywords (WT, Web Technology, etc.)
      const keywords = searchContext.split(/\W+/).filter(k => k.length > 2);
      const isMatch = keywords.some(keyword => title.includes(keyword) || subject.includes(keyword));
      
      return isMatch;
    });

    console.log(`🎯 [Smart Focus] Context filtered: ${filteredSources.length}/${sources.length} sources active.`);
    
    let kbKnowledge = "";
    if (filteredSources.length > 0) {
      kbKnowledge += "\n\nCRITICAL CONTEXT FROM RELEVANT KNOWLEDGE BASE SOURCES:\n" + 
        filteredSources.map(s => `--- SOURCE: ${s.title} (${s.subject}) ---\n${s.content}\n--- END SOURCE ---`).join("\n\n");
    }

    // --- SESSION-ONLY CONTEXT ---
    if (sessionDocs && sessionDocs.length > 0) {
      kbKnowledge += "\n\nTEMPORARY SESSION-ONLY DOCUMENTS (Question Papers/Current Task):\n" + 
        sessionDocs.map((s: any) => `--- SESSION DOC: ${s.name} ---\n${s.content}\n--- END DOC ---`).join("\n\n");
      console.log(`📎 [Session Context] Included ${sessionDocs.length} temporary documents.`);
    }

    let systemInstruction = "You are ExamWise AI, an expert exam preparation tutor for college students.";
    if (profileContext && profileContext.name) {
       systemInstruction = `You are ExamWise AI, an expert exam preparation tutor. You are currently tutoring ${profileContext.name}. ` +
       `The student is studying at ${profileContext.college}, ${profileContext.university}. ` +
       `They are in their ${profileContext.semester} of ${profileContext.course}. ` +
       (profileContext.examDate ? `Their upcoming exam is on ${profileContext.examDate}. ` : "") +
       `Tailor all your responses to prioritize helping them understand their coursework thoroughly and concisely, aligning with their curriculum and providing step-by-step guidance.`;
    }

    systemInstruction += kbKnowledge;

    // --- STRATEGIC VS DIRECT RESPONSE LOGIC ---
    if (userMessageCount === 1) {
      systemInstruction += "\n\nCRITICAL OUTPUT FORMAT INSTRUCTION (FIRST RESPONSE STRATEGY):\n" +
        "This is the first interaction for this topic. Provide a comprehensive strategy using these sections:\n" +
        "### 📋 Top Topics\n### ❓ Likely Questions\n### ⏳ Hour Plan\n### 🛑 What To Skip\n### 🧠 Memory Trick\n### 🎯 Confidence: [Score]/10";
    } else {
      systemInstruction += "\n\nDIRECT RESPONSE INSTRUCTION:\n" +
        "Transition to direct expert mode. Provide an accurate, clear, and concise study answer to the user's specific query without the 6-step strategy structure. Keep the focus on explaining the concepts directly.";
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction 
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate AI content" }, { status: 500 });
  }
}
