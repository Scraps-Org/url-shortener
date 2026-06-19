import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @upstash/redis so no live DB is touched. The factory captures a single
// set of mock methods that every `new Redis()` instance shares.
const redisMethods = {
  set: vi.fn(),
  get: vi.fn(),
  exists: vi.fn(),
  incr: vi.fn(),
  keys: vi.fn(),
};

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(() => redisMethods),
}));

import { MemoryStorage } from '../../src/lib/storage';
import { UpstashStorage } from '../../src/lib/upstash-storage';
import { listLinks, shorten } from '../../src/lib/store';

describe('MemoryStorage.list', () => {
  it('returns every saved record with its click count', async () => {
    const storage = new MemoryStorage();
    await storage.save('aaa', 'https://a.example.com');
    await storage.save('bbb', 'https://b.example.com');
    await storage.incrementClicks('aaa');

    const records = await storage.list();
    expect(records).toContainEqual({ code: 'aaa', url: 'https://a.example.com', clicks: 1 });
    expect(records).toContainEqual({ code: 'bbb', url: 'https://b.example.com', clicks: 0 });
    expect(records).toHaveLength(2);
  });
});

describe('UpstashStorage.list', () => {
  beforeEach(() => {
    redisMethods.set.mockReset();
    redisMethods.get.mockReset();
    redisMethods.exists.mockReset();
    redisMethods.incr.mockReset();
    redisMethods.keys.mockReset();
  });

  it('fetches keys and resolves records', async () => {
    redisMethods.keys.mockResolvedValueOnce(['url:abc']);
    redisMethods.get.mockResolvedValueOnce('https://example.com').mockResolvedValueOnce(5);

    const storage = new UpstashStorage({ url: 'u', token: 't' });
    expect(await storage.list()).toEqual([
      { code: 'abc', url: 'https://example.com', clicks: 5 },
    ]);
    expect(redisMethods.keys).toHaveBeenCalledWith('url:*');
  });
});

describe('listLinks via store', () => {
  it('includes a freshly shortened url', async () => {
    const code = await shorten('https://store.example.com');
    const records = await listLinks();
    expect(records.some((r) => r.code === code)).toBe(true);
  });
});
