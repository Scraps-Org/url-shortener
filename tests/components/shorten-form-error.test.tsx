import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShortenForm } from '~/components/ShortenForm';

describe('ShortenForm error handling', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        json: async () => ({ error: 'invalid url' }),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows an error and renders no short URL link on a failed request', async () => {
    render(<ShortenForm />);

    const input = screen.getByPlaceholderText('Enter a URL');
    fireEvent.change(input, { target: { value: 'https://example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Shorten' }));

    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent(
      'Could not shorten that URL. Please enter a valid http(s) URL.',
    );

    expect(screen.queryByRole('link')).toBeNull();
  });
});
