## 1. OpenSpec Validation

- [x] 1.1 Create the OpenSpec change files
- [x] 1.2 Run `openspec validate Backend-Phase-4-live-replies --strict`
- [x] 1.3 Do not begin implementation until the change has been reviewed

## 2. Realtime Thread Subscriptions

- [x] 2.1 Update `GET /realtime/stream` handling to accept optional `threadId`
- [x] 2.2 Store `threadId` with the connection when provided
- [x] 2.3 Maintain a thread-to-client index for targeted publishing
- [x] 2.4 Remove the client from thread mappings on disconnect
- [x] 2.5 Preserve existing viewer-targeted notification behavior
- [x] 2.6 Preserve existing connected and heartbeat events

## 3. Targeted Reply Publishing

- [x] 3.1 Add a `RealtimeService` method for publishing to all active connections for a thread id
- [x] 3.2 Log publish write errors with `clientId`, thread id, and event name
- [x] 3.3 Clean up closed or unwritable connections encountered during publish
- [x] 3.4 Keep delivery best-effort and in-memory

## 4. Reply Event Production

- [x] 4.1 Publish `reply.created` after a reply is persisted
- [x] 4.2 Map the persisted reply to `ThreadPost`
- [x] 4.3 Include `threadId`, `reply`, and ISO `timestamp` in the event payload
- [x] 4.4 Do not publish events for failed or rejected reply submissions
- [x] 4.5 Do not expose private user fields in live reply payloads
- [x] 4.6 Add OpenSpec traceability annotations to live reply publisher/service code

## 5. Tests

- [x] 5.1 Test stream registration with and without `threadId`
- [x] 5.2 Test disconnect cleanup removes thread mappings
- [x] 5.3 Test targeted publish sends only to matching thread connections
- [x] 5.4 Test multiple active connections for one thread all receive `reply.created`
- [x] 5.5 Test publish write errors are logged and cleaned up
- [x] 5.6 Test reply event payload uses public `ThreadPost` fields only
- [x] 5.7 Test rejected reply creation does not publish a live event

## 6. Verification

- [x] 6.1 Run `bunx turbo typecheck --filter=@repo/api`
- [x] 6.2 Run `bunx turbo lint --filter=@repo/api`
- [x] 6.3 Run `bunx turbo test --filter=@repo/api`
- [x] 6.4 Run `bunx turbo build --filter=@repo/api`
- [x] 6.5 With the API running, manually verify a subscribed thread stream receives `reply.created`
