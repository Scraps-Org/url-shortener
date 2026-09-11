import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ShortenForm from '../../src/components/ShortenForm'

const ORIGIN = 'https://short.example'
const CODE = 'abc123'
const FULL_URL = `${ORIGIN}/${CODE}`

beforeEach(() => {
  Object.defineProperty(window, 'location', {
    value: { origin: ORIGIN },
    writable: true,
  })
  vi.stubGlobal('fetch', vi.fn<[RequestInfo | URL, RequestInit?], Promise<Response>>(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ code: CODE }),
    } as Response)
  ))
  const writeText = vi.fn<[string], Promise<void>>(() => Promise.resolve())
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    writable: true,
    configurable: true,
  })
})

describe('A-1: ShortenForm displays full URL after successful shorten', () => {
  it('shows origin/code as the result, not the bare code alone', async () => {
    render(<ShortenForm />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'https://example.com/long' } })

    const button = screen.getByRole('button', { name: /short|단축|shorten/i })
    await act(async () => {
      fireEvent.click(button)
    })

    await waitFor(() => {
      expect(screen.getByText(FULL_URL)).toBeInTheDocument()
    })

    // The bare code alone must NOT be the only result shown
    const allText = screen.getAllByText((_content, element) => {
      if (!element) return false
      const text = element.textContent ?? ''
      return text.trim() === CODE
    })
    // If bare code appears, full URL must also appear (full URL contains code)
    // The key assertion: full URL is visible
    expect(screen.getByText(FULL_URL)).toBeInTheDocument()
    // And it must not be displayed as code-only (a node whose ENTIRE text is just the bare code)
    allText.forEach((el) => {
      // Any element showing only the bare code should not be the primary result container
      // The result must include the origin prefix
      expect(el.textContent).not.toBe(CODE)
    })
  })
})

describe('A-2: result area has a clickable <a> link and a copy button', () => {
  it('renders an <a> with href=fullUrl', async () => {
    render(<ShortenForm />)

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'https://example.com/long' },
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /short|단축|shorten/i }))
    })

    const link = await waitFor(() => screen.getByRole('link'))
    expect(link).toHaveAttribute('href', FULL_URL)
  })

  it('renders a copy button that calls navigator.clipboard.writeText with the full URL', async () => {
    render(<ShortenForm />)

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'https://example.com/long' },
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /short|단축|shorten/i }))
    })

    const copyButton = await waitFor(() =>
      screen.getByRole('button', { name: /복사|copy/i })
    )

    await act(async () => {
      fireEvent.click(copyButton)
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(FULL_URL)
  })
})
