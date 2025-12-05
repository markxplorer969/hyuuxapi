import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Auth debug endpoint',
    timestamp: new Date().toISOString(),
    note: 'This endpoint always accessible - check browser console for auth state'
  });
}