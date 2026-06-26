/**
 * @openspec openspec/specs/frontend-realtime/spec.md
 * @change Phase-20-realtime-ui
 */
export type ConnectedEvent = { type: 'connected'; clientId: string; timestamp: string };
export type HeartbeatEvent = { type: 'heartbeat'; timestamp: string };
export type SystemEvent = { type: 'system'; message: string; timestamp: string };
export type RealtimeEvent = ConnectedEvent | HeartbeatEvent | SystemEvent;
export type ConnectionState = 'connected' | 'disconnected' | 'reconnecting';
