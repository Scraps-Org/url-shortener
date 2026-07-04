import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../src/app/api/shorten/route';

vi.mock('../../src/lib/storage', () => ({
  storage: {
    set: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
    get: vi.fn<[string], Promise<string | null>>().mockResolvedValue(null),
  },
}));

vi.mock('../../src/lib/store', () => ({
  store: {
    set: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
    get: vi.fn<[string], Promise<string | null>>().mockResolvedValue(null),
  },
}));

vi.mock('../../src/lib/upstash-storage', () => ({
  upstashStorage: {
    set: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
    get: vi.fn<[string], Promise<string | null>>().mockResolvedValue(null),
  },
}));

describe('D1-shorten – POST /api/shorten route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a short link when a valid URL is submitted', async () => {
    const req = new Request('http://localhost/api/shorten', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com/path' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);

    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);

    const body = await res.json() as { shortUrl?: string; short?: string; code?: string; url?: string };
    const shortLink =
      body.shortUrl ?? body.short ?? body.code ?? body.url ?? '';
    expect(typeof shortLink).toBe('string');
    expect(shortLink.length).toBeGreaterThan(0);
  });
});
