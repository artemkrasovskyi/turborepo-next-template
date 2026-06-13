# Profile Page

## Requirements

### Requirement: Profile Information Display

The system SHALL display a public profile page showing the user's avatar, display name, username, and bio.

#### Scenario: Viewing an existing user's profile

- **WHEN** a viewer navigates to `/profile/<username>` for a username that exists
- **THEN** the system SHALL display that user's avatar (initials), display name, `@username`, and bio

#### Scenario: Profile with no bio

- **WHEN** the profile owner has no `bio`
- **THEN** the system SHALL render the profile without a bio section, rather than showing an empty or placeholder line

### Requirement: Profile Social Counts

The system SHALL display the number of users the profile owner follows and the number of users following them.

#### Scenario: Profile with followers and follows

- **WHEN** a viewer opens a profile
- **THEN** the system SHALL display the follower count and following count

#### Scenario: Profile with zero followers or follows

- **WHEN** the profile owner has zero followers or follows zero users
- **THEN** the system SHALL display `0`, not hide the count

### Requirement: Profile Posts

The system SHALL display the profile owner's top-level posts in reverse-chronological order, paginated. Replies SHALL NOT appear on the profile, consistent with the home feed.

#### Scenario: Profile owner has posts

- **WHEN** a viewer opens a profile for a user with top-level posts
- **THEN** the system SHALL display those posts ordered by `createdAt` descending

#### Scenario: Profile owner has no posts

- **WHEN** a viewer opens a profile for a user with no top-level posts
- **THEN** the system SHALL display an empty state indicating the user hasn't posted yet

#### Scenario: Loading more posts

- **WHEN** more posts exist beyond the initial page
- **THEN** the system SHALL let the viewer load additional posts via a "load more" control, and SHALL indicate when no further posts remain

### Requirement: Profile Not Found

The system SHALL handle a profile request for a username that does not exist without erroring.

#### Scenario: Unknown username

- **WHEN** a viewer navigates to `/profile/<username>` for a username with no matching user
- **THEN** the system SHALL display a "profile not found" message instead of post content

### Requirement: Navigation to Profiles

The system SHALL let viewers navigate from a post's author in the home feed to that author's profile page.

#### Scenario: Viewer clicks a feed post's author

- **WHEN** a viewer clicks a post author's avatar or name in the home feed
- **THEN** the system SHALL navigate to `/profile/<author's username>`
