import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ShortenForm from '../../src/components/ShortenForm';

describe('ShortenForm UI — D1-shorten', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn<[RequestInfo | URL, RequestInit?], Promise<Response>>()
        .mockResolvedValue(
          new Response(JSON.stringify({ shortUrl: 'http://localhost/abc123' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        )
    );
  });

  it('displays a short link after submitting a valid URL', async () => {
    render(<ShortenForm />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'https://example.com/path');

    const button = screen.getByRole('button');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('link')).toBeDefined();
    });

    const link = screen.getByRole('link');
    expect(link).toBeDefined();
    const href = (link as HTMLAnchorElement).href;
    expect(href.length).toBeGreaterThan(0);
  });
});
