export type NotificationType = 'FOLLOW' | 'LIKE';

export type NotificationActor = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export type NotificationItem = {
  id: string;
  type: NotificationType;
  actor: NotificationActor;
  createdAt: string;
  post: { id: string; body: string } | null;
};

export type NotificationPage = {
  items: NotificationItem[];
  nextCursor: string | null;
};
