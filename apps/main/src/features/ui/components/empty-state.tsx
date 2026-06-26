import { FC, ReactNode } from 'react';

type EmptyStateProps = {
  heading: string;
  description: ReactNode;
};

export const EmptyState: FC<EmptyStateProps> = ({ heading, description }) => (
  <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
    <h2 className="text-lg font-semibold text-[var(--color-text)]">{heading}</h2>
    <p className="mt-2 text-sm text-[var(--color-text-muted)]">{description}</p>
  </div>
);
