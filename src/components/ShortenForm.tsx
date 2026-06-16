'use client';

import { useState } from 'react';

export function ShortenForm() {
  const [url, setUrl] = useState('');
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data: { code: string } = await response.json();
    setCode(data.code);
    setCopied(false);
  }

  async function handleCopy() {
    if (!code) return;
    const fullUrl = `${window.location.origin}/${code}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const fullUrl = code ? `${window.location.origin}/${code}` : '';

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="url"
        name="url"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="Enter a URL"
        aria-label="Enter a URL"
      />
      <button type="submit">Shorten</button>
      {code !== null && (
        <p>
          Short URL: <a href={fullUrl}>{fullUrl}</a>
          <button type="button" onClick={handleCopy} style={{ marginLeft: '8px' }}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </p>
      )}
    </form>
  );
}
