import { Redis } from '@upstash/redis';
import { generateCode, isValidUrl } from './code';

type StoreEntry = {
  url: string;
  clicks: number;
};

export interface UrlStore {
  shorten(url: string): Promise<string>;
  lookup(code: string): Promise<string | undefined>;
  recordClick(code: string): Promise<number | undefined>;
  getClicks(code: string): Promise<number | undefined>;
}

// Shared in-memory map. Both MemoryStore and the synchronous backward-compat
// shim below operate on this same map so existing tests observe route writes.
const mem = new Map<string, StoreEntry>();

export class MemoryStore implements UrlStore {
  async shorten(url: string): Promise<string> {
    if (!isValidUrl(url)) {
      throw new Error('Invalid URL');
    }

    let code: string;
    do {
      code = generateCode();
    } while (mem.has(code));

    mem.set(code, { url, clicks: 0 });
    return code;
  }

  async lookup(code: string): Promise<string | undefined> {
    const entry = mem.get(code);
    return entry ? entry.url : undefined;
  }

  async recordClick(code: string): Promise<number | undefined> {
    const entry = mem.get(code);
    if (!entry) {
      return undefined;
    }

    entry.clicks++;
    return entry.clicks;
  }

  async getClicks(code: string): Promise<number | undefined> {
    const entry = mem.get(code);
    return entry ? entry.clicks : undefined;
  }
}

export class RedisStore implements UrlStore {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  async shorten(url: string): Promise<string> {
    if (!isValidUrl(url)) {
      throw new Error('Invalid URL');
    }

    let code: string;
    do {
      code = generateCode();
    } while (await this.redis.exists(code));

    await this.redis.hset(code, { url, clicks: 0 });
    return code;
  }

  async lookup(code: string): Promise<string | undefined> {
    const entry = await this.redis.hgetall<StoreEntry>(code);
    return entry ? entry.url : undefined;
  }

  async recordClick(code: string): Promise<number | undefined> {
    if (!(await this.redis.exists(code))) {
      return undefined;
    }

    return this.redis.hincrby(code, 'clicks', 1);
  }

  async getClicks(code: string): Promise<number | undefined> {
    const entry = await this.redis.hgetall<StoreEntry>(code);
    return entry ? entry.clicks : undefined;
  }
}

export function getStore(): UrlStore {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new RedisStore();
  }
  return new MemoryStore();
}

// --- Backward-compat synchronous shim (operates on the shared `mem` map) ---

export function shorten(url: string): string {
  if (!isValidUrl(url)) {
    throw new Error('Invalid URL');
  }

  let code: string;
  do {
    code = generateCode();
  } while (mem.has(code));

  mem.set(code, { url, clicks: 0 });
  return code;
}

export function lookup(code: string): string | undefined {
  const entry = mem.get(code);
  return entry ? entry.url : undefined;
}

export function recordClick(code: string): number | undefined {
  const entry = mem.get(code);
  if (!entry) {
    return undefined;
  }

  entry.clicks++;
  return entry.clicks;
}

export function getClicks(code: string): number | undefined {
  const entry = mem.get(code);
  return entry ? entry.clicks : undefined;
}
