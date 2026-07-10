import { createNotificationsClient } from '@repo/api-client/features/notifications';
import { requireViewerUser } from '@/features/auth/lib/viewer';
import { NotificationLiveList } from '@/features/notifications/components/notification-live-list';

export const dynamic = 'force-dynamic';

const notificationsClient = createNotificationsClient();

const NotificationsPage = async () => {
  const viewer = await requireViewerUser();

  const page = await notificationsClient.getNotifications({ userId: viewer.id });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-6 py-12 md:max-w-3xl">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">Notifications</h1>
      </header>
      <NotificationLiveList
        initialItems={page.items}
        initialCursor={page.nextCursor}
        viewerId={viewer.id}
      />
    </main>
  );
};

export default NotificationsPage;
