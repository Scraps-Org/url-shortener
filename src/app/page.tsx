import { ShortenForm } from '~/components/ShortenForm';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <ShortenForm />
      <p>
        <Link href="/links">View all links</Link>
      </p>
    </div>
  );
}
