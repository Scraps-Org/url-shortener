import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ShortenForm from '../../src/components/ShortenForm';

describe('D1-shorten — ShortenForm UI', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn<[RequestInfo | URL, RequestInit?], Promise<Response>>(() =>
        Promise.resolve(
          new Response(JSON.stringify({ shortUrl: 'http://localhost/abc123' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          })
        )
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('accepts a valid URL, submits, and displays the returned short link', async () => {
    render(<ShortenForm />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'https://example.com/path' } });

    const button = screen.getByRole('button', { name: /shorten/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/abc123/i)).toBeInTheDocument();
    });
  });
});
