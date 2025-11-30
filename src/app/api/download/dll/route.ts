import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.nextUrl || request.url);
    const platform = searchParams.get('platform') as string;

    if (!platform || !['windows', 'linux', 'mac'].includes(platform)) {
      return NextResponse.json({
        status: false,
        error: 'Invalid platform. Supported platforms: windows, linux, mac'
      }, { status: 400 });
    }

    // Simulate DLL file generation based on platform
    let dllContent = '';
    let filename = '';

    switch (platform) {
      case 'windows':
        dllContent = 'TVqQAAMAA...'; // Base64 encoded DLL content
        filename = 'slowly-api.dll';
        break;
      case 'linux':
        dllContent = 'f0VMRgIB...'; // Base64 encoded .so content
        filename = 'slowly-api.so';
        break;
      case 'mac':
        dllContent = 'TVqQAAMAA...'; // Base64 encoded .dylib content
        filename = 'slowly-api.dylib';
        break;
    }

    // Create response headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    // Return the DLL file
    return new NextResponse(Buffer.from(dllContent, 'base64'), {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('DLL download error:', error);
    return NextResponse.json({
      status: false,
      error: 'Failed to generate DLL file'
    }, { status: 500 });
  }
}