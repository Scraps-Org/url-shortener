'use client';

import { useState } from 'react';

export function ShortenForm() {
  const [url, setUrl] = useState('');
  const [code, setCode] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data: { code: string } = await response.json();
    setCode(data.code);
  }

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
          Short code: <span data-testid="short-code">{code}</span>
        </p>
      )}
    </form>
  );
}
