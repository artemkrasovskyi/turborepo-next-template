import { createNotificationsClient } from '@repo/api-client/features/notifications';
import { createUsersClient } from '@repo/api-client/features/users';
import { NotificationItem } from '@/features/notifications/components/notification-item';
import { NotificationLoadMoreButton } from '@/features/notifications/components/notification-load-more-button';

export const dynamic = 'force-dynamic';

const usersClient = createUsersClient();
const notificationsClient = createNotificationsClient();

export default async function NotificationsPage() {
  const viewer = await usersClient.getViewerUser();

  if (!viewer) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12">
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h1 className="text-lg font-semibold text-slate-950">No users yet</h1>
          <p className="mt-2 text-sm text-slate-600">
            Run{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">
              bun run db:seed
            </code>{' '}
            to add sample data.
          </p>
        </div>
      </main>
    );
  }

  const page = await notificationsClient.getNotifications({ userId: viewer.id });
  const isEmpty = page.items.length === 0 && page.nextCursor === null;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-6 py-12">
      <header>
        <h1 className="text-2xl font-semibold text-slate-950">Notifications</h1>
      </header>
      {isEmpty ? (
        <p className="text-sm text-slate-600">No notifications yet.</p>
      ) : (
        page.items.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))
      )}
      <NotificationLoadMoreButton userId={viewer.id} initialCursor={page.nextCursor} />
    </main>
  );
}
