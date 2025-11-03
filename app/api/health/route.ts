/**
 * Health check API route placeholder for Next.js validator
 * This is required by Next.js type checking
 * 
 * Note: Actual health check is handled by backend server
 */
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
