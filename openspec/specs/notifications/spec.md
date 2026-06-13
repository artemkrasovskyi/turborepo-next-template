# Notifications

## Requirements

### Requirement: Follow Notifications

The system SHALL create a notification for a user each time a new `Follow` relationship is created with them as the target, and SHALL NOT create duplicate notifications for repeated follow actions that do not create a new relationship.

#### Scenario: Viewer follows a user they don't currently follow

- **WHEN** the viewer follows a user they are not currently following, creating a new `Follow` record
- **THEN** the system SHALL create a notification for that user with type "follow" and the viewer as the actor

#### Scenario: Viewer repeats a follow action that doesn't change the relationship

- **WHEN** the viewer "follows" a user they already follow, and no new `Follow` record is created
- **THEN** the system SHALL NOT create an additional notification

### Requirement: Like Notifications

The system SHALL create a notification for a post's author each time their post receives a like from a different user for the first time, and SHALL NOT create notifications for self-likes or for repeated like actions that do not create a new like.

#### Scenario: Viewer likes another user's post for the first time

- **WHEN** the viewer likes a post authored by a different user, creating a new `Like` record
- **THEN** the system SHALL create a notification for the post's author with type "like", the viewer as the actor, and a reference to that post

#### Scenario: Viewer likes their own post

- **WHEN** the viewer likes a post they authored themselves
- **THEN** the system SHALL NOT create a notification

#### Scenario: Viewer repeats a like action that doesn't change the relationship

- **WHEN** the viewer likes a post they already liked, and no new `Like` record is created
- **THEN** the system SHALL NOT create an additional notification

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

### Requirement: Notification Navigation

The system SHALL let the viewer navigate from a notification to the profile or post it relates to.

#### Scenario: Follow notification

- **WHEN** a "follow" notification is displayed
- **THEN** it SHALL show the follower's identity and link to that follower's profile page

#### Scenario: Like notification

- **WHEN** a "like" notification is displayed
- **THEN** it SHALL show the liker's identity and a reference to the liked post, and link to that post's thread page
