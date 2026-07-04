import { describe, it, expect } from 'vitest';
import { POST } from '../../src/app/api/shorten/route';

describe('POST /api/shorten — D1-shorten', () => {
  it('returns a short link for a valid URL', async () => {
    const req = new Request('http://localhost/api/shorten', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com/path' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(typeof body.shortUrl === 'string' || typeof body.code === 'string').toBe(true);
  });
});
