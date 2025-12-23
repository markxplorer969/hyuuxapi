import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const text = url.searchParams.get('text');
    const apikey = url.searchParams.get('apikey');

    if (!text || !apikey) {
      return NextResponse.json(
        { status: false, error: 'text & apikey required' },
        { status: 400 }
      );
    }

    // Simple mock response for testing
    return NextResponse.json({
      status: true,
      result: `OSS AI response to: "${text}" (API Key: ${apikey.substring(0, 4)}****)`,
    });
  } catch (error: any) {
    console.error("AI OSS Test Error:", error);
    return NextResponse.json(
      { status: false, error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}