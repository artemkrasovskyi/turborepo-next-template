## 1. OpenSpec Validation

- [x] 1.1 Create the OpenSpec change files
- [x] 1.2 Run `openspec validate Phase-21-live-notifications --strict`
- [x] 1.3 Do not begin implementation until the change has been reviewed

## 2. Realtime Types and Hook

- [x] 2.1 Add `notification.created` frontend realtime event type
- [x] 2.2 Extend `useRealtimeStream` to accept optional `viewerId`
- [x] 2.3 Append `viewerId` to the EventSource URL when provided
- [x] 2.4 Add `onNotificationCreated` callback support
- [x] 2.5 Parse `notification.created` events into `NotificationItem`
- [x] 2.6 Ignore malformed notification events without crashing the UI
- [x] 2.7 Preserve connected, heartbeat, system, error, and cleanup behavior

## 3. Notifications UI Integration

- [x] 3.1 Add a client notification list component that accepts initial items, initial cursor, and viewer id
- [x] 3.2 Use `useRealtimeStream` with viewer id on the notifications page client surface
- [x] 3.3 Prepend live notifications to the rendered list
- [x] 3.4 Deduplicate notifications by id
- [x] 3.5 Preserve existing load-more pagination behavior
- [x] 3.6 Preserve the empty state until an initial or live notification exists
- [x] 3.7 Reuse the existing `NotificationItem` rendering component

## 4. Tests

- [x] 4.1 Test EventSource URL includes `viewerId` when provided
- [x] 4.2 Test `notification.created` event invokes the notification callback
- [x] 4.3 Test malformed notification events do not throw
- [x] 4.4 Test live notifications are prepended to the list
- [x] 4.5 Test duplicate live notification ids are ignored
- [x] 4.6 Test load-more still appends older notifications
- [x] 4.7 Mock EventSource and Server Actions; do not require a running backend

## 5. Verification

- [x] 5.1 Run `bunx turbo typecheck --filter=@repo/main`
- [x] 5.2 Run `bunx turbo lint --filter=@repo/main`
- [x] 5.3 Run `bunx turbo test --filter=@repo/main`
- [x] 5.4 Run `bunx turbo build --filter=@repo/main`
- [ ] 5.5 With frontend and backend running, verify a live `notification.created` event appears on `/notifications`
