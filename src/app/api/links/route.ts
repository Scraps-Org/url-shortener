import { NextResponse } from 'next/server';
import { listLinks } from '~/lib/store';

export async function GET(): Promise<NextResponse> {
  const links = await listLinks();
  return NextResponse.json({ links });
}
