import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Flock Admin',
  description: 'Internal tools for Flock',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
