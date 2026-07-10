## 1. OpenSpec Validation

- [x] 1.1 Create the OpenSpec change files
- [x] 1.2 Run `openspec validate Backend-Phase-3-live-notifications --strict`
- [x] 1.3 Do not begin implementation until the change has been reviewed

## 2. Realtime Recipient Tracking

- [x] 2.1 Update `GET /realtime/stream` handling to accept optional `viewerId`
- [x] 2.2 Store `viewerId` with the connection when provided
- [x] 2.3 Maintain a viewer-to-client index for targeted publishing
- [x] 2.4 Remove the client from all realtime registries on disconnect
- [x] 2.5 Preserve existing connected and heartbeat events for all clients

## 3. Targeted Realtime Publishing

- [x] 3.1 Add a `RealtimeService` method for publishing an SSE event to all active connections for a viewer id
- [x] 3.2 Return or expose enough delivery result information for tests and logging
- [x] 3.3 Log publish write errors with `clientId` and event name
- [x] 3.4 Clean up closed or unwritable connections encountered during publish

## 4. Live Notification Service

- [x] 4.1 Add backend notification service behavior for creating follow notifications
- [x] 4.2 Add backend notification service behavior for creating like notifications
- [x] 4.3 Persist each notification before live delivery
- [x] 4.4 Map created notifications to `NotificationItem`
- [x] 4.5 Publish `notification.created` to the notification recipient
- [x] 4.6 Do not publish self-like notifications or duplicate no-op notifications
- [x] 4.7 Add OpenSpec traceability annotations to live notification service code

## 5. Tests

- [x] 5.1 Test stream registration with and without `viewerId`
- [x] 5.2 Test disconnect cleanup removes viewer-to-client mappings
- [x] 5.3 Test targeted publish sends only to matching viewer connections
- [x] 5.4 Test notification creation publishes `notification.created` after persistence
- [x] 5.5 Test disconnected recipients still keep persisted notification records
- [x] 5.6 Test publish write errors are logged and cleaned up
- [x] 5.7 Test private fields are not included in live notification payloads

## 6. Verification

- [x] 6.1 Run `bunx turbo typecheck --filter=@repo/api`
- [x] 6.2 Run `bunx turbo lint --filter=@repo/api`
- [x] 6.3 Run `bunx turbo test --filter=@repo/api`
- [x] 6.4 Run `bunx turbo build --filter=@repo/api`
- [ ] 6.5 With the API running, manually verify a connected viewer stream receives `notification.created`
