import { NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/user-db';
import { claimLegacyData } from '@/lib/kb-db';
import { createChatSession } from '@/lib/chat-db';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = findUserByEmail(email);
    
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 1. Claim legacy data for this user ID
    await claimLegacyData(user.id);

    // 2. Prepare redirect and optional new session
    let redirectTo = '/setup';
    let newChatId = null;

    if (user.isProfileComplete) {
      // Create a brand new chat session as requested for "Start Preparing" flow
      const session = createChatSession(user.id, 'New Session');
      newChatId = session.id;
      redirectTo = `/chat/${user.id}/${session.id}`;
    }

    // Return user info for state management
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({ 
      user: userWithoutPassword,
      redirectTo,
      newChatId
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
