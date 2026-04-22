import { NextResponse } from 'next/server';
import { getChatSessions } from '@/lib/chat-db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const sessions = getChatSessions(userId);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching chat list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
