import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../src/app/api/shorten/route';

vi.mock('../../src/lib/storage', () => ({
  saveLink: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  getLink: vi.fn<[string], Promise<string | null>>().mockResolvedValue(null),
}));

vi.mock('../../src/lib/upstash-storage', () => ({
  saveLink: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  getLink: vi.fn<[string], Promise<string | null>>().mockResolvedValue(null),
}));

vi.mock('../../src/lib/store', () => ({
  saveLink: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  getLink: vi.fn<[string], Promise<string | null>>().mockResolvedValue(null),
}));

describe('D1-shorten — POST /api/shorten route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a short link when given a valid URL', async () => {
    const req = new Request('http://localhost/api/shorten', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com/path' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);

    expect(res.status).toBe(200);

    const body = (await res.json()) as Record<string, unknown>;
    expect(typeof body.shortUrl === 'string' || typeof body.code === 'string').toBe(true);

    const shortValue = (body.shortUrl ?? body.code) as string;
    expect(shortValue.length).toBeGreaterThan(0);
  });
});
