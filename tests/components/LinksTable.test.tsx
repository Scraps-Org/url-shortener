import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LinksTable } from '~/components/LinksTable';

describe('LinksTable', () => {
  it('renders a table with links data', () => {
    const links = [
      { code: 'abc123', url: 'https://example.com', clicks: 5 },
      { code: 'def456', url: 'https://other.org', clicks: 0 }
    ];
    
    render(<LinksTable links={links} />);
    
    // Check that the short link anchor has the correct href
    const anchor = screen.getByRole('link', { name: 'abc123' });
    expect(anchor).toHaveAttribute('href', '/abc123');
    
    // Check that the target URL is present
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    
    // Check that the click count is rendered
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
