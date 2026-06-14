type EmptyStateProps = {
  heading: string;
  description: React.ReactNode;
};

export function EmptyState({ heading, description }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-slate-950">{heading}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}
