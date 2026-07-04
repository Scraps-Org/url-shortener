import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../src/app/api/shorten/route';

vi.mock('../../src/lib/storage', () => ({
  storage: {
    set: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
    get: vi.fn<[string], Promise<string | null>>().mockResolvedValue('https://example.com/path'),
  },
}));

vi.mock('../../src/lib/upstash-storage', () => ({
  upstashStorage: {
    set: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
    get: vi.fn<[string], Promise<string | null>>().mockResolvedValue('https://example.com/path'),
  },
}));

describe('D1-shorten: POST /api/shorten route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a short link given a valid URL', async () => {
    const req = new Request('http://localhost/api/shorten', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com/path' }),
      headers: { 'content-type': 'application/json' },
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json() as { shortUrl?: string; code?: string };
    const shortValue = body.shortUrl ?? body.code ?? '';
    expect(typeof shortValue).toBe('string');
    expect(shortValue.length).toBeGreaterThan(0);
  });
});
