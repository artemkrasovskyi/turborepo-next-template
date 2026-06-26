import { FC } from 'react';

type SkeletonProps = {
  className: string;
};

export const SkeletonLine: FC<SkeletonProps> = ({ className }) => (
  <div className={`animate-pulse rounded bg-[var(--color-skeleton)] ${className}`} />
);

export const SkeletonCircle: FC<SkeletonProps> = ({ className }) => (
  <div className={`animate-pulse rounded-full bg-[var(--color-skeleton)] ${className}`} />
);

export const SkeletonCard: FC = () => (
  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <SkeletonCircle className="h-10 w-10" />
      <div className="flex flex-col gap-2">
        <SkeletonLine className="h-4 w-32" />
        <SkeletonLine className="h-3 w-24" />
      </div>
    </div>
    <div className="mt-3 flex flex-col gap-2">
      <SkeletonLine className="h-3 w-full" />
      <SkeletonLine className="h-3 w-5/6" />
    </div>
  </div>
);

export const SkeletonNotificationRow: FC = () => (
  <div className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
    <SkeletonCircle className="h-10 w-10" />
    <div className="flex flex-1 flex-col gap-2">
      <SkeletonLine className="h-4 w-3/4" />
      <SkeletonLine className="h-3 w-1/3" />
    </div>
  </div>
);
