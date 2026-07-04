import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../src/app/[code]/route';

const ORIGINAL_URL = 'https://example.com/path';
const TEST_CODE = 'abc123';

vi.mock('../../src/lib/storage', () => ({
  storage: {
    get: vi.fn<[string], Promise<string | null>>().mockImplementation(
      async (key: string) => (key === TEST_CODE ? ORIGINAL_URL : null),
    ),
    set: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  },
}));

vi.mock('../../src/lib/store', () => ({
  store: {
    get: vi.fn<[string], Promise<string | null>>().mockImplementation(
      async (key: string) => (key === TEST_CODE ? ORIGINAL_URL : null),
    ),
    set: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  },
}));

vi.mock('../../src/lib/upstash-storage', () => ({
  upstashStorage: {
    get: vi.fn<[string], Promise<string | null>>().mockImplementation(
      async (key: string) => (key === TEST_CODE ? ORIGINAL_URL : null),
    ),
    set: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  },
}));

describe('D1-shorten – GET /[code] redirect route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to the original URL when a valid short code is requested', async () => {
    const req = new Request(`http://localhost/${TEST_CODE}`, { method: 'GET', redirect: 'manual' });
    const params = Promise.resolve({ code: TEST_CODE });

    const res = await GET(req, { params });

    const isRedirect = res.status >= 300 && res.status < 400;
    const location = res.headers.get('location') ?? '';

    if (isRedirect) {
      expect(location).toBe(ORIGINAL_URL);
    } else {
      // Some implementations return 200 with a body containing the destination
      expect(res.status).toBe(200);
      const body = await res.text();
      expect(body).toContain(ORIGINAL_URL);
    }
  });
});
