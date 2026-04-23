import { NextResponse } from "next/server";
import { getSources } from "@/lib/kb-db";
import { ChatService } from "@/lib/ai/chat-service";
import { isAIConfigured } from "@/lib/ai/gemini";
import { logActivity, detectTopic, detectSubject } from "@/lib/activity-db";

export async function POST(req: Request) {
  try {
    const { prompt, history, profileContext, sessionDocs, userMessageCount, userId, chatId } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!isAIConfigured()) {
      return NextResponse.json({
        error: "Server Error: GEMINI_API_KEY is not configured"
      }, { status: 500 });
    }

    // 1. Get and Filter Knowledge Base
    const sources = await getSources(userId);
    const historyText = (history || []).map((m: any) => m.content).join(" ");
    const filteredSources = ChatService.filterKB(sources, prompt, historyText);

    console.log(`🎯 [Smart Focus] Context filtered: ${filteredSources.length}/${sources.length} sources active.`);

    // 2. Build System Instructions
    const systemInstruction = ChatService.buildSystemInstruction(
      profileContext,
      filteredSources,
      sessionDocs,
      userMessageCount
    );

    // 3. Start Chat Session (Handles history properly)
    const chatSession = await ChatService.startChatSession({
      history,
      systemInstruction
    });

    // 4. Generate Response
    const result = await chatSession.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. Log Activity (Hot Topics Signal)
    logActivity({
      userId,
      sessionId: chatId,
      subject: detectSubject(prompt) || profileContext?.subject || "General",
      course: profileContext?.course || "BTech",
      action: "chat",
      topic: detectTopic(prompt),
      queryType: userMessageCount === 1 ? "strategy" : "query"
    }).catch(e => console.error("Activity Logging Error:", e));

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ 
      error: "Failed to generate AI content",
      details: error.message 
    }, { status: 500 });
  }
}
