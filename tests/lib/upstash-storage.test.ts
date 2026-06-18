import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

import { Redis } from '@upstash/redis';
import { UpstashStorage } from '../../src/lib/upstash-storage';

describe('UpstashStorage', () => {
  beforeEach(() => {
    redisMethods.set.mockReset();
    redisMethods.get.mockReset();
    redisMethods.exists.mockReset();
    redisMethods.incr.mockReset();
    redisMethods.keys.mockReset();
    vi.mocked(Redis).mockClear();
  });

  it('builds Redis from { url, token }', () => {
    new UpstashStorage({ url: 'https://x.upstash.io', token: 'tok' });
    expect(Redis).toHaveBeenCalledWith({ url: 'https://x.upstash.io', token: 'tok' });
  });

  it('save() sets url:<code> and clicks:<code>=0', async () => {
    const storage = new UpstashStorage({ url: 'u', token: 't' });
    await storage.save('abc', 'https://example.com');
    expect(redisMethods.set).toHaveBeenCalledWith('url:abc', 'https://example.com');
    expect(redisMethods.set).toHaveBeenCalledWith('clicks:abc', 0);
  });

  it('get() returns the url:<code> value', async () => {
    redisMethods.get.mockResolvedValueOnce('https://example.com');
    const storage = new UpstashStorage({ url: 'u', token: 't' });
    expect(await storage.get('abc')).toBe('https://example.com');
    expect(redisMethods.get).toHaveBeenCalledWith('url:abc');
  });

  it('get() returns undefined when key is missing', async () => {
    redisMethods.get.mockResolvedValueOnce(null);
    const storage = new UpstashStorage({ url: 'u', token: 't' });
    expect(await storage.get('nope')).toBeUndefined();
  });

  it('has() maps exists()===1 to true and 0 to false', async () => {
    const storage = new UpstashStorage({ url: 'u', token: 't' });
    redisMethods.exists.mockResolvedValueOnce(1);
    expect(await storage.has('abc')).toBe(true);
    redisMethods.exists.mockResolvedValueOnce(0);
    expect(await storage.has('nope')).toBe(false);
    expect(redisMethods.exists).toHaveBeenCalledWith('url:abc');
  });

  it('incrementClicks() increments only when the code exists', async () => {
    const storage = new UpstashStorage({ url: 'u', token: 't' });
    redisMethods.exists.mockResolvedValueOnce(1);
    redisMethods.incr.mockResolvedValueOnce(3);
    expect(await storage.incrementClicks('abc')).toBe(3);
    expect(redisMethods.incr).toHaveBeenCalledWith('clicks:abc');
  });

  it('incrementClicks() returns undefined for an unknown code', async () => {
    const storage = new UpstashStorage({ url: 'u', token: 't' });
    redisMethods.exists.mockResolvedValueOnce(0);
    expect(await storage.incrementClicks('nope')).toBeUndefined();
    expect(redisMethods.incr).not.toHaveBeenCalled();
  });

  it('getClicks() returns the numeric value or undefined', async () => {
    const storage = new UpstashStorage({ url: 'u', token: 't' });
    redisMethods.get.mockResolvedValueOnce(7);
    expect(await storage.getClicks('abc')).toBe(7);
    expect(redisMethods.get).toHaveBeenCalledWith('clicks:abc');
    redisMethods.get.mockResolvedValueOnce(null);
    expect(await storage.getClicks('nope')).toBeUndefined();
  });

  it('save() also records created:<code> as an ISO string', async () => {
    const storage = new UpstashStorage({ url: 'u', token: 't' });
    await storage.save('abc', 'https://example.com');
    const createdCall = redisMethods.set.mock.calls.find(([key]) => key === 'created:abc');
    expect(createdCall).toBeDefined();
    expect(typeof createdCall?.[1]).toBe('string');
  });

  it('list() returns records sorted by createdAt descending', async () => {
    const data: Record<string, string | number> = {
      'url:old': 'https://example.com/old',
      'clicks:old': 2,
      'created:old': '2024-01-01T00:00:00.000Z',
      'url:new': 'https://example.com/new',
      'clicks:new': 5,
      'created:new': '2024-01-02T00:00:00.000Z',
    };
    redisMethods.keys.mockResolvedValueOnce(['url:old', 'url:new']);
    redisMethods.get.mockImplementation(async (key: string) => data[key] ?? null);

    const storage = new UpstashStorage({ url: 'u', token: 't' });
    const records = await storage.list();

    expect(redisMethods.keys).toHaveBeenCalledWith('url:*');
    expect(records).toEqual([
      { code: 'new', url: 'https://example.com/new', clicks: 5, createdAt: '2024-01-02T00:00:00.000Z' },
      { code: 'old', url: 'https://example.com/old', clicks: 2, createdAt: '2024-01-01T00:00:00.000Z' },
    ]);
  });
});

describe('getStorage env selection', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('returns an UpstashStorage when both env vars are present', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://x.upstash.io');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'tok');
    vi.resetModules();
    const { getStorage } = await import('../../src/lib/storage');
    const { UpstashStorage: Upstash } = await import('../../src/lib/upstash-storage');
    expect(getStorage()).toBeInstanceOf(Upstash);
  });

  it('returns a MemoryStorage when the env vars are absent', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    vi.resetModules();
    const { getStorage, MemoryStorage } = await import('../../src/lib/storage');
    expect(getStorage()).toBeInstanceOf(MemoryStorage);
  });
});
