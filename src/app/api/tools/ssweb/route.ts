import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections, Timestamp } from '@/lib/firebase-admin';
import { sendToDiscord } from '@/lib/discord';

async function takeScreenshot(url: string) {
  try {
    // Using a public screenshot API or service
    const response = await fetch(`https://api.screenshotone.com/take?access_key=free&url=${encodeURIComponent(url)}&format=png&full_page=true&device_scale_factor=1`);
    
    if (!response.ok) {
      throw new Error(`Screenshot API error: ${response.status}`);
    }
    
    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString('base64');
    
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Screenshot error:', error);
    throw new Error('Failed to take screenshot');
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "Unknown";

  try {
    const body = await request.json();
    const { url, apikey } = body;

    if (!url) {
      return NextResponse.json(
        { status: false, error: "URL parameter is required" },
        { status: 400 }
      );
    }

    if (!apikey) {
      return NextResponse.json(
        { status: false, error: "API key is required" },
        { status: 401 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { status: false, error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Validate API key
    const keySnap = await adminDb
      .collection(adminCollections.apiKeys)
      .where("key", "==", apikey)
      .limit(1)
      .get();

    if (keySnap.empty) {
      return NextResponse.json(
        { status: false, error: "Invalid API key" },
        { status: 403 }
      );
    }

    const keyDoc = keySnap.docs[0];
    const keyData = keyDoc.data();

    if (!keyData.isActive) {
      return NextResponse.json(
        { status: false, error: "API key is disabled" },
        { status: 403 }
      );
    }

    if (keyData.usage >= keyData.limit) {
      return NextResponse.json(
        { status: false, error: "API key usage limit reached" },
        { status: 429 }
      );
    }

    // Take screenshot
    const screenshot = await takeScreenshot(url);

    // Update usage
    await keyDoc.ref.update({
      usage: (keyData.usage || 0) + 1,
      lastUsed: Timestamp.now(),
    });

    // Send log to Discord
    await sendToDiscord({
      ip,
      endpoint: "/api/tools/ssweb",
      method: "POST",
      query: { url, apikey },
      response: { success: true, screenshotLength: screenshot.length },
    });

    return NextResponse.json({
      status: true,
      result: {
        url,
        screenshot,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error("SS Web Error:", error);

    // Log error to Discord
    await sendToDiscord({
      ip,
      endpoint: "/api/tools/ssweb",
      method: "POST",
      query: {},
      response: { error: error.message },
    });

    return NextResponse.json(
      { status: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}