import { LinkRecord } from '~/lib/storage';

export function LinksTable({ links }: { links: LinkRecord[] }) {
  if (links.length === 0) {
    return <p>No links yet</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Short Link</th>
          <th>Target URL</th>
          <th>Created At</th>
          <th>Click Count</th>
        </tr>
      </thead>
      <tbody>
        {links.map((link) => (
          <tr key={link.code}>
            <td>
              <a href={`/${link.code}`}>{link.code}</a>
            </td>
            <td>{link.url}</td>
            <td>{link.createdAt}</td>
            <td>{link.clicks}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
