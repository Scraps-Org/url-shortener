import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import ShortenForm from '../../src/components/ShortenForm'

describe('ShortenForm — full URL display (A-1, A-2)', () => {
  const ORIGIN = 'https://short.example.com'
  const CODE = 'abc123'
  const FULL_URL = `${ORIGIN}/${CODE}`

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { origin: ORIGIN },
      writable: true,
      configurable: true,
    })
    vi.stubGlobal('fetch', vi.fn<[RequestInfo | URL, RequestInit?], Promise<Response>>().mockResolvedValue(
      new Response(JSON.stringify({ code: CODE }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    ))
    const clipboardMock = { writeText: vi.fn<[string], Promise<void>>().mockResolvedValue(undefined) }
    Object.defineProperty(navigator, 'clipboard', {
      value: clipboardMock,
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  async function submitForm() {
    render(<ShortenForm />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'https://example.com/long-path' } })
    fireEvent.click(screen.getByRole('button', { name: /shorten/i }))
    await waitFor(() => {
      expect(screen.getByRole('link')).toBeDefined()
    })
  }

  it('A-1: displays full URL (origin + "/" + code), not code alone', async () => {
    await submitForm()

    expect(screen.getByText(FULL_URL)).toBeDefined()

    const allText = document.body.textContent ?? ''
    const codeOnlyPattern = new RegExp(`(?<!/)\\b${CODE}\\b(?!/)`, 'g')
    const codeAloneMatches = allText.match(codeOnlyPattern) ?? []
    expect(
      codeAloneMatches.every((match) => !allText.includes(match)),
      `Code "${CODE}" should not appear standalone — found: ${codeAloneMatches.join(', ')}`
    ).toBe(true)
  })

  it('A-2: result has <a href=fullUrl> and a copy button calling clipboard.writeText(fullUrl)', async () => {
    await submitForm()

    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe(FULL_URL)

    const copyButton = screen.getByRole('button', { name: /복사|copy/i })
    expect(copyButton).toBeDefined()

    fireEvent.click(copyButton)
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(FULL_URL)
    })
  })
})
