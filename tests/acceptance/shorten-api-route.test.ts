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

describe('POST /api/shorten — D1-shorten acceptance', () => {
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
    const body = await res.json() as Record<string, unknown>;
    const shortVal = body.shortUrl ?? body.short ?? body.code ?? body.shortLink;
    expect(typeof shortVal).toBe('string');
    expect(String(shortVal).length).toBeGreaterThan(0);
  });
});
