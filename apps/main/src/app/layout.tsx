import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { getViewerUser } from '@/features/auth/lib/viewer';
import { NavBar } from '@/features/nav/components/nav-bar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Main App',
  description: 'Turborepo Next.js main application',
};

type RootLayoutProps = { children: ReactNode };

const RootLayout = async ({ children }: Readonly<RootLayoutProps>) => {
  const viewer = await getViewerUser();

  return (
    <html lang="en">
      <body className="bg-[var(--color-background)] pb-20 text-[var(--color-text)] sm:pb-0">
        {/* Runs before paint to apply saved theme and avoid flash */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('flock-theme');if(t==='light'||t==='dark'){document.documentElement.classList.add('theme-'+t);}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('theme-dark');}else{document.documentElement.classList.add('theme-light');}})();`,
          }}
        />
        <NavBar viewer={viewer} />
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
