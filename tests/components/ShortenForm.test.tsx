import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShortenForm } from '~/components/ShortenForm';

describe('ShortenForm', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ code: 'abc123' }),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the input and submit button', () => {
    render(<ShortenForm />);
    expect(screen.getByPlaceholderText('Enter a URL')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Shorten' })).toBeInTheDocument();
  });

  it('submits the url to /api/shorten and displays the returned full URL', async () => {
    render(<ShortenForm />);

    const input = screen.getByPlaceholderText('Enter a URL');
    fireEvent.change(input, { target: { value: 'https://example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Shorten' }));

    const expectedUrl = `${window.location.origin}/abc123`;
    await waitFor(() => {
      const link = screen.getByRole('link', { name: expectedUrl });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', expectedUrl);
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/shorten',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ url: 'https://example.com' }),
      }),
    );
  });

  it('shows an inline error and does not fetch when the input is empty', () => {
    render(<ShortenForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Shorten' }));

    expect(screen.getByText('URL을 입력해 주세요')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows error for invalid URL and does not call fetch', () => {
    render(<ShortenForm />);

    const input = screen.getByPlaceholderText('Enter a URL');
    fireEvent.change(input, { target: { value: 'not a url' } });
    fireEvent.click(screen.getByRole('button', { name: 'Shorten' }));

    expect(screen.getByText('올바른 URL을 입력해 주세요')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('copies the short URL to clipboard and shows feedback', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: writeTextSpy,
      },
    });

    render(<ShortenForm />);

    const input = screen.getByPlaceholderText('Enter a URL');
    fireEvent.change(input, { target: { value: 'https://example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Shorten' }));

    const copyButton = await screen.findByRole('button', { name: 'Copy' });
    fireEvent.click(copyButton);

    const expectedUrl = `${window.location.origin}/abc123`;
    expect(writeTextSpy).toHaveBeenCalledWith(expectedUrl);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument();
    });
  });
});
