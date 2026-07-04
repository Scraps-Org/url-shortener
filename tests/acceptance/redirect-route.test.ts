import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../../src/app/[code]/route'

const ORIGINAL_URL = 'https://example.com/path'
const SHORT_CODE = 'abc123'

vi.mock('../../src/lib/storage', () => ({
  getLink: vi.fn<[string], Promise<string | null>>().mockResolvedValue(ORIGINAL_URL),
  saveLink: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
}))

vi.mock('../../src/lib/store', () => ({
  getLink: vi.fn<[string], Promise<string | null>>().mockResolvedValue(ORIGINAL_URL),
  saveLink: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
}))

vi.mock('../../src/lib/upstash-storage', () => ({
  getLink: vi.fn<[string], Promise<string | null>>().mockResolvedValue(ORIGINAL_URL),
  saveLink: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
}))

describe('GET /[code] redirect – D1-shorten', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to the original URL for a known short code', async () => {
    const req = new Request(`http://localhost/${SHORT_CODE}`, { method: 'GET' })
    const params = Promise.resolve({ code: SHORT_CODE })

    const res = await GET(req, { params })

    const isRedirect = res.status >= 300 && res.status < 400
    const locationHeader = res.headers.get('location') ?? ''
    const isBodyMatch = !isRedirect
      ? (await res.text()).includes(ORIGINAL_URL)
      : false

    if (isRedirect) {
      expect(locationHeader).toBe(ORIGINAL_URL)
    } else {
      expect(isBodyMatch).toBe(true)
    }
  })
})
