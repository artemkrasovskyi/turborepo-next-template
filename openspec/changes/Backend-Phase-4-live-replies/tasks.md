## 1. OpenSpec Validation

- [ ] 1.1 Create the OpenSpec change files
- [ ] 1.2 Run `openspec validate Backend-Phase-4-live-replies --strict`
- [ ] 1.3 Do not begin implementation until the change has been reviewed

## 2. Realtime Thread Subscriptions

- [ ] 2.1 Update `GET /realtime/stream` handling to accept optional `threadId`
- [ ] 2.2 Store `threadId` with the connection when provided
- [ ] 2.3 Maintain a thread-to-client index for targeted publishing
- [ ] 2.4 Remove the client from thread mappings on disconnect
- [ ] 2.5 Preserve existing viewer-targeted notification behavior
- [ ] 2.6 Preserve existing connected and heartbeat events

## 3. Targeted Reply Publishing

- [ ] 3.1 Add a `RealtimeService` method for publishing to all active connections for a thread id
- [ ] 3.2 Log publish write errors with `clientId`, thread id, and event name
- [ ] 3.3 Clean up closed or unwritable connections encountered during publish
- [ ] 3.4 Keep delivery best-effort and in-memory

## 4. Reply Event Production

- [ ] 4.1 Publish `reply.created` after a reply is persisted
- [ ] 4.2 Map the persisted reply to `ThreadPost`
- [ ] 4.3 Include `threadId`, `reply`, and ISO `timestamp` in the event payload
- [ ] 4.4 Do not publish events for failed or rejected reply submissions
- [ ] 4.5 Do not expose private user fields in live reply payloads
- [ ] 4.6 Add OpenSpec traceability annotations to live reply publisher/service code

## 5. Tests

- [ ] 5.1 Test stream registration with and without `threadId`
- [ ] 5.2 Test disconnect cleanup removes thread mappings
- [ ] 5.3 Test targeted publish sends only to matching thread connections
- [ ] 5.4 Test multiple active connections for one thread all receive `reply.created`
- [ ] 5.5 Test publish write errors are logged and cleaned up
- [ ] 5.6 Test reply event payload uses public `ThreadPost` fields only
- [ ] 5.7 Test rejected reply creation does not publish a live event

## 6. Verification

- [ ] 6.1 Run `bunx turbo typecheck --filter=@repo/api`
- [ ] 6.2 Run `bunx turbo lint --filter=@repo/api`
- [ ] 6.3 Run `bunx turbo test --filter=@repo/api`
- [ ] 6.4 Run `bunx turbo build --filter=@repo/api`
- [ ] 6.5 With the API running, manually verify a subscribed thread stream receives `reply.created`
