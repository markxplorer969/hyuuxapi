import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET() {
  try {
    return NextResponse.json({
      status: true,
      result: {
        creator: config.creator,
        whatsapp: config.whatsapp,
        github: config.github,
        youtube: config.youtube,
        apititle: config.apiTitle,
        favicon: config.favicon
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: false,
      error: 'Failed to fetch metadata'
    }, { status: 500 });
  }
}