import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET() {
  try {
    return NextResponse.json({
      status: true,
      result: config.endpoints
    });
  } catch (error) {
    return NextResponse.json({
      status: false,
      error: 'Failed to fetch endpoints'
    }, { status: 500 });
  }
}