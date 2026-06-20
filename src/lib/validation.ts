export type ValidationResult = {
  isValid: boolean;
  error: string | null;
};

export function validateUrl(raw: string): ValidationResult {
  if (raw.trim() === '') {
    return {
      isValid: false,
      error: 'URL을 입력해 주세요',
    };
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(raw);
  } catch {
    return {
      isValid: false,
      error: '올바른 URL을 입력해 주세요',
    };
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return {
      isValid: false,
      error: '올바른 URL을 입력해 주세요',
    };
  }

  return {
    isValid: true,
    error: null,
  };
}
