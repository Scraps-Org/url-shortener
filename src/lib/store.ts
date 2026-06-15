import { generateCode, isValidUrl } from './code';
import { getStorage } from './storage';

export async function shorten(url: string): Promise<string> {
  if (!isValidUrl(url)) {
    throw new Error('Invalid URL');
  }

  const storage = getStorage();
  let code: string;
  do {
    code = generateCode();
  } while (await storage.has(code));

  await storage.save(code, url);
  return code;
}

export async function lookup(code: string): Promise<string | undefined> {
  return getStorage().get(code);
}

export async function recordClick(code: string): Promise<number | undefined> {
  return getStorage().incrementClicks(code);
}

export async function getClicks(code: string): Promise<number | undefined> {
  return getStorage().getClicks(code);
}
