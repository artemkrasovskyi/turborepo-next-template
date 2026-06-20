type EmptyStateProps = {
  heading: string;
  description: React.ReactNode;
};

export function EmptyState({ heading, description }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
      <h2 className="text-lg font-semibold text-[var(--color-text)]">{heading}</h2>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">{description}</p>
    </div>
  );
}
