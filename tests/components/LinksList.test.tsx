import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LinksList } from '~/components/LinksList';

describe('LinksList', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          links: [
            {
              code: 'abc123',
              url: 'https://example.com',
              clicks: 4,
            },
          ],
        }),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders a table with links data', async () => {
    render(<LinksList />);

    await screen.findByText('abc123');

    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});
