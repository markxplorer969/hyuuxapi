import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

async function aiopro(url: string) {
    try {
        if (!url.includes('https://')) throw new Error('Invalid url.');
        
        const { data: h } = await axios.get('https://allinonedownloader.pro/');
        const $ = cheerio.load(h);
        
        const token = $('input[name="token"]').attr('value');
        if (!token) throw new Error('Token not found.');
        
        const { data } = await axios.post('https://allinonedownloader.pro/wp-json/aio-dl/video-data/', new URLSearchParams({
            url: url,
            token: token
        }).toString(), {
            headers: {
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                origin: 'https://allinonedownloader.pro',
                referer: 'https://allinonedownloader.pro/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
            }
        });
        
        return data;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        // Call the aiopro function
        const result = await aiopro(url);

        return NextResponse.json({
            success: true,
            data: result,
            message: 'Download data retrieved successfully'
        });

    } catch (error: any) {
        console.error('All-in-one downloader error:', error);
        
        return NextResponse.json(
            { 
                error: error.message || 'Failed to fetch download data',
                success: false 
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json(
            { 
                error: 'URL parameter is required',
                usage: 'GET /api/download/allinone?url=https://example.com/video',
                method: 'POST /api/download/allinone with body: {"url": "https://example.com/video"}'
            },
            { status: 400 }
        );
    }

    try {
        // Validate URL format
        new URL(url);
        
        // Call the aiopro function
        const result = await aiopro(url);

        return NextResponse.json({
            success: true,
            data: result,
            message: 'Download data retrieved successfully'
        });

    } catch (error: any) {
        console.error('All-in-one downloader error:', error);
        
        return NextResponse.json(
            { 
                error: error.message || 'Failed to fetch download data',
                success: false 
            },
            { status: 500 }
        );
    }
}