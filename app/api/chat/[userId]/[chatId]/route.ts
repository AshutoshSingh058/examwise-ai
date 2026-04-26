import { NextResponse } from 'next/server';
import { getChatSession, addMessageToSession } from '@/lib/chat-db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string, chatId: string }> }
) {
  try {
    const { userId, chatId } = await params;
    const session = await getChatSession(userId, chatId);
    
    if (!session) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string, chatId: string }> }
) {
  try {
    const { userId, chatId } = await params;
    const { role, content } = await req.json();
    
    const updatedSession = await addMessageToSession(userId, chatId, { role, content });

    
    if (!updatedSession) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json(updatedSession);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
