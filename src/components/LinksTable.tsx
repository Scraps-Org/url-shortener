import { LinkRecord } from '~/lib/store';

export function LinksTable({ links }: { links: LinkRecord[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Short Link</th>
          <th>Target URL</th>
          <th>Clicks</th>
        </tr>
      </thead>
      <tbody>
        {links.map((link) => (
          <tr key={link.code}>
            <td>
              <a href={`/${link.code}`}>{link.code}</a>
            </td>
            <td>{link.url}</td>
            <td>{link.clicks}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
