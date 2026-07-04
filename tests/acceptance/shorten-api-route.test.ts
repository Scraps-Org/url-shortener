import { describe, it, expect, vi, beforeEach } from 'vitest'
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

describe('D1-shorten – POST /api/shorten route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('given a valid URL body, then the response contains a shortUrl pointing to the generated code', async () => {
    const req = new Request('http://localhost/api/shorten', {
      method: 'POST',
      body: JSON.stringify({ url: 'https://example.com/path' }),
      headers: { 'content-type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBe(200)

    const body = (await res.json()) as Record<string, unknown>
    expect(typeof body.shortUrl).toBe('string')
    expect((body.shortUrl as string).length).toBeGreaterThan(0)
  })
})
