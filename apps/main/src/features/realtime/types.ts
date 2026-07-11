/**
 * @openspec openspec/specs/frontend-realtime/spec.md
 * @change Phase-20-realtime-ui
 * @change Phase-21-live-notifications
 * @change Phase-22-live-replies
 */
import type { NotificationItem } from '@repo/types/features/notifications';
import type { ThreadPost } from '@repo/types/features/posts';

export type ConnectedEvent = { type: 'connected'; clientId: string; timestamp: string };
export type HeartbeatEvent = { type: 'heartbeat'; timestamp: string };
export type SystemEvent = { type: 'system'; message: string; timestamp: string };
export type NotificationCreatedEvent = { type: 'notification.created'; notification: NotificationItem };
export type ReplyCreatedEvent = {
  type: 'reply.created';
  threadId: string;
  reply: ThreadPost;
  timestamp: string;
};
export type RealtimeEvent =
  | ConnectedEvent
  | HeartbeatEvent
  | SystemEvent
  | NotificationCreatedEvent
  | ReplyCreatedEvent;
export type ConnectionState = 'connected' | 'disconnected' | 'reconnecting';
