import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ShortenForm from '../../src/components/ShortenForm';

describe('D1-shorten: ShortenForm UI', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn<[RequestInfo | URL, RequestInit?], Promise<Response>>().mockResolvedValue(
        new Response(
          JSON.stringify({ shortUrl: 'http://localhost/abc123', code: 'abc123' }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        )
      )
    );
  });

  it('displays a short link after submitting a valid URL', async () => {
    render(<ShortenForm />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'https://example.com/path' } });
    fireEvent.click(screen.getByRole('button', { name: /shorten/i }));

    await waitFor(() => {
      expect(
        screen.getByText((text) => text.includes('abc123'))
      ).toBeTruthy();
    });
  });
});
