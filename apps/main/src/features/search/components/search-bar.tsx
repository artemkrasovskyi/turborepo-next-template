'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type SearchBarProps = {
  defaultValue: string;
};

export function SearchBar({ defaultValue }: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      router.push(`/explore?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/explore');
    }
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex gap-2">
      <input
        type="search"
        aria-label="Search users"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search users…"
        className="focus-ring flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
      />
      <button
        type="submit"
        className="focus-ring rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)]"
      >
        Search
      </button>
    </form>
  );
}
