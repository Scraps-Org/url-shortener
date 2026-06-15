import { describe, it, expect } from 'vitest';
import { MemoryStorage, getStorage } from '../../src/lib/storage';
import { shorten, lookup, recordClick, getClicks } from '../../src/lib/store';

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
});
