import { describe, it, expect } from 'vitest';
import { POST } from '../../src/app/api/shorten/route';
import { GET } from '../../src/app/[code]/route';

describe('Shorten API route — D1-shorten acceptance', () => {
  it('returns a short link when a valid URL is submitted', async () => {
    const req = new Request('http://localhost/api/shorten', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com/path' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json() as { shortUrl?: string; code?: string; url?: string };
    const shortValue = body.shortUrl ?? body.code ?? body.url ?? '';
    expect(typeof shortValue).toBe('string');
    expect(shortValue.length).toBeGreaterThan(0);
  });

  it('redirects to the original URL when the short code is requested', async () => {
    const createReq = new Request('http://localhost/api/shorten', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com/path' }),
      headers: { 'content-type': 'application/json' },
    });

    const createRes = await POST(createReq);
    const body = await createRes.json() as { shortUrl?: string; code?: string };

    const rawCode = body.code ?? body.shortUrl ?? '';
    const code = rawCode.split('/').filter(Boolean).pop() ?? rawCode;

    const redirectReq = new Request(`http://localhost/${code}`, { method: 'GET', redirect: 'manual' });
    const redirectRes = await GET(redirectReq, { params: Promise.resolve({ code }) });

    const isRedirect = redirectRes.status >= 300 && redirectRes.status < 400;
    const location = redirectRes.headers.get('location') ?? '';
    expect(isRedirect || location.includes('example.com')).toBe(true);
    if (isRedirect) {
      expect(location).toContain('example.com');
    }
  });
});
