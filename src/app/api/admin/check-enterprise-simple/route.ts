import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Enterprise check API is working!',
      timestamp: new Date().toISOString(),
      enterpriseUsers: [], // Empty array for now
      count: 0
    });
  } catch (error) {
    console.error('Enterprise check API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}