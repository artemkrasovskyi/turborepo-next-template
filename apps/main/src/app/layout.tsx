import type { Metadata } from 'next';
import { createUsersClient } from '@repo/api-client/features/users';
import { NavBar } from '@/features/nav/components/nav-bar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Main App',
  description: 'Turborepo Next.js main application',
};

const usersClient = createUsersClient();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewer = await usersClient.getViewerUser();

  return (
    <html lang="en">
      <body className="pb-16 sm:pb-0">
        <NavBar viewer={viewer} />
        {children}
      </body>
    </html>
  );
}
