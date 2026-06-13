'use server';

import { createNotificationsClient } from '@repo/api-client/features/notifications';
import type { NotificationPage } from '@repo/types/features/notifications';

const notificationsClient = createNotificationsClient();

export async function loadMoreNotificationsAction(
  userId: string,
  cursor: string,
): Promise<NotificationPage> {
  return notificationsClient.getNotifications({ userId, cursor });
}
