import { describe, it, expect, beforeEach } from 'vitest';
import { GET } from '~/app/[code]/route';
import { shorten, getClicks } from '~/lib/store';

function makeCtx(code: string) {
  return { params: Promise.resolve({ code }) };
}

describe('GET /[code]', () => {
  let code: string;

  beforeEach(async () => {
    code = await shorten('https://example.com/');
  });

  it('redirects with 302 to the stored url', async () => {
    const res = await GET(new Request('http://localhost/' + code), makeCtx(code));
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('https://example.com/');
  });

  it('records a click on redirect', async () => {
    const before = await getClicks(code);
    await GET(new Request('http://localhost/' + code), makeCtx(code));
    expect(await getClicks(code)).toBe((before ?? 0) + 1);
  });

  it('returns 404 for unknown code', async () => {
    const res = await GET(new Request('http://localhost/nope'), makeCtx('does-not-exist'));
    expect(res.status).toBe(404);
  });
});
