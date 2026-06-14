import { createNotificationsClient } from '@repo/api-client/features/notifications';
import { createUsersClient } from '@repo/api-client/features/users';
import { NotificationItem } from '@/features/notifications/components/notification-item';
import { NotificationLoadMoreButton } from '@/features/notifications/components/notification-load-more-button';
import { EmptyState } from '@/features/ui/components/empty-state';

export const dynamic = 'force-dynamic';

const usersClient = createUsersClient();
const notificationsClient = createNotificationsClient();

export default async function NotificationsPage() {
  const viewer = await usersClient.getViewerUser();

  if (!viewer) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12 md:max-w-3xl">
        <EmptyState
          heading="No users yet"
          description={
            <>
              Run{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">
                bun run db:seed
              </code>{' '}
              to add sample data.
            </>
          }
        />
      </main>
    );
  }

  const page = await notificationsClient.getNotifications({ userId: viewer.id });
  const isEmpty = page.items.length === 0 && page.nextCursor === null;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-6 py-12 md:max-w-3xl">
      <header>
        <h1 className="text-2xl font-semibold text-slate-950">Notifications</h1>
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
