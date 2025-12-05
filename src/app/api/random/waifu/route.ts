import { NextRequest, NextResponse } from 'next/server';

async function getRandomWaifu() {
  try {
    const response = await fetch(`https://api.waifu.pics/sfw/waifu`);
    const data = await response.json();
    return data.url;
  } catch (error) {
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const imageUrl = await getRandomWaifu();
    
    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Return the image
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': imageBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Random Waifu Error:', error);
    return NextResponse.json({ 
      status: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}