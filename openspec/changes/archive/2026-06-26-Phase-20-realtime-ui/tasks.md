## 1. OpenSpec Validation

- [x] 1.1 Create the OpenSpec change files
- [x] 1.2 Run `openspec validate Phase-20-realtime-ui --strict`
- [x] 1.3 Do not begin implementation until the change has been reviewed

## 2. Environment Configuration

- [x] 2.1 Add `NEXT_PUBLIC_API_URL=http://localhost:4000` to `.env.example`
- [x] 2.2 Read `NEXT_PUBLIC_API_URL` from frontend code when creating the realtime stream URL
- [x] 2.3 Keep the value public-origin only; do not put secrets in `NEXT_PUBLIC_API_URL`

## 3. Realtime Types and Hook

- [x] 3.1 Add frontend realtime event types for `connected`, `heartbeat`, and `system`
- [x] 3.2 Add `useRealtimeStream` as a client hook
- [x] 3.3 Create an `EventSource` connection to `${NEXT_PUBLIC_API_URL}/realtime/stream`
- [x] 3.4 Track `connected`, `disconnected`, and `reconnecting` states
- [x] 3.5 Track `lastEvent` timestamp when known events are received
- [x] 3.6 Close the `EventSource` on unmount
- [x] 3.7 Handle `EventSource.onerror` by setting reconnecting state without throwing

## 4. Status UI

- [x] 4.1 Add `RealtimeStatus` as a client component
- [x] 4.2 Display the current connection status
- [x] 4.3 Display the last received event time when available
- [x] 4.4 Mount the status UI in the app layout or an app-level dev-only area
- [x] 4.5 Prefer dev-only rendering unless product UI explicitly requires a production status indicator

## 5. Tests

- [x] 5.1 Test realtime event type parsing/handling for connected and heartbeat events
- [x] 5.2 Test `useRealtimeStream` creates an EventSource with the configured API URL
- [x] 5.3 Test connection state updates for open, error, and cleanup paths
- [x] 5.4 Test `lastEvent` updates when known events are received
- [x] 5.5 Test `RealtimeStatus` renders status and last event time
- [x] 5.6 Mock EventSource in tests; do not require a running backend

## 6. Verification

- [x] 6.1 Run `bunx turbo typecheck --filter=@repo/main`
- [x] 6.2 Run `bunx turbo lint --filter=@repo/main`
- [x] 6.3 Run `bunx turbo test --filter=@repo/main`
- [x] 6.4 Run `bunx turbo build --filter=@repo/main`
- [ ] 6.5 With backend and frontend running, verify the status UI reaches connected state and updates on heartbeat events
