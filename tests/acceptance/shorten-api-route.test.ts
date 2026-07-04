import { describe, it, expect, vi, beforeEach } from 'vitest';
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

describe('D1-shorten: POST /api/shorten', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a short link for a valid URL', async () => {
    const req = new Request('http://localhost/api/shorten', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com/path' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);

    const body = await res.json() as Record<string, unknown>;
    const shortValue =
      typeof body['shortUrl'] === 'string'
        ? body['shortUrl']
        : typeof body['code'] === 'string'
        ? body['code']
        : typeof body['short'] === 'string'
        ? body['short']
        : null;

    expect(shortValue).toBeTruthy();
    expect(typeof shortValue).toBe('string');
    expect((shortValue as string).length).toBeGreaterThan(0);
  });
});
