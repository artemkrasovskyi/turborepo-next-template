## MODIFIED Requirements

### Requirement: Realtime SSE Module

The API app SHALL expose a realtime module using server-sent events.

#### Scenario: Client opens realtime stream

- **WHEN** a client sends `GET /realtime/stream`
- **THEN** the API app SHALL keep the HTTP connection open as an SSE stream
- **AND** the response SHALL use `text/event-stream`
- **AND** the response SHALL use no-cache behavior suitable for realtime streaming

#### Scenario: Client opens realtime stream with viewer id

- **WHEN** a client sends `GET /realtime/stream?viewerId=<viewerId>`
- **THEN** the API app SHALL associate that connection with the supplied viewer id
- **AND** the connection SHALL remain eligible for lifecycle and heartbeat events
- **AND** the connection SHALL be eligible for live events targeted to that viewer id

#### Scenario: Connection opens

- **WHEN** a realtime stream connection is accepted
- **THEN** the API app SHALL create a unique `clientId` for that connection
- **AND** it SHALL register the connection
- **AND** it SHALL log that the connection opened with the `clientId`

#### Scenario: Connection closes

- **WHEN** the client closes the realtime stream connection
- **THEN** the API app SHALL remove the registered connection
- **AND** it SHALL remove any viewer association for that connection
- **AND** it SHALL clear that connection's heartbeat interval
- **AND** it SHALL log that the connection closed with the `clientId`

## ADDED Requirements

### Requirement: Live Notification Events

The API app SHALL publish newly-created notifications to active realtime connections for the notification recipient.

#### Scenario: Follow notification is created for connected recipient

- **WHEN** a follow notification is persisted for a recipient with an active realtime connection
- **THEN** the API app SHALL send an SSE event named `notification.created` to that recipient's active connections
- **AND** the event payload SHALL be a `NotificationItem`

#### Scenario: Like notification is created for connected recipient

- **WHEN** a like notification is persisted for a recipient with an active realtime connection
- **THEN** the API app SHALL send an SSE event named `notification.created` to that recipient's active connections
- **AND** the event payload SHALL be a `NotificationItem`

#### Scenario: Notification recipient is disconnected

- **WHEN** a notification is persisted for a recipient without active realtime connections
- **THEN** the API app SHALL keep the persisted notification
- **AND** it SHALL NOT treat missing live delivery as a notification creation failure

#### Scenario: Notification event payload is sent

- **WHEN** a live notification event is sent
- **THEN** the payload SHALL include `id`, `type`, `actor`, `createdAt`, and `post`
- **AND** the payload SHALL NOT include private fields such as email, sessions, accounts, or verification data

#### Scenario: Multiple connections exist for recipient

- **WHEN** a notification is created for a recipient with multiple active realtime connections
- **THEN** the API app SHALL send `notification.created` to each active connection for that recipient

#### Scenario: Other users are connected

- **WHEN** a notification is created for one recipient
- **THEN** the API app SHALL NOT send that notification event to connections associated with other viewer ids

#### Scenario: Live delivery fails for one connection

- **WHEN** writing a live notification event fails for a connection
- **THEN** the API app SHALL log the publish error
- **AND** it SHALL clean up the failed connection if it is no longer writable
- **AND** it SHALL continue preserving the persisted notification
