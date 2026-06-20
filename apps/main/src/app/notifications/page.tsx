import { createNotificationsClient } from '@repo/api-client/features/notifications';
import { requireViewerUser } from '@/features/auth/lib/viewer';
import { NotificationItem } from '@/features/notifications/components/notification-item';
import { NotificationLoadMoreButton } from '@/features/notifications/components/notification-load-more-button';
import { EmptyState } from '@/features/ui/components/empty-state';

export const dynamic = 'force-dynamic';

const notificationsClient = createNotificationsClient();

export default async function NotificationsPage() {
  const viewer = await requireViewerUser();

  const page = await notificationsClient.getNotifications({ userId: viewer.id });
  const isEmpty = page.items.length === 0 && page.nextCursor === null;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-6 py-12 md:max-w-3xl">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">Notifications</h1>
      </header>
      {isEmpty ? (
        <EmptyState
          heading="No notifications yet"
          description="When people follow you or like your posts, you'll see it here."
        />
      ) : (
        page.items.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))
      )}
      <NotificationLoadMoreButton userId={viewer.id} initialCursor={page.nextCursor} />
    </main>
  );
}
