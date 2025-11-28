import { NextRequest, NextResponse } from 'next/server';

async function getRandomPapAyang() {
  try {
    // This would be implemented with actual papayang image API
    // For now, return a placeholder
    const imageUrls = [
      "https://i.imgur.com/example1.jpg",
      "https://i.imgur.com/example2.jpg",
      "https://i.imgur.com/example3.jpg"
    ];
    return imageUrls[Math.floor(Math.random() * imageUrls.length)];
  } catch (error) {
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const imageUrl = await getRandomPapAyang();
    
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
    console.error('Random PapAyang Error:', error);
    return NextResponse.json({ 
      status: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}