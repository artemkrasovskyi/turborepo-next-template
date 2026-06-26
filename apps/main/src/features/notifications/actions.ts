'use server';

import { createNotificationsClient } from '@repo/api-client/features/notifications';
import type { NotificationPage } from '@repo/types/features/notifications';

const notificationsClient = createNotificationsClient();

export const loadMoreNotificationsAction = async (
  userId: string,
  cursor: string,
): Promise<NotificationPage> => notificationsClient.getNotifications({ userId, cursor });
