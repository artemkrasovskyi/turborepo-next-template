## MODIFIED Requirements

### Requirement: Notifications List

The system SHALL display a paginated, reverse-chronological list of the viewer's notifications.

#### Scenario: Viewer has notifications

- **WHEN** the viewer opens `/notifications` and has notification records
- **THEN** the system SHALL display them ordered by `createdAt` descending, each showing the actor and the type of event

#### Scenario: Viewer has no notifications

- **WHEN** the viewer opens `/notifications` and has no notification records
- **THEN** the system SHALL display an empty state indicating there are no notifications yet

#### Scenario: Loading more notifications

- **WHEN** more notifications exist beyond the initial page
- **THEN** the system SHALL let the viewer load additional notifications via a "load more" control, and SHALL indicate when no further notifications remain

#### Scenario: Live notification arrives while viewer is on notifications page

- **WHEN** the viewer has `/notifications` open and receives a live `notification.created` event
- **THEN** the system SHALL prepend the notification to the visible notification list
- **AND** it SHALL render the notification with the existing notification item UI

#### Scenario: Live notification arrives while empty state is visible

- **WHEN** the viewer has no displayed notifications and receives a live `notification.created` event
- **THEN** the system SHALL replace the empty state with the new notification

#### Scenario: Duplicate live notification arrives

- **WHEN** a live notification event has the same id as an already displayed notification
- **THEN** the system SHALL NOT render a duplicate notification

#### Scenario: Loading more after live notifications

- **WHEN** the viewer loads older notifications after receiving live notifications
- **THEN** the system SHALL preserve the live notifications already displayed
- **AND** it SHALL append older paginated notifications without duplicating ids
