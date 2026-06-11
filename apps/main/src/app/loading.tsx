const SKELETON_KEYS = ['skeleton-1', 'skeleton-2', 'skeleton-3'];

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12">
      <header>
        <div className="h-7 w-24 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-200" />
      </header>
      <div className="flex flex-col gap-4">
        {SKELETON_KEYS.map((key) => (
          <div key={key} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
              <div className="flex flex-col gap-2">
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
