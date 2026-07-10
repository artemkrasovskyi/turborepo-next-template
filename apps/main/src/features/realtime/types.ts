/**
 * @openspec openspec/specs/frontend-realtime/spec.md
 * @change Phase-20-realtime-ui
 * @change Phase-21-live-notifications
 */
import type { NotificationItem } from '@repo/types/features/notifications';

export type ConnectedEvent = { type: 'connected'; clientId: string; timestamp: string };
export type HeartbeatEvent = { type: 'heartbeat'; timestamp: string };
export type SystemEvent = { type: 'system'; message: string; timestamp: string };
export type NotificationCreatedEvent = { type: 'notification.created'; notification: NotificationItem };
export type RealtimeEvent = ConnectedEvent | HeartbeatEvent | SystemEvent | NotificationCreatedEvent;
export type ConnectionState = 'connected' | 'disconnected' | 'reconnecting';
