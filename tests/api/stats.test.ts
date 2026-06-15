import { describe, it, expect } from 'vitest';
import { GET } from '~/app/api/stats/[code]/route';
import { shorten, recordClick } from '~/lib/store';

function makeCtx(code: string) {
  return { params: Promise.resolve({ code }) };
}

describe('GET /api/stats/[code]', () => {
  it('returns 404 for an unknown code', async () => {
    const res = await GET(new Request('http://localhost/api/stats/nope'), makeCtx('nope'));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'not found' });
  });

  it('returns the click count for a known code', async () => {
    const code = await shorten('https://example.com');
    await recordClick(code);
    await recordClick(code);

    const res = await GET(new Request(`http://localhost/api/stats/${code}`), makeCtx(code));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ clicks: 2 });
  });

  it('returns 0 clicks for a freshly shortened code', async () => {
    const code = await shorten('https://example.org');

    const res = await GET(new Request(`http://localhost/api/stats/${code}`), makeCtx(code));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ clicks: 0 });
  });
});
