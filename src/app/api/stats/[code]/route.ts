import { NextResponse } from 'next/server';
import { getClicks } from '~/lib/store';

export async function GET(
  request: Request,
  ctx: { params: Promise<{ code: string }> },
) {
  const { code } = await ctx.params;
  const clicks = await getClicks(code);

  if (clicks === undefined) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  return NextResponse.json({ clicks });
}
