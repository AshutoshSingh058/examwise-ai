import { NextResponse } from 'next/server';
import { createChatSession } from '@/lib/chat-db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { title } = await req.json().catch(() => ({}));
    const newSession = await createChatSession(userId, title || 'New Chat');

    return NextResponse.json(newSession);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
