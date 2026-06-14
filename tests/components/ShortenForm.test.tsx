import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShortenForm } from '~/components/ShortenForm';

describe('ShortenForm', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ code: 'abc123' }),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the input and submit button', () => {
    render(<ShortenForm />);
    expect(screen.getByPlaceholderText('Enter a URL')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Shorten' })).toBeInTheDocument();
  });

  it('submits the url to /api/shorten and displays the returned code', async () => {
    render(<ShortenForm />);

    const input = screen.getByPlaceholderText('Enter a URL');
    fireEvent.change(input, { target: { value: 'https://example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Shorten' }));

    await waitFor(() => {
      expect(screen.getByText('abc123')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/shorten',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ url: 'https://example.com' }),
      }),
    );
  });
});
