import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../src/app/[code]/route';

const ORIGINAL_URL = 'https://example.com/path';
const TEST_CODE = 'abc123';

vi.mock('../../src/lib/storage', () => ({
  saveLink: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  getLink: vi.fn<[string], Promise<string | null>>().mockImplementation(
    async (code: string) => (code === TEST_CODE ? ORIGINAL_URL : null)
  ),
}));

vi.mock('../../src/lib/store', () => ({
  saveLink: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  getLink: vi.fn<[string], Promise<string | null>>().mockImplementation(
    async (code: string) => (code === TEST_CODE ? ORIGINAL_URL : null)
  ),
}));

vi.mock('../../src/lib/upstash-storage', () => ({
  saveLink: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  getLink: vi.fn<[string], Promise<string | null>>().mockImplementation(
    async (code: string) => (code === TEST_CODE ? ORIGINAL_URL : null)
  ),
}));

describe('D1-shorten: GET /[code] redirect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to the original URL when a valid code is requested', async () => {
    const req = new Request(`http://localhost/${TEST_CODE}`, { method: 'GET' });
    const params = Promise.resolve({ code: TEST_CODE });

    const res = await GET(req, { params });

    const is3xx = res.status >= 300 && res.status < 400;
    const locationHeader = res.headers.get('location');

    if (is3xx) {
      expect(locationHeader).toBe(ORIGINAL_URL);
    } else {
      const body = await res.json() as Record<string, unknown>;
      const dest =
        typeof body['url'] === 'string'
          ? body['url']
          : typeof body['location'] === 'string'
          ? body['location']
          : null;
      expect(dest).toBe(ORIGINAL_URL);
    }
  });
});
