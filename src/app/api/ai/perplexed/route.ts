import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections, Timestamp } from '@/lib/firebase-admin';
import axios from 'axios';

async function perplexed(question: string) {
  const { data } = await axios.post(
    'https://d21l5c617zttgr.cloudfront.net/stream_search',
    { user_prompt: question },
    {
      headers: {
        origin: 'https://d21l5c617zttgr.cloudfront.net',
        referer: 'https://d21l5c617zttgr.cloudfront.net/',
        'user-agent': 'Mozilla/5.0',
      },
    }
  );

  const parts = data
    .split('[/PERPLEXED-SEPARATOR]')
    .map((p: string) => p.trim())
    .filter((p: string) => p)
    .map((p: string) => {
      try {
        return JSON.parse(p);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const result = parts[parts.length - 1];
  return {
    answer: result.answer,
    sources: result.websearch_docs || [],
  };
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const text = url.searchParams.get('text');
    const apikey = url.searchParams.get('apikey');

    if (!text || !apikey)
      return NextResponse.json({ status: false, error: 'text & apikey required' }, { status: 400 });

    const keySnap = await adminDb
      .collection(adminCollections.apiKeys)
      .where('key', '==', apikey)
      .limit(1)
      .get();

    if (keySnap.empty)
      return NextResponse.json({ status: false, error: 'Invalid API key' }, { status: 403 });

    const keyDoc = keySnap.docs[0];
    const keyData = keyDoc.data();

    if (!keyData.isActive)
      return NextResponse.json({ status: false, error: 'API key is disabled' }, { status: 403 });

    if (keyData.usage >= keyData.limit)
      return NextResponse.json({ status: false, error: 'API limit reached' }, { status: 429 });

    const result = await perplexed(text);

    await keyDoc.ref.update({
      usage: keyData.usage + 1,
      lastUsed: Timestamp.now(),
    });

    return NextResponse.json({ status: true, result });
  } catch (err: any) {
    return NextResponse.json(
      { status: false, error: err.message || 'error' },
      { status: 500 }
    );
  }
}
