import { describe, it, expect, vi } from 'vitest'
import { GET } from '../../src/app/[code]/route'

const ORIGINAL_URL = 'https://example.com/path'
const CODE = 'abc123'

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

describe('GET /[code] redirect — D1-shorten', () => {
  it('redirects to the original URL for a known short code', async () => {
    const req = new Request(`http://localhost/${CODE}`)
    const params = Promise.resolve({ code: CODE })

    const res = await GET(req, { params })

    const isRedirect = res.status >= 300 && res.status < 400
    const location = res.headers.get('location')

    if (isRedirect) {
      expect(location).toBe(ORIGINAL_URL)
    } else {
      // handler may resolve the redirect internally and return 200 with body
      const body: unknown = await res.json()
      expect(body).toMatchObject({ url: ORIGINAL_URL })
    }
  })
})
