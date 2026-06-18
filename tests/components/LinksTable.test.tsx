import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LinksTable } from '~/components/LinksTable';
import type { LinkRecord } from '~/lib/storage';

describe('LinksTable', () => {
  it('renders a table with headers and rows for each link', () => {
    const links: LinkRecord[] = [
      {
        code: 'abc123',
        url: 'https://example.com/1',
        clicks: 5,
        createdAt: '2024-01-01T00:00:00.000Z',
      },
      {
        code: 'def456',
        url: 'https://example.com/2',
        clicks: 10,
        createdAt: '2024-01-02T00:00:00.000Z',
      },
    ];

    render(<LinksTable links={links} />);

    // Check headers
    expect(screen.getByText('Short Link')).toBeInTheDocument();
    expect(screen.getByText('Target URL')).toBeInTheDocument();
    expect(screen.getByText('Created At')).toBeInTheDocument();
    expect(screen.getByText('Click Count')).toBeInTheDocument();

    // Check link codes as clickable links
    expect(screen.getByRole('link', { name: 'abc123' })).toHaveAttribute('href', '/abc123');
    expect(screen.getByRole('link', { name: 'def456' })).toHaveAttribute('href', '/def456');

    // Check target URLs
    expect(screen.getByText('https://example.com/1')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/2')).toBeInTheDocument();

    // Check created at dates
    expect(screen.getByText('2024-01-01T00:00:00.000Z')).toBeInTheDocument();
    expect(screen.getByText('2024-01-02T00:00:00.000Z')).toBeInTheDocument();

    // Check click counts
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders empty state message when links array is empty', () => {
    render(<LinksTable links={[]} />);

    expect(screen.getByText('No links yet')).toBeInTheDocument();
  });
});
