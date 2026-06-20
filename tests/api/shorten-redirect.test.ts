import { describe, it, expect } from 'vitest';
import { POST } from '~/app/api/shorten/route';
import { GET } from '~/app/[code]/route';
import { lookup } from '~/lib/store';

function makeRequest(body: string | object | undefined) {
  const init: RequestInit = { method: 'POST' };
  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  return new Request('http://localhost/api/shorten', init);
}

function makeCtx(code: string) {
  return { params: Promise.resolve({ code }) };
}

describe('End-to-end shorten then redirect flow', () => {
  it('shortens a URL and redirects to the original URL', async () => {
    const originalUrl = 'https://example.com/test';
    
    // Shorten the URL
    const shortenResponse = await POST(makeRequest({ url: originalUrl }));
    expect(shortenResponse.status).toBe(200);
    const { code } = await shortenResponse.json();
    
    // Verify the code was stored
    const storedUrl = await lookup(code);
    expect(storedUrl).toBe(originalUrl);
    
    // Redirect to the shortened URL
    const redirectResponse = await GET(
      new Request('http://localhost/' + code), 
      makeCtx(code)
    );
    
    // Verify redirect
    expect(redirectResponse.status).toBe(302);
    expect(redirectResponse.headers.get('location')).toBe(originalUrl);
    
    // Verify unknown code returns 404
    const unknownResponse = await GET(
      new Request('http://localhost/unknown'), 
      makeCtx('unknown')
    );
    expect(unknownResponse.status).toBe(404);
  });
});
