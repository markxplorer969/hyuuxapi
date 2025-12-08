import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'If you can see this, your session is active',
    timestamp: new Date().toISOString(),
    note: 'Try logging out and logging back in with an admin account'
  });
}