import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminCollections, Timestamp } from '@/lib/firebase-admin';
import axios from 'axios';

async function turboseek(question: string) {
  const inst = axios.create({
    baseURL: 'https://www.turboseek.io/api',
    headers: {
      origin: 'https://www.turboseek.io',
      referer: 'https://www.turboseek.io/',
      'user-agent': 'Mozilla/5.0',
    },
  });

  const { data: sources } = await inst.post('/getSources', { question });
  const { data: similarQuestions } = await inst.post('/getSimilarQuestions', {
    question,
    sources,
  });
  const { data: answer } = await inst.post('/getAnswer', { question, sources });

  const cleaned =
    answer
      .match(/<p>(.*?)<\/p>/gs)
      ?.map((m: string) =>
        m.replace(/<\/?(p|strong|em|b|i|u)[^>]*>/g, '').replace(/<\/?[^>]+>/g, '')
      )
      .join('\n\n') ||
    answer.replace(/<\/?[^>]+>/g, '').trim();

  return {
    answer: cleaned,
    sources: sources.map((s: any) => s.url),
    similarQuestions,
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

    const result = await turboseek(text);

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
