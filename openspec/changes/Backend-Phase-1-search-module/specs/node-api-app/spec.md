## ADDED Requirements

### Requirement: Search Module

The API app SHALL expose a NestJS search module for public user search.

#### Scenario: Client searches users

- **WHEN** a client sends `GET /search/users?query=<text>`
- **THEN** the API app SHALL search users by `username` and `displayName`
- **AND** matching SHALL be case-insensitive
- **AND** the response SHALL include a page of public user results

#### Scenario: Client sends an empty search query

- **WHEN** the `query` parameter is missing, empty, or whitespace-only
- **THEN** the API app SHALL return `{ items: [], nextCursor: null }`
- **AND** it SHALL NOT run a broad user listing query

#### Scenario: Client paginates user search

- **WHEN** a client supplies `cursor` and optional `limit`
- **THEN** the API app SHALL return the next page after the cursor
- **AND** the effective page size SHALL default to `20`
- **AND** the effective page size SHALL NOT exceed `20`
- **AND** `nextCursor` SHALL be the final returned user id when more results exist

#### Scenario: Client requests viewer-specific follow state

- **WHEN** a client supplies `viewerId`
- **THEN** the API app SHALL batch-load follow relationships for the returned users
- **AND** each result SHALL include whether that viewer follows the user

#### Scenario: Client searches without viewer state

- **WHEN** no `viewerId` is supplied
- **THEN** each returned user SHALL include `isFollowing: false`

#### Scenario: Search results are returned

- **WHEN** the API app returns user search results
- **THEN** each result SHALL include only `id`, `username`, `displayName`, `avatarUrl`, and `isFollowing`
- **AND** private fields such as email, sessions, accounts, and verification data SHALL NOT be exposed

#### Scenario: Existing frontend search remains

- **WHEN** the backend search module is added
- **THEN** existing `/explore` and `@repo/api-client/features/search` behavior SHALL remain unchanged
