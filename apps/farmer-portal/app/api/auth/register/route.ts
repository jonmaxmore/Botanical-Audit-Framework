import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/lib/roles';

// Mock user counter for ID generation
let userIdCounter = 100;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role, phone, farmName } = body;

    // Validate input
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      );
    }

    // Check if email already exists (in production, check database)
    // For now, we'll just accept any new email

    // Create new user
    const newUser = {
      id: `${++userIdCounter}`,
      email,
      name,
      role: role as UserRole,
      farmerId: role === UserRole.FARMER ? `F${userIdCounter}` : undefined,
      phone: phone || undefined,
      avatar: '',
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    // Create session
    const session = {
      user: newUser,
      token: `mock-token-${newUser.id}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    // In production, save user to database here
    console.log('New user registered:', {
      ...newUser,
      farmName: role === UserRole.FARMER ? farmName : undefined,
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
