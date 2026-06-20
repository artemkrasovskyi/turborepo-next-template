import type { Metadata } from 'next';
import { getViewerUser } from '@/features/auth/lib/viewer';
import { NavBar } from '@/features/nav/components/nav-bar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Main App',
  description: 'Turborepo Next.js main application',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewer = await getViewerUser();

  return (
    <html lang="en">
      <body className="bg-[var(--color-background)] pb-20 text-[var(--color-text)] sm:pb-0">
        <NavBar viewer={viewer} />
        {children}
      </body>
    </html>
  );
}
