import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../src/app/[code]/route';

const TARGET_URL = 'https://example.com/path';
const SHORT_CODE = 'abc123';

vi.mock('../../src/lib/storage', () => ({
  saveLink: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  getLink: vi.fn<[string], Promise<string | null>>().mockImplementation(
    async (code: string) => (code === SHORT_CODE ? TARGET_URL : null),
  ),
}));

vi.mock('../../src/lib/upstash-storage', () => ({
  saveLink: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  getLink: vi.fn<[string], Promise<string | null>>().mockImplementation(
    async (code: string) => (code === SHORT_CODE ? TARGET_URL : null),
  ),
}));

vi.mock('../../src/lib/store', () => ({
  saveLink: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  getLink: vi.fn<[string], Promise<string | null>>().mockImplementation(
    async (code: string) => (code === SHORT_CODE ? TARGET_URL : null),
  ),
}));

describe('D1-shorten — GET /[code] redirect route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to the original URL for a known short code (3xx or Location header)', async () => {
    const req = new Request(`http://localhost/${SHORT_CODE}`);
    const params = Promise.resolve({ code: SHORT_CODE });

    const res = await GET(req, { params });

    const is3xx = res.status >= 300 && res.status < 400;
    const location = res.headers.get('location');

    if (is3xx) {
      expect(location).toBe(TARGET_URL);
    } else {
      const body = (await res.json()) as Record<string, unknown>;
      expect(body.url ?? body.redirectUrl ?? body.destination).toBe(TARGET_URL);
    }
  });
});
