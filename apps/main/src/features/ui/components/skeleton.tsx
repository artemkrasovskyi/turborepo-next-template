type SkeletonProps = {
  className: string;
};

export function SkeletonLine({ className }: SkeletonProps) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

export function SkeletonCircle({ className }: SkeletonProps) {
  return <div className={`animate-pulse rounded-full bg-slate-200 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
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
}

export function SkeletonNotificationRow() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <SkeletonCircle className="h-10 w-10" />
      <div className="flex flex-1 flex-col gap-2">
        <SkeletonLine className="h-4 w-3/4" />
        <SkeletonLine className="h-3 w-1/3" />
      </div>
    </div>
  );
}
