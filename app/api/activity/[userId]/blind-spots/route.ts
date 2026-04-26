import { NextResponse } from 'next/server';
import { getBlindSpots } from '@/lib/activity-db';

export const dynamic = 'force-dynamic';


export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject") || undefined;
    
    const blindSpots = await getBlindSpots(userId, subject);
    return NextResponse.json({ blindSpots });
  } catch (error) {
    console.error("Blind spots API error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
