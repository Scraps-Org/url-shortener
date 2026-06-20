import { describe, it, expect } from 'vitest';
import { validateUrl } from '../../src/lib/validation';

describe('validateUrl', () => {
  it('should return false with correct error for empty string', () => {
    const result = validateUrl('');
    expect(result).toEqual({
      isValid: false,
      error: 'URL을 입력해 주세요',
    });
  });

  it('should return false with correct error for whitespace-only string', () => {
    const result = validateUrl('   ');
    expect(result).toEqual({
      isValid: false,
      error: 'URL을 입력해 주세요',
    });
  });

  it('should return false with correct error for non-URL value', () => {
    const result = validateUrl('not a url');
    expect(result).toEqual({
      isValid: false,
      error: '올바른 URL을 입력해 주세요',
    });
  });

  it('should return false with correct error for ftp URL', () => {
    const result = validateUrl('ftp://example.com');
    expect(result).toEqual({
      isValid: false,
      error: '올바른 URL을 입력해 주세요',
    });
  });

  it('should return true with null error for valid https URL', () => {
    const result = validateUrl('https://example.com');
    expect(result).toEqual({
      isValid: true,
      error: null,
    });
  });

  it('should return true with null error for valid http URL', () => {
    const result = validateUrl('http://example.com');
    expect(result).toEqual({
      isValid: true,
      error: null,
    });
  });
});
