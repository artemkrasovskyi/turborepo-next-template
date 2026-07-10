## MODIFIED Requirements

### Requirement: Follow Notifications

The system SHALL create a notification for a user each time a new `Follow` relationship is created with them as the target, and SHALL NOT create duplicate notifications for repeated follow actions that do not create a new relationship.

#### Scenario: Viewer follows a user they don't currently follow

- **WHEN** the viewer follows a user they are not currently following, creating a new `Follow` record
- **THEN** the system SHALL create a notification for that user with type "follow" and the viewer as the actor
- **AND** the backend SHALL publish a live notification event to that user when they have an active realtime connection

#### Scenario: Viewer repeats a follow action that doesn't change the relationship

- **WHEN** the viewer "follows" a user they already follow, and no new `Follow` record is created
- **THEN** the system SHALL NOT create an additional notification
- **AND** the backend SHALL NOT publish a live notification event

### Requirement: Like Notifications

The system SHALL create a notification for a post's author each time their post receives a like from a different user for the first time, and SHALL NOT create notifications for self-likes or for repeated like actions that do not create a new like.

#### Scenario: Viewer likes another user's post for the first time

- **WHEN** the viewer likes a post authored by a different user, creating a new `Like` record
- **THEN** the system SHALL create a notification for the post's author with type "like", the viewer as the actor, and a reference to that post
- **AND** the backend SHALL publish a live notification event to the post author when they have an active realtime connection

#### Scenario: Viewer likes their own post

- **WHEN** the viewer likes a post they authored themselves
- **THEN** the system SHALL NOT create a notification
- **AND** the backend SHALL NOT publish a live notification event

#### Scenario: Viewer repeats a like action that doesn't change the relationship

- **WHEN** the viewer likes a post they already liked, and no new `Like` record is created
- **THEN** the system SHALL NOT create an additional notification
- **AND** the backend SHALL NOT publish a live notification event
