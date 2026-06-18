import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '~/app/page';

describe('Home', () => {
  it('renders a link to the links page', () => {
    render(<Home />);
    
    const link = screen.getByRole('link', { name: 'My links' });
    expect(link).toHaveAttribute('href', '/links');
  });
});
