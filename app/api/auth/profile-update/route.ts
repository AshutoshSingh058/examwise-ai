import { NextResponse } from 'next/server';
import { updateUserProfile } from '@/lib/user-db';

export async function POST(req: Request) {
  try {
    const { userId, ...profileData } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updatedUser = await updateUserProfile(userId, profileData);

    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
