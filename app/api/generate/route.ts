import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getSources } from "@/lib/kb-db";

export async function POST(req: Request) {
  try {
    const { prompt, profileContext } = await req.json();

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
    
    const sources = await getSources();
    let kbKnowledge = "";
    if (sources && sources.length > 0) {
      kbKnowledge = "\n\nCRITICAL CONTEXT FROM USER'S KNOWLEDGE BASE:\n" + 
        sources.map(s => `--- SOURCE: ${s.title} (${s.subject}) ---\n${s.content}\n--- END SOURCE ---`).join("\n\n");
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

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
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
