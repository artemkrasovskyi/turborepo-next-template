import { requireViewerUser } from '@/features/auth/lib/viewer';
import { InboxList } from '@/features/direct-messages/components/inbox-list';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const viewer = await requireViewerUser();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">Messages</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Private conversations with other users.</p>
      </header>
      <InboxList viewerId={viewer.id} />
    </main>
  );
}
