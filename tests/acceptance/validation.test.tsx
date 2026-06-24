import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Page from '../../src/app/page';

describe('URL Validation Acceptance', () => {
  it('should show an inline error and not submit when input is empty or invalid', async () => {
    // Mock the API call to ensure it's not called on invalid input
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    render(<Page />);

    const input = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /shorten|submit/i });

    // Test Case 1: Empty Value
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/required|empty/i)).toBeInTheDocument();
    });
    expect(mockFetch).not.toHaveBeenCalled();

    // Test Case 2: Non-URL Value
    fireEvent.change(input, { target: { value: 'not-a-url' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid url|please enter a valid url/i)).toBeInTheDocument();
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });
});