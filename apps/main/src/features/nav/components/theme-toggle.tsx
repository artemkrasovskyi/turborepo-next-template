'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'flock-theme';

function getAppliedTheme(): Theme {
  if (document.documentElement.classList.contains('theme-dark')) return 'dark';
  return 'light';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('theme-light', 'theme-dark');
  root.classList.add(`theme-${theme}`);
  localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(getAppliedTheme());
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setTheme(next);
  }

  if (theme === null) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className="focus-ring flex flex-1 flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] sm:flex-row sm:gap-2 sm:text-sm"
    >
      {theme === 'dark' ? (
        <Sun size={20} aria-hidden="true" />
      ) : (
        <Moon size={20} aria-hidden="true" />
      )}
      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}
