import { NextResponse } from 'next/server';
import { getStore } from '~/lib/store';

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ code: string }> },
): Promise<NextResponse> {
  const { code } = await ctx.params;
  const store = getStore();
  const url = await store.lookup(code);

  if (url === undefined) {
    return new NextResponse(null, { status: 404 });
  }

  await store.recordClick(code);
  return NextResponse.redirect(url, 302);
}
