import { describe, it, expect } from 'vitest';
import { POST } from '~/app/api/shorten/route';
import { lookup } from '~/lib/store';

function makeRequest(body: string | object | undefined) {
  const init: RequestInit = { method: 'POST' };
  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  return new Request('http://localhost/api/shorten', init);
}

describe('POST /api/shorten', () => {
  it('returns a code for a valid url', async () => {
    const res = await POST(makeRequest({ url: 'https://example.com' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(typeof json.code).toBe('string');
    expect(json.code).toHaveLength(6);
    expect(lookup(json.code)).toBe('https://example.com');
  });

  it('returns 400 when url is missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('invalid url');
  });

  it('returns 400 for an invalid url', async () => {
    const res = await POST(makeRequest({ url: 'not a url' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('invalid url');
  });

  it('returns 400 for an empty body', async () => {
    const res = await POST(makeRequest(undefined));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('invalid url');
  });
});
