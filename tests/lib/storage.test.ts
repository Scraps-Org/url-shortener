/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryStore, RedisStore, getStore } from '../../src/lib/store';

describe('MemoryStore', () => {
  let store: MemoryStore;

  beforeEach(() => {
    store = new MemoryStore();
  });

  it('round-trips shorten/lookup/recordClick/getClicks without a live DB', async () => {
    const code = await store.shorten('https://example.com');
    expect(code).toHaveLength(6);

    expect(await store.lookup(code)).toBe('https://example.com');
    expect(await store.getClicks(code)).toBe(0);
    expect(await store.recordClick(code)).toBe(1);
    expect(await store.recordClick(code)).toBe(2);
    expect(await store.getClicks(code)).toBe(2);
  });

  it('returns undefined for unknown codes', async () => {
    expect(await store.lookup('nope42')).toBeUndefined();
    expect(await store.recordClick('nope42')).toBeUndefined();
    expect(await store.getClicks('nope42')).toBeUndefined();
  });

  it('rejects invalid URLs', async () => {
    await expect(store.shorten('not a url')).rejects.toThrow('Invalid URL');
  });
});

describe('getStore', () => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  afterEach(() => {
    if (url === undefined) {
      delete process.env.UPSTASH_REDIS_REST_URL;
    } else {
      process.env.UPSTASH_REDIS_REST_URL = url;
    }
    if (token === undefined) {
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
    } else {
      process.env.UPSTASH_REDIS_REST_TOKEN = token;
    }
  });

  it('returns a MemoryStore when UPSTASH env is unset', () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    expect(getStore()).toBeInstanceOf(MemoryStore);
  });

  it('returns a RedisStore when both UPSTASH env vars are set', () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    expect(getStore()).toBeInstanceOf(RedisStore);
  });
});
