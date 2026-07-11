## MODIFIED Requirements

### Requirement: Frontend Realtime Stream

The main app SHALL connect to the backend realtime SSE stream from the browser.

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
