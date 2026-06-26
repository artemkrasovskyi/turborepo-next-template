## 1. OpenSpec Validation

- [x] 1.1 Create the OpenSpec change files
- [x] 1.2 Run `openspec validate Backend-Phase-2-realtime-module --strict`
- [x] 1.3 Do not begin implementation until the change has been reviewed

## 2. Realtime Module

- [x] 2.1 Add `apps/api/src/features/realtime/realtime.module.ts`
- [x] 2.2 Add `apps/api/src/features/realtime/realtime.controller.ts`
- [x] 2.3 Add `apps/api/src/features/realtime/realtime.service.ts`
- [x] 2.4 Register `RealtimeModule` in `AppModule`
- [x] 2.5 Add OpenSpec traceability annotations to the controller and service

## 3. SSE Stream Behavior

- [x] 3.1 Expose `GET /realtime/stream`
- [x] 3.2 Return SSE-compatible `text/event-stream` responses
- [x] 3.3 Generate a unique `clientId` for each connection
- [x] 3.4 Register each connection in `RealtimeService`
- [x] 3.5 Send an initial `connected` event with `clientId` and ISO timestamp
- [x] 3.6 Remove the connection when the request closes

## 4. Heartbeat and Logging

- [x] 4.1 Send heartbeat events every 15-30 seconds
- [x] 4.2 Include a timestamp in heartbeat payloads
- [x] 4.3 Clear heartbeat intervals on disconnect
- [x] 4.4 Log connection opened with `clientId`
- [x] 4.5 Log connection closed with `clientId`
- [x] 4.6 Log heartbeat write errors with `clientId`

## 5. CORS

- [x] 5.1 Enable CORS in the API app for the `apps/main` origin
- [x] 5.2 Read the allowed frontend origin from an environment variable with local default `http://localhost:3000`
- [x] 5.3 Do not use wildcard CORS for the realtime endpoint

## 6. Tests

- [x] 6.1 Test connection registration and cleanup
- [x] 6.2 Test initial `connected` event payload
- [x] 6.3 Test heartbeat scheduling and interval cleanup with fake timers
- [x] 6.4 Test heartbeat write errors are logged and cleaned up
- [x] 6.5 Test SSE response headers or controller stream setup
- [x] 6.6 Test CORS origin configuration

## 7. Verification

- [x] 7.1 Run `bunx turbo typecheck --filter=@repo/api`
- [x] 7.2 Run `bunx turbo lint --filter=@repo/api`
- [x] 7.3 Run `bunx turbo test --filter=@repo/api`
- [x] 7.4 Run `bunx turbo build --filter=@repo/api`
- [ ] 7.5 Start the API app and manually verify `GET /realtime/stream` receives `connected` and heartbeat events
