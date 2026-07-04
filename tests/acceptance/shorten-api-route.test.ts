import { describe, it, expect } from 'vitest';
import { POST } from '../../src/app/api/shorten/route';

describe('D1-shorten — POST /api/shorten', () => {
  it('returns a short link when given a valid URL', async () => {
    const req = new Request('http://localhost/api/shorten', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com/path' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);

    const body = (await res.json()) as { shortUrl?: string; code?: string; short?: string };
    const shortValue = body.shortUrl ?? body.code ?? body.short ?? '';
    expect(shortValue).toBeTruthy();
  });
});
