import { NextRequest, NextResponse } from 'next/server';

async function getRandomBlueArchive() {
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/rynxzyy/blue-archive-r-img/refs/heads/main/links.json`,
    );
    const data = await response.json();
    const randomImage = data[Math.floor(data.length * Math.random())];
    return randomImage;
  } catch (error) {
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const imageUrl = await getRandomBlueArchive();
    
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
    console.error('Random BlueArchive Error:', error);
    return NextResponse.json({ 
      status: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}