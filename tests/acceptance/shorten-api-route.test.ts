import { describe, it, expect, vi } from 'vitest'
import { POST } from '../../src/app/api/shorten/route'

vi.mock('../../src/lib/storage', () => ({
  storage: {
    set: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
    get: vi.fn<[string], Promise<string | null>>().mockResolvedValue(null),
  },
}))

vi.mock('../../src/lib/store', () => ({
  store: {
    set: vi.fn<[string, string], Promise<void>>().mockResolvedValue(undefined),
    get: vi.fn<[string], Promise<string | null>>().mockResolvedValue(null),
  },
}))

describe('POST /api/shorten — D1-shorten', () => {
  it('returns a short link for a valid URL', async () => {
    const req = new Request('http://localhost/api/shorten', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com/path' }),
      headers: { 'content-type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBeGreaterThanOrEqual(200)
    expect(res.status).toBeLessThan(300)

    const body: unknown = await res.json()
    expect(body).toMatchObject({
      shortUrl: expect.stringMatching(/[a-zA-Z0-9]+/),
    })
  })
})
