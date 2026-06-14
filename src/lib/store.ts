import { generateCode, isValidUrl } from './code';

type StoreEntry = {
  url: string;
  clicks: number;
};

const store = new Map<string, StoreEntry>();

export function shorten(url: string): string {
  if (!isValidUrl(url)) {
    throw new Error('Invalid URL');
  }
  
  let code: string;
  do {
    code = generateCode();
  } while (store.has(code));
  
  store.set(code, { url, clicks: 0 });
  return code;
}

export function lookup(code: string): string | undefined {
  const entry = store.get(code);
  return entry ? entry.url : undefined;
}

export function recordClick(code: string): number | undefined {
  const entry = store.get(code);
  if (!entry) {
    return undefined;
  }
  
  entry.clicks++;
  return entry.clicks;
}

export function getClicks(code: string): number | undefined {
  const entry = store.get(code);
  return entry ? entry.clicks : undefined;
}
