import { NextResponse } from 'next/server';
import { isValidUrl } from '~/lib/code';
import { shorten } from '~/lib/store';

export async function POST(request: Request) {
  let url: unknown;
  try {
    const body = await request.json();
    url = body?.url;
  } catch {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 });
  }

  if (typeof url !== 'string' || !isValidUrl(url)) {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 });
  }

  const code = await shorten(url);
  return NextResponse.json({ code });
}
