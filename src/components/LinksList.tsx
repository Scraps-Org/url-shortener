'use client';

import { useEffect, useState } from 'react';

type LinkRow = {
  code: string;
  url: string;
  clicks: number;
};

export function LinksList() {
  const [links, setLinks] = useState<LinkRow[]>([]);

  useEffect(() => {
    fetch('/api/links')
      .then((r) => r.json())
      .then((d) => setLinks(d.links));
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Code</th>
          <th>URL</th>
          <th>Clicks</th>
        </tr>
      </thead>
      <tbody>
        {links.map((l) => (
          <tr key={l.code}>
            <td>{l.code}</td>
            <td>{l.url}</td>
            <td>{l.clicks}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
