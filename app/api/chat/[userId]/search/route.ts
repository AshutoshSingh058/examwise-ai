import { NextResponse } from 'next/server';
import { getChatSessions } from '@/lib/chat-db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.toLowerCase();

    if (!query) {
      return NextResponse.json([]);
    }

    const sessions = getChatSessions(userId);
    
    // Filter sessions based on title or message content
    const results = sessions.filter(session => {
      const titleMatch = session.title.toLowerCase().includes(query);
      const messageMatch = session.messages.some(msg => 
        msg.content.toLowerCase().includes(query)
      );
      return titleMatch || messageMatch;
    }).slice(0, 5); // Return top 5 matches

    return NextResponse.json(results.map(s => ({
      id: s.id,
      title: s.title,
      updatedAt: s.updatedAt
    })));
  } catch (error) {
    console.error('Search Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
