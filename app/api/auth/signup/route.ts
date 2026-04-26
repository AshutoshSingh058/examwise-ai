import { NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '@/lib/user-db';

export const dynamic = 'force-dynamic';

import { claimLegacyData } from '@/lib/kb-db';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const newUser = await createUser(email, password);
    
    // Claim any legacy data for the newly created user
    await claimLegacyData(newUser.id);

    
    // For this prototype, we'll return the user object (excluding password if possible)
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json({ 
      user: userWithoutPassword,
      redirectTo: '/setup' // New users always go to setup first as per flow
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
