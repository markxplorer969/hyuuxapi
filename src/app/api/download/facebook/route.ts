import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import qs from 'qs';

async function downloadFacebook(url: string) {
  try {
    const payload = qs.stringify({ fb_url: url });
    const res = await axios.post(
      "https://saveas.co/smart_download.php",
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0",
        },
      },
    );
    const $ = cheerio.load(res.data);
    const thumb = $(".box img").attr("src") || null;
    const title = $(".box .info h2").text().trim() || null;
    const desc =
      $(".box .info p").first().text().replace("Description:", "").trim() ||
      null;
    const duration =
      $(".box .info p").last().text().replace("Duration:", "").trim() || null;
    const sd = $("#sdLink").attr("href") || null;
    const hd = $("#hdLink").attr("href") || null;
    return { title, desc, duration, thumb, sd, hd };
  } catch (e) {
    return { status: "error", message: (e as Error).message };
  }
}

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

    const result = await downloadFacebook(url);

    return NextResponse.json({
      status: true,
      result: result,
    });
  } catch (error) {
    console.error('Facebook Downloader Error:', error);
    return NextResponse.json({ 
      status: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}