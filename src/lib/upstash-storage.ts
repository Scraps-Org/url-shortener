import { Redis } from '@upstash/redis';

import type { Storage, LinkRecord } from './storage';

/**
 * Serverless, HTTP-based persistent storage backed by Upstash Redis.
 * No native deps — works on Vercel and Docker self-host.
 *
 * Key scheme:
 *   url:<code>    — the target URL (string)
 *   clicks:<code> — the click count (number)
 */
export class UpstashStorage implements Storage {
  private redis: Redis;

  constructor({ url, token }: { url: string; token: string }) {
    this.redis = new Redis({ url, token });
  }

  async save(code: string, url: string): Promise<void> {
    await this.redis.set(`url:${code}`, url);
    await this.redis.set(`clicks:${code}`, 0);
  }

  async get(code: string): Promise<string | undefined> {
    const url = await this.redis.get<string>(`url:${code}`);
    return url ?? undefined;
  }

  async has(code: string): Promise<boolean> {
    return (await this.redis.exists(`url:${code}`)) === 1;
  }

  async incrementClicks(code: string): Promise<number | undefined> {
    if (!(await this.has(code))) {
      return undefined;
    }
    return this.redis.incr(`clicks:${code}`);
  }

  async getClicks(code: string): Promise<number | undefined> {
    const clicks = await this.redis.get<number>(`clicks:${code}`);
    return clicks ?? undefined;
  }

  async list(): Promise<LinkRecord[]> {
    const keys = await this.redis.keys('url:*');
    const records: LinkRecord[] = [];

    for (const key of keys) {
      const code = key.slice('url:'.length);
      const url = await this.redis.get<string>(key);
      if (url) {
        const clicks = await this.redis.get<number>(`clicks:${code}`);
        records.push({ code, url, clicks: clicks ?? 0 });
      }
    }

    return records;
  }
}
