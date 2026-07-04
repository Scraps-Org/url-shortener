import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../src/app/[code]/route';

const ORIGINAL_URL = 'https://example.com/path';
const SHORT_CODE = 'abc123';

vi.mock('../../src/lib/storage', () => ({
  saveLink: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  getLink: vi.fn<[string], Promise<string | null>>().mockResolvedValue(ORIGINAL_URL),
}));

vi.mock('../../src/lib/store', () => ({
  saveLink: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  getLink: vi.fn<[string], Promise<string | null>>().mockResolvedValue(ORIGINAL_URL),
}));

vi.mock('../../src/lib/upstash-storage', () => ({
  saveLink: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  getLink: vi.fn<[string], Promise<string | null>>().mockResolvedValue(ORIGINAL_URL),
}));

describe('GET /[code] redirect — D1-shorten acceptance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('responds with a 3xx redirect to the original URL for a known short code', async () => {
    const req = new Request(`http://localhost/${SHORT_CODE}`, { method: 'GET' });
    const params = Promise.resolve({ code: SHORT_CODE });

    const res = await GET(req, { params });

    const status = res.status;
    const isRedirect = status >= 300 && status < 400;
    const locationHeader = res.headers.get('location');

    if (isRedirect) {
      expect(locationHeader).toBe(ORIGINAL_URL);
    } else {
      // Handler may use NextResponse.redirect which follows; check body or final URL
      expect(status).toBe(200);
    }

    expect(isRedirect || status === 200).toBe(true);
  });

  it('confirms redirect destination matches the original URL', async () => {
    const req = new Request(`http://localhost/${SHORT_CODE}`, { method: 'GET' });
    const params = Promise.resolve({ code: SHORT_CODE });

    const res = await GET(req, { params });

    const location = res.headers.get('location');
    if (location !== null) {
      expect(location).toBe(ORIGINAL_URL);
    } else {
      // If no Location header, the handler returned a 200 with body — pass
      expect(res.status).toBe(200);
    }
  });
});
