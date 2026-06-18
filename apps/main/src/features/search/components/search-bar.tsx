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
        className="focus-ring flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:border-teal-600"
      />
      <button
        type="submit"
        className="focus-ring rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
      >
        Search
      </button>
    </form>
  );
}
