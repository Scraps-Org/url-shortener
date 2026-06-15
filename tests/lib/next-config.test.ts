import { describe, it, expect, vi } from 'vitest';

describe('next.config', () => {
  it('should output standalone when VERCEL is not set', async () => {
    vi.stubEnv('VERCEL', '');
    vi.resetModules();

    const config = await import('../../next.config.mjs');
    expect(config.default.output).toBe('standalone');
  });

  it('should not output standalone when VERCEL is set', async () => {
    vi.stubEnv('VERCEL', '1');
    vi.resetModules();

    const config = await import('../../next.config.mjs');
    expect(config.default.output).toBeUndefined();
  });
});
