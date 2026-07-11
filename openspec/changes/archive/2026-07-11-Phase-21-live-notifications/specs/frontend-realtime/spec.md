## MODIFIED Requirements

### Requirement: Frontend Realtime Stream

The main app SHALL connect to the backend realtime SSE stream from the browser.

#### Scenario: Realtime stream connects

- **WHEN** the realtime hook mounts in the browser
- **THEN** it SHALL create an `EventSource` connection to `/realtime/stream`
- **AND** it SHALL include `viewerId` in the stream URL when a viewer id is provided
- **AND** it SHALL expose connection state to the UI

#### Scenario: Notification created event is received

- **WHEN** an SSE event of type `notification.created` is received
- **THEN** the frontend SHALL parse it into a `NotificationItem`
- **AND** it SHALL update the last event timestamp
- **AND** it SHALL notify any registered live notification handler

#### Scenario: Malformed notification event is received

- **WHEN** an SSE event of type `notification.created` has malformed data
- **THEN** the frontend SHALL ignore the malformed notification payload
- **AND** it SHALL NOT crash or unmount the rest of the app
