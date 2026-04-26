import { NextResponse } from 'next/server';
import { PrepService } from '@/lib/ai/prep-service';
import { getAIModel, isAIConfigured } from '@/lib/ai/gemini';
import { createChatSession, addMessageToSession } from '@/lib/chat-db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!isAIConfigured()) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
    }

    // 1. Gather Context
    const { subject, context } = await PrepService.gatherContext(userId);

    // 2. Generate Prep Content via Gemini
    const model = getAIModel("CHAT_MODEL");
    const prompt = PrepService.buildPrepPrompt(context, subject);
    
    const result = await model.generateContent(prompt);
    const prepContent = result.response.text();

    // 3. Create a New Chat Session for this Prep
    const title = `⚡ Prep: ${subject}`;
    const session = await createChatSession(userId, title);
    
    // Add the AI response as the first message
    await addMessageToSession(userId, session.id, {
      role: 'assistant',
      content: prepContent
    });


    return NextResponse.json({ chatId: session.id });
  } catch (error: any) {
    console.error('Prep Generation Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate prep guide',
      details: error.message 
    }, { status: 500 });
  }
}
