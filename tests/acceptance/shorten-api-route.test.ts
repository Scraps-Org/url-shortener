import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../../src/app/api/shorten/route'
import { GET } from '../../src/app/[code]/route'

vi.mock('../../src/lib/storage', () => {
  const store = new Map<string, string>()
  return {
    saveLink: vi.fn(async (code: string, url: string) => { store.set(code, url) }),
    getLink: vi.fn(async (code: string) => store.get(code) ?? null),
  }
})

vi.mock('../../src/lib/upstash-storage', () => {
  const store = new Map<string, string>()
  return {
    saveLink: vi.fn(async (code: string, url: string) => { store.set(code, url) }),
    getLink: vi.fn(async (code: string) => store.get(code) ?? null),
  }
})

vi.mock('../../src/lib/store', () => {
  const store = new Map<string, string>()
  return {
    saveLink: vi.fn(async (code: string, url: string) => { store.set(code, url) }),
    getLink: vi.fn(async (code: string) => store.get(code) ?? null),
  }
})

describe('D1-shorten: API routes', () => {
  const originalUrl = 'https://example.com/path'
  let shortUrl: string

  beforeEach(async () => {
    vi.clearAllMocks()
  })

  it('POST /api/shorten returns a short link for a valid URL', async () => {
    const req = new Request('http://localhost/api/shorten', {
      method: 'POST',
      body: JSON.stringify({ url: originalUrl }),
      headers: { 'content-type': 'application/json' },
    })

    const res = await POST(req)
    expect(res.status).toBeGreaterThanOrEqual(200)
    expect(res.status).toBeLessThan(300)

    const body = await res.json() as Record<string, unknown>
    const shortUrlValue = body.shortUrl ?? body.short ?? body.link ?? body.url
    expect(typeof shortUrlValue).toBe('string')
    expect(String(shortUrlValue).length).toBeGreaterThan(0)
    shortUrl = String(shortUrlValue)
  })

  it('GET /<code> redirects to the original URL (3xx)', async () => {
    const postReq = new Request('http://localhost/api/shorten', {
      method: 'POST',
      body: JSON.stringify({ url: originalUrl }),
      headers: { 'content-type': 'application/json' },
    })
    const postRes = await POST(postReq)
    const postBody = await postRes.json() as Record<string, unknown>
    const returnedUrl = String(postBody.shortUrl ?? postBody.short ?? postBody.link ?? postBody.url)
    const code = returnedUrl.split('/').pop()!

    const getReq = new Request(`http://localhost/${code}`, { method: 'GET' })
    const getRes = await GET(getReq, { params: Promise.resolve({ code }) })

    expect(getRes.status).toBeGreaterThanOrEqual(300)
    expect(getRes.status).toBeLessThan(400)
    expect(getRes.headers.get('location')).toBe(originalUrl)
  })
})
