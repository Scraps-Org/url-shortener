import { NextResponse } from 'next/server';
import { lookup, recordClick } from '~/lib/store';

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ code: string }> },
): Promise<NextResponse> {
  const { code } = await ctx.params;
  const url = lookup(code);

  if (url === undefined) {
    return new NextResponse(null, { status: 404 });
  }

  recordClick(code);
  return NextResponse.redirect(url, 302);
}
