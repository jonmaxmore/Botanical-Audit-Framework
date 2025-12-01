import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // In production, clear server-side session here

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
