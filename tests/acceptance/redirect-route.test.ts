import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../../src/app/[code]/route'

const ORIGINAL_URL = 'https://example.com/path'
const SHORT_CODE = 'abc123'

vi.mock('../../src/lib/storage', () => ({
  storage: {
    get: vi.fn<[string], Promise<string | null>>().mockResolvedValue(ORIGINAL_URL),
    set: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  },
}))

vi.mock('../../src/lib/store', () => ({
  store: {
    get: vi.fn<[string], Promise<string | null>>().mockResolvedValue(ORIGINAL_URL),
    set: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
  },
}))

describe('D1-shorten – GET /[code] redirect route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('given a short code that maps to an original URL, then the response is a redirect (3xx) to the original URL', async () => {
    const req = new Request(`http://localhost/${SHORT_CODE}`)
    const params = Promise.resolve({ code: SHORT_CODE })

    const res = await GET(req, { params })

    expect(res.status).toBeGreaterThanOrEqual(300)
    expect(res.status).toBeLessThan(400)

    const location = res.headers.get('location')
    expect(location).toBe(ORIGINAL_URL)
  })
})
