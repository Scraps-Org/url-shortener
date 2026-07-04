import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ShortenForm from '../../src/components/ShortenForm';

describe('ShortenForm UI — D1-shorten acceptance', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn<[RequestInfo | URL, RequestInit?], Promise<Response>>().mockResolvedValue(
        new Response(
          JSON.stringify({ shortUrl: 'http://localhost/abc123' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );
  });

  it('displays a short link after the user submits a valid URL', async () => {
    render(<ShortenForm />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'https://example.com/path' } });
    fireEvent.click(screen.getByRole('button', { name: /shorten/i }));

    await waitFor(() => {
      expect(screen.getByRole('link')).toBeDefined();
    });

    const link = screen.getByRole('link');
    expect((link as HTMLAnchorElement).href).toContain('abc123');
  });
});
