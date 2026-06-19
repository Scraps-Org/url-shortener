import { describe, it, expect } from 'vitest';
import { GET } from '~/app/api/links/route';
import { shorten, recordClick } from '~/lib/store';

describe('GET /api/links', () => {
  it('returns all links with their click counts', async () => {
    const code1 = await shorten('https://example.com');
    const code2 = await shorten('https://another-example.com');

    await recordClick(code1);
    await recordClick(code1);

    const res = await GET();
    expect(res.status).toBe(200);

    const { links } = await res.json();

    const link1 = links.find((l: { code: string }) => l.code === code1);
    const link2 = links.find((l: { code: string }) => l.code === code2);

    expect(link1).toBeDefined();
    expect(link1?.url).toBe('https://example.com');
    expect(link1?.clicks).toBe(2);

    expect(link2).toBeDefined();
    expect(link2?.url).toBe('https://another-example.com');
    expect(link2?.clicks).toBe(0);
  });
});
