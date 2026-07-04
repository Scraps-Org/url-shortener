import { describe, it, expect, vi } from 'vitest';
import { POST } from '../../src/app/api/shorten/route';

vi.mock('../../src/lib/storage', () => ({
  saveLink: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  getLink: vi.fn<[string], Promise<string | null>>().mockResolvedValue(null),
}));

vi.mock('../../src/lib/store', () => ({
  saveLink: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  getLink: vi.fn<[string], Promise<string | null>>().mockResolvedValue(null),
}));

vi.mock('../../src/lib/upstash-storage', () => ({
  saveLink: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  getLink: vi.fn<[string], Promise<string | null>>().mockResolvedValue(null),
}));

describe('POST /api/shorten – D1-shorten acceptance', () => {
  it('returns a shortUrl in the response body for a valid URL', async () => {
    const req = new Request('http://localhost/api/shorten', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com/path' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);

    const body = await res.json() as { shortUrl?: string; short?: string; code?: string };
    const shortLink = body.shortUrl ?? body.short ?? body.code ?? '';
    expect(shortLink.length).toBeGreaterThan(0);
  });
});
