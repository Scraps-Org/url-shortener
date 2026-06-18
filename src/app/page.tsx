import { ShortenForm } from '~/components/ShortenForm';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <ShortenForm />
      <p>
        <Link href="/links">My links</Link>
      </p>
    </>
  );
}
