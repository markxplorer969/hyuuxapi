import { NextRequest, NextResponse } from 'next/server';

const cangcut = async (url: string) => {
  const body = new URLSearchParams({
    url,
    token: "153d8f770cb72578abab74c2e257fb85a1fd60dcb0330e32706763c90448ae01",
    hash: "aHR0cHM6Ly93d3cuY2FwY3V0LmNvbS90djIvWlNVQnVFVVBWLw==1037YXBp",
  });

  try {
    const r = await fetch("https://anydownloader.com/wp-json/api/download/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: "https://anydownloader.com",
        Referer:
          "https://anydownloader.com/en/online-capcut-video-downloader-without-watermark/",
        "User-Agent": "Mozilla/5.0",
      },
      body,
    });
    const data = await r.json();
    return data;
  } catch (e) {
    throw new Error((e as Error).message);
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({
        status: false,
        error: 'URL parameter is required'
      }, { status: 400 });
    }

    const result = await cangcut(url);

    return NextResponse.json({
      status: true,
      result: result,
    });
  } catch (error) {
    console.error('Capcut Downloader Error:', error);
    return NextResponse.json({ 
      status: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}