import { listLinks } from '~/lib/store';
import { LinksTable } from '~/components/LinksTable';

export default async function LinksPage() {
  const links = await listLinks();
  return <LinksTable links={links} />;
}
