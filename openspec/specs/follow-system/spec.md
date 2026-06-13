# Follow System

## Requirements

### Requirement: Follow Relationship Management

The system SHALL let a viewer follow and unfollow another user, and SHALL prevent a user from following themselves.

#### Scenario: Viewer follows a user they don't already follow

- **WHEN** the viewer follows a user they do not currently follow
- **THEN** the system SHALL create a `Follow` record with `followerId` set to the viewer and `followingId` set to the target user

#### Scenario: Viewer unfollows a user they follow

- **WHEN** the viewer unfollows a user they currently follow
- **THEN** the system SHALL remove the corresponding `Follow` record

#### Scenario: Viewer attempts to follow themselves

- **WHEN** the viewer attempts to follow their own account
- **THEN** the system SHALL NOT create a `Follow` record and SHALL indicate that following yourself is not allowed

#### Scenario: Viewer follows a user they already follow

- **WHEN** the viewer follows a user they already follow
- **THEN** the system SHALL NOT create a duplicate `Follow` record and SHALL NOT return an error

### Requirement: Follow Button Reflects Relationship State

The system SHALL display a follow control on a user's profile reflecting the viewer's current relationship to that user, except on the viewer's own profile.

#### Scenario: Viewer does not follow the profile owner

- **WHEN** the viewer opens a profile for a user they do not follow
- **THEN** the system SHALL display a "Follow" control

#### Scenario: Viewer follows the profile owner

- **WHEN** the viewer opens a profile for a user they follow
- **THEN** the system SHALL display a "Following" control that allows unfollowing

#### Scenario: Viewer opens their own profile

- **WHEN** the viewer opens their own profile
- **THEN** the system SHALL NOT display a follow control

#### Scenario: Viewer toggles the follow control

- **WHEN** the viewer activates the follow control
- **THEN** the system SHALL update the control to reflect the new relationship state without a full page reload

#### Scenario: Toggling fails

- **WHEN** a follow or unfollow action fails
- **THEN** the system SHALL revert the control to its previous state and display an inline error message

### Requirement: Follower and Following Counts Stay Accurate

The system SHALL ensure a profile's follower and following counts reflect the current set of `Follow` relationships after a follow or unfollow action.

#### Scenario: Counts update after following

- **WHEN** the viewer follows a user
- **THEN** that user's follower count SHALL increase by one and the viewer's following count SHALL increase by one on next render

#### Scenario: Counts update after unfollowing

- **WHEN** the viewer unfollows a user
- **THEN** that user's follower count SHALL decrease by one and the viewer's following count SHALL decrease by one on next render
