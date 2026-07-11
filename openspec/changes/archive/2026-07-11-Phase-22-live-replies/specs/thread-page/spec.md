## MODIFIED Requirements

### Requirement: Thread View

The system SHALL render a page for a top-level post showing that post followed by all of its replies, ordered by `createdAt` ascending.

#### Scenario: Viewer opens a thread with replies

- **WHEN** a viewer navigates to a top-level post's thread page
- **THEN** the system SHALL display the root post followed by its replies, ordered from oldest to newest

#### Scenario: Viewer opens a thread with no replies

- **WHEN** a viewer navigates to a top-level post that has no replies
- **THEN** the system SHALL display the root post and indicate that there are no replies yet

#### Scenario: Live reply arrives while viewer is on thread page

- **WHEN** the viewer has a thread page open and receives a live `reply.created` event for that thread
- **THEN** the system SHALL append the reply to the visible replies list
- **AND** it SHALL render the reply with the existing post card UI

#### Scenario: Live reply arrives while no-replies state is visible

- **WHEN** the viewer sees the no-replies state and receives a live `reply.created` event for that thread
- **THEN** the system SHALL replace the no-replies state with the new reply

#### Scenario: Duplicate live reply arrives

- **WHEN** a live reply event has the same id as an already displayed reply
- **THEN** the system SHALL NOT render a duplicate reply

#### Scenario: Live reply for another thread arrives

- **WHEN** a live reply event references a different thread id
- **THEN** the current thread page SHALL NOT render that reply
