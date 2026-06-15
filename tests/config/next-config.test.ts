/// <reference types="vitest/globals" />
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';

describe('next.config', () => {
  beforeEach(() => {
    // Ensure VERCEL is not set before each test
    delete process.env.VERCEL;
  });

  afterEach(() => {
    // Restore original environment after each test
    if (process.env.VERCEL !== undefined) {
      delete process.env.VERCEL;
    }
  });

  it('should set output to standalone when VERCEL is not set', async () => {
    // Clear module cache to ensure fresh import
    vi.resetModules();
    
    const config = await import('../../next.config.mjs?vercel1');
    expect(config.default.output).toBe('standalone');
  });

  it('should set output to undefined when VERCEL is set to "1"', async () => {
    // Set VERCEL environment variable
    process.env.VERCEL = '1';
    
    // Clear module cache to ensure fresh import
    vi.resetModules();
    
    const config = await import('../../next.config.mjs?vercel2');
    expect(config.default.output).toBeUndefined();
  });
});
