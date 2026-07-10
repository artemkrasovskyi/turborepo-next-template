## Why

The backend realtime module can hold SSE connections, but it only sends lifecycle and heartbeat events. Notifications already exist as persisted records, but users must refresh or revisit the notifications page to see new ones. The backend needs a live notification path that publishes newly-created notification records to connected recipients.

## What Changes

- Associate realtime SSE connections with an optional viewer id.
- Add backend notification publishing for newly-created notification records.
- Send `notification.created` SSE events to active connections for the notification recipient.
- Reuse the existing `NotificationItem` shape for live payloads.
- Keep notification records persisted in Prisma before live delivery.
- Keep live delivery in-memory and best-effort for this phase.

## Impact

- Extends the existing realtime module with user-targeted event delivery.
- Adds backend notification service behavior that can create and publish follow/like notifications.
- Does not add WebSockets, Redis, queues, cross-process fanout, or unread counts.
- Does not change the Prisma schema, migrations, or seed data.
- Does not require frontend consumption in this backend phase.
