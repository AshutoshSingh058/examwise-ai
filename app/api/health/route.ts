import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDb();
    const result = await db.command({ ping: 1 });
    
    return NextResponse.json({ 
      status: 'ok', 
      database: 'connected',
      ping: result,
      env: {
        has_uri: !!process.env.MONGODB_URI,
        node_env: process.env.NODE_ENV
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'error', 
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
