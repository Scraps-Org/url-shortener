import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Page from '../../src/app/page';

describe('Copy Short Link', () => {
  it('should copy the generated short link to the clipboard when the copy button is clicked', async () => {
    // Mock navigator.clipboard.writeText
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    });

    render(<Page />);

    // 1. Trigger the shortening process to get a result
    const input = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /shorten/i });

    fireEvent.change(input, { target: { value: 'https://example.com' } });
    fireEvent.click(submitButton);

    // 2. Find the copy button in the result area
    const copyButton = await screen.findByRole('button', { name: /copy/i });

    // 3. Identify the link text that should be copied
    // We use a regex to find the generated short link
    const linkElement = screen.getByText(/https?:\/\/[^\s]+/i);
    const expectedLink = linkElement.textContent!;

    // 4. Perform the copy action
    fireEvent.click(copyButton);

    // 5. Assert the clipboard API was called with the correct link
    expect(writeTextMock).toHaveBeenCalledWith(expectedLink);
  });
});