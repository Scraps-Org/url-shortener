import { describe, it, expect, vi } from 'vitest';
import { MemoryStorage, getStorage } from '../../src/lib/storage';
import { shorten, lookup, recordClick, getClicks, listLinks } from '../../src/lib/store';

describe('MemoryStorage', () => {
  it('returns promises and stores/retrieves values', async () => {
    const storage = new MemoryStorage();

    const saveResult = storage.save('abc123', 'https://example.com');
    expect(saveResult).toBeInstanceOf(Promise);
    await saveResult;

    const getResult = storage.get('abc123');
    expect(getResult).toBeInstanceOf(Promise);
    expect(await getResult).toBe('https://example.com');

    const hasResult = storage.has('abc123');
    expect(hasResult).toBeInstanceOf(Promise);
    expect(await hasResult).toBe(true);

    const getClicksResult = storage.getClicks('abc123');
    expect(getClicksResult).toBeInstanceOf(Promise);
    expect(await getClicksResult).toBe(0);
  });

  it('increments clicks correctly', async () => {
    const storage = new MemoryStorage();
    await storage.save('xyz789', 'https://example.org');

    const incResult = storage.incrementClicks('xyz789');
    expect(incResult).toBeInstanceOf(Promise);
    expect(await incResult).toBe(1);
    expect(await storage.incrementClicks('xyz789')).toBe(2);
    expect(await storage.getClicks('xyz789')).toBe(2);
  });

  it('returns undefined for unknown codes', async () => {
    const storage = new MemoryStorage();
    expect(await storage.get('nope')).toBeUndefined();
    expect(await storage.getClicks('nope')).toBeUndefined();
    expect(await storage.incrementClicks('nope')).toBeUndefined();
    expect(await storage.has('nope')).toBe(false);
  });

  it('list() returns all entries newest-first with clicks', async () => {
    vi.useFakeTimers();
    try {
      const storage = new MemoryStorage();

      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
      await storage.save('old', 'https://example.com/old');

      vi.setSystemTime(new Date('2024-01-02T00:00:00.000Z'));
      await storage.save('new', 'https://example.com/new');
      await storage.incrementClicks('new');

      const records = await storage.list();
      expect(records.map((r) => r.code)).toEqual(['new', 'old']);
      expect(records[0]).toMatchObject({
        code: 'new',
        url: 'https://example.com/new',
        clicks: 1,
        createdAt: '2024-01-02T00:00:00.000Z',
      });
      expect(records[1]).toMatchObject({
        code: 'old',
        url: 'https://example.com/old',
        clicks: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
      });
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('getStorage', () => {
  it('returns an object implementing the Storage methods', () => {
    const storage = getStorage();
    expect(typeof storage.save).toBe('function');
    expect(typeof storage.get).toBe('function');
    expect(typeof storage.has).toBe('function');
    expect(typeof storage.incrementClicks).toBe('function');
    expect(typeof storage.getClicks).toBe('function');
  });

  it('returns a memoized singleton', () => {
    expect(getStorage()).toBe(getStorage());
  });
});

describe('store async round-trip', () => {
  it('shorten -> lookup -> recordClick -> getClicks', async () => {
    const code = await shorten('https://example.com/round-trip');
    expect(await lookup(code)).toBe('https://example.com/round-trip');
    expect(await getClicks(code)).toBe(0);
    expect(await recordClick(code)).toBe(1);
    expect(await getClicks(code)).toBe(1);
  });

  it('listLinks() includes every shortened code', async () => {
    const codeA = await shorten('https://example.com/list-a');
    const codeB = await shorten('https://example.com/list-b');

    const records = await listLinks();
    const codes = records.map((r) => r.code);
    expect(codes.some((c) => c === codeA)).toBe(true);
    expect(codes.some((c) => c === codeB)).toBe(true);
  });
});
