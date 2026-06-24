'use client';

import { useState, useTransition } from 'react';

type ToggleAction = (next: boolean) => Promise<{ error?: string | undefined } & Record<string, unknown>>;

export function useOptimisticToggle(initial: boolean, action: ToggleAction) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !value;
    setError(null);
    setValue(next);

    startTransition(async () => {
      const result = await action(next);

      if (result.error) {
        setValue(!next);
        setError(result.error);
      }
    });
  }

  return { value, error, isPending, toggle };
}
