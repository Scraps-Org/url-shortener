import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../src/app/[code]/route';

const ORIGINAL_URL = 'https://example.com/path';
const SHORT_CODE = 'abc123';

vi.mock('../../src/lib/storage', () => ({
  storage: {
    get: vi.fn<[string], Promise<string | null>>().mockResolvedValue(ORIGINAL_URL),
    set: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  },
}));

vi.mock('../../src/lib/upstash-storage', () => ({
  upstashStorage: {
    get: vi.fn<[string], Promise<string | null>>().mockResolvedValue(ORIGINAL_URL),
    set: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  },
}));

describe('D1-shorten: GET /[code] redirect route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to the original URL when a valid short code is requested', async () => {
    const req = new Request(`http://localhost/${SHORT_CODE}`, { method: 'GET' });
    const params = Promise.resolve({ code: SHORT_CODE });

    const res = await GET(req, { params });

    const isRedirect = res.status >= 300 && res.status < 400;
    const location = res.headers.get('location');

    if (isRedirect) {
      expect(location).toBe(ORIGINAL_URL);
    } else {
      const body = await res.json() as { url?: string; destination?: string };
      const destination = body.url ?? body.destination ?? '';
      expect(destination).toBe(ORIGINAL_URL);
    }
  });
});
