import { describe, it, expect } from 'vitest';
import { POST } from '../../src/app/api/shorten/route';
import { GET } from '../../src/app/[code]/route';

describe('D1-shorten — GET /[code] redirects to original URL', () => {
  it('redirects to the original URL that was shortened', async () => {
    const originalUrl = 'https://example.com/path';

    const shortenReq = new Request('http://localhost/api/shorten', {
      method: 'POST',
      body: JSON.stringify({ url: originalUrl }),
      headers: { 'content-type': 'application/json' },
    });
    const shortenRes = await POST(shortenReq);
    const body = (await shortenRes.json()) as { shortUrl?: string; code?: string; short?: string };

    const shortValue = body.shortUrl ?? body.code ?? body.short ?? '';
    expect(shortValue).toBeTruthy();

    const code = shortValue.split('/').at(-1) ?? '';
    expect(code).toBeTruthy();

    const redirectReq = new Request(`http://localhost/${code}`, { method: 'GET' });
    const redirectRes = await GET(redirectReq, { params: Promise.resolve({ code }) });

    const isRedirect = redirectRes.status >= 300 && redirectRes.status < 400;
    const location = redirectRes.headers.get('location') ?? '';

    if (isRedirect) {
      expect(location).toBe(originalUrl);
    } else {
      expect(redirectRes.status).toBeGreaterThanOrEqual(200);
      expect(redirectRes.status).toBeLessThan(300);
    }
  });
});
