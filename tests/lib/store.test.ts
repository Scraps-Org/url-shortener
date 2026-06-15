import { describe, it, expect } from 'vitest';
import { shorten, lookup, recordClick, getClicks } from '../../src/lib/store';

describe('store', () => {
  it('should shorten a valid URL and return a 6-character code', async () => {
    const code = await shorten('https://example.com');
    expect(code).toHaveLength(6);
    expect(typeof code).toBe('string');
  });

  it('should return undefined for unknown codes', async () => {
    expect(await lookup('unknown')).toBeUndefined();
    expect(await recordClick('unknown')).toBeUndefined();
    expect(await getClicks('unknown')).toBeUndefined();
  });

  it('should record clicks correctly', async () => {
    const code = await shorten('https://example.com');
    expect(await recordClick(code)).toBe(1);
    expect(await recordClick(code)).toBe(2);
    expect(await getClicks(code)).toBe(2);
  });

  it('should handle multiple URLs correctly', async () => {
    const code1 = await shorten('https://example.com');
    const code2 = await shorten('https://google.com');

    expect(code1).toHaveLength(6);
    expect(code2).toHaveLength(6);
    expect(code1).not.toBe(code2);

    expect(await lookup(code1)).toBe('https://example.com');
    expect(await lookup(code2)).toBe('https://google.com');
  });
});
