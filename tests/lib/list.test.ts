import { describe, it, expect } from 'vitest';
import { MemoryStorage } from '../../src/lib/storage';
import { shorten, listLinks } from '../../src/lib/store';

describe('MemoryStorage.list()', () => {
  it('returns all records with correct urls and click counts', async () => {
    const storage = new MemoryStorage();
    await storage.save('abc', 'https://example.com');
    await storage.save('def', 'https://example.org');
    await storage.incrementClicks('abc');

    const list = await storage.list();
    expect(list).toHaveLength(2);

    const abc = list.find((r) => r.code === 'abc');
    expect(abc).toEqual({
      code: 'abc',
      url: 'https://example.com',
      clicks: 1,
      createdAt: expect.any(String),
    });

    const def = list.find((r) => r.code === 'def');
    expect(def).toEqual({
      code: 'def',
      url: 'https://example.org',
      clicks: 0,
      createdAt: expect.any(String),
    });
  });
});

describe('listLinks() round-trip', () => {
  it('returns entries for shortened urls', async () => {
    const url1 = 'https://google.com';
    const url2 = 'https://bing.com';

    await shorten(url1);
    await shorten(url2);

    const list = await listLinks();
    expect(list).toHaveLength(2);

    const urls = list.map((r) => r.url);
    expect(urls).toContain(url1);
    expect(urls).toContain(url2);
  });
});
