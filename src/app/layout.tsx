import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'url-shortener',
  description: 'URL 단축 웹앱 — Next.js 15 (App Router)',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
