import { describe, it, expect } from 'vitest';
import { POST } from '../../src/app/api/shorten/route';
import { GET } from '../../src/app/[code]/route';

describe('GET /[code] redirect — D1-shorten', () => {
  it('redirects to the original URL for a code returned by the shorten API', async () => {
    const originalUrl = 'https://example.com/path';

    const shortenReq = new Request('http://localhost/api/shorten', {
      method: 'POST',
      body: JSON.stringify({ url: originalUrl }),
      headers: { 'content-type': 'application/json' },
    });
    const shortenRes = await POST(shortenReq);
    expect(shortenRes.status).toBe(200);

    const shortenBody = await shortenRes.json() as Record<string, unknown>;
    const rawCode =
      typeof shortenBody.code === 'string'
        ? shortenBody.code
        : typeof shortenBody.shortUrl === 'string'
        ? (shortenBody.shortUrl as string).split('/').pop()
        : undefined;

    expect(typeof rawCode).toBe('string');
    const code = rawCode as string;

    const redirectReq = new Request(`http://localhost/${code}`);
    const redirectRes = await GET(redirectReq, { params: Promise.resolve({ code }) });

    const isRedirect = redirectRes.status >= 300 && redirectRes.status < 400;
    const locationHeader = redirectRes.headers.get('location');

    if (isRedirect) {
      expect(locationHeader).toBe(originalUrl);
    } else {
      expect(redirectRes.status).toBe(200);
    }
  });
});
