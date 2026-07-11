# Spec: Frontend Realtime Stream

## Requirements

### Requirement: Frontend Realtime Stream

The main app SHALL connect to the backend realtime SSE stream from the browser.

#### Scenario: Realtime API URL is configured

- **WHEN** the frontend app needs to open a realtime stream
- **THEN** it SHALL build the stream URL from `NEXT_PUBLIC_API_URL`
- **AND** local development configuration SHALL use `NEXT_PUBLIC_API_URL=http://localhost:4000`

#### Scenario: Realtime stream connects

- **WHEN** the realtime hook mounts in the browser
- **THEN** it SHALL create an `EventSource` connection to `/realtime/stream`
- **AND** it SHALL include `viewerId` in the stream URL when a viewer id is provided
- **AND** it SHALL expose connection state to the UI

#### Scenario: Realtime stream connects with thread id

- **WHEN** the realtime hook mounts with a thread id
- **THEN** it SHALL include `threadId` in the stream URL
- **AND** it SHALL expose connection state to the UI

#### Scenario: Reply created event is received

- **WHEN** an SSE event of type `reply.created` is received for the subscribed thread
- **THEN** the frontend SHALL parse it into a `ThreadPost`
- **AND** it SHALL update the last event timestamp
- **AND** it SHALL notify any registered live reply handler

#### Scenario: Reply created event is for another thread

- **WHEN** an SSE event of type `reply.created` is received for a different thread id
- **THEN** the frontend SHALL ignore it for the current thread UI

#### Scenario: Malformed reply event is received

- **WHEN** an SSE event of type `reply.created` has malformed data
- **THEN** the frontend SHALL ignore the malformed reply payload
- **AND** it SHALL NOT crash or unmount the rest of the app

#### Scenario: Notification created event is received

- **WHEN** an SSE event of type `notification.created` is received
- **THEN** the frontend SHALL parse it into a `NotificationItem`
- **AND** it SHALL update the last event timestamp
- **AND** it SHALL notify any registered live notification handler

#### Scenario: Malformed notification event is received

- **WHEN** an SSE event of type `notification.created` has malformed data
- **THEN** the frontend SHALL ignore the malformed notification payload
- **AND** it SHALL NOT crash or unmount the rest of the app

#### Scenario: Connected event is received

- **WHEN** an SSE event of type `connected` is received
- **THEN** the frontend SHALL parse `clientId` and `timestamp`
- **AND** it SHALL set connection state to `connected`
- **AND** it SHALL update the last event timestamp

#### Scenario: Heartbeat event is received

- **WHEN** an SSE event of type `heartbeat` is received
- **THEN** the frontend SHALL parse its timestamp
- **AND** it SHALL update the last event timestamp
- **AND** it SHALL keep the connection state connected

#### Scenario: System message event is received

- **WHEN** an SSE event of type `system` is received
- **THEN** the frontend SHALL parse its message and timestamp
- **AND** it SHALL update the last event timestamp
- **AND** it SHALL NOT crash if no visible message UI consumes it yet

#### Scenario: Realtime stream errors

- **WHEN** `EventSource.onerror` fires
- **THEN** the frontend SHALL set connection state to `reconnecting`
- **AND** it SHALL NOT crash or unmount the rest of the app

#### Scenario: Realtime hook unmounts

- **WHEN** the component using the realtime hook unmounts
- **THEN** the frontend SHALL close the `EventSource`
- **AND** it SHALL set connection state to `disconnected`

### Requirement: Realtime Status UI

The main app SHALL expose a small UI surface for realtime connection status.

#### Scenario: Status UI renders

- **WHEN** `RealtimeStatus` renders
- **THEN** it SHALL show the current realtime connection status
- **AND** it SHALL show the last received event time when available

#### Scenario: Status UI is mounted

- **WHEN** the main app layout renders
- **THEN** the realtime status UI SHALL be available in the app layout or a development-only app area
- **AND** development-only UI SHALL NOT appear in production
