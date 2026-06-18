import { UpstashStorage } from './upstash-storage';

export interface LinkRecord {
  code: string;
  url: string;
  clicks: number;
  createdAt: string;
}

export interface Storage {
  save(code: string, url: string): Promise<void>;
  get(code: string): Promise<string | undefined>;
  has(code: string): Promise<boolean>;
  incrementClicks(code: string): Promise<number | undefined>;
  getClicks(code: string): Promise<number | undefined>;
  list(): Promise<LinkRecord[]>;
}

export class MemoryStorage implements Storage {
  private store = new Map<string, { url: string; clicks: number; createdAt: string }>();

  async save(code: string, url: string): Promise<void> {
    this.store.set(code, { url, clicks: 0, createdAt: new Date().toISOString() });
  }

  async get(code: string): Promise<string | undefined> {
    return this.store.get(code)?.url;
  }

  async has(code: string): Promise<boolean> {
    return this.store.has(code);
  }

  async incrementClicks(code: string): Promise<number | undefined> {
    const entry = this.store.get(code);
    if (!entry) {
      return undefined;
    }
    entry.clicks++;
    return entry.clicks;
  }

  async getClicks(code: string): Promise<number | undefined> {
    return this.store.get(code)?.clicks;
  }

  async list(): Promise<LinkRecord[]> {
    return Array.from(this.store.entries())
      .map(([code, { url, clicks, createdAt }]) => ({ code, url, clicks, createdAt }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

let instance: Storage | undefined;

export function getStorage(): Storage {
  if (!instance) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (url && token) {
      instance = new UpstashStorage({ url, token });
    } else {
      instance = new MemoryStorage();
    }
  }
  return instance;
}
